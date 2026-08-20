import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, MapPin, Lock, Save, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

export const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    latitude: '',
    longitude: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        location: user.location || '',
        latitude: user.latitude != null ? String(user.latitude) : '',
        longitude: user.longitude != null ? String(user.longitude) : '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone,
        location: profileForm.location,
        latitude: profileForm.latitude ? parseFloat(profileForm.latitude) : null,
        longitude: profileForm.longitude ? parseFloat(profileForm.longitude) : null,
      });
      setProfileSuccess('Profile details updated successfully.');
    } catch (err: unknown) {
      console.error('Failed to update profile:', err);
      setProfileError('Failed to update profile details.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.old_password || !passwordForm.new_password) {
      setPasswordError('Please provide both current and new password.');
      return;
    }

    setChangingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      const res = await authService.changePassword(passwordForm);
      setPasswordSuccess(res.detail || 'Password updated successfully.');
      setPasswordForm({ old_password: '', new_password: '' });
    } catch (err: unknown) {
      console.error('Failed to change password:', err);
      const resData = (err as { response?: { data?: { old_password?: string[]; new_password?: string[]; detail?: string } } })?.response?.data;
      if (resData?.old_password?.[0]) {
        setPasswordError(`Current password: ${resData.old_password[0]}`);
      } else if (resData?.new_password?.[0]) {
        setPasswordError(`New password: ${resData.new_password[0]}`);
      } else if (resData?.detail) {
        setPasswordError(resData.detail);
      } else {
        setPasswordError('Failed to change password. Ensure new password is at least 8 chars with 1 letter & 1 digit.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-agri-100 border-2 border-agri-500 text-agri-800 flex items-center justify-center font-black text-2xl">
            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-xs text-gray-500 flex items-center mt-0.5">
              <Mail className="w-3.5 h-3.5 mr-1" />
              {user?.email}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4 text-rose-600" />}
          className="border-rose-200 text-rose-700 hover:bg-rose-50"
        >
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Update Personal Info Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center">
            <UserIcon className="w-4 h-4 mr-2 text-agri-600" />
            Personal Profile & Location Details
          </h2>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              {profileSuccess}
            </div>
          )}

          {profileError && <ErrorMessage message={profileError} />}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                value={profileForm.first_name}
                onChange={handleProfileChange}
                required
              />
              <Input
                label="Last Name"
                name="last_name"
                value={profileForm.last_name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <Input
              label="Email Address (Read-only)"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be modified as it serves as primary account ID."
            />

            <Input
              label="Phone Number"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Farm Location / Address"
              name="location"
              placeholder="e.g. Ernakulam, Kerala"
              value={profileForm.location}
              onChange={handleProfileChange}
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="0.0001"
                name="latitude"
                value={profileForm.latitude}
                onChange={handleProfileChange}
              />
              <Input
                label="Longitude"
                type="number"
                step="0.0001"
                name="longitude"
                value={profileForm.longitude}
                onChange={handleProfileChange}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={savingProfile}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Security / Change Password */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center">
            <Lock className="w-4 h-4 mr-2 text-agri-600" />
            Security & Password
          </h2>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              {passwordSuccess}
            </div>
          )}

          {passwordError && <ErrorMessage message={passwordError} />}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              name="old_password"
              placeholder="••••••••"
              value={passwordForm.old_password}
              onChange={handlePasswordChange}
              required
            />

            <Input
              label="New Password"
              type="password"
              name="new_password"
              placeholder="Min 8 characters"
              value={passwordForm.new_password}
              onChange={handlePasswordChange}
              helperText="Min 8 chars, 1 letter & 1 digit"
              required
            />

            <Button
              type="submit"
              variant="outline"
              className="w-full"
              isLoading={changingPassword}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
