import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../store/AuthContext';
import { authService } from '../../services/authService';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await authService.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        location: location.trim(),
      });
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your profile details have been saved.');
    } catch (err: any) {
      Alert.alert('Update Failed', 'Could not update profile details.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Required', 'Please enter your current and new passwords.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Weak Password', 'New password must be at least 8 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setShowPasswordSection(false);
      Alert.alert('Success', 'Your password has been changed successfully.');
    } catch (err: any) {
      const msg =
        err?.response?.data?.old_password?.[0] ||
        err?.response?.data?.new_password?.[0] ||
        'Failed to change password. Please verify current password.';
      Alert.alert('Error', msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Farmer Profile" subtitle="Account & preferences" />
        <View style={styles.guestBox}>
          <Ionicons name="person-circle-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.guestTitle}>Guest Mode</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to personalize your farming region, view historical analyses, and manage alerts.
          </Text>
          <Button
            title="Sign In / Register"
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: 18 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Farmer Profile"
        subtitle="Manage your personal details and account security"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(user?.first_name?.[0] || 'F').toUpperCase()}
                {(user?.last_name?.[0] || 'A').toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.phone ? (
                <Text style={styles.userPhone}>{user.phone}</Text>
              ) : null}
            </View>
          </View>

          {!isEditing ? (
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Farm Location:</Text>
                <Text style={styles.infoValue}>
                  {user?.location || 'Not specified'}
                </Text>
              </View>

              <Button
                title="Edit Profile"
                onPress={() => setIsEditing(true)}
                variant="outline"
                style={{ marginTop: 14 }}
              />
            </View>
          ) : (
            <View style={styles.editForm}>
              <Input
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
              <Input
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Farm District / Town"
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Kothamangalam, Kerala"
              />

              <View style={styles.btnRow}>
                <Button
                  title="Cancel"
                  onPress={() => setIsEditing(false)}
                  variant="outline"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Save"
                  onPress={handleSaveProfile}
                  loading={savingProfile}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Security & Password Card */}
        <View style={[styles.card, SHADOWS.sm]}>
          <TouchableOpacity
            onPress={() => setShowPasswordSection(!showPasswordSection)}
            style={styles.securityHeader}
          >
            <View style={styles.securityTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.sectionHeading}>Account Security</Text>
            </View>
            <Ionicons
              name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          {showPasswordSection && (
            <View style={styles.passwordForm}>
              <Input
                label="Current Password"
                placeholder="••••••••"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
              />
              <Input
                label="New Password (min 8 chars)"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <Button
                title="Update Password"
                onPress={handleChangePassword}
                loading={changingPassword}
                variant="secondary"
                style={{ marginTop: 6 }}
              />
            </View>
          )}
        </View>

        {/* Action Links */}
        <View style={[styles.card, SHADOWS.sm]}>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="server-outline" size={20} color={COLORS.text} />
              <Text style={styles.menuText}>API Diagnostics & Server IP</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/crops')}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="book-outline" size={20} color={COLORS.text} />
              <Text style={styles.menuText}>Crop Agronomy Library</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />}
          style={{ marginTop: 10, marginBottom: 30 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  infoGrid: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  editForm: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 14,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  passwordForm: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  guestBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 16,
  },
  guestSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
