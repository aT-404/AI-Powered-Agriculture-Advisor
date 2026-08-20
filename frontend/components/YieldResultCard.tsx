import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YieldPredictionResult } from '@/types/prediction';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/formatters';
import { useTheme } from '@/store/ThemeContext';

export interface YieldResultCardProps {
  prediction: YieldPredictionResult;
  style?: ViewStyle;
  forceLight?: boolean;
}

export const YieldResultCard: React.FC<YieldResultCardProps> = ({
  prediction,
  style,
  forceLight = false,
}) => {
  const { activeColors } = useTheme();

  // If forceLight is true, override with light mode colors
  const cardBg = forceLight ? colors.neutral.white : activeColors.card;
  const borderColor = forceLight ? colors.neutral.border : activeColors.border;
  const textPrimary = forceLight ? colors.neutral.textPrimary : activeColors.textPrimary;
  const textSecondary = forceLight ? colors.neutral.textSecondary : activeColors.textSecondary;
  const textMuted = forceLight ? colors.neutral.textMuted : activeColors.textMuted;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor: borderColor },
        style,
      ]}
    >
      {/* Header Badge */}
      <View style={styles.topSection}>
        <View style={[styles.iconBadge, { backgroundColor: colors.primary.subtle }]}>
          <Ionicons name="leaf" size={28} color={colors.primary.DEFAULT} />
        </View>
        <Text style={[styles.titleText, { color: textSecondary }]}>
          Predicted {prediction.input.Crop_Type} Yield
        </Text>
        <View style={styles.regionTag}>
          <Ionicons name="location-outline" size={12} color={colors.primary.DEFAULT} />
          <Text style={styles.regionTagText}>{prediction.input.Region} Region • {prediction.input.Season}</Text>
        </View>
      </View>

      {/* Metric Display */}
      <View style={styles.metricContainer}>
        <Text style={[styles.metricValue, { color: colors.primary.DEFAULT }]}>
          {prediction.predicted_yield.toFixed(2)}
        </Text>
        <Text style={[styles.metricUnit, { color: textSecondary }]}>
          {prediction.unit}
        </Text>
      </View>

      {/* Highlights Grid */}
      <View style={styles.detailsGrid}>
        <View style={[styles.detailItem, { backgroundColor: forceLight ? '#F8FAF8' : activeColors.background }]}>
          <Ionicons name="water" size={16} color="#0288D1" />
          <View>
            <Text style={[styles.detailLabel, { color: textMuted }]}>Irrigation</Text>
            <Text style={[styles.detailText, { color: textPrimary }]}>
              {prediction.input.Irrigation_Type}
            </Text>
          </View>
        </View>

        <View style={[styles.detailItem, { backgroundColor: forceLight ? '#F8FAF8' : activeColors.background }]}>
          <Ionicons name="thermometer" size={16} color="#ED6C02" />
          <View>
            <Text style={[styles.detailLabel, { color: textMuted }]}>Temperature</Text>
            <Text style={[styles.detailText, { color: textPrimary }]}>
              {prediction.input.Temperature}°C
            </Text>
          </View>
        </View>

        <View style={[styles.detailItem, { backgroundColor: forceLight ? '#F8FAF8' : activeColors.background }]}>
          <Ionicons name="rainy" size={16} color="#2E7D32" />
          <View>
            <Text style={[styles.detailLabel, { color: textMuted }]}>Rainfall</Text>
            <Text style={[styles.detailText, { color: textPrimary }]}>
              {prediction.input.Rainfall} mm
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      {/* Feature Contributions / Explanation */}
      {prediction.explanation && prediction.explanation.length > 0 && (
        <View style={styles.explanationSection}>
          <View style={styles.explanationHeaderRow}>
            <Ionicons name="analytics-outline" size={16} color={colors.primary.DEFAULT} />
            <Text style={[styles.explanationTitle, { color: textPrimary }]}>
              Yield Influence Drivers
            </Text>
          </View>

          <View style={styles.explanationList}>
            {prediction.explanation.slice(0, 5).map((item, index) => {
              const maxContrib = Math.max(
                ...(prediction.explanation?.slice(0, 5).map((x) => Math.abs(x.contribution)) || [1])
              );
              const barWidth = `${Math.max(8, (Math.abs(item.contribution) / maxContrib) * 100)}%`;
              const isPositive = item.contribution >= 0;

              return (
                <View key={index} style={styles.explanationRow}>
                  <Text style={[styles.explanationLabel, { color: textPrimary }]} numberOfLines={1}>
                    {item.feature.replace(/_/g, ' ')}
                  </Text>
                  <View style={styles.explanationBarContainer}>
                    <View
                      style={[
                        styles.explanationBar,
                        {
                          backgroundColor: isPositive ? colors.status.success : colors.status.error,
                          width: barWidth as any,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.explanationValue,
                      { color: isPositive ? colors.status.success : colors.status.error },
                    ]}
                  >
                    {isPositive ? '+' : ''}
                    {item.contribution.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={[styles.dateText, { color: textMuted }]}>
          Generated on {formatDate(prediction.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  regionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: colors.primary.subtle,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  regionTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 14,
  },
  metricValue: {
    fontSize: 52,
    fontWeight: '900',
    marginRight: 6,
    letterSpacing: -1,
  },
  metricUnit: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginVertical: 10,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 14,
  },
  explanationSection: {
    width: '100%',
    marginBottom: 12,
  },
  explanationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  explanationList: {
    width: '100%',
    gap: 8,
  },
  explanationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  explanationLabel: {
    width: 90,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  explanationBarContainer: {
    flex: 1,
    height: 7,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  explanationBar: {
    height: '100%',
    borderRadius: 4,
  },
  explanationValue: {
    width: 50,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  footerRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default YieldResultCard;
