from django.urls import path

from .views import CSVImportView, StudentProfileCSVImportView


urlpatterns = [
	path("import/csv/", CSVImportView.as_view(), name="csv-import"),
	path(
		"import/students/",
		StudentProfileCSVImportView.as_view(),
		name="student-profile-csv-import",
	),
]
