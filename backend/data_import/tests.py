from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from students.models import (
	AcademicRecord,
	AttendanceRecord,
	EngagementRecord,
	LMSActivity,
	PlacementReadiness,
	SkillAssessment,
	Student,
)


class CSVImportAPITests(TestCase):
	url = "/api/v1/import/csv/"

	def setUp(self):
		self.client = APIClient()
		self.student = Student.objects.create(
			student_id="STU-001",
			name="Avery Student",
			department="Computer Science",
			course="BSc Computer Science",
			year_of_study=2,
			section="A",
		)

	def upload(self, content, dataset_type="students", filename="records.csv"):
		return self.client.post(
			self.url,
			{
				"file": SimpleUploadedFile(
					filename, content.encode("utf-8"), content_type="text/csv"
				),
				"dataset_type": dataset_type,
			},
			format="multipart",
		)

	def test_valid_student_file_creates_student(self):
		response = self.upload(
			"student_id,name,department,course,year_of_study,section\n"
			"STU-002,Jordan Student,Engineering,BEng,1,B"
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["rows_created"], 1)
		self.assertTrue(Student.objects.filter(student_id="STU-002").exists())

	def test_valid_related_file_associates_existing_student(self):
		response = self.upload(
			"student_id,attendance_percentage\nSTU-001,87.5\n",
			dataset_type="attendance",
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["rows_created"], 1)
		record = AttendanceRecord.objects.get()
		self.assertEqual(record.student, self.student)
		self.assertEqual(record.attendance_percentage, Decimal("87.5"))

	def test_all_related_dataset_types_accept_their_model_fields(self):
		datasets = [
			(
				"academic",
				"student_id,semester,marks_percentage,assessment_date\n"
				"STU-001,2,88.5,2026-01-15\n",
				AcademicRecord,
			),
			(
				"lms",
				"student_id,logins_count,resources_accessed,assignments_completed\n"
				"STU-001,10,5,2\n",
				LMSActivity,
			),
			(
				"engagement",
				"student_id,participation_score\nSTU-001,90\n",
				EngagementRecord,
			),
			(
				"skills",
				"student_id,skill_name,score,assessment_date\n"
				"STU-001,Python,95,2026-01-15\n",
				SkillAssessment,
			),
			(
				"placement",
				"student_id,coding_score,aptitude_score,communication_score,"
				"mock_interview_score\nSTU-001,80,85,90,75\n",
				PlacementReadiness,
			),
		]

		for dataset_type, content, model in datasets:
			with self.subTest(dataset_type=dataset_type):
				response = self.upload(content, dataset_type=dataset_type)

				self.assertEqual(response.status_code, 200, response.data)
				self.assertEqual(response.data["rows_created"], 1)
				self.assertTrue(model.objects.filter(student=self.student).exists())

	def test_missing_headers_rejects_file(self):
		response = self.upload("student_id,name\nSTU-002,Jordan\n")

		self.assertEqual(response.status_code, 400)
		self.assertIn("department", response.data["errors"][0]["message"])
		self.assertEqual(response.data["rows_created"], 0)

	def test_invalid_percentage_rejects_entire_file(self):
		response = self.upload(
			"student_id,attendance_percentage\nSTU-001,75\nSTU-001,101\n",
			dataset_type="attendance",
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data["errors"][0]["row"], 3)
		self.assertEqual(response.data["rows_created"], 0)
		self.assertEqual(AttendanceRecord.objects.count(), 0)

	def test_invalid_date_rejects_file(self):
		response = self.upload(
			"student_id,semester,marks_percentage,assessment_date\n"
			"STU-001,2,80,not-a-date\n",
			dataset_type="academic",
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data["errors"][0]["row"], 2)

	def test_negative_activity_count_rejects_file(self):
		response = self.upload(
			"student_id,logins_count,resources_accessed,assignments_completed\n"
			"STU-001,-1,3,2\n",
			dataset_type="lms",
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data["errors"][0]["row"], 2)
		self.assertEqual(LMSActivity.objects.count(), 0)

	def test_exact_duplicate_records_are_skipped_on_repeat_import(self):
		content = "student_id,attendance_percentage\nSTU-001,75\nSTU-001,75\n"
		first_response = self.upload(content, dataset_type="attendance")
		second_response = self.upload(content, dataset_type="attendance")

		self.assertEqual(first_response.data["rows_created"], 1)
		self.assertEqual(first_response.data["rows_skipped"], 1)
		self.assertEqual(second_response.data["rows_created"], 0)
		self.assertEqual(second_response.data["rows_skipped"], 2)
		self.assertEqual(AttendanceRecord.objects.count(), 1)

	def test_unknown_student_id_reports_row_number(self):
		response = self.upload(
			"student_id,attendance_percentage\nSTU-999,75\n",
			dataset_type="attendance",
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data["errors"][0]["row"], 2)
		self.assertIn("STU-999", response.data["errors"][0]["message"])

	def test_empty_file_is_rejected(self):
		response = self.upload("")

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data["rows_received"], 0)
		self.assertTrue(response.data["errors"])

	def test_reimport_updates_student_without_creating_duplicate(self):
		content = (
			"student_id,name,department,course,year_of_study,section\n"
			"STU-001,Avery Updated,Computer Science,BSc Computer Science,2,A\n"
		)
		response = self.upload(content)

		self.assertEqual(response.data["rows_updated"], 1)
		self.assertEqual(Student.objects.filter(student_id="STU-001").count(), 1)
		self.student.refresh_from_db()
		self.assertEqual(self.student.name, "Avery Updated")
