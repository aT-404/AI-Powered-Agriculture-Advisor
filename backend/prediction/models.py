from django.db import models


class PriceAlert(models.Model):
    """
    Model representing a commodity price alert configured by a farmer.
    """
    CONDITION_CHOICES = [
        ('GTE', 'Greater than or equal (>=)'),
        ('LTE', 'Less than or equal (<=)'),
    ]

    user_identifier = models.CharField(
        max_length=120,
        default='default_farmer',
        help_text="User ID or device token for scoped alert delivery."
    )
    commodity = models.CharField(max_length=100, help_text="Crop or commodity name (e.g. Tomato, Rice)")
    state = models.CharField(max_length=100, blank=True, default='', help_text="State name")
    district = models.CharField(max_length=100, blank=True, default='', help_text="District name")
    market = models.CharField(max_length=100, help_text="Mandi / Market name (e.g. Muvattupuzha)")
    target_price = models.FloatField(help_text="Target price in ₹/Quintal")
    condition = models.CharField(
        max_length=10,
        choices=CONDITION_CHOICES,
        default='GTE',
        help_text="Trigger when price reaches/exceeds (GTE) or falls below (LTE)"
    )
    is_active = models.BooleanField(default=True, help_text="Whether this alert is actively monitored")
    is_triggered = models.BooleanField(default=False, help_text="Whether the target price has been reached")
    triggered_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when alert was triggered")
    triggered_price = models.FloatField(null=True, blank=True, help_text="Market price at the time of trigger")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Price Alert"
        verbose_name_plural = "Price Alerts"

    def __str__(self):
        cond_sym = ">=" if self.condition == 'GTE' else "<="
        return f"{self.commodity} ({self.market}) {cond_sym} ₹{self.target_price}"


class PredictionHistory(models.Model):
    """
    Model representing a saved crop prediction recommendation for a farmer.
    """
    user_identifier = models.CharField(
        max_length=120,
        default='default_farmer',
        db_index=True,
        help_text="User ID or device token for scoped history."
    )
    primary_crop = models.CharField(max_length=100, help_text="Top recommended crop name")
    confidence = models.FloatField(help_text="Model confidence score (0.0 to 1.0)")
    nitrogen = models.FloatField(help_text="Nitrogen (N) in kg/ha")
    phosphorus = models.FloatField(help_text="Phosphorus (P) in kg/ha")
    potassium = models.FloatField(help_text="Potassium (K) in kg/ha")
    ph = models.FloatField(help_text="Soil pH")
    temperature = models.FloatField(default=25.0, help_text="Temperature in Celsius")
    humidity = models.FloatField(default=80.0, help_text="Relative humidity %")
    rainfall = models.FloatField(default=200.0, help_text="Rainfall in mm")
    top_recommendations = models.JSONField(default=list, blank=True, help_text="Ranked alternative crop recommendations")
    location_name = models.CharField(max_length=150, blank=True, default='', help_text="Farm plot or city name")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Prediction History"
        verbose_name_plural = "Prediction Histories"

    def __str__(self):
        return f"{self.primary_crop} ({self.confidence:.0%}) - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
