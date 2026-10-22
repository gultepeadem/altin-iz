/**
 * Altın İz — delete-account Supabase Edge Function Giriş Noktası
 * supabase/functions/delete-account/index.ts
 *
 * Referans: docs/ARCHITECTURE.md Bölüm 7.4 & docs/DECISIONS.md ADR-033
 * Görev: docs/TODO.md Faz 12.1 (delete-account Edge Function)
 *
 * Güvenlik Kuralları:
 * 1. Oturum doğrulaması istemciden gelen Bearer token ile yapılır.
 * 2. İstek gövdesindeki serbest user_id ASLA güven kaynağı kabul edilmez.
 * 3. Yeniden kimlik doğrulama (parola kontrolü) zorunludur.
 * 4. Silme hiyerarşisi ADR-033 uyarınca yürütülür.
 * 5. Secret anahtarlar veya hassas bilgiler yanıtlarda/loglarda gösterilmez.
 */

import { createClient } from '@supabase/supabase-js';
import { processAccountDeletion } from './service.ts';
import { type DeleteAccountRequestBody, type DeleteAccountResponse } from './types.ts';
import { safeLog, safeError } from './sanitizer.ts';

// Deno çalışma ortamı için tip bildirimleri
declare const Deno: {
  serve(handler: (req: Request) => Promise<Response> | Response): void;
  env: { get(key: string): string | undefined };
} | undefined;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getEnvVar(key: string): string | undefined {
  if (typeof Deno !== 'undefined' && Deno?.env?.get) {
    return Deno.env.get(key);
  }
  if (typeof process !== 'undefined' && process?.env) {
    return process.env[key];
  }
  return undefined;
}

export async function handler(req: Request): Promise<Response> {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  // Yalnızca POST isteklerine izin verilir
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Yalnızca POST istekleri desteklenmektedir.',
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Geçersiz HTTP metodu.' },
      }),
      {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  // 1. Authorization başlığı kontrolü
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Yetkilendirme başlığı (Bearer token) bulunamadı.',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Hesap silme işlemi için oturum açmış olmanız gereklidir.',
        },
      } satisfies DeleteAccountResponse),
      {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  const userToken = authHeader.replace(/^Bearer\s+/i, '').trim();

  // 2. Ortam değişkenlerini oku
  const supabaseUrl = getEnvVar('SUPABASE_URL') || getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey =
    getEnvVar('SUPABASE_ANON_KEY') ||
    getEnvVar('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
    getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  const supabaseServiceKey =
    getEnvVar('SUPABASE_SERVICE_ROLE_KEY') ||
    supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    safeError('Edge function yapılandırma ortam değişkenleri eksik.');
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Sunucu yapılandırma hatası.',
        error: {
          code: 'CONFIG_ERROR',
          message: 'Silme servisi şu anda kullanılamıyor. Lütfen daha sonra deneyin.',
        },
      } satisfies DeleteAccountResponse),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  // 3. Supabase istemcilerini oluştur
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${userToken}` } },
  });

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 4. İstek gövdesini ayrıştır
  let body: DeleteAccountRequestBody = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  safeLog('Hesap silme Edge Function çağrıldı.');

  // 5. Silme boru hattını çalıştır
  const result = await processAccountDeletion({
    userClient,
    adminClient,
    userToken,
    body,
  });

  if (!result.success) {
    const statusCode =
      result.errorCode === 'UNAUTHORIZED' || result.errorCode === 'INVALID_CREDENTIALS'
        ? 401
        : result.errorCode === 'MISSING_PASSWORD'
        ? 400
        : 500;

    return new Response(
      JSON.stringify({
        success: false,
        message: result.errorMessage || 'Hesap silinemedi.',
        deletionRequestId: result.deletionRequestId,
        error: {
          code: result.errorCode || 'DELETION_FAILED',
          message: result.errorMessage || 'Hesap silme işlemi başarısız oldu.',
        },
      } satisfies DeleteAccountResponse),
      {
        status: statusCode,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  // 6. Başarılı yanıt
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Hesabınız ve tüm ilişkili verileriniz başarıyla silindi.',
      deletionRequestId: result.deletionRequestId,
    } satisfies DeleteAccountResponse),
    {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    }
  );
}

// Deno HTTP Server'ı başlat
if (typeof Deno !== 'undefined' && Deno?.serve) {
  Deno.serve(handler);
}
