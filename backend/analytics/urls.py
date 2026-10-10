from django.urls import path

from .views import DashboardView, StudentInsightsView, StudentListView


urlpatterns = [
	path("dashboard/", DashboardView.as_view(), name="analytics-dashboard"),
	path(
		"students/<str:student_id>/",
		StudentInsightsView.as_view(),
		name="student-insights",
	),
	path("students/", StudentListView.as_view(), name="student-list"),
]