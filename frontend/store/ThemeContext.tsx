import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeSetting: ThemeType;
  setThemeSetting: (setting: ThemeType) => void;
  activeColors: typeof colors.neutral & {
    primaryCard: typeof colors.primaryCard;
  };
}

const THEME_STORAGE_KEY = '@app_theme_setting';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themeSetting: 'system',
  setThemeSetting: () => {},
  activeColors: {
    ...colors.neutral,
    primaryCard: colors.primaryCard,
  },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeSetting, setThemeSettingState] = useState<ThemeType>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved theme preference
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

  // Determine actual theme based on setting and device scheme
  const theme = themeSetting === 'system' 
    ? (deviceColorScheme === 'dark' ? 'dark' : 'light') 
    : themeSetting;

  // Provide the active neutral colors mapping (swapping neutral with dark based on theme)
  const activeColors = theme === 'dark' 
    ? {
        ...colors.neutral, // fallback
        ...colors.dark,
        white: '#121811', // In dark mode, white surfaces become dark
        primaryCard: colors.primaryCard, // Guaranteed contrast
      } 
    : {
        ...colors.neutral,
        primaryCard: colors.primaryCard, // Guaranteed contrast
      };

  // Don't render until theme is loaded to prevent flicker
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, themeSetting, setThemeSetting, activeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
