# AI-Powered Agriculture Advisor 🌾🌦️📈

An intelligent decision-support platform designed for farmers, combining AI-driven crop recommendations with real-time weather forecasting, live agricultural mandi prices, price trend analytics, and automated target price alerts.

---

## 🌟 Key Features

### 1. 🌾 Crop Recommendation ML
- Recommends optimal crops based on soil nutrients (Nitrogen, Phosphorus, Potassium, pH) and climate conditions (Temperature, Humidity, Rainfall).
- Returns primary recommendation with suitability score, detailed agronomic reasoning, and ranked alternative crops.

### 2. 🌦️ Weather Integration (Open-Meteo)
- **Current Conditions**: Temperature, Feels-like (apparent temperature), Relative Humidity, Wind Speed, Weather Condition (with icons), and Precipitation / Rain (mm).
- **7-Day Agricultural Forecast**: Daily outlook including Min/Max temperatures, Rain Probability (%), Precipitation Sum (mm), Wind Speed, and weather conditions.
- **Location Geocoding**: Interactive search converting city/town names to precise coordinates via Open-Meteo Geocoding API with fallback to popular agricultural hubs.

### 3. 📈 Current Mandi Prices (Agmarknet / Data.gov.in)
- Live and authentic Indian agricultural market rates across major states, districts, and APMC mandis (e.g. Muvattupuzha, Kothamangalam, Lasalgaon, Pune, Kolar, Khanna, etc.).
- Displays **Modal Price** (standard clearing rate), **Minimum Price**, **Maximum Price**, **Commodity Variety**, **Arrival Date**, and **Last Updated Time**.
- Cascading selectors for **State → District → Mandi → Commodity**.

### 4. 📊 Price Trend Analysis & Charts
- Visualizes **7-day** and **30-day** historical modal price trajectories for selected commodities and mandis.
- Highlights:
  - **Current Price** vs. **Starting Period Price**
  - **Net Price Difference** (₹/Quintal)
  - **Percentage Change** (+X.X% / -X.X%)
  - **Market Sentiment / Direction** (📈 Bullish / Rising, 📉 Softening / Falling, ⚖️ Stable)
- Responsive interactive visualizer with price points, Y-axis benchmarks, and date intervals.

### 5. 🔔 Smart Price Alerts System
- Allows farmers to define target market prices for specific crops at chosen mandis.
- Evaluates conditions:
  - `≥ Reaches or Exceeds` (e.g. Tomato at Muvattupuzha ≥ ₹3,000/quintal)
  - `≤ Drops Below`
- Triggers instant in-app alerts (e.g. *"🔔 Tomato price has reached ₹3000/quintal at Muvattupuzha."*).
- Supports toggling alerts on/off and deleting alerts.

---

## 🏗️ System Architecture

```
AI-Powered-Agriculture-Advisor/
├── backend/
│   ├── config/              # Django settings, URLs, WSGI/ASGI
│   ├── prediction/          # Django app: Models, Serializers, Views, URLs
│   │   ├── models.py        # PriceAlert database model
│   │   ├── serializers.py   # Serializers for ML, Weather, Market, Alerts
│   │   ├── views.py         # DRF API views
│   │   └── urls.py          # /api/... routes
│   ├── services/            # Clean external service layer
│   │   ├── weather_service.py # Open-Meteo Weather & Geocoding integration
│   │   ├── market_service.py  # Agmarknet / Data.gov.in Mandi price provider
│   │   └── alert_service.py   # Price alert evaluation & notifications
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Expo Router v6 file-based navigation
│   │   ├── (tabs)/
│   │   │   ├── home.tsx     # Unified Agriculture Intelligence Dashboard
│   │   │   └── predict.tsx  # Crop Prediction Input Form
│   │   └── prediction/
│   │       └── result.tsx   # Recommendation Result + Linked Market Intelligence
│   ├── components/          # Reusable UI components
│   │   ├── WeatherCard.tsx     # Open-Meteo Current & 7-Day Forecast card
│   │   ├── MarketPriceCard.tsx # Agmarknet Mandi Price selector & display
│   │   ├── PriceTrendCard.tsx  # 7-day / 30-day Price Trend Chart
│   │   └── PriceAlertCard.tsx  # Farmer Price Alert manager & trigger banner
│   ├── services/            # Frontend API client modules
│   │   ├── weatherService.ts
│   │   ├── marketService.ts
│   │   ├── alertService.ts
│   │   └── predictionService.ts
│   └── types/               # TypeScript type definitions
└── ai_model/                # Pre-trained ML models & inference engine
```

---

## 📡 API Endpoints

### 1. Weather API
- `GET /api/weather/?location=Kothamangalam`
  - Fetches Open-Meteo current conditions and 7-day forecast for the given location or `latitude` & `longitude`.

### 2. Market Intelligence APIs
- `GET /api/market/filters/`
  - Returns hierarchical list of available States, Districts, Markets, and Commodities.
- `GET /api/market/prices/?commodity=Tomato&state=Kerala&district=Ernakulam&market=Muvattupuzha`
  - Returns current mandi prices (min, modal, max, unit, date, last updated).
- `GET /api/market/trends/?commodity=Tomato&market=Muvattupuzha&days=7`
  - Returns historical daily price points, percentage change, and trend direction (`days=7` or `days=30`).

### 3. Price Alerts APIs
- `GET /api/alerts/?user_identifier=default_farmer`
  - Lists all configured price alerts for the user.
- `POST /api/alerts/`
  - Creates a new price alert and immediately evaluates it against current market prices.
  - Body:
    ```json
    {
      "commodity": "Tomato",
      "market": "Muvattupuzha",
      "target_price": 3000,
      "condition": "GTE",
      "state": "Kerala",
      "district": "Ernakulam"
    }
    ```
- `POST /api/alerts/<id>/toggle/`
  - Toggles the active status of an alert.
- `DELETE /api/alerts/<id>/`
  - Deletes a price alert.
- `POST /api/alerts/check/`
  - Batch evaluates all active alerts against the latest market prices.

### 4. Crop Prediction ML API
- `POST /api/predict/crop/`
  - Body: `{"N": 90, "P": 42, "K": 43, "temperature": 25.5, "humidity": 80, "ph": 6.5, "rainfall": 202}`

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
# Backend Django Settings
SECRET_KEY=django-insecure-cropwise-agriculture-advisor-key-for-dev
DEBUG=True
ALLOWED_HOSTS=*

# Optional: Official Indian Government Agmarknet data via Data.gov.in
# (A rich baseline verified dataset is included for offline/fallback operation)
DATA_GOV_IN_API_KEY=

# Frontend Configuration
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

---

## 🧪 Verification & Testing

Verify backend APIs:
```bash
# Check Health
curl http://127.0.0.1:8000/api/health/

# Check Weather (Open-Meteo)
curl "http://127.0.0.1:8000/api/weather/?location=Kothamangalam"

# Check Mandi Prices
curl "http://127.0.0.1:8000/api/market/prices/?commodity=Tomato&market=Muvattupuzha"

# Check Price Trends
curl "http://127.0.0.1:8000/api/market/trends/?commodity=Tomato&days=7"

# Check Price Alerts
curl http://127.0.0.1:8000/api/alerts/
```
