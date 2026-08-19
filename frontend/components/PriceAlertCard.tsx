import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Modal,
  Alert as RNAlert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PriceAlert, CreatePriceAlertInput } from '@/types/alert';
import {
  fetchAlerts,
  createPriceAlert,
  deletePriceAlert,
  togglePriceAlert,
} from '@/services/alertService';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export interface PriceAlertCardProps {
  initialPreFill?: {
    commodity?: string;
    market?: string;
    targetPrice?: number;
  };
  style?: ViewStyle;
}

export const PriceAlertCard: React.FC<PriceAlertCardProps> = ({
  initialPreFill,
  style,
}) => {
  const { activeColors, isDark } = useTheme();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [commodity, setCommodity] = useState(initialPreFill?.commodity || 'Tomato');
  const [market, setMarket] = useState(initialPreFill?.market || 'Muvattupuzha');
  const [targetPrice, setTargetPrice] = useState(initialPreFill?.targetPrice ? initialPreFill.targetPrice.toString() : '3000');
  const [condition, setCondition] = useState<'GTE' | 'LTE'>('GTE');
  const [submitting, setSubmitting] = useState(false);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await fetchAlerts();
      if (apiError) {
        setError(apiError);
      } else if (data) {
        setAlerts(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch price alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Update form fields if initialPreFill changes
  useEffect(() => {
    if (initialPreFill) {
      if (initialPreFill.commodity) setCommodity(initialPreFill.commodity);
      if (initialPreFill.market) setMarket(initialPreFill.market);
      if (initialPreFill.targetPrice) setTargetPrice(initialPreFill.targetPrice.toString());
      setModalVisible(true);
    }
  }, [initialPreFill]);

  const handleCreate = async () => {
    const priceNum = parseFloat(targetPrice);
    if (!commodity.trim()) {
      RNAlert.alert('Validation Error', 'Please enter a commodity name.');
      return;
    }
    if (!market.trim()) {
      RNAlert.alert('Validation Error', 'Please enter a mandi/market name.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      RNAlert.alert('Validation Error', 'Please enter a valid target price.');
      return;
    }

    try {
      setSubmitting(true);
      const input: CreatePriceAlertInput = {
        commodity: commodity.trim(),
        market: market.trim(),
        target_price: priceNum,
        condition,
        is_active: true,
      };

      const { data, error: createErr } = await createPriceAlert(input);
      if (createErr || !data) {
        RNAlert.alert('Error', createErr || 'Failed to create alert.');
      } else {
        setModalVisible(false);
        loadAlerts();
        if (data.is_triggered && data.notification_message) {
          RNAlert.alert('🔔 Alert Triggered Immediately!', data.notification_message);
        }
      }
    } catch (err: any) {
      RNAlert.alert('Error', err?.message || 'Failed to create price alert.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      // Optimistic update
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: !a.is_active } : a))
      );
      const { data } = await togglePriceAlert(id);
      if (data) {
        setAlerts((prev) => prev.map((a) => (a.id === id ? data : a)));
      }
    } catch {
      loadAlerts();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      await deletePriceAlert(id);
    } catch {
      loadAlerts();
    }
  };

  // Check if any alert is triggered
  const triggeredAlerts = alerts.filter((a) => a.is_triggered && a.is_active);

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
          <View style={[styles.iconBadge, { backgroundColor: '#FFF8E1' }]}>
            <Ionicons name="notifications" size={18} color="#F57F17" />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: activeColors.textPrimary }]}>
              Price Alerts
            </Text>
            <Text style={[styles.cardSubtitle, { color: activeColors.textSecondary }]}>
              Real-time Mandi Target Notifications
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addAlertBtn, { backgroundColor: colors.primary.DEFAULT }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.addAlertBtnText}>New Alert</Text>
        </TouchableOpacity>
      </View>

      {/* ── Triggered Notification Banner(s) ─────────────────────────────── */}
      {triggeredAlerts.length > 0 && (
        <View style={styles.bannerContainer}>
          {triggeredAlerts.map((tAlert) => (
            <View
              key={tAlert.id}
              style={[
                styles.triggeredBanner,
                { backgroundColor: isDark ? '#2E2215' : '#FFF3E0', borderColor: '#FFB74D' },
              ]}
            >
              <Ionicons name="notifications-circle" size={24} color="#F57F17" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.triggeredBannerTitle, { color: '#E65100' }]}>
                  Target Price Reached! 🔔
                </Text>
                <Text style={[styles.triggeredBannerText, { color: activeColors.textPrimary }]}>
                  {tAlert.commodity} price has reached ₹{tAlert.target_price.toLocaleString('en-IN')}/quintal at {tAlert.market}.
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Content: Loading / Error / List ──────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
          <Text style={[styles.loadingText, { color: activeColors.textSecondary }]}>
            Loading your configured price alerts...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color={colors.status.error} />
          <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary.DEFAULT }]}
            onPress={loadAlerts}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : alerts.length > 0 ? (
        <View style={styles.alertsList}>
          {alerts.map((item) => {
            const condSymbol = item.condition === 'GTE' ? '≥' : '≤';
            return (
              <View
                key={item.id}
                style={[
                  styles.alertItem,
                  {
                    backgroundColor: isDark ? '#222222' : '#F9FAFB',
                    borderColor: item.is_triggered ? '#FFB74D' : activeColors.border,
                  },
                ]}
              >
                <View style={styles.alertLeft}>
                  <View
                    style={[
                      styles.alertIconPill,
                      {
                        backgroundColor: item.is_triggered
                          ? '#FFF3E0'
                          : colors.primary.subtle,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.is_triggered ? 'notifications' : 'notifications-outline'}
                      size={16}
                      color={item.is_triggered ? '#F57F17' : colors.primary.DEFAULT}
                    />
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.alertCommodity, { color: activeColors.textPrimary }]}>
                        {item.commodity}
                      </Text>
                      <Text style={[styles.alertTargetBadge, { color: colors.primary.DEFAULT }]}>
                        {condSymbol} ₹{item.target_price.toLocaleString('en-IN')}/q
                      </Text>
                    </View>
                    <Text style={[styles.alertMarket, { color: activeColors.textSecondary }]}>
                      📍 {item.market} Mandi
                    </Text>
                  </View>
                </View>

                <View style={styles.alertRight}>
                  <Switch
                    value={item.is_active}
                    onValueChange={() => handleToggle(item.id)}
                    trackColor={{ false: '#767577', true: colors.primary.light }}
                    thumbColor={item.is_active ? colors.primary.DEFAULT : '#f4f3f4'}
                  />
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.status.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="notifications-off-outline" size={28} color={activeColors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: activeColors.textPrimary }]}>
            No Price Alerts Configured
          </Text>
          <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
            Set target prices for your crops to receive instant notifications when mandi rates peak.
          </Text>
          <TouchableOpacity
            style={[styles.createFirstBtn, { backgroundColor: colors.primary.DEFAULT }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createFirstBtnText}>+ Set Your First Price Alert</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Create Price Alert Modal ─────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: activeColors.card, borderColor: activeColors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>
                Create Mandi Price Alert
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={activeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: activeColors.textSecondary }]}>
                Commodity / Crop
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: activeColors.textPrimary,
                    borderColor: activeColors.border,
                    backgroundColor: isDark ? '#262626' : '#F9FAFB',
                  },
                ]}
                placeholder="e.g. Tomato, Rice, Rubber"
                placeholderTextColor={activeColors.textSecondary}
                value={commodity}
                onChangeText={setCommodity}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: activeColors.textSecondary }]}>
                Mandi / Market
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: activeColors.textPrimary,
                    borderColor: activeColors.border,
                    backgroundColor: isDark ? '#262626' : '#F9FAFB',
                  },
                ]}
                placeholder="e.g. Muvattupuzha, Kothamangalam"
                placeholderTextColor={activeColors.textSecondary}
                value={market}
                onChangeText={setMarket}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: activeColors.textSecondary }]}>
                Target Price (₹ / Quintal)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: activeColors.textPrimary,
                    borderColor: activeColors.border,
                    backgroundColor: isDark ? '#262626' : '#F9FAFB',
                  },
                ]}
                placeholder="e.g. 3000"
                placeholderTextColor={activeColors.textSecondary}
                keyboardType="numeric"
                value={targetPrice}
                onChangeText={setTargetPrice}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: activeColors.textSecondary }]}>
                Trigger Condition
              </Text>
              <View style={styles.conditionRow}>
                <TouchableOpacity
                  style={[
                    styles.conditionBtn,
                    condition === 'GTE' && {
                      backgroundColor: colors.primary.DEFAULT,
                      borderColor: colors.primary.DEFAULT,
                    },
                    { borderColor: activeColors.border },
                  ]}
                  onPress={() => setCondition('GTE')}
                >
                  <Text
                    style={[
                      styles.conditionBtnText,
                      { color: condition === 'GTE' ? '#FFF' : activeColors.textPrimary },
                    ]}
                  >
                    ≥ Reaches or Exceeds
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.conditionBtn,
                    condition === 'LTE' && {
                      backgroundColor: colors.primary.DEFAULT,
                      borderColor: colors.primary.DEFAULT,
                    },
                    { borderColor: activeColors.border },
                  ]}
                  onPress={() => setCondition('LTE')}
                >
                  <Text
                    style={[
                      styles.conditionBtnText,
                      { color: condition === 'LTE' ? '#FFF' : activeColors.textPrimary },
                    ]}
                  >
                    ≤ Drops Below
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary.DEFAULT },
                submitting && { opacity: 0.7 },
              ]}
              onPress={handleCreate}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Create Alert</Text>
              )}
            </TouchableOpacity>
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
    marginBottom: 14,
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
  addAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  addAlertBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bannerContainer: {
    marginBottom: 12,
    gap: 8,
  },
  triggeredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  triggeredBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  triggeredBannerText: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  errorBox: {
    paddingVertical: 16,
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
  alertsList: {
    gap: 8,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  alertIconPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCommodity: {
    fontSize: 14,
    fontWeight: '700',
  },
  alertTargetBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertMarket: {
    fontSize: 11,
    marginTop: 2,
  },
  alertRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyBox: {
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 14,
  },
  createFirstBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  createFirstBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  conditionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  conditionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PriceAlertCard;
