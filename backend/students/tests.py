from datetime import date
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

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
