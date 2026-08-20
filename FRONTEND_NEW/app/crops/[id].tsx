import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cropService } from '../../services/cropService';
import { Crop } from '../../types/crop';
import { Header } from '../../components/Header';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function CropDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrop = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cropService.getCropDetails(id);
      setCrop(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || 'Failed to load crop agronomy profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrop();
  }, [id]);

  if (loading) {
    return <Loading message="Loading crop guide..." />;
  }

  if (error || !crop) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Crop Details" showBack />
        <ErrorMessage
          message={error || 'Crop not found.'}
          onRetry={fetchCrop}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={crop.name}
        subtitle={crop.scientific_name || 'Agronomic Profile'}
        showBack
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Crop Hero */}
        <View style={[styles.heroCard, SHADOWS.sm]}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.cropName}>{crop.name}</Text>
          {crop.scientific_name ? (
            <Text style={styles.scientific}>{crop.scientific_name}</Text>
          ) : null}
          <Text style={styles.description}>{crop.description}</Text>
        </View>

        {/* Ideal Growth Requirements */}
        <View style={[styles.card, SHADOWS.sm]}>
          <Text style={styles.sectionHeading}>Optimal Growing Conditions</Text>

          {/* Temperature */}
          <View style={styles.reqRow}>
            <View
              style={[
                styles.reqIconCircle,
                { backgroundColor: COLORS.primaryLight },
              ]}
            >
              <Ionicons
                name="thermometer"
                size={22}
                color={COLORS.primaryDark}
              />
            </View>
            <View style={styles.reqTextContainer}>
              <Text style={styles.reqTitle}>Temperature Range</Text>
              <Text style={styles.reqValue}>
                {crop.ideal_temperature_min}°C – {crop.ideal_temperature_max}°C
              </Text>
              <Text style={styles.reqHint}>
                Optimal ambient temperature for photosynthesis and seed germination.
              </Text>
            </View>
          </View>

          {/* Soil pH */}
          <View style={styles.reqRow}>
            <View
              style={[
                styles.reqIconCircle,
                { backgroundColor: COLORS.accentLight },
              ]}
            >
              <Ionicons name="flask" size={22} color={COLORS.accent} />
            </View>
            <View style={styles.reqTextContainer}>
              <Text style={styles.reqTitle}>Soil pH Level</Text>
              <Text style={styles.reqValue}>
                pH {crop.ideal_ph_min} – {crop.ideal_ph_max}
              </Text>
              <Text style={styles.reqHint}>
                Ideal soil acidity level for maximum root nutrient intake.
              </Text>
            </View>
          </View>

          {/* Rainfall */}
          <View style={styles.reqRow}>
            <View
              style={[
                styles.reqIconCircle,
                { backgroundColor: COLORS.secondaryLight },
              ]}
            >
              <Ionicons name="rainy" size={22} color={COLORS.secondary} />
            </View>
            <View style={styles.reqTextContainer}>
              <Text style={styles.reqTitle}>Annual Rainfall</Text>
              <Text style={styles.reqValue}>
                {crop.ideal_rainfall_min} – {crop.ideal_rainfall_max} mm
              </Text>
              <Text style={styles.reqHint}>
                Seasonal precipitation required without excessive waterlogging.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <Button
          title={`Check Farmland Suitability for ${crop.name}`}
          onPress={() => router.push('/(tabs)/predict')}
          icon={
            <Ionicons
              name="sparkles"
              size={18}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
          }
          style={{ marginTop: 8, marginBottom: 30 }}
        />
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
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cropName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  scientific: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  reqIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  reqTextContainer: {
    flex: 1,
  },
  reqTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  reqValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  reqHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
});
