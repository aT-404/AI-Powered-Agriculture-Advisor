import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherResponse, DailyForecast } from '@/types/weather';
import { fetchWeather } from '@/services/weatherService';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';
import { formatTemperature } from '@/utils/formatters';

export interface WeatherCardProps {
  initialLocation?: string;
  style?: ViewStyle;
  onLocationChange?: (locationName: string) => void;
}

const POPULAR_LOCATIONS = [
  'Kothamangalam',
  'Muvattupuzha',
  'Kochi',
  'Palakkad',
  'Adimali',
  'Pune',
  'Nashik',
  'Kolar',
  'Khanna',
  'Varanasi',
];

export const WeatherCard: React.FC<WeatherCardProps> = ({
  initialLocation = 'Kothamangalam',
  style,
  onLocationChange,
}) => {
  const { activeColors, isDark } = useTheme();
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadWeather = async (loc: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await fetchWeather(loc);
      if (apiError || !data) {
        setError(apiError || 'Failed to fetch weather data');
      } else {
        setWeatherData(data);
        setCurrentLocation(data.location.name);
        if (onLocationChange) onLocationChange(data.location.name);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error fetching weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(currentLocation);
  }, []);

  const handleSelectLocation = (loc: string) => {
    setSearchModalVisible(false);
    setCurrentLocation(loc);
    loadWeather(loc);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      handleSelectLocation(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const current = weatherData?.current;
  const location = weatherData?.location;
  const forecast = weatherData?.forecast || [];

  const formatDayName = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: activeColors.card,
          borderColor: activeColors.border,
        },
        style,
      ]}
    >
      {/* ── Header: Location & Change Button ──────────────────────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => setSearchModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.locationBadge, { backgroundColor: colors.primary.subtle }]}>
            <Ionicons name="location" size={16} color={colors.primary.DEFAULT} />
          </View>
          <View style={{ marginLeft: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.cityName, { color: activeColors.textPrimary }]}>
                {location?.name || currentLocation}
              </Text>
              <Ionicons name="chevron-down" size={14} color={activeColors.textSecondary} />
            </View>
            {location?.state ? (
              <Text style={[styles.stateName, { color: activeColors.textSecondary }]}>
                {location.state}, {location.country || 'India'}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: isDark ? '#2A2A2A' : '#F4F6F8' }]}
          onPress={() => loadWeather(currentLocation)}
          disabled={loading}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color={activeColors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* ── Loading State ─────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
          <Text style={[styles.loadingText, { color: activeColors.textSecondary }]}>
            Loading Open-Meteo forecast...
          </Text>
        </View>
      ) : error ? (
        /* ── Error State ──────────────────────────────────────────────────── */
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.status.error} />
          <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary.DEFAULT }]}
            onPress={() => loadWeather(currentLocation)}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : current ? (
        /* ── Current Weather Display ─────────────────────────────────────── */
        <>
          <View style={styles.mainRow}>
            <View>
              <Text style={[styles.tempText, { color: activeColors.textPrimary }]}>
                {formatTemperature(current.temperature)}
              </Text>
              <Text style={[styles.feelsLikeText, { color: activeColors.textSecondary }]}>
                Feels like {formatTemperature(current.feels_like)}
              </Text>
            </View>

            <View style={styles.conditionContainer}>
              <Ionicons
                name={(current.icon as any) || 'partly-sunny-outline'}
                size={48}
                color={colors.accent.DEFAULT}
              />
              <Text style={[styles.conditionText, { color: activeColors.textPrimary }]}>
                {current.condition}
              </Text>
            </View>
          </View>

          {/* ── Metrics Grid (Humidity, Wind, Rain, Weather Code) ─────────── */}
          <View style={[styles.metricsGrid, { borderTopColor: activeColors.border }]}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="water-outline" size={15} color="#0288D1" />
              </View>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Humidity</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>
                {current.humidity}%
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#E0F2F1' }]}>
                <Ionicons name="speedometer-outline" size={15} color="#00897B" />
              </View>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Wind</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>
                {current.wind_speed} km/h
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#EDE7F6' }]}>
                <Ionicons name="rainy-outline" size={15} color="#5E35B1" />
              </View>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Rain</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>
                {current.precipitation} mm
              </Text>
            </View>
          </View>

          {/* ── 7-Day Forecast Toggle Button ──────────────────────────────── */}
          <TouchableOpacity
            style={[styles.forecastToggleBtn, { backgroundColor: isDark ? '#262626' : '#F0F9F4' }]}
            onPress={() => setShowForecast(!showForecast)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary.DEFAULT} />
              <Text style={[styles.forecastToggleText, { color: colors.primary.DEFAULT }]}>
                {showForecast ? 'Hide 7-Day Forecast' : 'View 7-Day Agricultural Forecast'}
              </Text>
            </View>
            <Ionicons
              name={showForecast ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.primary.DEFAULT}
            />
          </TouchableOpacity>

          {/* ── 7-Day Forecast List ───────────────────────────────────────── */}
          {showForecast && forecast.length > 0 ? (
            <View style={styles.forecastContainer}>
              <Text style={[styles.forecastHeaderTitle, { color: activeColors.textPrimary }]}>
                Upcoming 7-Day Farm Outlook
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.forecastScroll}
              >
                {forecast.map((day: DailyForecast, index: number) => (
                  <View
                    key={day.date || index}
                    style={[
                      styles.forecastDayCard,
                      {
                        backgroundColor: isDark ? '#222222' : '#FFFFFF',
                        borderColor: index === 0 ? colors.primary.DEFAULT : activeColors.border,
                        borderWidth: index === 0 ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.forecastDate, { color: activeColors.textPrimary }]}>
                      {index === 0 ? 'Today' : formatDayName(day.date)}
                    </Text>

                    <Ionicons
                      name={(day.icon as any) || 'partly-sunny-outline'}
                      size={26}
                      color={colors.accent.DEFAULT}
                      style={{ marginVertical: 6 }}
                    />

                    <Text
                      style={[styles.forecastCondition, { color: activeColors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {day.condition}
                    </Text>

                    <View style={styles.tempRangeRow}>
                      <Text style={[styles.tempMax, { color: activeColors.textPrimary }]}>
                        {Math.round(day.temp_max)}°
                      </Text>
                      <Text style={[styles.tempMin, { color: activeColors.textSecondary }]}>
                        {Math.round(day.temp_min)}°
                      </Text>
                    </View>

                    <View style={styles.rainProbRow}>
                      <Ionicons name="umbrella-outline" size={11} color="#0288D1" />
                      <Text style={styles.rainProbText}>{day.rain_probability}%</Text>
                    </View>
                    {day.precipitation > 0 ? (
                      <Text style={[styles.rainAmountText, { color: activeColors.textSecondary }]}>
                        {day.precipitation}mm
                      </Text>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </>
      ) : null}

      {/* ── Location Search Modal ─────────────────────────────────────────── */}
      <Modal
        visible={searchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: activeColors.card, borderColor: activeColors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>
                Change Farm Location
              </Text>
              <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                <Ionicons name="close" size={22} color={activeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchInputContainer,
                { backgroundColor: isDark ? '#262626' : '#F4F6F8', borderColor: activeColors.border },
              ]}
            >
              <Ionicons name="search-outline" size={18} color={activeColors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: activeColors.textPrimary }]}
                placeholder="Enter city or district (e.g. Kothamangalam)"
                placeholderTextColor={activeColors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity onPress={handleSearchSubmit}>
                  <Text style={{ color: colors.primary.DEFAULT, fontWeight: '700' }}>Search</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={[styles.popularTitle, { color: activeColors.textSecondary }]}>
              Popular Agricultural Locations
            </Text>
            <View style={styles.popularWrap}>
              {POPULAR_LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.popularChip,
                    {
                      backgroundColor:
                        currentLocation.toLowerCase() === loc.toLowerCase()
                          ? colors.primary.subtle
                          : isDark
                          ? '#2A2A2A'
                          : '#F0F2F5',
                      borderColor:
                        currentLocation.toLowerCase() === loc.toLowerCase()
                          ? colors.primary.DEFAULT
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelectLocation(loc)}
                >
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={
                      currentLocation.toLowerCase() === loc.toLowerCase()
                        ? colors.primary.DEFAULT
                        : activeColors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.popularChipText,
                      {
                        color:
                          currentLocation.toLowerCase() === loc.toLowerCase()
                            ? colors.primary.DEFAULT
                            : activeColors.textPrimary,
                        fontWeight:
                          currentLocation.toLowerCase() === loc.toLowerCase() ? '700' : '500',
                      },
                    ]}
                  >
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '700',
  },
  stateName: {
    fontSize: 11,
    marginTop: 1,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  errorContainer: {
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  tempText: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  feelsLikeText: {
    fontSize: 12,
    marginTop: 2,
  },
  conditionContainer: {
    alignItems: 'center',
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  forecastToggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 14,
  },
  forecastToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  forecastContainer: {
    marginTop: 14,
  },
  forecastHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  forecastScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  forecastDayCard: {
    width: 96,
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  forecastDate: {
    fontSize: 11,
    fontWeight: '700',
  },
  forecastCondition: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 6,
  },
  tempRangeRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'baseline',
  },
  tempMax: {
    fontSize: 14,
    fontWeight: '700',
  },
  tempMin: {
    fontSize: 11,
  },
  rainProbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  rainProbText: {
    fontSize: 10,
    color: '#0288D1',
    fontWeight: '600',
  },
  rainAmountText: {
    fontSize: 9,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    maxHeight: 480,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  popularTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  popularWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  popularChipText: {
    fontSize: 12,
  },
});

export default WeatherCard;
