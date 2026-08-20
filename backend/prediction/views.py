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
    CropYieldPredictionSerializer,
)
from services.weather_service import get_weather_for_location
from services.market_service import market_service
from services.alert_service import alert_service
from services.crop_yield_service import crop_yield_service
from services.explainability_service import explainability_service
from services.vision_diagnosis_service import vision_diagnosis_service
from services.assistant_service import assistant_service
import json
import tempfile
import os

logger = logging.getLogger(__name__)


def _load_predict_crop():
    """
    Safely load predict_crop from ai_model/predict.py without modifying ML files
    and resolving module collisions with Django's 'config' package.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    ai_model_dir = base_dir / "ai_model"
    
    if not (ai_model_dir / "predict.py").exists():
        logger.error("ai_model/predict.py not found at %s", ai_model_dir)
        return None

    try:
        # Load ai_model/config.py
        config_path = ai_model_dir / "config.py"
        config_spec = importlib.util.spec_from_file_location("ai_model_config", config_path)
        if config_spec is None or config_spec.loader is None:
            return None
        ai_config_module = importlib.util.module_from_spec(config_spec)
        config_spec.loader.exec_module(ai_config_module)

        # Save Django config module if present and set ai_model's config module
        saved_config = sys.modules.get('config')
        sys.modules['config'] = ai_config_module

        if str(ai_model_dir) not in sys.path:
            sys.path.insert(0, str(ai_model_dir))

        # Import predict.py module
        predict_spec = importlib.util.spec_from_file_location("predict", ai_model_dir / "predict.py")
        if predict_spec is None or predict_spec.loader is None:
            return None
        predict_module = importlib.util.module_from_spec(predict_spec)
        predict_spec.loader.exec_module(predict_module)

        predict_func = getattr(predict_module, 'predict_crop', None)

        # Restore original sys.modules['config']
        if saved_config is not None:
            sys.modules['config'] = saved_config
        else:
            sys.modules.pop('config', None)

        return predict_func
    except Exception as exc:
        logger.exception("Failed to import predict_crop from ai_model: %s", exc)
        return None


# Import predict_crop engine
predict_crop = _load_predict_crop()


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

        if predict_crop is None:
            logger.error("ML predict_crop function could not be imported.")
            return Response(
                {"error": "ML model inference engine is currently unavailable."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        data = serializer.validated_data

        try:
            result = predict_crop(
                N=data['N'],
                P=data['P'],
                K=data['K'],
                temperature=data['temperature'],
                humidity=data['humidity'],
                ph=data['ph'],
                rainfall=data['rainfall']
            )
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
    Accepts 19 soil, climate, and farm management features and passes them 
    to the yield prediction ML model.
    """
    def post(self, request):
        serializer = CropYieldPredictionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            yield_result = crop_yield_service.predict(serializer.validated_data)
            explanation = explainability_service.explain_yield_prediction(serializer.validated_data)
            
            return Response({
                "success": True,
                "predicted_yield": round(yield_result, 2),
                "unit": "tons/hectare",
                "explanation": explanation
            }, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Error occurred during crop yield prediction inference: %s", exc)
            return Response(
                {"error": "An error occurred during crop yield prediction inference."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VisionDiagnosisView(APIView):
    """
    Accepts an uploaded image of a crop and uses Gemini Vision to diagnose diseases.
    """
    def post(self, request):
        if 'image' not in request.FILES:
            return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)
            
        image_file = request.FILES['image']
        
        # Save temporarily
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, image_file.name)
        
        try:
            with open(temp_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)
                    
            # Call vision service
            diagnosis_json = vision_diagnosis_service.diagnose_image(temp_path)
            # Parse the returned JSON string back into a dict for DRF Response
            return Response(json.loads(diagnosis_json), status=status.HTTP_200_OK)
            
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            logger.exception("Error during vision diagnosis: %s", exc)
            return Response({"error": "Failed to diagnose image."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # Clean up local temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)


class AssistantChatView(APIView):
    """
    Handles conversational interactions with the Gemini AI agricultural assistant.
    """
    def post(self, request):
        message = request.data.get('message')
        history = request.data.get('history', [])
        
        if not message:
            return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            reply = assistant_service.get_response(message, history)
            return Response({"reply": reply}, status=status.HTTP_200_OK)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            logger.exception("Error during assistant chat: %s", exc)
            return Response({"error": "Failed to get response from assistant."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
