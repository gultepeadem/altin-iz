/**
 * Altın İz - Güvenli Çevre Değişkenleri Yöneticisi
 * Referans: docs/ARCHITECTURE.md Bölüm 6 & docs/SECURITY.md Bölüm 12
 *
 * Mobil istemci yalnızca EXPO_PUBLIC_ ön ekli açık değişkenleri okuyabilir.
 * Gizli anahtarlar (service_role, db şifresi vb.) burada ASLA bulunamaz.
 */

export interface AppEnvironment {
  supabaseUrl: string;
  supabasePublishableKey: string;
  appEnv: 'development' | 'staging' | 'production';
}

function resolveEnvironment(): AppEnvironment {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const appEnvRaw = process.env.EXPO_PUBLIC_APP_ENV || 'development';

  if (!supabaseUrl || !supabaseUrl.trim()) {
    throw new Error(
      'Kritik Yapılandırma Hatası: EXPO_PUBLIC_SUPABASE_URL ortam değişkeni tanımlanmamış. ' +
      'Lütfen .env.local dosyanızı kontrol edin.'
    );
  }

  if (!supabaseUrl.startsWith('https://')) {
    throw new Error(
      'Kritik Güvenlik Hatası: EXPO_PUBLIC_SUPABASE_URL https:// ile başlamalıdır. ' +
      `Mevcut değer: ${supabaseUrl}`
    );
  }

  if (!supabasePublishableKey || !supabasePublishableKey.trim()) {
    throw new Error(
      'Kritik Yapılandırma Hatası: EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ortam değişkeni tanımlanmamış. ' +
      'Lütfen .env.local dosyanızı kontrol edin.'
    );
  }

  const appEnv = (['development', 'staging', 'production'].includes(appEnvRaw)
    ? appEnvRaw
    : 'development') as 'development' | 'staging' | 'production';

  return {
    supabaseUrl: supabaseUrl.trim(),
    supabasePublishableKey: supabasePublishableKey.trim(),
    appEnv,
  };
}

export const env: AppEnvironment = resolveEnvironment();
