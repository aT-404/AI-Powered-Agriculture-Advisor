import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PredictionHistoryItem } from '../types/prediction';
import { COLORS, SHADOWS } from '../constants/theme';

interface PredictionCardProps {
  item: PredictionHistoryItem;
  onPress: () => void;
  onDelete?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  item,
  onPress,
  onDelete,
}) => {
  const dateFormatted = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const confidencePercent = Math.round(
    item.crop_prediction.confidence > 1
      ? item.crop_prediction.confidence
      : item.crop_prediction.confidence * 100
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, SHADOWS.sm]}
    >
      <View style={styles.header}>
        <View style={styles.cropBadge}>
          <Ionicons name="leaf" size={14} color={COLORS.primary} />
          <Text style={styles.cropName}>{item.crop_prediction.crop}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{dateFormatted}</Text>
          {onDelete ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Confidence</Text>
          <Text style={styles.statValue}>{confidencePercent}%</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Expected Yield</Text>
          <Text style={styles.statValue}>
            {item.yield_prediction
              ? `${item.yield_prediction.yield} ${item.yield_prediction.unit.split('/')[0]}`
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Mandi Price</Text>
          <Text style={styles.statValue}>
            {item.market ? `₹${item.market.modal_price}` : 'N/A'}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Est. Return</Text>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>
            {item.financial_estimate
              ? `₹${Math.round(item.financial_estimate.expected_revenue).toLocaleString()}`
              : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.soilSummary}>
          N: {item.input.N} | P: {item.input.P} | K: {item.input.K} | pH: {item.input.ph}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  cropName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  deleteButton: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: 10,
    marginBottom: 10,
  },
  statBox: {
    width: '50%',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soilSummary: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
