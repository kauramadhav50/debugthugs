from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone


class Student(models.Model):
	student_id = models.CharField(max_length=50, unique=True)
	name = models.CharField(max_length=150)
	department = models.CharField(max_length=100)
	course = models.CharField(max_length=150)
	year_of_study = models.PositiveSmallIntegerField(
		validators=[MinValueValidator(1)]
	)
	section = models.CharField(max_length=50)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.student_id} - {self.name}"


class AcademicRecord(models.Model):
	student = models.ForeignKey(
		Student, on_delete=models.CASCADE, related_name="academic_records"
	)
	semester = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
	marks_percentage = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(100)],
	)
	assessment_date = models.DateField()

	class Meta:
		constraints = [
			models.CheckConstraint(
				condition=Q(marks_percentage__isnull=True)
				| Q(marks_percentage__gte=0, marks_percentage__lte=100),
				name="academic_marks_percentage_0_100",
			)
		]


class AttendanceRecord(models.Model):
	student = models.ForeignKey(
		Student, on_delete=models.CASCADE, related_name="attendance_records"
	)
	attendance_percentage = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(100)],
	)
	recorded_at = models.DateTimeField(default=timezone.now)

	class Meta:
		constraints = [
			models.CheckConstraint(
				condition=Q(attendance_percentage__isnull=True)
				| Q(attendance_percentage__gte=0, attendance_percentage__lte=100),
				name="attendance_percentage_0_100",
			)
		]


class LMSActivity(models.Model):
	student = models.ForeignKey(
		Student, on_delete=models.CASCADE, related_name="lms_activities"
	)
	logins_count = models.PositiveIntegerField(null=True, blank=True)
	resources_accessed = models.PositiveIntegerField(null=True, blank=True)
	assignments_completed = models.PositiveIntegerField(null=True, blank=True)
	recorded_at = models.DateTimeField(auto_now_add=True)


class EngagementRecord(models.Model):
	student = models.ForeignKey(
		Student, on_delete=models.CASCADE, related_name="engagement_records"
	)
	participation_score = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(100)],
	)
	recorded_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.CheckConstraint(
				condition=Q(participation_score__isnull=True)
				| Q(participation_score__gte=0, participation_score__lte=100),
				name="engagement_score_0_100",
			)
		]


class SkillAssessment(models.Model):
	student = models.ForeignKey(
		Student, on_delete=models.CASCADE, related_name="skill_assessments"
	)
	skill_name = models.CharField(max_length=100)
	score = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(100)],
	)
	assessment_date = models.DateField()

	class Meta:
		constraints = [
			models.CheckConstraint(
				condition=Q(score__isnull=True) | Q(score__gte=0, score__lte=100),
				name="skill_score_0_100",
			)
		]


class PlacementReadiness(models.Model):
	student = models.ForeignKey(
		Student, on_delete=models.CASCADE, related_name="placement_readiness_records"
	)
	coding_score = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(100)],
	)
	aptitude_score = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(100)],
	)
	communication_score = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(100)],
	)
	mock_interview_score = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(100)],
	)
	assessed_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.CheckConstraint(
				condition=Q(coding_score__isnull=True)
				| Q(coding_score__gte=0, coding_score__lte=100),
				name="placement_coding_score_0_100",
			),
			models.CheckConstraint(
				condition=Q(aptitude_score__isnull=True)
				| Q(aptitude_score__gte=0, aptitude_score__lte=100),
				name="placement_aptitude_score_0_100",
			),
			models.CheckConstraint(
				condition=Q(communication_score__isnull=True)
				| Q(communication_score__gte=0, communication_score__lte=100),
				name="placement_communication_score_0_100",
			),
			models.CheckConstraint(
				condition=Q(mock_interview_score__isnull=True)
				| Q(mock_interview_score__gte=0, mock_interview_score__lte=100),
				name="placement_interview_score_0_100",
			),
		]
