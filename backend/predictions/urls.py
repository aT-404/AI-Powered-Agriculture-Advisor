from django.urls import path
from .views import PredictionListCreateView, PredictionDetailDeleteView

app_name = 'predictions'

urlpatterns = [
    path('', PredictionListCreateView.as_view(), name='prediction-list-create'),
    path('<int:pk>/', PredictionDetailDeleteView.as_view(), name='prediction-detail-delete'),
]
