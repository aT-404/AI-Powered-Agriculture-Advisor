import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';

export default function CropDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="leaf" size={40} color={colors.primary.DEFAULT} />
        </View>
        <Text style={styles.cropName}>Crop Details: {id || 'Rice'}</Text>
        <Text style={styles.subtitle}>This is the Crop Details screen</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Optimal Soil Conditions</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Soil pH Range:</Text>
          <Text style={styles.metricValue}>5.5 - 7.0</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Nitrogen (N):</Text>
          <Text style={styles.metricValue}>80 - 120 kg/ha</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Phosphorus (P):</Text>
          <Text style={styles.metricValue}>35 - 55 kg/ha</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Potassium (K):</Text>
          <Text style={styles.metricValue}>35 - 50 kg/ha</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Climate & Growth Duration</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Optimal Temperature:</Text>
          <Text style={styles.metricValue}>20°C - 35°C</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Growth Duration:</Text>
          <Text style={styles.metricValue}>120 - 150 days</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Season:</Text>
          <Text style={styles.metricValue}>Kharif (Monsoon)</Text>
        </View>
      </View>

      <Button
        title="Check My Soil For This Crop"
        onPress={() => router.push('/(tabs)/predict')}
        style={styles.predictBtn}
      />
    </ScrollView>
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cropName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
  predictBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
});
