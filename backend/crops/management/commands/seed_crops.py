from django.core.management.base import BaseCommand
from crops.models import Crop

class Command(BaseCommand):
    help = 'Seeds the database with standard crop classes and standard growing conditions.'

    def handle(self, *args, **kwargs):
        crops_data = [
            {"name": "Apple", "scientific_name": "Malus domestica", "temp_min": 15, "temp_max": 25, "ph_min": 5.5, "ph_max": 6.5, "rain_min": 600, "rain_max": 1000},
            {"name": "Banana", "scientific_name": "Musa acuminata", "temp_min": 20, "temp_max": 30, "ph_min": 5.5, "ph_max": 6.5, "rain_min": 1500, "rain_max": 2500},
            {"name": "Blackgram", "scientific_name": "Vigna mungo", "temp_min": 25, "temp_max": 35, "ph_min": 6.0, "ph_max": 7.0, "rain_min": 600, "rain_max": 1000},
            {"name": "Chickpea", "scientific_name": "Cicer arietinum", "temp_min": 15, "temp_max": 25, "ph_min": 6.0, "ph_max": 7.5, "rain_min": 350, "rain_max": 500},
            {"name": "Coconut", "scientific_name": "Cocos nucifera", "temp_min": 20, "temp_max": 30, "ph_min": 5.0, "ph_max": 8.0, "rain_min": 1000, "rain_max": 2000},
            {"name": "Coffee", "scientific_name": "Coffea arabica", "temp_min": 15, "temp_max": 25, "ph_min": 5.0, "ph_max": 6.0, "rain_min": 1000, "rain_max": 2000},
            {"name": "Cotton", "scientific_name": "Gossypium hirsutum", "temp_min": 20, "temp_max": 30, "ph_min": 5.5, "ph_max": 7.5, "rain_min": 500, "rain_max": 1000},
            {"name": "Grapes", "scientific_name": "Vitis vinifera", "temp_min": 15, "temp_max": 30, "ph_min": 5.5, "ph_max": 7.0, "rain_min": 500, "rain_max": 800},
            {"name": "Jute", "scientific_name": "Corchorus olitorius", "temp_min": 24, "temp_max": 35, "ph_min": 6.0, "ph_max": 7.5, "rain_min": 1200, "rain_max": 1800},
            {"name": "Kidneybeans", "scientific_name": "Phaseolus vulgaris", "temp_min": 15, "temp_max": 25, "ph_min": 5.5, "ph_max": 6.5, "rain_min": 350, "rain_max": 600},
            {"name": "Lentil", "scientific_name": "Lens culinaris", "temp_min": 15, "temp_max": 25, "ph_min": 6.0, "ph_max": 7.0, "rain_min": 350, "rain_max": 500},
            {"name": "Maize", "scientific_name": "Zea mays", "temp_min": 15, "temp_max": 30, "ph_min": 5.5, "ph_max": 7.0, "rain_min": 500, "rain_max": 1000},
            {"name": "Mango", "scientific_name": "Mangifera indica", "temp_min": 24, "temp_max": 30, "ph_min": 5.5, "ph_max": 7.0, "rain_min": 1000, "rain_max": 2000},
            {"name": "Mothbeans", "scientific_name": "Vigna aconitifolia", "temp_min": 25, "temp_max": 35, "ph_min": 6.5, "ph_max": 7.5, "rain_min": 300, "rain_max": 500},
            {"name": "Mungbean", "scientific_name": "Vigna radiata", "temp_min": 25, "temp_max": 35, "ph_min": 6.0, "ph_max": 7.0, "rain_min": 600, "rain_max": 1000},
            {"name": "Muskmelon", "scientific_name": "Cucumis melo", "temp_min": 20, "temp_max": 30, "ph_min": 6.0, "ph_max": 7.0, "rain_min": 400, "rain_max": 600},
            {"name": "Orange", "scientific_name": "Citrus sinensis", "temp_min": 15, "temp_max": 30, "ph_min": 5.5, "ph_max": 6.5, "rain_min": 1000, "rain_max": 1500},
            {"name": "Papaya", "scientific_name": "Carica papaya", "temp_min": 20, "temp_max": 30, "ph_min": 6.0, "ph_max": 6.5, "rain_min": 1000, "rain_max": 1500},
            {"name": "Pigeonpeas", "scientific_name": "Cajanus cajan", "temp_min": 18, "temp_max": 30, "ph_min": 5.0, "ph_max": 7.0, "rain_min": 600, "rain_max": 1000},
            {"name": "Pomegranate", "scientific_name": "Punica granatum", "temp_min": 15, "temp_max": 35, "ph_min": 6.0, "ph_max": 7.5, "rain_min": 500, "rain_max": 800},
            {"name": "Rice", "scientific_name": "Oryza sativa", "temp_min": 20, "temp_max": 35, "ph_min": 5.0, "ph_max": 6.5, "rain_min": 800, "rain_max": 2500},
            {"name": "Watermelon", "scientific_name": "Citrullus lanatus", "temp_min": 20, "temp_max": 35, "ph_min": 6.0, "ph_max": 7.0, "rain_min": 400, "rain_max": 600},
        ]

        for data in crops_data:
            crop, created = Crop.objects.get_or_create(
                name=data["name"],
                defaults={
                    "scientific_name": data["scientific_name"],
                    "ideal_temperature_min": data["temp_min"],
                    "ideal_temperature_max": data["temp_max"],
                    "ideal_ph_min": data["ph_min"],
                    "ideal_ph_max": data["ph_max"],
                    "ideal_rainfall_min": data["rain_min"],
                    "ideal_rainfall_max": data["rain_max"],
                    "description": f"Standard growing characteristics for {data['name']} crop recommendations."
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Successfully seeded crop: {crop.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Crop already exists: {crop.name}"))
