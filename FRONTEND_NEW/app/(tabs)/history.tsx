import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../store/AuthContext';
import { predictionService } from '../../services/predictionService';
import { PredictionHistoryItem } from '../../types/prediction';
import { PredictionCard } from '../../components/PredictionCard';
import { Input } from '../../components/Input';
import { Header } from '../../components/Header';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/Button';
import { COLORS } from '../../constants/theme';

export default function HistoryScreen() {
  const { isAuthenticated } = useAuth();
  const [predictions, setPredictions] = useState<PredictionHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(
    async (targetPage: number = 1, isRefresh: boolean = false) => {
      if (!isAuthenticated) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const response = await predictionService.getPredictionHistory(
          targetPage,
          10
        );
        if (isRefresh || targetPage === 1) {
          setPredictions(response.results || []);
        } else {
          setPredictions((prev) => [...prev, ...(response.results || [])]);
        }
        setHasMore(!!response.next);
        setPage(targetPage);
      } catch (err) {
        console.warn('History fetch failed:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchHistory(page + 1);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Prediction',
      'Are you sure you want to delete this historical analysis from your records?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await predictionService.deletePrediction(id);
              setPredictions((prev) => prev.filter((p) => p.id !== id));
            } catch {
              Alert.alert('Error', 'Failed to delete prediction record.');
            }
          },
        },
      ]
    );
  };

  const filtered = predictions.filter((item) =>
    item.crop_prediction.crop
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Prediction History" subtitle="Your agricultural log" />
        <View style={styles.authGateBox}>
          <Ionicons name="lock-closed-outline" size={48} color={COLORS.primary} />
          <Text style={styles.authGateTitle}>Sign In Required</Text>
          <Text style={styles.authGateSubtitle}>
            Log in with your account to access your saved predictions, harvest estimates, and historical analytics.
          </Text>
          <Button
            title="Sign In to View History"
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Prediction History"
        subtitle="Chronological log of AI soil analyses and revenue estimates"
      />

      <View style={styles.searchBox}>
        <Input
          placeholder="Filter by crop name (e.g. Rice, Maize)..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Ionicons name="search" size={18} color={COLORS.textMuted} />}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {loading && !refreshing ? (
        <Loading message="Loading prediction logs..." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PredictionCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: '/prediction/[id]',
                  params: { id: item.id },
                })
              }
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>No Predictions Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No historical predictions match your search query.'
                  : 'You have not run any AI predictions yet. Head to Crop AI to get started!'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBox: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  listContent: {
    padding: 20,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  authGateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  authGateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 16,
  },
  authGateSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
