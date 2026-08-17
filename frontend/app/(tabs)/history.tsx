import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PredictionCard } from '@/components/PredictionCard';
import { colors } from '@/constants/colors';
import { PredictionHistoryItem } from '@/types/prediction';

const MOCK_HISTORY: PredictionHistoryItem[] = [
  {
    id: 'hist-1',
    date: new Date().toISOString(),
    primaryCropName: 'Rice',
    confidence: 0.94,
    locationName: 'North Field - Plot A',
  },
  {
    id: 'hist-2',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    primaryCropName: 'Maize',
    confidence: 0.88,
    locationName: 'East Field - Plot B',
  },
  {
    id: 'hist-3',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    primaryCropName: 'Wheat',
    confidence: 0.82,
    locationName: 'South Field - Plot C',
  },
];

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Prediction History</Text>
            <Text style={styles.subtitle}>This is the Prediction History screen</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PredictionCard
            prediction={item}
            onPress={() => router.push('/prediction/result')}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
    marginTop: 4,
  },
});
