import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PriceAlert } from '../types/alert';
import { COLORS, SHADOWS } from '../constants/theme';

interface AlertCardProps {
  alert: PriceAlert;
  onToggle: () => void;
  onDelete: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onToggle,
  onDelete,
}) => {
  return (
    <View style={[styles.card, SHADOWS.sm]}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Text style={styles.commodity}>{alert.commodity}</Text>
          <Text style={styles.location}>
            {alert.market ? `${alert.market}, ` : ''}
            {alert.state || 'All Mandis'}
          </Text>
        </View>
        <View style={styles.right}>
          <Switch
            value={alert.is_active}
            onValueChange={onToggle}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={alert.is_active ? COLORS.primary : '#ffffff'}
          />
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.conditionRow}>
          <Text style={styles.conditionLabel}>Target Condition: </Text>
          <Text style={styles.conditionVal}>
            When price is {alert.condition.toLowerCase()} ₹
            {alert.target_price.toLocaleString()}
          </Text>
        </View>
        {alert.is_triggered && (
          <View style={styles.triggeredBadge}>
            <Ionicons name="notifications" size={14} color={COLORS.accent} />
            <Text style={styles.triggeredText}>Threshold Triggered</Text>
          </View>
        )}
      </View>
    </View>
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
    marginBottom: 10,
  },
  left: {
    flex: 1,
  },
  commodity: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  location: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  conditionVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  triggeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  triggeredText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
