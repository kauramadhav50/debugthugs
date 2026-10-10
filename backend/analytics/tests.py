from datetime import date
from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from students.models import (
	AcademicRecord,
	AttendanceRecord,
	SkillAssessment,
	Student,
)


class DashboardAPITests(TestCase):
	url = "/api/v1/analytics/dashboard/"

	def setUp(self):
		self.client = APIClient()

	def create_student(self, student_id="STU-001", department="Computing"):
		return Student.objects.create(
			student_id=student_id,
			name="Test Student",
			department=department,
			course="Computer Science",
			year_of_study=1,
			section="A",
		)

	def test_dashboard_returns_database_aggregates_and_heuristic_risks(self):
		student = self.create_student()
		AcademicRecord.objects.create(
			student=student,
			semester=1,
			marks_percentage=Decimal("80"),
			assessment_date=date(2026, 9, 1),
		)
		AttendanceRecord.objects.create(
			student=student, attendance_percentage=Decimal("70")
		)
		SkillAssessment.objects.create(
			student=student,
			skill_name="Python",
			score=Decimal("90"),
			assessment_date=date(2026, 9, 1),
		)

		response = self.client.get(self.url)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(
			response.data["summary"],
			{
				"totalStudents": 1,
				"averageSuccessScore": 80.0,
				"studentsAtAcademicRisk": 1,
				"studentsAtPlacementRisk": 0,
				"averageAttendance": 70.0,
			},
		)
		self.assertIn(
			{"range": "80-100", "count": 1},
			response.data["successScoreDistribution"],
		)
		self.assertEqual(
			response.data["departmentPerformance"],
			[{"department": "Computing", "averageScore": 80.0}],
		)
		self.assertEqual(
			response.data["recentStudentsNeedingAttention"][0]["academicRisk"],
			"Medium",
		)
		self.assertEqual(
			response.data["recentStudentsNeedingAttention"][0]["placementRisk"],
			"Unknown",
		)

	def test_dashboard_handles_empty_database(self):
		response = self.client.get(self.url)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["summary"]["totalStudents"], 0)
		self.assertIsNone(response.data["summary"]["averageSuccessScore"])
		self.assertIsNone(response.data["summary"]["averageAttendance"])
		self.assertEqual(response.data["departmentPerformance"], [])
		self.assertEqual(response.data["recentStudentsNeedingAttention"], [])
		self.assertTrue(
			all(item["count"] == 0 for item in response.data["successScoreDistribution"])
		)

	def test_dashboard_marks_missing_indicators_as_insufficient(self):
		self.create_student()

		response = self.client.get(self.url)

		self.assertEqual(response.status_code, 200)
		self.assertIsNone(response.data["summary"]["averageSuccessScore"])
		self.assertIsNone(response.data["summary"]["averageAttendance"])
		attention = response.data["recentStudentsNeedingAttention"][0]
		self.assertIsNone(attention["successScore"])
		self.assertIsNone(attention["attendance"])
		self.assertEqual(attention["academicRisk"], "Unknown")
		self.assertEqual(attention["placementRisk"], "Unknown")
		self.assertIn("No academic marks", attention["reason"])
		self.assertIn(
			{"range": "Insufficient data", "count": 1},
			response.data["successScoreDistribution"],
		)
