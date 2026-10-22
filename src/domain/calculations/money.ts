/**
 * Altın İz — Para ve Kuruş Dönüşüm Yardımcıları (Domain)
 * src/domain/calculations/money.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 13 ve Bölüm 14
 * Karar Referansı: ADR-007 (Kuruş / Minor Para Modeli), ADR-032 (Sayısal Hassasiyet)
 *
 * Güvenlik ve Doğruluk Kuralları:
 * - Türk Lirası tutarları veritabanında ve etki alanında kuruş (minor unit) cinsinden tamsayı olarak saklanır.
 * - 1 TL = 100 Kuruş.
 * - JavaScript IEEE 754 kayan noktalı sayı hatalarını önlemek için ara hesaplamalarda en yakın kuruşa yuvarlanır (`Math.round`).
 * - JavaScript güvenli tam sayı sınırı: Number.MAX_SAFE_INTEGER = 9,007,199,254,740,991 kuruş (~90 Trilyon TL).
 */

/**
 * JavaScript güvenli tam sayı para üst sınırı (Kuruş cinsinden ~90 Trilyon TL)
 */
export const MAX_SAFE_MONEY_MINOR = Number.MAX_SAFE_INTEGER;

/**
 * Türk Lirası ondalıklı tutarını kuruş cinsinden tamsayıya (minor unit) dönüştürür.
 * Kayan nokta küsurat hatalarını engellemek için en yakın kuruşa yuvarlar.
 * Örnek: 3120.55 -> 312055
 */
export function toMinorUnits(amount: number): number {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new TypeError('Geçersiz para tutarı: Sayısal bir değer bekleniyor.');
  }
  return Math.round(amount * 100);
}

/**
 * Kuruş cinsinden tamsayı tutarını (minor unit) Türk Lirası ondalıklı değerine dönüştürür.
 * Örnek: 312055 -> 3120.55
 */
export function fromMinorUnits(minor: number): number {
  if (typeof minor !== 'number' || isNaN(minor)) {
    throw new TypeError('Geçersiz kuruş tutarı: Sayısal bir değer bekleniyor.');
  }
  return minor / 100;
}

/**
 * Sayısal bir tutarı en yakın kuruş tamsayısına yuvarlar.
 * Örnek: 1250.4 -> 1250, 1250.6 -> 1251
 */
export function roundToMinor(amount: number): number {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new TypeError('Geçersiz tutar: Sayısal bir değer bekleniyor.');
  }
  return Math.round(amount);
}

/**
 * Verilen kuruş değerinin JavaScript güvenli tam sayı sınırları içinde olup olmadığını doğrular.
 */
export function isSafeMoney(minor: number): boolean {
  return (
    typeof minor === 'number' &&
    !isNaN(minor) &&
    Number.isSafeInteger(minor) &&
    Math.abs(minor) <= MAX_SAFE_MONEY_MINOR
  );
}
