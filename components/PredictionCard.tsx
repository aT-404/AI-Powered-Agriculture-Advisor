import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PredictionHistoryItem } from '@/types/prediction';
import { colors } from '@/constants/colors';
import { formatDate, formatConfidence } from '@/utils/formatters';

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
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.badgeContainer}>
          <Ionicons name="analytics" size={16} color={colors.primary.DEFAULT} />
          <Text style={styles.cropTitle}>{prediction.primaryCropName}</Text>
        </View>
        <Text style={styles.confidenceText}>
          {formatConfidence(prediction.confidence)} Match
        </Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.dateText}>{formatDate(prediction.date)}</Text>
        {prediction.locationName ? (
          <Text style={styles.locationText}>{prediction.locationName}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginLeft: 6,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
    backgroundColor: colors.primary.subtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
  },
  locationText: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
  },
});

export default PredictionCard;
