/**
 * Altın İz — Kullanıcı Tercihleri Servisi (preferencesService)
 * src/services/preferencesService.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 16
 * Veritabanı: public.user_preferences (RLS: user_preferences_select_own, user_preferences_update_own)
 * Karar Referansı: ADR-004 (Tema Yönetimi ve Tercih Saklama)
 *
 * Kurallar:
 * 1. Tema seçenekleri: 'light', 'dark', 'system' (ADR-004).
 * 2. Tercih yerel hafızada (AsyncStorage) saklanır; uygulama açılışında anında uygulanır.
 * 3. Oturum açıkken seçim veritabanındaki user_preferences tablosuna kaydedilir.
 * 4. Kolon koruma kuralı: user_id, language_code, currency_code ve created_at istemciden güncellenemez.
 */

import { supabase, safeStorage } from '../lib/supabase.ts';
import type { ThemePreference } from '../theme/types.ts';
import {
  type UserPreferences,
  mapRowToUserPreferences,
  isValidTheme,
  VALID_THEMES,
  THEME_PREFERENCE_STORAGE_KEY,
} from '../models/preferences.ts';
import { normalizeError } from '../utils/normalizeError.ts';

export { VALID_THEMES, THEME_PREFERENCE_STORAGE_KEY, isValidTheme };

export const preferencesService = {
  /**
   * Cihazdaki yerel depolamadan tema tercihini okur.
   * Kayıt yoksa veya geçersizse 'system' varsayılanını döner.
   */
  async getStoredThemePreference(): Promise<ThemePreference> {
    try {
      const stored = await safeStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
      if (isValidTheme(stored)) {
        return stored;
      }
      return 'system';
    } catch {
      return 'system';
    }
  },

  /**
   * Tema tercihini cihazdaki yerel depolamaya kaydeder.
   */
  async setStoredThemePreference(theme: ThemePreference): Promise<void> {
    try {
      if (isValidTheme(theme)) {
        await safeStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, theme);
      }
    } catch {
      // Yerel yazma hatası sessizce yutulabilir
    }
  },

  /**
   * Aktif kullanıcının kimliğini oturumdan çözümler.
   */
  async resolveUserId(providedUserId?: string): Promise<string | null> {
    if (providedUserId) return providedUserId;

    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.user?.id ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Oturumdaki kullanıcının Supabase üzerindeki tercihlerini getirir.
   * Kayıt henüz oluşturulmamışsa varsayılan kayıt oluşturur (Fallback kuralı - DATABASE.md 17.1).
   */
  async getUserPreferences(userId?: string): Promise<UserPreferences | null> {
    try {
      const activeUserId = await this.resolveUserId(userId);
      if (!activeUserId) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', activeUserId)
        .maybeSingle();

      if (error) {
        throw normalizeError(error);
      }

      if (data) {
        return mapRowToUserPreferences(data);
      }

      // Fallback: Kayıt yoksa varsayılan satırı oluştur
      const defaultTheme = await this.getStoredThemePreference();
      const { data: inserted, error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: activeUserId,
          theme: defaultTheme,
          language_code: 'tr',
          currency_code: 'TRY',
        })
        .select()
        .maybeSingle();

      if (insertError) {
        // Çakışma durumunda (ON CONFLICT) tekrar oku
        const { data: retryData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', activeUserId)
          .maybeSingle();

        if (retryData) {
          return mapRowToUserPreferences(retryData);
        }
      }

      return inserted ? mapRowToUserPreferences(inserted) : null;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Tema tercihini günceller:
   * 1. Cihaz yerel depolamasına yazar (çevrimdışı ve anında görsel tepki).
   * 2. Kullanıcı oturum açmışsa Supabase'deki user_preferences tablosuna kaydeder.
   */
  async updateThemePreference(
    theme: ThemePreference,
    userId?: string
  ): Promise<{
    success: boolean;
    theme: ThemePreference;
    preferences: UserPreferences | null;
  }> {
    if (!VALID_THEMES.includes(theme)) {
      throw new Error(`Geçersiz tema tercihi: ${theme}. Yalnızca 'light', 'dark' veya 'system' kullanılabilir.`);
    }

    // 1. Yerel depolamaya anında yaz
    await this.setStoredThemePreference(theme);

    // 2. Kullanıcı oturumunu kontrol et
    const activeUserId = await this.resolveUserId(userId);
    if (!activeUserId) {
      return {
        success: true,
        theme,
        preferences: null,
      };
    }

    try {
      // 3. Supabase veritabanında yalnızca 'theme' kolonunu güncelle
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ theme })
        .eq('user_id', activeUserId)
        .select()
        .maybeSingle();

      if (error) {
        throw normalizeError(error);
      }

      if (data) {
        return {
          success: true,
          theme,
          preferences: mapRowToUserPreferences(data),
        };
      }

      // Satır bulunamadıysa fallback olarak ekle
      const { data: inserted, error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: activeUserId,
          theme,
          language_code: 'tr',
          currency_code: 'TRY',
        })
        .select()
        .maybeSingle();

      if (insertError) {
        throw normalizeError(insertError);
      }

      return {
        success: true,
        theme,
        preferences: inserted ? mapRowToUserPreferences(inserted) : null,
      };
    } catch {
      // Veritabanı hatası olsa dahi yerel tercih güncellenmiştir
      return {
        success: true,
        theme,
        preferences: null,
      };
    }
  },

  /**
   * Kullanıcı giriş yaptığında yerel ve uzak tercihleri senkronize eder.
   */
  async syncPreferencesOnLogin(userId: string): Promise<ThemePreference> {
    try {
      const remote = await this.getUserPreferences(userId);
      if (remote && remote.theme && VALID_THEMES.includes(remote.theme)) {
        await this.setStoredThemePreference(remote.theme);
        return remote.theme;
      }

      // Uzak tercih yoksa yereldeki tercihi uzak sunucuya yükle
      const local = await this.getStoredThemePreference();
      await this.updateThemePreference(local, userId);
      return local;
    } catch {
      return this.getStoredThemePreference();
    }
  },
};
