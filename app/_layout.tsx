import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: colors.primary.DEFAULT,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.neutral.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="prediction/result"
          options={{
            title: 'Prediction Result',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="crops/index"
          options={{
            title: 'Crop Library',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="crops/[id]"
          options={{
            title: 'Crop Details',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            title: 'Settings',
            headerShown: true,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
