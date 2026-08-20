import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Globe, Bell, CheckCircle2 } from 'lucide-react';
import Select from '../components/Select';
import Button from '../components/Button';

export const Settings: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveFrontendSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pref_theme', theme);
    localStorage.setItem('pref_lang', language);
    localStorage.setItem('pref_unit', unitSystem);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-agri-100 rounded-xl text-agri-700">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Preferences</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize website presentation options and regional display preferences.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          Frontend display settings saved successfully to browser local storage.
        </div>
      )}

      {/* Frontend Settings Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center">
            <Sliders className="w-4 h-4 mr-2 text-agri-600" />
            Frontend Display & Localization (Client-side Preferences)
          </h2>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
            Frontend Only
          </span>
        </div>

        <form onSubmit={handleSaveFrontendSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Interface Theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              options={[
                { value: 'light', label: 'Agricultural Light (Default)' },
                { value: 'dark', label: 'Dark Mode (Experimental)' },
              ]}
              helperText="Color palette theme for application dashboard."
            />

            <Select
              label="Language Preference"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={[
                { value: 'en', label: 'English (US / IN)' },
                { value: 'hi', label: 'Hindi (हिंदी)' },
                { value: 'ml', label: 'Malayalam (മലയാളം)' },
              ]}
              helperText="Display interface language."
            />

            <Select
              label="Unit System"
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value)}
              options={[
                { value: 'metric', label: 'Metric (Quintal, Hectare, kg)' },
                { value: 'imperial', label: 'Imperial (Acre, lbs)' },
              ]}
              helperText="Default measurement units."
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary">
              Save Preferences
            </Button>
          </div>
        </form>
      </div>

      {/* Backend Integration Note */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center">
            <Bell className="w-4 h-4 mr-2 text-agri-600" />
            Backend Notification & Price Alert Settings
          </h2>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
            Django API Synced
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Commodity price threshold alerts are configured and evaluated directly on the Django backend via <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">/api/alerts/</code>. When a mandi price reaches your target condition, the backend evaluates alerts and stores notifications.
        </p>
      </div>
    </div>
  );
};

export default Settings;
