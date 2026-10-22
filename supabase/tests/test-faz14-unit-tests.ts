/**
 * Altın İz — Faz 14: Kapsamlı Birim Testleri Paketi (Unit Tests)
 * supabase/tests/test-faz14-unit-tests.ts
 *
 * Test Kapsamı:
 * 1. Para dönüştürme testleri (toMinorUnits, fromMinorUnits, parseMoneyInputToMinor, isSafeMoney)
 * 2. Para biçimlendirme testleri (formatMoney - Türkçe format ve sembol)
 * 3. Miktar doğrulama testleri (parseQuantity, validateQuantity - gram ve adet kuralları)
 * 4. Alış tarihi doğrulama testleri (parseDateInputToISO, isFutureDate - geçmiş ve gelecek tarih kontrolü)
 * 5. Satın alma hesaplama testleri (calculatePurchaseEstimate - Miktar × Satış Fiyatı, ADR-013 kuralı)
 * 6. Bozdurma hesaplama testleri (calculateRedemptionEstimate - Miktar × Alış Fiyatı, ADR-013 kuralı)
 * 7. Kâr-zarar testleri (calculateEntryValuation - Nominal getiri, durum tespiti)
 * 8. Yüzde testleri (calculatePercentageChange, formatPercent - 4 basamak hassasiyet, sıfıra bölme koruması)
 * 9. Kısmi toplam testleri (calculatePortfolioSummary - ADR-013 eksik fiyat, isPartial ve matchedCost)
 * 10. Hata dönüştürme testleri (normalizeError, isAppError - maskeleme ve Türkçe mesaj dönüşümü)
 * 11. Ürün etkinlik kuralları testleri (is_active, is_display filtreleme)
 * 12. Eski fiyat belirleme testleri (15 dakikalık bayatlık eşiği tespiti)
 */

import { toMinorUnits, fromMinorUnits, roundToMinor, isSafeMoney } from '../../src/domain/calculations/money.ts';
import { calculatePercentageChange } from '../../src/domain/calculations/percentage.ts';
import {
  calculatePurchaseEstimate,
  calculateRedemptionEstimate,
  calculateEntryValuation,
} from '../../src/domain/calculations/valuation.ts';
import { calculatePortfolioSummary, type PortfolioCalculationItem } from '../../src/domain/calculations/portfolioSummary.ts';
import { parseQuantity, validateQuantity } from '../../src/domain/validation/quantityValidation.ts';
import {
  parseDateInputToISO,
  isFutureDate,
  parseMoneyInputToMinor,
} from '../../src/domain/validation/portfolioValidation.ts';
import { formatMoney, formatPercent, formatDate } from '../../src/utils/formatters.ts';
import { normalizeError, isAppError } from '../../src/utils/normalizeError.ts';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ BAŞARISIZ: ${message}`);
    failedTests++;
    throw new Error(`Test başarısız: ${message}`);
  } else {
    console.log(`✅ ${message}`);
    passedTests++;
  }
}

async function runTests() {
  console.log('--- Faz 14: Kapsamlı Birim Testleri (Unit Tests) ---\n');

  // ==========================================================================
  // Test 1: Para Dönüştürme Testleri (toMinorUnits, fromMinorUnits, parseMoneyInputToMinor)
  // ==========================================================================
  try {
    // TL -> Kuruş
    assert(toMinorUnits(3120.55) === 312055, 'toMinorUnits: 3120.55 TL tam olarak 312055 kuruşa dönüştü.');
    assert(toMinorUnits(0.01) === 1, 'toMinorUnits: 0.01 TL 1 kuruşa dönüştü.');
    assert(toMinorUnits(0) === 0, 'toMinorUnits: 0 TL 0 kuruşa dönüştü.');

    // Kuruş -> TL
    assert(fromMinorUnits(312055) === 3120.55, 'fromMinorUnits: 312055 kuruş 3120.55 TL oldu.');
    assert(fromMinorUnits(1) === 0.01, 'fromMinorUnits: 1 kuruş 0.01 TL oldu.');

    // parseMoneyInputToMinor (Türkçe giriş formatları)
    assert(parseMoneyInputToMinor('3.120,50') === 312050, 'parseMoneyInputToMinor: "3.120,50" -> 312050 kuruş.');
    assert(parseMoneyInputToMinor('3120.50') === 312050, 'parseMoneyInputToMinor: "3120.50" -> 312050 kuruş.');
    assert(parseMoneyInputToMinor('3120,50') === 312050, 'parseMoneyInputToMinor: "3120,50" -> 312050 kuruş.');
    assert(parseMoneyInputToMinor('1000') === 100000, 'parseMoneyInputToMinor: "1000" -> 100000 kuruş.');
    assert(parseMoneyInputToMinor('0') === null, 'parseMoneyInputToMinor: "0" geçersiz (null) kabul edildi.');
    assert(parseMoneyInputToMinor('-50') === null, 'parseMoneyInputToMinor: negatif tutar engellendi.');
    assert(parseMoneyInputToMinor('abc') === null, 'parseMoneyInputToMinor: harf girişi engellendi.');

    // isSafeMoney
    assert(isSafeMoney(100000), 'isSafeMoney: 100000 kuruş güvenli aralıkta.');
    assert(!isSafeMoney(NaN), 'isSafeMoney: NaN güvensiz kabul edildi.');

    // roundToMinor
    assert(roundToMinor(1234.6) === 1235 && roundToMinor(1234.4) === 1234, 'roundToMinor: Kuruş yuvarlama doğru çalıştı.');

    assert(true, 'Test 1: Para dönüştürme ve tamsayı kuruş testleri eksiksiz geçti.');
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: Para Biçimlendirme Testleri (formatMoney)
  // ==========================================================================
  try {
    // 302050 kuruş -> "3.020,50 TL"
    const formatted1 = formatMoney(302050);
    assert(formatted1.includes('3.020,50') && formatted1.includes('TL'), `formatMoney(302050) -> "${formatted1}"`);

    // 0 kuruş -> "0,00 TL"
    const formatted0 = formatMoney(0);
    assert(formatted0.includes('0,00') && formatted0.includes('TL'), `formatMoney(0) -> "${formatted0}"`);

    // null / undefined -> "-" (ADR-013 gereği asla 0 TL göstermez)
    assert(formatMoney(null) === '-', 'formatMoney(null) -> "-" döndü.');
    assert(formatMoney(undefined) === '-', 'formatMoney(undefined) -> "-" döndü.');
    assert(formatMoney(NaN) === '-', 'formatMoney(NaN) -> "-" döndü.');

    assert(true, 'Test 2: Para biçimlendirme testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: Miktar Doğrulama Testleri (parseQuantity, validateQuantity)
  // ==========================================================================
  try {
    // parseQuantity
    assert(parseQuantity('2,5') === 2.5, 'parseQuantity: "2,5" -> 2.5');
    assert(parseQuantity('2.5') === 2.5, 'parseQuantity: "2.5" -> 2.5');
    assert(parseQuantity(' 10 ') === 10, 'parseQuantity: boşluklar temizlendi.');
    assert(parseQuantity('') === null, 'parseQuantity: boş dize null döndü.');
    assert(parseQuantity('geçersiz') === null, 'parseQuantity: harf null döndü.');

    // validateQuantity - Gram (azami 3 ondalık)
    const validGram = validateQuantity(1.234, 'gram');
    assert(validGram.isValid && validGram.normalizedQuantity === 1.234, 'validateQuantity: 1.234 gram geçerli.');

    const invalidGramDecimals = validateQuantity(1.2345, 'gram');
    assert(!invalidGramDecimals.isValid && Boolean(invalidGramDecimals.error?.includes('ondalık')), 'validateQuantity: 4 ondalıklı gram reddedildi.');

    // validateQuantity - Adet (yalnızca tamsayı)
    const validPiece = validateQuantity(3, 'piece');
    assert(validPiece.isValid && validPiece.normalizedQuantity === 3, 'validateQuantity: 3 adet geçerli.');

    const invalidPiece = validateQuantity(2.5, 'piece');
    assert(!invalidPiece.isValid && Boolean(invalidPiece.error?.includes('tam sayı')), 'validateQuantity: 2.5 adet (kesirli) reddedildi.');

    // Sıfır ve negatif miktar kontrolleri
    assert(!validateQuantity(0, 'gram').isValid, 'validateQuantity: 0 gram engellendi.');
    assert(!validateQuantity(-1, 'piece').isValid, 'validateQuantity: negatif adet engellendi.');

    assert(true, 'Test 3: Miktar doğrulama (gram ve adet) testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: Alış Tarihi Doğrulama Testleri (parseDateInputToISO, isFutureDate)
  // ==========================================================================
  try {
    // parseDateInputToISO
    assert(parseDateInputToISO('22.10.2026') === '2026-10-22', 'parseDateInputToISO: "22.10.2026" -> "2026-10-22"');
    assert(parseDateInputToISO('22/10/2026') === '2026-10-22', 'parseDateInputToISO: "22/10/2026" -> "2026-10-22"');
    assert(parseDateInputToISO('2026-10-22') === '2026-10-22', 'parseDateInputToISO: ISO formatı korundu.');
    assert(parseDateInputToISO('31.02.2026') === null, 'parseDateInputToISO: Geçersiz 31 Şubat tarihi engellendi.');
    assert(parseDateInputToISO('geçersiz-tarih') === null, 'parseDateInputToISO: Geçersiz metin null döndü.');

    // isFutureDate
    const pastDate = '2020-01-01';
    assert(!isFutureDate(pastDate), 'isFutureDate: Geçmiş tarih gelecekte değil.');

    const farFutureDate = '2099-12-31';
    assert(isFutureDate(farFutureDate), 'isFutureDate: 2099 yılı gelecekte olarak yakalandı.');

    // formatDate
    assert(formatDate('2026-10-22') === '22.10.2026', 'formatDate: "2026-10-22" -> "22.10.2026"');
    assert(formatDate(null) === '-', 'formatDate(null) -> "-"');

    assert(true, 'Test 4: Alış tarihi doğrulama ve gelecek tarih engeli testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: Satın Alma Hesaplama Testleri (calculatePurchaseEstimate)
  // ==========================================================================
  try {
    // 2 gram * 300000 kuruş (3000 TL) = 600000 kuruş (6000 TL)
    const result1 = calculatePurchaseEstimate(2, 300000);
    assert(result1.success && result1.estimatedTotalMinor === 600000 && result1.estimatedTotal === 6000, 'calculatePurchaseEstimate: 2 gram × 3.000 TL = 6.000 TL');

    // Fiyat eksik veya 0 ise asla 0 TL üretmez, hata ve null döner (ADR-013)
    const missingPrice = calculatePurchaseEstimate(2, null);
    assert(!missingPrice.success && missingPrice.estimatedTotalMinor === null, 'calculatePurchaseEstimate: Fiyat null olduğunda hesaplama yapılmadı.');

    const zeroPrice = calculatePurchaseEstimate(2, 0);
    assert(!zeroPrice.success && zeroPrice.estimatedTotalMinor === null, 'calculatePurchaseEstimate: Fiyat 0 TL olduğunda hesaplama yapılmadı.');

    const invalidQty = calculatePurchaseEstimate(-1, 300000);
    assert(!invalidQty.success, 'calculatePurchaseEstimate: Negatif miktar reddedildi.');

    assert(true, 'Test 5: Satın alma tahmini ve ADR-013 eksik fiyat koruma testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: Bozdurma Hesaplama Testleri (calculateRedemptionEstimate)
  // ==========================================================================
  try {
    // 5 adet * 500000 kuruş (5000 TL) = 2500000 kuruş (25000 TL)
    const result = calculateRedemptionEstimate(5, 500000);
    assert(result.success && result.estimatedTotalMinor === 2500000 && result.estimatedTotal === 25000, 'calculateRedemptionEstimate: 5 adet × 5.000 TL = 25.000 TL');

    // Fiyat yoksa hata
    const noPrice = calculateRedemptionEstimate(5, undefined);
    assert(!noPrice.success && noPrice.estimatedTotalMinor === null, 'calculateRedemptionEstimate: Fiyat yoksa null döndü.');

    assert(true, 'Test 6: Bozdurma tahmini testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: Kâr-Zarar Testleri (calculateEntryValuation)
  // ==========================================================================
  try {
    // 10 gram, Alış fiyatı: 3100 TL (310000 kuruş), Maliyet: 30000 TL (3000000 kuruş)
    // Değer: 31000 TL (3100000 kuruş) -> Kâr: +1000 TL (+100000 kuruş), %3.3333 kâr
    const profitEntry = calculateEntryValuation(10, 310000, 3000000);
    assert(profitEntry.status === 'profit', 'calculateEntryValuation: Kâr durumu doğru tespit edildi.');
    assert(profitEntry.currentValueMinor === 3100000, 'calculateEntryValuation: Güncel değer 31000 TL.');
    assert(profitEntry.profitLossMinor === 100000, 'calculateEntryValuation: Kâr +1000 TL.');
    assert(profitEntry.profitLossPercentage === 3.3333, 'calculateEntryValuation: Yüzde +%3.3333 hesaplandı.');

    // Zarar durumu: 10 gram, Alış fiyatı: 2800 TL (280000 kuruş), Maliyet: 30000 TL (3000000 kuruş)
    // Değer: 28000 TL (2800000 kuruş) -> Zarar: -2000 TL (-200000 kuruş), status = 'loss'
    const lossEntry = calculateEntryValuation(10, 280000, 3000000);
    assert(lossEntry.status === 'loss', 'calculateEntryValuation: Zarar durumu doğru tespit edildi.');
    assert(lossEntry.profitLossMinor === -200000, 'calculateEntryValuation: Zarar -2000 TL.');
    assert(lossEntry.profitLossPercentage === -6.6667, 'calculateEntryValuation: Zarar yüzdesi -%6.6667.');

    // Başabaş durumu: Değer = Maliyet
    const evenEntry = calculateEntryValuation(10, 300000, 3000000);
    assert(evenEntry.status === 'even' && evenEntry.profitLossMinor === 0, 'calculateEntryValuation: Başabaş durumu tespit edildi.');

    // Fiyat yoksa status: 'unavailable', değerler null
    const unavailableEntry = calculateEntryValuation(10, null, 3000000);
    assert(unavailableEntry.status === 'unavailable' && unavailableEntry.currentValueMinor === null, 'calculateEntryValuation: Fiyat yoksa unavailable döndü.');

    assert(true, 'Test 7: Kâr, zarar ve başabaş değerleme testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  // ==========================================================================
  // Test 8: Yüzde Testleri (calculatePercentageChange, formatPercent)
  // ==========================================================================
  try {
    // 50 TL kâr / 200 TL maliyet = %25.0
    assert(calculatePercentageChange(5000, 20000) === 25, 'calculatePercentageChange: 50 TL / 200 TL = %25');

    // Negatif değişim: -10 TL / 100 TL = -%10.0
    assert(calculatePercentageChange(-1000, 10000) === -10, 'calculatePercentageChange: -10 TL / 100 TL = -%10');

    // Sıfıra bölme koruması: Maliyet = 0 olduğunda çökmez, 0 döner
    assert(calculatePercentageChange(1000, 0) === 0, 'calculatePercentageChange: Maliyet 0 iken güvenli 0 döndü.');

    // Eksik veri
    assert(calculatePercentageChange(null, 10000) === null, 'calculatePercentageChange: Değişim null iken null döndü.');

    // formatPercent
    assert(formatPercent(25) === '+%25,00', `formatPercent(25) -> "${formatPercent(25)}"`);
    assert(formatPercent(-10.5) === '-%10,50', `formatPercent(-10.5) -> "${formatPercent(-10.5)}"`);
    assert(formatPercent(0) === '%0,00', `formatPercent(0) -> "${formatPercent(0)}"`);
    assert(formatPercent(null) === '-', 'formatPercent(null) -> "-"');

    assert(true, 'Test 8: Yüzdelik değişim ve biçimlendirme testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 8 hatası:', err.message);
  }

  // ==========================================================================
  // Test 9: Kısmi Toplam Testleri (calculatePortfolioSummary, ADR-013)
  // ==========================================================================
  try {
    const items: PortfolioCalculationItem[] = [
      // 1. Kayıt: 10 gram, Fiyat: 3000 TL (300000 kuruş), Maliyet: 28000 TL (2800000 kuruş) -> Değer: 30000 TL
      { id: '1', quantity: 10, totalCostMinor: 2800000, buyPriceMinor: 300000 },
      // 2. Kayıt: 5 gram, Fiyat: 3000 TL (300000 kuruş), Maliyet: 16000 TL (1600000 kuruş) -> Değer: 15000 TL
      { id: '2', quantity: 5, totalCostMinor: 1600000, buyPriceMinor: 300000 },
      // 3. Kayıt: Fiyatı BULUNAMAYAN kayıt (ADR-013), Maliyet: 5000 TL (500000 kuruş)
      { id: '3', quantity: 2, totalCostMinor: 500000, buyPriceMinor: null },
    ];

    const summary = calculatePortfolioSummary(items);

    // Genel toplam maliyet: 28000 + 16000 + 5000 = 49000 TL (4900000 kuruş)
    assert(summary.totalCostMinor === 4900000, 'calculatePortfolioSummary: Toplam maliyet 49.000 TL.');

    // Fiyatı olan kayıtların güncel değeri: 30000 + 15000 = 45000 TL (4500000 kuruş)
    assert(summary.totalCurrentValueMinor === 4500000, 'calculatePortfolioSummary: Fiyatı olanların güncel değeri 45.000 TL.');

    // ADR-013 Kuralı: Eşleşen maliyet yalnızca fiyatı bilinenlerin toplamıdır: 28000 + 16000 = 44000 TL (4400000 kuruş)
    assert(summary.matchedCostMinor === 4400000, 'calculatePortfolioSummary: Eşleşen maliyet 44.000 TL.');

    // Net Kâr: 45000 - 44000 = +1000 TL (fiyatı olmayan 5000 TL maliyet kârı haksız yere -4000 zarara düşürmedi!)
    assert(summary.totalProfitLossMinor === 100000, 'calculatePortfolioSummary: ADR-013 uyarınca net kâr +1.000 TL.');

    // Kısmi bayrakları
    assert(summary.isPartial === true, 'calculatePortfolioSummary: isPartial = true işaretlendi.');
    assert(summary.hasMissingPrice === true, 'calculatePortfolioSummary: hasMissingPrice = true işaretlendi.');
    assert(summary.unpricedEntries === 1, 'calculatePortfolioSummary: 1 adet fiyatı olmayan kayıt belirlendi.');
    assert(summary.pricedEntries === 2, 'calculatePortfolioSummary: 2 adet fiyatı olan kayıt belirlendi.');

    assert(true, 'Test 9: Kısmi portföy toplamı ve ADR-013 eksik fiyat koruma testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 9 hatası:', err.message);
  }

  // ==========================================================================
  // Test 10: Hata Dönüştürme Testleri (normalizeError, isAppError)
  // ==========================================================================
  try {
    // Ağ hatası
    const networkErr = normalizeError(new Error('Network request failed'));
    assert(networkErr.code === 'NETWORK_ERROR' && networkErr.retryable === true, 'normalizeError: Ağ hatası NETWORK_ERROR olarak dönüştü.');

    // Bilinmeyen genel hata
    const genericErr = normalizeError(new Error('Kritik SQL sorgu hatası: syntax error at line 1'));
    assert(
      !genericErr.userMessage.includes('SQL') && genericErr.code === 'UNKNOWN_ERROR',
      'normalizeError: SQL hata ayrıntısı kullanıcıya sızdırılmadı, genel mesaj gösterildi.'
    );

    // Zaten AppError olan nesne
    assert(isAppError(networkErr), 'isAppError: AppError tipi başarıyla doğrulandı.');
    assert(!isAppError({ foo: 'bar' }), 'isAppError: Rastgele nesne AppError değil.');

    assert(true, 'Test 10: Hata dönüştürme ve güvenlik maskeleme testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 10 hatası:', err.message);
  }

  // ==========================================================================
  // Test 11: Ürün Etkinlik Kuralları Testleri (is_active, is_display)
  // ==========================================================================
  try {
    interface MockProduct {
      id: string;
      name: string;
      is_active: boolean;
      is_display: boolean;
    }

    const mockCatalog: MockProduct[] = [
      { id: '1', name: 'Gram Altın', is_active: true, is_display: true },
      { id: '2', name: 'Çeyrek Altın', is_active: true, is_display: true },
      { id: '3', name: 'Eski Ürün (Pasif)', is_active: false, is_display: false },
      { id: '4', name: 'Gizli Ürün', is_active: true, is_display: false },
    ];

    // Portföye eklenebilir ürünler: hem is_active hem is_display true olmalıdır
    const activePortfolioProducts = mockCatalog.filter((p) => p.is_active && p.is_display);
    assert(activePortfolioProducts.length === 2, 'Ürün etkinlik kuralı: Yalnızca aktif ve görünür ürünler listelendi.');
    assert(!activePortfolioProducts.some((p) => !p.is_active), 'Pasif ürünler başarıyla elendi.');

    assert(true, 'Test 11: Ürün etkinlik ve görünürlük filtreleme testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 11 hatası:', err.message);
  }

  // ==========================================================================
  // Test 12: Eski (Stale) Fiyat Belirleme Testleri (15 Dakika Eşiği)
  // ==========================================================================
  try {
    const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 dakika (900.000 ms)

    function checkPriceStale(updatedAtIso: string, now: Date = new Date()): boolean {
      const updatedTime = new Date(updatedAtIso).getTime();
      return now.getTime() - updatedTime > STALE_THRESHOLD_MS;
    }

    const now = new Date('2026-10-22T14:30:00Z');

    // 5 dakika önceki fiyat -> Taze (Stale değil)
    const freshIso = '2026-10-22T14:25:00Z';
    assert(!checkPriceStale(freshIso, now), 'checkPriceStale: 5 dakika önceki fiyat taze kabul edildi.');

    // 20 dakika önceki fiyat -> Bayat (Stale)
    const staleIso = '2026-10-22T14:10:00Z';
    assert(checkPriceStale(staleIso, now), 'checkPriceStale: 20 dakika önceki fiyat bayat (stale) kabul edildi.');

    // Portföy özeti stale davranışı
    const staleItems: PortfolioCalculationItem[] = [
      { id: '1', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 120000, isStale: true },
      { id: '2', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 120000, isStale: false },
    ];
    const staleSummary = calculatePortfolioSummary(staleItems);
    assert(staleSummary.isStale === true, 'calculatePortfolioSummary: Portföyde en az bir bayat fiyat varken isStale = true oldu.');
    assert(staleSummary.staleEntries === 1, 'calculatePortfolioSummary: staleEntries = 1 olarak sayıldı.');

    assert(true, 'Test 12: Eski fiyat belirleme ve 15 dakika eşiği testleri başarıyla geçti.');
  } catch (err: any) {
    console.error('Test 12 hatası:', err.message);
  }

  console.log(`\nFaz 14 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
