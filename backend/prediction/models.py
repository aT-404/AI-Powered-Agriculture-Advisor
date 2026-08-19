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
