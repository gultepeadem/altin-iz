/**
 * Altın İz - Fiyat Çekme Edge Function Ortam Değişkenleri ve Yapılandırma
 * supabase/functions/fetch-gold-prices/config.ts
 */

import type { FetchPricesConfig, SchedulerConfig } from './types.ts';

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
  const apiKey = overrides?.apiKey ?? getEnv('GOLD_PRICE_API_KEY', 'free_tier_truncgil');
  const baseUrl = overrides?.baseUrl ?? getEnv('GOLD_PRICE_API_BASE_URL', 'https://finans.truncgil.com/today.json');
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

export function getSchedulerConfig(overrides?: Partial<SchedulerConfig>): SchedulerConfig {
  // Development ortamında otomatik zamanlayıcı varsayılan olarak KAPALIDIR (false)
  const envEnabled = getEnv('ENABLE_PRICE_SCHEDULER', 'false').toLowerCase() === 'true';
  const enabled = overrides?.enabled ?? envEnabled;
  const intervalMinutes = overrides?.intervalMinutes ?? Number(getEnv('PRICE_SCHEDULER_INTERVAL_MINUTES', '15'));
  const concurrencyTimeoutMinutes = overrides?.concurrencyTimeoutMinutes ?? Number(getEnv('CONCURRENCY_TIMEOUT_MINUTES', '5'));
  const quotaMonthlyLimit = overrides?.quotaMonthlyLimit ?? Number(getEnv('GOLD_API_MONTHLY_QUOTA_LIMIT', '500'));
  const skipIdenticalPrices = overrides?.skipIdenticalPrices ?? (getEnv('SKIP_IDENTICAL_PRICES', 'true').toLowerCase() === 'true');

  return {
    enabled,
    intervalMinutes: Number.isFinite(intervalMinutes) && intervalMinutes > 0 ? intervalMinutes : 15,
    concurrencyTimeoutMinutes: Number.isFinite(concurrencyTimeoutMinutes) && concurrencyTimeoutMinutes > 0 ? concurrencyTimeoutMinutes : 5,
    quotaMonthlyLimit: Number.isFinite(quotaMonthlyLimit) && quotaMonthlyLimit > 0 ? quotaMonthlyLimit : 500,
    skipIdenticalPrices,
  };
}

