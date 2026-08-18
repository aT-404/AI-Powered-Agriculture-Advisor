from rest_framework import serializers


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
