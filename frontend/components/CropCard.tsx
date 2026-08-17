import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Crop } from '@/types/crop';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export interface CropCardProps {
  crop: Crop;
  onPress?: () => void;
  variant?: 'list' | 'grid';
  style?: ViewStyle;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, onPress, variant = 'list', style }) => {
  const { activeColors } = useTheme();

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        style={[
          styles.gridCard,
          { backgroundColor: activeColors.card, borderColor: activeColors.border },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.75}
        disabled={!onPress}
      >
        <View style={[styles.gridIconContainer, { backgroundColor: colors.primary.subtle }]}>
          <Ionicons name="leaf" size={24} color={colors.primary.DEFAULT} />
        </View>
        <Text style={[styles.gridCropName, { color: activeColors.textPrimary }]} numberOfLines={1}>
          {crop.name.split(' (')[0]}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary.subtle }]}>
          <Text style={[styles.categoryBadgeText, { color: colors.primary.DEFAULT }]}>
            {crop.category}
          </Text>
        </View>
        <Text style={[styles.gridDesc, { color: activeColors.textSecondary }]} numberOfLines={2}>
          {crop.description}
        </Text>
        <View style={styles.gridFooter}>
          <Text style={[styles.viewDetailsText, { color: colors.primary.DEFAULT }]}>View Details →</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.listCard,
        { backgroundColor: activeColors.card, borderColor: activeColors.border },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
    >
      <View style={[styles.listIconContainer, { backgroundColor: colors.primary.subtle }]}>
        <Ionicons name="leaf" size={24} color={colors.primary.DEFAULT} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.cropName, { color: activeColors.textPrimary }]}>{crop.name}</Text>
        {crop.scientificName ? (
          <Text style={[styles.scientificName, { color: activeColors.textSecondary }]}>
            {crop.scientificName}
          </Text>
        ) : null}
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary.subtle }]}>
          <Text style={[styles.categoryBadgeText, { color: colors.primary.DEFAULT }]}>
            {crop.category}
          </Text>
        </View>
        <Text style={[styles.description, { color: activeColors.textSecondary }]} numberOfLines={2}>
          {crop.description}
        </Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={activeColors.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Card
  gridCard: {
    flex: 1,
    margin: 6,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  gridIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridCropName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginVertical: 6,
  },
  gridFooter: {
    marginTop: 8,
    paddingTop: 8,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // List Card
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  listIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});

export default CropCard;
