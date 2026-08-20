import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Hand,
  Bell,
  UserRound,
  FlaskConical,
  ScanLine,
  CloudSun,
  Sprout,
  BarChart3,
  Camera,
  Image as ImageIcon,
  FileText,
  X,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '@/components/Button';
import { WeatherCard } from '@/components/WeatherCard';
import { MarketPriceCard } from '@/components/MarketPriceCard';
import { PriceTrendCard } from '@/components/PriceTrendCard';
import { PriceAlertCard } from '@/components/PriceAlertCard';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.52, 420);

// ─── Easing presets ──────────────────────────────────────────────────────────
const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN  = Easing.in(Easing.cubic);

// ─── Reusable: AnimatedCard ───────────────────────────────────────────────────
interface AnimatedCardProps {
  delay?: number;
  children: React.ReactNode;
  style?: object;
}
const AnimatedCard: React.FC<AnimatedCardProps> = ({ delay = 0, children, style }) => {
  const opacity   = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

// ─── Soil Scan Bottom Sheet ───────────────────────────
interface ScanOption {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  description: string;
  onPress: () => void;
}

interface ScanModalProps {
  visible: boolean;
  onClose: () => void;
}

const ScanModal: React.FC<ScanModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { activeColors } = useTheme();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 340,
          easing: EASE_OUT,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          easing: EASE_OUT,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 260,
          easing: EASE_IN,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 220,
          easing: EASE_IN,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to scan soil reports.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) {
      onClose();
      router.push({
        pathname: '/prediction/preview',
        params: {
          imageUri: result.assets[0].uri,
          fileName: 'Soil_Scan_' + Date.now() + '.jpg',
          fileType: 'image',
          source: 'camera',
        },
      } as any);
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed to upload soil reports.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) {
      onClose();
      router.push({
        pathname: '/prediction/preview',
        params: {
          imageUri: result.assets[0].uri,
          fileName: result.assets[0].fileName || 'Soil_Report_Image.jpg',
          fileType: 'image',
          source: 'gallery',
        },
      } as any);
    }
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        onClose();
        router.push({
          pathname: '/prediction/preview',
          params: {
            imageUri: result.assets[0].uri,
            fileName: result.assets[0].name || 'Soil_Test_Document.pdf',
            fileType: result.assets[0].name?.endsWith('.pdf') ? 'pdf' : 'image',
            source: 'file',
          },
        } as any);
      }
    } catch {
      Alert.alert('Error', 'Failed to open file picker.');
    }
  };

  const options: ScanOption[] = [
    { icon: Camera,    label: 'Camera',       description: 'Capture soil report', onPress: handleCamera   },
    { icon: ImageIcon, label: 'Upload Image',  description: 'From gallery',        onPress: handleGallery  },
    { icon: FileText,  label: 'Upload File',   description: 'PDF or image file',   onPress: handleDocument },
  ];

  if (!mounted) return null;

  return (
    <Modal visible transparent statusBarTranslucent onRequestClose={onClose} animationType="none">
      {/* Blurred Overlay */}
      <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Glassmorphic Sheet with Backdrop Blur */}
      <Animated.View
        style={[
          styles.modalSheet,
          { backgroundColor: activeColors.card, borderColor: activeColors.border, transform: [{ translateY }] },
        ]}
      >
        <View style={[styles.handleBar, { backgroundColor: activeColors.border }]} />
        <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>Analyze Soil Report</Text>
        <Text style={[styles.modalSubtitle, { color: activeColors.textSecondary }]}>
          Choose how you'd like to upload your soil report
        </Text>

        <View style={styles.optionsRow}>
          {options.map((opt) => {
            const IconComp = opt.icon;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.optionButton, { backgroundColor: activeColors.background, borderColor: activeColors.border, borderWidth: 1 }]}
                onPress={opt.onPress}
                activeOpacity={0.7}
                accessibilityLabel={opt.label}
                accessibilityRole="button"
              >
                <View style={styles.optionIconWrap}>
                  <IconComp size={26} color={activeColors.primary} strokeWidth={2} />
                </View>
                <Text style={[styles.optionLabel, { color: activeColors.textPrimary }]}>{opt.label}</Text>
                <Text style={[styles.optionDesc,  { color: activeColors.textSecondary }]}>{opt.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: activeColors.border }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelText, { color: activeColors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

// ─── Quick Action Button ──────────────────────────────────────────────────────
interface QuickActionProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}
const QuickAction: React.FC<QuickActionProps> = ({ icon: IconComp, label, color, bgColor, onPress }) => {
  const { activeColors } = useTheme();
  return (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={[styles.quickActionIcon, { backgroundColor: bgColor }]}>
        <IconComp size={26} color={color} strokeWidth={2} />
      </View>
      <Text style={[styles.quickActionLabel, { color: activeColors.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── Profile Drawer ───────────────────────────────────────────────────────────
interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  overlayAnim: Animated.Value;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ visible, onClose, slideAnim, overlayAnim }) => {
  const router = useRouter();
  const { activeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleNavigation = (path: string) => {
    onClose();
    setTimeout(() => {
      router.push(path as any);
    }, 220);
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      Alert.alert(
        'Logged Out',
        'You have been logged out.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login' as any) }]
      );
    }, 220);
  };

  const menuItems = [
    {
      icon: UserRound,
      label: 'My Profile',
      iconColor: colors.primary.DEFAULT,
      iconBg: colors.primary.subtle,
      onPress: () => handleNavigation('/(tabs)/profile'),
    },
    {
      icon: Sprout,
      label: 'Soil Predictions',
      iconColor: '#0288D1',
      iconBg: '#E3F2FD',
      onPress: () => handleNavigation('/(tabs)/predict'),
    },
    {
      icon: BarChart3,
      label: 'Yield Estimations',
      iconColor: colors.secondary.DEFAULT,
      iconBg: colors.secondary.subtle,
      onPress: () => handleNavigation('/(tabs)/yield-predict'),
    },
  ];

  if (!visible) return null;

  return (
    <Modal visible transparent statusBarTranslucent onRequestClose={onClose} animationType="none">
      <Animated.View style={[styles.drawerOverlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawerSheet,
          {
            backgroundColor: activeColors.card,
            borderColor: activeColors.border,
            borderLeftWidth: 1,
            paddingTop: Math.max(insets.top + 16, 32),
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={[styles.drawerHeaderTitle, { color: activeColors.textPrimary }]}>Account</Text>
          <TouchableOpacity
            style={[styles.drawerCloseBtn, { backgroundColor: activeColors.background, borderColor: activeColors.border, borderWidth: 1 }]}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Close profile sidebar"
            accessibilityRole="button"
          >
            <X size={18} color={activeColors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: activeColors.primary }]}>
            <UserRound size={44} color="#fff" strokeWidth={2} />
          </View>
          <Text style={[styles.avatarName,  { color: activeColors.textPrimary }]}>Farmer</Text>
          <Text style={[styles.avatarEmail, { color: activeColors.textSecondary }]}>user@example.com</Text>
          <View style={[styles.avatarBadge, { backgroundColor: activeColors.primarySubtle }]}>
            <ShieldCheck size={12} color={activeColors.primary} strokeWidth={2} />
            <Text style={[styles.avatarBadgeText, { color: activeColors.primary }]}>Verified Farmer</Text>
          </View>
        </View>

        <View style={[styles.drawerDivider, { backgroundColor: activeColors.border }]} />

        <ScrollView style={styles.drawerMenu} showsVerticalScrollIndicator={false}>
          {menuItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.drawerMenuItem,
                  idx < menuItems.length - 1 && { borderBottomColor: activeColors.border, borderBottomWidth: 1 },
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
                accessibilityLabel={item.label}
                accessibilityRole="button"
              >
                <View style={[styles.drawerMenuIcon, { backgroundColor: item.iconBg }]}>
                  <IconComp size={20} color={item.iconColor} strokeWidth={2} />
                </View>
                <Text style={[styles.drawerMenuLabel, { color: activeColors.textPrimary }]}>{item.label}</Text>
                <ChevronRight size={16} color={activeColors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.drawerDivider, { backgroundColor: activeColors.border }]} />

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
          accessibilityLabel="Log out"
          accessibilityRole="button"
        >
          <View style={[styles.drawerMenuIcon, { backgroundColor: '#FFEBEE' }]}>
            <LogOut size={20} color={colors.status.error} strokeWidth={2} />
          </View>
          <Text style={[styles.logoutText, { color: colors.status.error }]}>Log Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { activeColors, isDark } = useTheme();
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [drawerVisible,    setDrawerVisible]    = useState(false);

  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedMarket, setSelectedMarket] = useState('Muvattupuzha');
  const [selectedState, setSelectedState] = useState('Kerala');
  const [selectedDistrict, setSelectedDistrict] = useState('Ernakulam');
  const [preFillAlert, setPreFillAlert] = useState<{
    commodity?: string;
    market?: string;
    targetPrice?: number;
  } | undefined>(undefined);

  const drawerSlide   = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const drawerOverlay = useRef(new Animated.Value(0)).current;

  const openDrawer = useCallback(() => {
    setDrawerVisible(true);
    Animated.parallel([
      Animated.spring(drawerSlide, {
        toValue: SCREEN_WIDTH - DRAWER_WIDTH,
        useNativeDriver: true,
        damping: 24,
        stiffness: 220,
        mass: 0.9,
      }),
      Animated.timing(drawerOverlay, {
        toValue: 1,
        duration: 260,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerSlide, drawerOverlay]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.spring(drawerSlide, {
        toValue: SCREEN_WIDTH,
        useNativeDriver: true,
        damping: 24,
        stiffness: 220,
        mass: 0.9,
      }),
      Animated.timing(drawerOverlay, {
        toValue: 0,
        duration: 200,
        easing: EASE_IN,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerVisible(false));
  }, [drawerSlide, drawerOverlay]);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        delay: 60,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 400,
        delay: 60,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces
        scrollEventThrottle={16}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.greeting, { color: activeColors.textPrimary }]}>Welcome, Farmer</Text>
              <Hand size={20} color={activeColors.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.subGreeting, { color: activeColors.textSecondary }]}>
              Your smart farming assistant
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: activeColors.card, borderColor: activeColors.border, borderWidth: 1 }]}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <Bell size={20} color={activeColors.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, styles.iconBtnPrimary, { marginLeft: 10, backgroundColor: activeColors.primary }]}
              onPress={openDrawer}
              accessibilityLabel="Open profile sidebar"
              accessibilityRole="button"
            >
              <UserRound size={18} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Primary Soil Scan Emerald Gradient Hero Card ─────────── */}
        <AnimatedCard delay={120} style={styles.section}>
          <View
            style={[
              styles.soilCard,
              {
                backgroundColor: '#059669',
                backgroundImage: isDark
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 50%, #064E3B 100%)'
                  : 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #047857 100%)',
                borderColor: isDark ? 'rgba(52, 211, 153, 0.5)' : 'rgba(16, 185, 129, 0.4)',
                borderWidth: 1,
                boxShadow: isDark
                  ? '0 12px 36px rgba(16, 185, 129, 0.45)'
                  : '0 10px 28px rgba(16, 185, 129, 0.28)',
              } as any,
            ]}
          >
            {/* Blurred Green Circular Gradient */}
            <View style={styles.soilGlowOrb} />
            <View style={styles.soilDecorCircle1} />
            <View style={styles.soilDecorCircle2} />

            <View style={styles.soilCardContent}>
              {/* AI POWERED Badge */}
              <View style={styles.aiBadge}>
                <Sparkles size={11} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.aiBadgeText}>AI POWERED</Text>
              </View>

              <Text style={[styles.soilCardTitle, { color: '#FFFFFF' }]}>Analyze Your Soil</Text>
              <Text style={[styles.soilCardDesc, { color: 'rgba(255, 255, 255, 0.90)' }]}>
                Upload your soil report for instant AI crop recommendations.
              </Text>

              {/* Premium CTA Button */}
              <TouchableOpacity
                style={styles.scanBtnPremium}
                onPress={() => setScanModalVisible(true)}
                activeOpacity={0.85}
                accessibilityLabel="Scan Soil Report"
                accessibilityRole="button"
              >
                <ScanLine size={16} color="#047857" strokeWidth={2.2} />
                <Text style={styles.scanBtnTextPremium}>Scan Soil Report</Text>
                <ChevronRight size={15} color="#047857" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedCard>

        {/* ── Quick Actions ─────────────────────────────────── */}
        <AnimatedCard delay={200} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: activeColors.textSecondary }]}>Quick Actions</Text>
          <View style={[styles.quickActionsCard, { backgroundColor: activeColors.card, borderColor: activeColors.border, borderWidth: 1 }]}>
            <QuickAction
              icon={CloudSun}
              label="Weather"
              color="#0288D1"
              bgColor="#E3F2FD"
              onPress={() => {}}
            />
            <View style={[styles.quickActionDivider, { backgroundColor: activeColors.border }]} />
            <QuickAction
              icon={Sprout}
              label="New Prediction"
              color={activeColors.primary}
              bgColor={activeColors.primarySubtle}
              onPress={() => router.push('/(tabs)/predict' as any)}
            />
            <View style={[styles.quickActionDivider, { backgroundColor: activeColors.border }]} />
            <QuickAction
              icon={BarChart3}
              label="Yield Predictor"
              color="#854D0E"
              bgColor="#FEF3C7"
              onPress={() => router.push('/(tabs)/yield-predict' as any)}
            />
          </View>
        </AnimatedCard>

        {/* ── Weather Card ─────────────────────────────────────────────── */}
        <AnimatedCard delay={280} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: activeColors.textSecondary }]}>Farm Weather Outlook</Text>
          <WeatherCard initialLocation="Kothamangalam" />
        </AnimatedCard>

        {/* ── Mandi Market Price Card ───────────────────────────────────── */}
        <AnimatedCard delay={320} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: activeColors.textSecondary }]}>Mandi Market Rates</Text>
          <MarketPriceCard
            selectedCrop={selectedCrop}
            onSelectCommodity={(cmd) => setSelectedCrop(cmd)}
            onSetAlert={(params) => {
              setSelectedCrop(params.commodity);
              setSelectedMarket(params.market);
              setSelectedState(params.state);
              setSelectedDistrict(params.district);
              setPreFillAlert({
                commodity: params.commodity,
                market: params.market,
                targetPrice: params.currentPrice,
              });
            }}
          />
        </AnimatedCard>

        {/* ── Price Trend Card ──────────────────────────────────────────── */}
        <AnimatedCard delay={360} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: activeColors.textSecondary }]}>Market Price Trends</Text>
          <PriceTrendCard
            commodity={selectedCrop}
            market={selectedMarket}
            state={selectedState}
            district={selectedDistrict}
          />
        </AnimatedCard>

        {/* ── Price Alerts Card ─────────────────────────────────────────── */}
        <AnimatedCard delay={400} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: activeColors.textSecondary }]}>Price Alerts</Text>
          <PriceAlertCard initialPreFill={preFillAlert} />
        </AnimatedCard>
      </ScrollView>

      {/* Profile Drawer */}
      <ProfileDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        slideAnim={drawerSlide}
        overlayAnim={drawerOverlay}
      />

      {/* Soil Scan Bottom Sheet */}
      <ScanModal
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 94,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subGreeting: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBtnPrimary: {
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  soilCard: {
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    padding: 20,
    shadowColor: '#10B981',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    backdropFilter: 'blur(20px)' as any,
    WebkitBackdropFilter: 'blur(20px)' as any,
  },
  soilGlowOrb: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(52, 211, 153, 0.45)',
    filter: 'blur(28px)' as any,
  },
  soilDecorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  soilDecorCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  soilCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  soilCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  soilCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  scanBtnPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
    alignSelf: 'flex-start',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  scanBtnTextPremium: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
  },
  quickActionsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    backdropFilter: 'blur(20px)' as any,
    WebkitBackdropFilter: 'blur(20px)' as any,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    backdropFilter: 'blur(16px)' as any,
    WebkitBackdropFilter: 'blur(16px)' as any,
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
    backdropFilter: 'blur(24px)' as any,
    WebkitBackdropFilter: 'blur(24px)' as any,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 10,
    textAlign: 'center',
  },
  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    backdropFilter: 'blur(16px)' as any,
    WebkitBackdropFilter: 'blur(16px)' as any,
  },
  drawerSheet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: DRAWER_WIDTH,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backdropFilter: 'blur(24px)' as any,
    WebkitBackdropFilter: 'blur(24px)' as any,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '800',
  },
  avatarEmail: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  avatarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  avatarBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  drawerDivider: {
    height: 1,
    marginVertical: 12,
  },
  drawerMenu: {
    flex: 1,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  drawerMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  drawerMenuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
