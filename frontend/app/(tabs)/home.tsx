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
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '@/components/Button';
import { WeatherCard } from '@/components/WeatherCard';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.52, 420);

// ─── Easing presets ──────────────────────────────────────────────────────────
const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN  = Easing.in(Easing.cubic);

// ─── Reusable: AnimatedCard ───────────────────────────────────────────────────
// Fades + slides up on mount. `delay` staggers the animation.
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

// ─── Soil Scan Bottom Sheet (custom animated, no animationType jank) ──────────
interface ScanOption {
  icon: keyof typeof Ionicons.glyphMap;
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
  // Keep modal mounted while animating out
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
    { icon: 'camera',        label: 'Camera',       description: 'Capture soil report', onPress: handleCamera   },
    { icon: 'image',         label: 'Upload Image',  description: 'From gallery',        onPress: handleGallery  },
    { icon: 'document-text', label: 'Upload File',   description: 'PDF or image file',   onPress: handleDocument },
  ];

  if (!mounted) return null;

  return (
    <Modal visible transparent statusBarTranslucent onRequestClose={onClose} animationType="none">
      {/* Overlay */}
      <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.modalSheet,
          { backgroundColor: activeColors.card, transform: [{ translateY }] },
        ]}
      >
        <View style={[styles.handleBar, { backgroundColor: activeColors.border }]} />
        <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>Analyze Soil Report</Text>
        <Text style={[styles.modalSubtitle, { color: activeColors.textSecondary }]}>
          Choose how you'd like to upload your soil report
        </Text>

        <View style={styles.optionsRow}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.optionButton, { backgroundColor: activeColors.background }]}
              onPress={opt.onPress}
              activeOpacity={0.7}
              accessibilityLabel={opt.label}
              accessibilityRole="button"
            >
              <View style={styles.optionIconWrap}>
                <Ionicons name={opt.icon} size={26} color={colors.primary.DEFAULT} />
              </View>
              <Text style={[styles.optionLabel, { color: activeColors.textPrimary }]}>{opt.label}</Text>
              <Text style={[styles.optionDesc,  { color: activeColors.textSecondary }]}>{opt.description}</Text>
            </TouchableOpacity>
          ))}
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
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}
const QuickAction: React.FC<QuickActionProps> = ({ icon, label, color, bgColor, onPress }) => (
  <TouchableOpacity
    style={styles.quickAction}
    onPress={onPress}
    activeOpacity={0.75}
    accessibilityLabel={label}
    accessibilityRole="button"
  >
    <View style={[styles.quickActionIcon, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

// ─── Profile Drawer ───────────────────────────────────────────────────────────
interface DrawerMenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor: string;
  iconBg: string;
  onPress: () => void;
  isDanger?: boolean;
}

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

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            onClose();
            // TODO: Clear auth tokens and navigate to login when auth is implemented
            Alert.alert('Logged Out', 'You have been logged out successfully.');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const navigate = (path: string) => {
    onClose();
    router.push(path as any);
  };

  const menuItems: DrawerMenuItem[] = [
    {
      icon: 'person-circle-outline',
      label: 'My Profile',
      iconColor: colors.primary.DEFAULT,
      iconBg: colors.primary.subtle,
      onPress: () => { onClose(); Alert.alert('My Profile', 'Profile screen coming soon.'); },
    },
    {
      icon: 'document-text-outline',
      label: 'My Soil Reports',
      iconColor: '#0288D1',
      iconBg: '#E1F5FE',
      onPress: () => { onClose(); Alert.alert('Soil Reports', 'Soil history screen coming soon.'); },
    },
    {
      icon: 'leaf-outline',
      label: 'My Crop Predictions',
      iconColor: colors.primary.DEFAULT,
      iconBg: colors.primary.subtle,
      onPress: () => navigate('/(tabs)/predict'),
    },
    {
      icon: 'library-outline',
      label: 'Crop Knowledge',
      iconColor: colors.accent.dark,
      iconBg: colors.accent.light,
      onPress: () => navigate('/crops'),
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      iconColor: colors.secondary.DEFAULT,
      iconBg: colors.secondary.subtle,
      onPress: () => navigate('/settings'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      iconColor: '#ED6C02',
      iconBg: '#FFF3E0',
      onPress: () => { onClose(); Alert.alert('Notifications', 'Notifications screen coming soon.'); },
    },
  ];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} statusBarTranslucent animationType="none" onRequestClose={onClose}>
      {/* Dimmed overlay */}
      <Animated.View style={[styles.drawerOverlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close profile drawer" />
      </Animated.View>

      {/* Sliding panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: activeColors.card,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Header row */}
        <View style={styles.drawerHeader}>
          <Text style={[styles.drawerTitle, { color: activeColors.textPrimary }]}>Profile</Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.drawerCloseBtn, { backgroundColor: activeColors.background }]}
            accessibilityLabel="Close profile sidebar"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={18} color={activeColors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={44} color="#fff" />
          </View>
          <Text style={[styles.avatarName,  { color: activeColors.textPrimary   }]}>Farmer</Text>
          <Text style={[styles.avatarEmail, { color: activeColors.textSecondary }]}>user@example.com</Text>
          <View style={[styles.avatarBadge, { backgroundColor: colors.primary.subtle }]}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primary.DEFAULT} />
            <Text style={[styles.avatarBadgeText, { color: colors.primary.DEFAULT }]}>Verified Farmer</Text>
          </View>
        </View>

        <View style={[styles.drawerDivider, { backgroundColor: activeColors.border }]} />

        {/* Menu */}
        <ScrollView style={styles.drawerMenu} showsVerticalScrollIndicator={false}>
          {menuItems.map((item, idx) => (
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
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>
              <Text style={[styles.drawerMenuLabel, { color: activeColors.textPrimary }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={activeColors.textSecondary} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.drawerDivider, { backgroundColor: activeColors.border }]} />

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
          accessibilityLabel="Log out"
          accessibilityRole="button"
        >
          <View style={[styles.drawerMenuIcon, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
          </View>
          <Text style={[styles.logoutText, { color: colors.status.error }]}>Log Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

// ─── Home Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router    = useRouter();
  const { activeColors } = useTheme();
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [drawerVisible,    setDrawerVisible]    = useState(false);

  // ── Drawer animation values ──────────────────────────────────────────────
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

  // ── Page-level header entrance ───────────────────────────────────────────
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
        overScrollMode="never"           // Android: no glow effect
        bounces                          // iOS: natural rubber-band bounce
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
            <Text style={[styles.greeting, { color: activeColors.textPrimary }]}>Welcome, Farmer 👋</Text>
            <Text style={[styles.subGreeting, { color: activeColors.textSecondary }]}>
              Your smart farming assistant
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: activeColors.card }]}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <Ionicons name="notifications-outline" size={20} color={activeColors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, styles.iconBtnPrimary, { marginLeft: 10 }]}
              onPress={openDrawer}
              accessibilityLabel="Open profile sidebar"
              accessibilityRole="button"
            >
              <Ionicons name="person" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Primary Soil Scan Card — fades in slightly later ─────────── */}
        <AnimatedCard delay={120}>
          <View style={styles.soilCard}>
            <View style={styles.soilDecorCircle1} />
            <View style={styles.soilDecorCircle2} />
            <View style={styles.soilCardInner}>
              <View style={styles.soilIconBadge}>
                <Ionicons name="flask" size={26} color="#fff" />
              </View>
              <Text style={styles.soilCardTitle}>Analyze Your Soil</Text>
              <Text style={styles.soilCardDesc}>
                Upload your soil test report and get AI-powered crop recommendations instantly.
              </Text>
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={() => setScanModalVisible(true)}
                activeOpacity={0.85}
                accessibilityLabel="Scan Soil Report"
                accessibilityRole="button"
              >
                <Ionicons name="scan-outline" size={18} color={colors.primary.DEFAULT} />
                <Text style={styles.scanBtnText}>Scan Soil Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedCard>

        {/* ── Quick Actions — staggered ─────────────────────────────────── */}
        <AnimatedCard delay={200} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: activeColors.textSecondary }]}>Quick Actions</Text>
          <View style={[styles.quickActionsCard, { backgroundColor: activeColors.card }]}>
            <QuickAction
              icon="cloud-outline"
              label="Weather"
              color={colors.status.info}
              bgColor="#E3F2FD"
              onPress={() => {}}
            />
            <View style={[styles.quickActionDivider, { backgroundColor: activeColors.border }]} />
            <QuickAction
              icon="leaf-outline"
              label="New Prediction"
              color={colors.primary.DEFAULT}
              bgColor={colors.primary.subtle}
              onPress={() => router.push('/(tabs)/predict' as any)}
            />
            <View style={[styles.quickActionDivider, { backgroundColor: activeColors.border }]} />
            <QuickAction
              icon="time-outline"
              label="Soil History"
              color={colors.secondary.DEFAULT}
              bgColor={colors.secondary.subtle}
              onPress={() => Alert.alert('Coming Soon', 'Soil history will be available in a future update.')}
            />
          </View>
        </AnimatedCard>

        {/* ── Weather Card ─────────────────────────────────────────────── */}
        <AnimatedCard delay={280} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: activeColors.textSecondary }]}>Farm Conditions</Text>
          <WeatherCard />
        </AnimatedCard>

        {/* ── AI Advisor Card ───────────────────────────────────────────── */}
        <AnimatedCard delay={340} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: activeColors.textSecondary }]}>AI Advisor</Text>
          <View style={[styles.advisorCard, { backgroundColor: activeColors.card }]}>
            <View style={styles.advisorLeft}>
              <View style={[styles.advisorIconBadge, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="bulb-outline" size={22} color={colors.primary.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.advisorTitle, { color: activeColors.textPrimary }]}>AI Crop Advisor</Text>
                <Text style={[styles.advisorDesc,  { color: activeColors.textSecondary }]}>
                  Personalized recommendations based on your soil & climate.
                </Text>
              </View>
            </View>
            <Button
              title="Start New Prediction"
              onPress={() => router.push('/(tabs)/predict' as any)}
              style={styles.advisorBtn}
            />
          </View>
        </AnimatedCard>

        {/* ── Crop Knowledge Card ───────────────────────────────────────── */}
        <AnimatedCard delay={400} style={[styles.section, { marginBottom: 28 }]}>
          <Text style={[styles.sectionLabel, { color: activeColors.textSecondary }]}>Knowledge Base</Text>
          <View style={[styles.cropCard, { backgroundColor: activeColors.card }]}>
            <View style={styles.cropCardHeader}>
              <View style={[styles.cropIconBadge, { backgroundColor: colors.accent.light }]}>
                <Ionicons name="library-outline" size={22} color={colors.accent.dark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cropCardTitle, { color: activeColors.textPrimary }]}>Crop Knowledge</Text>
                <Text style={[styles.cropCardDesc,  { color: activeColors.textSecondary }]}>
                  Explore soil requirements, growing seasons, and harvesting guides.
                </Text>
              </View>
            </View>
            <Button
              title="Explore Crop Library"
              onPress={() => router.push('/crops' as any)}
              variant="outline"
              style={{ marginTop: 14 }}
            />
          </View>
        </AnimatedCard>
      </ScrollView>

      {/* ── Scan Bottom Sheet ─────────────────────────────────────────── */}
      <ScanModal visible={scanModalVisible} onClose={() => setScanModalVisible(false)} />

      {/* ── Profile Drawer ────────────────────────────────────────────── */}
      <ProfileDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        slideAnim={drawerSlide}
        overlayAnim={drawerOverlay}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  greeting:    { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  subGreeting: { fontSize: 13, marginTop: 3 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  iconBtnPrimary: { backgroundColor: colors.primary.DEFAULT },

  // Soil card
  soilCard: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.primary.DEFAULT,
    marginBottom: 24,
    minHeight: 200,
    shadowColor: colors.primary.dark,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  soilDecorCircle1: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: colors.primary.light,
    opacity: 0.25, top: -60, right: -50,
  },
  soilDecorCircle2: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.primary.dark,
    opacity: 0.2, bottom: -30, left: -30,
  },
  soilCardInner: { padding: 24, zIndex: 1 },
  soilIconBadge: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  soilCardTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  soilCardDesc:  { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 21, marginBottom: 20 },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingVertical: 13, paddingHorizontal: 22,
    borderRadius: 14, alignSelf: 'flex-start', gap: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  scanBtnText: { fontSize: 15, fontWeight: '700', color: colors.primary.DEFAULT },

  // Sections
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 10, marginLeft: 2,
  },

  // Quick actions
  quickActionsCard: {
    borderRadius: 18, flexDirection: 'row', alignItems: 'stretch',
    paddingVertical: 18, paddingHorizontal: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  quickAction:      { flex: 1, alignItems: 'center', gap: 8 },
  quickActionIcon:  { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 12, fontWeight: '600', color: colors.neutral.textPrimary, textAlign: 'center' },
  quickActionDivider: { width: 1, marginVertical: 8 },

  // Advisor card
  advisorCard: {
    borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  advisorLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 4 },
  advisorIconBadge: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  advisorTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  advisorDesc:  { fontSize: 13, lineHeight: 19 },
  advisorBtn:   { marginTop: 14 },

  // Crop card
  cropCard: {
    borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cropCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  cropIconBadge:  { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cropCardTitle:  { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cropCardDesc:   { fontSize: 13, lineHeight: 19 },

  // ── Scan Modal (custom animated sheet) ────────────────────────────────────
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 20, elevation: 14,
  },
  handleBar:    { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 20, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  modalSubtitle:{ fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  optionsRow:   { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  optionButton: { flex: 1, alignItems: 'center', borderRadius: 18, paddingVertical: 18, paddingHorizontal: 8, gap: 10 },
  optionIconWrap: {
    width: 54, height: 54, borderRadius: 16,
    backgroundColor: colors.primary.subtle, alignItems: 'center', justifyContent: 'center',
  },
  optionLabel:  { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  optionDesc:   { fontSize: 11, textAlign: 'center', lineHeight: 15 },
  cancelBtn:    { borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelText:   { fontSize: 15, fontWeight: '600' },

  // ── Profile Drawer ─────────────────────────────────────────────────────────
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25, shadowRadius: 20,
    shadowOffset: { width: -4, height: 0 },
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 24,
  },
  drawerTitle: { fontSize: 20, fontWeight: '800' },
  drawerCloseBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarSection: { alignItems: 'center', paddingBottom: 20, paddingHorizontal: 20 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary.dark,
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  avatarName:  { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  avatarEmail: { fontSize: 13, marginBottom: 10 },
  avatarBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  avatarBadgeText: { fontSize: 12, fontWeight: '700' },
  drawerDivider: { height: 1, marginHorizontal: 20, marginVertical: 8 },
  drawerMenu:   { flex: 1, paddingHorizontal: 16, marginVertical: 4 },
  drawerMenuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 4, gap: 14,
  },
  drawerMenuIcon:  {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  drawerMenuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: 14, paddingHorizontal: 20, paddingVertical: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
});
