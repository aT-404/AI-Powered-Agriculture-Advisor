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
import { predictionService } from '../../services/predictionService';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { COLORS, SHADOWS } from '../../constants/theme';
import { StandaloneYieldPredictionResponse } from '../../types/prediction';

const COMMON_CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Tomato'];
const SEASONS = ['Kharif', 'Rabi', 'Summer', 'Whole Year', 'Autumn', 'Winter'];

export default function YieldPredictScreen() {
  const [crop, setCrop] = useState('Rice');
  const [cropYear, setCropYear] = useState('2026');
  const [season, setSeason] = useState('Kharif');
  const [state, setState] = useState('Kerala');
  const [area, setArea] = useState('10.0');
  const [annualRainfall, setAnnualRainfall] = useState('1200.0');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StandaloneYieldPredictionResponse | null>(null);

  const handlePredictYield = async () => {
    if (!crop.trim() || !season.trim() || !state.trim()) {
      Alert.alert('Incomplete Form', 'Please specify Crop, Season, and State.');
      return;
    }

    const yearNum = parseInt(cropYear, 10);
    const areaNum = parseFloat(area);
    const rainNum = parseFloat(annualRainfall);

    if (isNaN(yearNum) || isNaN(areaNum) || isNaN(rainNum) || areaNum <= 0) {
      Alert.alert('Invalid Numerical Value', 'Please enter positive values for Year, Area, and Rainfall.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await predictionService.predictCropYield({
        Crop: crop.trim(),
        Crop_Year: yearNum,
        Season: season.trim(),
        State: state.trim(),
        Area: areaNum,
        Annual_Rainfall: rainNum,
      });
      setResult(response);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Yield prediction model inference failed. Please ensure the backend is running.';
      Alert.alert('Yield Prediction Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Yield Predictor AI"
        subtitle="Forecast total production and harvest yield per hectare"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.formCard, SHADOWS.sm]}>
          <Text style={styles.groupHeading}>Agricultural Configuration</Text>

          {/* Quick Crop Selector Chips */}
          <Text style={styles.fieldLabel}>Select Crop</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {COMMON_CROPS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCrop(c)}
                style={[
                  styles.chip,
                  crop.toLowerCase() === c.toLowerCase() && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    crop.toLowerCase() === c.toLowerCase() && styles.chipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            placeholder="Or type custom crop name..."
            value={crop}
            onChangeText={setCrop}
            containerStyle={{ marginBottom: 12 }}
          />

          {/* Season Selector */}
          <Text style={styles.fieldLabel}>Cropping Season</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {SEASONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSeason(s)}
                style={[
                  styles.chip,
                  season.toLowerCase() === s.toLowerCase() && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    season.toLowerCase() === s.toLowerCase() && styles.chipTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <Input
              label="State / Region"
              placeholder="e.g. Karnataka"
              value={state}
              onChangeText={setState}
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="Target Crop Year"
              placeholder="2026"
              value={cropYear}
              onChangeText={setCropYear}
              keyboardType="numeric"
              containerStyle={{ flex: 1, marginLeft: 8 }}
            />
          </View>

          <Text style={styles.groupHeading}>Land & Precipitation</Text>
          <View style={styles.row}>
            <Input
              label="Cultivated Area"
              placeholder="10.0"
              value={area}
              onChangeText={setArea}
              keyboardType="numeric"
              unit="hectares"
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Input
              label="Annual Rainfall"
              placeholder="1200"
              value={annualRainfall}
              onChangeText={setAnnualRainfall}
              keyboardType="numeric"
              unit="mm"
              containerStyle={{ flex: 1, marginLeft: 8 }}
            />
          </View>

          <Button
            title={loading ? 'Computing Yield Prediction...' : 'Forecast Harvest Yield'}
            onPress={handlePredictYield}
            loading={loading}
            icon={<Ionicons name="analytics" size={18} color="#ffffff" style={{ marginRight: 6 }} />}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Prediction Results Display */}
        {result && (
          <View style={[styles.resultCard, SHADOWS.md]}>
            <View style={styles.resultBadge}>
              <Ionicons name="trending-up" size={18} color={COLORS.secondary} />
              <Text style={styles.resultBadgeText}>Yield Estimation</Text>
            </View>

            <Text style={styles.yieldValue}>{result.predicted_yield}</Text>
            <Text style={styles.yieldUnit}>{result.unit}</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Estimated Production</Text>
                <Text style={styles.summaryVal}>
                  {(result.predicted_yield * parseFloat(area || '1')).toFixed(2)} tons
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Land Utilization</Text>
                <Text style={styles.summaryVal}>{area} ha ({crop})</Text>
              </View>
            </View>
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
  groupHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: COLORS.primaryDark,
  },
  row: {
    flexDirection: 'row',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    marginBottom: 30,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  yieldValue: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.text,
  },
  yieldUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.borderLight,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
});
