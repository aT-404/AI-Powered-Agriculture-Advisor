import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { SoilInput } from '@/components/SoilInput';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';

export default function PredictScreen() {
  const router = useRouter();
  const [nitrogen, setNitrogen] = useState('90');
  const [phosphorus, setPhosphorus] = useState('42');
  const [potassium, setPotassium] = useState('43');
  const [ph, setPh] = useState('6.5');
  const [rainfall, setRainfall] = useState('202');

  const handlePredict = () => {
    // Navigate to the prediction result screen
    router.push('/prediction/result');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Crop Prediction</Text>
          <Text style={styles.subtitle}>This is the Crop Prediction screen</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionHeading}>Soil Nutrients & Parameters</Text>

          <SoilInput
            label="Nitrogen (N)"
            value={nitrogen}
            onChangeText={setNitrogen}
            unit={APP_CONFIG.defaultSoilLimits.nitrogen.unit}
            min={APP_CONFIG.defaultSoilLimits.nitrogen.min}
            max={APP_CONFIG.defaultSoilLimits.nitrogen.max}
          />

          <SoilInput
            label="Phosphorus (P)"
            value={phosphorus}
            onChangeText={setPhosphorus}
            unit={APP_CONFIG.defaultSoilLimits.phosphorus.unit}
            min={APP_CONFIG.defaultSoilLimits.phosphorus.min}
            max={APP_CONFIG.defaultSoilLimits.phosphorus.max}
          />

          <SoilInput
            label="Potassium (K)"
            value={potassium}
            onChangeText={setPotassium}
            unit={APP_CONFIG.defaultSoilLimits.potassium.unit}
            min={APP_CONFIG.defaultSoilLimits.potassium.min}
            max={APP_CONFIG.defaultSoilLimits.potassium.max}
          />

          <SoilInput
            label="Soil pH"
            value={ph}
            onChangeText={setPh}
            unit={APP_CONFIG.defaultSoilLimits.ph.unit}
            min={APP_CONFIG.defaultSoilLimits.ph.min}
            max={APP_CONFIG.defaultSoilLimits.ph.max}
          />

          <SoilInput
            label="Rainfall"
            value={rainfall}
            onChangeText={setRainfall}
            unit={APP_CONFIG.defaultSoilLimits.rainfall.unit}
            min={APP_CONFIG.defaultSoilLimits.rainfall.min}
            max={APP_CONFIG.defaultSoilLimits.rainfall.max}
          />

          <Button
            title="Predict Optimal Crop"
            onPress={handlePredict}
            style={styles.submitButton}
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 12,
  },
});
