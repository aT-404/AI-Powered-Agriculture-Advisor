import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherResponse } from '../types/weather';
import { COLORS, SHADOWS } from '../constants/theme';

interface WeatherCardProps {
  weather: WeatherResponse;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const { current, location, forecast } = weather;

  const mapIcon = (iconName: string): keyof typeof Ionicons.glyphMap => {
    switch (iconName) {
      case 'sunny-outline':
        return 'sunny';
      case 'partly-sunny-outline':
        return 'partly-sunny';
      case 'cloudy-outline':
      case 'cloud-outline':
        return 'cloudy';
      case 'rainy-outline':
        return 'rainy';
      case 'thunderstorm-outline':
        return 'thunderstorm';
      default:
        return 'partly-sunny';
    }
  };

  return (
    <View style={[styles.card, SHADOWS.md]}>
      {/* Current Weather Banner */}
      <View style={styles.topRow}>
        <View>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
            <Text style={styles.locationText}>
              {location.name}
              {location.state ? `, ${location.state}` : ''}
            </Text>
          </View>
          <Text style={styles.conditionText}>{current.condition}</Text>
        </View>
        <View style={styles.tempBox}>
          <Ionicons
            name={mapIcon(current.icon)}
            size={36}
            color={COLORS.primary}
          />
          <Text style={styles.temperature}>{current.temperature}°C</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Ionicons name="water-outline" size={16} color={COLORS.secondary} />
          <Text style={styles.metricLabel}>Humidity</Text>
          <Text style={styles.metricValue}>{current.humidity}%</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="speedometer-outline" size={16} color={COLORS.accent} />
          <Text style={styles.metricLabel}>Wind</Text>
          <Text style={styles.metricValue}>{current.wind_speed} km/h</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="rainy-outline" size={16} color={COLORS.primary} />
          <Text style={styles.metricLabel}>Rain</Text>
          <Text style={styles.metricValue}>{current.precipitation} mm</Text>
        </View>
      </View>

      {/* 7-Day Forecast Horizontal Bar */}
      {forecast && forecast.length > 0 && (
        <View style={styles.forecastContainer}>
          <Text style={styles.forecastHeading}>7-Day Agricultural Forecast</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastList}
          >
            {forecast.map((day, idx) => {
              const dateObj = new Date(day.date);
              const dayName =
                idx === 0
                  ? 'Today'
                  : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <View key={day.date} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>{dayName}</Text>
                  <Ionicons
                    name={mapIcon(day.icon)}
                    size={20}
                    color={COLORS.primaryDark}
                    style={{ marginVertical: 4 }}
                  />
                  <Text style={styles.forecastTemp}>
                    {Math.round(day.temp_max)}°
                  </Text>
                  <Text style={styles.forecastMinTemp}>
                    {Math.round(day.temp_min)}°
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  conditionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  tempBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  temperature: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.borderLight,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 1,
  },
  forecastContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
  },
  forecastHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  forecastList: {
    gap: 12,
    paddingRight: 10,
  },
  forecastItem: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    minWidth: 54,
  },
  forecastDay: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  forecastTemp: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  forecastMinTemp: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
