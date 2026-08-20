import math
from rest_framework import serializers
from .models import PredictionInput, Prediction

def validate_finite_number(value):
    if value is None:
        raise serializers.ValidationError("Value cannot be null.")
    if math.isnan(value) or math.isinf(value):
        raise serializers.ValidationError("Value must be a valid finite number.")
    return value

class PredictionInputSerializer(serializers.Serializer):
    N = serializers.IntegerField(required=True)
    P = serializers.IntegerField(required=True)
    K = serializers.IntegerField(required=True)
    temperature = serializers.FloatField(required=True, validators=[validate_finite_number])
    humidity = serializers.FloatField(required=True, validators=[validate_finite_number])
    ph = serializers.FloatField(required=True, validators=[validate_finite_number])
    rainfall = serializers.FloatField(required=True, validators=[validate_finite_number])
    latitude = serializers.FloatField(required=False, allow_null=True, validators=[validate_finite_number])
    longitude = serializers.FloatField(required=False, allow_null=True, validators=[validate_finite_number])

    def validate_N(self, value):
        if value is None or value < 0:
            raise serializers.ValidationError("N cannot be negative.")
        return value

    def validate_P(self, value):
        if value is None or value < 0:
            raise serializers.ValidationError("P cannot be negative.")
        return value

    def validate_K(self, value):
        if value is None or value < 0:
            raise serializers.ValidationError("K cannot be negative.")
        return value

    def validate_ph(self, value):
        if value < 0 or value > 14:
            raise serializers.ValidationError("pH must be between 0 and 14.")
        return value


class PredictionSerializer(serializers.ModelSerializer):
    """
    Serializer mapping the Prediction database model to the requested frontend structure.
    """
    class Meta:
        model = Prediction
        fields = ('id', 'created_at')

    def to_representation(self, instance):
        pi = instance.prediction_input
        
        # Format crop prediction block
        crop_prediction = {
            "crop": instance.predicted_crop,
            "confidence": instance.crop_confidence
        }
        
        # Format yield prediction block if present
        yield_prediction = None
        if instance.predicted_yield is not None:
            yield_prediction = {
                "yield": instance.predicted_yield,
                "unit": instance.yield_unit
            }

        # Format market price block if present
        market = None
        if instance.market_price is not None:
            market = {
                "market": instance.market_name,
                "district": instance.market_district,
                "state": instance.market_state,
                "modal_price": instance.market_price,
                "min_price": instance.market_min_price,
                "max_price": instance.market_max_price,
                "currency": "INR",
                "unit": instance.market_unit,
                "price_date": instance.price_date.isoformat() if instance.price_date else None,
                "source": instance.price_source,
                "is_cached": instance.is_cached_price
            }

        # Format financial estimate block if present
        financial_estimate = None
        if instance.expected_revenue is not None:
            financial_estimate = {
                "expected_revenue": instance.expected_revenue,
                "currency": "INR",
                "unit": instance.revenue_unit
            }

        return {
            "id": instance.id,
            "input": {
                "N": pi.nitrogen,
                "P": pi.phosphorus,
                "K": pi.potassium,
                "temperature": pi.temperature,
                "humidity": pi.humidity,
                "ph": pi.ph,
                "rainfall": pi.rainfall,
                "latitude": pi.latitude,
                "longitude": pi.longitude
            },
            "crop_prediction": crop_prediction,
            "yield_prediction": yield_prediction,
            "market": market,
            "financial_estimate": financial_estimate,
            "created_at": instance.created_at.isoformat()
        }
