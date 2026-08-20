import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { NutrientGaugeInput } from '@/components/NutrientGaugeInput';
import { SoilPresetSelector, SoilPreset } from '@/components/SoilPresetSelector';
import { FetchLocationButton } from '@/components/FetchLocationButton';
import { AnimatedCard } from '@/components/AnimatedCard';
import { APP_CONFIG } from '@/constants/config';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/store/ThemeContext';
import { predictCrop } from '@/services/predictionService';
import { ErrorMessage } from '@/components/ErrorMessage';
import { UserLocationResult } from '@/utils/location';

export default function PredictScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();

  const [activePresetId, setActivePresetId] = useState<string | undefined>('fertile-loam');

  const [nitrogen, setNitrogen] = useState('90');
  const [phosphorus, setPhosphorus] = useState('42');
  const [potassium, setPotassium] = useState('43');
  const [ph, setPh] = useState('6.5');
  const [temperature, setTemperature] = useState('25.5');
  const [humidity, setHumidity] = useState('80');
  const [rainfall, setRainfall] = useState('202');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (preset: SoilPreset) => {
    setActivePresetId(preset.id);
    setNitrogen(preset.values.nitrogen);
    setPhosphorus(preset.values.phosphorus);
    setPotassium(preset.values.potassium);
    setPh(preset.values.ph);
    setTemperature(preset.values.temperature);
    setHumidity(preset.values.humidity);
    setRainfall(preset.values.rainfall);
  };

  const handleLocationFetched = (loc: UserLocationResult) => {
    if (loc.temperature !== undefined) setTemperature(loc.temperature.toString());
    if (loc.humidity !== undefined) setHumidity(loc.humidity.toString());
    if (loc.rainfall !== undefined) setRainfall(loc.rainfall.toString());
  };

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
        <AnimatedCard delay={40}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconBadge, { backgroundColor: activeColors.primarySubtle }]}>
                <Ionicons name="leaf-outline" size={22} color={activeColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: activeColors.textPrimary }]}>Crop Advisor</Text>
                <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
                  Select parameters to get optimal crop recommendations
                </Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Location & Presets Row */}
        <AnimatedCard delay={60}>
          <FetchLocationButton onLocationFetched={handleLocationFetched} />
        </AnimatedCard>

        {/* Quick Soil Presets */}
        <AnimatedCard delay={80}>
          <SoilPresetSelector
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
          />
        </AnimatedCard>

        {/* Section 1: Soil Nutrients */}
        <AnimatedCard delay={120}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: activeColors.primarySubtle }]}>
                <Ionicons name="flask-outline" size={16} color={activeColors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Soil Nutrients</Text>
            </View>

            <NutrientGaugeInput
              label="Nitrogen (N)"
              value={nitrogen}
              onChangeText={(t) => { setActivePresetId(undefined); setNitrogen(t); }}
              min={APP_CONFIG.defaultSoilLimits.nitrogen.min}
              max={APP_CONFIG.defaultSoilLimits.nitrogen.max}
              unit={APP_CONFIG.defaultSoilLimits.nitrogen.unit}
              step={5}
              icon="flask-outline"
              optimalRange={{ min: 40, max: 120 }}
            />

            <NutrientGaugeInput
              label="Phosphorus (P)"
              value={phosphorus}
              onChangeText={(t) => { setActivePresetId(undefined); setPhosphorus(t); }}
              min={APP_CONFIG.defaultSoilLimits.phosphorus.min}
              max={APP_CONFIG.defaultSoilLimits.phosphorus.max}
              unit={APP_CONFIG.defaultSoilLimits.phosphorus.unit}
              step={2}
              icon="options-outline"
              optimalRange={{ min: 25, max: 80 }}
            />

            <NutrientGaugeInput
              label="Potassium (K)"
              value={potassium}
              onChangeText={(t) => { setActivePresetId(undefined); setPotassium(t); }}
              min={APP_CONFIG.defaultSoilLimits.potassium.min}
              max={APP_CONFIG.defaultSoilLimits.potassium.max}
              unit={APP_CONFIG.defaultSoilLimits.potassium.unit}
              step={2}
              icon="sparkles-outline"
              optimalRange={{ min: 25, max: 85 }}
            />
          </View>
        </AnimatedCard>

        {/* Section 2: Soil Chemistry */}
        <AnimatedCard delay={160}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: activeColors.primarySubtle }]}>
                <Ionicons name="speedometer-outline" size={16} color={activeColors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Soil pH</Text>
            </View>

            <NutrientGaugeInput
              label="pH Level"
              value={ph}
              onChangeText={(t) => { setActivePresetId(undefined); setPh(t); }}
              min={APP_CONFIG.defaultSoilLimits.ph.min}
              max={APP_CONFIG.defaultSoilLimits.ph.max}
              unit={APP_CONFIG.defaultSoilLimits.ph.unit}
              step={0.1}
              icon="speedometer-outline"
              optimalRange={{ min: 6.0, max: 7.5 }}
            />
          </View>
        </AnimatedCard>

        {/* Section 3: Weather */}
        <AnimatedCard delay={200}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: activeColors.primarySubtle }]}>
                <Ionicons name="partly-sunny-outline" size={16} color={activeColors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Climate</Text>
            </View>

            <NutrientGaugeInput
              label="Temperature"
              value={temperature}
              onChangeText={(t) => { setActivePresetId(undefined); setTemperature(t); }}
              min={10}
              max={50}
              unit="°C"
              step={0.5}
              icon="thermometer-outline"
              optimalRange={{ min: 20, max: 32 }}
            />

            <NutrientGaugeInput
              label="Humidity"
              value={humidity}
              onChangeText={(t) => { setActivePresetId(undefined); setHumidity(t); }}
              min={20}
              max={100}
              unit="%"
              step={5}
              icon="water-outline"
              optimalRange={{ min: 50, max: 85 }}
            />

            <NutrientGaugeInput
              label="Rainfall"
              value={rainfall}
              onChangeText={(t) => { setActivePresetId(undefined); setRainfall(t); }}
              min={APP_CONFIG.defaultSoilLimits.rainfall.min}
              max={APP_CONFIG.defaultSoilLimits.rainfall.max}
              unit={APP_CONFIG.defaultSoilLimits.rainfall.unit}
              step={10}
              icon="rainy-outline"
              optimalRange={{ min: 80, max: 300 }}
            />
          </View>
        </AnimatedCard>

        {error ? (
          <AnimatedCard delay={240} style={{ marginBottom: 16 }}>
            <ErrorMessage message={error} onRetry={handlePredict} />
          </AnimatedCard>
        ) : null}

        {/* Action Button */}
        <AnimatedCard delay={260} style={{ marginBottom: 24 }}>
          <Button
            title={loading ? 'Analyzing...' : 'Recommend Crop'}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  submitButton: {
    height: 50,
    borderRadius: 14,
  },
});
