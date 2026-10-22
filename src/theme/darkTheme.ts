/**
 * Altın İz — Koyu Tema Renk Paleti
 * 
 * ARCHITECTURE.md (Bölüm 23) tasarım kararlarına göre hazırlanmıştır.
 * Düşük ışık ortamında göz yormayacak derin lacivert-siyah yüzeyler kullanır.
 * WCAG AA kontrast gereksinimlerini karşılar.
 */

import { ColorPalette, Theme } from './types';
import { spacing } from './spacing';
import { typography } from './typography';

export const darkColors: ColorPalette = {
  background: '#0B1220',
  card: '#111C2F',
  cardBorder: '#1E2D4A',
  surfaceElevated: '#17243A',
  primary: '#2B3F6D',
  primaryLight: '#3D5897',
  gold: '#E0B84F',
  goldLight: '#2C2513',
  textPrimary: '#F5F7FA',
  textSecondary: '#AAB2C0',
  textTertiary: '#6B7688',
  textInverse: '#0B1220',
  profit: '#22C55E',
  profitLight: '#0E2E1B',
  loss: '#EF4444',
  lossLight: '#3B1518',
  warning: '#F59E0B',
  warningLight: '#3B2909',
  border: '#1E2D4A',
  divider: '#152238',
};

export const darkTheme: Theme = {
  isDark: true,
  colors: darkColors,
  spacing,
  typography,
};
