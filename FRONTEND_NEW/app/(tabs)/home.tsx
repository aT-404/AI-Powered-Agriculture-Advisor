import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../store/AuthContext';
import { weatherService } from '../../services/weatherService';
import { predictionService } from '../../services/predictionService';
import { marketService } from '../../services/marketService';
import { WeatherResponse } from '../../types/weather';
import { PredictionHistoryItem } from '../../types/prediction';
import { MarketPriceItem } from '../../types/market';
import { WeatherCard } from '../../components/WeatherCard';
import { PredictionCard } from '../../components/PredictionCard';
import { MarketPriceCard } from '../../components/MarketPriceCard';
import { Loading } from '../../components/Loading';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [latestPrediction, setLatestPrediction] =
    useState<PredictionHistoryItem | null>(null);
  const [topMarketPrices, setTopMarketPrices] = useState<MarketPriceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Fetch Weather
      try {
        const weatherData = await weatherService.getWeather({
          location: user?.location || undefined,
          latitude: user?.latitude || undefined,
          longitude: user?.longitude || undefined,
        });
        setWeather(weatherData);
      } catch (err) {
        console.warn('Weather load failed:', err);
      }

      // 2. Fetch Latest Prediction (if authenticated)
      try {
        const predRes = await predictionService.getPredictionHistory(1, 1);
        if (predRes.results && predRes.results.length > 0) {
          setLatestPrediction(predRes.results[0]);
        }
      } catch (err) {
        console.warn('Latest prediction fetch failed:', err);
      }

      // 3. Fetch Top Market Prices
      try {
        const marketRes = await marketService.getPrices();
        if (marketRes.results) {
          setTopMarketPrices(marketRes.results.slice(0, 3));
        }
      } catch (err) {
        console.warn('Market prices fetch failed:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading && !refreshing) {
    return <Loading message="Loading agricultural dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Namaste, {user?.first_name || 'Farmer'} 🙏
          </Text>
          <Text style={styles.headerSubtitle}>
            Smart AI insights for your farmland
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Real-time Weather Card */}
        {weather && <WeatherCard weather={weather} />}

        {/* Quick AI Action Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Agriculture Tools</Text>
        </View>
        <View style={styles.toolsGrid}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/predict')}
            style={[styles.toolCard, SHADOWS.sm]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.toolIconCircle,
                { backgroundColor: COLORS.primaryLight },
              ]}
            >
              <Ionicons name="leaf" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.toolTitle}>Crop Advisor</Text>
            <Text style={styles.toolDesc}>Optimal crop for soil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/yield-predict')}
            style={[styles.toolCard, SHADOWS.sm]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.toolIconCircle,
                { backgroundColor: COLORS.secondaryLight },
              ]}
            >
              <Ionicons
                name="trending-up"
                size={24}
                color={COLORS.secondary}
              />
            </View>
            <Text style={styles.toolTitle}>Yield Predictor</Text>
            <Text style={styles.toolDesc}>Forecast harvest in tons</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/crops')}
            style={[styles.toolCard, SHADOWS.sm]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.toolIconCircle,
                { backgroundColor: COLORS.accentLight },
              ]}
            >
              <Ionicons name="book" size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.toolTitle}>Crop Library</Text>
            <Text style={styles.toolDesc}>Agronomic encyclopedia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/market')}
            style={[styles.toolCard, SHADOWS.sm]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.toolIconCircle,
                { backgroundColor: COLORS.primaryLight },
              ]}
            >
              <Ionicons name="cash" size={24} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.toolTitle}>Live Mandis</Text>
            <Text style={styles.toolDesc}>Agmarknet daily rates</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Prediction Summary */}
        {latestPrediction ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest AI Analysis</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.viewAllText}>View History</Text>
              </TouchableOpacity>
            </View>
            <PredictionCard
              item={latestPrediction}
              onPress={() =>
                router.push({
                  pathname: '/prediction/[id]',
                  params: { id: latestPrediction.id },
                })
              }
            />
          </View>
        ) : null}

        {/* Market Highlights */}
        {topMarketPrices.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Market Price Ticker</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/market')}>
                <Text style={styles.viewAllText}>Explore Mandis</Text>
              </TouchableOpacity>
            </View>
            {topMarketPrices.map((item, idx) => (
              <MarketPriceCard key={`${item.commodity}-${idx}`} item={item} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toolIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  toolDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: 8,
  },
});
