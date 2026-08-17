import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CropCard } from '@/components/CropCard';
import { Input } from '@/components/Input';
import { colors } from '@/constants/colors';
import { Crop } from '@/types/crop';

const SAMPLE_CROPS: Crop[] = [
  {
    id: 'rice-01',
    name: 'Rice (Oryza sativa)',
    scientificName: 'Oryza sativa',
    category: 'Cereal',
    description: 'Requires high water availability and warm temperatures. Thrives in clayey loam soils with good water retention.',
  },
  {
    id: 'wheat-02',
    name: 'Wheat (Triticum)',
    scientificName: 'Triticum aestivum',
    category: 'Cereal',
    description: 'Rabi season crop requiring cool growing weather and bright sunshine at ripening.',
  },
  {
    id: 'maize-03',
    name: 'Maize (Corn)',
    scientificName: 'Zea mays',
    category: 'Cereal',
    description: 'Warm weather grain crop, requires well-drained fertile loam soils with adequate nitrogen.',
  },
  {
    id: 'cotton-04',
    name: 'Cotton',
    scientificName: 'Gossypium',
    category: 'Cash Crop',
    description: 'Requires high temperature, light rainfall or irrigation, 210 frost-free days and bright sun-shine.',
  },
];

export default function CropLibraryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filteredCrops = SAMPLE_CROPS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredCrops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Crop Library</Text>
            <Text style={styles.subtitle}>This is the Crop Library index screen</Text>
            <Input
              placeholder="Search crops, cereals, fruits..."
              value={search}
              onChangeText={setSearch}
              containerStyle={styles.searchContainer}
            />
          </View>
        }
        renderItem={({ item }) => (
          <CropCard
            crop={item}
            onPress={() => router.push(`/crops/${item.id}` as any)}
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
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
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
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 8,
  },
});
