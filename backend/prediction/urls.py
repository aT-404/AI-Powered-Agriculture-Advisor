from django.urls import path
from .views import (
    HealthCheckView,
    CropPredictionView,
    CropYieldPredictionView,
    WeatherView,
    MarketFiltersView,
    MarketPricesView,
    MarketTrendsView,
    PriceAlertListCreateView,
    PriceAlertDetailView,
    PriceAlertToggleView,
    PriceAlertCheckView,
    VisionDiagnosisView,
    AssistantChatView,
    PredictionHistoryListView,
    PredictionHistoryDetailView,
    UserRegistrationView,
    UserLoginView,
    UserProfileView,
    CropCatalogListView,
    CropCatalogDetailView,
)

urlpatterns = [
    # Health & Prediction
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('predict/crop/', CropPredictionView.as_view(), name='crop-predict'),
    path('predict/crop-yield/', CropYieldPredictionView.as_view(), name='crop-yield-predict'),
    path('predict/history/', PredictionHistoryListView.as_view(), name='prediction-history-list'),
    path('predict/history/<int:pk>/', PredictionHistoryDetailView.as_view(), name='prediction-history-detail'),
    path('vision/diagnose/', VisionDiagnosisView.as_view(), name='vision-diagnose'),
    path('assistant/chat/', AssistantChatView.as_view(), name='assistant-chat'),

    # Authentication
    path('auth/register/', UserRegistrationView.as_view(), name='auth-register'),
    path('auth/login/', UserLoginView.as_view(), name='auth-login'),
    path('auth/me/', UserProfileView.as_view(), name='auth-me'),

    # Crop Catalog
    path('crops/', CropCatalogListView.as_view(), name='crop-catalog-list'),
    path('crops/<str:crop_id>/', CropCatalogDetailView.as_view(), name='crop-catalog-detail'),

    # Weather (Open-Meteo)
    path('weather/', WeatherView.as_view(), name='weather'),

    # Market Intelligence (Agmarknet / Data.gov.in)
    path('market/filters/', MarketFiltersView.as_view(), name='market-filters'),
    path('market/prices/', MarketPricesView.as_view(), name='market-prices'),
    path('market/trends/', MarketTrendsView.as_view(), name='market-trends'),

    # Price Alerts
    path('alerts/', PriceAlertListCreateView.as_view(), name='alert-list-create'),
    path('alerts/<int:pk>/', PriceAlertDetailView.as_view(), name='alert-detail'),
    path('alerts/<int:pk>/toggle/', PriceAlertToggleView.as_view(), name='alert-toggle'),
    path('alerts/check/', PriceAlertCheckView.as_view(), name='alert-check'),
]

