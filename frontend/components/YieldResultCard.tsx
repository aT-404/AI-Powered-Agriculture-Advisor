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
    <View style={[
      styles.card,
      { backgroundColor: cardBg, borderColor: borderColor },
      style
    ]}>
      <View style={styles.topSection}>
        <View style={styles.badgeContainer}>
          <View style={[styles.iconBadge, { backgroundColor: colors.accent.light }]}>
            <Ionicons name="leaf" size={24} color={colors.accent.dark} />
          </View>
        </View>
        <Text style={[styles.titleText, { color: textSecondary }]}>
          Predicted {prediction.input.Crop_Type} Yield
        </Text>
      </View>

      <View style={styles.metricContainer}>
        <Text style={[styles.metricValue, { color: colors.primary.DEFAULT }]}>
          {prediction.predicted_yield.toFixed(2)}
        </Text>
        <Text style={[styles.metricUnit, { color: textSecondary }]}>
          {prediction.unit}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="water-outline" size={16} color={textSecondary} />
          <Text style={[styles.detailText, { color: textPrimary }]}>
            {prediction.input.Irrigation_Type}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="sunny-outline" size={16} color={textSecondary} />
          <Text style={[styles.detailText, { color: textPrimary }]}>
            {prediction.input.Season}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="thermometer-outline" size={16} color={textSecondary} />
          <Text style={[styles.detailText, { color: textPrimary }]}>
            {prediction.input.Temperature}°C
          </Text>
        </View>
      </View>
      
      <View style={styles.footerRow}>
        <Text style={[styles.dateText, { color: textMuted }]}>
          Calculated on {formatDate(prediction.timestamp)}
        </Text>
      </View>

      {prediction.explanation && prediction.explanation.length > 0 && (
        <View style={styles.explanationSection}>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <Text style={[styles.explanationTitle, { color: textPrimary }]}>
            Why this prediction?
          </Text>
          <Text style={[styles.explanationSubtitle, { color: textSecondary }]}>
            Top contributing factors
          </Text>
          <View style={styles.explanationList}>
            {prediction.explanation.slice(0, 5).map((item, index) => {
              // Find max contribution for scaling
              const maxContrib = Math.max(...(prediction.explanation?.slice(0, 5).map(x => Math.abs(x.contribution)) || [1]));
              const barWidth = `${Math.max(5, (Math.abs(item.contribution) / maxContrib) * 100)}%`;
              
              return (
                <View key={index} style={styles.explanationRow}>
                  <Text style={[styles.explanationLabel, { color: textPrimary }]} numberOfLines={1}>
                    {item.feature.replace(/_/g, ' ')}
                  </Text>
                  <View style={styles.explanationBarContainer}>
                    <View style={[
                      styles.explanationBar,
                      { 
                        backgroundColor: item.contribution > 0 ? colors.status.success : colors.status.error,
                        width: barWidth as any
                      }
                    ]} />
                  </View>
                  <Text style={[
                    styles.explanationValue, 
                    { color: item.contribution > 0 ? colors.status.success : colors.status.error }
                  ]}>
                    {item.contribution > 0 ? '+' : ''}{item.contribution.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeContainer: {
    marginBottom: 12,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  metricValue: {
    fontSize: 56,
    fontWeight: '800',
    marginRight: 8,
  },
  metricUnit: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerRow: {
    width: '100%',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
  },
  explanationSection: {
    width: '100%',
    marginTop: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  explanationSubtitle: {
    fontSize: 12,
    marginBottom: 12,
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
    width: 80,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  explanationBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  explanationBar: {
    height: '100%',
    borderRadius: 3,
  },
  explanationValue: {
    width: 45,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  }
});

export default YieldResultCard;
