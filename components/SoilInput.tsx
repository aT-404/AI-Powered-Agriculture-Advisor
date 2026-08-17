import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

export interface SoilInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
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
  error,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {min !== undefined && max !== undefined ? (
          <Text style={styles.rangeText}>
            Range: {min}-{max} {unit}
          </Text>
        ) : null}
      </View>

      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral.textMuted}
          keyboardType="numeric"
        />
        {unit ? <Text style={styles.unitText}>{unit}</Text> : null}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
  rangeText: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: colors.status.error,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 16,
    color: colors.neutral.textPrimary,
  },
  unitText: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    fontWeight: '500',
    marginLeft: 6,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default SoilInput;
