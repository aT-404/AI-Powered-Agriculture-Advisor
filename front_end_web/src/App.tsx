import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import PredictCrop from './pages/PredictCrop';
import PredictionResult from './pages/PredictionResult';
import PredictionHistory from './pages/PredictionHistory';
import PredictionDetails from './pages/PredictionDetails';
import Crops from './pages/Crops';
import CropDetails from './pages/CropDetails';
import MarketPrices from './pages/MarketPrices';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/predict" element={<PredictCrop />} />
              <Route path="/predictions" element={<PredictionHistory />} />
              <Route path="/predictions/result" element={<PredictionResult />} />
              <Route path="/predictions/:id" element={<PredictionDetails />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/crops/:id" element={<CropDetails />} />
              <Route path="/market" element={<MarketPrices />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
