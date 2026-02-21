/**
 * Willy Wonka Golden Ticket Theme
 * Inspired by the whimsical world of the Chocolate Factory
 */

import { Platform } from 'react-native';

// Wonka Theme Colors
export const WonkaColors = {
  // Primary Wonka Purple (his iconic coat)
  purple: '#5B2C6F',
  purpleLight: '#7D3C98',
  purpleDark: '#4A235A',
  
  // Golden Ticket Gold
  gold: '#D4AF37',
  goldLight: '#F4D03F',
  goldDark: '#B8860B',
  
  // Chocolate Factory Browns
  chocolate: '#5D4037',
  chocolateLight: '#8D6E63',
  chocolateDark: '#3E2723',
  
  // Candy Accents
  candyPink: '#E91E63',
  mintGreen: '#26A69A',
  berryBlue: '#3498DB',
  
  // Cream & Neutrals
  cream: '#FFF8E1',
  ivory: '#FFFEF0',
  
  // Alerts
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
};

const tintColorLight = WonkaColors.purple;
const tintColorDark = WonkaColors.gold;

export const Colors = {
  light: {
    text: '#3E2723',
    background: WonkaColors.cream,
    tint: tintColorLight,
    icon: WonkaColors.chocolate,
    tabIconDefault: WonkaColors.chocolateLight,
    tabIconSelected: WonkaColors.purple,
  },
  dark: {
    text: WonkaColors.cream,
    background: WonkaColors.chocolateDark,
    tint: tintColorDark,
    icon: WonkaColors.goldLight,
    tabIconDefault: WonkaColors.chocolateLight,
    tabIconSelected: WonkaColors.gold,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
