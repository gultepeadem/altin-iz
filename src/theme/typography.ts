/**
 * Altın İz — Tipografi ve Yazı Boyutu Sistemi
 * 
 * Okunabilirlik ve WCAG kontrast standartlarına uygun yazı boyutu ve satır yüksekliği değerleri.
 */

import { TypographySystem } from './types';

export const typography: TypographySystem = {
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  headline: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
};
