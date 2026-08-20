import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export interface NutrientGaugeInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  min: number;
  max: number;
  unit: string;
  step?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  optimalRange?: { min: number; max: number };
  style?: ViewStyle;
}

export const NutrientGaugeInput: React.FC<NutrientGaugeInputProps> = ({
  label,
  value,
  onChangeText,
  min,
  max,
  unit,
  step = 1,
  icon,
  optimalRange,
  style,
}) => {
  const { activeColors, isDark } = useTheme();

  const numericValue = parseFloat(value) || 0;

  const handleDecrement = () => {
    const newValue = Math.max(min, numericValue - step);
    onChangeText(Number.isInteger(step) ? String(Math.round(newValue)) : newValue.toFixed(1));
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, numericValue + step);
    onChangeText(Number.isInteger(step) ? String(Math.round(newValue)) : newValue.toFixed(1));
  };

  const percent = Math.min(100, Math.max(0, ((numericValue - min) / (max - min)) * 100));

  let statusColor = activeColors.primary;
  let statusLabel = 'Optimal';

  if (optimalRange) {
    if (numericValue < optimalRange.min) {
      statusColor = isDark ? '#F97316' : colors.status.warning;
      statusLabel = 'Low';
    } else if (numericValue > optimalRange.max) {
      statusColor = isDark ? colors.neon.cyan : colors.status.info;
      statusLabel = 'High';
    } else {
      statusColor = activeColors.primary;
      statusLabel = 'Optimal';
    }
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.labelGroup}>
          {icon && (
            <View style={[styles.iconBox, { backgroundColor: isDark ? statusColor + '20' : activeColors.primarySubtle, borderColor: isDark ? statusColor + '60' : activeColors.border }]}>
              <Ionicons name={icon} size={15} color={statusColor} />
            </View>
          )}
          <Text style={[styles.label, { color: activeColors.textPrimary }]}>{label}</Text>
        </View>

        <View style={styles.statusGroup}>
          {optimalRange && (
            <View style={[styles.statusBadge, { backgroundColor: isDark ? statusColor + '25' : activeColors.primarySubtle, borderColor: isDark ? statusColor + '80' : activeColors.border }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          )}
          <Text style={[styles.rangeHint, { color: activeColors.textSecondary }]}>
            {min}-{max} {unit}
          </Text>
        </View>
      </View>

      {/* Control Input Row */}
      <View style={[styles.controlRow, { backgroundColor: activeColors.background, borderColor: activeColors.border }]}>
        <TouchableOpacity
          style={[styles.stepButton, { borderColor: isDark ? statusColor + '40' : activeColors.border, backgroundColor: isDark ? statusColor + '10' : activeColors.card }]}
          onPress={handleDecrement}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={16} color={statusColor} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: activeColors.textPrimary }]}
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            selectTextOnFocus
          />
          <Text style={[styles.unitText, { color: activeColors.textSecondary }]}>{unit}</Text>
        </View>

        <TouchableOpacity
          style={[styles.stepButton, { borderColor: isDark ? statusColor + '40' : activeColors.border, backgroundColor: isDark ? statusColor + '10' : activeColors.card }]}
          onPress={handleIncrement}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={statusColor} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={[styles.gaugeTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
        <View
          style={[
            styles.gaugeFill,
            {
              width: `${percent}%`,
              backgroundColor: statusColor,
              shadowColor: isDark ? statusColor : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isDark ? 0.95 : 0,
              shadowRadius: 6,
              elevation: isDark ? 4 : 0,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rangeHint: {
    fontSize: 11,
    fontWeight: '500',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    height: 46,
  },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  input: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 45,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  gaugeTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'visible',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default NutrientGaugeInput;
