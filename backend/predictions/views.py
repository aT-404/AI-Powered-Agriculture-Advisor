from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied

from .models import Prediction
from .serializers import PredictionInputSerializer, PredictionSerializer
from services.prediction_service import PredictionService

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class PredictionListCreateView(generics.GenericAPIView):
    """
    POST /api/predictions/ - Run a new crop and yield prediction pipeline.
    GET /api/predictions/ - Retrieve authenticated user's prediction history (paginated).
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PredictionInputSerializer
        return PredictionSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Execute orchestration pipeline
        try:
            prediction = PredictionService.run_prediction_pipeline(
                user=request.user,
                validated_data=serializer.validated_data
            )
            response_serializer = PredictionSerializer(prediction)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response(
                {"error": f"Prediction model execution failed: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request, *args, **kwargs):
        # Fetch predictions belonging to the authenticated user
        queryset = Prediction.objects.filter(user=request.user).select_related('prediction_input')
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = PredictionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PredictionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PredictionDetailDeleteView(APIView):
    """
    GET /api/predictions/<id>/ - View a single prediction.
    DELETE /api/predictions/<id>/ - Delete a single prediction from history.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        prediction = get_object_or_404(Prediction, pk=pk)
        # Enforce user ownership boundaries
        if prediction.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this prediction.")
        return prediction

    def get(self, request, pk):
        prediction = self.get_object(pk)
        serializer = PredictionSerializer(prediction)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        prediction = self.get_object(pk)
        prediction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
