"""CSV import parsing and persistence.

Imports are all-or-nothing: any invalid row prevents every row in the file
from being written.
"""

import csv
import io
from datetime import date
from decimal import Decimal, InvalidOperation

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from students.models import (
	AcademicRecord,
	AttendanceRecord,
	EngagementRecord,
	LMSActivity,
	PlacementReadiness,
	SkillAssessment,
	Student,
)


MAX_FILE_SIZE = 5 * 1024 * 1024

DATASET_CONFIGS = {
	"students": {
		"model": Student,
		"fields": {
			"student_id": "text",
			"name": "text",
			"department": "text",
			"course": "text",
			"year_of_study": "integer",
			"section": "text",
		},
		"identity_fields": ("student_id",),
		"update_fields": ("name", "department", "course", "year_of_study", "section"),
	},
	"academic": {
		"model": AcademicRecord,
		"fields": {
			"semester": "integer",
			"marks_percentage": "decimal_optional",
			"assessment_date": "date",
		},
		"identity_fields": ("student", "semester", "assessment_date"),
		"update_fields": ("marks_percentage",),
	},
	"attendance": {
		"model": AttendanceRecord,
		"fields": {"attendance_percentage": "decimal_optional"},
		"identity_fields": ("student", "attendance_percentage"),
		"update_fields": (),
	},
	"lms": {
		"model": LMSActivity,
		"fields": {
			"logins_count": "integer_optional",
			"resources_accessed": "integer_optional",
			"assignments_completed": "integer_optional",
		},
		"identity_fields": (
			"student",
			"logins_count",
			"resources_accessed",
			"assignments_completed",
		),
		"update_fields": (),
	},
	"engagement": {
		"model": EngagementRecord,
		"fields": {"participation_score": "decimal_optional"},
		"identity_fields": ("student", "participation_score"),
		"update_fields": (),
	},
	"skills": {
		"model": SkillAssessment,
		"fields": {
			"skill_name": "text",
			"score": "decimal_optional",
			"assessment_date": "date",
		},
		"identity_fields": ("student", "skill_name", "assessment_date"),
		"update_fields": ("score",),
	},
	"placement": {
		"model": PlacementReadiness,
		"fields": {
			"coding_score": "decimal_optional",
			"aptitude_score": "decimal_optional",
			"communication_score": "decimal_optional",
			"mock_interview_score": "decimal_optional",
		},
		"identity_fields": (
			"student",
			"coding_score",
			"aptitude_score",
			"communication_score",
			"mock_interview_score",
		),
		"update_fields": (),
	},
}


def _summary():
	return {
		"rows_received": 0,
		"rows_created": 0,
		"rows_updated": 0,
		"rows_skipped": 0,
		"errors": [],
	}


def _error(message, row=None):
	return {"row": row, "message": message}


def _parse_value(value, field_type):
	raw_value = "" if value is None else str(value).strip()
	if not raw_value:
		if field_type.endswith("_optional"):
			return None
		raise ValueError("This field is required.")

	if field_type == "text":
		return raw_value
	if field_type in ("integer", "integer_optional"):
		return int(raw_value)
	if field_type == "decimal_optional":
		value = Decimal(raw_value)
		if not value.is_finite():
			raise ValueError("Enter a finite number.")
		return value
	if field_type == "date":
		return date.fromisoformat(raw_value)
	raise ValueError("Unsupported field type.")


def _validation_message(validation_error):
	if hasattr(validation_error, "message_dict"):
		return "; ".join(
			f"{field}: {', '.join(messages)}"
			for field, messages in validation_error.message_dict.items()
		)
	return "; ".join(validation_error.messages)


def import_csv(uploaded_file, dataset_type):
	"""Validate and atomically import a CSV upload into the configured dataset."""
	result = _summary()
	dataset_type = str(dataset_type or "").strip().lower()
	config = DATASET_CONFIGS.get(dataset_type)
	if config is None:
		result["errors"].append(_error("dataset_type is not supported."))
		return result
	if uploaded_file is None:
		result["errors"].append(_error("A CSV file is required."))
		return result
	if not str(getattr(uploaded_file, "name", "")).lower().endswith(".csv"):
		result["errors"].append(_error("The uploaded file must have a .csv extension."))
		return result
	if getattr(uploaded_file, "size", 0) > MAX_FILE_SIZE:
		result["errors"].append(_error("The CSV file exceeds the 5 MiB size limit."))
		return result

	try:
		contents = uploaded_file.read(MAX_FILE_SIZE + 1)
		if len(contents) > MAX_FILE_SIZE:
			result["errors"].append(_error("The CSV file exceeds the 5 MiB size limit."))
			return result
		if isinstance(contents, bytes):
			contents = contents.decode("utf-8-sig")
	except (OSError, UnicodeDecodeError, ValueError):
		result["errors"].append(_error("The file could not be read as UTF-8 CSV."))
		return result

	try:
		reader = csv.DictReader(io.StringIO(contents, newline=""), strict=True)
		if reader.fieldnames is None:
			result["errors"].append(_error("The CSV file is empty or has no header row."))
			return result
		headers = [header.strip() if header else "" for header in reader.fieldnames]
		if len(headers) != len(set(headers)) or "" in headers:
			result["errors"].append(_error("CSV headers must be non-empty and unique."))
			return result
		reader.fieldnames = headers
		required_headers = set(config["fields"])
		if dataset_type != "students":
			required_headers.add("student_id")
		missing_headers = sorted(required_headers - set(headers))
		if missing_headers:
			result["errors"].append(
				_error("Missing required headers: " + ", ".join(missing_headers))
			)
			return result

		rows = []
		for row in reader:
			row_number = reader.line_num
			if row is None:
				continue
			if not any(value and str(value).strip() for value in row.values()):
				continue
			result["rows_received"] += 1
			if None in row:
				result["errors"].append(
					_error("This row has more values than the header row.", row_number)
				)
				continue
			rows.append((row_number, row))
	except (csv.Error, UnicodeError, TypeError):
		result["errors"].append(
			_error("The CSV file is malformed.", getattr(reader, "line_num", None))
		)
		return result

	if not rows and not result["errors"]:
		result["errors"].append(_error("The CSV file contains no data rows."))
		return result
	if result["errors"]:
		return result

	student_ids = set()
	if dataset_type != "students":
		student_ids = {
			str(row.get("student_id") or "").strip()
			for _, row in rows
			if str(row.get("student_id") or "").strip()
		}
	students_by_id = {
		student.student_id: student
		for student in Student.objects.filter(student_id__in=student_ids)
	}

	prepared_rows = []
	for row_number, row in rows:
		values = {}
		row_error = None
		field_specs = dict(config["fields"])
		if dataset_type != "students":
			field_specs = {"student_id": "text", **field_specs}
		for field_name, field_type in field_specs.items():
			try:
				values[field_name] = _parse_value(row.get(field_name), field_type)
			except (ValueError, InvalidOperation, TypeError):
				row_error = _error(
					f"{field_name}: value is invalid or missing.", row_number
				)
				break
		if row_error:
			result["errors"].append(row_error)
			continue

		if dataset_type != "students":
			student_id = values.pop("student_id")
			student = students_by_id.get(student_id)
			if student is None:
				result["errors"].append(
					_error(f"Unknown student_id: {student_id}.", row_number)
				)
				continue
			values["student"] = student

		instance = config["model"](**values)
		try:
			instance.full_clean(validate_unique=False)
		except ValidationError as exc:
			result["errors"].append(_error(_validation_message(exc), row_number))
			continue
		prepared_rows.append((config, values))

	if result["errors"]:
		return result

	created = updated = skipped = 0
	try:
		with transaction.atomic():
			for row_config, values in prepared_rows:
				model = row_config["model"]
				identity = {
					field: values[field]
					for field in row_config["identity_fields"]
				}
				instance = model.objects.filter(**identity).first()
				if instance is None:
					model.objects.create(**values)
					created += 1
					continue

				changed = False
				for field in row_config["update_fields"]:
					if getattr(instance, field) != values[field]:
						setattr(instance, field, values[field])
						changed = True
				if changed:
					instance.save()
					updated += 1
				else:
					skipped += 1
	except IntegrityError:
		result["errors"].append(
			_error("The import violated a database constraint; no rows were saved.")
		)
		return result

	result["rows_created"] = created
	result["rows_updated"] = updated
	result["rows_skipped"] = skipped
	return result


STUDENT_PROFILE_FIELDS = (
	"student_id",
	"name",
	"department",
	"course",
	"year_of_study",
	"section",
)


def import_student_profiles_csv(uploaded_file, mode):
	"""Validate and atomically import student profiles in create-only or upsert mode."""
	result = {"created": 0, "updated": 0, "skipped": 0, "errors": []}

	def add_error(message, row=None):
		result["errors"].append(_error(message, row))

	if mode not in ("create_only", "upsert"):
		add_error("mode must be either 'create_only' or 'upsert'.")
		return result
	if uploaded_file is None:
		add_error("A CSV file is required.")
		return result
	if not str(getattr(uploaded_file, "name", "")).lower().endswith(".csv"):
		add_error("The uploaded file must have a .csv extension.")
		return result
	if getattr(uploaded_file, "size", 0) > MAX_FILE_SIZE:
		add_error("The CSV file exceeds the 5 MiB size limit.")
		return result

	try:
		contents = uploaded_file.read(MAX_FILE_SIZE + 1)
		if len(contents) > MAX_FILE_SIZE:
			add_error("The CSV file exceeds the 5 MiB size limit.")
			return result
		if isinstance(contents, bytes):
			contents = contents.decode("utf-8-sig")
		elif not isinstance(contents, str):
			add_error("The file could not be read as UTF-8 CSV.")
			return result
	except (OSError, UnicodeDecodeError, ValueError):
		add_error("The file could not be read as UTF-8 CSV.")
		return result

	rows = []
	try:
		reader = csv.DictReader(io.StringIO(contents, newline=""), strict=True)
		if reader.fieldnames is None:
			add_error("The CSV file is empty or has no header row.")
			return result
		headers = [header.strip() if header else "" for header in reader.fieldnames]
		if len(headers) != len(set(headers)) or "" in headers:
			add_error("CSV headers must be non-empty and unique.")
			return result
		reader.fieldnames = headers
		missing_headers = sorted(set(STUDENT_PROFILE_FIELDS) - set(headers))
		if missing_headers:
			add_error("Missing required headers: " + ", ".join(missing_headers))
			return result

		seen_student_ids = {}
		for row in reader:
			row_number = reader.line_num
			if not any(
				value and value.strip()
				for value in row.values()
				if isinstance(value, str)
			):
				result["skipped"] += 1
				continue
			if None in row:
				result["skipped"] += 1
				add_error("This row has more values than the header row.", row_number)
				continue

			values = {
				field: (row.get(field) or "").strip()
				for field in STUDENT_PROFILE_FIELDS
			}
			student_id = values["student_id"]
			if student_id:
				if student_id in seen_student_ids:
					result["skipped"] += 1
					add_error(
						f"Duplicate student_id {student_id}; first seen on row "
						f"{seen_student_ids[student_id]}.",
						row_number,
					)
					continue
				seen_student_ids[student_id] = row_number

			missing_values = [field for field, value in values.items() if not value]
			if missing_values:
				result["skipped"] += 1
				add_error(
					"Required fields are blank: " + ", ".join(missing_values),
					row_number,
				)
				continue
			try:
				values["year_of_study"] = int(values["year_of_study"])
			except ValueError:
				result["skipped"] += 1
				add_error("year_of_study must be a whole number.", row_number)
				continue

			student = Student(**values)
			try:
				student.full_clean(validate_unique=False)
			except ValidationError as exc:
				result["skipped"] += 1
				add_error(_validation_message(exc), row_number)
				continue

			rows.append((row_number, values))
	except (csv.Error, UnicodeError, TypeError):
		add_error("The CSV file is malformed.", getattr(reader, "line_num", None))
		return result

	if not rows and not result["errors"]:
		add_error("The CSV file contains no data rows.")
		return result

	if mode == "create_only" and rows:
		existing_students = set(
			Student.objects.filter(
				student_id__in=[values["student_id"] for _, values in rows]
			).values_list("student_id", flat=True)
		)
		for row_number, values in rows:
			if values["student_id"] in existing_students:
				result["skipped"] += 1
				add_error(
					f"student_id {values['student_id']} already exists.",
					row_number,
				)

	if result["errors"]:
		return result

	try:
		with transaction.atomic():
			for _, values in rows:
				student = Student.objects.filter(
					student_id=values["student_id"]
				).first()
				if student is None:
					Student.objects.create(**values)
					result["created"] += 1
					continue

				if mode == "create_only":
					raise IntegrityError(
						f"student_id {values['student_id']} already exists."
					)

				changed = False
				for field in STUDENT_PROFILE_FIELDS:
					if getattr(student, field) != values[field]:
						setattr(student, field, values[field])
						changed = True
				if changed:
					student.save(
						update_fields=[*STUDENT_PROFILE_FIELDS[1:], "updated_at"]
					)
					result["updated"] += 1
				else:
					result["skipped"] += 1
	except IntegrityError:
		result["created"] = 0
		result["updated"] = 0
		result["skipped"] += len(rows)
		add_error(
			"The import violated a database constraint; no rows were saved."
		)

	return result
