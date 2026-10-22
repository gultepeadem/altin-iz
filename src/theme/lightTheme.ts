/**
 * Altın İz — Açık Tema Renk Paleti
 * 
 * ARCHITECTURE.md (Bölüm 23) tasarım kararlarına göre hazırlanmıştır.
 * WCAG AA kontrast gereksinimlerini karşılar.
 */

import { ColorPalette, Theme } from './types';
import { spacing } from './spacing';
import { typography } from './typography';

export const lightColors: ColorPalette = {
  background: '#F7F8FA',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  surfaceElevated: '#FFFFFF',
  primary: '#14213D',
  primaryLight: '#233866',
  gold: '#D4A72C',
  goldLight: '#FDF7E7',
  textPrimary: '#1C2434',
  textSecondary: '#667085',
  textTertiary: '#98A2B3',
  textInverse: '#FFFFFF',
  profit: '#168A5B',
  profitLight: '#E8F5E9',
  loss: '#C43D4B',
  lossLight: '#FDECEC',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  border: '#E5E7EB',
  divider: '#F0F2F5',
};

export const lightTheme: Theme = {
  isDark: false,
  colors: lightColors,
  spacing,
  typography,
};
