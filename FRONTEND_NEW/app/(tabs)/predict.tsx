import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../store/AuthContext';
import { predictionService } from '../../services/predictionService';
import { weatherService } from '../../services/weatherService';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { COLORS, SHADOWS } from '../../constants/theme';
import { PredictionHistoryItem } from '../../types/prediction';

export default function PredictScreen() {
  const { user, isAuthenticated } = useAuth();

  // Soil & Climate Form States
  const [nitrogen, setNitrogen] = useState('90');
  const [phosphorus, setPhosphorus] = useState('42');
  const [potassium, setPotassium] = useState('43');
  const [temperature, setTemperature] = useState('25.5');
  const [humidity, setHumidity] = useState('80.0');
  const [ph, setPh] = useState('6.5');
  const [rainfall, setRainfall] = useState('202.0');

  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [result, setResult] = useState<PredictionHistoryItem | null>(null);
  const [standaloneResult, setStandaloneResult] = useState<{
    recommended_crop: string;
    confidence: number;
  } | null>(null);

  // Auto-fill climate values from live weather service
  const handleAutoFillWeather = async () => {
    setWeatherLoading(true);
    try {
      const weather = await weatherService.getWeather({
        location: user?.location || undefined,
        latitude: user?.latitude || undefined,
        longitude: user?.longitude || undefined,
      });
      if (weather && weather.current) {
        setTemperature(weather.current.temperature.toString());
        setHumidity(weather.current.humidity.toString());
        if (weather.forecast && weather.forecast.length > 0) {
          const totalRain = weather.forecast.reduce(
            (acc, curr) => acc + (curr.precipitation || 0),
            0
          );
          setRainfall(Math.max(50, Math.round(totalRain * 30)).toString());
        }
        Alert.alert(
          'Weather Synced',
          `Auto-filled temperature (${weather.current.temperature}°C) and humidity (${weather.current.humidity}%) from ${weather.location.name}.`
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Sync Failed',
        'Could not auto-fill weather metrics. Please enter manually.'
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  const handlePredict = async () => {
    const n = parseFloat(nitrogen);
    const p = parseFloat(phosphorus);
    const k = parseFloat(potassium);
    const temp = parseFloat(temperature);
    const hum = parseFloat(humidity);
    const soilPh = parseFloat(ph);
    const rain = parseFloat(rainfall);

    if (
      isNaN(n) ||
      isNaN(p) ||
      isNaN(k) ||
      isNaN(temp) ||
      isNaN(hum) ||
      isNaN(soilPh) ||
      isNaN(rain)
    ) {
      Alert.alert('Invalid Input', 'Please enter valid numerical values for all fields.');
      return;
    }

    if (soilPh < 0 || soilPh > 14) {
      Alert.alert('Invalid pH', 'Soil pH must be between 0 and 14.');
      return;
    }

    setLoading(true);
    setResult(null);
    setStandaloneResult(null);

    try {
      if (isAuthenticated) {
        // Run full orchestrated prediction pipeline
        const prediction = await predictionService.runCombinedPrediction({
          N: Math.round(n),
          P: Math.round(p),
          K: Math.round(k),
          temperature: temp,
          humidity: hum,
          ph: soilPh,
          rainfall: rain,
          latitude: user?.latitude || null,
          longitude: user?.longitude || null,
        });
        setResult(prediction);
      } else {
        // Run standalone crop recommendation
        const cropRes = await predictionService.predictBestCrop({
          N: Math.round(n),
          P: Math.round(p),
          K: Math.round(k),
          temperature: temp,
          humidity: hum,
          ph: soilPh,
          rainfall: rain,
        });
        setStandaloneResult(cropRes);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Prediction failed. Please verify that the backend is running.';
      Alert.alert('Prediction Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Crop Advisor AI"
        subtitle="Optimal crop selection based on soil nutrients & climate"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Form Card */}
        <View style={[styles.formCard, SHADOWS.sm]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Soil & Climate Parameters</Text>
            <TouchableOpacity
              onPress={handleAutoFillWeather}
              disabled={weatherLoading}
              style={styles.syncBtn}
            >
              <Ionicons
                name="cloud-download-outline"
                size={14}
                color={COLORS.secondary}
              />
              <Text style={styles.syncBtnText}>
                {weatherLoading ? 'Syncing...' : 'Sync Weather'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Soil Nutrients (NPK) */}
          <Text style={styles.groupHeading}>Soil Macro-Nutrients</Text>
          <View style={styles.row}>
            <Input
              label="Nitrogen (N)"
              placeholder="90"
              value={nitrogen}
              onChangeText={setNitrogen}
              keyboardType="numeric"
              unit="mg/kg"
              containerStyle={{ flex: 1, marginRight: 6 }}
            />
            <Input
              label="Phosphorus (P)"
              placeholder="42"
              value={phosphorus}
              onChangeText={setPhosphorus}
              keyboardType="numeric"
              unit="mg/kg"
              containerStyle={{ flex: 1, marginHorizontal: 3 }}
            />
            <Input
              label="Potassium (K)"
              placeholder="43"
              value={potassium}
              onChangeText={setPotassium}
              keyboardType="numeric"
              unit="mg/kg"
              containerStyle={{ flex: 1, marginLeft: 6 }}
            />
          </View>

          {/* Soil pH */}
          <Input
            label="Soil Acidity / Alkalinity (pH)"
            placeholder="6.5"
            value={ph}
            onChangeText={setPh}
            keyboardType="numeric"
            unit="pH scale (0-14)"
          />

          {/* Climate Parameters */}
          <Text style={styles.groupHeading}>Climate Conditions</Text>
          <View style={styles.row}>
            <Input
              label="Temperature"
              placeholder="25.5"
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="numeric"
              unit="°C"
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="Relative Humidity"
              placeholder="80"
              value={humidity}
              onChangeText={setHumidity}
              keyboardType="numeric"
              unit="%"
              containerStyle={{ flex: 1, marginLeft: 8 }}
            />
          </View>

          <Input
            label="Annual / Seasonal Rainfall"
            placeholder="202.0"
            value={rainfall}
            onChangeText={setRainfall}
            keyboardType="numeric"
            unit="mm"
          />

          <Button
            title={loading ? 'Analyzing with AI Model...' : 'Recommend Best Crop'}
            onPress={handlePredict}
            loading={loading}
            icon={
              <Ionicons
                name="sparkles"
                size={18}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
            }
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Prediction Results Display */}
        {result && (
          <View style={[styles.resultCard, SHADOWS.md]}>
            <View style={styles.resultBadge}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              <Text style={styles.resultBadgeText}>AI Recommendation Verified</Text>
            </View>

            <Text style={styles.cropTitle}>{result.crop_prediction.crop}</Text>
            <Text style={styles.cropConfidence}>
              Confidence Score:{' '}
              {Math.round(
                result.crop_prediction.confidence > 1
                  ? result.crop_prediction.confidence
                  : result.crop_prediction.confidence * 100
              )}
              %
            </Text>

            {/* 3-Column Key Metrics */}
            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Forecasted Yield</Text>
                <Text style={styles.resultValue}>
                  {result.yield_prediction
                    ? `${result.yield_prediction.yield} ${result.yield_prediction.unit}`
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Mandi Rate</Text>
                <Text style={styles.resultValue}>
                  {result.market ? `₹${result.market.modal_price} / Qtl` : 'N/A'}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Expected Revenue</Text>
                <Text
                  style={[
                    styles.resultValue,
                    { color: COLORS.primaryDark, fontWeight: '800' },
                  ]}
                >
                  {result.financial_estimate
                    ? `₹${Math.round(
                        result.financial_estimate.expected_revenue
                      ).toLocaleString()}`
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {result.market && (
              <View style={styles.marketNotice}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={COLORS.textMuted}
                />
                <Text style={styles.marketNoticeText}>
                  Market data referenced from {result.market.market} Mandi (
                  {result.market.district}, {result.market.state}).
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Standalone Crop Result (When unauthenticated) */}
        {standaloneResult && (
          <View style={[styles.resultCard, SHADOWS.md]}>
            <View style={styles.resultBadge}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              <Text style={styles.resultBadgeText}>Optimal Crop Match</Text>
            </View>

            <Text style={styles.cropTitle}>
              {standaloneResult.recommended_crop}
            </Text>
            <Text style={styles.cropConfidence}>
              Confidence Score:{' '}
              {Math.round(
                standaloneResult.confidence > 1
                  ? standaloneResult.confidence
                  : standaloneResult.confidence * 100
              )}
              %
            </Text>
          </View>
        )}
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
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  groupHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    marginBottom: 30,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  cropTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text,
  },
  cropConfidence: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  resultGrid: {
    width: '100%',
    backgroundColor: COLORS.borderLight,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  marketNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 10,
  },
  marketNoticeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
