import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { WeatherCard } from '@/components/WeatherCard';
import { colors } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, Farmer</Text>
          <Text style={styles.subGreeting}>This is the Home screen</Text>
        </View>

        {/* Live Weather Preview */}
        <WeatherCard />

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Crop Advisor</Text>
          <Text style={styles.cardDescription}>
            Get personalized crop suggestions based on your soil nutrients and climate parameters.
          </Text>
          <Button
            title="Start New Prediction"
            onPress={() => router.push('/(tabs)/predict' as any)}
            style={styles.actionButton}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crop Catalog & Knowledge</Text>
          <Text style={styles.cardDescription}>
            Browse optimal soil requirements, growing seasons, and harvesting guides for various crops.
          </Text>
          <Button
            title="Explore Crop Library"
            onPress={() => router.push('/crops' as any)}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral.textPrimary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  actionButton: {
    marginTop: 4,
  },
});
