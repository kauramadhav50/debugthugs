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
