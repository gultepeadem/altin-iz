/**
 * Altın İz — Kullanıcı Tercihleri Modelleri
 * src/models/preferences.ts
 *
 * Veritabanı Tablosu: public.user_preferences
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 16
 * Karar Referansı: ADR-004 (Tema Yönetimi ve Tercih Saklama)
 */

import type { ThemePreference } from '../theme/types.ts';

export const THEME_PREFERENCE_STORAGE_KEY = 'altiniz_theme_preference';

export const VALID_THEMES: readonly ThemePreference[] = ['light', 'dark', 'system'] as const;

export function isValidTheme(theme: unknown): theme is ThemePreference {
  return typeof theme === 'string' && (VALID_THEMES as readonly string[]).includes(theme);
}

export interface UserPreferences {
  userId: string;
  theme: ThemePreference;
  languageCode: string;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
}

export function mapRowToUserPreferences(row: any): UserPreferences {
  return {
    userId: row.user_id,
    theme: isValidTheme(row.theme) ? row.theme : 'system',
    languageCode: row.language_code || 'tr',
    currencyCode: row.currency_code || 'TRY',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
