import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PredictionHistoryItem } from '@/types/prediction';
import { colors } from '@/constants/colors';
import { formatDate, formatConfidence } from '@/utils/formatters';
import { useTheme } from '@/store/ThemeContext';

export interface PredictionCardProps {
  prediction: PredictionHistoryItem;
  onPress?: () => void;
  style?: ViewStyle;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  onPress,
  style,
}) => {
  const { activeColors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: activeColors.card, borderColor: activeColors.border },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.badgeContainer}>
          <View style={[styles.iconBadge, { backgroundColor: colors.primary.subtle }]}>
            <Ionicons name="analytics" size={18} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={[styles.cropTitle, { color: activeColors.textPrimary }]}>
              {prediction.primaryCropName}
            </Text>
            {prediction.locationName ? (
              <Text style={[styles.locationText, { color: activeColors.textSecondary }]}>
                {prediction.locationName}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.confidenceBadge, { backgroundColor: colors.primary.subtle }]}>
          <Text style={[styles.confidenceText, { color: colors.primary.DEFAULT }]}>
            {formatConfidence(prediction.confidence)} Match
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: activeColors.border }]} />

      <View style={styles.bottomRow}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={activeColors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.dateText, { color: activeColors.textSecondary }]}>
            {formatDate(prediction.date)}
          </Text>
        </View>
        <View style={styles.actionRow}>
          <Text style={[styles.viewText, { color: colors.primary.DEFAULT }]}>View Report</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary.DEFAULT} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  cropTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  locationText: {
    fontSize: 12,
    marginTop: 2,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 2,
  },
});

export default PredictionCard;
