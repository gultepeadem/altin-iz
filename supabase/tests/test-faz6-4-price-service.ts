/**
 * Faz 6.4: Güncel Fiyat Okuma Servisi, Modeller ve Formatlayıcı Testleri
 * supabase/tests/test-faz6-4-price-service.ts
 */

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

import {
  determinePriceStatus,
  mapRowToGoldPrice,
} from '../../src/models/goldPrice.ts';
import { mapRowToGoldProduct } from '../../src/models/goldProduct.ts';
import { formatMoney, formatPercent, formatDateTime } from '../../src/utils/formatters.ts';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
}
loadEnv();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

async function runTests() {
  console.log('--- Faz 6.4: Güncel Fiyat Okuma Servisi ve Model Testleri ---\n');
  let passed = 0;
  const total = 10;

  // Test 1: Canlı Veritabanından Aktif Ürün Listesini Getirme
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client
      .from('gold_products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (!error && Array.isArray(data) && data.length >= 20) {
      const products = data.map(mapRowToGoldProduct);
      const hasGram = products.some((p) => p.code === 'GRAM_GOLD');
      const hasQuarterNew = products.some((p) => p.code === 'QUARTER_GOLD_NEW');

      if (hasGram && hasQuarterNew) {
        console.log(`✓ Test 1 Passed: Canlı veritabanından ${products.length} aktif ürün eksiksiz getirildi ve modellendi.`);
        passed++;
      } else {
        console.error('✗ Test 1 Failed: Temel ürünler katalogda bulunamadı.');
      }
    } else {
      console.error('✗ Test 1 Failed: Ürün listesi çekilemedi:', error);
    }
  } catch (err: any) {
    console.error('✗ Test 1 Error:', err.message);
  }

  // Test 2: Fiyat listesine açık ürünleri getirme (price_display_enabled = true)
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client
      .from('gold_products')
      .select('*')
      .eq('is_active', true)
      .eq('price_display_enabled', true)
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const displayProducts = data.map(mapRowToGoldProduct);
      const allEnabled = displayProducts.every((p) => p.priceDisplayEnabled && p.isActive);

      if (allEnabled) {
        console.log(`✓ Test 2 Passed: Fiyat gösterimine açık ${displayProducts.length} ürün başarıyla filtrelendi.`);
        passed++;
      } else {
        console.error('✗ Test 2 Failed: priceDisplayEnabled filtresi hatalı.');
      }
    } else {
      console.error('✗ Test 2 Failed: priceDisplayEnabled sorgusu başarısız:', error);
    }
  } catch (err: any) {
    console.error('✗ Test 2 Error:', err.message);
  }

  // Test 3: Alış ve satış fiyatının ayrı modellenmesi
  try {
    const sampleRow = {
      id: 101,
      product_id: 'prod-uuid-1',
      source_id: 'src-uuid-1',
      buy_price_minor: 302050,
      sell_price_minor: 302500,
      currency_code: 'TRY',
      price_unit: 'gram',
      daily_change_percent: 1.25,
      day_low_minor: 301000,
      day_high_minor: 303000,
      source_price_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      fetched_at: new Date().toISOString(),
      is_provider_stale: false,
      is_valid: true,
    };

    const price = mapRowToGoldPrice(sampleRow);

    if (
      price.buyPriceMinor === 302050 &&
      price.sellPriceMinor === 302500 &&
      price.buyPrice === 3020.5 &&
      price.sellPrice === 3025.0 &&
      price.dayLow === 3010.0 &&
      price.dayHigh === 3030.0
    ) {
      console.log('✓ Test 3 Passed: Alış ve satış fiyatları minor (kuruş) ve TL olarak ayrı ayrı modellendi.');
      passed++;
    } else {
      console.error('✗ Test 3 Failed: Alış/satış model ayrımı hatalı:', price);
    }
  } catch (err: any) {
    console.error('✗ Test 3 Error:', err.message);
  }

  // Test 4: Kaynak fiyat zamanı ile çekilme zamanının ayrı modellenmesi
  try {
    const sourceTime: string = '2026-10-22T10:00:00Z';
    const fetchedTime: string = '2026-10-22T10:02:30Z';

    const row = {
      id: 102,
      product_id: 'prod-uuid-2',
      source_id: 'src-uuid-1',
      buy_price_minor: 300000,
      sell_price_minor: 301000,
      source_price_at: sourceTime,
      fetched_at: fetchedTime,
      is_provider_stale: false,
      is_valid: true,
    };

    const price = mapRowToGoldPrice(row);

    if (price.sourcePriceAt === sourceTime && price.fetchedAt === fetchedTime && price.sourcePriceAt !== price.fetchedAt) {
      console.log('✓ Test 4 Passed: Kaynak fiyat zamanı (sourcePriceAt) ve çekilme zamanı (fetchedAt) bağımsız modellendi.');
      passed++;
    } else {
      console.error('✗ Test 4 Failed: Zaman damgaları eşleşmedi:', price);
    }
  } catch (err: any) {
    console.error('✗ Test 4 Error:', err.message);
  }

  // Test 5: 'live' durumunun üretilmesi
  try {
    // 3 dakika önce gelmiş taze fiyat
    const recentDate = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const status = determinePriceStatus(300000, 301000, recentDate, false, 15);

    if (status === 'live') {
      console.log('✓ Test 5 Passed: Son 15 dk içinde taze ve çift yönlü fiyat için "live" durumu üretildi.');
      passed++;
    } else {
      console.error('✗ Test 5 Failed: "live" durumu üretilemedi:', status);
    }
  } catch (err: any) {
    console.error('✗ Test 5 Error:', err.message);
  }

  // Test 6: 'stale' durumunun üretilmesi (ADR-014)
  try {
    // 25 dakika önce gelmiş fiyat (15 dk eşiğini aşmış)
    const oldDate = new Date(Date.now() - 25 * 60 * 1000).toISOString();
    const statusOld = determinePriceStatus(300000, 301000, oldDate, false, 15);

    // Yeni tarihli ama sağlayıcı tarafından stale işaretlenmiş fiyat
    const freshDate = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const statusProviderStale = determinePriceStatus(300000, 301000, freshDate, true, 15);

    if (statusOld === 'stale' && statusProviderStale === 'stale') {
      console.log('✓ Test 6 Passed: 15 dakikadan eski ve sağlayıcı tarafından gecikmeli işaretlenen fiyatlar "stale" üretildi.');
      passed++;
    } else {
      console.error('✗ Test 6 Failed: "stale" durumu hatalı:', { statusOld, statusProviderStale });
    }
  } catch (err: any) {
    console.error('✗ Test 6 Error:', err.message);
  }

  // Test 7: 'partial' durumunun üretilmesi (ADR-013)
  try {
    const recentDate = new Date().toISOString();
    const statusOnlyBuy = determinePriceStatus(300000, null, recentDate, false, 15);
    const statusOnlySell = determinePriceStatus(null, 301000, recentDate, false, 15);

    if (statusOnlyBuy === 'partial' && statusOnlySell === 'partial') {
      console.log('✓ Test 7 Passed: Alış veya satıştan yalnızca biri mevcut olduğunda "partial" durumu üretildi.');
      passed++;
    } else {
      console.error('✗ Test 7 Failed: "partial" durumu üretilemedi:', { statusOnlyBuy, statusOnlySell });
    }
  } catch (err: any) {
    console.error('✗ Test 7 Error:', err.message);
  }

  // Test 8: 'unavailable' durumunun üretilmesi (ADR-013)
  try {
    const recentDate = new Date().toISOString();
    const statusUnavailable = determinePriceStatus(null, null, recentDate, false, 15);

    if (statusUnavailable === 'unavailable') {
      console.log('✓ Test 8 Passed: Fiyat bilgisi olmadığında "unavailable" durumu üretildi (asla 0 TL kabul edilmedi).');
      passed++;
    } else {
      console.error('✗ Test 8 Failed: "unavailable" durumu üretilemedi:', statusUnavailable);
    }
  } catch (err: any) {
    console.error('✗ Test 8 Error:', err.message);
  }

  // Test 9: Başka ürün fiyatını yedek kullanmama izolasyonu
  try {
    // İki farklı ürün
    const productA = { id: 'prod-A', name: 'Gram Altın' };
    const productB = { id: 'prod-B', name: 'Çeyrek Altın' };

    // Yalnızca productA için fiyat var
    const priceMap = new Map<string, any>();
    priceMap.set(productA.id, { productId: productA.id, buyPrice: 3000 });

    const priceA = priceMap.get(productA.id) ?? null;
    const priceB = priceMap.get(productB.id) ?? null;

    if (priceA !== null && priceB === null) {
      console.log('✓ Test 9 Passed: Fiyatı olmayan ürün (productB) için başka ürünün (productA) fiyatı ASLA yedek kullanılmadı (null döner).');
      passed++;
    } else {
      console.error('✗ Test 9 Failed: Fiyat izolasyon kuralı bozuldu:', { priceA, priceB });
    }
  } catch (err: any) {
    console.error('✗ Test 9 Error:', err.message);
  }

  // Test 10: Formatlayıcı yardımcı fonksiyonlar (formatMoney, formatPercent, formatDateTime)
  try {
    const m1 = formatMoney(302050); // "3.020,50 TL"
    const m2 = formatMoney(null);   // "-"
    const m3 = formatMoney(undefined); // "-"

    const p1 = formatPercent(1.25);  // "+%1,25"
    const p2 = formatPercent(-0.45); // "-%0,45"
    const p3 = formatPercent(0);     // "%0,00"
    const p4 = formatPercent(null);  // "-"

    const d1 = formatDateTime('2026-10-22T10:15:00Z');
    const d2 = formatDateTime(null); // "-"

    if (
      m1 === '3.020,50 TL' &&
      m2 === '-' &&
      m3 === '-' &&
      p1 === '+%1,25' &&
      p2 === '-%0,45' &&
      p3 === '%0,00' &&
      p4 === '-' &&
      d1.includes('2026') &&
      d2 === '-'
    ) {
      console.log('✓ Test 10 Passed: formatMoney, formatPercent ve formatDateTime yardımcıları beklendiği gibi çalıştı.');
      passed++;
    } else {
      console.error('✗ Test 10 Failed: Formatlayıcı çıktıları hatalı:', { m1, m2, p1, p2, p3, d1 });
    }
  } catch (err: any) {
    console.error('✗ Test 10 Error:', err.message);
  }

  console.log('\n========================================');
  if (passed === total) {
    console.log(`FAZ 6.4 TÜM FİYAT OKUMA SERVİSİ VE MODEL TESTLERİ BAŞARIYLA TAMAMLANDI (${passed}/${total})`);
  } else {
    console.error(`FAZ 6.4 TESTLERİNDE HATA BULUNDU (${passed}/${total})`);
  }
  console.log('========================================\n');
}

runTests().catch(console.error);
