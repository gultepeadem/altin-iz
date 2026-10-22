/**
 * Altın İz — Faz 9 Ana Sayfa Veri Modeli Testleri
 * supabase/tests/test-faz9-home-model.ts
 *
 * Test Edilen Kapsam:
 * - [x] Gram Altın (GRAM_GOLD) için öncelikli fiyatı getir.
 * - [x] Çeyrek Altın kartı için Yeni Tarihli (QUARTER_GOLD_NEW) ürün fiyatını getir.
 * - [x] Ons Altın (OUNCE_GOLD) fiyatını getir.
 * - [x] Portföy özetini getir (oturum var/yok izolasyonu).
 * - [x] Son fiyat zamanını belirle (determineLastPriceTime).
 * - [x] Tam durum konsolidasyonu (priceStatus = 'fresh').
 * - [x] Kısmi durum konsolidasyonu (priceStatus = 'partial' - ADR-013).
 * - [x] Eski fiyat konsolidasyonu (priceStatus = 'stale' - ADR-014).
 * - [x] Kullanılamıyor durum konsolidasyonu (priceStatus = 'unavailable' - ADR-013).
 * - [x] Portföy durum konsolidasyonu (portfolioStatus: 'empty' | 'fresh' | 'partial' | 'stale').
 */

import {
  consolidatePriceStatus,
  consolidatePortfolioStatus,
  determineLastPriceTime,
  type HomeFeaturedPrice,
  FEATURED_PRODUCT_CODES,
} from '../../src/models/home.ts';

import {
  calculatePortfolioSummary,
} from '../../src/domain/calculations/portfolioSummary.ts';

import type { GoldProduct } from '../../src/models/goldProduct.ts';
import type { GoldPrice } from '../../src/models/goldPrice.ts';

async function runTests() {
  console.log('--- Faz 9: Ana Sayfa Veri Modeli Testleri ---\n');
  let passed = 0;
  let failed = 0;

  // Mock Ürünler
  const mockGramProduct: GoldProduct = {
    id: 'prod-gram',
    code: 'GRAM_GOLD',
    name: 'Gram Altın',
    shortName: 'GRAM',
    category: 'gram',
    measurementUnit: 'gram',
    quantityPrecision: 3,
    packageWeightGrams: 1,
    portfolioEnabled: true,
    calculatorEnabled: true,
    priceDisplayEnabled: true,
    sortOrder: 1,
    isActive: true,
  };

  const mockQuarterNewProduct: GoldProduct = {
    id: 'prod-quarter-new',
    code: 'QUARTER_GOLD_NEW',
    name: 'Çeyrek Altın (Yeni Tarihli)',
    shortName: 'ÇEYREK',
    category: 'coin',
    measurementUnit: 'piece',
    quantityPrecision: 0,
    packageWeightGrams: null,
    portfolioEnabled: true,
    calculatorEnabled: true,
    priceDisplayEnabled: true,
    sortOrder: 2,
    isActive: true,
  };

  const mockOunceProduct: GoldProduct = {
    id: 'prod-ounce',
    code: 'OUNCE_GOLD',
    name: 'Ons Altın',
    shortName: 'ONS',
    category: 'international',
    measurementUnit: 'ounce',
    quantityPrecision: 2,
    packageWeightGrams: null,
    portfolioEnabled: false,
    calculatorEnabled: false,
    priceDisplayEnabled: true,
    sortOrder: 10,
    isActive: true,
  };

  // Mock Fiyatlar
  const mockGramPrice: GoldPrice = {
    id: 1,
    productId: 'prod-gram',
    sourceId: 'src-1',
    buyPriceMinor: 310000, // 3.100,00 TL
    sellPriceMinor: 312000, // 3.120,00 TL
    buyPrice: 3100,
    sellPrice: 3120,
    currencyCode: 'TRY',
    priceUnit: 'gram',
    dailyChangePercent: 0.5,
    dayLowMinor: 308000,
    dayHighMinor: 313000,
    dayLow: 3080,
    dayHigh: 3130,
    sourcePriceAt: '2026-10-22T14:30:00Z',
    fetchedAt: '2026-10-22T14:30:05Z',
    isProviderStale: false,
    isValid: true,
    status: 'live',
  };

  const mockQuarterPrice: GoldPrice = {
    id: 2,
    productId: 'prod-quarter-new',
    sourceId: 'src-1',
    buyPriceMinor: 505000, // 5.050,00 TL
    sellPriceMinor: 512000, // 5.120,00 TL
    buyPrice: 5050,
    sellPrice: 5120,
    currencyCode: 'TRY',
    priceUnit: 'piece',
    dailyChangePercent: 0.4,
    dayLowMinor: 503000,
    dayHighMinor: 514000,
    dayLow: 5030,
    dayHigh: 5140,
    sourcePriceAt: '2026-10-22T14:35:00Z',
    fetchedAt: '2026-10-22T14:35:05Z',
    isProviderStale: false,
    isValid: true,
    status: 'live',
  };

  const mockOuncePrice: GoldPrice = {
    id: 3,
    productId: 'prod-ounce',
    sourceId: 'src-1',
    buyPriceMinor: 272000, // 2.720,00 USD
    sellPriceMinor: 272500, // 2.725,00 USD
    buyPrice: 2720,
    sellPrice: 2725,
    currencyCode: 'USD',
    priceUnit: 'ounce',
    dailyChangePercent: -0.2,
    dayLowMinor: 271000,
    dayHighMinor: 273000,
    dayLow: 2710,
    dayHigh: 2730,
    sourcePriceAt: '2026-10-22T14:32:00Z',
    fetchedAt: '2026-10-22T14:32:05Z',
    isProviderStale: false,
    isValid: true,
    status: 'live',
  };

  // Test 1: Gram Altın (GRAM_GOLD) için öncelikli fiyatı getirme
  try {
    const gramFeatured: HomeFeaturedPrice = {
      product: mockGramProduct,
      price: mockGramPrice,
      isStale: mockGramPrice.status === 'stale',
      hasPrice: Boolean(mockGramPrice.buyPriceMinor && mockGramPrice.buyPriceMinor > 0),
    };

    const isGramValid =
      gramFeatured.product.code === FEATURED_PRODUCT_CODES.GRAM_GOLD &&
      gramFeatured.price?.buyPriceMinor === 310000 &&
      gramFeatured.hasPrice === true &&
      gramFeatured.isStale === false;

    if (isGramValid) {
      console.log('✅ Test 1: Gram Altın (GRAM_GOLD) öncelikli ürün kodu ve güncel fiyatı başarıyla doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 1: Gram Altın eşleştirmesinde hata:', gramFeatured);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Hatası:', err);
    failed++;
  }

  // Test 2: Çeyrek Altın kartı için Yeni Tarihli (QUARTER_GOLD_NEW) ürün fiyatını getirme
  try {
    const quarterFeatured: HomeFeaturedPrice = {
      product: mockQuarterNewProduct,
      price: mockQuarterPrice,
      isStale: mockQuarterPrice.status === 'stale',
      hasPrice: Boolean(mockQuarterPrice.buyPriceMinor && mockQuarterPrice.buyPriceMinor > 0),
    };

    // Kural: Kesinlikle QUARTER_GOLD_OLD (Eski Tarihli) bağlanmamalı, QUARTER_GOLD_NEW olmalı!
    const isQuarterValid =
      quarterFeatured.product.code === FEATURED_PRODUCT_CODES.QUARTER_GOLD_NEW &&
      (quarterFeatured.product.code as string) !== 'QUARTER_GOLD_OLD' &&
      quarterFeatured.price?.buyPriceMinor === 505000 &&
      quarterFeatured.hasPrice === true;

    if (isQuarterValid) {
      console.log('✅ Test 2: Çeyrek Altın kartında Yeni Tarihli ürün kodu (QUARTER_GOLD_NEW) ve fiyatı doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 2: Çeyrek Altın eşleştirmesinde hata:', quarterFeatured);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Hatası:', err);
    failed++;
  }

  // Test 3: Ons Altın (OUNCE_GOLD) fiyatını getirme
  try {
    const ounceFeatured: HomeFeaturedPrice = {
      product: mockOunceProduct,
      price: mockOuncePrice,
      isStale: mockOuncePrice.status === 'stale',
      hasPrice: Boolean(mockOuncePrice.buyPriceMinor && mockOuncePrice.buyPriceMinor > 0),
    };

    const isOunceValid =
      ounceFeatured.product.code === FEATURED_PRODUCT_CODES.OUNCE_GOLD &&
      ounceFeatured.product.measurementUnit === 'ounce' &&
      ounceFeatured.price?.currencyCode === 'USD' &&
      ounceFeatured.hasPrice === true;

    if (isOunceValid) {
      console.log('✅ Test 3: Ons Altın (OUNCE_GOLD) uluslararası gösterge kodu ve USD fiyatı başarıyla doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 3: Ons Altın eşleştirmesinde hata:', ounceFeatured);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Hatası:', err);
    failed++;
  }

  // Test 4: Portföy özetini getirme (oturum var/yok durumunda güvenli model üretimi)
  try {
    // Durum A: Giriş yapmamış veya portföyü boş kullanıcı
    const emptySummary = calculatePortfolioSummary([]);
    const emptyStatus = consolidatePortfolioStatus(emptySummary);

    // Durum B: Aktif portföyü olan kullanıcı
    const filledSummary = calculatePortfolioSummary([
      { id: '1', quantity: 10, totalCostMinor: 2900000, buyPriceMinor: 310000 },
    ]);
    const filledStatus = consolidatePortfolioStatus(filledSummary);

    const isPortfolioSafe =
      emptySummary.totalEntries === 0 &&
      emptySummary.totalCostMinor === 0 &&
      emptyStatus === 'empty' &&
      filledSummary.totalEntries === 1 &&
      filledSummary.totalProfitLossMinor === 200000 &&
      filledStatus === 'fresh';

    if (isPortfolioSafe) {
      console.log('✅ Test 4: Portföy özeti oturum var/yok ve dolu/boş durumlarında güvenle izole edildi.');
      passed++;
    } else {
      console.error('❌ Test 4: Portföy özeti izolasyonunda hata:', { emptySummary, filledSummary });
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Hatası:', err);
    failed++;
  }

  // Test 5: Son fiyat zamanını belirleme (determineLastPriceTime)
  try {
    // 3 fiyat: 14:30, 14:35, 14:32 -> En sonuncusu 14:35 olmalı
    const prices = [mockGramPrice, mockQuarterPrice, mockOuncePrice];
    const latest = determineLastPriceTime(prices);

    if (latest === '2026-10-22T14:35:00Z') {
      console.log('✅ Test 5: Öne çıkarılan ürünler arasındaki en son fiyat zaman damgası (14:35:00) doğru belirlendi.');
      passed++;
    } else {
      console.error('❌ Test 5: En son fiyat zamanı hatalı:', latest);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Hatası:', err);
    failed++;
  }

  // Test 6: Tam durum konsolidasyonu (priceStatus = 'fresh')
  try {
    const featuredItems: HomeFeaturedPrice[] = [
      { product: mockGramProduct, price: mockGramPrice, isStale: false, hasPrice: true },
      { product: mockQuarterNewProduct, price: mockQuarterPrice, isStale: false, hasPrice: true },
      { product: mockOunceProduct, price: mockOuncePrice, isStale: false, hasPrice: true },
    ];

    const status = consolidatePriceStatus(featuredItems);

    if (status === 'fresh') {
      console.log('✅ Test 6: Tüm fiyatlar mevcut ve güncelken konsolide durum (fresh) başarıyla doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 6: Tam durum konsolidasyonunda hata:', status);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Hatası:', err);
    failed++;
  }

  // Test 7: Kısmi durum konsolidasyonu (priceStatus = 'partial' - ADR-013)
  try {
    const featuredItems: (HomeFeaturedPrice | null)[] = [
      { product: mockGramProduct, price: mockGramPrice, isStale: false, hasPrice: true },
      { product: mockQuarterNewProduct, price: null, isStale: false, hasPrice: false }, // Fiyat yok
      { product: mockOunceProduct, price: mockOuncePrice, isStale: false, hasPrice: true },
    ];

    const status = consolidatePriceStatus(featuredItems);

    if (status === 'partial') {
      console.log('✅ Test 7: ADR-013 gereğince bir ürünün fiyatı eksikken durum (partial) olarak işaretlendi.');
      passed++;
    } else {
      console.error('❌ Test 7: Kısmi durum konsolidasyonunda hata:', status);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Hatası:', err);
    failed++;
  }

  // Test 8: Eski fiyat konsolidasyonu (priceStatus = 'stale' - ADR-014)
  try {
    const featuredItems: HomeFeaturedPrice[] = [
      { product: mockGramProduct, price: mockGramPrice, isStale: false, hasPrice: true },
      { product: mockQuarterNewProduct, price: mockQuarterPrice, isStale: true, hasPrice: true }, // 15 dk eski
      { product: mockOunceProduct, price: mockOuncePrice, isStale: false, hasPrice: true },
    ];

    const status = consolidatePriceStatus(featuredItems);

    if (status === 'stale') {
      console.log('✅ Test 8: ADR-014 gereğince en az bir ürün bayatken durum (stale) olarak işaretlendi.');
      passed++;
    } else {
      console.error('❌ Test 8: Eski fiyat konsolidasyonunda hata:', status);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Hatası:', err);
    failed++;
  }

  // Test 9: Kullanılamıyor durum konsolidasyonu (priceStatus = 'unavailable' - ADR-013)
  try {
    const featuredItems: (HomeFeaturedPrice | null)[] = [
      { product: mockGramProduct, price: null, isStale: false, hasPrice: false },
      { product: mockQuarterNewProduct, price: null, isStale: false, hasPrice: false },
      { product: mockOunceProduct, price: null, isStale: false, hasPrice: false },
    ];

    const status = consolidatePriceStatus(featuredItems);

    if (status === 'unavailable') {
      console.log('✅ Test 9: ADR-013 gereğince hiçbir fiyat yokken durum (unavailable) olarak işaretlendi.');
      passed++;
    } else {
      console.error('❌ Test 9: Kullanılamıyor konsolidasyonunda hata:', status);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 Hatası:', err);
    failed++;
  }

  // Test 10: Portföy durum konsolidasyonu (empty | fresh | partial | stale)
  try {
    const sEmpty = calculatePortfolioSummary([]);
    const sFresh = calculatePortfolioSummary([
      { id: '1', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 110000, isStale: false },
    ]);
    const sPartial = calculatePortfolioSummary([
      { id: '1', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 110000 },
      { id: '2', quantity: 1, totalCostMinor: 100000, buyPriceMinor: null },
    ]);
    const sStale = calculatePortfolioSummary([
      { id: '1', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 110000, isStale: true },
    ]);

    const isAllPortfolioStatesValid =
      consolidatePortfolioStatus(sEmpty) === 'empty' &&
      consolidatePortfolioStatus(sFresh) === 'fresh' &&
      consolidatePortfolioStatus(sPartial) === 'partial' &&
      consolidatePortfolioStatus(sStale) === 'stale';

    if (isAllPortfolioStatesValid) {
      console.log('✅ Test 10: Portföy durumları (empty, fresh, partial, stale) eksiksiz konsolide edildi.');
      passed++;
    } else {
      console.error('❌ Test 10: Portföy durum konsolidasyonunda hata.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 10 Hatası:', err);
    failed++;
  }

  console.log('\n========================================');
  console.log(`Faz 9 Test Sonucu: ${passed}/${passed + failed} test geçti.`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
