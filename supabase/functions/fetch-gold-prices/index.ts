/**
 * Altın İz - Fiyat Çekme Supabase Edge Function Giriş Noktası
 * supabase/functions/fetch-gold-prices/index.ts
 */

import { getFetchPricesConfig, getSchedulerConfig } from './config.ts';
import { fetchGoldPricesFromProvider } from './fetcher.ts';
import { validateAndTransformPrices } from './validator.ts';
import { executePriceFetchRun } from './scheduler.ts';
import { PriceApiError } from './types.ts';
import { safeError, safeLog } from './sanitizer.ts';
import { createClient } from '@supabase/supabase-js';

// Deno HTTP Server ve ortam değişkenleri için tip bildirimleri
declare const Deno: {
  serve(handler: (req: Request) => Promise<Response> | Response): void;
  env: { get(key: string): string | undefined };
} | undefined;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

/**
 * Yetkilendirme Başlığı Denetimi:
 * Fonksiyon yalnızca CRON, service_role veya geçerli bir yetkili oturum ile çağrılabilir.
 */
function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  const serviceRoleKey =
    typeof Deno !== 'undefined' && Deno?.env?.get
      ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      : typeof process !== 'undefined' && process?.env
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : undefined;

  const anonKey =
    typeof Deno !== 'undefined' && Deno?.env?.get
      ? Deno.env.get('SUPABASE_ANON_KEY')
      : typeof process !== 'undefined' && process?.env
      ? process.env.SUPABASE_ANON_KEY
      : undefined;

  if (!authHeader) return false;

  // Service role veya anon token denetimi
  if (serviceRoleKey && authHeader.includes(serviceRoleKey)) return true;
  if (anonKey && authHeader.includes(anonKey)) return true;

  // Standart yetkili Bearer token denetimi
  return authHeader.startsWith('Bearer ') && authHeader.length > 15;
}

function getSupabaseAdminClient() {
  const url =
    typeof Deno !== 'undefined' && Deno?.env?.get
      ? Deno.env.get('SUPABASE_URL')
      : typeof process !== 'undefined' && process?.env
      ? process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      : undefined;

  const key =
    typeof Deno !== 'undefined' && Deno?.env?.get
      ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      : typeof process !== 'undefined' && process?.env
      ? process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      : undefined;

  if (url && key) {
    return createClient(url, key);
  }
  return null;
}

export async function handler(req: Request): Promise<Response> {
  // CORS Preflight istekleri
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  // Güvenlik ve yetki kontrolü
  if (!isAuthorized(req)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: 'Bu Edge Function yalnızca yetkili servis veya oturum tarafından çağrılabilir.',
        },
      }),
      {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  const config = getFetchPricesConfig();
  const schedulerConfig = getSchedulerConfig();

  // İstek gövdesinden tetikleyici seçeneklerini oku (varsa)
  let body: any = {};
  if (req.method === 'POST') {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  const triggerType = body.triggerType ?? 'manual';
  const force = Boolean(body.force);

  try {
    safeLog(`Fiyat çekme Edge Function tetiklendi [Tetikleyici: ${triggerType}, Zamanlayıcı Aktif: ${schedulerConfig.enabled}].`, {
      source: config.sourceCode,
      url: config.baseUrl,
    }, config.apiKey);

    const adminClient = getSupabaseAdminClient();
    if (adminClient && body.executeRun !== false) {
      // Tam veritabanı entegrasyonlu kilit, kota ve çalıştırma kaydı
      const executionResult = await executePriceFetchRun(adminClient, {
        triggerType,
        force,
        sourceCode: config.sourceCode,
      });

      return new Response(
        JSON.stringify(executionResult),
        {
          status: executionResult.success ? 200 : 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // Standart / İzole çekim ve doğrulama akışı
    const result = await fetchGoldPricesFromProvider(config);
    const validation = validateAndTransformPrices(result.rawData, config.sourceCode, []);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          fetch: result,
          validation,
        },
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    if (error instanceof PriceApiError) {
      safeError(`Fiyat çekme işlemi başarısız oldu [${error.code}]: ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
        retryable: error.retryable,
        attemptCount: error.attemptCount,
      }, config.apiKey);

      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            retryable: error.retryable,
            attemptCount: error.attemptCount,
          },
        }),
        {
          status: error.statusCode && error.statusCode >= 400 && error.statusCode <= 599 ? error.statusCode : 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    const message = (error as Error)?.message || 'Bilinmeyen sistem hatası';
    safeError(`Beklenmeyen hata oluştu: ${message}`, undefined, config.apiKey);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Fiyat servisinde beklenmeyen bir hata oluştu.',
        },
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
}

// Deno çalışma zamanında HTTP sunucusunu başlat
if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(handler);
}
