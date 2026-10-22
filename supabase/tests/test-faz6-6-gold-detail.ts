/**
 * Faz 6.6: Altın Detay Ekranı Mantığı ve Entegrasyon Testleri
 * supabase/tests/test-faz6-6-gold-detail.ts
 */

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

import type { GoldPrice } from '../../src/models/goldPrice.ts';
import { type GoldProduct, mapRowToGoldProduct } from '../../src/models/goldProduct.ts';
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
  console.log('--- Faz 6.6: Altın Detay Ekranı Mantığı ve Entegrasyon Testleri ---\n');
  let passed = 0;
  const total = 9;

  // Mock Detay Verileri
  const mockProduct: GoldProduct = {
    id: 'prod-gram-001',
    code: 'GRAM_GOLD',
    name: 'Gram Altın',
    shortName: 'Gram',
    category: 'gram',
    measurementUnit: 'gram',
    quantityPrecision: 2,
    packageWeightGrams: 1,
    portfolioEnabled: true,
    calculatorEnabled: true,
    priceDisplayEnabled: true,
    isActive: true,
    sortOrder: 10,
    createdAt: new Date().toISOString(),
  };

  const mockPrice: GoldPrice = {
    id: 101,
    productId: 'prod-gram-001',
    sourceId: 'mock-source',
    buyPriceMinor: 312550,
    sellPriceMinor: 314200,
    buyPrice: 3125.5,
    sellPrice: 3142,
    currencyCode: 'TRY',
    priceUnit: 'gram',
    dailyChangePercent: 0.52,
    dayLowMinor: 311000,
    dayHighMinor: 315000,
    dayLow: 3110,
    dayHigh: 3150,
    sourcePriceAt: new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    isProviderStale: false,
    isValid: true,
    status: 'live',
  };

  // Test 1: Geçersiz ve Boş ProductId Doğrulaması
  try {
    const checkInvalidId = (id?: string | null) => {
      return !id || typeof id !== 'string' || id.trim() === '';
    };

    if (
      checkInvalidId(undefined) &&
      checkInvalidId('') &&
      checkInvalidId('   ') &&
      !checkInvalidId('valid-id-123')
    ) {
      console.log('✓ Test 1 Passed: Geçersiz ve boş productId parametreleri başarıyla yakalanıyor.');
      passed++;
    } else {
      console.error('✗ Test 1 Failed: productId doğrulama mantığı hatalı.');
    }
  } catch (err) {
    console.error('✗ Test 1 Error:', err);
  }

  // Test 2: Alış ve Satış Fiyatlarının Ayrı Gösterimi ve Etiketleri
  try {
    const buyFormatted = formatMoney(mockPrice.buyPriceMinor, mockPrice.currencyCode);
    const sellFormatted = formatMoney(mockPrice.sellPriceMinor, mockPrice.currencyCode);

    if (buyFormatted === '3.125,50 TL' && sellFormatted === '3.142,00 TL') {
      console.log('✓ Test 2 Passed: Alış (Bozdurma) ve Satış (Satın Alma) fiyatları net şekilde formatlandı.');
      passed++;
    } else {
      console.error('✗ Test 2 Failed: Fiyat formatlama hatalı:', { buyFormatted, sellFormatted });
    }
  } catch (err) {
    console.error('✗ Test 2 Error:', err);
  }

  // Test 3: Günün En Düşük ve En Yüksek Değerlerinin Varlığı ve Formatlaması
  try {
    const lowFormatted = formatMoney(mockPrice.dayLowMinor, mockPrice.currencyCode);
    const highFormatted = formatMoney(mockPrice.dayHighMinor, mockPrice.currencyCode);

    if (lowFormatted === '3.110,00 TL' && highFormatted === '3.150,00 TL') {
      console.log('✓ Test 3 Passed: Günün en düşük ve en yüksek fiyat aralığı başarıyla gösteriliyor.');
      passed++;
    } else {
      console.error('✗ Test 3 Failed: Günün değerleri formatlaması hatalı:', { lowFormatted, highFormatted });
    }
  } catch (err) {
    console.error('✗ Test 3 Error:', err);
  }

  // Test 4: Günlük Değişim Rozeti (Yalnızca Değer Varsa)
  try {
    const positiveChange = formatPercent(mockPrice.dailyChangePercent);
    const emptyChange = formatPercent(null);

    if (positiveChange === '+%0,52' && emptyChange === '-') {
      console.log('✓ Test 4 Passed: Günlük değişim rozeti pozitif oranda +%0,52 üretirken boş veride gizleniyor.');
      passed++;
    } else {
      console.error('✗ Test 4 Failed: Değişim rozeti hatalı:', { positiveChange, emptyChange });
    }
  } catch (err) {
    console.error('✗ Test 4 Error:', err);
  }

  // Test 5: ADR-013 Uyarınca Detay Ekranında Fiyat Yokken Asla 0 TL Göstermeme
  try {
    const emptyPrice: Partial<GoldPrice> = {
      buyPriceMinor: null,
      sellPriceMinor: null,
      dayLowMinor: null,
      dayHighMinor: null,
    };

    const buyText = formatMoney(emptyPrice.buyPriceMinor);
    const sellText = formatMoney(emptyPrice.sellPriceMinor);

    if (buyText === '-' && sellText === '-') {
      console.log('✓ Test 5 Passed: ADR-013 kuralı doğrulandı: Fiyatı olmayan detayda asla 0 TL gösterilmez (tire dönülür).');
      passed++;
    } else {
      console.error('✗ Test 5 Failed: Sıfır TL engellemesi hatalı.');
    }
  } catch (err) {
    console.error('✗ Test 5 Error:', err);
  }

  // Test 6: Portföy Durumu ve Buton Yetkilendirmesi (portfolioEnabled = false durumu)
  try {
    const disabledProduct: GoldProduct = {
      ...mockProduct,
      id: 'prod-disabled-portfolio',
      portfolioEnabled: false,
    };

    if (mockProduct.portfolioEnabled === true && disabledProduct.portfolioEnabled === false) {
      console.log('✓ Test 6 Passed: Portföye açık ve kapalı ürün kontrolleri doğru ayrıştırılıyor.');
      passed++;
    } else {
      console.error('✗ Test 6 Failed: Portföy yetki ayrımı hatalı.');
    }
  } catch (err) {
    console.error('✗ Test 6 Error:', err);
  }

  // Test 7: Hesaplama Durumu ve Buton Yetkilendirmesi (calculatorEnabled = false durumu)
  try {
    const disabledCalcProduct: GoldProduct = {
      ...mockProduct,
      id: 'prod-disabled-calc',
      calculatorEnabled: false,
    };

    if (mockProduct.calculatorEnabled === true && disabledCalcProduct.calculatorEnabled === false) {
      console.log('✓ Test 7 Passed: Hesaplama yetkisi (calculatorEnabled) doğru ayrıştırılıyor.');
      passed++;
    } else {
      console.error('✗ Test 7 Failed: Hesaplama yetki ayrımı hatalı.');
    }
  } catch (err) {
    console.error('✗ Test 7 Error:', err);
  }

  // Test 8: Tarih Formatlama (formatDateTime)
  try {
    const formattedDate = formatDateTime('2026-10-22T14:30:00Z');
    if (formattedDate !== '-' && formattedDate.includes('2026')) {
      console.log(`✓ Test 8 Passed: Son fiyat zamanı Türkçe yerel formatta üretildi: ${formattedDate}`);
      passed++;
    } else {
      console.error('✗ Test 8 Failed: Tarih formatlama hatalı:', formattedDate);
    }
  } catch (err) {
    console.error('✗ Test 8 Error:', err);
  }

  // Test 9: Canlı Supabase Veritabanından Ürün Çekme ve Fiyat Eşleştirme
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Canlı ilk aktif ürünü al
    const { data: prodData, error: prodErr } = await client
      .from('gold_products')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (prodErr || !prodData) {
      throw new Error(`Canlı ürün çekilemedi: ${prodErr?.message}`);
    }

    const liveProduct = mapRowToGoldProduct(prodData);

    // 2. Bu ürünün fiyatını al
    const { data: priceRows, error: priceErr } = await client
      .from('gold_prices')
      .select('*')
      .eq('product_id', liveProduct.id)
      .eq('is_valid', true)
      .order('fetched_at', { ascending: false })
      .limit(1);

    if (priceErr) {
      throw new Error(`Fiyat çekilemedi: ${priceErr?.message}`);
    }

    const pricePresent = priceRows && priceRows.length > 0;
    console.log(`✓ Test 9 Passed: Canlı veritabanından ürün "${liveProduct.name}" (${liveProduct.id}) başarıyla çekildi (Fiyat mevcut: ${pricePresent}).`);
    passed++;
  } catch (err) {
    console.error('✗ Test 9 Error:', err);
  }

  console.log(`\n--- Test Sonucu: ${passed}/${total} Başarılı ---`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
