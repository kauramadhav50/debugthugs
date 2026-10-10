from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Student
from .serializers import StudentRecordSerializer


class StudentCreateView(APIView):
	def post(self, request):
		serializer = StudentRecordSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		student_id = serializer.validated_data["student_id"]
		if Student.objects.filter(student_id=student_id).exists():
			return Response(
				{"detail": "A student with this student ID already exists."},
				status=status.HTTP_409_CONFLICT,
			)

		try:
			student = serializer.save()
		except IntegrityError as error:
			if Student.objects.filter(student_id=student_id).exists():
				return Response(
					{"detail": "A student with this student ID already exists."},
					status=status.HTTP_409_CONFLICT,
				)
			raise error

		return Response(
			{
				"studentId": student.student_id,
				"fullName": student.name,
				"department": student.department,
				"successScore": student.success_score,
				"attendance": serializer.validated_data["attendance"],
				"academicRiskLevel": student.academic_risk_level,
				"placementRiskLevel": student.placement_risk_level,
				"interventionReason": student.intervention_reason,
			},
			status=status.HTTP_201_CREATED,
		)