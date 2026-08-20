from django.urls import path
from .views import MarketPriceListView

app_name = 'market'

urlpatterns = [
    path('prices/', MarketPriceListView.as_view(), name='market-prices-list'),
]
