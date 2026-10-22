/**
 * Altın İz — Yüzdelik Değişim Hesaplayıcı (Domain)
 * src/domain/calculations/percentage.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 13
 * Karar Referansı: ADR-010 (Portföy Değerleme Yöntemi), ADR-032 (Sayısal Hassasiyet)
 *
 * Kurallar:
 * - Formül: (Kâr-Zarar / Toplam Maliyet) * 100
 * - Sıfıra bölme koruması: Maliyet <= 0 ise yüzde 0 döner (hata vermez).
 * - Sonuç ondalıklı sayı olarak 4 basamak hassasiyetle döndürülür.
 */

/**
 * İki tutar arasındaki yüzdelik değişim oranını hesaplar.
 *
 * @param changeMinor Kâr veya zarar tutarı (Kuruş cinsinden, negatif veya pozitif)
 * @param baseMinor Baz alınan ödenen maliyet tutarı (Kuruş cinsinden)
 * @returns Yüzdelik oran (örnek: 12.50 -> %12.50) veya veri eksikse null
 */
export function calculatePercentageChange(
  changeMinor: number | null | undefined,
  baseMinor: number | null | undefined
): number | null {
  if (
    changeMinor === null ||
    changeMinor === undefined ||
    isNaN(changeMinor) ||
    baseMinor === null ||
    baseMinor === undefined ||
    isNaN(baseMinor)
  ) {
    return null;
  }

  // Sıfıra bölme koruması
  if (baseMinor <= 0) {
    return 0;
  }

  const rawPercent = (changeMinor / baseMinor) * 100;
  // 4 ondalık basamağa yuvarla (ör. 12.3456)
  return Number(rawPercent.toFixed(4));
}
