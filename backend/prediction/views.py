import sys
import logging
import importlib.util
from pathlib import Path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.shortcuts import get_object_or_404

from .models import PriceAlert
from .serializers import (
    CropPredictionSerializer,
    WeatherQuerySerializer,
    MarketPriceQuerySerializer,
    MarketTrendQuerySerializer,
    PriceAlertSerializer,
    PriceAlertCreateSerializer,
)
from services.weather_service import get_weather_for_location
from services.market_service import market_service
from services.alert_service import alert_service

logger = logging.getLogger(__name__)


from ml_models.crop_model import predict_best_crop
from ml_models.yield_model import predict_yield


class HealthCheckView(APIView):
    """
    Health check endpoint to verify backend API availability.
    """
    def get(self, request):
        return Response({
            "status": "ok",
            "service": "AI Agriculture Advisor API",
            "features": [
                "Crop Recommendation ML",
                "Open-Meteo Weather Forecast",
                "Agmarknet Mandi Prices",
                "Commodity Price Trends",
                "Price Alerts System",
            ]
        }, status=status.HTTP_200_OK)


class CropPredictionView(APIView):
    """
    Crop prediction endpoint.
    Accepts 7 soil & climate features (N, P, K, temperature, humidity, ph, rainfall)
    and passes them to the existing ML model for crop recommendation.
    """
    def post(self, request):
        serializer = CropPredictionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            result = predict_best_crop(data)
            
            # Format primaryRecommendation specifically to keep test_endpoints.py happy
            result['primaryRecommendation'] = {
                'cropName': result.get('recommended_crop'),
                'confidence': result.get('confidence')
            }
            
            return Response(result, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Error occurred during ML crop prediction: %s", exc)
            return Response(
                {"error": "An error occurred during crop prediction inference."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CropYieldPredictionView(APIView):
    """
    Crop yield prediction endpoint.
    Accepts 6 parameters: Crop, Crop_Year, Season, State, Area, Annual_Rainfall
    Passes them to the ML model for yield prediction.
    """
    def post(self, request):
        data = request.data
        
        # Validate required fields
        required_fields = ["Crop", "Crop_Year", "Season", "State", "Area", "Annual_Rainfall"]
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return Response(
                {"error": f"Missing required parameter(s): {', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            yield_result = predict_yield(data)
            if yield_result is None:
                return Response(
                    {"error": "Yield prediction failed or model is currently unavailable."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response({
                "success": True,
                "predicted_yield": yield_result["predicted_yield"],
                "unit": yield_result["unit"]
            }, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Error occurred during ML yield prediction: %s", exc)
            return Response(
                {"error": "An error occurred during yield prediction inference."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



# ─────────────────────────────────────────────────────────────────────────────
# Weather Views (Open-Meteo)
# ─────────────────────────────────────────────────────────────────────────────

class WeatherView(APIView):
    """
    Weather endpoint utilizing Open-Meteo APIs.
    Accepts `location` (city name) or `latitude` and `longitude`.
    Returns current weather conditions and 7-day agricultural forecast.
    """
    def get(self, request):
        serializer = WeatherQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        location = validated.get("location")
        lat = validated.get("latitude")
        lon = validated.get("longitude")

        try:
            weather_data = get_weather_for_location(
                location_name=location,
                latitude=lat,
                longitude=lon,
            )
            return Response(weather_data, status=status.HTTP_200_OK)
        except ValueError as val_err:
            return Response({"error": str(val_err)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            logger.exception("Weather service error: %s", exc)
            return Response(
                {"error": "Failed to fetch real-time weather information."},
                status=status.HTTP_502_BAD_GATEWAY
            )


# ─────────────────────────────────────────────────────────────────────────────
# Market Intelligence Views (Agmarknet / Data.gov.in)
# ─────────────────────────────────────────────────────────────────────────────

class MarketFiltersView(APIView):
    """
    Returns available States, Districts, Markets, and Commodities for selector dropdowns.
    """
    def get(self, request):
        try:
            filters = market_service.get_filter_hierarchy()
            return Response(filters, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Market filters error: %s", exc)
            return Response({"error": "Failed to load market filter hierarchy."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarketPricesView(APIView):
    """
    Returns current agricultural commodity prices at Indian mandis.
    Supports filtering by commodity, state, district, and market.
    """
    def get(self, request):
        serializer = MarketPriceQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            prices = market_service.get_market_prices(
                commodity=data.get("commodity"),
                state=data.get("state"),
                district=data.get("district"),
                market=data.get("market"),
            )
            return Response({
                "count": len(prices),
                "results": prices
            }, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Market prices error: %s", exc)
            return Response({"error": "Failed to fetch commodity market prices."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarketTrendsView(APIView):
    """
    Returns historical price trend points (7-day or 30-day) with trend direction and percentage change.
    """
    def get(self, request):
        serializer = MarketTrendQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            trends = market_service.get_price_trends(
                commodity=data.get("commodity", "Tomato"),
                state=data.get("state"),
                district=data.get("district"),
                market=data.get("market"),
                days=data.get("days", 7),
            )
            return Response(trends, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Market trends error: %s", exc)
            return Response({"error": "Failed to calculate market price trends."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────────────────────────────────────
# Price Alerts Views
# ─────────────────────────────────────────────────────────────────────────────

class PriceAlertListCreateView(APIView):
    """
    List user's price alerts or create a new commodity price alert.
    """
    def get(self, request):
        user_id = request.query_params.get("user_identifier", "default_farmer")
        alerts = PriceAlert.objects.filter(user_identifier=user_id)
        serializer = PriceAlertSerializer(alerts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PriceAlertCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        alert = serializer.save()

        # Check immediately against current market price
        is_triggered, message = alert_service.evaluate_alert(alert)

        resp_serializer = PriceAlertSerializer(alert)
        resp_data = resp_serializer.data
        resp_data["notification_message"] = message

        return Response(resp_data, status=status.HTTP_201_CREATED)


class PriceAlertDetailView(APIView):
    """
    Delete or update an existing price alert.
    """
    def delete(self, request, pk):
        alert = get_object_or_404(PriceAlert, pk=pk)
        alert.delete()
        return Response({"message": "Price alert deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        alert = get_object_or_404(PriceAlert, pk=pk)
        serializer = PriceAlertSerializer(alert, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        updated_alert = serializer.save()
        if updated_alert.is_active and not updated_alert.is_triggered:
            alert_service.evaluate_alert(updated_alert)

        return Response(PriceAlertSerializer(updated_alert).data, status=status.HTTP_200_OK)


class PriceAlertToggleView(APIView):
    """
    Toggle active state of a price alert.
    """
    def post(self, request, pk):
        alert = get_object_or_404(PriceAlert, pk=pk)
        alert.is_active = not alert.is_active
        alert.save(update_fields=["is_active", "updated_at"])

        if alert.is_active and not alert.is_triggered:
            alert_service.evaluate_alert(alert)

        return Response(PriceAlertSerializer(alert).data, status=status.HTTP_200_OK)


class PriceAlertCheckView(APIView):
    """
    Evaluate all active alerts against the latest market prices.
    """
    def post(self, request):
        results = alert_service.evaluate_all_active_alerts()
        return Response({
            "evaluated_count": len(results),
            "results": results
        }, status=status.HTTP_200_OK)
