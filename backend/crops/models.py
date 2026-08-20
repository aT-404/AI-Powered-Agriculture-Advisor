from django.db import models


class Crop(models.Model):
    """
    Represents a crop supported by the ML recommendation model.
    """
    name = models.CharField(max_length=100, unique=True)
    scientific_name = models.CharField(max_length=200, blank=True, default='')
    description = models.TextField(blank=True, default='')
    image = models.URLField(max_length=500, blank=True, default='')

    # Ideal growing conditions
    ideal_temperature_min = models.FloatField(null=True, blank=True, help_text="°C")
    ideal_temperature_max = models.FloatField(null=True, blank=True, help_text="°C")
    ideal_ph_min = models.FloatField(null=True, blank=True)
    ideal_ph_max = models.FloatField(null=True, blank=True)
    ideal_rainfall_min = models.FloatField(null=True, blank=True, help_text="mm/year")
    ideal_rainfall_max = models.FloatField(null=True, blank=True, help_text="mm/year")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Crop'
        verbose_name_plural = 'Crops'

    def __str__(self):
        return self.name
