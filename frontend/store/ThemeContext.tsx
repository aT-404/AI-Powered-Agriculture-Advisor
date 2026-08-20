import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';

type ThemeType = 'light' | 'dark' | 'system';

export interface ActiveColors {
  primary: string;
  primarySubtle: string;
  background: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  white: string;
  primaryCard: typeof colors.primaryCard;
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  isDark: boolean;
  themeSetting: ThemeType;
  setThemeSetting: (setting: ThemeType) => void;
  activeColors: ActiveColors;
}

const THEME_STORAGE_KEY = '@app_theme_setting';

const defaultLightColors: ActiveColors = {
  primary: colors.light.primary,
  primarySubtle: colors.light.primarySubtle,
  background: colors.light.background,
  card: colors.light.card,
  border: colors.light.border,
  textPrimary: colors.light.textPrimary,
  textSecondary: colors.light.textSecondary,
  textMuted: colors.light.textMuted,
  white: '#FFFFFF',
  primaryCard: colors.primaryCard,
};

const defaultDarkColors: ActiveColors = {
  primary: colors.dark.primary,
  primarySubtle: colors.dark.primarySubtle,
  background: colors.dark.background,
  card: colors.dark.card,
  border: colors.dark.border,
  textPrimary: colors.dark.textPrimary,
  textSecondary: colors.dark.textSecondary,
  textMuted: colors.dark.textMuted,
  white: '#1C170F',
  primaryCard: {
    background: '#241804',
    text: '#FFB800',
    textMuted: 'rgba(255, 184, 0, 0.85)',
  },
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  themeSetting: 'system',
  setThemeSetting: () => {},
  activeColors: defaultLightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeSetting, setThemeSettingState] = useState<ThemeType>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeSettingState(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme setting', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setThemeSetting = async (setting: ThemeType) => {
    setThemeSettingState(setting);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, setting);
    } catch (error) {
      console.error('Failed to save theme setting', error);
    }
  };

  const theme = themeSetting === 'system'
    ? (deviceColorScheme === 'dark' ? 'dark' : 'light')
    : themeSetting;

  const isDark = theme === 'dark';

  const activeColors = isDark ? defaultDarkColors : defaultLightColors;

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, isDark, themeSetting, setThemeSetting, activeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
