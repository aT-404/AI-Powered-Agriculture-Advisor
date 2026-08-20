import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { NutrientGaugeInput } from '@/components/NutrientGaugeInput';
import { YieldResultCard } from '@/components/YieldResultCard';
import { FetchLocationButton } from '@/components/FetchLocationButton';
import { Loading } from '@/components/Loading';
import { predictCropYield } from '@/services/predictionService';
import { YieldPredictionRequest, YieldPredictionResult } from '@/types/prediction';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/store/ThemeContext';
import { UserLocationResult } from '@/utils/location';

export default function YieldPredictScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<YieldPredictionResult | null>(null);

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

  const handleLocationFetched = (loc: UserLocationResult) => {
    if (loc.temperature !== undefined) handleUpdate('Temperature', loc.temperature);
    if (loc.humidity !== undefined) handleUpdate('Humidity', loc.humidity);
    if (loc.rainfall !== undefined) handleUpdate('Rainfall', loc.rainfall * 10);
    if (loc.region) handleUpdate('Region', loc.region);
  };

  const handlePredict = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      const prediction = await predictCropYield(formData);
      setResult(prediction);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Unable to process yield prediction.'
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
          style={{ backgroundColor: activeColors.card, borderColor: activeColors.border }}
        />
        <Button
          title="New Prediction"
          onPress={() => setResult(null)}
          variant="outline"
          style={{ marginTop: 14 }}
        />
      </View>
    );
  };

  const renderOptionSelector = (
    label: string,
    options: string[],
    selected: string,
    onSelect: (opt: string) => void
  ) => (
    <View style={styles.optionGroup}>
      <Text style={[styles.optionLabel, { color: activeColors.textPrimary }]}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.optionChip,
                {
                  backgroundColor: isSelected ? activeColors.primary : activeColors.background,
                  borderColor: isSelected ? activeColors.primary : activeColors.border,
                },
              ]}
              onPress={() => onSelect(opt)}
            >
              <Text
                style={[
                  styles.optionChipText,
                  { color: isSelected ? '#FFF' : activeColors.textPrimary },
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderForm = () => {
    if (result) return null;

    return (
      <View style={styles.formContainer}>
        <FetchLocationButton onLocationFetched={handleLocationFetched} />

        {/* Card 1: Soil Parameters */}
        <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: activeColors.primarySubtle }]}>
              <Ionicons name="flask-outline" size={16} color={activeColors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: activeColors.textPrimary }]}>Soil Parameters</Text>
          </View>

          <NutrientGaugeInput
            label="Nitrogen (N)"
            value={String(formData.N)}
            onChangeText={(t) => handleUpdate('N', Number(t) || 0)}
            min={0}
            max={200}
            unit="kg/ha"
            step={5}
            icon="flask-outline"
            optimalRange={{ min: 40, max: 140 }}
          />

          <NutrientGaugeInput
            label="Phosphorus (P)"
            value={String(formData.P)}
            onChangeText={(t) => handleUpdate('P', Number(t) || 0)}
            min={0}
            max={150}
            unit="kg/ha"
            step={5}
            icon="options-outline"
            optimalRange={{ min: 20, max: 90 }}
          />

          <NutrientGaugeInput
            label="Potassium (K)"
            value={String(formData.K)}
            onChangeText={(t) => handleUpdate('K', Number(t) || 0)}
            min={0}
            max={200}
            unit="kg/ha"
            step={5}
            icon="sparkles-outline"
            optimalRange={{ min: 30, max: 100 }}
          />

          <NutrientGaugeInput
            label="Soil pH"
            value={String(formData.Soil_pH)}
            onChangeText={(t) => handleUpdate('Soil_pH', Number(t) || 6.5)}
            min={3.5}
            max={10.0}
            unit="pH"
            step={0.1}
            icon="speedometer-outline"
            optimalRange={{ min: 6.0, max: 7.5 }}
          />

          <NutrientGaugeInput
            label="Soil Moisture"
            value={String(formData.Soil_Moisture)}
            onChangeText={(t) => handleUpdate('Soil_Moisture', Number(t) || 0)}
            min={0}
            max={100}
            unit="%"
            step={5}
            icon="water-outline"
            optimalRange={{ min: 30, max: 75 }}
          />

          {renderOptionSelector(
            'Soil Type',
            ['Loamy', 'Clay', 'Sandy', 'Silty', 'Black'],
            formData.Soil_Type,
            (opt) => handleUpdate('Soil_Type', opt)
          )}
        </View>

        {/* Card 2: Environment */}
        <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: activeColors.primarySubtle }]}>
              <Ionicons name="partly-sunny-outline" size={16} color={activeColors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: activeColors.textPrimary }]}>Environment</Text>
          </View>

          <NutrientGaugeInput
            label="Temperature"
            value={String(formData.Temperature)}
            onChangeText={(t) => handleUpdate('Temperature', Number(t) || 0)}
            min={10}
            max={50}
            unit="°C"
            step={1}
            icon="thermometer-outline"
            optimalRange={{ min: 20, max: 35 }}
          />

          <NutrientGaugeInput
            label="Rainfall"
            value={String(formData.Rainfall)}
            onChangeText={(t) => handleUpdate('Rainfall', Number(t) || 0)}
            min={0}
            max={3000}
            unit="mm"
            step={50}
            icon="rainy-outline"
            optimalRange={{ min: 500, max: 1800 }}
          />

          <NutrientGaugeInput
            label="Sunlight"
            value={String(formData.Sunlight_Hours)}
            onChangeText={(t) => handleUpdate('Sunlight_Hours', Number(t) || 0)}
            min={1}
            max={16}
            unit="Hours"
            step={1}
            icon="sunny-outline"
            optimalRange={{ min: 6, max: 11 }}
          />

          {renderOptionSelector(
            'Region',
            ['North', 'South', 'East', 'West', 'Central'],
            formData.Region,
            (opt) => handleUpdate('Region', opt)
          )}
        </View>

        {/* Card 3: Crop Management */}
        <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: activeColors.primarySubtle }]}>
              <Ionicons name="construct-outline" size={16} color={activeColors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: activeColors.textPrimary }]}>Crop Management</Text>
          </View>

          <Input
            label="Crop Type"
            value={formData.Crop_Type}
            onChangeText={(t) => handleUpdate('Crop_Type', t)}
            placeholder="e.g. Rice, Wheat"
          />

          {renderOptionSelector(
            'Season',
            ['Kharif', 'Rabi', 'Zaid', 'Whole Year'],
            formData.Season,
            (opt) => handleUpdate('Season', opt)
          )}

          {renderOptionSelector(
            'Irrigation',
            ['Drip', 'Sprinkler', 'Canal', 'Rainfed'],
            formData.Irrigation_Type,
            (opt) => handleUpdate('Irrigation_Type', opt)
          )}

          <View style={styles.row}>
            <View style={styles.flex1}>
              {renderOptionSelector(
                'Fertilizer',
                ['Yes', 'No'],
                formData.Fertilizer_Used,
                (opt) => handleUpdate('Fertilizer_Used', opt)
              )}
            </View>
            <View style={{ width: 12 }} />
            <View style={styles.flex1}>
              {renderOptionSelector(
                'Pesticide',
                ['Yes', 'No'],
                formData.Pesticide_Used,
                (opt) => handleUpdate('Pesticide_Used', opt)
              )}
            </View>
          </View>
        </View>

        <View style={styles.submitContainer}>
          <Button
            title="Calculate Yield"
            onPress={handlePredict}
            style={{ height: 50, borderRadius: 14 }}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <View style={[styles.customHeader, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
        <Text style={[styles.headerTitle, { color: activeColors.textPrimary }]}>Yield Predictor</Text>
        <Text style={[styles.headerSubtitle, { color: activeColors.textSecondary }]}>
          Estimate expected crop yield per hectare
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerWrapper}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Loading message="Calculating yield..." />
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
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
    alignItems: 'center',
  },
  centerWrapper: {
    width: '100%',
    maxWidth: 768,
  },
  formContainer: {
    paddingBottom: 16,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  cardIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  optionGroup: {
    marginVertical: 8,
  },
  optionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionChipText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  submitContainer: {
    marginTop: 4,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultContainer: {
    paddingTop: 8,
    width: '100%',
  },
});
