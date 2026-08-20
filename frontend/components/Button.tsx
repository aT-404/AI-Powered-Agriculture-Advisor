import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/store/ThemeContext';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { activeColors, isDark } = useTheme();

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: activeColors.border };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: activeColors.primary,
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'primary':
      default:
        return {
          backgroundColor: activeColors.primary,
          shadowColor: isDark ? activeColors.primary : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isDark ? 0.75 : 0,
          shadowRadius: 12,
          elevation: isDark ? 6 : 2,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return activeColors.textPrimary;
      case 'outline':
      case 'ghost':
        return activeColors.primary;
      case 'primary':
      default:
        return isDark ? '#090D16' : '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getContainerStyle(),
        disabled && { backgroundColor: activeColors.border, opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? activeColors.primary : (isDark ? '#090D16' : '#FFFFFF')}
        />
      ) : (
        <Text style={[styles.baseText, { color: getTextColor() }, disabled && { color: activeColors.textMuted }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  baseText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default Button;
