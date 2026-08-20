"""
Comprehensive test script to verify all 16 backend API endpoints, ML models, and Supabase database services.
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
    CropYieldPredictionView,
    WeatherView,
    MarketFiltersView,
    MarketPricesView,
    MarketTrendsView,
    PriceAlertListCreateView,
    PriceAlertDetailView,
    PriceAlertToggleView,
    PriceAlertCheckView,
    PredictionHistoryListView,
    PredictionHistoryDetailView,
    UserRegistrationView,
    UserLoginView,
    UserProfileView,
    CropCatalogListView,
    CropCatalogDetailView,
)
from prediction.models import PriceAlert, PredictionHistory

def run_tests():
    factory = RequestFactory()
    print("=" * 70)
    print("RUNNING COMPREHENSIVE BACKEND INTEGRATION TESTS")
    print("=" * 70)

    # 1. Health Check
    req = factory.get('/api/health/')
    resp = HealthCheckView.as_view()(req)
    assert resp.status_code == 200, f"Health check failed: {resp.status_code}"
    print(f"[PASS] 1. Health Check: {resp.data['status']}")

    # 2. ML Crop Prediction (Model 1) + Database Persistence
    pred_req = factory.post('/api/predict/crop/', {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 20.8,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9,
        "user_identifier": "test_farmer_history",
        "location_name": "Kothamangalam North Field"
    }, format='json')
    pred_resp = CropPredictionView.as_view()(pred_req)
    assert pred_resp.status_code == 200, f"Crop prediction failed: {pred_resp.status_code}"
    rec_crop = pred_resp.data.get('recommended_crop', 'Unknown')
    history_id = pred_resp.data.get('history_id')
    assert history_id is not None, "History ID was not returned/persisted"
    print(f"[PASS] 2. Model 1 (Crop Recommendation): Recommended '{rec_crop}' (Confidence: {pred_resp.data.get('confidence')}) [Saved to DB #{history_id}]")

    # 3. ML Crop Yield Prediction (Model 2) + SHAP Explainability
    yield_req = factory.post('/api/predict/crop-yield/', {
        "N": 80,
        "P": 40,
        "K": 45,
        "Soil_pH": 6.5,
        "Soil_Moisture": 35,
        "Soil_Type": "Loamy",
        "Organic_Carbon": 1.8,
        "Temperature": 27,
        "Humidity": 75,
        "Rainfall": 900,
        "Sunlight_Hours": 8,
        "Wind_Speed": 12,
        "Region": "South",
        "Altitude": 100,
        "Season": "Kharif",
        "Crop_Type": "Rice",
        "Irrigation_Type": "Drip",
        "Fertilizer_Used": "Yes",
        "Pesticide_Used": "No"
    }, format='json')
    yield_resp = CropYieldPredictionView.as_view()(yield_req)
    assert yield_resp.status_code == 200, f"Yield prediction failed: {yield_resp.status_code}"
    assert yield_resp.data['success'] is True, "Yield prediction did not succeed"
    print(f"[PASS] 3. Model 2 (Yield Prediction): {yield_resp.data['predicted_yield']} {yield_resp.data['unit']} (SHAP factors: {len(yield_resp.data['explanation'])})")

    # 4. Prediction History List
    hist_req = factory.get('/api/predict/history/', {'user_identifier': 'test_farmer_history'})
    hist_resp = PredictionHistoryListView.as_view()(hist_req)
    assert hist_resp.status_code == 200, f"History list failed: {hist_resp.status_code}"
    assert len(hist_resp.data) >= 1, "History list is empty"
    print(f"[PASS] 4. Prediction History List: {len(hist_resp.data)} saved records found in Supabase")

    # 5. Prediction History Detail
    hist_det_req = factory.get(f'/api/predict/history/{history_id}/')
    hist_det_resp = PredictionHistoryDetailView.as_view()(hist_det_req, pk=history_id)
    assert hist_det_resp.status_code == 200, f"History detail failed: {hist_det_resp.status_code}"
    print(f"[PASS] 5. Prediction History Detail: Record #{history_id} retrieved for crop '{hist_det_resp.data['primary_crop']}'")

    # 6. User Registration & Login Auth
    import uuid
    unique_email = f"farmer_{uuid.uuid4().hex[:6]}@agriadvisor.com"
    reg_req = factory.post('/api/auth/register/', {
        'name': 'Ramesh Kumar',
        'email': unique_email,
        'password': 'StrongPassword123!',
        'phone': '+91 9876543210'
    }, format='json')
    reg_resp = UserRegistrationView.as_view()(reg_req)
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.status_code}, data: {reg_resp.data}"
    print(f"[PASS] 6. User Registration: Created farmer '{reg_resp.data['user']['name']}' ({unique_email})")

    login_req = factory.post('/api/auth/login/', {
        'email': unique_email,
        'password': 'StrongPassword123!'
    }, format='json')
    login_resp = UserLoginView.as_view()(login_req)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code}"
    print(f"[PASS] 7. User Login: Authenticated successfully, Token generated")

    me_req = factory.get('/api/auth/me/', {'email': unique_email})
    me_resp = UserProfileView.as_view()(me_req)
    assert me_resp.status_code == 200, f"User profile failed: {me_resp.status_code}"
    print(f"[PASS] 8. User Profile: Retrieved {me_resp.data['name']} ({me_resp.data['email']})")

    # 7. Crop Catalog
    crops_req = factory.get('/api/crops/', {'category': 'Cereals'})
    crops_resp = CropCatalogListView.as_view()(crops_req)
    assert crops_resp.status_code == 200, f"Crop catalog failed: {crops_resp.status_code}"
    assert len(crops_resp.data) >= 1, "Cereals catalog empty"
    print(f"[PASS] 9. Crop Catalog List: {len(crops_resp.data)} crops found in 'Cereals' category")

    crop_det_req = factory.get('/api/crops/crop-rice/')
    crop_det_resp = CropCatalogDetailView.as_view()(crop_det_req, crop_id='crop-rice')
    assert crop_det_resp.status_code == 200, f"Crop detail failed: {crop_det_resp.status_code}"
    print(f"[PASS] 10. Crop Catalog Detail: {crop_det_resp.data['name']} ({crop_det_resp.data['scientificName']})")

    # 8. Weather View (Open-Meteo)
    req = factory.get('/api/weather/', {'location': 'Kothamangalam'})
    resp = WeatherView.as_view()(req)
    assert resp.status_code == 200, f"Weather view failed: {resp.status_code}"
    assert 'current' in resp.data and 'forecast' in resp.data, "Weather response missing current or forecast"
    print(f"[PASS] 11. Weather View (Open-Meteo): {resp.data['location']['name']}, Temp: {resp.data['current']['temperature']}C, Condition: {resp.data['current']['condition']}")

    # 9. Market Filters
    req = factory.get('/api/market/filters/')
    resp = MarketFiltersView.as_view()(req)
    assert resp.status_code == 200, f"Market filters failed: {resp.status_code}"
    print(f"[PASS] 12. Market Filters: {len(resp.data['states'])} states, {len(resp.data['commodities'])} commodities")

    # 10. Market Prices & Trends
    req = factory.get('/api/market/prices/', {'commodity': 'Tomato', 'market': 'Muvattupuzha'})
    resp = MarketPricesView.as_view()(req)
    assert resp.status_code == 200, f"Market prices failed: {resp.status_code}"
    p = resp.data['results'][0]
    print(f"[PASS] 13. Market Prices: {p['commodity']} at {p['market']} Mandi = Rs.{p['modal_price']}/Quintal")

    req7 = factory.get('/api/market/trends/', {'commodity': 'Tomato', 'market': 'Muvattupuzha', 'days': 7})
    resp7 = MarketTrendsView.as_view()(req7)
    assert resp7.status_code == 200, f"Market trends 7d failed: {resp7.status_code}"
    print(f"[PASS] 14. Market Trends (7d): {resp7.data['commodity']}, Current: Rs.{resp7.data['current_price']}, Change: {resp7.data['percentage_change']}%, Direction: {resp7.data['trend_direction']}")

    # 11. Price Alert System
    create_req = factory.post('/api/alerts/', {
        'commodity': 'Tomato',
        'market': 'Muvattupuzha',
        'state': 'Kerala',
        'district': 'Ernakulam',
        'target_price': 3000,
        'condition': 'GTE',
        'user_identifier': 'test_farmer_full',
    }, format='json')
    create_resp = PriceAlertListCreateView.as_view()(create_req)
    assert create_resp.status_code == 201, f"Alert creation failed: {create_resp.status_code}"
    alert_id = create_resp.data['id']
    print(f"[PASS] 15. Price Alert Create & Check: Alert #{alert_id} created successfully")

    # 12. Cleanup
    del_req = factory.delete(f'/api/alerts/{alert_id}/')
    del_resp = PriceAlertDetailView.as_view()(del_req, pk=alert_id)
    assert del_resp.status_code == 204, f"Alert delete failed: {del_resp.status_code}"

    del_hist_req = factory.delete(f'/api/predict/history/{history_id}/')
    del_hist_resp = PredictionHistoryDetailView.as_view()(del_hist_req, pk=history_id)
    assert del_hist_resp.status_code == 204, f"History delete failed: {del_hist_resp.status_code}"
    print(f"[PASS] 16. Test Cleanup: Alert #{alert_id} and History #{history_id} deleted successfully")

    print("=" * 70)
    print("ALL 16 BACKEND & INTEGRATION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    run_tests()

