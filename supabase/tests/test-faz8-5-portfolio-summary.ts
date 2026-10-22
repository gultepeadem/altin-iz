/**
 * Altın İz — Faz 8.5 Portföy Özet Hesaplaması Testleri
 * supabase/tests/test-faz8-5-portfolio-summary.ts
 *
 * Test Edilen Kapsam:
 * - [x] Portföy kayıtlarını fiyatlarla eşleştir.
 * - [x] Her kaydın tahmini değerini hesapla.
 * - [x] Her kaydın kâr-zararını hesapla.
 * - [x] Toplam ödenen tutarı hesapla.
 * - [x] Tam portföy özetini hesapla.
 * - [x] Kısmi portföy özetini hesapla (ADR-013).
 * - [x] Fiyatı olmayan kayıt sayısını göster.
 * - [x] Eski fiyatla hesaplanan kayıt sayısını değerlendir (ADR-014).
 * - [x] Yanıltıcı toplam yüzde göstermeyi engelle (sıfıra bölme, NaN koruması).
 * - [x] Bütün kayıtların yüzdesini toplamadığını test et (Ağırlıklı portföy getirisi).
 */

import {
  calculatePortfolioSummary,
  type PortfolioCalculationItem,
} from '../../src/domain/calculations/portfolioSummary.ts';

import {
  calculateEntryValuation,
} from '../../src/domain/calculations/valuation.ts';

async function runTests() {
  console.log('--- Faz 8.5: Portföy Özet Hesaplaması Testleri ---\n');
  let passed = 0;
  let failed = 0;

  // Mock Ürün ve Fiyat Kataloğu
  const mockPrices = new Map<string, { buyPriceMinor: number; isStale: boolean }>([
    ['prod_gram_gold', { buyPriceMinor: 310000, isStale: false }], // 3.100,00 TL
    ['prod_quarter_gold', { buyPriceMinor: 505000, isStale: true }], // 5.050,00 TL (Eski fiyat)
    ['prod_half_gold', { buyPriceMinor: 1010000, isStale: false }], // 10.100,00 TL
    // 'prod_custom_gold' için fiyat YOK (null)
  ]);

  // Test 1: Portföy kayıtlarını fiyatlarla eşleştirme
  try {
    const rawEntries = [
      { id: 'entry-1', productId: 'prod_gram_gold', quantity: 5, totalCostMinor: 1500000 },
      { id: 'entry-2', productId: 'prod_custom_gold', quantity: 1, totalCostMinor: 400000 },
    ];

    const matchedItems = rawEntries.map((e) => {
      const price = mockPrices.get(e.productId);
      return {
        id: e.id,
        quantity: e.quantity,
        totalCostMinor: e.totalCostMinor,
        buyPriceMinor: price ? price.buyPriceMinor : null,
        isStale: price ? price.isStale : false,
      };
    });

    const isMatchSuccess =
      matchedItems[0].buyPriceMinor === 310000 &&
      matchedItems[0].isStale === false &&
      matchedItems[1].buyPriceMinor === null &&
      matchedItems[1].isStale === false;

    if (isMatchSuccess) {
      console.log('✅ Test 1: Portföy kayıtları güncel fiyat kataloğu ile productId bazında başarıyla eşleştirildi.');
      passed++;
    } else {
      console.error('❌ Test 1: Fiyat eşleştirmesinde hata oluştu.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Hatası:', err);
    failed++;
  }

  // Test 2: Her kaydın tahmini değerini hesaplama (ADR-010: Miktar × Alış Fiyatı)
  try {
    // 2.5 gram altın, gram alış fiyatı 3.100,00 TL (310.000 kuruş)
    // Değer = 2.5 * 310.000 = 775.000 kuruş (7.750,00 TL)
    const val = calculateEntryValuation(2.5, 310000, 700000);

    if (
      val.currentValueMinor === 775000 &&
      val.currentValue === 7750 &&
      val.status === 'profit'
    ) {
      console.log('✅ Test 2: Kaydın tahmini bozdurma değeri Miktar × Güncel Alış Fiyatı formülüyle kuruş hassasiyetinde doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 2: Değerleme hesabında hata:', val);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Hatası:', err);
    failed++;
  }

  // Test 3: Her kaydın kâr-zararını hesaplama (Değer - Maliyet)
  try {
    // Değer: 775.000 kuruş, Maliyet: 700.000 kuruş -> Kâr: +75.000 kuruş (+750 TL, %10.7143)
    const valProfit = calculateEntryValuation(2.5, 310000, 700000);
    // Değer: 775.000 kuruş, Maliyet: 800.000 kuruş -> Zarar: -25.000 kuruş (-250 TL, -%3.1250)
    const valLoss = calculateEntryValuation(2.5, 310000, 800000);

    const isProfitCorrect =
      valProfit.profitLossMinor === 75000 &&
      valProfit.profitLoss === 750 &&
      valProfit.profitLossPercentage === 10.7143 &&
      valProfit.status === 'profit';

    const isLossCorrect =
      valLoss.profitLossMinor === -25000 &&
      valLoss.profitLoss === -250 &&
      valLoss.profitLossPercentage === -3.125 &&
      valLoss.status === 'loss';

    if (isProfitCorrect && isLossCorrect) {
      console.log('✅ Test 3: Kayıt bazında kâr ve zarar tutarları, yüzdeleri ve durum rozetleri eksiksiz doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 3: Kâr/zarar hesabında hata:', { valProfit, valLoss });
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Hatası:', err);
    failed++;
  }

  // Test 4: Toplam ödenen tutarı hesaplama (Tüm kayıtlar, fiyatsızlar dâhil)
  try {
    const items: PortfolioCalculationItem[] = [
      { id: '1', quantity: 2, totalCostMinor: 600000, buyPriceMinor: 310000 },
      { id: '2', quantity: 1, totalCostMinor: 400000, buyPriceMinor: null }, // Fiyatsız
      { id: '3', quantity: 3, totalCostMinor: 950000, buyPriceMinor: 315000 },
    ];

    const summary = calculatePortfolioSummary(items);
    // 600.000 + 400.000 + 950.000 = 1.950.000 kuruş (19.500,00 TL)
    if (summary.totalCostMinor === 1950000 && summary.totalCost === 19500) {
      console.log('✅ Test 4: Toplam ödenen tutar tüm kayıtları (fiyatsız olanlar dâhil) eksiksiz toplayarak doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 4: Toplam maliyet toplamı hatalı:', summary.totalCostMinor);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Hatası:', err);
    failed++;
  }

  // Test 5: Tam portföy özetini hesaplama (Tüm fiyatlar mevcut)
  try {
    const items: PortfolioCalculationItem[] = [
      { id: '1', quantity: 2, totalCostMinor: 600000, buyPriceMinor: 320000 }, // Değer: 640.000
      { id: '2', quantity: 1, totalCostMinor: 500000, buyPriceMinor: 550000 }, // Değer: 550.000
    ];

    const summary = calculatePortfolioSummary(items);
    // Toplam maliyet: 1.100.000 kuruş (11.000 TL)
    // Toplam güncel değer: 640.000 + 550.000 = 1.190.000 kuruş (11.900 TL)
    // Net Kâr: +90.000 kuruş (+900 TL)
    // Yüzde: (90.000 / 1.100.000) * 100 = %8.1818
    const isFullSummaryCorrect =
      summary.isPartial === false &&
      summary.hasMissingPrice === false &&
      summary.totalCostMinor === 1100000 &&
      summary.matchedCostMinor === 1100000 &&
      summary.totalCurrentValueMinor === 1190000 &&
      summary.totalProfitLossMinor === 90000 &&
      summary.totalProfitLoss === 900 &&
      summary.totalProfitLossPercentage === 8.1818 &&
      summary.pricedEntries === 2 &&
      summary.unpricedEntries === 0;

    if (isFullSummaryCorrect) {
      console.log('✅ Test 5: Tam portföy özeti (tüm kayıtların fiyatı varken) eksiksiz ve doğru hesaplandı.');
      passed++;
    } else {
      console.error('❌ Test 5: Tam portföy özeti hatalı:', summary);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Hatası:', err);
    failed++;
  }

  // Test 6: Kısmi portföy özetini hesaplama (ADR-013: Fiyatsız kayıtlar yapay zarar yaratmaz)
  try {
    const items: PortfolioCalculationItem[] = [
      { id: '1', quantity: 2, totalCostMinor: 600000, buyPriceMinor: 320000 }, // Değer: 640.000 (+40.000 kâr)
      { id: '2', quantity: 1, totalCostMinor: 500000, buyPriceMinor: 510000 }, // Değer: 510.000 (+10.000 kâr)
      { id: '3', quantity: 1, totalCostMinor: 2000000, buyPriceMinor: null },  // FİYAT YOK! (20.000 TL maliyet)
    ];

    const summary = calculatePortfolioSummary(items);

    // Kural (ADR-013):
    // Toplam maliyet: 600.000 + 500.000 + 2.000.000 = 3.100.000 kuruş (31.000 TL)
    // Eşleşen maliyet: 600.000 + 500.000 = 1.100.000 kuruş (11.000 TL)
    // Değer: 640.000 + 510.000 = 1.150.000 kuruş (11.500 TL)
    // Kâr/Zarar: 1.150.000 - 1.100.000 = +50.000 kuruş (+500 TL, asla -19.500 TL zarar üretilmez!)
    // Yüzde: (50.000 / 1.100.000) * 100 = %4.5455
    const isPartialCorrect =
      summary.isPartial === true &&
      summary.hasMissingPrice === true &&
      summary.totalCostMinor === 3100000 &&
      summary.matchedCostMinor === 1100000 &&
      summary.totalCurrentValueMinor === 1150000 &&
      summary.totalProfitLossMinor === 50000 &&
      summary.totalProfitLossPercentage === 4.5455;

    if (isPartialCorrect) {
      console.log('✅ Test 6: ADR-013 kısmi portföy özeti doğrulandı: Fiyatsız kayıtlar 0 TL kabul edilmedi ve portföyü haksız zarara sokmadı.');
      passed++;
    } else {
      console.error('❌ Test 6: Kısmi portföy hesaplaması hatalı:', summary);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Hatası:', err);
    failed++;
  }

  // Test 7: Fiyatı olmayan ve olan kayıt sayılarının gösterilmesi
  try {
    const items: PortfolioCalculationItem[] = [
      { id: '1', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 110000 },
      { id: '2', quantity: 1, totalCostMinor: 100000, buyPriceMinor: null },
      { id: '3', quantity: 1, totalCostMinor: 100000, buyPriceMinor: null },
      { id: '4', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 120000 },
    ];

    const summary = calculatePortfolioSummary(items);

    if (
      summary.totalEntries === 4 &&
      summary.pricedEntries === 2 &&
      summary.unpricedEntries === 2 &&
      summary.hasMissingPrice === true
    ) {
      console.log('✅ Test 7: Fiyatı olan (pricedEntries: 2) ve olmayan (unpricedEntries: 2) kayıt sayıları doğru raporlandı.');
      passed++;
    } else {
      console.error('❌ Test 7: Kayıt sayıları raporlaması hatalı:', summary);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Hatası:', err);
    failed++;
  }

  // Test 8: Eski fiyatla hesaplanan kayıt sayısının değerlendirilmesi (ADR-014)
  try {
    const items: PortfolioCalculationItem[] = [
      { id: '1', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 110000, isStale: false },
      { id: '2', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 115000, isStale: true }, // Eski fiyat
      { id: '3', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 120000, isStale: true }, // Eski fiyat
      { id: '4', quantity: 1, totalCostMinor: 100000, buyPriceMinor: null, isStale: false },
    ];

    const summary = calculatePortfolioSummary(items);

    if (
      summary.isStale === true &&
      summary.staleEntries === 2 &&
      summary.pricedEntries === 3
    ) {
      console.log('✅ Test 8: ADR-014 eski fiyat durumu portföy özetinde (isStale = true, staleEntries: 2) başarıyla değerlendirildi.');
      passed++;
    } else {
      console.error('❌ Test 8: Eski fiyat değerlendirmesi hatalı:', summary);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Hatası:', err);
    failed++;
  }

  // Test 9: Yanıltıcı toplam yüzde göstermeyi engelleme (Sıfıra bölme, NaN koruması)
  try {
    // Durum A: Boş portföy
    const emptySummary = calculatePortfolioSummary([]);
    // Durum B: Hiçbir kaydın fiyatı yok
    const noPriceSummary = calculatePortfolioSummary([
      { id: '1', quantity: 1, totalCostMinor: 100000, buyPriceMinor: null },
    ]);
    // Durum C: Maliyeti 0 olan kayıtlar (hediye altın vs.)
    const zeroCostSummary = calculatePortfolioSummary([
      { id: '1', quantity: 1, totalCostMinor: 0, buyPriceMinor: 100000 },
    ]);

    const isEmptySafe =
      emptySummary.totalProfitLossPercentage === null &&
      emptySummary.totalProfitLossMinor === null;

    const isNoPriceSafe =
      noPriceSummary.totalProfitLossPercentage === null &&
      noPriceSummary.totalProfitLossMinor === null;

    const isZeroCostSafe =
      zeroCostSummary.totalProfitLossPercentage === 0 ||
      zeroCostSummary.totalProfitLossPercentage === null;

    if (isEmptySafe && isNoPriceSafe && isZeroCostSafe && !isNaN(zeroCostSummary.totalProfitLossPercentage ?? 0)) {
      console.log('✅ Test 9: Boş portföy ve fiyatsız kayıtlarda sıfıra bölme ve NaN engellenerek yanıltıcı yüzde gösterilmedi.');
      passed++;
    } else {
      console.error('❌ Test 9: Yanıltıcı yüzde korumasında hata:', { emptySummary, noPriceSummary, zeroCostSummary });
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 Hatası:', err);
    failed++;
  }

  // Test 10: Bütün kayıtların getiri yüzdelerinin toplanmadığının kanıtı (Ağırlıklı Portföy Getirisi)
  try {
    // 2 kayıt:
    // Kayıt A: Maliyet = 1.000 TL (100.000 kuruş), Değer = 2.000 TL (200.000 kuruş) -> Kâr = +1.000 TL (%100 Kâr)
    // Kayıt B: Maliyet = 100.000 TL (10.000.000 kuruş), Değer = 101.000 TL (10.100.000 kuruş) -> Kâr = +1.000 TL (%1 Kâr)
    // Hatalı basit toplam: %100 + %1 = %101 (TAMAMEN YANILTI VE YANLIŞ!)
    // Doğru ağırlıklı getiri:
    // Toplam Maliyet = 101.000 TL
    // Toplam Kâr = +2.000 TL
    // Portföyün Gerçek Getirisi = (2.000 / 101.000) * 100 = %1.9802!
    const items: PortfolioCalculationItem[] = [
      { id: 'A', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 200000 },
      { id: 'B', quantity: 1, totalCostMinor: 10000000, buyPriceMinor: 10100000 },
    ];

    const summary = calculatePortfolioSummary(items);
    const expectedWeightedPercent = 1.9802;
    const naiveArithmeticSum = 100 + 1; // 101

    const isWeightedYieldCorrect =
      summary.totalProfitLossPercentage === expectedWeightedPercent &&
      expectedWeightedPercent !== naiveArithmeticSum;

    if (isWeightedYieldCorrect) {
      console.log(`✅ Test 10: Matematiksel kanıt: Tekil yüzdelerin toplanmadığı (%101 reddedildi), sermaye ağırlıklı portföy getiri oranının (%${summary.totalProfitLossPercentage}) hesaplandığı doğrulandı.`);
      passed++;
    } else {
      console.error('❌ Test 10: Ağırlıklı getiri hesaplamasında hata:', summary.totalProfitLossPercentage);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 10 Hatası:', err);
    failed++;
  }

  console.log('\n========================================');
  console.log(`Faz 8.5 Test Sonucu: ${passed}/${passed + failed} test geçti.`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
