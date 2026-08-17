import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Crop } from '@/types/crop';
import { colors } from '@/constants/colors';

export interface CropCardProps {
  crop: Crop;
  onPress?: () => void;
  style?: ViewStyle;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="leaf-outline" size={24} color={colors.primary.DEFAULT} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.cropName}>{crop.name}</Text>
        {crop.scientificName ? (
          <Text style={styles.scientificName}>{crop.scientificName}</Text>
        ) : null}
        <Text style={styles.categoryBadge}>{crop.category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {crop.description}
        </Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.neutral.textMuted} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.neutral.textSecondary,
    marginBottom: 2,
  },
  categoryBadge: {
    fontSize: 11,
    color: colors.primary.dark,
    backgroundColor: colors.primary.subtle,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginVertical: 4,
  },
  description: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
});

export default CropCard;
