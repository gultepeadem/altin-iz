/**
 * Altın İz - Fiyat Çekme Edge Function Ortam Değişkenleri ve Yapılandırma
 * supabase/functions/fetch-gold-prices/config.ts
 */

import type { FetchPricesConfig } from './types.ts';

// Hem Deno çalışma zamanında (Supabase Edge) hem de Node.js ortamında (testler) çalışabilen güvenli ortam okuyucu
declare const Deno: { env: { get(key: string): string | undefined } } | undefined;

export function getEnv(key: string, defaultValue = ''): string {
  try {
    if (typeof Deno !== 'undefined' && Deno?.env?.get) {
      return Deno.env.get(key) ?? defaultValue;
    }
    if (typeof process !== 'undefined' && process?.env) {
      return process.env[key] ?? defaultValue;
    }
  } catch {
    // Kısıtlı ortam veya izin hatası durumunda varsayılanı kullan
  }
  return defaultValue;
}

export function getFetchPricesConfig(overrides?: Partial<FetchPricesConfig>): FetchPricesConfig {
  const apiKey = overrides?.apiKey ?? getEnv('GOLD_PRICE_API_KEY', 'dev_mock_gold_api_key_2026');
  const baseUrl = overrides?.baseUrl ?? getEnv('GOLD_PRICE_API_BASE_URL', 'https://api.altin.in/v1/prices');
  const sourceCode = overrides?.sourceCode ?? getEnv('GOLD_PRICE_SOURCE_CODE', 'ALTIN_API');
  const timeoutMs = overrides?.timeoutMs ?? Number(getEnv('FETCH_TIMEOUT_MS', '8000'));
  const maxRetries = overrides?.maxRetries ?? Number(getEnv('MAX_RETRIES', '2'));
  const retryDelayMs = overrides?.retryDelayMs ?? Number(getEnv('RETRY_DELAY_MS', '500'));

  return {
    apiKey,
    baseUrl,
    sourceCode,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 8000,
    maxRetries: Number.isFinite(maxRetries) && maxRetries >= 0 ? maxRetries : 2,
    retryDelayMs: Number.isFinite(retryDelayMs) && retryDelayMs >= 0 ? retryDelayMs : 500,
  };
}
