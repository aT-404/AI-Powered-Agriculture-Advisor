from rest_framework import serializers
from .models import MarketPrice

class MarketPriceQuerySerializer(serializers.Serializer):
    """
    Serializer representing query parameters for standalone market price requests.
    """
    crop = serializers.CharField(required=False, allow_blank=True, default='')
    commodity = serializers.CharField(required=False, allow_blank=True, default='')
    state = serializers.CharField(required=False, allow_blank=True, default='')
    district = serializers.CharField(required=False, allow_blank=True, default='')
    market = serializers.CharField(required=False, allow_blank=True, default='')


class MarketPriceResponseSerializer(serializers.ModelSerializer):
    """
    Serializer representing a normalized price response.
    """
    is_cached = serializers.BooleanField(default=True)

    class Meta:
        model = MarketPrice
        fields = (
            'crop', 'market', 'district', 'state',
            'min_price', 'max_price', 'modal_price',
            'currency', 'unit', 'price_date', 'source',
            'is_cached'
        )
