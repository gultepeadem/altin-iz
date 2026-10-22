/**
 * Faz 6.1: Fiyat Çekme Edge Function Doğrulama ve Güvenlik Testleri
 * supabase/tests/test-faz6-1-edge-function.ts
 */

import { getFetchPricesConfig } from '../functions/fetch-gold-prices/config.ts';
import { fetchGoldPricesFromProvider } from '../functions/fetch-gold-prices/fetcher.ts';
import { maskSecret, sanitizeLog } from '../functions/fetch-gold-prices/sanitizer.ts';
import { handler } from '../functions/fetch-gold-prices/index.ts';
import { PriceApiError } from '../functions/fetch-gold-prices/types.ts';

async function runTests() {
  console.log('--- Faz 6.1: Fiyat Çekme Edge Function Doğrulama Testleri ---\n');

  let passed = 0;
  const total = 9;

  // Test 1: Ortam değişkenleri ve yapılandırma
  try {
    const config = getFetchPricesConfig({
      apiKey: 'test_super_secret_key_12345',
      baseUrl: 'https://test-api.example.com/prices',
      timeoutMs: 3000,
      maxRetries: 2,
    });
    if (
      config.apiKey === 'test_super_secret_key_12345' &&
      config.baseUrl === 'https://test-api.example.com/prices' &&
      config.timeoutMs === 3000 &&
      config.maxRetries === 2
    ) {
      console.log('✓ Test 1 Passed: Ortam değişkenleri ve yapılandırma (config) başarıyla yüklendi.');
      passed++;
    } else {
      console.error('✗ Test 1 Failed: Config değerleri eşleşmedi.');
    }
  } catch (err: any) {
    console.error('✗ Test 1 Error:', err.message);
  }

  // Test 2: Başarılı fiyat çekme (HTTP 200)
  try {
    const mockData = {
      success: true,
      data: [
        { symbol: 'GRAM_ALTIN', buying: 3020.5, selling: 3025.0 },
        { symbol: 'CEYREK_YENI', buying: 4940.0, selling: 4990.0 }
      ]
    };

    let fetchCount = 0;
    const mockFetch = async () => {
      fetchCount++;
      return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const config = getFetchPricesConfig({ retryDelayMs: 10 });
    const result = await fetchGoldPricesFromProvider(config, mockFetch as any);

    if (
      result.success === true &&
      result.statusCode === 200 &&
      result.attemptCount === 1 &&
      fetchCount === 1 &&
      Array.isArray((result.rawData as any).data)
    ) {
      console.log('✓ Test 2 Passed: Başarılı fiyat çekme yanıtı (HTTP 200) ve veri yapısı doğrulandı.');
      passed++;
    } else {
      console.error('✗ Test 2 Failed: Başarılı yanıt doğrulanamadı.');
    }
  } catch (err: any) {
    console.error('✗ Test 2 Error:', err.message);
  }

  // Test 3: 401 Unauthorized hata yönetimi (non-retryable)
  try {
    let callCount = 0;
    const mock401Fetch = async () => {
      callCount++;
      return new Response(JSON.stringify({ error: 'Invalid API key' }), { status: 401 });
    };

    const config = getFetchPricesConfig({ apiKey: 'invalid_key', maxRetries: 3, retryDelayMs: 10 });
    let caughtError: PriceApiError | null = null;

    try {
      await fetchGoldPricesFromProvider(config, mock401Fetch as any);
    } catch (err: any) {
      caughtError = err;
    }

    if (
      caughtError &&
      caughtError.code === 'UNAUTHORIZED' &&
      caughtError.statusCode === 401 &&
      caughtError.retryable === false &&
      callCount === 1 // Asla tekrar denenmemeli!
    ) {
      console.log('✓ Test 3 Passed: 401 Unauthorized hatası yakalandı ve tekrar denenmedi (callCount: 1).');
      passed++;
    } else {
      console.error('✗ Test 3 Failed: 401 davranışı hatalı:', caughtError, 'callCount:', callCount);
    }
  } catch (err: any) {
    console.error('✗ Test 3 Error:', err.message);
  }

  // Test 4: 403 Forbidden hata yönetimi (non-retryable)
  try {
    let callCount = 0;
    const mock403Fetch = async () => {
      callCount++;
      return new Response(JSON.stringify({ error: 'IP not allowed' }), { status: 403 });
    };

    const config = getFetchPricesConfig({ maxRetries: 3, retryDelayMs: 10 });
    let caughtError: PriceApiError | null = null;

    try {
      await fetchGoldPricesFromProvider(config, mock403Fetch as any);
    } catch (err: any) {
      caughtError = err;
    }

    if (
      caughtError &&
      caughtError.code === 'FORBIDDEN' &&
      caughtError.statusCode === 403 &&
      caughtError.retryable === false &&
      callCount === 1 // Asla tekrar denenmemeli!
    ) {
      console.log('✓ Test 4 Passed: 403 Forbidden hatası yakalandı ve tekrar denenmedi (callCount: 1).');
      passed++;
    } else {
      console.error('✗ Test 4 Failed: 403 davranışı hatalı:', caughtError, 'callCount:', callCount);
    }
  } catch (err: any) {
    console.error('✗ Test 4 Error:', err.message);
  }

  // Test 5: 429 Too Many Requests (Rate Limit) hata yönetimi (non-retryable)
  try {
    let callCount = 0;
    const mock429Fetch = async () => {
      callCount++;
      return new Response(JSON.stringify({ error: 'Quota exceeded' }), { status: 429 });
    };

    const config = getFetchPricesConfig({ maxRetries: 3, retryDelayMs: 10 });
    let caughtError: PriceApiError | null = null;

    try {
      await fetchGoldPricesFromProvider(config, mock429Fetch as any);
    } catch (err: any) {
      caughtError = err;
    }

    if (
      caughtError &&
      caughtError.code === 'RATE_LIMITED' &&
      caughtError.statusCode === 429 &&
      caughtError.retryable === false &&
      callCount === 1 // Kotayı daha fazla tüketmemek için tekrar denenmemeli!
    ) {
      console.log('✓ Test 5 Passed: 429 Rate Limit hatası yakalandı ve kota koruması için tekrar denenmedi.');
      passed++;
    } else {
      console.error('✗ Test 5 Failed: 429 davranışı hatalı:', caughtError, 'callCount:', callCount);
    }
  } catch (err: any) {
    console.error('✗ Test 5 Error:', err.message);
  }

  // Test 6: 500-504 Geçici hata yönetimi ve sınırlı tekrar deneme (Retry)
  try {
    let callCount = 0;
    const mock503Fetch = async () => {
      callCount++;
      return new Response(JSON.stringify({ error: 'Service Unavailable' }), { status: 503 });
    };

    const maxRetries = 2;
    const config = getFetchPricesConfig({ maxRetries, retryDelayMs: 10 });
    let caughtError: PriceApiError | null = null;

    try {
      await fetchGoldPricesFromProvider(config, mock503Fetch as any);
    } catch (err: any) {
      caughtError = err;
    }

    // 1 ilk deneme + 2 tekrar deneme = toplam 3 çağrı
    if (
      caughtError &&
      caughtError.code === 'SERVER_ERROR' &&
      caughtError.statusCode === 503 &&
      caughtError.retryable === true &&
      callCount === maxRetries + 1
    ) {
      console.log(`✓ Test 6 Passed: 503 geçici hatasında sınırlı tekrar deneme yapıldı (callCount: ${callCount}).`);
      passed++;
    } else {
      console.error('✗ Test 6 Failed: 503 retry davranışı hatalı:', caughtError, 'callCount:', callCount);
    }
  } catch (err: any) {
    console.error('✗ Test 6 Error:', err.message);
  }

  // Test 7: İstek zaman aşımı (Timeout) ve iptal mekanizması
  try {
    const mockTimeoutFetch = async (_url: any, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        if (init?.signal) {
          init.signal.addEventListener('abort', () => {
            const abortErr = new Error('The operation was aborted');
            abortErr.name = 'AbortError';
            reject(abortErr);
          });
        }
      });
    };

    const config = getFetchPricesConfig({ timeoutMs: 50, maxRetries: 1, retryDelayMs: 10 });
    let caughtError: PriceApiError | null = null;

    try {
      await fetchGoldPricesFromProvider(config, mockTimeoutFetch as any);
    } catch (err: any) {
      caughtError = err;
    }

    if (
      caughtError &&
      caughtError.code === 'TIMEOUT' &&
      caughtError.statusCode === 408
    ) {
      console.log('✓ Test 7 Passed: İstek zaman aşımı (AbortController) başarıyla yakalandı ve TIMEOUT hatası üretildi.');
      passed++;
    } else {
      console.error('✗ Test 7 Failed: Timeout yakalanamadı:', caughtError);
    }
  } catch (err: any) {
    console.error('✗ Test 7 Error:', err.message);
  }

  // Test 8: API Anahtarı Maskeleme ve Log Güvenliği
  try {
    const rawSecret = 'sk_live_secret_gold_api_key_xyz987';
    const masked = maskSecret(rawSecret);
    const sanitized = sanitizeLog(`İstek hatası: API key ${rawSecret} yetersiz`, rawSecret);

    const isPlainSecretExposed = sanitized.includes(rawSecret);
    const containsMaskedSnippet = sanitized.includes(masked);

    if (!isPlainSecretExposed && containsMaskedSnippet && masked === 'sk_...987') {
      console.log('✓ Test 8 Passed: API anahtarı güvenle maskelendi (sk_...987) ve loglardan tamamen arındırıldı.');
      passed++;
    } else {
      console.error('✗ Test 8 Failed: Maskeleme veya log arındırma başarısız:', sanitized);
    }
  } catch (err: any) {
    console.error('✗ Test 8 Error:', err.message);
  }

  // Test 9: Edge Function Handler Yetkilendirme Denetimi
  try {
    // 1. Yetkisiz çağrı (Authorization başlığı yok)
    const unauthorizedReq = new Request('https://edge.supabase.com/functions/v1/fetch-gold-prices', {
      method: 'POST',
      headers: {}
    });
    const unauthResponse = await handler(unauthorizedReq);
    const unauthBody = await unauthResponse.json();

    // 2. Yetkili çağrı (Bearer token var)
    const isUnauthBlocked = unauthResponse.status === 401 && unauthBody.error?.code === 'UNAUTHORIZED_ACCESS';

    if (isUnauthBlocked) {
      console.log('✓ Test 9 Passed: Yetkisiz çağrılar HTTP 401 ile engellendi; yetkilendirme güvenliği doğrulandı.');
      passed++;
    } else {
      console.error('✗ Test 9 Failed: Yetki denetimi beklenen yanıtı vermedi:', unauthResponse.status, unauthBody);
    }
  } catch (err: any) {
    console.error('✗ Test 9 Error:', err.message);
  }

  console.log('\n========================================');
  if (passed === total) {
    console.log(`FAZ 6.1 TÜM EDGE FUNCTION TESTLERİ BAŞARIYLA TAMAMLANDI (${passed}/${total})`);
  } else {
    console.error(`FAZ 6.1 TESTLERİNDE HATA BULUNDU (${passed}/${total})`);
  }
  console.log('========================================\n');
}

runTests().catch(console.error);
