from rest_framework import serializers
from .models import PriceAlert


class CropPredictionSerializer(serializers.Serializer):
    """
    Serializer for crop prediction input features.
    Validates that all 7 required soil and climate parameters are numeric and present.
    """
    N = serializers.FloatField(required=True, help_text="Nitrogen ratio in soil")
    P = serializers.FloatField(required=True, help_text="Phosphorus ratio in soil")
    K = serializers.FloatField(required=True, help_text="Potassium ratio in soil")
    temperature = serializers.FloatField(required=True, help_text="Temperature in Celsius")
    humidity = serializers.FloatField(required=True, help_text="Relative humidity percentage")
    ph = serializers.FloatField(required=True, help_text="Soil pH level (0-14)")
    rainfall = serializers.FloatField(required=True, help_text="Rainfall in mm")


class WeatherQuerySerializer(serializers.Serializer):
    """
    Serializer for weather query parameters.
    """
    location = serializers.CharField(required=False, allow_blank=True, default="Kothamangalam")
    latitude = serializers.FloatField(required=False, allow_null=True, default=None)
    longitude = serializers.FloatField(required=False, allow_null=True, default=None)


class MarketPriceQuerySerializer(serializers.Serializer):
    """
    Serializer for querying current mandi prices.
    """
    commodity = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)
    market = serializers.CharField(required=False, allow_blank=True)


class MarketTrendQuerySerializer(serializers.Serializer):
    """
    Serializer for querying mandi price trends (7 or 30 days).
    """
    commodity = serializers.CharField(required=False, default="Tomato")
    state = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)
    market = serializers.CharField(required=False, allow_blank=True)
    days = serializers.IntegerField(required=False, default=7, min_value=1, max_value=90)


class PriceAlertSerializer(serializers.ModelSerializer):
    """
    Serializer for reading and updating PriceAlert objects.
    """
    class Meta:
        model = PriceAlert
        fields = [
            'id',
            'user_identifier',
            'commodity',
            'state',
            'district',
            'market',
            'target_price',
            'condition',
            'is_active',
            'is_triggered',
            'triggered_at',
            'triggered_price',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_triggered', 'triggered_at', 'triggered_price', 'created_at', 'updated_at']


class PriceAlertCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new PriceAlert.
    """
    class Meta:
        model = PriceAlert
        fields = [
            'user_identifier',
            'commodity',
            'state',
            'district',
            'market',
            'target_price',
            'condition',
            'is_active',
        ]

class CropYieldPredictionSerializer(serializers.Serializer):
    """
    Serializer for crop yield prediction input features.
    """
    N = serializers.FloatField(required=True)
    P = serializers.FloatField(required=True)
    K = serializers.FloatField(required=True)
    Soil_pH = serializers.FloatField(required=True)
    Soil_Moisture = serializers.FloatField(required=True)
    Soil_Type = serializers.CharField(required=True)
    Organic_Carbon = serializers.FloatField(required=True)
    Temperature = serializers.FloatField(required=True)
    Humidity = serializers.FloatField(required=True)
    Rainfall = serializers.FloatField(required=True)
    Sunlight_Hours = serializers.FloatField(required=True)
    Wind_Speed = serializers.FloatField(required=True)
    Region = serializers.CharField(required=True)
    Altitude = serializers.FloatField(required=True)
    Season = serializers.CharField(required=True)
    Crop_Type = serializers.CharField(required=True)
    Irrigation_Type = serializers.CharField(required=True)
    Fertilizer_Used = serializers.CharField(required=True)
    Pesticide_Used = serializers.CharField(required=True)


class PredictionHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for saved crop prediction history records.
    """
    class Meta:
        from .models import PredictionHistory
        model = PredictionHistory
        fields = [
            'id',
            'user_identifier',
            'primary_crop',
            'confidence',
            'nitrogen',
            'phosphorus',
            'potassium',
            'ph',
            'temperature',
            'humidity',
            'rainfall',
            'top_recommendations',
            'location_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.Serializer):
    """
    Serializer for user registration.
    """
    name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=6, write_only=True, required=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
