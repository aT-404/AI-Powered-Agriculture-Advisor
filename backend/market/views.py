from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .serializers import MarketPriceQuerySerializer
from .services import get_market_price

class MarketPriceListView(APIView):
    """
    GET /api/market/prices/
    Query the latest mandi market rates for a specific crop and location.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter('crop', str, required=True, description="Commodity name (e.g. Rice)"),
            OpenApiParameter('state', str, required=False, description="State (e.g. Kerala)"),
            OpenApiParameter('district', str, required=False, description="District (e.g. Ernakulam)"),
            OpenApiParameter('market', str, required=False, description="Mandi Name (e.g. Muvattupuzha)"),
        ],
        responses={200: dict, 400: dict, 404: dict}
    )
    def get(self, request):
        serializer = MarketPriceQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        crop = serializer.validated_data['crop']
        state = serializer.validated_data.get('state')
        district = serializer.validated_data.get('district')
        market = serializer.validated_data.get('market')

        location_payload = {
            "state": state,
            "district": district,
            "market": market
        }

        try:
            resolved_price = get_market_price(crop, location_payload)
            return Response(resolved_price, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_404_NOT_FOUND
            )
