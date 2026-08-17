import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData } from '@/types/weather';
import { colors } from '@/constants/colors';
import { formatTemperature } from '@/utils/formatters';

export interface WeatherCardProps {
  weather?: WeatherData | null;
  style?: ViewStyle;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={colors.primary.DEFAULT} />
          <Text style={styles.cityName}>{weather?.cityName || 'Current Farm Location'}</Text>
        </View>
        <Text style={styles.conditionText}>{weather?.condition || 'Partly Cloudy'}</Text>
      </View>

      <View style={styles.mainRow}>
        <Text style={styles.tempText}>{formatTemperature(weather?.temperature ?? 28)}</Text>
        <Ionicons name="partly-sunny-outline" size={44} color={colors.accent.DEFAULT} />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Ionicons name="water-outline" size={16} color={colors.neutral.textSecondary} />
          <Text style={styles.metricLabel}>Humidity: </Text>
          <Text style={styles.metricValue}>{weather?.humidity ?? 65}%</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="rainy-outline" size={16} color={colors.neutral.textSecondary} />
          <Text style={styles.metricLabel}>Rainfall: </Text>
          <Text style={styles.metricValue}>{weather?.rainfall ?? 12} mm</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
    marginLeft: 4,
  },
  conditionText: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  tempText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
});

export default WeatherCard;
