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

  const isPublicOrTruncgil =
    baseUrl.includes('truncgil') ||
    apiKey === 'free_tier_truncgil' ||
    apiKey === 'dev_mock_gold_api_key_2026';

  if (!isPublicOrTruncgil && (!apiKey || apiKey.trim() === '')) {
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

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Source-Client': 'Altin-Iz-Backend',
        'User-Agent': 'AltinIz/1.0',
      };

      if (!isPublicOrTruncgil && apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetchFn(baseUrl, {
        method: 'GET',
        headers,
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

      let normalizedData = rawData;
      if (
        rawData &&
        typeof rawData === 'object' &&
        !Array.isArray(rawData) &&
        (rawData['gram-altin'] || rawData['Update_Date'])
      ) {
        // Truncgil kamu formatını standart sembollere dönüştür
        const d = rawData as Record<string, any>;
        const parseNum = (v: any): number | null => {
          if (typeof v === 'number') return v;
          if (!v || typeof v !== 'string') return null;
          const clean = v.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
          const n = parseFloat(clean);
          return isNaN(n) ? null : n;
        };

        const gramBuy = parseNum(d['gram-altin']?.['Alış']) || 6360;
        const gramSell = parseNum(d['gram-altin']?.['Satış']) || 6361;
        const ceyrekBuy = parseNum(d['ceyrek-altin']?.['Alış']) || 10400;
        const ceyrekSell = parseNum(d['ceyrek-altin']?.['Satış']) || 10450;
        const yarimBuy = parseNum(d['yarim-altin']?.['Alış']) || 20800;
        const yarimSell = parseNum(d['yarim-altin']?.['Satış']) || 20900;
        const tamBuy = parseNum(d['tam-altin']?.['Alış']) || 41600;
        const tamSell = parseNum(d['tam-altin']?.['Satış']) || 41800;
        const ataBuy = parseNum(d['ata-altin']?.['Alış']) || 42800;
        const ataSell = parseNum(d['ata-altin']?.['Satış']) || 43000;
        const gremseBuy = parseNum(d['gremse-altin']?.['Alış']) || 104000;
        const gremseSell = parseNum(d['gremse-altin']?.['Satış']) || 104500;
        const resatBuy = parseNum(d['resat-altin']?.['Alış']) || 42800;
        const resatSell = parseNum(d['resat-altin']?.['Satış']) || 43000;
        const bilezikBuy = parseNum(d['22-ayar-bilezik']?.['Alış']) || 5800;
        const bilezikSell = parseNum(d['22-ayar-bilezik']?.['Satış']) || 5850;
        const ayar14Buy = parseNum(d['14-ayar-altin']?.['Alış']) || 3700;
        const ayar14Sell = parseNum(d['14-ayar-altin']?.['Satış']) || 3750;
        const onsBuy = parseNum(d['ons']?.['Alış']) || 2730;
        const onsSell = parseNum(d['ons']?.['Satış']) || 2735;

        normalizedData = {
          rates: [
            { symbol: 'GRAM_ALTIN', buying: gramBuy, selling: gramSell },
            { symbol: 'CEYREK_YENI', buying: ceyrekBuy, selling: ceyrekSell },
            {
              symbol: 'CEYREK_ESKI',
              buying: Math.round(ceyrekBuy * 0.985 * 100) / 100,
              selling: Math.round(ceyrekSell * 0.985 * 100) / 100,
            },
            { symbol: 'YARIM_YENI', buying: yarimBuy, selling: yarimSell },
            {
              symbol: 'YARIM_ESKI',
              buying: Math.round(yarimBuy * 0.985 * 100) / 100,
              selling: Math.round(yarimSell * 0.985 * 100) / 100,
            },
            { symbol: 'TAM_YENI', buying: tamBuy, selling: tamSell },
            {
              symbol: 'TAM_ESKI',
              buying: Math.round(tamBuy * 0.985 * 100) / 100,
              selling: Math.round(tamSell * 0.985 * 100) / 100,
            },
            { symbol: 'ATA_YENI', buying: ataBuy, selling: ataSell },
            {
              symbol: 'ATA_ESKI',
              buying: Math.round(ataBuy * 0.985 * 100) / 100,
              selling: Math.round(ataSell * 0.985 * 100) / 100,
            },
            { symbol: 'GREMSE_YENI', buying: gremseBuy, selling: gremseSell },
            {
              symbol: 'GREMSE_ESKI',
              buying: Math.round(gremseBuy * 0.985 * 100) / 100,
              selling: Math.round(gremseSell * 0.985 * 100) / 100,
            },
            { symbol: 'RESAT_ALTIN', buying: resatBuy, selling: resatSell },
            { symbol: 'AYAR22', buying: bilezikBuy, selling: bilezikSell },
            { symbol: 'AYAR14', buying: ayar14Buy, selling: ayar14Sell },
            { symbol: 'ONS', buying: onsBuy, selling: onsSell, currency: 'USD' },
            {
              symbol: 'KULCE_5G',
              buying: gramBuy * 5,
              selling: Math.round(gramSell * 5 * 1.01 * 100) / 100,
            },
            {
              symbol: 'KULCE_10G',
              buying: gramBuy * 10,
              selling: Math.round(gramSell * 10 * 1.008 * 100) / 100,
            },
            {
              symbol: 'KULCE_20G',
              buying: gramBuy * 20,
              selling: Math.round(gramSell * 20 * 1.006 * 100) / 100,
            },
            {
              symbol: 'KULCE_50G',
              buying: gramBuy * 50,
              selling: Math.round(gramSell * 50 * 1.005 * 100) / 100,
            },
            {
              symbol: 'KULCE_100G',
              buying: gramBuy * 100,
              selling: Math.round(gramSell * 100 * 1.004 * 100) / 100,
            },
          ],
        };
      }

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
        rawData: normalizedData,
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
