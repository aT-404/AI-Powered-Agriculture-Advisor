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
)

urlpatterns = [
    # Health & Prediction
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('predict/crop/', CropPredictionView.as_view(), name='crop-predict'),
    path('predict/crop-yield/', CropYieldPredictionView.as_view(), name='crop-yield'),


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
