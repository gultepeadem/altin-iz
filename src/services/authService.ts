/**
 * Altın İz — Kimlik Doğrulama Servisi (authService)
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 12.1 (authService.ts)
 * Güvenlik Referansı: docs/SECURITY.md Bölüm 6, 7 ve 18 (Kimlik Doğrulama, Oturum ve Log Güvenliği)
 *
 * Güvenlik Kuralları:
 * - Şifreler ve kimlik belirteçleri asla loglara, konsola veya uzak servislere yazdırılmaz.
 * - Hatalı giriş veya şifre sıfırlamada e-posta adresinin sistemdeki mevcudiyeti gereksiz yere ifşa edilmez.
 * - Tüm hata durumları normalizeError ile güvenli Türkçe AppError formatına dönüştürülür.
 */

import type { AuthChangeEvent, Session, Subscription, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type {
  AuthSuccessResult,
  ResendVerificationParams,
  ResetPasswordParams,
  SignInCredentials,
  SignUpCredentials,
} from '@/models/auth';
import { normalizeError } from '@/utils/normalizeError';

export const authService = {
  /**
   * Yeni bir kullanıcı hesabı oluşturur.
   *
   * @param credentials Kayıt bilgileri (e-posta, şifre ve isteğe bağlı görünen ad)
   * @returns Kullanıcı ve oturum bilgilerini içeren nesne
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthSuccessResult> {
    try {
      const email = credentials.email.trim();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: credentials.password,
        options: {
          data: credentials.displayName?.trim()
            ? { display_name: credentials.displayName.trim() }
            : undefined,
        },
      });

      if (error) {
        throw normalizeError(error);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Mevcut kullanıcı e-posta ve şifresiyle oturum açar.
   *
   * @param credentials Giriş bilgileri (e-posta ve şifre)
   * @returns Kullanıcı ve oturum bilgilerini içeren nesne
   */
  async signInWithPassword(credentials: SignInCredentials): Promise<AuthSuccessResult> {
    try {
      const email = credentials.email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: credentials.password,
      });

      if (error) {
        throw normalizeError(error);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Aktif oturumu sonlandırır ve yerel kullanıcı önbelleklerini temizler.
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw normalizeError(error);
      }
    } catch (error) {
      throw normalizeError(error);
    } finally {
      // Güvenlik Kuralı: Çıkışta kullanıcıya ait yerel önbellek ve portföy verileri silinir
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const userCacheKeys = allKeys.filter(
          (k) => k.startsWith('portfolio_') || k.startsWith('cache_') || k.startsWith('user_')
        );
        if (userCacheKeys.length > 0) {
          await AsyncStorage.multiRemove(userCacheKeys);
        }
      } catch {
        // Önbellek silme hatası çıkış akışını engellememelidir
      }
    }
  },

  /**
   * Mevcut oturum bilgilerini yerel saklama alanından okur.
   *
   * @returns Aktif Session veya oturum yoksa null
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw normalizeError(error);
      }
      return data.session;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Sunucu üzerinden doğrulanmış geçerli kullanıcıyı getirir.
   *
   * @returns Doğrulanmış User veya oturum yoksa null
   */
  async getUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw normalizeError(error);
      }
      return data.user;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Kayıt sonrası e-posta doğrulama bağlantısını tekrar gönderir.
   *
   * @param params E-posta adresi
   */
  async resendVerificationEmail(params: ResendVerificationParams): Promise<void> {
    try {
      const email = params.email.trim();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw normalizeError(error);
      }
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Şifre sıfırlama talebinde bulunur ve sıfırlama bağlantısını e-posta ile gönderir.
   *
   * Güvenlik Kuralı: E-posta sistemde kayıtlı olmasa bile dışarıya bilgi sızdırmaz.
   *
   * @param params E-posta adresi ve isteğe bağlı yönlendirme adresi
   */
  async resetPasswordForEmail(params: ResetPasswordParams): Promise<void> {
    try {
      const email = params.email.trim();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: params.redirectTo,
      });

      if (error) {
        throw normalizeError(error);
      }
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Aktif oturumdaki kullanıcının şifresini günceller (Şifre sıfırlama veya değiştirme).
   *
   * @param newPassword Yeni şifre
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw normalizeError(error);
      }
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Derin bağlantıdan (deep link) gelen auth kodunu oturuma dönüştürür (PKCE akışı).
   *
   * @param code Supabase Auth doğrulama kodu
   * @returns Kullanıcı ve oturum nesnesi
   */
  async exchangeCodeForSession(code: string): Promise<AuthSuccessResult> {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        throw normalizeError(error);
      }
      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Belirteçler (access_token, refresh_token) üzerinden oturum kurar.
   *
   * @param tokens Erişim ve yenileme belirteçleri
   * @returns Kullanıcı ve oturum nesnesi
   */
  async setSession(tokens: { access_token: string; refresh_token: string }): Promise<AuthSuccessResult> {
    try {
      const { data, error } = await supabase.auth.setSession(tokens);
      if (error) {
        throw normalizeError(error);
      }
      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Kimlik doğrulama durumu değişikliklerini dinleyen abonelik oluşturur.
   *
   * @param callback Olay tetiklendiğinde çağrılacak geri çağırma fonksiyonu
   * @returns Abonelik nesnesi ({ data: { subscription } })
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { data: { subscription: Subscription } } {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Kullanıcı hesabını ve tüm ilişkili verilerini kalıcı olarak siler (Faz 12.1 Edge Function).
   * ADR-033 uyarınca yeniden kimlik doğrulama parolası zorunludur.
   * Silme başarılı olduğunda yerel oturum ve önbellekler temizlenir.
   */
  async deleteAccount(params: { password: string; reason?: string }): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: {
          password: params.password,
          reason: params.reason,
        },
      });

      if (error) {
        throw normalizeError(error);
      }

      if (data && !data.success) {
        throw normalizeError(data.error || { message: data.message });
      }

      // Başarılı silme sonrası cihazdaki yerel oturumu ve önbelleği tamamen temizle
      await this.signOut();
    } catch (err) {
      throw normalizeError(err);
    }
  },
};
