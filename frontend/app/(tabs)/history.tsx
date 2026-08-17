import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PredictionCard } from '@/components/PredictionCard';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { PredictionHistoryItem } from '@/types/prediction';
import { useTheme } from '@/store/ThemeContext';

const MOCK_HISTORY: PredictionHistoryItem[] = [
  {
    id: 'hist-1',
    date: new Date().toISOString(),
    primaryCropName: 'Rice (Paddy)',
    confidence: 0.94,
    locationName: 'North Field - Plot A',
  },
  {
    id: 'hist-2',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    primaryCropName: 'Maize (Corn)',
    confidence: 0.88,
    locationName: 'East Field - Plot B',
  },
  {
    id: 'hist-3',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    primaryCropName: 'Wheat (Winter)',
    confidence: 0.82,
    locationName: 'South Field - Plot C',
  },
  {
    id: 'hist-4',
    date: new Date(Date.now() - 86400000 * 14).toISOString(),
    primaryCropName: 'Cotton',
    confidence: 0.91,
    locationName: 'West Field - Plot D',
  },
];

export default function HistoryScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();
  const [filter, setFilter] = useState<'all' | 'recent'>('all');

  const displayedHistory = filter === 'recent' ? MOCK_HISTORY.slice(0, 2) : MOCK_HISTORY;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top', 'bottom']}>
      <FlatList
        data={displayedHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Header */}
            <AnimatedCard delay={60}>
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={[styles.headerIconBadge, { backgroundColor: colors.primary.subtle }]}>
                    <Ionicons name="time" size={22} color={colors.primary.DEFAULT} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: activeColors.textPrimary }]}>
                      Prediction History
                    </Text>
                    <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
                      Track past soil reports & crop predictions
                    </Text>
                  </View>
                </View>
              </View>
            </AnimatedCard>

            {/* Quick Stats Grid */}
            <AnimatedCard delay={120}>
              <View style={[styles.statsCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary.DEFAULT }]}>4</Text>
                  <Text style={[styles.statLabel, { color: activeColors.textSecondary }]}>Tests Done</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: activeColors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary.DEFAULT }]}>89%</Text>
                  <Text style={[styles.statLabel, { color: activeColors.textSecondary }]}>Avg Match</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: activeColors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary.DEFAULT }]}>Rice</Text>
                  <Text style={[styles.statLabel, { color: activeColors.textSecondary }]}>Top Crop</Text>
                </View>
              </View>
            </AnimatedCard>

            {/* Filter Chips */}
            <AnimatedCard delay={180}>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filter === 'all'
                      ? { backgroundColor: colors.primary.DEFAULT }
                      : { backgroundColor: activeColors.card, borderWidth: 1, borderColor: activeColors.border },
                  ]}
                  onPress={() => setFilter('all')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filter === 'all' ? { color: '#fff' } : { color: activeColors.textPrimary },
                    ]}
                  >
                    All Reports ({MOCK_HISTORY.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filter === 'recent'
                      ? { backgroundColor: colors.primary.DEFAULT }
                      : { backgroundColor: activeColors.card, borderWidth: 1, borderColor: activeColors.border },
                  ]}
                  onPress={() => setFilter('recent')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filter === 'recent' ? { color: '#fff' } : { color: activeColors.textPrimary },
                    ]}
                  >
                    Recent
                  </Text>
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimatedCard delay={200 + index * 60}>
            <PredictionCard
              prediction={item}
              onPress={() => router.push('/prediction/result')}
            />
          </AnimatedCard>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <Ionicons name="document-text-outline" size={48} color={activeColors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: activeColors.textPrimary }]}>No Predictions Found</Text>
            <Text style={[styles.emptyDesc, { color: activeColors.textSecondary }]}>
              Start a new soil test prediction to build your history log.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  headerContainer: {
    marginBottom: 12,
  },
  header: {
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
