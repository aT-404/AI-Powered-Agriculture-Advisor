import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Crop } from '../types/crop';
import { COLORS, SHADOWS } from '../constants/theme';

interface CropCardProps {
  crop: Crop;
  onPress: () => void;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, SHADOWS.sm]}
    >
      <View style={styles.iconBox}>
        <Ionicons name="leaf" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{crop.name}</Text>
        {crop.scientific_name ? (
          <Text style={styles.scientific}>{crop.scientific_name}</Text>
        ) : null}
        <Text numberOfLines={2} style={styles.description}>
          {crop.description}
        </Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Ionicons name="thermometer-outline" size={12} color={COLORS.primaryDark} />
            <Text style={styles.tagText}>
              {crop.ideal_temperature_min}° - {crop.ideal_temperature_max}°C
            </Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="water-outline" size={12} color={COLORS.secondary} />
            <Text style={[styles.tagText, { color: COLORS.secondary }]}>
              {crop.ideal_rainfall_min} - {crop.ideal_rainfall_max} mm
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  scientific: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
});
