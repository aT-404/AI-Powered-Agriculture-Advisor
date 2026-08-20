from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from services.market_service import market_service
from .serializers import MarketPriceQuerySerializer

class MarketPriceListView(APIView):
    """
    GET /api/market/prices/
    Query mandi market rates for crops across states, districts, and markets.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter('commodity', str, required=False, description="Commodity name (e.g. Tomato, Rice)"),
            OpenApiParameter('crop', str, required=False, description="Alias for commodity"),
            OpenApiParameter('state', str, required=False, description="State (e.g. Kerala, Maharashtra)"),
            OpenApiParameter('district', str, required=False, description="District (e.g. Ernakulam, Nashik)"),
            OpenApiParameter('market', str, required=False, description="Mandi Name (e.g. Muvattupuzha, Lasalgaon)"),
        ],
        responses={200: dict, 400: dict}
    )
    def get(self, request):
        serializer = MarketPriceQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        commodity = data.get('commodity') or data.get('crop') or None
        state = data.get('state') or None
        district = data.get('district') or None
        market = data.get('market') or None

        try:
            prices = market_service.get_market_prices(
                commodity=commodity,
                state=state,
                district=district,
                market=market,
            )
            return Response({
                "count": len(prices),
                "results": prices
            }, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"error": f"Failed to fetch commodity market prices: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
