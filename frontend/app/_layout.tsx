import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { ThemeProvider, useTheme } from '@/store/ThemeContext';

function RootLayoutNav() {
  const { theme, activeColors } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: activeColors.card,
          },
          headerTintColor: colors.primary.DEFAULT,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: activeColors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="prediction/preview"
          options={{
            title: 'Report Preview',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="prediction/analyzing"
          options={{
            title: 'Analyzing Soil',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="prediction/extracted"
          options={{
            title: 'Extracted Parameters',
            headerShown: true,
          }}
        />
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

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
