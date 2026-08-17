import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={48} color={colors.primary.DEFAULT} />
          </View>
          <Text style={styles.title}>{APP_CONFIG.appName}</Text>
          <Text style={styles.subtitle}>{APP_CONFIG.appTagline}</Text>
          <Text style={styles.version}>v{APP_CONFIG.version}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Navigation Entry</Text>
          <Button
            title="Go to App (Main Tabs)"
            onPress={() => router.push('/(tabs)/home' as any)}
            style={styles.button}
          />
          <Button
            title="Go to Authentication"
            onPress={() => router.push('/(auth)/login' as any)}
            variant="outline"
            style={styles.button}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Route Links (Developer Preview)</Text>
          <Button
            title="🌱 Crop Library (/crops)"
            onPress={() => router.push('/crops' as any)}
            variant="ghost"
            style={styles.linkButton}
          />
          <Button
            title="⚙️ Settings (/settings)"
            onPress={() => router.push('/settings' as any)}
            variant="ghost"
            style={styles.linkButton}
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 20,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  version: {
    fontSize: 12,
    color: colors.neutral.textMuted,
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 14,
  },
  button: {
    marginBottom: 12,
  },
  linkButton: {
    paddingVertical: 10,
    justifyContent: 'flex-start',
  },
});
