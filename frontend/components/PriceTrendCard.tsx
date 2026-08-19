import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketTrendData, MarketTrendPoint } from '@/types/market';
import { fetchPriceTrends } from '@/services/marketService';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export interface PriceTrendCardProps {
  commodity?: string;
  market?: string;
  state?: string;
  district?: string;
  style?: ViewStyle;
}

export const PriceTrendCard: React.FC<PriceTrendCardProps> = ({
  commodity = 'Tomato',
  market = 'Muvattupuzha',
  state = 'Kerala',
  district = 'Ernakulam',
  style,
}) => {
  const { activeColors, isDark } = useTheme();
  const [timeframe, setTimeframe] = useState<7 | 30>(7);
  const [trendData, setTrendData] = useState<MarketTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MarketTrendPoint | null>(null);

  const loadTrends = async (days: number) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await fetchPriceTrends({
        commodity,
        market,
        state,
        district,
        days,
      });

      if (apiError || !data) {
        setError(apiError || 'Failed to fetch price trend data');
      } else {
        setTrendData(data);
        if (data.points.length > 0) {
          setSelectedPoint(data.points[data.points.length - 1]);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Network error fetching trends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends(timeframe);
  }, [commodity, market, state, district, timeframe]);

  const points = trendData?.points || [];
  const minPrice = points.length > 0 ? Math.min(...points.map((p) => p.modal_price)) : 0;
  const maxPrice = points.length > 0 ? Math.max(...points.map((p) => p.modal_price)) : 100;
  const priceRange = maxPrice - minPrice || 1;

  const isUp = trendData?.trend_direction === 'UP';
  const isDown = trendData?.trend_direction === 'DOWN';
  const trendColor = isUp ? colors.status.success : isDown ? colors.status.error : colors.status.info;
  const trendIcon = isUp ? 'trending-up' : isDown ? 'trending-down' : 'remove';

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
      {/* ── Header Row: Title & 7D/30D Toggle ────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="bar-chart-outline" size={18} color="#2E7D32" />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: activeColors.textPrimary }]}>
              Price Trend Analysis
            </Text>
            <Text style={[styles.cardSubtitle, { color: activeColors.textSecondary }]}>
              {commodity} at {market}
            </Text>
          </View>
        </View>

        {/* Timeframe Switcher */}
        <View style={[styles.toggleContainer, { backgroundColor: isDark ? '#262626' : '#F0F2F5' }]}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              timeframe === 7 && {
                backgroundColor: colors.primary.DEFAULT,
                shadowColor: colors.primary.DEFAULT,
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
            onPress={() => setTimeframe(7)}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color: timeframe === 7 ? '#FFF' : activeColors.textSecondary,
                  fontWeight: timeframe === 7 ? '700' : '500',
                },
              ]}
            >
              7 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              timeframe === 30 && {
                backgroundColor: colors.primary.DEFAULT,
                shadowColor: colors.primary.DEFAULT,
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
            onPress={() => setTimeframe(30)}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color: timeframe === 30 ? '#FFF' : activeColors.textSecondary,
                  fontWeight: timeframe === 30 ? '700' : '500',
                },
              ]}
            >
              30 Days
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content: Loading / Error / Chart ──────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
          <Text style={[styles.loadingText, { color: activeColors.textSecondary }]}>
            Analyzing historical price movements...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color={colors.status.error} />
          <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary.DEFAULT }]}
            onPress={() => loadTrends(timeframe)}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : trendData ? (
        <View style={styles.trendContent}>
          {/* Summary Metric Banner */}
          <View style={styles.metricBanner}>
            <View>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>
                {selectedPoint ? selectedPoint.display_date : 'Current Price'}
              </Text>
              <Text style={[styles.highlightPrice, { color: activeColors.textPrimary }]}>
                ₹{(selectedPoint?.modal_price ?? trendData.current_price).toLocaleString('en-IN')}
                <Text style={[styles.unitSub, { color: activeColors.textSecondary }]}> / Quintal</Text>
              </Text>
            </View>

            <View style={[styles.trendBadge, { backgroundColor: isUp ? '#E8F5E9' : isDown ? '#FFEBEE' : '#E3F2FD' }]}>
              <Ionicons name={trendIcon} size={15} color={trendColor} />
              <Text style={[styles.trendBadgeText, { color: trendColor }]}>
                {trendData.percentage_change >= 0 ? '+' : ''}
                {trendData.percentage_change}% {trendData.trend_direction}
              </Text>
            </View>
          </View>

          {/* ── Responsive Trend Visualizer Chart ─────────────────────────── */}
          <View style={styles.chartWrapper}>
            {/* Y-Axis Price Labels */}
            <View style={styles.yAxis}>
              <Text style={[styles.axisText, { color: activeColors.textSecondary }]}>
                ₹{maxPrice.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.axisText, { color: activeColors.textSecondary }]}>
                ₹{Math.round((maxPrice + minPrice) / 2).toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.axisText, { color: activeColors.textSecondary }]}>
                ₹{minPrice.toLocaleString('en-IN')}
              </Text>
            </View>

            {/* Main Bar / Point Visualization Area */}
            <View style={styles.chartCanvas}>
              {/* Horizontal Grid lines */}
              <View style={[styles.gridLine, { top: 0, borderColor: activeColors.border }]} />
              <View style={[styles.gridLine, { top: '50%', borderColor: activeColors.border }]} />
              <View style={[styles.gridLine, { bottom: 0, borderColor: activeColors.border }]} />

              {/* Data points & Columns */}
              <View style={styles.barsRow}>
                {points.map((pt, idx) => {
                  const normalizedHeight = Math.max(
                    12,
                    Math.round(((pt.modal_price - minPrice) / priceRange) * 110) + 16
                  );
                  const isSelected = selectedPoint?.date === pt.date;

                  return (
                    <TouchableOpacity
                      key={pt.date || idx}
                      style={styles.barColumn}
                      onPress={() => setSelectedPoint(pt)}
                      activeOpacity={0.7}
                    >
                      {/* Price indicator dot / pill */}
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: normalizedHeight,
                            backgroundColor: isSelected
                              ? colors.primary.DEFAULT
                              : isDark
                              ? '#3A3A3A'
                              : '#CFD8DC',
                            borderColor: isSelected ? colors.primary.dark : 'transparent',
                            borderWidth: isSelected ? 1.5 : 0,
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* X-Axis Date Labels */}
          <View style={styles.xAxisRow}>
            {points.length > 0 && (
              <>
                <Text style={[styles.axisText, { color: activeColors.textSecondary }]}>
                  {points[0].display_date}
                </Text>
                {points.length > 3 && (
                  <Text style={[styles.axisText, { color: activeColors.textSecondary }]}>
                    {points[Math.floor(points.length / 2)].display_date}
                  </Text>
                )}
                <Text style={[styles.axisText, { color: activeColors.textSecondary }]}>
                  {points[points.length - 1].display_date}
                </Text>
              </>
            )}
          </View>

          {/* ── Price Comparison Footer ───────────────────────────────────── */}
          <View style={[styles.footerMetrics, { borderTopColor: activeColors.border }]}>
            <View style={styles.footerCol}>
              <Text style={[styles.footerLabel, { color: activeColors.textSecondary }]}>
                Starting Price ({timeframe}d ago)
              </Text>
              <Text style={[styles.footerValue, { color: activeColors.textPrimary }]}>
                ₹{trendData.previous_price.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.footerCol}>
              <Text style={[styles.footerLabel, { color: activeColors.textSecondary }]}>
                Net Difference
              </Text>
              <Text
                style={[
                  styles.footerValue,
                  { color: trendData.price_difference >= 0 ? colors.status.success : colors.status.error },
                ]}
              >
                {trendData.price_difference >= 0 ? '+₹' : '-₹'}
                {Math.abs(trendData.price_difference).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.footerCol}>
              <Text style={[styles.footerLabel, { color: activeColors.textSecondary }]}>
                Market Sentiment
              </Text>
              <Text style={[styles.footerValue, { color: trendColor, fontWeight: '700' }]}>
                {isUp ? 'Bullish / Rising' : isDown ? 'Softening / Falling' : 'Stable'}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  toggleText: {
    fontSize: 11,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  errorBox: {
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
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  trendContent: {
    marginTop: 4,
  },
  metricBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  highlightPrice: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  unitSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 140,
    alignItems: 'flex-end',
    marginTop: 6,
  },
  yAxis: {
    width: 60,
    height: '100%',
    justifyContent: 'space-between',
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  chartCanvas: {
    flex: 1,
    height: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.4,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: 2,
  },
  barFill: {
    width: '80%',
    maxWidth: 22,
    borderRadius: 6,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingLeft: 60,
    paddingRight: 4,
  },
  axisText: {
    fontSize: 10,
    fontWeight: '600',
  },
  footerMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerCol: {
    alignItems: 'flex-start',
  },
  footerLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default PriceTrendCard;
