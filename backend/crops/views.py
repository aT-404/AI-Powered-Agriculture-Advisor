from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from .models import Crop
from .serializers import CropSerializer


class CropListView(generics.ListAPIView):
    """
    GET /api/crops/
    Returns all crops. Supports optional ?search=<name> query param.
    """
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'scientific_name']


class CropDetailView(generics.RetrieveAPIView):
    """
    GET /api/crops/<id>/
    Returns a single crop by primary key.
    """
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [AllowAny]
