import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { predictionService } from '../../services/predictionService';
import { PredictionHistoryItem } from '../../types/prediction';
import { Header } from '../../components/Header';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function PredictionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [prediction, setPrediction] = useState<PredictionHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await predictionService.getPredictionDetails(id);
      setPrediction(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          'Failed to load prediction details from server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this historical analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await predictionService.deletePrediction(id);
              Alert.alert('Deleted', 'Prediction record has been deleted.');
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to delete record.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading message="Loading prediction details..." />;
  }

  if (error || !prediction) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Prediction Details" showBack />
        <ErrorMessage
          message={error || 'Prediction record not found.'}
          onRetry={fetchDetails}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  const { input, crop_prediction, yield_prediction, market, financial_estimate } =
    prediction;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Prediction Analysis"
        subtitle={`ID: #${prediction.id} • ${new Date(
          prediction.created_at
        ).toLocaleDateString()}`}
        showBack
        rightElement={
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Recommendation Hero */}
        <View style={[styles.heroCard, SHADOWS.md]}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={16} color="#ffffff" />
            <Text style={styles.heroBadgeText}>Primary Recommendation</Text>
          </View>
          <Text style={styles.heroCrop}>{crop_prediction.crop}</Text>
          <Text style={styles.heroConfidence}>
            Confidence:{' '}
            {Math.round(
              crop_prediction.confidence > 1
                ? crop_prediction.confidence
                : crop_prediction.confidence * 100
            )}
            %
          </Text>
        </View>

        {/* 1. Soil Chemistry & Input Parameters */}
        <View style={[styles.sectionCard, SHADOWS.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flask-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Input Soil & Climate Data</Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Nitrogen (N)</Text>
              <Text style={styles.gridValue}>{input.N} mg/kg</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Phosphorus (P)</Text>
              <Text style={styles.gridValue}>{input.P} mg/kg</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Potassium (K)</Text>
              <Text style={styles.gridValue}>{input.K} mg/kg</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Soil pH</Text>
              <Text style={styles.gridValue}>{input.ph}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Temperature</Text>
              <Text style={styles.gridValue}>{input.temperature}°C</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Humidity</Text>
              <Text style={styles.gridValue}>{input.humidity}%</Text>
            </View>
            <View style={[styles.gridItem, { width: '100%' }]}>
              <Text style={styles.gridLabel}>Rainfall</Text>
              <Text style={styles.gridValue}>{input.rainfall} mm</Text>
            </View>
          </View>
        </View>

        {/* 2. Harvest Yield Forecast */}
        {yield_prediction && (
          <View style={[styles.sectionCard, SHADOWS.sm]}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="trending-up-outline"
                size={18}
                color={COLORS.secondary}
              />
              <Text style={styles.sectionTitle}>Expected Harvest Yield</Text>
            </View>

            <View style={styles.statBanner}>
              <Text style={styles.statLargeVal}>{yield_prediction.yield}</Text>
              <Text style={styles.statLargeUnit}>{yield_prediction.unit}</Text>
            </View>
          </View>
        )}

        {/* 3. Mandi Intelligence & Prices */}
        {market && (
          <View style={[styles.sectionCard, SHADOWS.sm]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash-outline" size={18} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Mandi Market Price</Text>
            </View>

            <View style={styles.marketDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference Mandi:</Text>
                <Text style={styles.detailVal}>
                  {market.market} ({market.district}, {market.state})
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Modal Price:</Text>
                <Text style={[styles.detailVal, { fontWeight: '800' }]}>
                  ₹{market.modal_price.toLocaleString()} / {market.unit}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price Range:</Text>
                <Text style={styles.detailVal}>
                  ₹{market.min_price.toLocaleString()} - ₹
                  {market.max_price.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 4. Financial Revenue Estimate */}
        {financial_estimate && (
          <View style={[styles.sectionCard, SHADOWS.sm]}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color={COLORS.primaryDark}
              />
              <Text style={styles.sectionTitle}>Financial Return Estimate</Text>
            </View>

            <View style={styles.revenueBox}>
              <Text style={styles.revenueLabel}>Expected Total Return</Text>
              <Text style={styles.revenueAmount}>
                ₹{Math.round(financial_estimate.expected_revenue).toLocaleString()}
              </Text>
              <Text style={styles.revenueUnit}>
                Calculated on predicted yield & current mandi modal rates
              </Text>
            </View>
          </View>
        )}

        <Button
          title="Back to History"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: 10, marginBottom: 30 }}
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
  deleteBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroCrop: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroConfidence: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '47%',
    backgroundColor: COLORS.borderLight,
    padding: 10,
    borderRadius: 10,
  },
  gridLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  statBanner: {
    backgroundColor: COLORS.secondaryLight,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  statLargeVal: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  statLargeUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  marketDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  revenueBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  revenueAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginVertical: 4,
  },
  revenueUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
