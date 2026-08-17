import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

interface CheckItem {
  id: number;
  label: string;
}

const STEPS: CheckItem[] = [
  { id: 1, label: 'Reading document image & OCR scanning...' },
  { id: 2, label: 'Extracting NPK (Nitrogen, Phosphorus, Potassium)...' },
  { id: 3, label: 'Calculating Soil pH & moisture levels...' },
  { id: 4, label: 'Matching crop suitability algorithms...' },
];

export default function AnalyzingScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();
  const { imageUri, fileName, fileType, source } = useLocalSearchParams<{
    imageUri?: string;
    fileName?: string;
    fileType?: string;
    source?: string;
  }>();

  const [activeStep, setActiveStep] = useState(1);

  // Radar Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation effect
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Step progress timer
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 600);

    // Auto-advance to Extracted Parameters screen after 2.5s
    const timeout = setTimeout(() => {
      router.replace({
        pathname: '/prediction/extracted',
        params: { imageUri, fileName, fileType, source },
      } as any);
    }, 2600);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        
        {/* Animated Radar Pulse Badge */}
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.pulseCircle,
              { backgroundColor: colors.primary.subtle, transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Animated.View style={[styles.spinRing, { transform: [{ rotate: spin }] }]}>
            <View style={[styles.spinDot, { backgroundColor: colors.primary.DEFAULT }]} />
          </Animated.View>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={38} color="#fff" />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: activeColors.textPrimary }]}>Analyzing Soil Report</Text>
        <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
          Please wait while AI extracts nutrients & calculates crop compatibility...
        </Text>

        {/* Step Progress Checklist */}
        <View style={[styles.checklistCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
          {STEPS.map((step) => {
            const isDone = activeStep > step.id;
            const isCurrent = activeStep === step.id;

            return (
              <View key={step.id} style={styles.checkRow}>
                <View
                  style={[
                    styles.checkBadge,
                    isDone
                      ? { backgroundColor: colors.primary.DEFAULT }
                      : isCurrent
                      ? { backgroundColor: colors.primary.subtle, borderWidth: 1, borderColor: colors.primary.DEFAULT }
                      : { backgroundColor: activeColors.background },
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : isCurrent ? (
                    <Ionicons name="sync" size={14} color={colors.primary.DEFAULT} />
                  ) : (
                    <Text style={[styles.stepNum, { color: activeColors.textSecondary }]}>{step.id}</Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.stepLabel,
                    isDone
                      ? { color: activeColors.textPrimary, fontWeight: '700' }
                      : isCurrent
                      ? { color: colors.primary.DEFAULT, fontWeight: '700' }
                      : { color: activeColors.textSecondary },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  pulseCircle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  spinRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.primary.DEFAULT,
  },
  spinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 4,
    right: 20,
  },
  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.dark,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  checklistCard: {
    width: '100%',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepLabel: {
    flex: 1,
    fontSize: 13,
  },
});
