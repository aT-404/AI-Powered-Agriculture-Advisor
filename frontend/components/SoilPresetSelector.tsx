import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/store/ThemeContext';

export interface SoilPreset {
  id: string;
  name: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  values: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    ph: string;
    temperature: string;
    humidity: string;
    rainfall: string;
  };
}

export const PRESETS: SoilPreset[] = [
  {
    id: 'fertile-loam',
    name: 'Fertile Loam',
    subtitle: 'Balanced',
    icon: 'leaf-outline',
    values: {
      nitrogen: '90',
      phosphorus: '42',
      potassium: '43',
      ph: '6.5',
      temperature: '25.5',
      humidity: '80',
      rainfall: '202',
    },
  },
  {
    id: 'clay-rice',
    name: 'Clay Paddy',
    subtitle: 'High Moisture',
    icon: 'water-outline',
    values: {
      nitrogen: '120',
      phosphorus: '50',
      potassium: '50',
      ph: '6.2',
      temperature: '28.0',
      humidity: '85',
      rainfall: '300',
    },
  },
  {
    id: 'arid-dry',
    name: 'Arid Field',
    subtitle: 'Low Rainfall',
    icon: 'sunny-outline',
    values: {
      nitrogen: '60',
      phosphorus: '30',
      potassium: '35',
      ph: '7.2',
      temperature: '22.0',
      humidity: '50',
      rainfall: '90',
    },
  },
  {
    id: 'coastal',
    name: 'Coastal',
    subtitle: 'Humid',
    icon: 'boat-outline',
    values: {
      nitrogen: '80',
      phosphorus: '40',
      potassium: '80',
      ph: '6.8',
      temperature: '29.0',
      humidity: '90',
      rainfall: '250',
    },
  },
];

interface SoilPresetSelectorProps {
  activePresetId?: string;
  onSelectPreset: (preset: SoilPreset) => void;
}

export const SoilPresetSelector: React.FC<SoilPresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  const { activeColors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flash-outline" size={14} color={activeColors.primary} />
        <Text style={[styles.headerText, { color: activeColors.primary }]}>
          Presets
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? (isDark ? 'rgba(255, 184, 0, 0.16)' : activeColors.primary)
                    : activeColors.card,
                  borderColor: isSelected ? activeColors.primary : activeColors.border,
                  shadowColor: isSelected && isDark ? activeColors.primary : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isSelected && isDark ? 0.65 : 0,
                  shadowRadius: 8,
                  elevation: isSelected && isDark ? 4 : 0,
                },
              ]}
              onPress={() => onSelectPreset(preset)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={preset.icon}
                size={14}
                color={isSelected ? (isDark ? activeColors.primary : '#FFF') : activeColors.textSecondary}
              />
              <Text
                style={[
                  styles.chipTitle,
                  { color: isSelected ? (isDark ? activeColors.primary : '#FFF') : activeColors.textPrimary },
                ]}
              >
                {preset.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  chipTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SoilPresetSelector;
