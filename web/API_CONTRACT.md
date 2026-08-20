# Backend API Contract — AI-Powered Agriculture Advisor

This contract documents the Django REST Framework API endpoints available in the backend system (`backend/`). The frontend application communicates strictly with these endpoints.

Base URL environment variable: `VITE_API_URL` (e.g. `http://localhost:8000`)

---

## 1. Authentication Endpoints (`/api/auth/`)

### 1.1 Register
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/register/`
- **Authentication**: None (`AllowAny`)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+919876543210"
  }
  ```
- **Query Parameters**: None
- **Response (201 Created)**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>"
  }
  ```
- **Errors**:
  - `400 Bad Request`: Email already exists, weak password, missing required fields.

### 1.2 Login
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/login/`
- **Authentication**: None (`AllowAny`)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Query Parameters**: None
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>"
  }
  ```
- **Errors**:
  - `400 Bad Request`: Invalid credentials or inactive account.

### 1.3 Logout
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/logout/`
- **Authentication**: Bearer Token (`IsAuthenticated`)
- **Request Body**:
  ```json
  {
    "refresh": "<jwt_refresh_token>"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "detail": "Successfully logged out."
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Token invalid or expired.
  - `400 Bad Request`: Token blacklisting error.

### 1.4 Token Refresh
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/token/refresh/`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "refresh": "<jwt_refresh_token>"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access": "<new_jwt_access_token>"
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Refresh token expired or invalid.

### 1.5 Get / Update Profile
- **HTTP Method**: `GET`, `PUT`, `PATCH`
- **Endpoint**: `/api/auth/profile/`
- **Authentication**: Bearer Token (`IsAuthenticated`)
- **Request Body** (for `PUT`/`PATCH`):
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+919876543210",
    "location": "Kerala, India",
    "latitude": 10.0159,
    "longitude": 76.5741
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+919876543210",
    "location": "Kerala, India",
    "latitude": 10.0159,
    "longitude": 76.5741
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Token invalid or expired.

### 1.6 Change Password
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/change-password/`
- **Authentication**: Bearer Token (`IsAuthenticated`)
- **Request Body**:
  ```json
  {
    "old_password": "OldPassword123",
    "new_password": "NewPassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "detail": "Password has been updated successfully."
  }
  ```
- **Errors**:
  - `400 Bad Request`: Incorrect old password or weak new password.

### 1.7 Forgot Password (Password Recovery)
- **Status**: **NOT AVAILABLE** in Django backend.
- **Frontend Action**: Displays notice informing user to contact system administrator.

---

## 2. Predictions & Prediction History (`/api/predictions/`)

### 2.1 Run Prediction Pipeline & Save
- **HTTP Method**: `POST`
- **Endpoint**: `/api/predictions/`
- **Authentication**: Bearer Token (`IsAuthenticated`)
- **Request Body**:
  ```json
  {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.87,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.93,
    "latitude": 10.0159,
    "longitude": 76.5741
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 12,
    "input": {
      "N": 90,
      "P": 42,
      "K": 43,
      "temperature": 20.87,
      "humidity": 82.0,
      "ph": 6.5,
      "rainfall": 202.93,
      "latitude": 10.0159,
      "longitude": 76.5741
    },
    "crop_prediction": {
      "crop": "Rice",
      "confidence": 0.91
    },
    "yield_prediction": {
      "yield": 4200.0,
      "unit": "kg/hectare"
    },
    "market": {
      "market": "Muvattupuzha",
      "district": "Ernakulam",
      "state": "Kerala",
      "modal_price": 3250.0,
      "min_price": 3100.0,
      "max_price": 3400.0,
      "currency": "INR",
      "unit": "quintal",
      "price_date": "2026-08-20",
      "source": "Agmarknet",
      "is_cached": false
    },
    "financial_estimate": {
      "expected_revenue": 136500.0,
      "currency": "INR",
      "unit": "INR/hectare"
    },
    "created_at": "2026-08-21T01:00:00Z"
  }
  ```
- **Errors**:
  - `400 Bad Request`: Validation errors on inputs.
  - `500 Internal Server Error`: ML inference pipeline failure.

### 2.2 List User Prediction History
- **HTTP Method**: `GET`
- **Endpoint**: `/api/predictions/`
- **Authentication**: Bearer Token (`IsAuthenticated`)
- **Query Parameters**: `page`, `page_size`
- **Response (200 OK)**:
  ```json
  {
    "count": 25,
    "next": "http://localhost:8000/api/predictions/?page=2",
    "previous": null,
    "results": [ ... ]
  }
  ```

### 2.3 Get Prediction Details
- **HTTP Method**: `GET`
- **Endpoint**: `/api/predictions/<id>/`
- **Authentication**: Bearer Token (`IsAuthenticated`)
- **Response (200 OK)**: Single Prediction object.

### 2.4 Delete Prediction
- **HTTP Method**: `DELETE`
- **Endpoint**: `/api/predictions/<id>/`
- **Authentication**: Bearer Token (`IsAuthenticated`)
- **Response (204 No Content)**

---

## 3. Direct ML Prediction Utilities (`/api/`)

### 3.1 Direct Crop Recommendation
- **HTTP Method**: `POST`
- **Endpoint**: `/api/predict/crop/`
- **Authentication**: None
- **Request Body**: `{ "N": 90, "P": 42, "K": 43, "temperature": 20.8, "humidity": 82.0, "ph": 6.5, "rainfall": 202.9 }`

### 3.2 Direct Yield Prediction
- **HTTP Method**: `POST`
- **Endpoint**: `/api/predict/crop-yield/`
- **Authentication**: None
- **Request Body**: `{ "Crop": "Rice", "Crop_Year": 2024, "Season": "Kharif", "State": "Kerala", "Area": 1.0, "Annual_Rainfall": 2000.0 }`

---

## 4. Crop Library Endpoints (`/api/crops/`)

### 4.1 List Crops
- **HTTP Method**: `GET`
- **Endpoint**: `/api/crops/`
- **Authentication**: None (`AllowAny`)
- **Query Parameters**: `search` (optional)

### 4.2 Get Crop Detail
- **HTTP Method**: `GET`
- **Endpoint**: `/api/crops/<id>/`
- **Authentication**: None (`AllowAny`)

---

## 5. Market Intelligence Endpoints (`/api/market/` & `/api/`)

### 5.1 Get Market Filter Hierarchy
- **HTTP Method**: `GET`
- **Endpoint**: `/api/market/filters/`

### 5.2 Query Mandi Prices
- **HTTP Method**: `GET`
- **Endpoint**: `/api/market/prices/`

### 5.3 Get Price Trends
- **HTTP Method**: `GET`
- **Endpoint**: `/api/market/trends/`
