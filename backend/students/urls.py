from django.urls import path

from .api_views import StudentCreateView


urlpatterns = [
	path("", StudentCreateView.as_view(), name="student-create"),
]