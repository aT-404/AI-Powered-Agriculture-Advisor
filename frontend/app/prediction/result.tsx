import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export default function PredictionResultScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header Title */}
        <AnimatedCard delay={60}>
          <View style={styles.header}>
            <Text style={[styles.headerSub, { color: activeColors.textSecondary }]}>YOUR CROP RECOMMENDATION</Text>
            <Text style={[styles.headerTitle, { color: activeColors.textPrimary }]}>AI Analysis Complete 🎉</Text>
          </View>
        </AnimatedCard>

        {/* Hero Result Card */}
        <AnimatedCard delay={120}>
          <View style={[styles.heroCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={56} color={colors.primary.DEFAULT} />
            </View>
            
            <Text style={[styles.cropTitle, { color: activeColors.textPrimary }]}>Rice (Paddy)</Text>

            <View style={[styles.confidenceBadge, { backgroundColor: colors.primary.subtle }]}>
              <Ionicons name="sparkles" size={14} color={colors.primary.DEFAULT} />
              <Text style={[styles.confidenceText, { color: colors.primary.DEFAULT }]}>94% Suitability Score</Text>
            </View>

            <Text style={[styles.description, { color: activeColors.textSecondary }]}>
              Your soil parameters (High Nitrogen N=90, pH=6.5) combined with local rainfall and temperature metrics present optimal conditions for high-yield Rice cultivation.
            </Text>
          </View>
        </AnimatedCard>

        {/* Breakdown 2x2 Grid */}
        <AnimatedCard delay={180}>
          <Text style={[styles.sectionHeadingLabel, { color: activeColors.textSecondary }]}>COMPATIBILITY BREAKDOWN</Text>
          <View style={styles.gridRow}>
            <View style={[styles.miniCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <View style={[styles.miniIconWrap, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="flask" size={18} color={colors.primary.DEFAULT} />
              </View>
              <Text style={[styles.miniLabel, { color: activeColors.textSecondary }]}>Soil Compatibility</Text>
              <Text style={[styles.miniValue, { color: colors.primary.DEFAULT }]}>96% Excellent</Text>
            </View>

            <View style={[styles.miniCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <View style={[styles.miniIconWrap, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="partly-sunny" size={18} color="#0288D1" />
              </View>
              <Text style={[styles.miniLabel, { color: activeColors.textSecondary }]}>Climate Match</Text>
              <Text style={[styles.miniValue, { color: '#0288D1' }]}>92% Optimal</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={[styles.miniCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <View style={[styles.miniIconWrap, { backgroundColor: '#E1F5FE' }]}>
                <Ionicons name="water" size={18} color="#0288D1" />
              </View>
              <Text style={[styles.miniLabel, { color: activeColors.textSecondary }]}>Water Need</Text>
              <Text style={[styles.miniValue, { color: activeColors.textPrimary }]}>200 mm/month</Text>
            </View>

            <View style={[styles.miniCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <View style={[styles.miniIconWrap, { backgroundColor: colors.accent.light }]}>
                <Ionicons name="calendar" size={18} color={colors.accent.dark} />
              </View>
              <Text style={[styles.miniLabel, { color: activeColors.textSecondary }]}>Growing Season</Text>
              <Text style={[styles.miniValue, { color: activeColors.textPrimary }]}>Kharif (120 days)</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Why This Crop? Card */}
        <AnimatedCard delay={240}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBadge, { backgroundColor: colors.accent.light }]}>
                <Ionicons name="bulb-outline" size={18} color={colors.accent.dark} />
              </View>
              <Text style={[styles.cardHeading, { color: activeColors.textPrimary }]}>Why this crop?</Text>
            </View>
            <Text style={[styles.whyText, { color: activeColors.textSecondary }]}>
              1. Your Nitrogen levels (90 mg/kg) support heavy panicle development.{'\n'}
              2. Your Soil pH of 6.5 allows maximum nutrient bioavailability.{'\n'}
              3. Temperature of 25.5°C ensures rapid seed germination without heat stress.
            </Text>
          </View>
        </AnimatedCard>

        {/* Alternative Crop Matches */}
        <AnimatedCard delay={300}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <Text style={[styles.cardHeading, { color: activeColors.textPrimary, marginBottom: 12 }]}>
              Alternative Crop Matches
            </Text>
            
            <TouchableOpacity
              style={[styles.altItem, { borderBottomColor: activeColors.border }]}
              onPress={() => router.push('/crops/maize-03' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.altLeft}>
                <Ionicons name="leaf-outline" size={16} color={colors.primary.DEFAULT} style={{ marginRight: 8 }} />
                <Text style={[styles.altName, { color: activeColors.textPrimary }]}>2. Maize (Corn)</Text>
              </View>
              <View style={[styles.altBadge, { backgroundColor: colors.primary.subtle }]}>
                <Text style={[styles.altScore, { color: colors.primary.DEFAULT }]}>86% Match</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.altItem}
              onPress={() => router.push('/crops/cotton-04' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.altLeft}>
                <Ionicons name="leaf-outline" size={16} color={colors.primary.DEFAULT} style={{ marginRight: 8 }} />
                <Text style={[styles.altName, { color: activeColors.textPrimary }]}>3. Cotton</Text>
              </View>
              <View style={[styles.altBadge, { backgroundColor: colors.primary.subtle }]}>
                <Text style={[styles.altScore, { color: colors.primary.DEFAULT }]}>78% Match</Text>
              </View>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Action Buttons */}
        <AnimatedCard delay={360} style={{ marginBottom: 28 }}>
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
        </AnimatedCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  header: {
    marginBottom: 16,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroCard: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    marginBottom: 10,
  },
  cropTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  sectionHeadingLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 2,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  miniCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  miniIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  miniValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  whyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  altItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  altLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  altName: {
    fontSize: 14,
    fontWeight: '600',
  },
  altBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  altScore: {
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    marginBottom: 10,
    height: 50,
    borderRadius: 14,
  },
});
