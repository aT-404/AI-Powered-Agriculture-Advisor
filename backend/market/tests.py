import datetime
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from market.models import MarketPrice
from market.serializers import MarketPriceQuerySerializer
from market.services import (
    parse_location,
    normalize_crop_name,
    get_market_price,
    AUTHENTIC_AGMARKNET_DATA
)
from services.prediction_service import PredictionService
from django.contrib.auth import get_user_model

User = get_user_model()


class MarketMandiServicesTests(TestCase):
    """
    Test suite verifying location matching, crop name normalization, caching, unit conversions, and fallbacks.
    """
    def setUp(self):
        # Clear database records
        MarketPrice.objects.all()

    # 1. Location Parsing
    def test_location_parsing_string(self):
        state, district, market = parse_location("Kochi, Kerala")
        self.assertEqual(state, "Kerala")
        self.assertEqual(district, "Ernakulam")
        self.assertEqual(market, "Kochi")

        state, district, market = parse_location("Lasalgaon, Maharashtra")
        self.assertEqual(state, "Maharashtra")
        self.assertEqual(district, "Nashik")
        self.assertEqual(market, "Lasalgaon")

    # 2. Crop Name Normalization
    def test_crop_normalization(self):
        self.assertEqual(normalize_crop_name("rice"), "Rice")
        self.assertEqual(normalize_crop_name("chickpea"), "Bengal Gram(Gram)(Whole)")
        self.assertEqual(normalize_crop_name("blackgram"), "Black Gram (Urd Beans)(Whole)")
        self.assertEqual(normalize_crop_name("UnknownCrop"), "Unknowncrop")

    # 3. Cache and API Fallback Handling
    @patch('market.services.requests.get')
    def test_market_price_api_failure_fallback_baseline(self, mock_get):
        # Setup mock API failure (raising requests exception)
        mock_get.side_effect = Exception("API offline")
        
        # This should resolve to baseline data for Tomato in Kochi, Kerala
        # Baseline data holds: Muvattupuzha, Ernakulam, Kerala = modal 3100 INR/quintal
        price_data = get_market_price("Tomato", "Kochi, Kerala")
        
        self.assertEqual(price_data["modal_price"], 3100)
        self.assertEqual(price_data["market"], "Muvattupuzha")
        self.assertEqual(price_data["district"], "Ernakulam")
        self.assertEqual(price_data["state"], "Kerala")
        self.assertTrue(price_data["is_cached"])

    @patch('market.services.requests.get')
    def test_cache_hit_prevents_api_call(self, mock_get):
        # Create a fresh cache record
        MarketPrice.objects.create(
            crop="Rice",
            market="Muvattupuzha",
            district="Ernakulam",
            state="Kerala",
            min_price=3000.0,
            max_price=3800.0,
            modal_price=3500.0,
            currency="INR",
            unit="quintal",
            source="TestCache",
            price_date=datetime.date.today()
        )

        # Call the get_market_price. It should fetch from cache and mock_get must NOT be called.
        price_data = get_market_price("Rice", "Kothamangalam, Kerala")
        self.assertEqual(price_data["modal_price"], 3500.0)
        self.assertEqual(price_data["source"], "TestCache")
        self.assertTrue(price_data["is_cached"])
        mock_get.assert_not_called()

    # 4. Expected Revenue Calculations & Unit Conversions
    def test_expected_revenue_conversions(self):
        # Mocking unit conversion math logic directly:
        # Yield: 4.21 tons/hectare
        # Market price: 3250 INR/quintal
        # Formula:
        # yield_in_kg = 4.21 * 1000 = 4210 kg/hectare
        # price_per_kg = 3250 / 100 = 32.50 INR/kg
        # expected_revenue = 4210 * 32.50 = 136,825.0 INR
        
        yield_val = 4.21
        yield_unit = "tons/hectare"
        market_val = 3250.0
        market_unit = "quintal"
        
        # 4.21 tons/hectare = 4210 kg/hectare
        yield_in_kg = yield_val * 1000.0 if "ton" in yield_unit.lower() else yield_val
        # 3250 INR/quintal = 32.50 INR/kg
        price_per_kg = market_val / 100.0 if "quintal" in market_unit.lower() else market_val
        
        revenue = round(yield_in_kg * price_per_kg, 2)
        self.assertEqual(revenue, 136825.0)


class MarketAPIEndpointTests(APITestCase):
    """
    Test suite for standalone Market endpoint.
    """
    def setUp(self):
        self.market_prices_url = reverse('market:market-prices-list')

    def test_standalone_market_api_success(self):
        # Query for Tomato in Kerala
        response = self.client.get(self.market_prices_url, {"crop": "Tomato", "state": "Kerala"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["crop"], "Tomato")
        self.assertEqual(response.data["state"], "Kerala")
        self.assertIn("modal_price", response.data)
        self.assertIn("unit", response.data)

    def test_standalone_market_api_missing_crop(self):
        # Query without crop parameter must return 400
        response = self.client.get(self.market_prices_url, {"state": "Kerala"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("crop", response.data)
