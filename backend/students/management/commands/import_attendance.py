import csv
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, OperationalError
from django.utils import timezone

from students.models import AttendanceRecord, Student


CSV_FIELDS = (
	"student_id",
	"attendance_percentage",
	"recorded_at",
)
REQUIRED_FIELDS = (
	"student_id",
	"recorded_at",
)


def _validation_messages(error):
	if hasattr(error, "message_dict"):
		return "; ".join(
			f"{field}: {', '.join(messages)}"
			for field, messages in error.message_dict.items()
		)
	return "; ".join(error.messages)


def _parse_recorded_at(value):
	value = value.strip()
	if value.endswith(("Z", "z")):
		value = value[:-1] + "+00:00"
	parsed = datetime.fromisoformat(value)
	if settings.USE_TZ:
		if timezone.is_naive(parsed):
			parsed = timezone.make_aware(parsed, timezone.get_default_timezone())
	else:
		if timezone.is_aware(parsed):
			parsed = timezone.make_naive(parsed, timezone.get_default_timezone())
	return parsed


class Command(BaseCommand):
	help = "Import attendance records from a CSV file."

	def add_arguments(self, parser):
		parser.add_argument(
			"--file",
			type=Path,
			default=Path(settings.BASE_DIR) / "sample_data" / "students_attendance.csv",
			help="CSV path (default: sample_data/students_attendance.csv under BASE_DIR).",
		)

	def handle(self, *args, **options):
		file_path = options["file"]
		created = 0
		updated = 0
		skipped = 0
		errors = []

		try:
			with file_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
				reader = csv.DictReader(csv_file, strict=True)
				if reader.fieldnames is None:
					raise CommandError("CSV file is empty or has no header row.")

				headers = [header.strip() if header else "" for header in reader.fieldnames]
				if len(headers) != len(set(headers)) or set(headers) != set(CSV_FIELDS):
					missing = sorted(set(CSV_FIELDS) - set(headers))
					unexpected = sorted(set(headers) - set(CSV_FIELDS))
					problems = []
					if missing:
						problems.append("missing: " + ", ".join(missing))
					if unexpected:
						problems.append("unexpected: " + ", ".join(unexpected))
					if len(headers) != len(set(headers)):
						problems.append("duplicate headers")
					raise CommandError("CSV headers do not match; " + "; ".join(problems))
				reader.fieldnames = headers

				rows = [(reader.line_num, row) for row in reader]
				student_ids = {
					(row.get("student_id") or "").strip()
					for _, row in rows
					if row and row.get("student_id") and row.get("student_id").strip()
				}
				students_by_id = {
					student.student_id: student
					for student in Student.objects.filter(student_id__in=student_ids)
				}

				for row_number, row in rows:
					if not row or not any(
						value and value.strip()
						for value in row.values()
						if isinstance(value, str)
					):
						continue

					row_error = None
					if None in row:
						row_error = "row contains more values than the header"
					else:
						values = {
							field: (row.get(field) or "").strip()
							for field in CSV_FIELDS
						}
						missing_values = [
							field
							for field in REQUIRED_FIELDS
							if not values[field]
						]
						if missing_values:
							row_error = "required fields are blank: " + ", ".join(
								missing_values
							)

					if not row_error:
						try:
							values["recorded_at"] = _parse_recorded_at(
								values["recorded_at"]
							)
						except ValueError:
							row_error = (
								"recorded_at must be an ISO date or datetime"
							)

					if not row_error:
						percentage = values["attendance_percentage"]
						if not percentage or percentage.lower() == "null":
							values["attendance_percentage"] = None
						else:
							try:
								values["attendance_percentage"] = Decimal(percentage)
								if not values["attendance_percentage"].is_finite():
									row_error = (
										"attendance_percentage must be a finite decimal"
									)
							except InvalidOperation:
								row_error = (
									"attendance_percentage must be a valid decimal"
								)

					student = None
					if not row_error:
						student = students_by_id.get(values["student_id"])
						if student is None:
							row_error = (
								f"student_id {values['student_id']} does not match an existing student"
							)

					if not row_error:
						record = AttendanceRecord(
							student=student,
							attendance_percentage=values["attendance_percentage"],
							recorded_at=values["recorded_at"],
						)
						try:
							record.full_clean(validate_unique=False)
						except ValidationError as error:
							row_error = _validation_messages(error)

					if row_error:
						skipped += 1
						errors.append(f"Row {row_number}: {row_error}")
						continue

					try:
						_, was_created = AttendanceRecord.objects.update_or_create(
							student=student,
							recorded_at=values["recorded_at"],
							defaults={
								"attendance_percentage": values[
									"attendance_percentage"
								],
							},
						)
					except OperationalError as error:
						self.stdout.write(f"Created: {created}")
						self.stdout.write(f"Updated: {updated}")
						self.stdout.write(f"Skipped: {skipped}")
						database_error = error.__cause__
						error_name = getattr(database_error, "sqlite_errorname", None)
						details = f"{error_name}: {error}" if error_name else str(error)
						raise CommandError(
							f"Database error at CSV row {row_number}; import stopped: {details}"
						) from error
					except (IntegrityError, ValidationError) as error:
						skipped += 1
						message = (
							_validation_messages(error)
							if isinstance(error, ValidationError)
							else str(error)
						)
						errors.append(f"Row {row_number}: {message}")
						continue

					if was_created:
						created += 1
					else:
						updated += 1
		except FileNotFoundError as error:
			raise CommandError(f"CSV file not found: {file_path}") from error
		except (OSError, UnicodeDecodeError, csv.Error) as error:
			raise CommandError(f"Could not read CSV file {file_path}: {error}") from error

		self.stdout.write(f"Created: {created}")
		self.stdout.write(f"Updated: {updated}")
		self.stdout.write(f"Skipped: {skipped}")
		for error in errors:
			self.stderr.write(error)