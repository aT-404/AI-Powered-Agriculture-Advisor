from django.contrib import admin
from .models import PredictionInput, Prediction

@admin.register(PredictionInput)
class PredictionInputAdmin(admin.ModelAdmin):
    list_display = ('user', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'ph', 'created_at')
    search_fields = ('user__email',)
    list_filter = ('created_at',)

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('user', 'predicted_crop', 'crop_confidence', 'predicted_yield', 'yield_unit', 'created_at')
    search_fields = ('user__email', 'predicted_crop')
    list_filter = ('predicted_crop', 'created_at')
