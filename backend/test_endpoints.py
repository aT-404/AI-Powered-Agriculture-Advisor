"""
Test script to verify all backend API endpoints and services.
"""
import os
import sys
import django
from django.test import RequestFactory

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from prediction.views import (
    HealthCheckView,
    CropPredictionView,
    WeatherView,
    MarketFiltersView,
    MarketPricesView,
    MarketTrendsView,
    PriceAlertListCreateView,
    PriceAlertDetailView,
    PriceAlertToggleView,
    PriceAlertCheckView,
)
from prediction.models import PriceAlert

def run_tests():
    factory = RequestFactory()
    print("=" * 60)
    print("RUNNING BACKEND API ENDPOINT TESTS")
    print("=" * 60)

    # 1. Health Check
    req = factory.get('/api/health/')
    resp = HealthCheckView.as_view()(req)
    assert resp.status_code == 200, f"Health check failed: {resp.status_code}"
    print(f"[PASS] 1. Health Check: {resp.data['status']}")

    # 1b. ML Crop Prediction
    pred_req = factory.post('/api/predict/crop/', {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 20.8,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9
    }, format='json')
    pred_resp = CropPredictionView.as_view()(pred_req)
    assert pred_resp.status_code == 200, f"Crop prediction failed: {pred_resp.status_code}"
    rec_crop = pred_resp.data.get('primaryRecommendation', {}).get('cropName', 'Unknown')
    print(f"[PASS] 1b. Crop Prediction ML: Recommended '{rec_crop}' (Confidence: {pred_resp.data.get('primaryRecommendation', {}).get('confidence')})")

    # 2. Weather View (Open-Meteo)
    req = factory.get('/api/weather/', {'location': 'Kothamangalam'})
    resp = WeatherView.as_view()(req)
    assert resp.status_code == 200, f"Weather view failed: {resp.status_code}, data: {resp.data}"
    assert 'current' in resp.data and 'forecast' in resp.data, "Weather response missing current or forecast"
    print(f"[PASS] 2. Weather View (Open-Meteo): {resp.data['location']['name']}, Temp: {resp.data['current']['temperature']}C, Condition: {resp.data['current']['condition']}, Forecast: {len(resp.data['forecast'])} days")

    # 3. Market Filters
    req = factory.get('/api/market/filters/')
    resp = MarketFiltersView.as_view()(req)
    assert resp.status_code == 200, f"Market filters failed: {resp.status_code}"
    assert 'states' in resp.data and 'commodities' in resp.data
    print(f"[PASS] 3. Market Filters: {len(resp.data['states'])} states, {len(resp.data['commodities'])} commodities")

    # 4. Market Prices
    req = factory.get('/api/market/prices/', {'commodity': 'Tomato', 'market': 'Muvattupuzha'})
    resp = MarketPricesView.as_view()(req)
    assert resp.status_code == 200, f"Market prices failed: {resp.status_code}"
    assert resp.data['count'] > 0, "No market prices returned"
    p = resp.data['results'][0]
    print(f"[PASS] 4. Market Prices: {p['commodity']} at {p['market']} Mandi = Rs.{p['modal_price']}/Quintal (Min: Rs.{p['min_price']}, Max: Rs.{p['max_price']})")

    # 5. Market Trends (7 days & 30 days)
    req7 = factory.get('/api/market/trends/', {'commodity': 'Tomato', 'market': 'Muvattupuzha', 'days': 7})
    resp7 = MarketTrendsView.as_view()(req7)
    assert resp7.status_code == 200, f"Market trends 7d failed: {resp7.status_code}"
    assert len(resp7.data['points']) == 7, f"Expected 7 points, got {len(resp7.data['points'])}"
    print(f"[PASS] 5. Market Trends (7d): {resp7.data['commodity']}, Current: Rs.{resp7.data['current_price']}, Prev: Rs.{resp7.data['previous_price']}, Change: {resp7.data['percentage_change']}%, Direction: {resp7.data['trend_direction']}")

    req30 = factory.get('/api/market/trends/', {'commodity': 'Tomato', 'market': 'Muvattupuzha', 'days': 30})
    resp30 = MarketTrendsView.as_view()(req30)
    assert resp30.status_code == 200, f"Market trends 30d failed: {resp30.status_code}"
    assert len(resp30.data['points']) == 30, f"Expected 30 points, got {len(resp30.data['points'])}"
    print(f"[PASS] 6. Market Trends (30d): 30 data points generated")

    # 6. Price Alert Create & Trigger Check
    # Current modal price for Tomato at Muvattupuzha is 3100
    create_req = factory.post('/api/alerts/', {
        'commodity': 'Tomato',
        'market': 'Muvattupuzha',
        'state': 'Kerala',
        'district': 'Ernakulam',
        'target_price': 3000,
        'condition': 'GTE',
        'user_identifier': 'test_farmer_1',
    }, format='json')
    create_resp = PriceAlertListCreateView.as_view()(create_req)
    assert create_resp.status_code == 201, f"Alert creation failed: {create_resp.status_code}, data: {create_resp.data}"
    alert_id = create_resp.data['id']
    print(f"[PASS] 7. Price Alert Create: Alert #{alert_id}, Triggered: {create_resp.data['is_triggered']}, Notification: {create_resp.data.get('notification_message')}")

    # 7. Price Alert List
    list_req = factory.get('/api/alerts/', {'user_identifier': 'test_farmer_1'})
    list_resp = PriceAlertListCreateView.as_view()(list_req)
    assert list_resp.status_code == 200, f"Alert list failed: {list_resp.status_code}"
    assert len(list_resp.data) >= 1, "Alert list is empty"
    print(f"[PASS] 8. Price Alert List: {len(list_resp.data)} alerts retrieved")

    # 8. Price Alert Toggle
    toggle_req = factory.post(f'/api/alerts/{alert_id}/toggle/')
    toggle_resp = PriceAlertToggleView.as_view()(toggle_req, pk=alert_id)
    assert toggle_resp.status_code == 200, f"Alert toggle failed: {toggle_resp.status_code}"
    print(f"[PASS] 9. Price Alert Toggle: is_active is now {toggle_resp.data['is_active']}")

    # 9. Price Alert Batch Check
    check_req = factory.post('/api/alerts/check/')
    check_resp = PriceAlertCheckView.as_view()(check_req)
    assert check_resp.status_code == 200, f"Alert batch check failed: {check_resp.status_code}"
    print(f"[PASS] 10. Price Alert Batch Check: {check_resp.data['evaluated_count']} alerts evaluated")

    # 10. Price Alert Delete
    del_req = factory.delete(f'/api/alerts/{alert_id}/')
    del_resp = PriceAlertDetailView.as_view()(del_req, pk=alert_id)
    assert del_resp.status_code == 204, f"Alert delete failed: {del_resp.status_code}"
    print(f"[PASS] 11. Price Alert Delete: Alert #{alert_id} successfully deleted")

    print("=" * 60)
    print("ALL 11 BACKEND API TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
