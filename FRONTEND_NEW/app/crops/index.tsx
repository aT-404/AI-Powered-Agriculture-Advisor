import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cropService } from '../../services/cropService';
import { Crop } from '../../types/crop';
import { CropCard } from '../../components/CropCard';
import { Input } from '../../components/Input';
import { Header } from '../../components/Header';
import { Loading } from '../../components/Loading';
import { COLORS } from '../../constants/theme';

export default function CropCatalogScreen() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCrops = useCallback(async () => {
    try {
      const data = await cropService.getCrops(search.trim() || undefined);
      setCrops(data);
    } catch (err) {
      console.warn('Crop library fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCrops();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Crop Library"
        subtitle="Agronomic guides, temperature, pH & rainfall requirements"
        showBack
      />

      <View style={styles.searchBox}>
        <Input
          placeholder="Search crop or scientific name..."
          value={search}
          onChangeText={setSearch}
          icon={<Ionicons name="search" size={18} color={COLORS.textMuted} />}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {loading && !refreshing ? (
        <Loading message="Loading crop encyclopedia..." />
      ) : (
        <FlatList
          data={crops}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CropCard
              crop={item}
              onPress={() =>
                router.push({
                  pathname: '/crops/[id]',
                  params: { id: item.id },
                })
              }
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
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="leaf-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Crops Found</Text>
              <Text style={styles.emptySubtitle}>
                No crops match "{search}". Try searching for rice, wheat, cotton, or sugarcane.
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
});
