import React from 'react';
import { Tabs } from 'expo-router';
import { Image, View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/store/ThemeContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';

const NAV_ICONS = {
  home: require('@/assets/images/nav_home.png'),
  predict: require('@/assets/images/nav_predict.png'),
  yield: require('@/assets/images/nav_yield.png'),
  history: require('@/assets/images/nav_history.png'),
  simulation: require('@/assets/images/nav_simulation.png'),
  profile: require('@/assets/images/nav_profile.png'),
};

function TabImageIcon({ source, focused }: { source: any; focused: boolean }) {
  const { activeColors } = useTheme();
  return (
    <View
      style={[
        styles.tabIconWrap,
        focused && [
          styles.tabIconWrapActive,
          { backgroundColor: activeColors.primarySubtle, borderColor: activeColors.primary, borderWidth: 1 },
        ],
      ]}
    >
      <Image
        source={source}
        style={[
          styles.tabIconImage,
          {
            opacity: focused ? 1 : 0.55,
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

export default function TabLayout() {
  const { activeColors, isDark } = useTheme();

  return (
    <AnimatedBackground>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            tabBarActiveTintColor: activeColors.primary,
            tabBarInactiveTintColor: activeColors.textSecondary,
            tabBarStyle: {
              position: 'absolute',
              bottom: Platform.OS === 'ios' ? 24 : 16,
              left: 16,
              right: 16,
              height: 64,
              borderRadius: 32,
              backgroundColor: activeColors.card,
              borderColor: activeColors.border,
              borderWidth: 1,
              paddingBottom: 0,
              paddingTop: 0,
              elevation: 12,
              shadowColor: activeColors.primary,
              shadowOpacity: isDark ? 0.35 : 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              backdropFilter: 'blur(24px)' as any,
              WebkitBackdropFilter: 'blur(24px)' as any,
            } as any,
            headerStyle: {
              backgroundColor: activeColors.card,
            },
            headerTintColor: activeColors.textPrimary,
            headerTitleStyle: {
              fontWeight: '700',
            },
            sceneStyle: {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabImageIcon source={NAV_ICONS.home} focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="predict"
            options={{
              title: 'Predict Crop',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabImageIcon source={NAV_ICONS.predict} focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="yield-predict"
            options={{
              title: 'Yield Predict',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabImageIcon source={NAV_ICONS.yield} focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'History',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabImageIcon source={NAV_ICONS.history} focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="simulation"
            options={{
              title: 'Simulation',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabImageIcon source={NAV_ICONS.simulation} focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabImageIcon source={NAV_ICONS.profile} focused={focused} />
              ),
            }}
          />
        </Tabs>
      </View>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabIconWrapActive: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIconImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
});
