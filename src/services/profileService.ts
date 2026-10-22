/**
 * Altın İz — Kullanıcı Profili Servisi (profileService)
 * src/services/profileService.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 12
 * Veritabanı Tablosu: public.user_profiles
 * RLS İlkeleri: user_profiles_select_own, user_profiles_update_own
 *
 * Güvenlik Kuralları:
 * - user_id, account_status ve created_at kolonları istemciden asla güncellenemez (trg_protect_user_profiles_columns).
 * - Yalnızca display_name kolonu azami 50 karakter sınırıyla güncellenebilir.
 * - Hatalar normalizeError ile güvenli Türkçe AppError formatına dönüştürülür.
 */

import { supabase } from '../lib/supabase.ts';
import {
  type UserProfile,
  mapRowToUserProfile,
  validateDisplayName,
} from '../models/profile.ts';
import { normalizeError } from '../utils/normalizeError.ts';

export const profileService = {
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
   * Kullanıcının profil bilgilerini getirir.
   * Kayıt yoksa fallback satır oluşturur (DATABASE.md Bölüm 6.2).
   */
  async getProfile(userId?: string): Promise<UserProfile | null> {
    try {
      const activeUserId = await this.resolveUserId(userId);
      if (!activeUserId) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', activeUserId)
        .maybeSingle();

      if (error) {
        throw normalizeError(error);
      }

      if (data) {
        return mapRowToUserProfile(data);
      }

      // Fallback: Kayıt bulunamadıysa yeni satır ekle
      const { data: inserted, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: activeUserId,
          display_name: null,
          account_status: 'active',
        })
        .select()
        .maybeSingle();

      if (insertError) {
        // Çakışma durumunda tekrar oku
        const { data: retryData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', activeUserId)
          .maybeSingle();

        if (retryData) {
          return mapRowToUserProfile(retryData);
        }
      }

      return inserted ? mapRowToUserProfile(inserted) : null;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Kullanıcının görünen adını günceller.
   *
   * @param displayName Yeni görünen ad (azami 50 karakter veya null)
   * @param userId İsteğe bağlı kullanıcı kimliği
   */
  async updateDisplayName(
    displayName: string | null | undefined,
    userId?: string
  ): Promise<{ success: boolean; profile: UserProfile | null }> {
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Geçersiz görünen ad.');
    }

    const trimmedName = displayName?.trim() || null;
    const activeUserId = await this.resolveUserId(userId);
    if (!activeUserId) {
      throw new Error('Aktif kullanıcı oturumu bulunamadı.');
    }

    try {
      // Güvenlik kuralı: Yalnızca display_name güncellenir
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ display_name: trimmedName })
        .eq('user_id', activeUserId)
        .select()
        .maybeSingle();

      if (error) {
        throw normalizeError(error);
      }

      if (data) {
        return {
          success: true,
          profile: mapRowToUserProfile(data),
        };
      }

      // Satır bulunamadıysa fallback insert
      const { data: inserted, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: activeUserId,
          display_name: trimmedName,
          account_status: 'active',
        })
        .select()
        .maybeSingle();

      if (insertError) {
        throw normalizeError(insertError);
      }

      return {
        success: true,
        profile: inserted ? mapRowToUserProfile(inserted) : null,
      };
    } catch (err) {
      throw normalizeError(err);
    }
  },
};
