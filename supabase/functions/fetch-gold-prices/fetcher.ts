/**
 * Altın İz - Dış Sağlayıcı Fiyat Çekme Servisi
 * supabase/functions/fetch-gold-prices/fetcher.ts
 */

import type { FetchPricesConfig, FetchPricesResult } from './types.ts';
import { PriceApiError } from './types.ts';
import { maskSecret, safeError, safeLog, safeWarn } from './sanitizer.ts';

export type CustomFetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/**
 * Belirtilen milisaniye kadar bekletir.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fiyat sağlayıcısından ham fiyat verisini güvenli biçimde çeker.
 * Zaman aşımı, yetki denetimi (401, 403), kota denetimi (429) ve
 * geçici sunucu hatalarında (500-504) sınırlı tekrar deneme içerir.
 */
export async function fetchGoldPricesFromProvider(
  config: FetchPricesConfig,
  fetchFn: CustomFetchFn = fetch
): Promise<FetchPricesResult> {
  const startTime = Date.now();
  const { apiKey, baseUrl, sourceCode, timeoutMs, maxRetries, retryDelayMs } = config;

  if (!apiKey || apiKey.trim() === '') {
    throw new PriceApiError({
      code: 'INVALID_CONFIG',
      message: 'Fiyat API anahtarı (GOLD_PRICE_API_KEY) tanımlanmamış.',
      retryable: false,
      attemptCount: 0,
      maskedKeySnippet: maskSecret(apiKey),
    });
  }

  let attempt = 0;
  let lastError: PriceApiError | null = null;

  while (attempt <= maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      safeLog(`Sağlayıcıya istek gönderiliyor (Deneme ${attempt}/${maxRetries + 1})...`, {
        source: sourceCode,
        url: baseUrl,
        timeoutMs,
      }, apiKey);

      const response = await fetchFn(baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-Source-Client': 'Altin-Iz-Backend',
          'User-Agent': 'AltinIz/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const status = response.status;

      // 1. Yetki ve Kimlik Hataları (401 Unauthorized) -> Tekrar denenmez
      if (status === 401) {
        safeError('Fiyat sağlayıcısı 401 Unauthorized döndürdü. API anahtarı geçersiz veya süresi dolmuş.', {
          status,
          attempt,
        }, apiKey);
        throw new PriceApiError({
          code: 'UNAUTHORIZED',
          message: 'Fiyat sağlayıcı kimlik doğrulaması başarısız (HTTP 401).',
          statusCode: 401,
          retryable: false,
          attemptCount: attempt,
          maskedKeySnippet: maskSecret(apiKey),
        });
      }

      // 2. Erişim Engeli (403 Forbidden) -> Tekrar denenmez
      if (status === 403) {
        safeError('Fiyat sağlayıcısı 403 Forbidden döndürdü. Erişim veya IP yetkisi yok.', {
          status,
          attempt,
        }, apiKey);
        throw new PriceApiError({
          code: 'FORBIDDEN',
          message: 'Fiyat sağlayıcı erişim yetkisi reddedildi (HTTP 403).',
          statusCode: 403,
          retryable: false,
          attemptCount: attempt,
          maskedKeySnippet: maskSecret(apiKey),
        });
      }

      // 3. Kota Aşımı (429 Too Many Requests) -> Kotayı daha çok tüketmemek için tekrar denenmez
      if (status === 429) {
        safeWarn('Fiyat sağlayıcısı 429 Too Many Requests döndürdü. İstek limiti veya kota aşıldı.', {
          status,
          attempt,
        }, apiKey);
        throw new PriceApiError({
          code: 'RATE_LIMITED',
          message: 'Fiyat sağlayıcı istek limiti veya kota aşıldı (HTTP 429).',
          statusCode: 429,
          retryable: false,
          attemptCount: attempt,
          maskedKeySnippet: maskSecret(apiKey),
        });
      }

      // 4. Geçici Sunucu Hataları (500, 502, 503, 504) -> Sınırlı tekrar denenebilir
      if (status >= 500 && status <= 504) {
        safeWarn(`Fiyat sağlayıcısı geçici sunucu hatası döndürdü (HTTP ${status}).`, {
          status,
          attempt,
          willRetry: attempt <= maxRetries,
        }, apiKey);

        const serverError = new PriceApiError({
          code: 'SERVER_ERROR',
          message: `Fiyat sağlayıcı geçici sunucu hatası (HTTP ${status}).`,
          statusCode: status,
          retryable: true,
          attemptCount: attempt,
          maskedKeySnippet: maskSecret(apiKey),
        });

        if (attempt <= maxRetries) {
          lastError = serverError;
          await sleep(retryDelayMs * attempt);
          continue;
        } else {
          throw serverError;
        }
      }

      // 5. Diğer Beklenmeyen HTTP Hataları (ör. 404, 400)
      if (!response.ok) {
        safeError(`Fiyat sağlayıcısı başarısız HTTP yanıtı döndürdü: ${status}`, {
          status,
          attempt,
        }, apiKey);
        throw new PriceApiError({
          code: 'UNKNOWN_ERROR',
          message: `Fiyat sağlayıcı beklenmeyen HTTP hatası döndürdü: ${status}`,
          statusCode: status,
          retryable: false,
          attemptCount: attempt,
          maskedKeySnippet: maskSecret(apiKey),
        });
      }

      // 6. Başarılı Yanıt (HTTP 200-299)
      const rawData = await response.json();
      const durationMs = Date.now() - startTime;

      safeLog('Fiyat verisi sağlayıcıdan başarıyla çekildi.', {
        status,
        attempt,
        durationMs,
      }, apiKey);

      return {
        success: true,
        sourceCode,
        fetchedAt: new Date().toISOString(),
        attemptCount: attempt,
        statusCode: status,
        rawData,
        durationMs,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      // Zaten PriceApiError ise ve tekrar denenebilir değilse doğrudan fırlat
      if (err instanceof PriceApiError) {
        if (!err.retryable || attempt > maxRetries) {
          throw err;
        }
        lastError = err;
      } else {
        // Zaman aşımı (AbortError) kontrolü
        const isAbort = (err as Error)?.name === 'AbortError' || controller.signal.aborted;
        if (isAbort) {
          safeWarn(`İstek zaman aşımına uğradı (${timeoutMs} ms).`, {
            attempt,
            willRetry: attempt <= maxRetries,
          }, apiKey);

          const timeoutError = new PriceApiError({
            code: 'TIMEOUT',
            message: `Fiyat sağlayıcı isteği ${timeoutMs} ms içinde yanıt vermedi (Zaman aşımı).`,
            statusCode: 408,
            retryable: true,
            attemptCount: attempt,
            maskedKeySnippet: maskSecret(apiKey),
          });

          if (attempt <= maxRetries) {
            lastError = timeoutError;
            await sleep(retryDelayMs * attempt);
            continue;
          } else {
            throw timeoutError;
          }
        }

        // Genel Ağ / Bağlantı hatası
        const networkError = new PriceApiError({
          code: 'NETWORK_ERROR',
          message: `Fiyat sağlayıcıya bağlanılamadı: ${(err as Error)?.message || 'Bilinmeyen ağ hatası'}`,
          retryable: true,
          attemptCount: attempt,
          maskedKeySnippet: maskSecret(apiKey),
        });

        if (attempt <= maxRetries) {
          lastError = networkError;
          await sleep(retryDelayMs * attempt);
          continue;
        } else {
          throw networkError;
        }
      }

      if (attempt <= maxRetries) {
        await sleep(retryDelayMs * attempt);
      }
    }
  }

  throw lastError || new PriceApiError({
    code: 'UNKNOWN_ERROR',
    message: 'Maksimum tekrar deneme sınırına ulaşıldı ancak fiyat alınamadı.',
    retryable: false,
    attemptCount: attempt,
    maskedKeySnippet: maskSecret(apiKey),
  });
}
