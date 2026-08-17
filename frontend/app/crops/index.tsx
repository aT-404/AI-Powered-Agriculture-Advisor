import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CropCard } from '@/components/CropCard';
import { Input } from '@/components/Input';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { Crop } from '@/types/crop';
import { useTheme } from '@/store/ThemeContext';

const CATEGORIES = ['All', 'Cereal', 'Vegetables', 'Fruits', 'Cash Crop'];

const SAMPLE_CROPS: Crop[] = [
  {
    id: 'rice-01',
    name: 'Rice (Oryza sativa)',
    scientificName: 'Oryza sativa',
    category: 'Cereal',
    description: 'Requires high water availability and warm temperatures. Thrives in clayey loam soils with good water retention (pH 5.5 - 7.0).',
  },
  {
    id: 'wheat-02',
    name: 'Wheat (Triticum)',
    scientificName: 'Triticum aestivum',
    category: 'Cereal',
    description: 'Rabi season crop requiring cool growing weather and bright sunshine at ripening (pH 6.0 - 7.5).',
  },
  {
    id: 'maize-03',
    name: 'Maize (Corn)',
    scientificName: 'Zea mays',
    category: 'Cereal',
    description: 'Warm weather grain crop, requires well-drained fertile loam soils with adequate nitrogen (pH 5.8 - 7.0).',
  },
  {
    id: 'cotton-04',
    name: 'Cotton',
    scientificName: 'Gossypium',
    category: 'Cash Crop',
    description: 'Requires high temperature, light rainfall or irrigation, 210 frost-free days and bright sunshine (pH 6.0 - 8.0).',
  },
  {
    id: 'sugarcane-05',
    name: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    category: 'Cash Crop',
    description: 'Tropical crop requiring hot humid climate, deep well-drained soil rich in organic matter (pH 6.0 - 7.5).',
  },
  {
    id: 'tomato-06',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    category: 'Vegetable',
    description: 'Popular vegetable crop requiring well-drained sandy loam soil with good sunshine (pH 6.0 - 6.8).',
  },
];

export default function CropLibraryScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCrops = SAMPLE_CROPS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || c.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top', 'bottom']}>
      <FlatList
        data={filteredCrops}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Re-render FlatList on viewMode toggle
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Header */}
            <AnimatedCard delay={60}>
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={[styles.headerIconBadge, { backgroundColor: colors.accent.light }]}>
                    <Ionicons name="library" size={22} color={colors.accent.dark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: activeColors.textPrimary }]}>Crop Knowledge</Text>
                    <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
                      Explore crops and their growing requirements
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.viewToggleBtn, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
                    onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    <Ionicons
                      name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
                      size={20}
                      color={activeColors.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedCard>

            {/* Search Bar */}
            <AnimatedCard delay={120}>
              <View style={styles.searchWrap}>
                <Input
                  placeholder="Search crops, cereals, fruits..."
                  value={search}
                  onChangeText={setSearch}
                  containerStyle={styles.searchContainer}
                />
              </View>
            </AnimatedCard>

            {/* Horizontal Category Chips */}
            <AnimatedCard delay={180}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroll}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        isSelected
                          ? { backgroundColor: colors.primary.DEFAULT }
                          : { backgroundColor: activeColors.card, borderWidth: 1, borderColor: activeColors.border },
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? { color: '#fff' } : { color: activeColors.textPrimary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </AnimatedCard>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimatedCard delay={200 + index * 40} style={{ flex: viewMode === 'grid' ? 0.5 : 1 }}>
            <CropCard
              crop={item}
              variant={viewMode}
              onPress={() => router.push(`/crops/${item.id}` as any)}
            />
          </AnimatedCard>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <Ionicons name="search-outline" size={48} color={activeColors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: activeColors.textPrimary }]}>No Crops Found</Text>
            <Text style={[styles.emptyDesc, { color: activeColors.textSecondary }]}>
              Try adjusting your search query or category filter.
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
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
  },
  headerContainer: {
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  header: {
    marginBottom: 14,
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
  viewToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 0,
  },
  chipScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
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
    marginHorizontal: 4,
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
