# AI-Powered Agriculture Advisor — Frontend Developer Guide & Tutorial

Welcome to the **AI-Powered Agriculture Advisor (CropWise AI)** frontend repository. This application is built with **React Native**, **Expo (SDK 54)**, **Expo Router**, and **TypeScript**.

This document serves as an exhaustive reference and tutorial for setting up, understanding the architectural patterns, navigating the folder structure, and collaborating on features.

---

## Table of Contents

1. [Quick Start: Running the App After Cloning](#1-quick-start-running-the-app-after-cloning)
2. [Project Architecture Overview](#2-project-architecture-overview)
3. [Complete Folder Structure & Directory Map](#3-complete-folder-structure--directory-map)
4. [In-Depth File Explanations](#4-in-depth-file-explanations)
   - [4.1 Navigation & Screen Routes (`app/`)](#41-navigation--screen-routes-app)
   - [4.2 UI Component Library (`components/`)](#42-ui-component-library-components)
   - [4.3 Service Layer (`services/`)](#43-service-layer-services)
   - [4.4 State Stores (`store/`)](#44-state-stores-store)
   - [4.5 TypeScript Definitions (`types/`)](#45-typescript-definitions-types)
   - [4.6 Constants & Tokens (`constants/`)](#46-constants--tokens-constants)
   - [4.7 Utility Functions (`utils/`)](#47-utility-functions-utils)
5. [Developer Work Division & Collaboration Guide](#5-developer-work-division--collaboration-guide)
6. [Best Practices for Adding New Features](#6-best-practices-for-adding-new-features)

---

## 1. Quick Start: Running the App After Cloning

Follow these steps to run the application locally on your machine.

### Prerequisites

* **Node.js**: `v18.x` or `v20.x`+ recommended (or Node `v22.x`)
* **npm** or **yarn** / **pnpm**
* **Expo Go App** on your mobile device (iOS App Store or Android Google Play) or an emulator (Android Studio / Xcode Simulator)

### Step-by-Step Setup

1. **Clone the GitHub repository:**
   ```bash
   git clone https://github.com/aT-404/AI-Powered-Agriculture-Advisor.git
   ```

2. **Navigate into the frontend project directory:**
   ```bash
   cd AI-Powered-Agriculture-Advisor/frontend
   # or if you are in the repository root:
   cd frontend
   ```

3. **Install frontend dependencies:**
   ```bash
   npm install
   ```

4. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

5. **Open on your device or browser:**
   * **Mobile Device (Expo Go)**: Scan the QR code displayed in the terminal with your phone camera (iOS) or Expo Go app (Android).
   * **Web Browser**: Press `w` in the terminal to launch the web preview.
   * **Android Emulator**: Press `a` in the terminal (requires Android Studio emulator running).
   * **iOS Simulator**: Press `i` in the terminal (macOS with Xcode only).

6. **Run TypeScript check (optional):**
   ```bash
   npx tsc --noEmit
   ```

---

## 2. Project Architecture Overview

The repository is organized into distinct subdirectories (e.g. `frontend/`, `backend/`, `ml/`) so each team can develop independently without conflicting files:

```text
AI-Powered-Agriculture-Advisor/
├── frontend/                     # React Native Expo Frontend Application
├── backend/                      # Backend APIs & Server (Backend Team)
├── ml/                           # TensorFlow Models & Training (ML Team)
├── README.md                     # Repository Overview
└── tutorial.md                   # Full Developer Tutorial & Guide
```

Inside `frontend/`, the application follows a **modular, separation-of-concerns** architecture:

```text
┌───────────────────────────────────────────────────────────┐
│              UI Layer (`frontend/app/`)                   │
│   (Auth Routes, Main Tab Screens, Prediction & Crops)     │
└───────────────┬───────────────────────────┬───────────────┘
                │                           │
                ▼                           ▼
┌───────────────────────────────┐ ┌─────────────────────────┐
│ Reusable Components           │ │ Application Stores      │
│ (`frontend/components/`)      │ │ (`frontend/store/`)     │
└───────────────┬───────────────┘ └─────────┬───────────────┘
                │                           │
                ▼                           ▼
┌───────────────────────────────────────────────────────────┐
│              Service Layer (`frontend/services/`)         │
│       (API Client, ML Prediction, Weather, Auth)          │
└───────────────┬───────────────────────────┬───────────────┘
                │                           │
                ▼                           ▼
┌───────────────────────────────┐ ┌─────────────────────────┐
│ Types & Data Models           │ │ Constants & Utilities   │
│ (`frontend/types/`)           │ │ (`constants/`, `utils/`)│
└───────────────────────────────┘ └─────────────────────────┘
```

---

## 3. Complete Folder Structure & Directory Map

```text
├── frontend/                     # React Native Expo Frontend App
│   ├── app/                      # Expo Router file-based routing
│   │   ├── _layout.tsx           # Root Stack navigation layout & providers
│   │   ├── index.tsx             # Entry/Welcome launcher screen
│   │   ├── (auth)/               # Authentication route group
│   │   │   ├── _layout.tsx       # Stack layout for auth screens
│   │   │   ├── login.tsx         # Sign In screen
│   │   │   ├── register.tsx      # Account registration screen
│   │   │   └── forgot-password.tsx# Password reset screen
│   │   ├── (tabs)/               # Primary 4-Tab navigation group
│   │   │   ├── _layout.tsx       # Bottom tab bar layout & icon config
│   │   │   ├── home.tsx          # Home / Dashboard screen
│   │   │   ├── predict.tsx       # Crop Soil input & prediction form
│   │   │   ├── history.tsx       # Historical prediction records
│   │   │   └── profile.tsx       # User profile & account overview
│   │   ├── prediction/           # Crop prediction flows
│   │   │   └── result.tsx        # ML prediction results & recommendations
│   │   ├── crops/                # Crop Library catalog
│   │   │   ├── index.tsx         # Crop list with search & category filter
│   │   │   └── [id].tsx          # Dynamic crop detail view
│   │   └── settings/             # App settings
│   │       └── index.tsx         # Farm preferences & notifications
│   │
│   ├── components/               # Reusable UI component library
│   │   ├── Button.tsx            # Multi-variant action button
│   │   ├── Input.tsx             # Form text input with label & error
│   │   ├── Header.tsx            # Screen navigation header with back button
│   │   ├── Loading.tsx           # Centered loading spinner with message
│   │   ├── ErrorMessage.tsx      # Error alert banner with retry action
│   │   ├── CropCard.tsx          # Botanical info preview card
│   │   ├── PredictionCard.tsx    # History prediction summary card
│   │   ├── WeatherCard.tsx       # Real-time climate snapshot card
│   │   ├── SoilInput.tsx         # Soil nutrient numeric input with units
│   │   └── index.ts              # Barrel export
│   │
│   ├── services/                 # Backend and ML API services
│   │   ├── api.ts                # Central API client helper with auth headers
│   │   ├── authService.ts        # Login, register, logout placeholders
│   │   ├── predictionService.ts  # TensorFlow / ML backend predictor
│   │   ├── cropService.ts        # Crop catalog search and details
│   │   ├── weatherService.ts     # Live weather and forecast integration
│   │   └── index.ts              # Barrel export
│   │
│   ├── store/                    # Global state management
│   │   ├── authStore.ts          # Authentication state & active user
│   │   ├── predictionStore.ts    # Active prediction inputs & result cache
│   │   └── index.ts              # Barrel export
│   │
│   ├── types/                    # TypeScript interfaces and contracts
│   │   ├── auth.ts               # User, AuthState, AuthResponse interfaces
│   │   ├── prediction.ts         # SoilData, PredictionResult interfaces
│   │   ├── crop.ts               # Crop, SoilRequirements, Climate interfaces
│   │   ├── weather.ts            # WeatherData, WeatherForecast interfaces
│   │   └── index.ts              # Barrel export
│   │
│   ├── constants/                # Constants and design system tokens
│   │   ├── colors.ts             # Theme color palette (Green, Soil, Amber)
│   │   ├── config.ts             # App metadata, default limits, center coords
│   │   ├── api.ts                # API base URLs and endpoint map
│   │   └── index.ts              # Barrel export
│   │
│   ├── utils/                    # Shared utility functions
│   │   ├── validation.ts         # Email, password, and soil range validators
│   │   ├── formatters.ts         # Date, temperature, confidence formatters
│   │   ├── storage.ts            # Local storage helper wrapper
│   │   └── index.ts              # Barrel export
│   │
│   ├── app.json                  # Expo application manifest
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript compiler configuration
│   └── .gitignore                # Frontend-specific ignores
│
├── README.md                     # Root repository README
└── tutorial.md                   # Full developer guide & tutorial
```

---

## 4. In-Depth File Explanations

### 4.1 Navigation & Screen Routes (`app/`)

#### `app/_layout.tsx`
* **Purpose**: Root application layout wrapping the entire app in `SafeAreaProvider`, `StatusBar`, and a stack navigator.
* **Key Configuration**: Registers the top-level route groups `(auth)`, `(tabs)`, modal stacks, `prediction/result`, `crops/index`, `crops/[id]`, and `settings/index`.

#### `app/index.tsx`
* **Purpose**: Entry splash and launcher screen.
* **Features**: Displays application branding and direct navigation pathways to either the Authentication flow or Main Tabs.

#### `app/(auth)/_layout.tsx`
* **Purpose**: Stack navigator dedicated to authentication screens. Configures unified header styling and animations.

#### `app/(auth)/login.tsx`
* **Purpose**: Farmer sign-in screen.
* **Features**: Email/Password inputs, "Forgot Password" link, navigation to registration, and integration with `authService.login()`.

#### `app/(auth)/register.tsx`
* **Purpose**: New user onboarding screen.
* **Features**: Full name, email, phone number, and password fields. Submits to `authService.register()`.

#### `app/(auth)/forgot-password.tsx`
* **Purpose**: Password recovery screen with email submission and instructions.

#### `app/(tabs)/_layout.tsx`
* **Purpose**: Defines the 4-tab bottom navigation bar (`Home`, `Predict`, `History`, `Profile`) with active/inactive tint colors and Ionicons.

#### `app/(tabs)/home.tsx`
* **Purpose**: Dashboard landing screen.
* **Features**: Displays real-time weather summary via `<WeatherCard />`, quick links to new predictions, and crop library shortcuts.

#### `app/(tabs)/predict.tsx`
* **Purpose**: Soil parameter collection form for ML crop recommendation.
* **Features**: Pre-configured `<SoilInput />` fields for Nitrogen (N), Phosphorus (P), Potassium (K), soil pH, and rainfall. Navigates to `/prediction/result`.

#### `app/(tabs)/history.tsx`
* **Purpose**: List of past crop predictions made by the user.
* **Features**: Renders a `FlatList` of `<PredictionCard />` items displaying crop matches and timestamps.

#### `app/(tabs)/profile.tsx`
* **Purpose**: Farmer account settings, profile summary, language/theme settings link, and logout button.

#### `app/prediction/result.tsx`
* **Purpose**: Displays the output of the crop prediction model.
* **Features**: Hero card showcasing the primary recommended crop with confidence score, alternative matches, and button to view full botanical guides.

#### `app/crops/index.tsx`
* **Purpose**: Searchable Crop Catalog screen with real-time search filtering.

#### `app/crops/[id].tsx`
* **Purpose**: Dynamic route displaying comprehensive agricultural parameters for a selected crop (ideal pH range, temperature thresholds, growth duration).

#### `app/settings/index.tsx`
* **Purpose**: Toggle weather alerts, push notifications, and view app version info.

---

### 4.2 UI Component Library (`components/`)

| Component | Props | Description |
|---|---|---|
| `Button.tsx` | `title`, `onPress`, `variant` (`primary` \| `secondary` \| `outline` \| `ghost`), `disabled`, `loading` | Styled button supporting loading indicators and disabled states. |
| `Input.tsx` | `label`, `value`, `onChangeText`, `placeholder`, `error`, `secureTextEntry` | Universal form input with validation error display. |
| `SoilInput.tsx` | `label`, `value`, `onChangeText`, `unit`, `min`, `max`, `error` | Specialized numeric input showing acceptable soil nutrient ranges and units (kg/ha, pH, mm). |
| `Header.tsx` | `title`, `subtitle`, `showBackButton`, `onBackPress`, `rightElement` | Consistent top bar with built-in Expo Router back-button support. |
| `WeatherCard.tsx` | `weather?: WeatherData` | Card displaying city name, temperature (°C), humidity (%), and rainfall (mm). |
| `CropCard.tsx` | `crop: Crop`, `onPress` | List item card with botanical leaf badge, category tag, and summary. |
| `PredictionCard.tsx`| `prediction: PredictionHistoryItem`, `onPress` | Historical log item displaying confidence percentage and field location. |
| `Loading.tsx` | `message`, `size`, `color` | Activity spinner for async operations. |
| `ErrorMessage.tsx` | `message`, `onRetry` | Alert component with optional retry callback. |

---

### 4.3 Service Layer (`services/`)

All network requests and ML interactions are isolated in the `services/` directory:

* **`services/api.ts`**: The base `apiClient` helper. Handles automatic JWT token attachment from storage and standardized error catching.
* **`services/authService.ts`**: Placeholder functions: `login()`, `register()`, `forgotPassword()`, `getCurrentUser()`, `logout()`.
* **`services/predictionService.ts`**: Connects to the TensorFlow ML inference backend (`predictCrop()`, `getPredictionHistory()`, `getPredictionById()`).
* **`services/cropService.ts`**: Fetches crop listings, search queries, and details (`getCrops()`, `getCropById()`, `searchCrops()`).
* **`services/weatherService.ts`**: Coordinates weather API requests (`getCurrentWeather()`, `getWeatherForecast()`).

---

### 4.4 State Stores (`store/`)

* **`store/authStore.ts`**: Contains `user`, `token`, `isAuthenticated`, and action handlers for user login sessions.
* **`store/predictionStore.ts`**: Manages current soil inputs (`nitrogen`, `phosphorus`, `potassium`, `ph`, `rainfall`), latest prediction result, and history items.

---

### 4.5 TypeScript Definitions (`types/`)

* **`types/auth.ts`**: Defines `User`, `LoginCredentials`, `RegisterCredentials`, `AuthState`, `AuthResponse`.
* **`types/prediction.ts`**: Defines `SoilData`, `PredictionRequest`, `RecommendedCrop`, `PredictionResult`, `PredictionHistoryItem`.
* **`types/crop.ts`**: Defines `Crop`, `SoilRequirements`, `ClimateRequirements`.
* **`types/weather.ts`**: Defines `Coordinates`, `WeatherData`, `WeatherForecast`, `DailyForecast`.

---

### 4.6 Constants & Tokens (`constants/`)

* **`constants/colors.ts`**: Tailored agricultural palette:
  * Primary: `#2E7D32` (Forest Green), `#E8F5E9` (Subtle Green)
  * Secondary: `#8D6E63` (Soil Brown)
  * Accent: `#F9A825` (Harvest Amber)
* **`constants/config.ts`**: Global settings, default farm coordinates, and default soil limit boundaries.
* **`constants/api.ts`**: Centralized endpoint registry (`API_ENDPOINTS`).

---

### 4.7 Utility Functions (`utils/`)

* **`utils/validation.ts`**: Form validation rules for email formatting, password length, numeric values, and soil nutrient ranges.
* **`utils/formatters.ts`**: Formatters for dates (`formatDate`, `formatDateTime`), confidence scores (`formatConfidence`), and temperature (`formatTemperature`).
* **`utils/storage.ts`**: Storage abstraction for token persistence and caching.

---

## 5. Developer Work Division & Collaboration Guide

To allow team members to develop simultaneously without git merge conflicts:

### Developer 1: Authentication & User Profile
* **Focus Files**:
  * `app/(auth)/login.tsx`
  * `app/(auth)/register.tsx`
  * `app/(auth)/forgot-password.tsx`
  * `app/(tabs)/profile.tsx`
  * `services/authService.ts`
  * `store/authStore.ts`

### Developer 2: Crop Prediction & Machine Learning Integration
* **Focus Files**:
  * `app/(tabs)/home.tsx`
  * `app/(tabs)/predict.tsx`
  * `app/prediction/result.tsx`
  * `components/SoilInput.tsx`
  * `services/predictionService.ts`
  * `store/predictionStore.ts`

### Developer 3: Crop Knowledge Base, History & Weather
* **Focus Files**:
  * `app/(tabs)/history.tsx`
  * `app/crops/index.tsx`
  * `app/crops/[id].tsx`
  * `app/settings/index.tsx`
  * `components/CropCard.tsx`
  * `components/PredictionCard.tsx`
  * `components/WeatherCard.tsx`
  * `services/cropService.ts`
  * `services/weatherService.ts`

---

## 6. Best Practices for Adding New Features

1. **Path Aliasing**: Always use `@/` alias for root imports:
   ```typescript
   import { Button } from '@/components/Button';
   import { colors } from '@/constants/colors';
   import { SoilData } from '@/types/prediction';
   ```
2. **Type Safety**: Avoid using `any`. Reference existing interfaces from `types/` or declare new ones if the backend contract expands.
3. **Route Links**: For dynamic routes, use Expo Router's `router.push('/crops/123' as any)` or typed pathname objects.
4. **Verification**: Always run `npx tsc --noEmit` before committing code to ensure 0 TypeScript compile errors.
