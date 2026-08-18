import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { SoilInput } from '@/components/SoilInput';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { useTheme } from '@/store/ThemeContext';

import { predictCrop } from '@/services/predictionService';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function PredictScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();

  // Soil & Climate parameters
  const [nitrogen, setNitrogen] = useState('90');
  const [phosphorus, setPhosphorus] = useState('42');
  const [potassium, setPotassium] = useState('43');
  const [ph, setPh] = useState('6.5');
  const [temperature, setTemperature] = useState('25.5');
  const [humidity, setHumidity] = useState('80');
  const [rainfall, setRainfall] = useState('202');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await predictCrop({
        soil: {
          nitrogen: parseFloat(nitrogen) || 0,
          phosphorus: parseFloat(phosphorus) || 0,
          potassium: parseFloat(potassium) || 0,
          ph: parseFloat(ph) || 6.5,
          temperature: parseFloat(temperature) || 25.5,
          humidity: parseFloat(humidity) || 80.0,
          rainfall: parseFloat(rainfall) || 202.0,
        },
      });

      router.push({
        pathname: '/prediction/result',
        params: { data: JSON.stringify(result) },
      } as any);
    } catch (err: any) {
      console.error('[PredictScreen] Prediction failed:', err);
      setError(err?.message || 'Failed to connect to ML prediction API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <AnimatedCard delay={60}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconBadge, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="leaf" size={22} color={colors.primary.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: activeColors.textPrimary }]}>AI Crop Advisor</Text>
                <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
                  Find the best crop for your soil & climate
                </Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Group 1: 🌱 Soil Nutrients */}
        <AnimatedCard delay={120}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="nutrition-outline" size={18} color={colors.primary.DEFAULT} />
              </View>
              <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>🌱 Soil Nutrients</Text>
            </View>

            <SoilInput
              label="Nitrogen (N)"
              value={nitrogen}
              onChangeText={setNitrogen}
              unit={APP_CONFIG.defaultSoilLimits.nitrogen.unit}
              min={APP_CONFIG.defaultSoilLimits.nitrogen.min}
              max={APP_CONFIG.defaultSoilLimits.nitrogen.max}
              icon="flask-outline"
            />

            <SoilInput
              label="Phosphorus (P)"
              value={phosphorus}
              onChangeText={setPhosphorus}
              unit={APP_CONFIG.defaultSoilLimits.phosphorus.unit}
              min={APP_CONFIG.defaultSoilLimits.phosphorus.min}
              max={APP_CONFIG.defaultSoilLimits.phosphorus.max}
              icon="color-filter-outline"
            />

            <SoilInput
              label="Potassium (K)"
              value={potassium}
              onChangeText={setPotassium}
              unit={APP_CONFIG.defaultSoilLimits.potassium.unit}
              min={APP_CONFIG.defaultSoilLimits.potassium.min}
              max={APP_CONFIG.defaultSoilLimits.potassium.max}
              icon="sparkles-outline"
            />
          </View>
        </AnimatedCard>

        {/* Group 2: 🧪 Soil pH & Chemistry */}
        <AnimatedCard delay={180}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: colors.accent.light }]}>
                <Ionicons name="options-outline" size={18} color={colors.accent.dark} />
              </View>
              <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>🧪 Soil pH Level</Text>
            </View>

            <SoilInput
              label="Soil pH"
              value={ph}
              onChangeText={setPh}
              unit={APP_CONFIG.defaultSoilLimits.ph.unit}
              min={APP_CONFIG.defaultSoilLimits.ph.min}
              max={APP_CONFIG.defaultSoilLimits.ph.max}
              icon="speedometer-outline"
            />
          </View>
        </AnimatedCard>

        {/* Group 3: 🌦️ Climate Parameters */}
        <AnimatedCard delay={240}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="partly-sunny-outline" size={18} color="#0288D1" />
              </View>
              <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>🌦️ Climate Parameters</Text>
            </View>

            <SoilInput
              label="Temperature"
              value={temperature}
              onChangeText={setTemperature}
              unit="°C"
              min={10}
              max={50}
              icon="thermometer-outline"
            />

            <SoilInput
              label="Humidity"
              value={humidity}
              onChangeText={setHumidity}
              unit="%"
              min={20}
              max={100}
              icon="water-outline"
            />

            <SoilInput
              label="Rainfall"
              value={rainfall}
              onChangeText={setRainfall}
              unit={APP_CONFIG.defaultSoilLimits.rainfall.unit}
              min={APP_CONFIG.defaultSoilLimits.rainfall.min}
              max={APP_CONFIG.defaultSoilLimits.rainfall.max}
              icon="rainy-outline"
            />
          </View>
        </AnimatedCard>

        {error ? (
          <AnimatedCard delay={280} style={{ marginBottom: 16 }}>
            <ErrorMessage message={error} onRetry={handlePredict} />
          </AnimatedCard>
        ) : null}

        {/* Action button */}
        <AnimatedCard delay={300} style={{ marginBottom: 28 }}>
          <Button
            title={loading ? 'Predicting...' : 'Predict Best Crop'}
            onPress={handlePredict}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          />
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  header: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
  },
});
