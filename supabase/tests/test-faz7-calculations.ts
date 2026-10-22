/**
 * Faz 7: Hesaplama Etki Alanı Fonksiyonları ve Sayısal Hassasiyet Testleri
 * supabase/tests/test-faz7-calculations.ts
 *
 * docs/TODO.md Faz 7 Birim Testleri:
 * 1. Tam adet hesabı
 * 2. Üç ondalıklı gram hesabı
 * 3. Kâr sonucu
 * 4. Zarar sonucu
 * 5. Başa baş sonucu
 * 6. Yüzde hesabı ve sıfıra bölme koruması
 * 7. Büyük para değeri ve güvenli tam sayı sınırı
 * 8. Fiyat yok durumu (ADR-013)
 * 9. Eski fiyat durumu (ADR-014)
 * 10. Kısmi portföy toplamı (ADR-013)
 * 11. Her kayıt yüzdesinin toplanmadığının doğrulanması
 * 12. Gram ve adet miktar doğrulama kuralları
 */

import {
  toMinorUnits,
  fromMinorUnits,
  roundToMinor,
  isSafeMoney,
  MAX_SAFE_MONEY_MINOR,
} from '../../src/domain/calculations/money.ts';

import {
  calculatePercentageChange,
} from '../../src/domain/calculations/percentage.ts';

import {
  calculatePurchaseEstimate,
  calculateRedemptionEstimate,
  calculateEntryValuation,
} from '../../src/domain/calculations/valuation.ts';

import {
  calculatePortfolioSummary,
  type PortfolioCalculationItem,
} from '../../src/domain/calculations/portfolioSummary.ts';

import {
  validateQuantity,
  parseQuantity,
} from '../../src/domain/validation/quantityValidation.ts';

function runTests() {
  console.log('--- Faz 7: Hesaplama Etki Alanı Fonksiyonları Birim Testleri ---\n');
  let passed = 0;
  const total = 12;

  // Test 1: Tam Adet Hesabı
  try {
    // 2 adet Çeyrek Altın, satış fiyatı: 5.145,00 TL = 514500 kuruş
    const estimate = calculatePurchaseEstimate(2, 514500);

    if (
      estimate.success &&
      estimate.estimatedTotalMinor === 1029000 &&
      estimate.estimatedTotal === 10290
    ) {
      console.log('✓ Test 1 Passed: Tam adet hesabı doğru çalıştı (2 adet × 5.145,00 TL = 10.290,00 TL).');
      passed++;
    } else {
      console.error('✗ Test 1 Failed: Tam adet hesabı hatalı:', estimate);
    }
  } catch (err) {
    console.error('✗ Test 1 Error:', err);
  }

  // Test 2: Üç Ondalıklı Gram Hesabı
  try {
    // 1.375 gram altın, alış fiyatı: 3.120,50 TL = 312050 kuruş
    // 1.375 * 312050 = 429068.75 -> roundToMinor: 429069 kuruş = 4.290,69 TL
    const estimate = calculateRedemptionEstimate(1.375, 312050);
    const roundCheck = roundToMinor(1250.6) === 1251 && roundToMinor(1250.4) === 1250;

    if (
      estimate.success &&
      estimate.estimatedTotalMinor === 429069 &&
      estimate.estimatedTotal === 4290.69 &&
      roundCheck
    ) {
      console.log('✓ Test 2 Passed: Üç ondalıklı gram hesabı ve kuruş yuvarlama doğru çalıştı (1.375 gr × 3.120,50 TL = 4.290,69 TL).');
      passed++;
    } else {
      console.error('✗ Test 2 Failed: Gram hesabı hatalı:', estimate);
    }
  } catch (err) {
    console.error('✗ Test 2 Error:', err);
  }

  // Test 3: Kâr Sonucu
  try {
    // 1 adet altın, Alış fiyatı (güncel): 12.000,00 TL (1200000 kuruş), Maliyet: 10.000,00 TL (1000000 kuruş)
    const valuation = calculateEntryValuation(1, 1200000, 1000000);

    if (
      valuation.status === 'profit' &&
      valuation.profitLossMinor === 200000 &&
      valuation.profitLoss === 2000 &&
      valuation.profitLossPercentage === 20
    ) {
      console.log('✓ Test 3 Passed: Kâr hesabı doğru çalıştı (+2.000 TL, %20,00 kâr).');
      passed++;
    } else {
      console.error('✗ Test 3 Failed: Kâr hesabı hatalı:', valuation);
    }
  } catch (err) {
    console.error('✗ Test 3 Error:', err);
  }

  // Test 4: Zarar Sonucu
  try {
    // 1 adet altın, Alış fiyatı (güncel): 8.500,00 TL (850000 kuruş), Maliyet: 10.000,00 TL (1000000 kuruş)
    const valuation = calculateEntryValuation(1, 850000, 1000000);

    if (
      valuation.status === 'loss' &&
      valuation.profitLossMinor === -150000 &&
      valuation.profitLoss === -1500 &&
      valuation.profitLossPercentage === -15
    ) {
      console.log('✓ Test 4 Passed: Zarar hesabı doğru çalıştı (-1.500 TL, -%15,00 zarar).');
      passed++;
    } else {
      console.error('✗ Test 4 Failed: Zarar hesabı hatalı:', valuation);
    }
  } catch (err) {
    console.error('✗ Test 4 Error:', err);
  }

  // Test 5: Başa Baş Sonucu
  try {
    // Alış fiyatı = Maliyet = 10.000,00 TL
    const valuation = calculateEntryValuation(1, 1000000, 1000000);

    if (
      valuation.status === 'even' &&
      valuation.profitLossMinor === 0 &&
      valuation.profitLoss === 0 &&
      valuation.profitLossPercentage === 0
    ) {
      console.log('✓ Test 5 Passed: Başa baş (kâr/zarar 0 TL, %0) hesabı doğru çalıştı.');
      passed++;
    } else {
      console.error('✗ Test 5 Failed: Başa baş hesabı hatalı:', valuation);
    }
  } catch (err) {
    console.error('✗ Test 5 Error:', err);
  }

  // Test 6: Yüzde Hesabı ve Sıfıra Bölme Koruması
  try {
    const normal = calculatePercentageChange(25000, 100000); // 250 TL / 1000 TL = %25
    const zeroDivision = calculatePercentageChange(5000, 0); // Maliyet 0 TL iken
    const negativeBase = calculatePercentageChange(5000, -100);

    if (normal === 25 && zeroDivision === 0 && negativeBase === 0) {
      console.log('✓ Test 6 Passed: Yüzde hesabı ve sıfıra bölme koruması başarıyla doğrulandı.');
      passed++;
    } else {
      console.error('✗ Test 6 Failed: Yüzde hesabı hatalı:', { normal, zeroDivision, negativeBase });
    }
  } catch (err) {
    console.error('✗ Test 6 Error:', err);
  }

  // Test 7: Büyük Para Değeri ve Güvenli Tam Sayı Sınırı
  try {
    const largeMoney = 5000000.75; // 5 Milyon TL
    const largeMinor = toMinorUnits(largeMoney); // 500000075 kuruş
    const backToTL = fromMinorUnits(largeMinor);

    const safeTest1 = isSafeMoney(largeMinor);
    const safeTest2 = isSafeMoney(MAX_SAFE_MONEY_MINOR);
    const unsafeTest = isSafeMoney(MAX_SAFE_MONEY_MINOR + 10);

    if (
      largeMinor === 500000075 &&
      backToTL === 5000000.75 &&
      safeTest1 &&
      safeTest2 &&
      !unsafeTest
    ) {
      console.log(`✓ Test 7 Passed: Büyük para değeri (5 Milyon TL) ve MAX_SAFE_INTEGER (~90 Trilyon TL) sınırı doğrulandı.`);
      passed++;
    } else {
      console.error('✗ Test 7 Failed: Büyük para hesabı hatalı:', { largeMinor, safeTest1, unsafeTest });
    }
  } catch (err) {
    console.error('✗ Test 7 Error:', err);
  }

  // Test 8: Fiyat Yok Durumu (ADR-013 Uyarınca Asla 0 TL Üretilmez)
  try {
    const estimate1 = calculatePurchaseEstimate(2, null);
    const estimate2 = calculateRedemptionEstimate(1.5, undefined);
    const valuation = calculateEntryValuation(1, null, 1000000);

    if (
      !estimate1.success &&
      estimate1.estimatedTotalMinor === null &&
      !estimate2.success &&
      estimate2.estimatedTotalMinor === null &&
      valuation.status === 'unavailable' &&
      valuation.currentValueMinor === null &&
      valuation.profitLossMinor === null
    ) {
      console.log('✓ Test 8 Passed: ADR-013 kuralı doğrulandı (Fiyat yokken kesinlikle 0 TL üretilmez, null döner).');
      passed++;
    } else {
      console.error('✗ Test 8 Failed: Fiyat yok durumu hatalı:', { estimate1, valuation });
    }
  } catch (err) {
    console.error('✗ Test 8 Error:', err);
  }

  // Test 9: Eski Fiyat Durumu (ADR-014)
  try {
    const items: PortfolioCalculationItem[] = [
      {
        id: '1',
        quantity: 1,
        totalCostMinor: 300000,
        buyPriceMinor: 310000,
        isStale: true, // 15 dakikadan eski fiyat
      },
    ];

    const summary = calculatePortfolioSummary(items);

    if (summary.isStale === true && summary.totalCurrentValueMinor === 310000) {
      console.log('✓ Test 9 Passed: ADR-014 eski fiyat durumu portföy özetinde (isStale = true) başarıyla işaretlendi.');
      passed++;
    } else {
      console.error('✗ Test 9 Failed: Eski fiyat tespiti hatalı:', summary);
    }
  } catch (err) {
    console.error('✗ Test 9 Error:', err);
  }

  // Test 10: Kısmi Portföy Toplamı (ADR-013)
  try {
    // 3 kayıt: 2'sinin fiyatı var, 1'inin fiyatı yok (null)
    const items: PortfolioCalculationItem[] = [
      { id: '1', quantity: 2, totalCostMinor: 600000, buyPriceMinor: 320000 }, // 640000 güncel değer (+40000 kâr)
      { id: '2', quantity: 1, totalCostMinor: 500000, buyPriceMinor: 510000 }, // 510000 güncel değer (+10000 kâr)
      { id: '3', quantity: 1, totalCostMinor: 2000000, buyPriceMinor: null },  // Fiyat YOK!
    ];

    const summary = calculatePortfolioSummary(items);

    // Beklenen davranış:
    // Toplam maliyet: 600000 + 500000 + 2000000 = 3.100.000 kuruş (31.000 TL)
    // Eşleşen maliyet: 600000 + 500000 = 1.100.000 kuruş (11.000 TL)
    // Güncel değer: 640000 + 510000 = 1.150.000 kuruş (11.500 TL)
    // Kâr/Zarar: 1.150.000 - 1.100.000 = +50.000 kuruş (+500 TL, asla 3. kaydın 20.000 TL'si düşülüp -19.500 TL zarar gösterilmez!)
    // isPartial: true, hasMissingPrice: true
    if (
      summary.isPartial === true &&
      summary.hasMissingPrice === true &&
      summary.totalCostMinor === 3100000 &&
      summary.matchedCostMinor === 1100000 &&
      summary.totalCurrentValueMinor === 1150000 &&
      summary.totalProfitLossMinor === 50000 &&
      summary.pricedEntries === 2 &&
      summary.unpricedEntries === 1
    ) {
      console.log('✓ Test 10 Passed: ADR-013 kısmi portföy toplamı ve eşleşen maliyet bazlı kâr-zarar doğru çalıştı.');
      passed++;
    } else {
      console.error('✗ Test 10 Failed: Kısmi portföy hesaplaması hatalı:', summary);
    }
  } catch (err) {
    console.error('✗ Test 10 Error:', err);
  }

  // Test 11: Her Kayıt Yüzdesinin Toplanmadığının Doğrulanması (Ağırlıklı Portföy Getirisi)
  try {
    // 2 kayıt:
    // Kayıt A: Maliyet: 1.000 TL (100000 kuruş), Değer: 2.000 TL (200000 kuruş) -> Kâr: +1.000 TL (%100 Kâr)
    // Kayıt B: Maliyet: 100.000 TL (10000000 kuruş), Değer: 101.000 TL (10100000 kuruş) -> Kâr: +1.000 TL (%1 Kâr)
    // Hatalı toplama: %100 + %1 = %101 (YANLIŞ!)
    // Doğru ağırlıklı hesap:
    // Toplam Maliyet = 101.000 TL
    // Toplam Kâr = +2.000 TL
    // Portföy Getirisi = (2000 / 101000) * 100 = %1.9802!
    const items: PortfolioCalculationItem[] = [
      { id: 'A', quantity: 1, totalCostMinor: 100000, buyPriceMinor: 200000 },
      { id: 'B', quantity: 1, totalCostMinor: 10000000, buyPriceMinor: 10100000 },
    ];

    const summary = calculatePortfolioSummary(items);
    const expectedPercentage = Number(((200000 / 10100000) * 100).toFixed(4)); // 1.9802

    if (
      summary.totalProfitLossMinor === 200000 &&
      summary.totalProfitLossPercentage === expectedPercentage &&
      summary.totalProfitLossPercentage !== 101
    ) {
      console.log(`✓ Test 11 Passed: Portföy getiri yüzdesinde tekil yüzdelerin toplanmadığı, ağırlıklı gerçek oran (%${summary.totalProfitLossPercentage}) doğrulandı.`);
      passed++;
    } else {
      console.error('✗ Test 11 Failed: Portföy getiri yüzdesi hatalı:', summary.totalProfitLossPercentage);
    }
  } catch (err) {
    console.error('✗ Test 11 Error:', err);
  }

  // Test 12: Gram ve Adet Miktar Doğrulama Kuralları
  try {
    const validPiece = validateQuantity(3, 'piece');
    const invalidPieceFractional = validateQuantity(2.5, 'piece'); // Adette küsurat olamaz!

    const validGram = validateQuantity(1.375, 'gram'); // 3 ondalık geçerli
    const invalidGramPrecision = validateQuantity(1.3754, 'gram'); // 4 ondalık geçersiz!

    const invalidNegative = validateQuantity(-2, 'gram');
    const invalidZero = validateQuantity(0, 'piece');

    const parsedComma = parseQuantity('2,75');
    const parsedDot = parseQuantity('3.125');
    const parsedInvalid = parseQuantity('abc');

    if (
      validPiece.isValid &&
      !invalidPieceFractional.isValid &&
      validGram.isValid &&
      !invalidGramPrecision.isValid &&
      !invalidNegative.isValid &&
      !invalidZero.isValid &&
      parsedComma === 2.75 &&
      parsedDot === 3.125 &&
      parsedInvalid === null
    ) {
      console.log('✓ Test 12 Passed: Gram (azami 3 ondalık) ve adet (tam sayı) miktar doğrulama kuralları eksiksiz doğrulandı.');
      passed++;
    } else {
      console.error('✗ Test 12 Failed: Miktar doğrulaması hatalı.');
    }
  } catch (err) {
    console.error('✗ Test 12 Error:', err);
  }

  console.log(`\n--- Test Sonucu: ${passed}/${total} Başarılı ---`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
