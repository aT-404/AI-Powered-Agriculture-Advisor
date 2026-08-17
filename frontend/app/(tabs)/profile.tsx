import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { authService } from '@/services';
import { useTheme } from '@/store/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/(auth)/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <AnimatedCard delay={60}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.headerIconBadge, { backgroundColor: colors.primary.subtle }]}>
              <Ionicons name="person" size={22} color={colors.primary.DEFAULT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: activeColors.textPrimary }]}>Farmer Profile</Text>
              <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
                Manage your account & preferences
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Hero Card */}
        <AnimatedCard delay={120}>
          <View style={[styles.profileHeroCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={44} color="#fff" />
            </View>
            <Text style={[styles.name, { color: activeColors.textPrimary }]}>Demo Farmer</Text>
            <Text style={[styles.email, { color: activeColors.textSecondary }]}>farmer@cropwise.ai</Text>
            
            <View style={[styles.roleBadge, { backgroundColor: colors.primary.subtle }]}>
              <Ionicons name="shield-checkmark" size={14} color={colors.primary.DEFAULT} />
              <Text style={[styles.roleBadgeText, { color: colors.primary.DEFAULT }]}>Verified Farmer</Text>
            </View>

            <View style={[styles.heroStatsRow, { borderTopColor: activeColors.border }]}>
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatNum, { color: colors.primary.DEFAULT }]}>4</Text>
                <Text style={[styles.heroStatLabel, { color: activeColors.textSecondary }]}>Soil Reports</Text>
              </View>
              <View style={[styles.heroStatDivider, { backgroundColor: activeColors.border }]} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatNum, { color: colors.primary.DEFAULT }]}>12.5</Text>
                <Text style={[styles.heroStatLabel, { color: activeColors.textSecondary }]}>Acres Farmed</Text>
              </View>
              <View style={[styles.heroStatDivider, { backgroundColor: activeColors.border }]} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatNum, { color: colors.primary.DEFAULT }]}>Rice</Text>
                <Text style={[styles.heroStatLabel, { color: activeColors.textSecondary }]}>Primary Crop</Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Section 1: Quick Nav Options */}
        <AnimatedCard delay={180}>
          <View style={[styles.sectionCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Account & Farm</Text>
            
            <TouchableOpacity
              style={[styles.menuRow, { borderBottomColor: activeColors.border }]}
              onPress={() => router.push('/settings' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBadge, { backgroundColor: colors.secondary.subtle }]}>
                <Ionicons name="settings-outline" size={18} color={colors.secondary.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: activeColors.textPrimary }]}>Farm Settings & Theme</Text>
                <Text style={[styles.menuDesc, { color: activeColors.textSecondary }]}>Dark mode, alerts, and preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={activeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuRow, { borderBottomColor: activeColors.border }]}
              onPress={() => router.push('/crops' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBadge, { backgroundColor: colors.accent.light }]}>
                <Ionicons name="library-outline" size={18} color={colors.accent.dark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: activeColors.textPrimary }]}>Crop Catalog Knowledge</Text>
                <Text style={[styles.menuDesc, { color: activeColors.textSecondary }]}>Explore soil requirements & guides</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={activeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/(tabs)/history' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBadge, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="time-outline" size={18} color={colors.primary.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: activeColors.textPrimary }]}>My Prediction History</Text>
                <Text style={[styles.menuDesc, { color: activeColors.textSecondary }]}>View previous soil recommendations</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={activeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Section 2: Danger Zone */}
        <AnimatedCard delay={240} style={{ marginBottom: 28 }}>
          <View style={[styles.sectionCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Session</Text>
            <Button
              title="Log Out"
              onPress={handleLogout}
              variant="ghost"
              style={styles.logoutButton}
              textStyle={{ color: colors.status.error, fontWeight: '700' }}
            />
          </View>
        </AnimatedCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  profileHeroCard: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary.dark,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatNum: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
  },
  sectionCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 2,
  },
});
