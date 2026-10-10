from datetime import date, datetime, timezone
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient

from .models import (
	AcademicRecord,
	AttendanceRecord,
	EngagementRecord,
	LMSActivity,
	PlacementReadiness,
	SkillAssessment,
	Student,
)


class StudentModelTests(TestCase):
	def setUp(self):
		self.student = Student.objects.create(
			student_id="STU-001",
			name="Avery Student",
			department="Computer Science",
			course="BSc Computer Science",
			year_of_study=2,
			section="A",
		)

	def test_indicator_records_use_student_relationships(self):
		records = [
			(
				"academic_records",
				AcademicRecord.objects.create(
					student=self.student,
					semester=1,
					marks_percentage=Decimal("89.50"),
					assessment_date=date(2026, 1, 15),
				),
			),
			(
				"attendance_records",
				AttendanceRecord.objects.create(
					student=self.student, attendance_percentage=None
				),
			),
			(
				"lms_activities",
				LMSActivity.objects.create(student=self.student),
			),
			(
				"engagement_records",
				EngagementRecord.objects.create(
					student=self.student, participation_score=None
				),
			),
			(
				"skill_assessments",
				SkillAssessment.objects.create(
					student=self.student,
					skill_name="Python",
					score=None,
					assessment_date=date(2026, 1, 15),
				),
			),
			(
				"placement_readiness_records",
				PlacementReadiness.objects.create(student=self.student),
			),
		]

		for related_name, record in records:
			self.assertEqual(record.student, self.student)
			self.assertIn(record, getattr(self.student, related_name).all())

	def test_attendance_record_preserves_supplied_recorded_at(self):
		recorded_at = datetime(2026, 1, 15, 12, 30, tzinfo=timezone.utc)
		record = AttendanceRecord.objects.create(
			student=self.student,
			attendance_percentage=Decimal("87.50"),
			recorded_at=recorded_at,
		)

		self.assertEqual(record.recorded_at, recorded_at)

	def test_attendance_record_defaults_recorded_at(self):
		record = AttendanceRecord.objects.create(student=self.student)

		self.assertIsNotNone(record.recorded_at)

	def test_academic_and_skill_records_allow_multiple_rows_per_student(self):
		for semester, assessment_date in ((1, date(2026, 1, 15)), (2, date(2026, 6, 15))):
			AcademicRecord.objects.create(
				student=self.student,
				semester=semester,
				assessment_date=assessment_date,
			)
			SkillAssessment.objects.create(
				student=self.student,
				skill_name=f"Skill {semester}",
				assessment_date=assessment_date,
			)

		self.assertEqual(self.student.academic_records.count(), 2)
		self.assertEqual(self.student.skill_assessments.count(), 2)

	def test_student_id_must_be_unique(self):
		duplicate = Student(
			student_id=self.student.student_id,
			name="Another Student",
			department="Mathematics",
			course="BSc Mathematics",
			year_of_study=1,
			section="B",
		)

		with self.assertRaises(ValidationError):
			duplicate.full_clean()

	def test_percentage_and_score_fields_reject_values_outside_zero_to_100(self):
		measured_fields = [
			(
				AcademicRecord,
				"marks_percentage",
				{"semester": 1, "assessment_date": date(2026, 1, 15)},
			),
			(AttendanceRecord, "attendance_percentage", {}),
			(EngagementRecord, "participation_score", {}),
			(
				SkillAssessment,
				"score",
				{
					"skill_name": "Python",
					"assessment_date": date(2026, 1, 15),
				},
			),
			(PlacementReadiness, "coding_score", {}),
			(PlacementReadiness, "aptitude_score", {}),
			(PlacementReadiness, "communication_score", {}),
			(PlacementReadiness, "mock_interview_score", {}),
		]

		for model, field_name, other_fields in measured_fields:
			for valid_value in (Decimal("0.00"), Decimal("100.00")):
				with self.subTest(
					model=model.__name__, field=field_name, value=valid_value
				):
					record = model(
						student=self.student,
						**other_fields,
						**{field_name: valid_value},
					)
					record.full_clean()

			for invalid_value in (Decimal("-0.01"), Decimal("100.01")):
				with self.subTest(
					model=model.__name__, field=field_name, value=invalid_value
				):
					record = model(
						student=self.student,
						**other_fields,
						**{field_name: invalid_value},
					)
					with self.assertRaises(ValidationError):
						record.full_clean()

	def test_activity_counts_reject_negative_values(self):
		for field_name in (
			"logins_count",
			"resources_accessed",
			"assignments_completed",
		):
			with self.subTest(field=field_name):
				activity = LMSActivity(student=self.student, **{field_name: -1})
				with self.assertRaises(ValidationError):
					activity.full_clean()

	def test_database_rejects_out_of_range_percentage(self):
		with self.assertRaises(IntegrityError):
			with transaction.atomic():
				AttendanceRecord.objects.create(
					student=self.student,
					attendance_percentage=Decimal("100.01"),
				)

	def test_year_of_study_must_be_positive(self):
		student = Student(
			student_id="STU-002",
			name="New Student",
			department="Computer Science",
			course="BSc Computer Science",
			year_of_study=0,
			section="A",
		)

		with self.assertRaises(ValidationError):
			student.full_clean()


class StudentCreateAPITests(TestCase):
	url = "/api/v1/students/"

	def setUp(self):
		self.client = APIClient()
		self.payload = {
			"studentId": "NEW-100",
			"fullName": "Jordan Student",
			"department": "Computer Science",
			"successScore": "82.5",
			"attendance": "91.25",
			"academicRiskLevel": "Low",
			"placementRiskLevel": "Unknown",
			"interventionReason": "Check progress next term",
		}

	def test_successful_creation_persists_student_and_attendance(self):
		response = self.client.post(self.url, self.payload, format="json")

		self.assertEqual(response.status_code, 201)
		student = Student.objects.get(student_id="NEW-100")
		self.assertEqual(student.name, "Jordan Student")
		self.assertEqual(student.success_score, Decimal("82.50"))
		self.assertEqual(student.academic_risk_level, "Low")
		self.assertEqual(student.placement_risk_level, "Unknown")
		self.assertEqual(student.intervention_reason, "Check progress next term")
		self.assertEqual(
			student.attendance_records.get().attendance_percentage,
			Decimal("91.25"),
		)
		self.assertEqual(response.data["studentId"], student.student_id)

	def test_invalid_scores_return_400_without_creating_records(self):
		for field, value in (("successScore", "100.01"), ("attendance", "-0.01")):
			with self.subTest(field=field):
				payload = {**self.payload, field: value}
				response = self.client.post(self.url, payload, format="json")

				self.assertEqual(response.status_code, 400)
				self.assertIn(field, response.data)
				self.assertEqual(Student.objects.count(), 0)
				self.assertEqual(AttendanceRecord.objects.count(), 0)

	def test_missing_required_field_returns_400(self):
		payload = {**self.payload}
		payload.pop("fullName")

		response = self.client.post(self.url, payload, format="json")

		self.assertEqual(response.status_code, 400)
		self.assertIn("fullName", response.data)
		self.assertEqual(Student.objects.count(), 0)

	def test_duplicate_student_id_returns_409(self):
		Student.objects.create(
			student_id="NEW-100",
			name="Existing Student",
			department="Computer Science",
		)

		response = self.client.post(self.url, self.payload, format="json")

		self.assertEqual(response.status_code, 409)
		self.assertIn("already exists", response.data["detail"])
		self.assertEqual(Student.objects.count(), 1)

	def test_invalid_department_returns_400(self):
		payload = {**self.payload, "department": "Arts"}

		response = self.client.post(self.url, payload, format="json")

		self.assertEqual(response.status_code, 400)
		self.assertIn("department", response.data)
		self.assertEqual(Student.objects.count(), 0)
