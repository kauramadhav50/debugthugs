from django.db import transaction
from rest_framework import serializers

from .models import AttendanceRecord, RiskLevel, Student


DEPARTMENTS = (
	"Computer Science",
	"Information Technology",
	"Mechanical",
	"Civil",
	"Electronics",
)


class StudentRecordSerializer(serializers.ModelSerializer):
	studentId = serializers.CharField(source="student_id", max_length=50)
	fullName = serializers.CharField(source="name", max_length=150)
	department = serializers.ChoiceField(choices=DEPARTMENTS)
	successScore = serializers.DecimalField(
		source="success_score",
		max_digits=5,
		decimal_places=2,
		min_value=0,
		max_value=100,
	)
	attendance = serializers.DecimalField(
		write_only=True,
		max_digits=5,
		decimal_places=2,
		min_value=0,
		max_value=100,
	)
	academicRiskLevel = serializers.ChoiceField(
		source="academic_risk_level", choices=RiskLevel.choices
	)
	placementRiskLevel = serializers.ChoiceField(
		source="placement_risk_level", choices=RiskLevel.choices
	)
	interventionReason = serializers.CharField(
		source="intervention_reason",
	)

	class Meta:
		model = Student
		fields = (
			"studentId",
			"fullName",
			"department",
			"successScore",
			"attendance",
			"academicRiskLevel",
			"placementRiskLevel",
			"interventionReason",
		)

	def create(self, validated_data):
		attendance = validated_data.pop("attendance")
		with transaction.atomic():
			student = Student.objects.create(**validated_data)
			AttendanceRecord.objects.create(
				student=student,
				attendance_percentage=attendance,
			)
		return student