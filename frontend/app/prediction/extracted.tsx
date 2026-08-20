import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { SoilInput } from '@/components/SoilInput';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export default function ExtractedScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();

  // Extracted soil metrics state (pre-populated from OCR scan simulation)
  const [nitrogen, setNitrogen] = useState('90');
  const [phosphorus, setPhosphorus] = useState('42');
  const [potassium, setPotassium] = useState('43');
  const [ph, setPh] = useState('6.5');
  const [organicCarbon, setOrganicCarbon] = useState('0.75');
  const [rainfall, setRainfall] = useState('202');

  const handleGenerateRecommendations = () => {
    router.push('/prediction/result');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <AnimatedCard delay={60}>
          <View style={styles.header}>
            <View style={[styles.successBadge, { backgroundColor: colors.primary.subtle }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary.DEFAULT} />
              <Text style={[styles.successBadgeText, { color: colors.primary.DEFAULT }]}>AI Extraction Complete</Text>
            </View>
            <Text style={[styles.title, { color: activeColors.textPrimary }]}>Extracted Soil Parameters</Text>
            <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
              Review and confirm the soil test values extracted from your report. You can edit any parameter if needed.
            </Text>
          </View>
        </AnimatedCard>

        {/* Section 1: Extracted Nutrients */}
        <AnimatedCard delay={120}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="flask-outline" size={18} color={colors.primary.DEFAULT} />
              </View>
              <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>🌱 Soil Nutrients (NPK)</Text>
            </View>

            <SoilInput
              label="Nitrogen (N)"
              value={nitrogen}
              onChangeText={setNitrogen}
              unit="mg/kg"
              icon="flask-outline"
            />
            <SoilInput
              label="Phosphorus (P)"
              value={phosphorus}
              onChangeText={setPhosphorus}
              unit="mg/kg"
              icon="color-filter-outline"
            />
            <SoilInput
              label="Potassium (K)"
              value={potassium}
              onChangeText={setPotassium}
              unit="mg/kg"
              icon="sparkles-outline"
            />
          </View>
        </AnimatedCard>

        {/* Section 2: Soil Chemistry & pH */}
        <AnimatedCard delay={180}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: colors.accent.light }]}>
                <Ionicons name="options-outline" size={18} color={colors.accent.dark} />
              </View>
              <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>🧪 Soil pH & Organic Matter</Text>
            </View>

            <SoilInput
              label="Soil pH Level"
              value={ph}
              onChangeText={setPh}
              unit="pH"
              icon="speedometer-outline"
            />
            <SoilInput
              label="Organic Carbon (OC)"
              value={organicCarbon}
              onChangeText={setOrganicCarbon}
              unit="%"
              icon="leaf-outline"
            />
          </View>
        </AnimatedCard>

        {/* Section 3: Climate & Location Parameters */}
        <AnimatedCard delay={240}>
          <View style={[styles.card, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="partly-sunny-outline" size={18} color="#0288D1" />
              </View>
              <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>🌦️ Regional Climate Metrics</Text>
            </View>

            <SoilInput
              label="Annual Rainfall"
              value={rainfall}
              onChangeText={setRainfall}
              unit="mm"
              icon="rainy-outline"
            />
          </View>
        </AnimatedCard>

        {/* Primary CTA */}
        <AnimatedCard delay={300} style={{ marginBottom: 28 }}>
          <Button
            title="Generate Crop Recommendations →"
            onPress={handleGenerateRecommendations}
            style={styles.generateBtn}
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
    marginBottom: 18,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  successBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
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
    marginBottom: 16,
  },
  sectionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  generateBtn: {
    height: 52,
    borderRadius: 14,
  },
});
