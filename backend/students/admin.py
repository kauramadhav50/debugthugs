from django.contrib import admin

from .models import (
	AcademicRecord,
	AttendanceRecord,
	EngagementRecord,
	LMSActivity,
	PlacementReadiness,
	SkillAssessment,
	Student,
)

admin.site.register(
	[
		Student,
		AcademicRecord,
		AttendanceRecord,
		LMSActivity,
		EngagementRecord,
		SkillAssessment,
		PlacementReadiness,
	]
)
