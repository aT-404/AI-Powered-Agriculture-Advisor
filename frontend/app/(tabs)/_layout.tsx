import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

import { AssistantModal } from '@/components/AssistantModal';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { activeColors } = useTheme();
  const [isAssistantVisible, setIsAssistantVisible] = React.useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary.DEFAULT,
          tabBarInactiveTintColor: activeColors.textSecondary,
          tabBarStyle: {
            backgroundColor: activeColors.card,
            borderTopColor: activeColors.border,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 10,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          headerStyle: {
            backgroundColor: activeColors.card,
          },
          headerTintColor: activeColors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="predict"
          options={{
            title: 'Predict Crop',
            headerShown: false,
            tabBarLabel: 'Predict',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="yield-predict"
          options={{
            title: 'Yield Predict',
            headerShown: false,
            tabBarLabel: 'Yield',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            headerShown: false,
            tabBarLabel: 'History',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'time' : 'time-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="simulation"
          options={{
            title: 'Simulation',
            headerShown: false,
            tabBarLabel: 'Simulate',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'options' : 'options-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      
      {/* Floating AI Assistant Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setIsAssistantVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={24} color="#fff" />
      </TouchableOpacity>
      
      <AssistantModal 
        visible={isAssistantVisible} 
        onClose={() => setIsAssistantVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90, // Above the bottom tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.dark,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
