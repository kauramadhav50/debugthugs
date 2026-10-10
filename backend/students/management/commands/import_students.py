import csv
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction

from students.models import Student


REQUIRED_FIELDS = (
	"student_id",
	"name",
	"department",
	"course",
	"year_of_study",
	"section",
)


def _validation_messages(error):
	if hasattr(error, "message_dict"):
		return "; ".join(
			f"{field}: {', '.join(messages)}"
			for field, messages in error.message_dict.items()
		)
	return "; ".join(error.messages)


class Command(BaseCommand):
	help = "Import student profiles from a CSV file."

	def add_arguments(self, parser):
		parser.add_argument(
			"--file",
			type=Path,
			default=Path(settings.BASE_DIR) / "sample_data" / "students_profile.csv",
			help="CSV path (default: sample_data/students_profile.csv under BASE_DIR).",
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
				if len(headers) != len(set(headers)):
					raise CommandError("CSV headers must be unique.")
				if set(headers) != set(REQUIRED_FIELDS):
					missing = sorted(set(REQUIRED_FIELDS) - set(headers))
					unexpected = sorted(set(headers) - set(REQUIRED_FIELDS))
					problems = []
					if missing:
						problems.append("missing: " + ", ".join(missing))
					if unexpected:
						problems.append("unexpected: " + ", ".join(unexpected))
					raise CommandError("CSV headers do not match; " + "; ".join(problems))
				reader.fieldnames = headers

				for row in reader:
					row_number = reader.line_num
					if not row or not any( value and value.strip() for value in row.values() if isinstance(value, str)):
						continue

					row_error = None
					if None in row:
						row_error = "row contains more values than the header"
					else:
						values = {
							field: (row.get(field) or "").strip()
							for field in REQUIRED_FIELDS
						}
						missing_values = [
							field for field, value in values.items() if not value
						]
						if missing_values:
							row_error = "required fields are blank: " + ", ".join(missing_values)
						else:
							try:
								values["year_of_study"] = int(values["year_of_study"])
							except ValueError:
								row_error = "year_of_study must be a whole number"

					if not row_error:
						student = Student(**values)
						try:
							student.full_clean(validate_unique=False)
						except ValidationError as error:
							row_error = _validation_messages(error)

					if row_error:
						skipped += 1
						errors.append(f"Row {row_number}: {row_error}")
						continue

					defaults = {
						field: values[field]
						for field in REQUIRED_FIELDS
						if field != "student_id"
					}
					try:
						with transaction.atomic():
							_, was_created = Student.objects.update_or_create(
								student_id=values["student_id"],
								defaults=defaults,
							)
					except (IntegrityError, ValidationError) as error:
						skipped += 1
						errors.append(f"Row {row_number}: {_validation_messages(error) if isinstance(error, ValidationError) else str(error)}")
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