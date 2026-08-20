import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { COLORS } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your registered email address.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Reset Password" showBack />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={40} color={COLORS.secondary} />
        </View>

        {!submitted ? (
          <>
            <Text style={styles.heading}>Forgot your password?</Text>
            <Text style={styles.subtitle}>
              Enter your registered email address and we will assist you in restoring account access.
            </Text>

            <Input
              label="Email Address"
              placeholder="farmer@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />}
            />

            <Button
              title="Send Instructions"
              onPress={handleSubmit}
              style={{ marginTop: 12 }}
            />
          </>
        ) : (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Request Submitted</Text>
            <Text style={styles.successText}>
              If an account with {email} exists, password reset instructions have been logged. Please contact your system administrator or login once resolved.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => router.replace('/(auth)/login')}
              variant="outline"
              style={{ marginTop: 20 }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
