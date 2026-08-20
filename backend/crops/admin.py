from django.contrib import admin
from .models import Crop

@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ('name', 'scientific_name', 'ideal_temperature_min', 'ideal_temperature_max', 'ideal_ph_min', 'ideal_ph_max')
    search_fields = ('name', 'scientific_name')
    list_filter = ('created_at',)
