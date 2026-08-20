import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../store/AuthContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="prediction/[id]"
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="crops/index"
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="crops/[id]"
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="settings/index"
            options={{ presentation: 'card' }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
