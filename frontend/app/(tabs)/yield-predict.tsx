import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { YieldResultCard } from '@/components/YieldResultCard';
import { Loading } from '@/components/Loading';

import { predictCropYield } from '@/services/predictionService';
import { YieldPredictionRequest, YieldPredictionResult } from '@/types/prediction';

export default function YieldPredictScreen() {
  const router = useRouter();

  // Force Light Theme Constants for Readability
  const pageBg = colors.neutral.background; // #F8FAF8
  const cardBg = colors.neutral.white;      // #FFFFFF
  const textPrimary = colors.neutral.textPrimary; // #1E293B
  const textSecondary = colors.neutral.textSecondary; // #64748B
  const borderColor = colors.neutral.border; // #E0E6E0

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<YieldPredictionResult | null>(null);

  // Form State
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

  const handleUpdate = (field: keyof YieldPredictionRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      const prediction = await predictCropYield(formData);
      setResult(prediction);
    } catch (error: any) {
      Alert.alert(
        'Prediction Error',
        error.message || 'An error occurred while calculating the yield. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    return (
      <View style={styles.resultContainer}>
        <YieldResultCard 
          prediction={result} 
          style={{ backgroundColor: cardBg, borderColor: borderColor }}
          forceLight={true} 
        />
        <Button
          title="New Prediction"
          onPress={() => setResult(null)}
          variant="outline"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  };

  const renderForm = () => {
    if (result) return null;
    
    return (
      <View style={styles.formContainer}>
        
        {/* Soil Characteristics Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="leaf-outline" size={24} color={colors.primary.DEFAULT} style={styles.cardIcon} />
            <View style={styles.cardHeaderTextContainer}>
              <Text style={[styles.cardTitle, { color: textPrimary }]}>Soil Characteristics</Text>
              <Text style={[styles.cardSubtitle, { color: textSecondary }]}>Enter the nutrient and moisture conditions of your field.</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input label="Nitrogen (N) kg/ha" value={String(formData.N)} onChangeText={(t) => handleUpdate('N', Number(t))} keyboardType="numeric" />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input label="Phosphorus (P) kg/ha" value={String(formData.P)} onChangeText={(t) => handleUpdate('P', Number(t))} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input label="Potassium (K) kg/ha" value={String(formData.K)} onChangeText={(t) => handleUpdate('K', Number(t))} keyboardType="numeric" />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input label="pH Level" value={String(formData.Soil_pH)} onChangeText={(t) => handleUpdate('Soil_pH', Number(t))} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input label="Moisture (%)" value={String(formData.Soil_Moisture)} onChangeText={(t) => handleUpdate('Soil_Moisture', Number(t))} keyboardType="numeric" />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input label="Organic Carbon (%)" value={String(formData.Organic_Carbon)} onChangeText={(t) => handleUpdate('Organic_Carbon', Number(t))} keyboardType="numeric" />
            </View>
          </View>
          <Input label="Soil Type" value={formData.Soil_Type} onChangeText={(t) => handleUpdate('Soil_Type', t)} placeholder="e.g. Loamy, Sandy, Clay" />
        </View>

        {/* Climate & Geography Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="partly-sunny-outline" size={24} color={colors.accent.dark} style={styles.cardIcon} />
            <View style={styles.cardHeaderTextContainer}>
              <Text style={[styles.cardTitle, { color: textPrimary }]}>Climate & Geography</Text>
              <Text style={[styles.cardSubtitle, { color: textSecondary }]}>Provide the environmental and regional conditions.</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input label="Temperature (°C)" value={String(formData.Temperature)} onChangeText={(t) => handleUpdate('Temperature', Number(t))} keyboardType="numeric" />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input label="Humidity (%)" value={String(formData.Humidity)} onChangeText={(t) => handleUpdate('Humidity', Number(t))} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input label="Rainfall (mm)" value={String(formData.Rainfall)} onChangeText={(t) => handleUpdate('Rainfall', Number(t))} keyboardType="numeric" />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input label="Sunlight (Hours)" value={String(formData.Sunlight_Hours)} onChangeText={(t) => handleUpdate('Sunlight_Hours', Number(t))} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input label="Wind Speed (km/h)" value={String(formData.Wind_Speed)} onChangeText={(t) => handleUpdate('Wind_Speed', Number(t))} keyboardType="numeric" />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input label="Altitude (m)" value={String(formData.Altitude)} onChangeText={(t) => handleUpdate('Altitude', Number(t))} keyboardType="numeric" />
            </View>
          </View>
          <Input label="Region" value={formData.Region} onChangeText={(t) => handleUpdate('Region', t)} placeholder="e.g. South, North, East" />
        </View>

        {/* Farm Management Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="water-outline" size={24} color="#0288D1" style={styles.cardIcon} />
            <View style={styles.cardHeaderTextContainer}>
              <Text style={[styles.cardTitle, { color: textPrimary }]}>Farm Management</Text>
              <Text style={[styles.cardSubtitle, { color: textSecondary }]}>Enter the crop and management practices used.</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input label="Crop Type" value={formData.Crop_Type} onChangeText={(t) => handleUpdate('Crop_Type', t)} placeholder="e.g. Rice, Wheat" />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input label="Season" value={formData.Season} onChangeText={(t) => handleUpdate('Season', t)} placeholder="e.g. Kharif, Rabi" />
            </View>
          </View>
          <Input label="Irrigation Type" value={formData.Irrigation_Type} onChangeText={(t) => handleUpdate('Irrigation_Type', t)} placeholder="e.g. Drip, Sprinkler, Rainfed" />
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input label="Fertilizer Used?" value={formData.Fertilizer_Used} onChangeText={(t) => handleUpdate('Fertilizer_Used', t)} placeholder="Yes / No" />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Input label="Pesticide Used?" value={formData.Pesticide_Used} onChangeText={(t) => handleUpdate('Pesticide_Used', t)} placeholder="Yes / No" />
            </View>
          </View>
        </View>

        <View style={styles.submitContainer}>
          <Button
            title="🌱 Predict Crop Yield"
            onPress={handlePredict}
            style={{ backgroundColor: colors.primary.DEFAULT }}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: pageBg }]}>
      {/* Custom light-forced header */}
      <View style={[styles.customHeader, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Crop Yield Prediction</Text>
        <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
          Estimate expected yield based on your farm, soil, climate, and management conditions.
        </Text>
      </View>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Centered maximum width container for desktop/tablet support */}
          <View style={styles.centerWrapper}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Loading message="Generating yield prediction..." />
                <Text style={[styles.loadingSubtext, { color: textSecondary }]}>
                  Analyzing 19 environmental and soil parameters through our machine learning model...
                </Text>
              </View>
            ) : (
              <>
                {renderResult()}
                {renderForm()}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // rough safe area
    paddingBottom: 20,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center', // centers the inner wrapper
  },
  centerWrapper: {
    width: '100%',
    maxWidth: 768, // limits width on desktop/tablet for readability
  },
  formContainer: {
    paddingBottom: 20,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  cardHeaderTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0, // input components have their own margin bottom
  },
  flex1: {
    flex: 1,
  },
  submitContainer: {
    marginTop: 8,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingSubtext: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  resultContainer: {
    paddingTop: 10,
    width: '100%',
  }
});
