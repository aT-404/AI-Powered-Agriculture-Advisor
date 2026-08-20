from django.db import models
from django.conf import settings

class PredictionInput(models.Model):
    """
    Model storing the soil and climate parameters supplied for crop recommendation.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='prediction_inputs',
        help_text="The farmer who submitted this input."
    )
    nitrogen = models.IntegerField(help_text="Nitrogen content in soil (N)")
    phosphorus = models.IntegerField(help_text="Phosphorus content in soil (P)")
    potassium = models.IntegerField(help_text="Potassium content in soil (K)")
    temperature = models.FloatField(help_text="Temperature in °C")
    humidity = models.FloatField(help_text="Relative humidity in %")
    ph = models.FloatField(help_text="Soil pH value")
    rainfall = models.FloatField(help_text="Rainfall in mm")
    
    # Optional location details
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Input by {self.user.email} at {self.created_at}"


class Prediction(models.Model):
    """
    Model storing the crop recommendation and expected yield outcome.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='predictions',
        help_text="The user/farmer associated with this prediction."
    )
    prediction_input = models.OneToOneField(
        PredictionInput,
        on_delete=models.CASCADE,
        related_name='prediction_result',
        help_text="Input variables used for this prediction run."
    )
    predicted_crop = models.CharField(max_length=100, help_text="Best recommended crop name")
    crop_confidence = models.FloatField(null=True, blank=True, help_text="Model confidence score")
    
    predicted_yield = models.FloatField(null=True, blank=True, help_text="Predicted crop yield")
    yield_unit = models.CharField(max_length=50, default='tons/hectare')
    
    # Market price details at the time of prediction
    market_name = models.CharField(max_length=100, null=True, blank=True, help_text="Mandi market name")
    market_district = models.CharField(max_length=100, null=True, blank=True, help_text="Mandi district")
    market_state = models.CharField(max_length=100, null=True, blank=True, help_text="Mandi state")
    market_price = models.FloatField(null=True, blank=True, help_text="Modal mandi price at prediction time")
    market_min_price = models.FloatField(null=True, blank=True, help_text="Minimum mandi price at prediction time")
    market_max_price = models.FloatField(null=True, blank=True, help_text="Maximum mandi price at prediction time")
    market_unit = models.CharField(max_length=50, default='quintal')
    
    # Financial estimates
    expected_revenue = models.FloatField(null=True, blank=True, help_text="Calculated expected farm revenue")
    revenue_unit = models.CharField(max_length=50, default='per hectare')
    
    price_date = models.DateField(null=True, blank=True, help_text="Reporting date of market price used")
    price_source = models.CharField(max_length=200, null=True, blank=True)
    is_cached_price = models.BooleanField(default=False)
    
    # JSON fields to store raw model outputs/diagnostics
    crop_model_output = models.JSONField(null=True, blank=True, help_text="Raw output payload from the crop model")
    yield_model_output = models.JSONField(null=True, blank=True, help_text="Raw output payload from the yield model")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Prediction: {self.predicted_crop} for {self.user.email} ({self.created_at})"
