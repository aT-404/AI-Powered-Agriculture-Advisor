import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { authService } from '@/services';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color={colors.primary.DEFAULT} />
          </View>
          <Text style={styles.name}>Demo Farmer</Text>
          <Text style={styles.email}>farmer@cropwise.ai</Text>
          <Text style={styles.roleBadge}>Registered Farmer</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <Button
            title="Farm Settings & Preferences"
            onPress={() => router.push('/settings' as any)}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Browse Crop Library"
            onPress={() => router.push('/crops' as any)}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="ghost"
            style={styles.logoutButton}
            textStyle={{ color: colors.status.error }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
  },
  email: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    fontSize: 12,
    color: colors.primary.DEFAULT,
    backgroundColor: colors.primary.subtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 14,
  },
  actionButton: {
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 4,
  },
});
