# AI-Powered Agriculture Advisor — React Web Application

A modern React web dashboard for the AI-Powered Agriculture Advisor platform. Built with React, TypeScript, Vite, Tailwind CSS, React Router, and Axios. Connects directly to the Django REST Framework backend.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Features
- **JWT Authentication**: Login, Registration, Token Auto-Refresh, Profile Management, Change Password.
- **Crop Prediction Pipeline**: 7-factor soil & climate input form triggering Django ML crop model, yield model, and Agmarknet mandi financial calculation.
- **Prediction History & Details**: Paginated history, search filtering, and comprehensive prediction breakdown.
- **Crop Library**: Scientific crop profiles, optimal pH ranges, rainfall thresholds, and temperature limits.
- **Live Mandi Prices**: Query real-time mandi prices filtered by commodity, state, district, and market.
- **Responsive Layout**: Desktop-first SaaS dashboard with collapsible mobile drawer.
