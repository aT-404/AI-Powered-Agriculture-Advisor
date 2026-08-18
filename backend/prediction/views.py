import sys
import logging
import importlib.util
from pathlib import Path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CropPredictionSerializer

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
            "service": "AI Agriculture Advisor API"
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
