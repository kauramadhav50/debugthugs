"""Read-only dashboard indicators; success scores are heuristics, not predictions."""

from collections import Counter, defaultdict

from django.db.models import Avg
from rest_framework.response import Response
from rest_framework.views import APIView

from students.models import AcademicRecord, AttendanceRecord, SkillAssessment, Student


HIGH_MARKS_THRESHOLD = 50
ACADEMIC_RISK_MARKS_THRESHOLD = 60
HIGH_ATTENDANCE_THRESHOLD = 60
ACADEMIC_RISK_ATTENDANCE_THRESHOLD = 75
ATTENTION_SUCCESS_SCORE_THRESHOLD = 60
RECENT_ATTENTION_LIMIT = 10
RISK_CATEGORIES = ("High", "Medium", "Low", "Unknown")


def _as_number(value):
	return round(float(value), 2) if value is not None else None


def _averages_by_student(queryset, field_name):
	return {
		row["student_id"]: _as_number(row["average"])
		for row in queryset.values("student_id").annotate(average=Avg(field_name))
	}


def _academic_risk(marks, attendance):
	if marks is None and attendance is None:
		return "Unknown"
	if (
		(marks is not None and marks < HIGH_MARKS_THRESHOLD)
		or (attendance is not None and attendance < HIGH_ATTENDANCE_THRESHOLD)
	):
		return "High"
	if (
		(marks is not None and marks < ACADEMIC_RISK_MARKS_THRESHOLD)
		or (
			attendance is not None
			and attendance < ACADEMIC_RISK_ATTENDANCE_THRESHOLD
		)
	):
		return "Medium"
	return "Low"


def _score_range(score):
	if score is None:
		return "Insufficient data"
	if score < 40:
		return "<40"
	if score < 60:
		return "40-<60"
	if score < 80:
		return "60-<80"
	return "80-100"


def _attention_reason(marks, attendance, success_score):
	reasons = []
	if marks is None:
		reasons.append("No academic marks recorded")
	elif marks < HIGH_MARKS_THRESHOLD:
		reasons.append("Average marks below 50%")
	elif marks < ACADEMIC_RISK_MARKS_THRESHOLD:
		reasons.append("Average marks below 60%")

	if attendance is None:
		reasons.append("No attendance records available")
	elif attendance < HIGH_ATTENDANCE_THRESHOLD:
		reasons.append("Average attendance below 60%")
	elif attendance < ACADEMIC_RISK_ATTENDANCE_THRESHOLD:
		reasons.append("Average attendance below 75%")

	if (
		success_score is not None
		and success_score < ATTENTION_SUCCESS_SCORE_THRESHOLD
	):
		reasons.append("Heuristic success score below 60%")
	return "; ".join(reasons)


class DashboardView(APIView):
	"""Aggregate available student indicators without inferring missing data."""

	def get(self, request):
		students = list(Student.objects.order_by("-created_at", "id"))
		marks_by_student = _averages_by_student(
			AcademicRecord.objects.all(), "marks_percentage"
		)
		attendance_by_student = _averages_by_student(
			AttendanceRecord.objects.all(), "attendance_percentage"
		)
		skills_by_student = _averages_by_student(
			SkillAssessment.objects.all(), "score"
		)
		average_attendance = AttendanceRecord.objects.aggregate(
			average=Avg("attendance_percentage")
		)["average"]

		success_scores = []
		department_scores = defaultdict(list)
		academic_risks = Counter()
		placement_risks = Counter({category: 0 for category in RISK_CATEGORIES})
		distribution = Counter()
		recent_attention = []

		for student in students:
			marks = marks_by_student.get(student.pk)
			attendance = attendance_by_student.get(student.pk)
			skill_score = skills_by_student.get(student.pk)
			components = [
				value
				for value in (marks, attendance, skill_score)
				if value is not None
			]
			success_score = (
				_as_number(sum(components) / len(components)) if components else None
			)
			academic_risk = _academic_risk(marks, attendance)
			placement_risk = "Unknown"
			academic_risks[academic_risk] += 1
			placement_risks[placement_risk] += 1
			distribution[_score_range(success_score)] += 1
			if success_score is not None:
				success_scores.append(success_score)
				department_scores[student.department].append(success_score)

			needs_attention = (
				academic_risk in ("High", "Medium", "Unknown")
				or (
					success_score is not None
					and success_score < ATTENTION_SUCCESS_SCORE_THRESHOLD
				)
			)
			if needs_attention and len(recent_attention) < RECENT_ATTENTION_LIMIT:
				recent_attention.append(
					{
						"id": student.pk,
						"name": student.name,
						"department": student.department,
						"attendance": attendance,
						"successScore": success_score,
						"academicRisk": academic_risk,
						"placementRisk": placement_risk,
						"reason": _attention_reason(
							marks, attendance, success_score
						),
					}
				)

		academic_risk_total = academic_risks["High"] + academic_risks["Medium"]
		placement_risk_total = placement_risks["High"] + placement_risks["Medium"]
		payload = {
			"summary": {
				"totalStudents": len(students),
				"averageSuccessScore": _as_number(
					sum(success_scores) / len(success_scores) if success_scores else None
				),
				"studentsAtAcademicRisk": academic_risk_total,
				"studentsAtPlacementRisk": placement_risk_total,
				"averageAttendance": _as_number(average_attendance),
			},
			"successScoreDistribution": [
				{"range": score_range, "count": distribution[score_range]}
				for score_range in ("<40", "40-<60", "60-<80", "80-100", "Insufficient data")
			],
			"departmentPerformance": [
				{
					"department": department,
					"averageScore": _as_number(
						sum(scores) / len(scores) if scores else None
					),
				}
				for department, scores in sorted(
					{
						student.department: department_scores.get(student.department, [])
						for student in students
					}.items()
				)
			],
			"riskComparison": [
				{
					"category": category,
					"academicRisk": academic_risks[category],
					"placementRisk": placement_risks[category],
				}
				for category in RISK_CATEGORIES
			],
			"recentStudentsNeedingAttention": recent_attention,
		}
		return Response(payload)