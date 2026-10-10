"""Read-only dashboard indicators; success scores are heuristics, not predictions."""

from collections import Counter, defaultdict
from math import ceil

from django.db.models import Avg, OuterRef, Subquery
from django.shortcuts import get_object_or_404
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


def _student_average(model, field_name, student):
	return _averages_by_student(
		model.objects.filter(student=student), field_name
	).get(student.pk)


def _student_insight_reasons(marks, attendance, skill_score, success_score, risk):
	reasons = []
	available_components = []
	for label, value in (
		("marks", marks),
		("attendance", attendance),
		("skills", skill_score),
	):
		if value is not None:
			available_components.append(f"{label} {value:.2f}%")

	if success_score is None:
		reasons.append(
			"Success score unavailable because no marks, attendance, or skill scores are available."
		)
	else:
		reasons.append(
			"Success score is the equally weighted average of available component averages: "
			+ ", ".join(available_components)
			+ "."
		)

	if risk == "Unknown":
		reasons.append(
			"Academic risk is Unknown because no marks or attendance data is available."
		)
	else:
		reasons.append(
			f"Academic risk is {risk}. Thresholds: High if marks are below "
			f"{HIGH_MARKS_THRESHOLD}% or attendance below {HIGH_ATTENDANCE_THRESHOLD}%; "
			f"Medium if marks are below {ACADEMIC_RISK_MARKS_THRESHOLD}% or "
			f"attendance below {ACADEMIC_RISK_ATTENDANCE_THRESHOLD}%; otherwise Low."
		)
		reasons.append(
			"Available academic indicators: "
			+ ", ".join(
				f"{label} {value:.2f}%"
				for label, value in (("marks", marks), ("attendance", attendance))
				if value is not None
			)
			+ "."
		)

	reasons.append(
			"Placement risk is Unknown because no placement assessment data is available."
	)
	return reasons


class StudentInsightsView(APIView):
	"""Return one student's available indicators and transparent heuristic."""

	def get(self, request, student_id):
		student = get_object_or_404(Student, student_id=student_id)
		marks = _student_average(AcademicRecord, "marks_percentage", student)
		attendance = _student_average(
			AttendanceRecord, "attendance_percentage", student
		)
		skill_score = _student_average(SkillAssessment, "score", student)
		components = [
			value
			for value in (marks, attendance, skill_score)
			if value is not None
		]
		success_score = (
			_as_number(sum(components) / len(components)) if components else None
		)
		risk = _academic_risk(marks, attendance)

		latest_academic = (
			AcademicRecord.objects.filter(student=student)
			.order_by("-assessment_date", "-pk")
			.first()
		)
		latest_attendance = (
			AttendanceRecord.objects.filter(student=student)
			.order_by("-recorded_at", "-pk")
			.first()
		)
		skill_assessments = SkillAssessment.objects.filter(student=student).order_by(
			"-assessment_date", "-pk"
		)

		payload = {
			"profile": {
				"id": student.pk,
				"studentId": student.student_id,
				"name": student.name,
				"department": student.department,
				"course": student.course,
				"yearOfStudy": student.year_of_study,
				"section": student.section,
				"createdAt": student.created_at.isoformat(),
				"updatedAt": student.updated_at.isoformat(),
			},
			"latestAcademicRecord": (
				{
					"semester": latest_academic.semester,
					"marksPercentage": _as_number(
						latest_academic.marks_percentage
					),
					"assessmentDate": latest_academic.assessment_date.isoformat(),
				}
				if latest_academic
				else None
			),
			"latestAttendanceRecord": (
				{
					"attendancePercentage": _as_number(
						latest_attendance.attendance_percentage
					),
					"recordedAt": latest_attendance.recorded_at.isoformat(),
				}
				if latest_attendance
				else None
			),
			"skillAssessments": [
				{
					"skillName": assessment.skill_name,
					"score": _as_number(assessment.score),
					"assessmentDate": assessment.assessment_date.isoformat(),
				}
				for assessment in skill_assessments
			],
			"successScore": success_score,
			"academicRisk": risk,
			"placementRisk": "Unknown",
			"reasons": _student_insight_reasons(
				marks, attendance, skill_score, success_score, risk
			),
		}
		return Response(payload)


class StudentListView(APIView):
	"""Return a stable, paginated student list with available indicators."""

	default_page_size = 10
	maximum_page_size = 20

	def get(self, request):
		try:
			page = int(request.query_params.get("page", 1))
		except (TypeError, ValueError):
			return Response(
				{"detail": "page must be a positive integer."}, status=400
			)
		if page < 1:
			return Response(
				{"detail": "page must be a positive integer."}, status=400
			)

		try:
			requested_page_size = int(
				request.query_params.get("page_size", self.default_page_size)
			)
		except (TypeError, ValueError):
			return Response(
				{"detail": "page_size must be a positive integer."}, status=400
			)
		if requested_page_size < 1:
			return Response(
				{"detail": "page_size must be a positive integer."}, status=400
			)
		page_size = min(requested_page_size, self.maximum_page_size)

		attendance_average = (
			AttendanceRecord.objects.filter(student_id=OuterRef("pk"))
			.order_by()
			.values("student_id")
			.annotate(value=Avg("attendance_percentage"))
			.values("value")[:1]
		)
		latest_marks = (
			AcademicRecord.objects.filter(student_id=OuterRef("pk"))
			.order_by("-assessment_date", "-pk")
			.values("marks_percentage")[:1]
		)
		skill_average = (
			SkillAssessment.objects.filter(student_id=OuterRef("pk"))
			.order_by()
			.values("student_id")
			.annotate(value=Avg("score"))
			.values("value")[:1]
		)
		students = Student.objects.order_by("student_id").annotate(
			attendance_average=Subquery(attendance_average),
			latest_academic_marks=Subquery(latest_marks),
			average_skill_score=Subquery(skill_average),
		)
		count = students.count()
		total_pages = ceil(count / page_size) if count else 0
		start = (page - 1) * page_size
		page_students = students[start : start + page_size]

		results = [
			{
				"studentId": student.student_id,
				"name": student.name,
				"department": student.department,
				"course": student.course,
				"yearOfStudy": student.year_of_study,
				"attendance": _as_number(student.attendance_average),
				"latestAcademicMarks": _as_number(student.latest_academic_marks),
				"averageSkillScore": _as_number(student.average_skill_score),
			}
			for student in page_students
		]
		return Response(
			{
				"count": count,
				"page": page,
				"pageSize": page_size,
				"totalPages": total_pages,
				"results": results,
			}
		)