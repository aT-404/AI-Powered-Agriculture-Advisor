import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

const EASE_OUT = Easing.out(Easing.cubic);

interface AnimatedCardProps {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  style?: ViewStyle | (ViewStyle | undefined)[];
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  delay = 0,
  duration = 380,
  children,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedCard;
