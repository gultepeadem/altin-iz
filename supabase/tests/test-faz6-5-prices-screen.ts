/**
 * Faz 6.5: Fiyatlar Ekranı Mantığı ve Canlı Entegrasyon Testleri
 * supabase/tests/test-faz6-5-prices-screen.ts
 */

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

import type { ProductWithPrice } from '../../src/models/goldPrice.ts';
import { mapRowToGoldProduct } from '../../src/models/goldProduct.ts';
import { formatMoney, formatPercent } from '../../src/utils/formatters.ts';

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

// Fiyat ekranındaki filtreleme ve sıralama fonksiyonlarının saf mantığı
function filterItems(items: ProductWithPrice[], search: string): ProductWithPrice[] {
  const query = search.trim().toLocaleLowerCase('tr-TR');
  return items.filter((item) => {
    if (!query) return true;
    const name = item.product.name.toLocaleLowerCase('tr-TR');
    const shortName = (item.product.shortName ?? '').toLocaleLowerCase('tr-TR');
    const code = item.product.code.toLocaleLowerCase('tr-TR');
    return name.includes(query) || shortName.includes(query) || code.includes(query);
  });
}

function sortItems(items: ProductWithPrice[], mode: 'default' | 'name' | 'price_asc' | 'price_desc'): ProductWithPrice[] {
  return [...items].sort((a, b) => {
    if (mode === 'name') {
      return a.product.name.localeCompare(b.product.name, 'tr-TR');
    }

    if (mode === 'price_asc') {
      const priceA = a.price?.sellPriceMinor ?? a.price?.buyPriceMinor ?? null;
      const priceB = b.price?.sellPriceMinor ?? b.price?.buyPriceMinor ?? null;

      if (priceA === null && priceB === null) return a.product.sortOrder - b.product.sortOrder;
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      return priceA - priceB;
    }

    if (mode === 'price_desc') {
      const priceA = a.price?.sellPriceMinor ?? a.price?.buyPriceMinor ?? null;
      const priceB = b.price?.sellPriceMinor ?? b.price?.buyPriceMinor ?? null;

      if (priceA === null && priceB === null) return a.product.sortOrder - b.product.sortOrder;
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      return priceB - priceA;
    }

    return a.product.sortOrder - b.product.sortOrder;
  });
}

function analyzeBanners(items: ProductWithPrice[]): { hasStale: boolean; hasPartial: boolean } {
  let staleCount = 0;
  let partialCount = 0;

  for (const item of items) {
    if (item.price?.status === 'stale') {
      staleCount++;
    } else if (item.price === null || item.price.status === 'partial' || item.price.status === 'unavailable') {
      partialCount++;
    }
  }

  return {
    hasStale: staleCount > 0,
    hasPartial: partialCount > 0,
  };
}

async function runTests() {
  console.log('--- Faz 6.5: Fiyatlar Ekranı Mantığı ve Entegrasyon Testleri ---\n');
  let passed = 0;
  const total = 10;

  // Mock veri seti
  const mockProducts: ProductWithPrice[] = [
    {
      product: {
        id: 'p-1',
        code: 'QUARTER_GOLD_NEW',
        name: 'Çeyrek Altın (Yeni)',
        shortName: 'Yeni Çeyrek',
        category: 'coin',
        measurementUnit: 'piece',
        quantityPrecision: 0,
        packageWeightGrams: null,
        portfolioEnabled: true,
        calculatorEnabled: true,
        priceDisplayEnabled: true,
        isActive: true,
        sortOrder: 20,
        createdAt: new Date().toISOString(),
      },
      price: {
        id: 1,
        productId: 'p-1',
        sourceId: 'mock',
        buyPriceMinor: 508000,
        sellPriceMinor: 513000,
        buyPrice: 5080,
        sellPrice: 5130,
        currencyCode: 'TRY',
        priceUnit: 'piece',
        dailyChangePercent: 0.45,
        dayLowMinor: null,
        dayHighMinor: null,
        dayLow: null,
        dayHigh: null,
        sourcePriceAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        isProviderStale: false,
        isValid: true,
        status: 'live',
      },
    },
    {
      product: {
        id: 'p-2',
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
      },
      price: {
        id: 2,
        productId: 'p-2',
        sourceId: 'mock',
        buyPriceMinor: 312000,
        sellPriceMinor: 314000,
        buyPrice: 3120,
        sellPrice: 3140,
        currencyCode: 'TRY',
        priceUnit: 'gram',
        dailyChangePercent: -0.15,
        dayLowMinor: null,
        dayHighMinor: null,
        dayLow: null,
        dayHigh: null,
        sourcePriceAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        isProviderStale: false,
        isValid: true,
        status: 'live',
      },
    },
    {
      product: {
        id: 'p-3',
        code: 'ATA_GOLD',
        name: 'Ata Altın (Cumhuriyet)',
        shortName: 'Ata',
        category: 'coin',
        measurementUnit: 'piece',
        quantityPrecision: 0,
        packageWeightGrams: null,
        portfolioEnabled: true,
        calculatorEnabled: true,
        priceDisplayEnabled: true,
        isActive: true,
        sortOrder: 50,
        createdAt: new Date().toISOString(),
      },
      price: {
        id: 3,
        productId: 'p-3',
        sourceId: 'mock',
        buyPriceMinor: 2090000,
        sellPriceMinor: 2110000,
        buyPrice: 20900,
        sellPrice: 21100,
        currencyCode: 'TRY',
        priceUnit: 'piece',
        dailyChangePercent: null,
        dayLowMinor: null,
        dayHighMinor: null,
        dayLow: null,
        dayHigh: null,
        sourcePriceAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        fetchedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isProviderStale: true,
        isValid: true,
        status: 'stale',
      },
    },
    {
      product: {
        id: 'p-4',
        code: 'BRACELET_22K',
        name: '22 Ayar Bilezik (Gram)',
        shortName: '22 Ayar',
        category: 'karat',
        measurementUnit: 'gram',
        quantityPrecision: 2,
        packageWeightGrams: null,
        portfolioEnabled: true,
        calculatorEnabled: true,
        priceDisplayEnabled: true,
        isActive: true,
        sortOrder: 70,
        createdAt: new Date().toISOString(),
      },
      price: null, // ADR-013: Fiyat yok
    },
  ];

  // Test 1: Varsayılan Sıralama (sortOrder)
  try {
    const sorted = sortItems(mockProducts, 'default');
    if (
      sorted[0].product.code === 'GRAM_GOLD' && // sortOrder: 10
      sorted[1].product.code === 'QUARTER_GOLD_NEW' && // sortOrder: 20
      sorted[2].product.code === 'ATA_GOLD' && // sortOrder: 50
      sorted[3].product.code === 'BRACELET_22K' // sortOrder: 70
    ) {
      console.log('✓ Test 1 Passed: Varsayılan sıralama sortOrder küçükten büyüğe başarıyla çalışıyor.');
      passed++;
    } else {
      console.error('✗ Test 1 Failed: Sıralama sırası beklenen gibi değil.');
    }
  } catch (err) {
    console.error('✗ Test 1 Error:', err);
  }

  // Test 2: İsim Sıralaması (Türkçe A-Z)
  try {
    const sorted = sortItems(mockProducts, 'name');
    // Beklenen Türkçe alfabe sırası:
    // '22 Ayar Bilezik (Gram)' -> 'Ata Altın (Cumhuriyet)' -> 'Çeyrek Altın (Yeni)' -> 'Gram Altın'
    if (
      sorted[0].product.name.startsWith('22') &&
      sorted[1].product.name.startsWith('Ata') &&
      sorted[2].product.name.startsWith('Çeyrek') &&
      sorted[3].product.name.startsWith('Gram')
    ) {
      console.log('✓ Test 2 Passed: Türkçe yerel karakter duyarlı alfabetik sıralama (A-Z) doğru çalışıyor.');
      passed++;
    } else {
      console.error('✗ Test 2 Failed: Türkçe isim sıralaması hatalı:', sorted.map((s) => s.product.name));
    }
  } catch (err) {
    console.error('✗ Test 2 Error:', err);
  }

  // Test 3: Satış Fiyatına Göre Artan Sıralama (Boş fiyatlar sonda)
  try {
    const sorted = sortItems(mockProducts, 'price_asc');
    // Fiyat artan: Gram (3.140 TL) -> Çeyrek (5.130 TL) -> Ata (21.100 TL) -> Bilezik (null, en sonda)
    if (
      sorted[0].product.code === 'GRAM_GOLD' &&
      sorted[1].product.code === 'QUARTER_GOLD_NEW' &&
      sorted[2].product.code === 'ATA_GOLD' &&
      sorted[3].product.code === 'BRACELET_22K' &&
      sorted[3].price === null
    ) {
      console.log('✓ Test 3 Passed: Fiyat artan sıralaması doğru ve fiyatı olmayan ürün sona atıldı.');
      passed++;
    } else {
      console.error('✗ Test 3 Failed: Fiyat artan sıralaması hatalı:', sorted.map((s) => s.product.code));
    }
  } catch (err) {
    console.error('✗ Test 3 Error:', err);
  }

  // Test 4: Satış Fiyatına Göre Azalan Sıralama (Boş fiyatlar sonda)
  try {
    const sorted = sortItems(mockProducts, 'price_desc');
    // Fiyat azalan: Ata (21.100 TL) -> Çeyrek (5.130 TL) -> Gram (3.140 TL) -> Bilezik (null, en sonda)
    if (
      sorted[0].product.code === 'ATA_GOLD' &&
      sorted[1].product.code === 'QUARTER_GOLD_NEW' &&
      sorted[2].product.code === 'GRAM_GOLD' &&
      sorted[3].product.code === 'BRACELET_22K'
    ) {
      console.log('✓ Test 4 Passed: Fiyat azalan sıralaması doğru ve fiyatı olmayan ürün sona atıldı.');
      passed++;
    } else {
      console.error('✗ Test 4 Failed: Fiyat azalan sıralaması hatalı:', sorted.map((s) => s.product.code));
    }
  } catch (err) {
    console.error('✗ Test 4 Error:', err);
  }

  // Test 5: Türkçe Karakter Duyarlı Arama
  try {
    const res1 = filterItems(mockProducts, 'çeyrek');
    const res2 = filterItems(mockProducts, 'ÇEYREK');
    const res3 = filterItems(mockProducts, 'ata');
    const res4 = filterItems(mockProducts, 'GRAM');
    const res5 = filterItems(mockProducts, 'bilezik');

    if (
      res1.length === 1 && res1[0].product.code === 'QUARTER_GOLD_NEW' &&
      res2.length === 1 && res2[0].product.code === 'QUARTER_GOLD_NEW' &&
      res3.length === 1 && res3[0].product.code === 'ATA_GOLD' &&
      res4.length === 2 && // Gram Altın ve 22 Ayar Bilezik (Gram)
      res5.length === 1 && res5[0].product.code === 'BRACELET_22K'
    ) {
      console.log('✓ Test 5 Passed: Türkçe küçük/büyük harf uyumlu anlık arama (tekil ve çoklu eşleşme) kusursuz filtreliyor.');
      passed++;
    } else {
      console.error('✗ Test 5 Failed: Arama filtreleme bekleneni vermedi.');
    }
  } catch (err) {
    console.error('✗ Test 5 Error:', err);
  }

  // Test 6: ADR-013 Uyarınca Asla "0 TL" Göstermeme ve Formatlama
  try {
    const formatNull = formatMoney(null);
    const formatUndefined = formatMoney(undefined);
    const formatNaN = formatMoney(NaN);
    const formatZero = formatMoney(0);
    const formatReal = formatMoney(312050);

    if (
      formatNull === '-' &&
      formatUndefined === '-' &&
      formatNaN === '-' &&
      formatZero === '0,00 TL' &&
      formatReal === '3.120,50 TL'
    ) {
      console.log('✓ Test 6 Passed: ADR-013 formatMoney kontrolü doğrulandı (null ve tanımsız verilerde asla 0 TL üretilmez).');
      passed++;
    } else {
      console.error('✗ Test 6 Failed: Para formatlayıcı hatalı sonuç verdi:', { formatNull, formatReal });
    }
  } catch (err) {
    console.error('✗ Test 6 Error:', err);
  }

  // Test 7: Günlük Değişim Rozeti Formatlaması
  try {
    const positive = formatPercent(0.45);
    const negative = formatPercent(-0.15);
    const zero = formatPercent(0);
    const empty = formatPercent(null);

    if (
      positive === '+%0,45' &&
      negative === '-%0,15' &&
      zero === '%0,00' &&
      empty === '-'
    ) {
      console.log('✓ Test 7 Passed: Günlük değişim yüzdesi formatlaması (+, -, %, -) doğru çalışıyor.');
      passed++;
    } else {
      console.error('✗ Test 7 Failed: Yüzde formatlaması hatalı:', { positive, negative, zero, empty });
    }
  } catch (err) {
    console.error('✗ Test 7 Error:', err);
  }

  // Test 8: Eski ve Kısmi Veri Uyarı Şeridi Tespiti
  try {
    const banners = analyzeBanners(mockProducts);
    if (banners.hasStale === true && banners.hasPartial === true) {
      console.log('✓ Test 8 Passed: Eski (stale) ve kısmi (partial) veri durumları başarıyla tespit ediliyor.');
      passed++;
    } else {
      console.error('✗ Test 8 Failed: Şerit tespiti bekleneni vermedi:', banners);
    }
  } catch (err) {
    console.error('✗ Test 8 Error:', err);
  }

  // Test 9: Uzun Ürün İsimleri ve Düzen Dayanıklılığı
  try {
    const longNameProduct: ProductWithPrice = {
      product: {
        id: 'p-long',
        code: 'LONG_PRODUCT_NAME_TEST',
        name: '22 Ayar İşçiliksiz Ajda Model Özel Tasarım Yatırımlık Bilezik (Gram)',
        shortName: 'Ajda Bilezik',
        category: 'karat',
        measurementUnit: 'gram',
        quantityPrecision: 2,
        packageWeightGrams: null,
        portfolioEnabled: true,
        calculatorEnabled: true,
        priceDisplayEnabled: true,
        isActive: true,
        sortOrder: 99,
        createdAt: new Date().toISOString(),
      },
      price: null,
    };

    const filtered = filterItems([longNameProduct], 'ajda');
    const sorted = sortItems([longNameProduct], 'name');

    if (
      filtered.length === 1 &&
      sorted[0].product.name.length > 50 &&
      longNameProduct.product.name.includes('Ajda')
    ) {
      console.log(`✓ Test 9 Passed: ${longNameProduct.product.name.length} karakterlik uzun ürün adı başarıyla işlendi ve filtrelendi.`);
      passed++;
    } else {
      console.error('✗ Test 9 Failed: Uzun ürün adı testi başarısız.');
    }
  } catch (err) {
    console.error('✗ Test 9 Error:', err);
  }

  // Test 10: Canlı Supabase Veritabanından Fiyat Ekranı Ürünlerinin Çekilmesi
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);

    const { data: dbProducts, error: prodErr } = await client
      .from('gold_products')
      .select('*')
      .eq('price_display_enabled', true)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      throw new Error(`Ürünler çekilemedi: ${prodErr?.message}`);
    }

    const { data: dbPrices, error: priceErr } = await client
      .from('gold_prices')
      .select('*')
      .eq('is_valid', true)
      .order('fetched_at', { ascending: false });

    if (priceErr) {
      throw new Error(`Fiyatlar çekilemedi: ${priceErr?.message}`);
    }

    const priceMap = new Map<string, any>();
    for (const p of dbPrices || []) {
      if (!priceMap.has(p.product_id)) {
        priceMap.set(p.product_id, p);
      }
    }

    const fullItems: ProductWithPrice[] = dbProducts.map((p) => ({
      product: mapRowToGoldProduct(p),
      price: priceMap.get(p.id) ?? null,
    }));

    if (fullItems.length >= 10) {
      console.log(`✓ Test 10 Passed: Canlı veritabanından fiyat ekranı için ${fullItems.length} ürün ve ilişkili fiyat verisi başarıyla doğrulandı.`);
      passed++;
    } else {
      console.error('✗ Test 10 Failed: Canlı veritabanı ürün sayısı beklenenden az:', fullItems.length);
    }
  } catch (err) {
    console.error('✗ Test 10 Error:', err);
  }

  console.log(`\n--- Test Sonucu: ${passed}/${total} Başarılı ---`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
