from django.db import models

class MarketPrice(models.Model):
    """
    Model caching daily mandi prices from the Government of India open data platform (AGMARKNET).
    """
    crop = models.CharField(max_length=100, db_index=True)
    market = models.CharField(max_length=100, db_index=True)
    district = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    
    min_price = models.FloatField(help_text="Minimum price in currency/unit")
    max_price = models.FloatField(help_text="Maximum price in currency/unit")
    modal_price = models.FloatField(help_text="Modal (most frequent) price in currency/unit")
    
    currency = models.CharField(max_length=10, default='INR')
    unit = models.CharField(max_length=50, default='quintal')
    
    source = models.CharField(max_length=200, default='data.gov.in / AGMARKNET')
    price_date = models.DateField(help_text="The date of arrival / reporting of the price")
    
    fetched_at = models.DateTimeField(auto_now=True, help_text="Timestamp when this price was saved/updated in cache")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-price_date', '-fetched_at']
        indexes = [
            models.Index(fields=['crop', 'state', 'district', 'price_date']),
        ]
        verbose_name = "Market Price"
        verbose_name_plural = "Market Prices"

    def __str__(self):
        return f"{self.crop} at {self.market} Mandi ({self.price_date}) = {self.currency} {self.modal_price}/{self.unit}"
