/**
 * Altın İz — Değerleme ve Tahmin Hesaplayıcı (Domain)
 * src/domain/calculations/valuation.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 13
 * Karar Referansları:
 * - ADR-010 (Portföy Değerleme Yöntemi: Miktar × Alış Fiyatı)
 * - ADR-011 (Hesaplama Ekranı: Satın Alma = Miktar × Satış, Bozdurma = Miktar × Alış)
 * - ADR-013 (Fiyat Yoksa 0 TL Kullanılmaz, null Döner)
 * - ADR-032 (Sayısal Hassasiyet ve Yuvarlama Kuralları)
 */

import { calculatePercentageChange } from './percentage.ts';
import { roundToMinor } from './money.ts';

export interface EstimateResult {
  success: boolean;
  estimatedTotalMinor: number | null;
  estimatedTotal: number | null;
  unitPriceMinor: number | null;
  error?: string;
}

export type ValuationStatus = 'profit' | 'loss' | 'even' | 'unavailable';

export interface EntryValuationResult {
  currentValueMinor: number | null;
  currentValue: number | null;
  profitLossMinor: number | null;
  profitLoss: number | null;
  profitLossPercentage: number | null;
  status: ValuationStatus;
}

/**
 * Satın alma tahmini fonksiyonu.
 * Formül: Miktar × Güncel Satış Fiyatı
 * Kural: Fiyat yoksa veya <= 0 ise asla 0 TL üretmez, hata/null döner (ADR-013).
 */
export function calculatePurchaseEstimate(
  quantity: number,
  sellPriceMinor: number | null | undefined
): EstimateResult {
  if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
    return {
      success: false,
      estimatedTotalMinor: null,
      estimatedTotal: null,
      unitPriceMinor: sellPriceMinor ?? null,
      error: 'Miktar sıfırdan büyük bir sayı olmalıdır.',
    };
  }

  // Fiyat yoksa hesap yapılmaz (ADR-013)
  if (sellPriceMinor === null || sellPriceMinor === undefined || isNaN(sellPriceMinor) || sellPriceMinor <= 0) {
    return {
      success: false,
      estimatedTotalMinor: null,
      estimatedTotal: null,
      unitPriceMinor: null,
      error: 'Güncel satış fiyatı bulunamadığı için hesaplama yapılamadı.',
    };
  }

  const estimatedTotalMinor = roundToMinor(quantity * sellPriceMinor);

  return {
    success: true,
    estimatedTotalMinor,
    estimatedTotal: estimatedTotalMinor / 100,
    unitPriceMinor: sellPriceMinor,
  };
}

/**
 * Bozdurma tahmini fonksiyonu.
 * Formül: Miktar × Güncel Alış Fiyatı
 * Kural: Fiyat yoksa veya <= 0 ise asla 0 TL üretmez, hata/null döner (ADR-013).
 */
export function calculateRedemptionEstimate(
  quantity: number,
  buyPriceMinor: number | null | undefined
): EstimateResult {
  if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
    return {
      success: false,
      estimatedTotalMinor: null,
      estimatedTotal: null,
      unitPriceMinor: buyPriceMinor ?? null,
      error: 'Miktar sıfırdan büyük bir sayı olmalıdır.',
    };
  }

  // Fiyat yoksa hesap yapılmaz (ADR-013)
  if (buyPriceMinor === null || buyPriceMinor === undefined || isNaN(buyPriceMinor) || buyPriceMinor <= 0) {
    return {
      success: false,
      estimatedTotalMinor: null,
      estimatedTotal: null,
      unitPriceMinor: null,
      error: 'Güncel alış fiyatı bulunamadığı için hesaplama yapılamadı.',
    };
  }

  const estimatedTotalMinor = roundToMinor(quantity * buyPriceMinor);

  return {
    success: true,
    estimatedTotalMinor,
    estimatedTotal: estimatedTotalMinor / 100,
    unitPriceMinor: buyPriceMinor,
  };
}

/**
 * Portföydeki tekil bir kayıt bazında tahmini değer ve kâr/zarar hesaplar.
 * Formüller:
 * - Tahmini Güncel Bozdurma Değeri = Miktar × Güncel Alış Fiyatı
 * - Kâr/Zarar = Tahmini Güncel Değer - Ödenen Toplam Tutar
 * - Değişim Yüzdesi = (Kâr/Zarar ÷ Ödenen Toplam Tutar) × 100
 */
export function calculateEntryValuation(
  quantity: number,
  currentBuyPriceMinor: number | null | undefined,
  totalCostMinor: number
): EntryValuationResult {
  // Fiyat yoksa 0 TL kabul edilmez, değerleme yapılamaz (ADR-013)
  if (
    currentBuyPriceMinor === null ||
    currentBuyPriceMinor === undefined ||
    isNaN(currentBuyPriceMinor) ||
    currentBuyPriceMinor <= 0
  ) {
    return {
      currentValueMinor: null,
      currentValue: null,
      profitLossMinor: null,
      profitLoss: null,
      profitLossPercentage: null,
      status: 'unavailable',
    };
  }

  const currentValueMinor = roundToMinor(quantity * currentBuyPriceMinor);
  const profitLossMinor = currentValueMinor - totalCostMinor;
  const profitLossPercentage = calculatePercentageChange(profitLossMinor, totalCostMinor);

  const status: ValuationStatus =
    profitLossMinor > 0 ? 'profit' : profitLossMinor < 0 ? 'loss' : 'even';

  return {
    currentValueMinor,
    currentValue: currentValueMinor / 100,
    profitLossMinor,
    profitLoss: profitLossMinor / 100,
    profitLossPercentage,
    status,
  };
}
