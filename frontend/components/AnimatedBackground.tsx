import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';
import { useTheme } from '@/store/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  const { activeColors, isDark } = useTheme();

  // Floating animation values
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Orb 1 floating loop
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Orb 2 floating loop (staggered timing)
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 10000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 10000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Breathing pulse loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop1.start();
    loop2.start();
    pulseLoop.start();

    return () => {
      loop1.stop();
      loop2.stop();
      pulseLoop.stop();
    };
  }, []);

  const orb1TranslateY = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 35],
  });

  const orb1TranslateX = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 25],
  });

  const orb2TranslateY = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [30, -30],
  });

  const orb2TranslateX = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -20],
  });

  const primaryGlowColor = isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.10)';
  const secondaryGlowColor = isDark ? 'rgba(6, 78, 59, 0.28)' : 'rgba(5, 150, 105, 0.08)';

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      {/* Background Animated Ambient Orbs */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Orb 1: Top Right Ambient Glow */}
        <Animated.View
          style={[
            styles.glowOrb,
            {
              width: SCREEN_WIDTH * 0.85,
              height: SCREEN_WIDTH * 0.85,
              borderRadius: (SCREEN_WIDTH * 0.85) / 2,
              top: -60,
              right: -50,
              backgroundColor: primaryGlowColor,
              opacity: pulseAnim,
              transform: [
                { translateY: orb1TranslateY },
                { translateX: orb1TranslateX },
              ],
            },
          ]}
        />

        {/* Orb 2: Middle-Bottom Left Glow */}
        <Animated.View
          style={[
            styles.glowOrb,
            {
              width: SCREEN_WIDTH * 0.9,
              height: SCREEN_WIDTH * 0.9,
              borderRadius: (SCREEN_WIDTH * 0.9) / 2,
              bottom: SCREEN_HEIGHT * 0.15,
              left: -80,
              backgroundColor: secondaryGlowColor,
              opacity: pulseAnim,
              transform: [
                { translateY: orb2TranslateY },
                { translateX: orb2TranslateX },
              ],
            },
          ]}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    filter: 'blur(30px)' as any,
  },
});

export default AnimatedBackground;
