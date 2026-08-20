import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { marketService } from '../../services/marketService';
import { alertService } from '../../services/alertService';
import { useAuth } from '../../store/AuthContext';
import { MarketPriceItem, MarketTrendResponse } from '../../types/market';
import { PriceAlert } from '../../types/alert';
import { MarketPriceCard } from '../../components/MarketPriceCard';
import { AlertCard } from '../../components/AlertCard';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { Loading } from '../../components/Loading';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function MarketScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'prices' | 'trends' | 'alerts'>('prices');

  // Market Prices State
  const [prices, setPrices] = useState<MarketPriceItem[]>([]);
  const [commoditySearch, setCommoditySearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Market Trends State
  const [trendCommodity, setTrendCommodity] = useState('Tomato');
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [trendData, setTrendData] = useState<MarketTrendResponse | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertCommodity, setAlertCommodity] = useState('');
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [creatingAlert, setCreatingAlert] = useState(false);

  // Load Filters & Mandi Prices
  const loadMarketData = useCallback(async () => {
    try {
      // 1. Load Filter Hierarchy
      try {
        const filters = await marketService.getFilters();
        if (filters.states) setAvailableStates(filters.states);
      } catch (err) {
        console.warn('Filter hierarchy load error:', err);
      }

      // 2. Load Prices
      const priceRes = await marketService.getPrices({
        commodity: commoditySearch.trim() || undefined,
        state: selectedState || undefined,
      });
      setPrices(priceRes.results || []);

      // 3. Load User Alerts
      try {
        const userIdentifier = user?.email || 'default_farmer';
        const userAlerts = await alertService.getAlerts(userIdentifier);
        setAlerts(userAlerts);
      } catch (err) {
        console.warn('Alerts load error:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [commoditySearch, selectedState, user]);

  const loadTrends = useCallback(async () => {
    setTrendLoading(true);
    try {
      const data = await marketService.getTrends({
        commodity: trendCommodity,
        days: trendDays,
      });
      setTrendData(data);
    } catch (err) {
      console.warn('Trend load error:', err);
    } finally {
      setTrendLoading(false);
    }
  }, [trendCommodity, trendDays]);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  useEffect(() => {
    if (activeTab === 'trends') {
      loadTrends();
    }
  }, [activeTab, loadTrends]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMarketData();
    if (activeTab === 'trends') loadTrends();
  };

  const handleCreateAlert = async () => {
    if (!alertCommodity.trim() || !alertTargetPrice.trim()) {
      Alert.alert('Required Fields', 'Please enter Commodity and Target Price.');
      return;
    }

    const priceNum = parseFloat(alertTargetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Target price must be a positive number.');
      return;
    }

    setCreatingAlert(true);
    try {
      const newAlert = await alertService.createAlert({
        commodity: alertCommodity.trim(),
        target_price: priceNum,
        condition: alertCondition,
        user_identifier: user?.email || 'default_farmer',
      });
      setAlerts((prev) => [newAlert, ...prev]);
      setAlertCommodity('');
      setAlertTargetPrice('');
      Alert.alert('Alert Created', `Target price notification set for ${newAlert.commodity}.`);
    } catch (err: any) {
      Alert.alert('Error', 'Could not create price alert.');
    } finally {
      setCreatingAlert(false);
    }
  };

  const handleToggleAlert = async (id: number) => {
    try {
      const updated = await alertService.toggleAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      Alert.alert('Error', 'Could not toggle alert state.');
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      Alert.alert('Error', 'Could not delete alert.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Market Intelligence"
        subtitle="Agmarknet live Mandi prices, price trends & alerts"
      />

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('prices')}
          style={[styles.tabItem, activeTab === 'prices' && styles.tabItemActive]}
        >
          <Ionicons
            name="cash-outline"
            size={16}
            color={activeTab === 'prices' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'prices' && styles.tabTextActive,
            ]}
          >
            Mandi Rates
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('trends')}
          style={[styles.tabItem, activeTab === 'trends' && styles.tabItemActive]}
        >
          <Ionicons
            name="trending-up-outline"
            size={16}
            color={activeTab === 'trends' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'trends' && styles.tabTextActive,
            ]}
          >
            Price Trends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('alerts')}
          style={[styles.tabItem, activeTab === 'alerts' && styles.tabItemActive]}
        >
          <Ionicons
            name="notifications-outline"
            size={16}
            color={activeTab === 'alerts' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'alerts' && styles.tabTextActive,
            ]}
          >
            Price Alerts ({alerts.length})
          </Text>
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
        {/* TAB 1: Live Mandi Rates */}
        {activeTab === 'prices' && (
          <View>
            <Input
              placeholder="Search commodity (e.g. Tomato, Rice)..."
              value={commoditySearch}
              onChangeText={setCommoditySearch}
              icon={<Ionicons name="search" size={18} color={COLORS.textMuted} />}
              containerStyle={{ marginBottom: 12 }}
            />

            {/* State Filter Chips */}
            {availableStates.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stateFilterRow}
              >
                <TouchableOpacity
                  onPress={() => setSelectedState('')}
                  style={[
                    styles.stateChip,
                    !selectedState && styles.stateChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stateChipText,
                      !selectedState && styles.stateChipTextActive,
                    ]}
                  >
                    All States
                  </Text>
                </TouchableOpacity>
                {availableStates.map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setSelectedState(st)}
                    style={[
                      styles.stateChip,
                      selectedState === st && styles.stateChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stateChipText,
                        selectedState === st && styles.stateChipTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {loading && !refreshing ? (
              <Loading message="Fetching live Mandi prices..." fullScreen={false} />
            ) : prices.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="storefront-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Mandi Prices Found</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing your state or commodity search filter.
                </Text>
              </View>
            ) : (
              prices.map((item, idx) => (
                <MarketPriceCard key={`${item.commodity}-${item.market}-${idx}`} item={item} />
              ))
            )}
          </View>
        )}

        {/* TAB 2: Price Trends */}
        {activeTab === 'trends' && (
          <View>
            <View style={[styles.trendFilterCard, SHADOWS.sm]}>
              <Text style={styles.cardHeading}>Analyze Commodity Price Trend</Text>
              <Input
                label="Target Commodity"
                placeholder="Tomato"
                value={trendCommodity}
                onChangeText={setTrendCommodity}
                containerStyle={{ marginBottom: 12 }}
              />

              <View style={styles.daysSelectorRow}>
                <TouchableOpacity
                  onPress={() => setTrendDays(7)}
                  style={[
                    styles.daysBtn,
                    trendDays === 7 && styles.daysBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.daysBtnText,
                      trendDays === 7 && styles.daysBtnTextActive,
                    ]}
                  >
                    7-Day Trend
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setTrendDays(30)}
                  style={[
                    styles.daysBtn,
                    trendDays === 30 && styles.daysBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.daysBtnText,
                      trendDays === 30 && styles.daysBtnTextActive,
                    ]}
                  >
                    30-Day Trend
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Update Price Trend"
                onPress={loadTrends}
                loading={trendLoading}
                style={{ marginTop: 8 }}
              />
            </View>

            {trendData && (
              <View style={[styles.trendResultCard, SHADOWS.md]}>
                <View style={styles.trendHeader}>
                  <View>
                    <Text style={styles.trendTitle}>{trendData.commodity}</Text>
                    <Text style={styles.trendSubtitle}>
                      {trendData.days}-day price movement
                    </Text>
                  </View>
                  <View style={styles.trendPriceBox}>
                    <Text style={styles.trendCurrentPrice}>
                      ₹{trendData.current_price.toLocaleString()}
                    </Text>
                    <View
                      style={[
                        styles.trendBadge,
                        {
                          backgroundColor:
                            trendData.trend_direction === 'UP'
                              ? COLORS.primaryLight
                              : trendData.trend_direction === 'DOWN'
                              ? COLORS.dangerLight
                              : COLORS.borderLight,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          trendData.trend_direction === 'UP'
                            ? 'trending-up'
                            : trendData.trend_direction === 'DOWN'
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={14}
                        color={
                          trendData.trend_direction === 'UP'
                            ? COLORS.primaryDark
                            : trendData.trend_direction === 'DOWN'
                            ? COLORS.danger
                            : COLORS.textMuted
                        }
                      />
                      <Text
                        style={[
                          styles.trendBadgeText,
                          {
                            color:
                              trendData.trend_direction === 'UP'
                                ? COLORS.primaryDark
                                : trendData.trend_direction === 'DOWN'
                                ? COLORS.danger
                                : COLORS.textMuted,
                          },
                        ]}
                      >
                        {trendData.percentage_change > 0 ? '+' : ''}
                        {trendData.percentage_change}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Trend Historical Points */}
                <Text style={styles.pointsHeading}>Daily Mandi Modal Rates</Text>
                {trendData.trend_data.map((point) => (
                  <View key={point.date} style={styles.pointRow}>
                    <Text style={styles.pointDate}>{point.date}</Text>
                    <Text style={styles.pointPrice}>₹{point.price.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB 3: Price Alerts */}
        {activeTab === 'alerts' && (
          <View>
            {/* Create Alert Form */}
            <View style={[styles.trendFilterCard, SHADOWS.sm]}>
              <Text style={styles.cardHeading}>Set New Mandi Price Alert</Text>

              <Input
                label="Commodity Name"
                placeholder="e.g. Onion, Tomato, Potato"
                value={alertCommodity}
                onChangeText={setAlertCommodity}
              />

              <Input
                label="Target Price Threshold (₹/Qtl)"
                placeholder="3000"
                value={alertTargetPrice}
                onChangeText={setAlertTargetPrice}
                keyboardType="numeric"
              />

              {/* Above / Below Condition Switch */}
              <Text style={styles.conditionSelectLabel}>Trigger Alert Condition</Text>
              <View style={styles.daysSelectorRow}>
                <TouchableOpacity
                  onPress={() => setAlertCondition('ABOVE')}
                  style={[
                    styles.daysBtn,
                    alertCondition === 'ABOVE' && styles.daysBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.daysBtnText,
                      alertCondition === 'ABOVE' && styles.daysBtnTextActive,
                    ]}
                  >
                    Rises ABOVE Target
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAlertCondition('BELOW')}
                  style={[
                    styles.daysBtn,
                    alertCondition === 'BELOW' && styles.daysBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.daysBtnText,
                      alertCondition === 'BELOW' && styles.daysBtnTextActive,
                    ]}
                  >
                    Falls BELOW Target
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Create Price Alert"
                onPress={handleCreateAlert}
                loading={creatingAlert}
                style={{ marginTop: 12 }}
              />
            </View>

            {/* List of Existing Alerts */}
            <Text style={styles.existingAlertsHeading}>Active Price Alerts</Text>
            {alerts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="notifications-off-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Alerts Configured</Text>
                <Text style={styles.emptySubtitle}>
                  Set a price alert above to get notified of favorable selling rates.
                </Text>
              </View>
            ) : (
              alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onToggle={() => handleToggleAlert(alert.id)}
                  onDelete={() => handleDeleteAlert(alert.id)}
                />
              ))
            )}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  scrollContent: {
    padding: 20,
  },
  stateFilterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  stateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stateChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  stateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  stateChipTextActive: {
    color: COLORS.primaryDark,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  trendFilterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  daysSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  daysBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  daysBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  daysBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  daysBtnTextActive: {
    color: COLORS.primaryDark,
  },
  trendResultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 14,
    marginBottom: 14,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  trendSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  trendPriceBox: {
    alignItems: 'flex-end',
  },
  trendCurrentPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pointsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  pointDate: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  pointPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  conditionSelectLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  existingAlertsHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
});
