import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export default function CropDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeColors } = useTheme();

  const formattedName = (id || 'Rice').replace(/-/g, ' ').replace(/\d+/g, '').trim();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Hero Card */}
        <AnimatedCard delay={60}>
          <View style={[styles.heroCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="leaf" size={42} color={colors.primary.DEFAULT} />
            </View>
            <Text style={[styles.cropName, { color: activeColors.textPrimary }]}>{formattedName}</Text>
            <Text style={[styles.scientificName, { color: activeColors.textSecondary }]}>Oryza sativa L.</Text>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary.subtle }]}>
              <Ionicons name="sparkles" size={12} color={colors.primary.DEFAULT} />
              <Text style={[styles.categoryBadgeText, { color: colors.primary.DEFAULT }]}>Cereal Crop</Text>
            </View>
            <Text style={[styles.heroDesc, { color: activeColors.textSecondary }]}>
              High-yielding grain crop requiring warm temperatures, adequate sunlight, and well-drained fertile clay-loam soil.
            </Text>
          </View>
        </AnimatedCard>

        {/* Card 1: Soil Conditions */}
        <AnimatedCard delay={120}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="flask-outline" size={18} color={colors.primary.DEFAULT} />
              </View>
              <Text style={[styles.cardHeading, { color: activeColors.textPrimary }]}>🌱 Optimal Soil Conditions</Text>
            </View>

            <View style={[styles.metricRow, { borderBottomColor: activeColors.border }]}>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Soil pH Range</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>5.5 – 7.0 (Slightly Acidic)</Text>
            </View>
            <View style={[styles.metricRow, { borderBottomColor: activeColors.border }]}>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Nitrogen (N)</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>80 – 120 kg/ha</Text>
            </View>
            <View style={[styles.metricRow, { borderBottomColor: activeColors.border }]}>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Phosphorus (P)</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>35 – 55 kg/ha</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Potassium (K)</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>35 – 50 kg/ha</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Card 2: Climate & Growth */}
        <AnimatedCard delay={180}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBadge, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="partly-sunny-outline" size={18} color="#0288D1" />
              </View>
              <Text style={[styles.cardHeading, { color: activeColors.textPrimary }]}>🌦️ Climate & Growth Duration</Text>
            </View>

            <View style={[styles.metricRow, { borderBottomColor: activeColors.border }]}>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Optimal Temperature</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>20°C – 35°C</Text>
            </View>
            <View style={[styles.metricRow, { borderBottomColor: activeColors.border }]}>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Growth Duration</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>120 – 150 Days</Text>
            </View>
            <View style={[styles.metricRow, { borderBottomColor: activeColors.border }]}>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Sowing Season</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>Kharif (Monsoon)</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Water Need</Text>
              <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>150 – 250 mm / month</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Card 3: Farming Tips */}
        <AnimatedCard delay={240}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBadge, { backgroundColor: colors.accent.light }]}>
                <Ionicons name="bulb-outline" size={18} color={colors.accent.dark} />
              </View>
              <Text style={[styles.cardHeading, { color: activeColors.textPrimary }]}>💡 Agronomic Recommendations</Text>
            </View>
            <Text style={[styles.tipText, { color: activeColors.textSecondary }]}>
              • Maintain 2–5 cm of standing water during panicle initiation.{'\n'}
              • Apply split dosage of Nitrogen (50% basal, 25% tillering, 25% panicle).{'\n'}
              • Monitor regularly for bacterial leaf blight during humid periods.
            </Text>
          </View>
        </AnimatedCard>

        {/* Action Button */}
        <AnimatedCard delay={300} style={{ marginBottom: 28 }}>
          <Button
            title="Check My Soil For This Crop"
            onPress={() => router.push('/(tabs)/predict')}
            style={styles.predictBtn}
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
  heroCard: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cropName: {
    fontSize: 22,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  scientificName: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
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
    marginBottom: 14,
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
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  metricLabel: {
    fontSize: 13,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
  predictBtn: {
    height: 52,
    borderRadius: 14,
  },
});
