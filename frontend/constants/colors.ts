/**
 * Color Palette Constants
 * Theme: Dark Green → Emerald Gradient + Pure White System
 * Glassmorphic Translucent Cards & Gradient Accents
 */

export const colors = {
  primary: {
    DEFAULT: '#059669', // Emerald Green
    emerald: '#10B981', // Vibrant Emerald
    darkGreen: '#064E3B', // Rich Deep Dark Green
    light: '#34D399', // Mint Light
    dark: '#047857', // Deep Emerald
    subtle: 'rgba(16, 185, 129, 0.12)',
  },
  primaryCard: {
    background: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.90)',
  },
  secondary: {
    DEFAULT: '#047857',
    light: '#A7F3D0',
    dark: '#022C22',
    subtle: 'rgba(5, 150, 105, 0.10)',
  },
  accent: {
    DEFAULT: '#10B981',
    light: '#6EE7B7',
    dark: '#047857',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0288D1',
  },
  // Light Mode Colors (Crisp White + Emerald & Dark Green Accent)
  light: {
    primary: '#059669',
    primarySubtle: 'rgba(16, 185, 129, 0.12)',
    background: '#F4F9F6',
    card: 'rgba(255, 255, 255, 0.90)',
    border: 'rgba(16, 185, 129, 0.22)',
    textPrimary: '#064E3B',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    statusSuccess: '#10B981',
  },
  neutral: {
    white: '#FFFFFF',
    background: '#F4F9F6',
    card: 'rgba(255, 255, 255, 0.90)',
    border: 'rgba(16, 185, 129, 0.22)',
    textPrimary: '#064E3B',
    textSecondary: '#374151',
    textMuted: '#6B7280',
  },
  // Dark Mode Colors (Deep Midnight Dark Green + Vibrant Emerald Glow)
  dark: {
    primary: '#10B981',
    primarySubtle: 'rgba(16, 185, 129, 0.18)',
    background: '#022C22',
    card: 'rgba(6, 44, 34, 0.80)',
    border: 'rgba(16, 185, 129, 0.35)',
    textPrimary: '#ECFDF5',
    textSecondary: '#A7F3D0',
    textMuted: '#6EE7B7',
    statusSuccess: '#10B981',
  },
  neon: {
    emerald: '#10B981',
    darkGreen: '#064E3B',
    cyan: '#06B6D4',
    darkBg: '#022C22',
  },
};

export default colors;
