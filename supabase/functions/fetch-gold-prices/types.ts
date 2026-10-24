/**
 * Altın İz - Fiyat Çekme Edge Function Tip Tanımları
 * supabase/functions/fetch-gold-prices/types.ts
 */

export type PriceApiErrorCode =
  | 'UNAUTHORIZED'     // 401: Geçersiz veya eksik API anahtarı
  | 'FORBIDDEN'        // 403: Yetkisiz IP veya erişim engeli
  | 'RATE_LIMITED'     // 429: Sağlayıcı istek sınırı veya kota aşımı
  | 'SERVER_ERROR'     // 500-504: Sağlayıcı sunucu arızası / ağ hatası
  | 'TIMEOUT'          // İstek zaman aşımı (AbortController)
  | 'NETWORK_ERROR'    // Ağ / bağlantı kopması
  | 'INVALID_CONFIG'   // Eksik veya hatalı yapılandırma
  | 'UNKNOWN_ERROR';   // Beklenmeyen hata

export interface PriceApiErrorDetail {
  code: PriceApiErrorCode;
  message: string;
  statusCode?: number;
  retryable: boolean;
  attemptCount: number;
  maskedKeySnippet?: string;
}

export class PriceApiError extends Error {
  readonly code: PriceApiErrorCode;
  readonly statusCode?: number;
  readonly retryable: boolean;
  readonly attemptCount: number;

  constructor(detail: PriceApiErrorDetail) {
    super(detail.message);
    this.name = 'PriceApiError';
    this.code = detail.code;
    this.statusCode = detail.statusCode;
    this.retryable = detail.retryable;
    this.attemptCount = detail.attemptCount;
  }
}

export interface FetchPricesConfig {
  apiKey: string;
  baseUrl: string;
  sourceCode: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

export interface RawPriceItem {
  symbol: string;
  name?: string;
  buying?: number | string;
  selling?: number | string;
  changeRate?: number | string;
  updatedAt?: string | number;
}

export interface RawPriceResponse {
  success?: boolean;
  timestamp?: string | number;
  data?: RawPriceItem[] | Record<string, RawPriceItem>;
  rates?: Record<string, RawPriceItem | number>;
  items?: RawPriceItem[];
}

export interface FetchPricesResult {
  success: boolean;
  sourceCode: string;
  fetchedAt: string;
  attemptCount: number;
  statusCode: number;
  rawData: unknown;
  durationMs: number;
}

export type FetchRunStatus = 'running' | 'success' | 'partial' | 'failed';

export interface ProductMappingInfo {
  id: string;
  source_id: string;
  product_id: string;
  external_symbol: string;
  external_name?: string;
  is_active: boolean;
  product?: {
    id: string;
    code: string;
    name: string;
    measurement_unit: 'piece' | 'gram' | 'ounce';
    is_active: boolean;
  };
}

export interface ValidatedPriceRecord {
  product_id: string;
  source_id: string;
  buy_price_minor: number | null;
  sell_price_minor: number | null;
  currency_code: string;
  price_unit: 'piece' | 'gram' | 'ounce';
  daily_change_percent?: number | null;
  day_low_minor?: number | null;
  day_high_minor?: number | null;
  source_price_at: string;
  fetched_at: string;
  fetch_run_id?: string;
  is_provider_stale: boolean;
  is_valid: boolean;
  validation_message?: string | null;
}

export interface ValidationSummary {
  status: FetchRunStatus;
  productsReceived: number;
  productsSaved: number;
  productsRejected: number;
  validRecords: ValidatedPriceRecord[];
  rejectedRecords: ValidatedPriceRecord[];
  allRecords: ValidatedPriceRecord[];
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface SchedulerConfig {
  enabled: boolean;
  intervalMinutes: number;
  concurrencyTimeoutMinutes: number;
  quotaMonthlyLimit: number;
  skipIdenticalPrices: boolean;
  cooldownMinutes?: number;
}

export interface ConcurrencyCheckResult {
  canRun: boolean;
  activeRunId?: string;
  reason?: 'CONCURRENT_RUN_IN_PROGRESS' | 'STALE_LOCK_CLEARED' | 'NO_CONFLICT';
}

export interface QuotaCheckResult {
  allowed: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
  warning?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: string;
}

export interface ManualTriggerOptions {
  sourceCode?: string;
  force?: boolean;
  triggerType?: 'manual' | 'scheduled';
}


