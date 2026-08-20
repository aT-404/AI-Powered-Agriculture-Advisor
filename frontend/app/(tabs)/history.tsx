import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PredictionCard } from '@/components/PredictionCard';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { PredictionHistoryItem } from '@/types/prediction';
import { useTheme } from '@/store/ThemeContext';
import { getPredictionHistory } from '@/services/predictionService';

export default function HistoryScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();
  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const [historyList, setHistoryList] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getPredictionHistory();
      setHistoryList(data);
    } catch (err) {
      console.error('[HistoryScreen] Failed to load prediction history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const displayedHistory = filter === 'recent' ? historyList.slice(0, 3) : historyList;

  // Compute dynamic stats
  const totalCount = historyList.length;
  const avgMatch = totalCount > 0
    ? Math.round((historyList.reduce((acc, cur) => acc + (cur.confidence || 0), 0) / totalCount) * 100)
    : 0;
  const topCrop = totalCount > 0 ? historyList[0].primaryCropName : 'None';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top', 'bottom']}>
      <FlatList
        data={displayedHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.DEFAULT]} />}
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
                  <Text style={[styles.statValue, { color: colors.primary.DEFAULT }]}>{totalCount}</Text>
                  <Text style={[styles.statLabel, { color: activeColors.textSecondary }]}>Tests Done</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: activeColors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary.DEFAULT }]}>{avgMatch > 0 ? `${avgMatch}%` : '--'}</Text>
                  <Text style={[styles.statLabel, { color: activeColors.textSecondary }]}>Avg Match</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: activeColors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary.DEFAULT }]}>{topCrop}</Text>
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
                    All Reports ({historyList.length})
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
          loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            </View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              <Ionicons name="document-text-outline" size={48} color={activeColors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: activeColors.textPrimary }]}>No Predictions Found</Text>
              <Text style={[styles.emptyDesc, { color: activeColors.textSecondary }]}>
                Start a new soil test prediction to build your history log.
              </Text>
            </View>
          )
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
