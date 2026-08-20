"""
URL configuration for backend project.
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/crops/', include('crops.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/market/', include('market.urls')),
    path('api/', include('prediction.urls')),
    
    # Swagger API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
