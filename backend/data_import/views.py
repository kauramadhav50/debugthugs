from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import import_csv


class CSVImportView(APIView):
	parser_classes = [MultiPartParser, FormParser]

	def post(self, request):
		result = import_csv(
			request.FILES.get("file"), request.data.get("dataset_type")
		)
		response_status = (
			status.HTTP_400_BAD_REQUEST
			if result["errors"]
			else status.HTTP_200_OK
		)
		return Response(result, status=response_status)
