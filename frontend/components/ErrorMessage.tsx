import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

export interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="alert-circle-outline" size={24} color={colors.status.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDEDED',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.status.error,
  },
  retryButton: {
    marginLeft: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.status.error,
    borderRadius: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ErrorMessage;
