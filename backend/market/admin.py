from django.contrib import admin
from .models import MarketPrice

@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    list_display = ('crop', 'market', 'district', 'state', 'modal_price', 'unit', 'price_date', 'fetched_at')
    search_fields = ('crop', 'market', 'district', 'state')
    list_filter = ('state', 'price_date', 'fetched_at')
