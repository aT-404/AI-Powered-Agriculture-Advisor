import { Platform } from 'react-native';

const tintColorLight = '#2E7D32';
const tintColorDark = '#FFB800';

export const Colors = {
  light: {
    text: '#1E293B',
    background: '#F8FAF8',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFBEB',
    background: '#120F09',
    tint: tintColorDark,
    icon: '#A1A1AA',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    nexaExtraLight: 'Roboto, system-ui',
    sans: 'Roboto, system-ui, -apple-system',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    nexaExtraLight: 'Roboto',
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    nexaExtraLight: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sans: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
