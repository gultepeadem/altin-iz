/**
 * Faz 6.3: Fiyat Zamanlayıcısı, Kilit, Kota ve Çakışma Önleme Testleri
 * supabase/tests/test-faz6-3-price-scheduler.ts
 */

import { getSchedulerConfig } from '../functions/fetch-gold-prices/config.ts';
import {
  checkConcurrencyLock,
  checkQuotaUsage,
  isDuplicatePriceData,
  executePriceFetchRun,
} from '../functions/fetch-gold-prices/scheduler.ts';
import type { ValidatedPriceRecord } from '../functions/fetch-gold-prices/types.ts';
import { sanitizeLog } from '../functions/fetch-gold-prices/sanitizer.ts';

async function runTests() {
  console.log('--- Faz 6.3: Fiyat Zamanlayıcısı ve Çakışma Önleme Testleri ---\n');
  let passed = 0;
  const total = 7;

  const mockSourceId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  // Test 1: Development ortamında otomatik zamanlayıcı varsayılan olarak kapalıdır (ADR-031)
  try {
    const config = getSchedulerConfig();
    const mockDisabledClient: any = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { id: mockSourceId, code: 'ALTIN_API' }, error: null }),
          }),
        }),
      }),
    };

    const runResult = await executePriceFetchRun(mockDisabledClient, { triggerType: 'scheduled' });

    if (config.enabled === false && runResult.status === 'disabled' && runResult.success === false) {
      console.log('✓ Test 1 Passed: Development ortamında otomatik zamanlayıcı varsayılan olarak kapalı (ADR-031).');
      passed++;
    } else {
      console.error('✗ Test 1 Failed: Otomatik zamanlayıcı varsayılan durumu hatalı:', config, runResult);
    }
  } catch (err: any) {
    console.error('✗ Test 1 Error:', err.message);
  }

  // Test 2: Yetkili manuel tetikleme (Manual Trigger)
  try {
    // Manuel tetikleme çağrısında zamanlayıcı kapalı olsa bile işlemin engellenmediğini doğrula
    let insertCalled = false;
    let updateCalled = false;

    const mockManualClient: any = {
      from: (table: string) => {
        if (table === 'price_sources') {
          return {
            select: () => ({
              eq: () => ({
                single: async () => ({ data: { id: mockSourceId, code: 'ALTIN_API' }, error: null }),
              }),
            }),
          };
        }
        if (table === 'price_fetch_runs') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    limit: async () => ({ data: [], error: null }),
                  }),
                }),
                gte: async () => ({ count: 10, error: null }),
              }),
            }),
            insert: () => {
              insertCalled = true;
              return {
                select: () => ({
                  single: async () => ({ data: { id: 'test-run-uuid-123' }, error: null }),
                }),
              };
            },
            update: () => {
              updateCalled = true;
              return {
                eq: async () => ({ error: null }),
              };
            },
          };
        }
        if (table === 'price_source_product_mappings') {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  {
                    id: 'm1',
                    source_id: mockSourceId,
                    product_id: 'p1',
                    external_symbol: 'GRAM_ALTIN',
                    is_active: true,
                    product: { id: 'p1', code: 'GRAM_GOLD', name: 'Gram', measurement_unit: 'gram', is_active: true },
                  },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === 'gold_prices') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    limit: async () => ({ data: [], error: null }),
                  }),
                }),
              }),
            }),
            insert: async () => ({ error: null }),
          };
        }
        return {};
      },
    };

    const manualResult = await executePriceFetchRun(mockManualClient, { triggerType: 'manual', force: true });

    if (insertCalled && updateCalled && manualResult.runId === 'test-run-uuid-123') {
      console.log('✓ Test 2 Passed: Yetkili manuel fiyat çekme tetikleyicisi (manual trigger) başarıyla çalıştı.');
      passed++;
    } else {
      console.error('✗ Test 2 Failed: Manuel tetikleme çalıştırılamadı:', manualResult);
    }
  } catch (err: any) {
    console.error('✗ Test 2 Error:', err.message);
  }

  // Test 3: Eşzamanlı istek çakışma koruması (Concurrency Lock)
  try {
    // 1 dakika önce başlamış aktif bir run simülasyonu
    const mockActiveRunClient: any = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => ({
                limit: async () => ({
                  data: [
                    {
                      id: 'active-run-uuid-999',
                      started_at: new Date(Date.now() - 60 * 1000).toISOString(), // 1 dakika önce
                      status: 'running',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    };

    const lockResult = await checkConcurrencyLock(mockActiveRunClient, mockSourceId, 5);

    if (
      lockResult.canRun === false &&
      lockResult.reason === 'CONCURRENT_RUN_IN_PROGRESS' &&
      lockResult.activeRunId === 'active-run-uuid-999'
    ) {
      console.log('✓ Test 3 Passed: Eşzamanlı istek çakışma koruması (Concurrency Lock) aktif işlemi korudu.');
      passed++;
    } else {
      console.error('✗ Test 3 Failed: Eşzamanlı kilit çalışmadı:', lockResult);
    }
  } catch (err: any) {
    console.error('✗ Test 3 Error:', err.message);
  }

  // Test 4: Bayat kilit (Stale Lock) otomatik temizleme
  try {
    // 15 dakika önce başlamış ve tamamlanmamış (stale) run simülasyonu
    let updatedToFailed = false;
    const mockStaleRunClient: any = {
      from: (table: string) => {
        if (table === 'price_fetch_runs') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    limit: async () => ({
                      data: [
                        {
                          id: 'stale-run-uuid-888',
                          started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 dakika önce (timeout 5 dk)
                          status: 'running',
                        },
                      ],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
            update: (payload: any) => {
              if (payload.status === 'failed' && payload.error_code === 'STALE_LOCK_CLEARED') {
                updatedToFailed = true;
              }
              return {
                eq: async () => ({ error: null }),
              };
            },
          };
        }
        return {};
      },
    };

    const staleResult = await checkConcurrencyLock(mockStaleRunClient, mockSourceId, 5);

    if (staleResult.canRun === true && staleResult.reason === 'STALE_LOCK_CLEARED' && updatedToFailed) {
      console.log('✓ Test 4 Passed: 5 dakikadan eski bayat kilit (Stale Lock) temizlendi ve yeni işleme izin verildi.');
      passed++;
    } else {
      console.error('✗ Test 4 Failed: Bayat kilit temizlenemedi:', staleResult, updatedToFailed);
    }
  } catch (err: any) {
    console.error('✗ Test 4 Error:', err.message);
  }

  // Test 5: Ücretsiz kota izleme ve kota aşımında engelleme
  try {
    // Kota 500 iken 500 kullanım simülasyonu
    const mockQuotaExceededClient: any = {
      from: () => ({
        select: () => ({
          eq: () => ({
            gte: async () => ({ count: 500, error: null }),
          }),
        }),
      }),
    };

    // Kota 500 iken 420 kullanım (%80+) simülasyonu
    const mockQuotaWarningClient: any = {
      from: () => ({
        select: () => ({
          eq: () => ({
            gte: async () => ({ count: 420, error: null }),
          }),
        }),
      }),
    };

    const rExceeded = await checkQuotaUsage(mockQuotaExceededClient, mockSourceId, 500);
    const rWarning = await checkQuotaUsage(mockQuotaWarningClient, mockSourceId, 500);

    if (
      rExceeded.allowed === false &&
      rExceeded.remaining === 0 &&
      rWarning.allowed === true &&
      rWarning.warning?.includes('%80')
    ) {
      console.log('✓ Test 5 Passed: Aylık ücretsiz kota sınırı (%80 uyarısı ve %100 aşım engellemesi) doğrulandı.');
      passed++;
    } else {
      console.error('✗ Test 5 Failed: Kota denetimi başarısız:', rExceeded, rWarning);
    }
  } catch (err: any) {
    console.error('✗ Test 5 Error:', err.message);
  }

  // Test 6: Değişmeyen veride yinelenen kayıt engelleme
  try {
    const existingPrices = [
      {
        product_id: 'prod-1',
        buy_price_minor: 300000,
        sell_price_minor: 302000,
        source_price_at: '2026-10-22T10:00:00Z',
      },
    ];

    const mockDuplicateClient: any = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => ({
                limit: async () => ({ data: existingPrices, error: null }),
              }),
            }),
          }),
        }),
      }),
    };

    const identicalRecords: ValidatedPriceRecord[] = [
      {
        product_id: 'prod-1',
        source_id: mockSourceId,
        buy_price_minor: 300000,
        sell_price_minor: 302000,
        currency_code: 'TRY',
        price_unit: 'gram',
        source_price_at: '2026-10-22T10:00:00Z',
        fetched_at: '2026-10-22T10:05:00Z',
        is_provider_stale: false,
        is_valid: true,
      },
    ];

    const changedRecords: ValidatedPriceRecord[] = [
      {
        product_id: 'prod-1',
        source_id: mockSourceId,
        buy_price_minor: 301000, // Değişmiş fiyat
        sell_price_minor: 303000,
        currency_code: 'TRY',
        price_unit: 'gram',
        source_price_at: '2026-10-22T10:05:00Z',
        fetched_at: '2026-10-22T10:05:00Z',
        is_provider_stale: false,
        is_valid: true,
      },
    ];

    const rDup = await isDuplicatePriceData(mockDuplicateClient, mockSourceId, identicalRecords);
    const rChanged = await isDuplicatePriceData(mockDuplicateClient, mockSourceId, changedRecords);

    if (rDup.isDuplicate === true && rChanged.isDuplicate === false) {
      console.log('✓ Test 6 Passed: Değişmeyen veride gereksiz yinelenen kayıt engellendi, değişen veri kaydedildi.');
      passed++;
    } else {
      console.error('✗ Test 6 Failed: Yinelenen veri denetimi başarısız:', rDup, rChanged);
    }
  } catch (err: any) {
    console.error('✗ Test 6 Error:', err.message);
  }

  // Test 7: Zamanlayıcı hatalarının güvenli teknik kayda alınması (No Plain Secret in Log)
  try {
    const secretApiKey = 'sk_super_secret_gold_api_key_889900';
    const rawErrorMessage = `Network request to https://api.altin.in failed with Authorization: Bearer ${secretApiKey}`;
    const sanitizedError = sanitizeLog(rawErrorMessage, secretApiKey);

    const isExposed = sanitizedError.includes(secretApiKey);
    const containsMask = sanitizedError.includes('sk_...900');

    if (!isExposed && containsMask) {
      console.log('✓ Test 7 Passed: Zamanlayıcı hata kayıtlarında API anahtarı maskelendi; gizli veri sızması engellendi.');
      passed++;
    } else {
      console.error('✗ Test 7 Failed: Hata kaydı arındırılamadı:', sanitizedError);
    }
  } catch (err: any) {
    console.error('✗ Test 7 Error:', err.message);
  }

  console.log('\n========================================');
  if (passed === total) {
    console.log(`FAZ 6.3 TÜM ZAMANLAYICI VE GÜVENLİK TESTLERİ BAŞARIYLA TAMAMLANDI (${passed}/${total})`);
  } else {
    console.error(`FAZ 6.3 TESTLERİNDE HATA BULUNDU (${passed}/${total})`);
  }
  console.log('========================================\n');
}

runTests().catch(console.error);
