import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { useTheme } from '@/store/ThemeContext';

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [weatherAlerts, setWeatherAlerts] = React.useState(true);
  const { theme, setThemeSetting, activeColors } = useTheme();

  const styles = getStyles(activeColors);
  const isDarkMode = theme === 'dark';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>This is the Settings screen</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Toggle dark theme on or off
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(val) => setThemeSetting(val ? 'dark' : 'light')}
              trackColor={{ false: activeColors.border, true: colors.primary.light }}
              thumbColor={isDarkMode ? colors.primary.DEFAULT : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Weather & Pest Alerts</Text>
              <Text style={styles.settingDescription}>
                Receive rain forecasts and temperature warnings
              </Text>
            </View>
            <Switch
              value={weatherAlerts}
              onValueChange={setWeatherAlerts}
              trackColor={{ false: activeColors.border, true: colors.primary.light }}
              thumbColor={weatherAlerts ? colors.primary.DEFAULT : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, styles.noBorder]}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Advisory reminders and prediction summaries
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: activeColors.border, true: colors.primary.light }}
              thumbColor={notifications ? colors.primary.DEFAULT : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.appName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.version}</Text>
          </View>
          <View style={[styles.infoRow, styles.noBorder]}>
            <Text style={styles.infoLabel}>Support</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.supportEmail}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (activeColors: typeof colors.neutral) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: activeColors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: activeColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: activeColors.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: activeColors.card,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: activeColors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: activeColors.textPrimary,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: activeColors.border,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: activeColors.textPrimary,
  },
  settingDescription: {
    fontSize: 12,
    color: activeColors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: activeColors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: activeColors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: activeColors.textPrimary,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
});
