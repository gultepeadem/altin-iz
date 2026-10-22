/**
 * Altın İz — Portföy Özeti ve Kısmi Toplam Hesaplayıcı (Domain)
 * src/domain/calculations/portfolioSummary.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 13
 * Karar Referansları:
 * - ADR-007 (Minor Para Birimi)
 * - ADR-010 (Portföy Değerleme Yöntemi)
 * - ADR-013 (Fiyat Bulunamadığında Kısmi Portföy Davranışı)
 * - ADR-014 (Eski Fiyat Davranışı)
 * - ADR-032 (Sayısal Hassasiyet)
 *
 * Kritik İş Kuralları:
 * 1. Fiyatı olmayan kayıt için asla 0 TL güncel değer kabul edilmez (ADR-013).
 * 2. Bir veya daha fazla kaydın fiyatı yoksa `isPartial: true` olarak işaretlenir.
 * 3. Kısmi portföyde genel kâr-zarar, yalnızca fiyatı bilinen kayıtların ödenen maliyetiyle
 *    eşleştirilerek hesaplanır; fiyatı bilinmeyen kaydın maliyeti kâr-zararı haksız yere
 *    zarara uğratmaz (ADR-013).
 * 4. Asla kayıt bazındaki kâr-zarar yüzdeleri toplanmaz! Genel kâr-zarar tutarı ile
 *    eşleşen toplam maliyet oranlanır.
 */

import { calculatePercentageChange } from './percentage.ts';
import { roundToMinor } from './money.ts';

export interface PortfolioCalculationItem {
  id: string;
  quantity: number;
  totalCostMinor: number;
  buyPriceMinor: number | null;
  isStale?: boolean;
}

export interface PortfolioSummaryResult {
  /** Portföydeki tüm kayıtların ödenen toplam maliyeti (Kuruş) */
  totalCostMinor: number;
  /** Portföydeki tüm kayıtların ödenen toplam maliyeti (TL) */
  totalCost: number;

  /** Yalnızca fiyatı olan kayıtların tahmini güncel bozdurma değeri (Kuruş) */
  totalCurrentValueMinor: number;
  /** Yalnızca fiyatı olan kayıtların tahmini güncel bozdurma değeri (TL) */
  totalCurrentValue: number;

  /** Yalnızca güncel fiyatı mevcut kayıtların ödenen maliyet toplamı (Kuruş) */
  matchedCostMinor: number;
  /** Yalnızca güncel fiyatı mevcut kayıtların ödenen maliyet toplamı (TL) */
  matchedCost: number;

  /** Eşleşen kayıtlara göre hesaplanan net kâr veya zarar (Kuruş) */
  totalProfitLossMinor: number | null;
  /** Eşleşen kayıtlara göre hesaplanan net kâr veya zarar (TL) */
  totalProfitLoss: number | null;

  /** Eşleşen kayıtlara göre portföyün genel getiri yüzdesi */
  totalProfitLossPercentage: number | null;

  /** Fiyatı olmayan en az bir kayıt var mı? */
  hasMissingPrice: boolean;
  /** Portföy toplamı kısmi mi? (ADR-013) */
  isPartial: boolean;
  /** Fiyatı 15 dakikadan eski en az bir kayıt var mı? (ADR-014) */
  isStale: boolean;

  /** Toplam kayıt sayısı */
  totalEntries: number;
  /** Fiyatı başarıyla alınan kayıt sayısı */
  pricedEntries: number;
  /** Fiyatı temin edilemeyen kayıt sayısı */
  unpricedEntries: number;
}

/**
 * Kullanıcının portföy kayıtları üzerinden konsolide özet ve kâr/zarar hesaplar.
 */
export function calculatePortfolioSummary(
  items: PortfolioCalculationItem[]
): PortfolioSummaryResult {
  let totalCostMinor = 0;
  let totalCurrentValueMinor = 0;
  let matchedCostMinor = 0;

  let pricedEntries = 0;
  let unpricedEntries = 0;
  let isStale = false;

  for (const item of items) {
    const cost = item.totalCostMinor ?? 0;
    totalCostMinor += cost;

    const hasValidPrice =
      item.buyPriceMinor !== null &&
      item.buyPriceMinor !== undefined &&
      !isNaN(item.buyPriceMinor) &&
      item.buyPriceMinor > 0;

    if (hasValidPrice) {
      pricedEntries++;
      matchedCostMinor += cost;
      const currentValue = roundToMinor(item.quantity * item.buyPriceMinor!);
      totalCurrentValueMinor += currentValue;

      if (item.isStale) {
        isStale = true;
      }
    } else {
      unpricedEntries++;
    }
  }

  const totalEntries = items.length;
  const hasMissingPrice = unpricedEntries > 0;
  const isPartial = hasMissingPrice;

  // Hiç kayıt yoksa veya hiçbir kaydın fiyatı alınamadıysa
  if (totalEntries === 0 || pricedEntries === 0) {
    return {
      totalCostMinor,
      totalCost: totalCostMinor / 100,
      totalCurrentValueMinor: 0,
      totalCurrentValue: 0,
      matchedCostMinor: 0,
      matchedCost: 0,
      totalProfitLossMinor: null,
      totalProfitLoss: null,
      totalProfitLossPercentage: null,
      hasMissingPrice,
      isPartial,
      isStale: false,
      totalEntries,
      pricedEntries,
      unpricedEntries,
    };
  }

  // Kâr/Zarar: Yalnızca fiyatı olan kayıtların güncel değeri ile bu kayıtların maliyeti karşılaştırılır
  const totalProfitLossMinor = totalCurrentValueMinor - matchedCostMinor;
  const totalProfitLossPercentage = calculatePercentageChange(
    totalProfitLossMinor,
    matchedCostMinor
  );

  return {
    totalCostMinor,
    totalCost: totalCostMinor / 100,
    totalCurrentValueMinor,
    totalCurrentValue: totalCurrentValueMinor / 100,
    matchedCostMinor,
    matchedCost: matchedCostMinor / 100,
    totalProfitLossMinor,
    totalProfitLoss: totalProfitLossMinor / 100,
    totalProfitLossPercentage,
    hasMissingPrice,
    isPartial,
    isStale,
    totalEntries,
    pricedEntries,
    unpricedEntries,
  };
}
