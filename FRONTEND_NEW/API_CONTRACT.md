# Backend API Contract

This document contains the exact API endpoints mapped directly from the Django backend (`Backend/`).

## 1. Authentication (`/api/auth/`)

| Method | Endpoint | Auth | Request Body / Params | Response | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | No | `{ email, password, first_name, last_name, phone }` | `{ user: { id, email, first_name, last_name }, access, refresh }` | Registers a new user and generates JWT tokens |
| `POST` | `/api/auth/login/` | No | `{ email, password }` | `{ user: { id, email, first_name, last_name }, access, refresh }` | Authenticates credentials and returns user & tokens |
| `POST` | `/api/auth/logout/` | Yes (Bearer) | `{ refresh: "<refresh_token>" }` | `{ detail: "Successfully logged out." }` | Blacklists refresh token |
| `POST` | `/api/auth/token/refresh/` | No | `{ refresh: "<refresh_token>" }` | `{ access: "<new_access_token>" }` | Generates a new access token |
| `GET` | `/api/auth/profile/` | Yes (Bearer) | None | `{ id, email, first_name, last_name, phone, location, latitude, longitude }` | Fetches authenticated user's profile |
| `PUT / PATCH` | `/api/auth/profile/` | Yes (Bearer) | Partial or full profile fields | `{ id, email, first_name, last_name, phone, location, latitude, longitude }` | Updates profile fields |
| `POST` | `/api/auth/change-password/` | Yes (Bearer) | `{ old_password, new_password }` | `{ detail: "Password has been updated successfully." }` | Changes password |

---

## 2. ML Prediction Orchestrator (`/api/predictions/`)

| Method | Endpoint | Auth | Request Body / Params | Response | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/predictions/` | Yes (Bearer) | `{ N, P, K, temperature, humidity, ph, rainfall, latitude?, longitude? }` | `{ id, input: {...}, crop_prediction: { crop, confidence }, yield_prediction: { yield, unit }, market: {...}, financial_estimate: {...}, created_at }` | Executes crop + yield + mandi price + revenue prediction pipeline |
| `GET` | `/api/predictions/` | Yes (Bearer) | `?page=<int>&page_size=<int>` | `{ count, next, previous, results: [...] }` | Retrieves user's historical prediction runs |
| `GET` | `/api/predictions/<id>/` | Yes (Bearer) | None | Full single prediction JSON | Retrieves details for one prediction |
| `DELETE` | `/api/predictions/<id>/` | Yes (Bearer) | None | Status 204 No Content | Deletes prediction from history |

---

## 3. Dedicated ML Models (`/api/predict/`)

| Method | Endpoint | Auth | Request Body | Response | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/predict/crop/` | No | `{ N, P, K, temperature, humidity, ph, rainfall }` | `{ recommended_crop, confidence, primaryRecommendation: { cropName, confidence } }` | Recommends best crop using 7 soil/climate features |
| `POST` | `/api/predict/crop-yield/` | No | `{ Crop, Crop_Year, Season, State, Area, Annual_Rainfall }` | `{ success: true, predicted_yield: float, unit: "tons/hectare" }` | Predicts yield using 6 parameters |

---

## 4. Weather Intelligence (`/api/weather/`)

| Method | Endpoint | Auth | Query Params | Response | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/weather/` | No | `?location=<city>` OR `?latitude=<float>&longitude=<float>` | `{ location: { name, latitude, longitude, state, country }, current: { temperature, feels_like, humidity, wind_speed, condition, icon, ... }, forecast: [ { date, temp_max, temp_min, precipitation, rain_probability, condition, icon }, ... ] }` | Real-time conditions & 7-day agricultural forecast from Open-Meteo |

---

## 5. Market Intelligence (`/api/market/`)

| Method | Endpoint | Auth | Query Params | Response | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/market/filters/` | No | None | `{ states: [...], commodities: [...], hierarchy: {...} }` | Filter options for mandi search |
| `GET` | `/api/market/prices/` | No | `?commodity=&state=&district=&market=` | `{ count: int, results: [ { commodity, state, district, market, min_price, max_price, modal_price, date, ... } ] }` | Live Mandi commodity rates |
| `GET` | `/api/market/trends/` | No | `?commodity=&state=&district=&market=&days=7|30` | `{ commodity, current_price, previous_price, percentage_change, trend_direction, trend_data: [ { date, price }, ... ] }` | Historical price trends (7 or 30 days) |

---

## 6. Price Alerts (`/api/alerts/`)

| Method | Endpoint | Auth | Request / Params | Response | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/alerts/` | No | `?user_identifier=<id>` | `[ { id, commodity, state, district, market, target_price, condition, is_active, is_triggered, ... } ]` | List user's price alerts |
| `POST` | `/api/alerts/` | No | `{ commodity, target_price, condition, state?, district?, market?, user_identifier? }` | Alert object + `notification_message` | Create price alert |
| `PATCH` | `/api/alerts/<id>/` | No | Partial fields | Updated alert object | Update alert thresholds |
| `POST` | `/api/alerts/<id>/toggle/` | No | None | Updated alert object | Toggle active state |
| `POST` | `/api/alerts/check/` | No | None | `{ evaluated_count: int, results: [...] }` | Evaluates all active alerts against latest market prices |
| `DELETE` | `/api/alerts/<id>/` | No | None | Status 204 No Content | Delete alert |

---

## 7. Crop Library (`/api/crops/`)

| Method | Endpoint | Auth | Query Params | Response | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/crops/` | No | `?search=<crop_name>` | `[ { id, name, scientific_name, description, image, ideal_temperature_min, ideal_temperature_max, ideal_ph_min, ideal_ph_max, ideal_rainfall_min, ideal_rainfall_max }, ... ]` | Searchable crop catalog |
| `GET` | `/api/crops/<id>/` | No | None | Single crop object | Detailed agronomic data & ideal conditions |

---

## 8. Health & System Check (`/api/health/`)

| Method | Endpoint | Auth | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health/` | No | `{ status: "ok", service: "AI Agriculture Advisor API", features: [...] }` | Backend availability probe |
