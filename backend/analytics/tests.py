from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
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


class StudentInsightsAPITests(TestCase):
	url = "/api/v1/analytics/students/{}/"

	def setUp(self):
		self.client = APIClient()
		self.student = Student.objects.create(
			student_id="STU-100",
			name="Insight Student",
			department="Computing",
			course="Computer Science",
			year_of_study=2,
			section="B",
		)

	def test_valid_student_includes_profile_latest_records_and_insights(self):
		AcademicRecord.objects.create(
			student=self.student,
			semester=1,
			marks_percentage=Decimal("70"),
			assessment_date=date(2026, 8, 1),
		)
		AcademicRecord.objects.create(
			student=self.student,
			semester=2,
			marks_percentage=Decimal("80"),
			assessment_date=date(2026, 9, 1),
		)
		AttendanceRecord.objects.create(
			student=self.student,
			attendance_percentage=Decimal("70"),
			recorded_at=timezone.now() - timedelta(days=1),
		)
		AttendanceRecord.objects.create(
			student=self.student,
			attendance_percentage=Decimal("80"),
			recorded_at=timezone.now(),
		)
		SkillAssessment.objects.create(
			student=self.student,
			skill_name="Python",
			score=Decimal("90"),
			assessment_date=date(2026, 9, 2),
		)

		response = self.client.get(self.url.format(self.student.student_id))

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["profile"]["studentId"], "STU-100")
		self.assertEqual(
			response.data["latestAcademicRecord"]["assessmentDate"], "2026-09-01"
		)
		self.assertEqual(
			response.data["latestAcademicRecord"]["marksPercentage"], 80.0
		)
		self.assertEqual(response.data["latestAttendanceRecord"]["attendancePercentage"], 80.0)
		self.assertEqual(len(response.data["skillAssessments"]), 1)
		self.assertEqual(response.data["successScore"], 80.0)
		self.assertEqual(response.data["academicRisk"], "Low")
		self.assertEqual(response.data["placementRisk"], "Unknown")
		self.assertTrue(response.data["reasons"])

	def test_unknown_student_id_returns_404(self):
		response = self.client.get(self.url.format("NO-SUCH-STUDENT"))

		self.assertEqual(response.status_code, 404)

	def test_missing_data_is_not_treated_as_zero(self):
		response = self.client.get(self.url.format(self.student.student_id))

		self.assertEqual(response.status_code, 200)
		self.assertIsNone(response.data["latestAcademicRecord"])
		self.assertIsNone(response.data["latestAttendanceRecord"])
		self.assertEqual(response.data["skillAssessments"], [])
		self.assertIsNone(response.data["successScore"])
		self.assertEqual(response.data["academicRisk"], "Unknown")
		self.assertEqual(response.data["placementRisk"], "Unknown")
		self.assertTrue(
			any("unavailable" in reason for reason in response.data["reasons"])
		)


class StudentListAPITests(TestCase):
	url = "/api/v1/analytics/students/"

	def setUp(self):
		self.client = APIClient()

	def create_students(self, count):
		return [
			Student.objects.create(
				student_id=f"PAGE-{index:03d}",
				name=f"Student {index}",
				department="Computing",
				course="Computer Science",
				year_of_study=1,
				section="A",
			)
			for index in range(count)
		]

	def test_default_page_size_is_ten(self):
		self.create_students(12)

		response = self.client.get(self.url)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 12)
		self.assertEqual(response.data["page"], 1)
		self.assertEqual(response.data["pageSize"], 10)
		self.assertEqual(response.data["totalPages"], 2)
		self.assertEqual(len(response.data["results"]), 10)
		self.assertEqual(response.data["results"][0]["studentId"], "PAGE-000")
		self.assertIsNone(response.data["results"][0]["attendance"])
		self.assertIsNone(response.data["results"][0]["latestAcademicMarks"])
		self.assertIsNone(response.data["results"][0]["averageSkillScore"])

	def test_page_size_twenty_returns_twenty_results(self):
		self.create_students(25)

		response = self.client.get(self.url, {"page_size": 20})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 25)
		self.assertEqual(response.data["pageSize"], 20)
		self.assertEqual(response.data["totalPages"], 2)
		self.assertEqual(len(response.data["results"]), 20)

		over_limit_response = self.client.get(self.url, {"page_size": 30})
		self.assertEqual(over_limit_response.data["pageSize"], 20)

	def test_list_includes_available_attendance_academics_and_skill_averages(self):
		student = self.create_students(1)[0]
		AcademicRecord.objects.create(
			student=student,
			semester=1,
			marks_percentage=Decimal("84.5"),
			assessment_date=date(2026, 9, 1),
		)
		AttendanceRecord.objects.create(
			student=student, attendance_percentage=Decimal("92")
		)
		SkillAssessment.objects.create(
			student=student,
			skill_name="Python",
			score=Decimal("88"),
			assessment_date=date(2026, 9, 1),
		)

		response = self.client.get(self.url)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(
			response.data["results"][0],
			{
				"studentId": "PAGE-000",
				"name": "Student 0",
				"department": "Computing",
				"course": "Computer Science",
				"yearOfStudy": 1,
				"attendance": 92.0,
				"latestAcademicMarks": 84.5,
				"averageSkillScore": 88.0,
			},
		)

	def test_pagination_metadata_and_stable_ordering(self):
		self.create_students(12)

		response = self.client.get(self.url, {"page": 2, "page_size": 10})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 12)
		self.assertEqual(response.data["page"], 2)
		self.assertEqual(response.data["pageSize"], 10)
		self.assertEqual(response.data["totalPages"], 2)
		self.assertEqual(
			[item["studentId"] for item in response.data["results"]],
			["PAGE-010", "PAGE-011"],
		)
