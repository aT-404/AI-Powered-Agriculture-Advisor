import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function SettingsScreen() {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [latency, setLatency] = useState<number | null>(null);
  const [healthData, setHealthData] = useState<any>(null);

  const testBackendConnection = async () => {
    setHealthStatus('checking');
    const startTime = Date.now();
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.HEALTH}`, {
        timeout: 5000,
      });
      const endTime = Date.now();
      setLatency(endTime - startTime);
      setHealthData(response.data);
      setHealthStatus('online');
    } catch {
      setHealthStatus('offline');
      setLatency(null);
      setHealthData(null);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Settings & Diagnostics"
        subtitle="Network status, server connectivity & application information"
        showBack
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Backend Diagnostic Card */}
        <View style={[styles.card, SHADOWS.sm]}>
          <Text style={styles.sectionHeading}>Backend Connection Diagnostic</Text>

          <View style={styles.statusBanner}>
            {healthStatus === 'checking' ? (
              <ActivityIndicator size="small" color={COLORS.secondary} />
            ) : (
              <Ionicons
                name={
                  healthStatus === 'online'
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={24}
                color={
                  healthStatus === 'online' ? COLORS.primary : COLORS.danger
                }
              />
            )}
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                {healthStatus === 'checking'
                  ? 'Testing API connectivity...'
                  : healthStatus === 'online'
                  ? 'Django Backend Online & Reachable'
                  : 'Backend Unreachable'}
              </Text>
              <Text style={styles.statusSub}>
                {healthStatus === 'online'
                  ? `Response latency: ${latency}ms`
                  : 'Check that python manage.py runserver is running'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Configured API Base URL:</Text>
            <Text style={styles.infoValue}>{API_BASE_URL}</Text>
          </View>

          {healthData && healthData.features && (
            <View style={styles.featuresBox}>
              <Text style={styles.featuresHeading}>Active Backend Features:</Text>
              {healthData.features.map((feat: string, idx: number) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={14} color={COLORS.primary} />
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>
          )}

          <Button
            title="Re-test Server Connection"
            onPress={testBackendConnection}
            variant="outline"
            style={{ marginTop: 14 }}
          />
        </View>

        {/* Physical Device Connection Guide */}
        <View style={[styles.card, SHADOWS.sm]}>
          <Text style={styles.sectionHeading}>Physical Android Phone Setup</Text>
          <Text style={styles.guideParagraph}>
            When scanning the QR code on a physical mobile device via Expo Go:
          </Text>

          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>
              Ensure both your phone and PC are connected to the <Text style={styles.bold}>same Wi-Fi network</Text> or mobile hotspot.
            </Text>
          </View>

          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              Find your computer's local Wi-Fi IP address (<Text style={styles.code}>ipconfig</Text> on Windows) and set <Text style={styles.code}>EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8000</Text> in <Text style={styles.code}>FRONTEND_NEW/.env</Text>.
            </Text>
          </View>

          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>
              If Windows Firewall blocks connections, run <Text style={styles.code}>npx expo start --tunnel</Text> to connect over an internet proxy.
            </Text>
          </View>
        </View>

        {/* App Info Card */}
        <View style={[styles.card, SHADOWS.sm]}>
          <Text style={styles.sectionHeading}>About App</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.infoLabel}>Expo SDK:</Text>
            <Text style={styles.infoValue}>SDK 54</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.infoLabel}>React Native:</Text>
            <Text style={styles.infoValue}>0.81.5</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.infoLabel}>React:</Text>
            <Text style={styles.infoValue}>19.1.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>1.0.0 (Production Build)</Text>
          </View>
        </View>
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
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  infoRow: {
    marginBottom: 10,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  featuresBox: {
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  featuresHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.text,
  },
  guideParagraph: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 10,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: COLORS.borderLight,
    fontSize: 11,
  },
});
