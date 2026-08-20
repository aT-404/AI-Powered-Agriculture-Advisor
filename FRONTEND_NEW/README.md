# AI-Powered Agriculture Advisor — Mobile App (Expo SDK 54)

Production-ready React Native mobile application built on **Expo SDK 54** (React Native 0.81, React 19.1) connected to the Django backend.

## Quick Start

### 1. Install Dependencies
```bash
cd FRONTEND_NEW
npm install
```

### 2. Configure Backend API URL
Create `.env` based on `.env.example`:

- **For Android Emulator / Web Browser:**
  ```env
  EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
  ```
- **For Physical Android Phone (via Expo Go App on same Wi-Fi / Hotspot):**
  Find your computer's local Wi-Fi IP address (`ipconfig` on Windows) and set:
  ```env
  EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
  ```

### 3. Start Metro Bundler
```bash
npx expo start
```
Or for network tunnel mode:
```bash
npx expo start --tunnel
```

---

## Tech Stack & Architecture

- **Framework**: Expo SDK 54, React Native 0.81, React 19.1
- **Navigation**: Expo Router v5 (File-based navigation)
- **Networking**: Central Axios client with automated JWT refresh interceptor and error handlers
- **State Management**: React Context (`AuthContext`) with persistent token storage (`@react-native-async-storage/async-storage` / `expo-secure-store`)
- **Type Safety**: Strict TypeScript interfaces derived directly from Django REST serializers
