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
