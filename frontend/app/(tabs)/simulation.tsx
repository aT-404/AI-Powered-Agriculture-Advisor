import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/store/ThemeContext';
import { colors } from '@/constants/colors';
import { Header } from '@/components/Header';
import { YieldResultCard } from '@/components/YieldResultCard';
import { predictCropYield } from '@/services/predictionService';
import { YieldPredictionRequest, YieldPredictionResult } from '@/types/prediction';

export default function SimulationScreen() {
  const { activeColors } = useTheme();
  
  const [formData, setFormData] = useState<YieldPredictionRequest>({
    N: 80,
    P: 40,
    K: 45,
    Soil_pH: 6.5,
    Soil_Moisture: 35,
    Soil_Type: 'Loamy',
    Organic_Carbon: 1.8,
    Temperature: 27,
    Humidity: 75,
    Rainfall: 900,
    Sunlight_Hours: 8,
    Wind_Speed: 12,
    Region: 'South',
    Altitude: 100,
    Season: 'Kharif',
    Crop_Type: 'Rice',
    Irrigation_Type: 'Drip',
    Fertilizer_Used: 'Yes',
    Pesticide_Used: 'No',
  });

  const [result, setResult] = useState<YieldPredictionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Debounce API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      runSimulation();
    }, 800); // 800ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [formData]);

  const runSimulation = async () => {
    try {
      setIsSimulating(true);
      const prediction = await predictCropYield(formData);
      setResult(prediction);
    } catch (error: any) {
      console.warn("Simulation error:", error.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSliderChange = (field: keyof YieldPredictionRequest, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderSlider = (label: string, field: keyof YieldPredictionRequest, min: number, max: number, step: number) => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={[styles.sliderLabel, { color: activeColors.textPrimary }]}>{label}</Text>
        <Text style={[styles.sliderValue, { color: colors.primary.DEFAULT }]}>{formData[field]}</Text>
      </View>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={Number(formData[field])}
        onValueChange={(val: number) => handleSliderChange(field, val)}
        minimumTrackTintColor={colors.primary.DEFAULT}
        maximumTrackTintColor={activeColors.border}
        thumbTintColor={colors.primary.DEFAULT}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <Header title="Interactive Simulation" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: activeColors.textSecondary }]}>
          Adjust soil nutrients and environmental factors to see real-time impact on your projected yield.
        </Text>
        
        <View style={styles.resultWrapper}>
          {isSimulating && !result && <Text style={{ color: activeColors.textSecondary, textAlign: 'center' }}>Simulating...</Text>}
          {result && (
            <View style={[isSimulating && { opacity: 0.5 }]}>
              <YieldResultCard prediction={result} />
            </View>
          )}
        </View>

        <View style={[styles.controlsCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Soil Nutrients</Text>
          {renderSlider('Nitrogen (N)', 'N', 0, 200, 1)}
          {renderSlider('Phosphorus (P)', 'P', 0, 100, 1)}
          {renderSlider('Potassium (K)', 'K', 0, 100, 1)}
          {renderSlider('Soil Moisture (%)', 'Soil_Moisture', 0, 100, 1)}
          
          <View style={styles.divider} />
          
          <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Climate</Text>
          {renderSlider('Rainfall (mm)', 'Rainfall', 0, 3000, 10)}
          {renderSlider('Temperature (°C)', 'Temperature', 10, 50, 1)}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  resultWrapper: {
    minHeight: 280,
    marginBottom: 20,
    justifyContent: 'center',
  },
  controlsCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
