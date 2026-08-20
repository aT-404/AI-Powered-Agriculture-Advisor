import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketPriceItem } from '../types/market';
import { COLORS, SHADOWS } from '../constants/theme';

interface MarketPriceCardProps {
  item: MarketPriceItem;
}

export const MarketPriceCard: React.FC<MarketPriceCardProps> = ({ item }) => {
  const formatPrice = (val: any) => {
    if (val === null || val === undefined) return 'N/A';
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num)) return String(val);
    return num.toLocaleString();
  };

  return (
    <View style={[styles.card, SHADOWS.sm]}>
      <View style={styles.header}>
        <View style={styles.commodityBox}>
          <Text style={styles.commodity}>{item.commodity}</Text>
          <Text style={styles.location}>
            {item.market ? `${item.market}, ` : ''}
            {item.district ? `${item.district}, ` : ''}
            {item.state || 'All Mandis'}
          </Text>
        </View>
        <View style={styles.modalBox}>
          <Text style={styles.modalPrice}>₹{formatPrice(item.modal_price)}</Text>
          <Text style={styles.modalLabel}>Modal Price / Quintal</Text>
        </View>
      </View>

      <View style={styles.rangeRow}>
        <View style={styles.rangeItem}>
          <Ionicons name="arrow-down" size={12} color={COLORS.secondary} />
          <Text style={styles.rangeLabel}>Min: </Text>
          <Text style={styles.rangeValue}>₹{formatPrice(item.min_price)}</Text>
        </View>
        <View style={styles.rangeDivider} />
        <View style={styles.rangeItem}>
          <Ionicons name="arrow-up" size={12} color={COLORS.danger} />
          <Text style={styles.rangeLabel}>Max: </Text>
          <Text style={styles.rangeValue}>₹{formatPrice(item.max_price)}</Text>
        </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  commodityBox: {
    flex: 1,
    marginRight: 12,
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
  modalBox: {
    alignItems: 'flex-end',
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  modalLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'space-around',
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
  },
  rangeLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  rangeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
});
