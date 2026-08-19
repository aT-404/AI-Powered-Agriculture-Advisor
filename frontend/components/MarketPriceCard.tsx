import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketPrice, MarketFilterHierarchy } from '@/types/market';
import { fetchMarketFilters, fetchMarketPrices } from '@/services/marketService';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export interface MarketPriceCardProps {
  selectedCrop?: string;
  onSelectCommodity?: (commodity: string) => void;
  onSetAlert?: (params: { commodity: string; market: string; state: string; district: string; currentPrice: number }) => void;
  style?: ViewStyle;
}

export const MarketPriceCard: React.FC<MarketPriceCardProps> = ({
  selectedCrop,
  onSelectCommodity,
  onSetAlert,
  style,
}) => {
  const { activeColors, isDark } = useTheme();

  const [filters, setFilters] = useState<MarketFilterHierarchy | null>(null);
  const [selectedCommodity, setSelectedCommodity] = useState<string>(selectedCrop || 'Tomato');
  const [selectedState, setSelectedState] = useState<string>('Kerala');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Ernakulam');
  const [selectedMarket, setSelectedMarket] = useState<string>('Muvattupuzha');

  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selector Modal state
  const [modalType, setModalType] = useState<'commodity' | 'state' | 'district' | 'market' | null>(null);

  // Sync when prop selectedCrop changes (e.g. from recommendation result)
  useEffect(() => {
    if (selectedCrop && selectedCrop !== selectedCommodity) {
      setSelectedCommodity(selectedCrop);
    }
  }, [selectedCrop]);

  // Load filter hierarchies on mount
  useEffect(() => {
    const loadFilters = async () => {
      const { data } = await fetchMarketFilters();
      if (data) {
        setFilters(data);
      }
    };
    loadFilters();
  }, []);

  // Fetch prices whenever selections change
  const loadPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await fetchMarketPrices({
        commodity: selectedCommodity,
        state: selectedState,
        district: selectedDistrict,
        market: selectedMarket,
      });

      if (apiError) {
        setError(apiError);
      } else if (data && data.results) {
        setMarketPrices(data.results);
      } else {
        setMarketPrices([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch mandi market prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [selectedCommodity, selectedState, selectedDistrict, selectedMarket]);

  // Derive districts and markets based on selections
  const currentStateObj = filters?.states.find((s) => s.name.toLowerCase() === selectedState.toLowerCase());
  const availableDistricts = currentStateObj ? currentStateObj.districts.map((d) => d.name) : [];
  const currentDistrictObj = currentStateObj?.districts.find((d) => d.name.toLowerCase() === selectedDistrict.toLowerCase());
  const availableMarkets = currentDistrictObj ? currentDistrictObj.markets : [];
  const availableCommodities = filters?.commodities || ['Tomato', 'Rice', 'Wheat', 'Banana', 'Onion', 'Potato', 'Cotton', 'Rubber', 'Black Pepper', 'Cardamom', 'Coffee'];

  const handleCommodityChange = (cmd: string) => {
    setSelectedCommodity(cmd);
    if (onSelectCommodity) onSelectCommodity(cmd);
    setModalType(null);
  };

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    const stObj = filters?.states.find((s) => s.name.toLowerCase() === st.toLowerCase());
    if (stObj && stObj.districts.length > 0) {
      const firstDist = stObj.districts[0];
      setSelectedDistrict(firstDist.name);
      if (firstDist.markets.length > 0) {
        setSelectedMarket(firstDist.markets[0]);
      }
    }
    setModalType(null);
  };

  const handleDistrictChange = (dst: string) => {
    setSelectedDistrict(dst);
    const dstObj = currentStateObj?.districts.find((d) => d.name.toLowerCase() === dst.toLowerCase());
    if (dstObj && dstObj.markets.length > 0) {
      setSelectedMarket(dstObj.markets[0]);
    }
    setModalType(null);
  };

  const handleMarketChange = (mkt: string) => {
    setSelectedMarket(mkt);
    setModalType(null);
  };

  const primaryPrice = marketPrices.length > 0 ? marketPrices[0] : null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: activeColors.card,
          borderColor: activeColors.border,
        },
        style,
      ]}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="trending-up" size={18} color="#E65100" />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: activeColors.textPrimary }]}>
              Current Mandi Price
            </Text>
            <Text style={[styles.cardSubtitle, { color: activeColors.textSecondary }]}>
              Agmarknet Daily Market Intelligence
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: isDark ? '#2A2A2A' : '#F4F6F8' }]}
          onPress={loadPrices}
          disabled={loading}
        >
          <Ionicons name="refresh-outline" size={16} color={activeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Cascading Filter Selector Chips ──────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {/* Commodity Chip */}
        <TouchableOpacity
          style={[styles.filterChip, { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.subtle }]}
          onPress={() => setModalType('commodity')}
        >
          <Ionicons name="leaf-outline" size={13} color={colors.primary.DEFAULT} />
          <Text style={[styles.filterChipText, { color: colors.primary.DEFAULT, fontWeight: '700' }]}>
            {selectedCommodity}
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.primary.DEFAULT} />
        </TouchableOpacity>

        {/* State Chip */}
        <TouchableOpacity
          style={[styles.filterChip, { borderColor: activeColors.border, backgroundColor: isDark ? '#262626' : '#F9FAFB' }]}
          onPress={() => setModalType('state')}
        >
          <Text style={[styles.filterChipText, { color: activeColors.textPrimary }]}>
            {selectedState}
          </Text>
          <Ionicons name="chevron-down" size={12} color={activeColors.textSecondary} />
        </TouchableOpacity>

        {/* District Chip */}
        <TouchableOpacity
          style={[styles.filterChip, { borderColor: activeColors.border, backgroundColor: isDark ? '#262626' : '#F9FAFB' }]}
          onPress={() => setModalType('district')}
        >
          <Text style={[styles.filterChipText, { color: activeColors.textPrimary }]}>
            {selectedDistrict}
          </Text>
          <Ionicons name="chevron-down" size={12} color={activeColors.textSecondary} />
        </TouchableOpacity>

        {/* Market Chip */}
        <TouchableOpacity
          style={[styles.filterChip, { borderColor: activeColors.border, backgroundColor: isDark ? '#262626' : '#F9FAFB' }]}
          onPress={() => setModalType('market')}
        >
          <Ionicons name="storefront-outline" size={13} color={activeColors.textSecondary} />
          <Text style={[styles.filterChipText, { color: activeColors.textPrimary }]}>
            {selectedMarket}
          </Text>
          <Ionicons name="chevron-down" size={12} color={activeColors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      {/* ── Content: Loading / Error / Price Card ─────────────────────────── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
          <Text style={[styles.loadingText, { color: activeColors.textSecondary }]}>
            Fetching latest mandi rates...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color={colors.status.error} />
          <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary.DEFAULT }]}
            onPress={loadPrices}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : primaryPrice ? (
        <View style={styles.priceContainer}>
          {/* Main Modal Price Box */}
          <View style={[styles.priceHeroBox, { backgroundColor: isDark ? '#1F2923' : '#F0FDF4', borderColor: colors.primary.light }]}>
            <View style={styles.priceHeroLeft}>
              <Text style={[styles.priceLabel, { color: activeColors.textSecondary }]}>MODAL PRICE</Text>
              <View style={styles.priceValueRow}>
                <Text style={[styles.currencySymbol, { color: colors.primary.DEFAULT }]}>₹</Text>
                <Text style={[styles.modalPriceText, { color: colors.primary.DEFAULT }]}>
                  {primaryPrice.modal_price.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.unitText, { color: activeColors.textSecondary }]}>/ Quintal</Text>
              </View>
              <Text style={[styles.marketLocationText, { color: activeColors.textPrimary }]}>
                📍 {primaryPrice.market} Mandi, {primaryPrice.district}
              </Text>
            </View>

            {onSetAlert ? (
              <TouchableOpacity
                style={[styles.alertShortcutBtn, { backgroundColor: colors.primary.DEFAULT }]}
                onPress={() =>
                  onSetAlert({
                    commodity: primaryPrice.commodity,
                    market: primaryPrice.market,
                    state: primaryPrice.state,
                    district: primaryPrice.district,
                    currentPrice: primaryPrice.modal_price,
                  })
                }
              >
                <Ionicons name="notifications-outline" size={14} color="#FFF" />
                <Text style={styles.alertShortcutText}>Set Alert</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Min / Max Range & Metadata Row */}
          <View style={[styles.detailsGrid, { borderTopColor: activeColors.border }]}>
            <View style={styles.detailCol}>
              <Text style={[styles.detailLabel, { color: activeColors.textSecondary }]}>Min Price</Text>
              <Text style={[styles.detailValue, { color: activeColors.textPrimary }]}>
                ₹{primaryPrice.min_price.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.detailCol}>
              <Text style={[styles.detailLabel, { color: activeColors.textSecondary }]}>Max Price</Text>
              <Text style={[styles.detailValue, { color: activeColors.textPrimary }]}>
                ₹{primaryPrice.max_price.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.detailCol}>
              <Text style={[styles.detailLabel, { color: activeColors.textSecondary }]}>Variety</Text>
              <Text style={[styles.detailValue, { color: activeColors.textPrimary }]}>
                {primaryPrice.variety || 'Standard'}
              </Text>
            </View>

            <View style={styles.detailCol}>
              <Text style={[styles.detailLabel, { color: activeColors.textSecondary }]}>Updated</Text>
              <Text style={[styles.detailValue, { color: colors.status.success, fontWeight: '700' }]}>
                {primaryPrice.last_updated}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="information-circle-outline" size={24} color={activeColors.textSecondary} />
          <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
            No mandi price records found for {selectedCommodity} in {selectedMarket}.
          </Text>
        </View>
      )}

      {/* ── Selection Modal ───────────────────────────────────────────────── */}
      <Modal
        visible={modalType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>
                Select {modalType ? modalType.charAt(0).toUpperCase() + modalType.slice(1) : ''}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close" size={22} color={activeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {modalType === 'commodity' &&
                availableCommodities.map((cmd) => (
                  <TouchableOpacity
                    key={cmd}
                    style={[
                      styles.modalOption,
                      selectedCommodity.toLowerCase() === cmd.toLowerCase() && {
                        backgroundColor: colors.primary.subtle,
                      },
                    ]}
                    onPress={() => handleCommodityChange(cmd)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        {
                          color:
                            selectedCommodity.toLowerCase() === cmd.toLowerCase()
                              ? colors.primary.DEFAULT
                              : activeColors.textPrimary,
                          fontWeight:
                            selectedCommodity.toLowerCase() === cmd.toLowerCase() ? '700' : '500',
                        },
                      ]}
                    >
                      {cmd}
                    </Text>
                    {selectedCommodity.toLowerCase() === cmd.toLowerCase() ? (
                      <Ionicons name="checkmark" size={18} color={colors.primary.DEFAULT} />
                    ) : null}
                  </TouchableOpacity>
                ))}

              {modalType === 'state' &&
                (filters?.states || []).map((st) => (
                  <TouchableOpacity
                    key={st.name}
                    style={[
                      styles.modalOption,
                      selectedState.toLowerCase() === st.name.toLowerCase() && {
                        backgroundColor: colors.primary.subtle,
                      },
                    ]}
                    onPress={() => handleStateChange(st.name)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        {
                          color:
                            selectedState.toLowerCase() === st.name.toLowerCase()
                              ? colors.primary.DEFAULT
                              : activeColors.textPrimary,
                          fontWeight:
                            selectedState.toLowerCase() === st.name.toLowerCase() ? '700' : '500',
                        },
                      ]}
                    >
                      {st.name}
                    </Text>
                    {selectedState.toLowerCase() === st.name.toLowerCase() ? (
                      <Ionicons name="checkmark" size={18} color={colors.primary.DEFAULT} />
                    ) : null}
                  </TouchableOpacity>
                ))}

              {modalType === 'district' &&
                availableDistricts.map((dst) => (
                  <TouchableOpacity
                    key={dst}
                    style={[
                      styles.modalOption,
                      selectedDistrict.toLowerCase() === dst.toLowerCase() && {
                        backgroundColor: colors.primary.subtle,
                      },
                    ]}
                    onPress={() => handleDistrictChange(dst)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        {
                          color:
                            selectedDistrict.toLowerCase() === dst.toLowerCase()
                              ? colors.primary.DEFAULT
                              : activeColors.textPrimary,
                          fontWeight:
                            selectedDistrict.toLowerCase() === dst.toLowerCase() ? '700' : '500',
                        },
                      ]}
                    >
                      {dst}
                    </Text>
                    {selectedDistrict.toLowerCase() === dst.toLowerCase() ? (
                      <Ionicons name="checkmark" size={18} color={colors.primary.DEFAULT} />
                    ) : null}
                  </TouchableOpacity>
                ))}

              {modalType === 'market' &&
                availableMarkets.map((mkt) => (
                  <TouchableOpacity
                    key={mkt}
                    style={[
                      styles.modalOption,
                      selectedMarket.toLowerCase() === mkt.toLowerCase() && {
                        backgroundColor: colors.primary.subtle,
                      },
                    ]}
                    onPress={() => handleMarketChange(mkt)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        {
                          color:
                            selectedMarket.toLowerCase() === mkt.toLowerCase()
                              ? colors.primary.DEFAULT
                              : activeColors.textPrimary,
                          fontWeight:
                            selectedMarket.toLowerCase() === mkt.toLowerCase() ? '700' : '500',
                        },
                      ]}
                    >
                      {mkt}
                    </Text>
                    {selectedMarket.toLowerCase() === mkt.toLowerCase() ? (
                      <Ionicons name="checkmark" size={18} color={colors.primary.DEFAULT} />
                    ) : null}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  errorBox: {
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  priceContainer: {
    marginTop: 2,
  },
  priceHeroBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  priceHeroLeft: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 3,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalPriceText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginLeft: 2,
  },
  unitText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  marketLocationText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  alertShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  alertShortcutText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  detailCol: {
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    maxHeight: 440,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalList: {
    maxHeight: 340,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  modalOptionText: {
    fontSize: 14,
  },
});

export default MarketPriceCard;
