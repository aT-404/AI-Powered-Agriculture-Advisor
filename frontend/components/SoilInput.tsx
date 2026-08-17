import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export interface SoilInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  style?: ViewStyle;
}

export const SoilInput: React.FC<SoilInputProps> = ({
  label,
  value,
  onChangeText,
  unit,
  placeholder = '0',
  min,
  max,
  icon,
  error,
  style,
}) => {
  const { activeColors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <View style={styles.labelWithIcon}>
          {icon ? (
            <Ionicons name={icon} size={16} color={colors.primary.DEFAULT} style={styles.inputIcon} />
          ) : null}
          <Text style={[styles.label, { color: activeColors.textPrimary }]}>{label}</Text>
        </View>
        {min !== undefined && max !== undefined ? (
          <Text style={[styles.rangeText, { color: activeColors.textSecondary }]}>
            Target: {min}-{max} {unit}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: activeColors.background,
            borderColor: error ? colors.status.error : activeColors.border,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: activeColors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={activeColors.textSecondary}
          keyboardType="numeric"
        />
        {unit ? <Text style={[styles.unitText, { color: activeColors.textSecondary }]}>{unit}</Text> : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  rangeText: {
    fontSize: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default SoilInput;
