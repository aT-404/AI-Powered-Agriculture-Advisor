import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '@/constants/colors';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  containerStyle,
  inputStyle,
  labelStyle,
  secureTextEntry,
  keyboardType = 'default',
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        {...rest}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.textPrimary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.neutral.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: colors.neutral.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;
