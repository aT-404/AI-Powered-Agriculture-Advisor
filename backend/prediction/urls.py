from django.urls import path
from .views import HealthCheckView, CropPredictionView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('predict/crop/', CropPredictionView.as_view(), name='crop-predict'),
]
