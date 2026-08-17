import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';

export default function PredictionResultScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={54} color={colors.primary.DEFAULT} />
        </View>
        <Text style={styles.label}>Top Recommendation</Text>
        <Text style={styles.cropTitle}>Rice (Paddy)</Text>
        <Text style={styles.confidenceBadge}>94% Confidence Score</Text>
        <Text style={styles.description}>
          Your soil parameters (High Nitrogen, neutral pH) and local climate provide the ideal environment for high-yield Rice cultivation.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alternative Crop Matches</Text>
        <View style={styles.altItem}>
          <Text style={styles.altName}>2. Maize</Text>
          <Text style={styles.altScore}>86% match</Text>
        </View>
        <View style={styles.altItem}>
          <Text style={styles.altName}>3. Jute</Text>
          <Text style={styles.altScore}>78% match</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Save & View Crop Details"
          onPress={() => router.push('/crops/rice-01' as any)}
          style={styles.button}
        />
        <Button
          title="New Prediction"
          onPress={() => router.replace('/(tabs)/predict' as any)}
          variant="outline"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  content: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.neutral.textSecondary,
    fontWeight: '600',
  },
  cropTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
    marginTop: 4,
  },
  confidenceBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
    backgroundColor: colors.primary.subtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 12,
  },
  altItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  altName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
  altScore: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  actions: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 10,
  },
});
