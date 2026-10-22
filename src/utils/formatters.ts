/**
 * Altın İz — Fiyat, Para ve Tarih Formatlayıcı Yardımcıları
 * src/utils/formatters.ts
 */

/**
 * Kuruş tutarını (minor unit) biçimlendirilmiş Türk Lirası veya döviz metnine dönüştürür.
 * Değer null veya undefined ise '-' döndürür (ADR-013 uyarınca asla 0 TL göstermez).
 * Örnek: 302050 -> "3.020,50 TL"
 */
export function formatMoney(minorAmount: number | null | undefined, currency = 'TRY'): string {
  if (minorAmount === null || minorAmount === undefined || isNaN(minorAmount)) {
    return '-';
  }

  const amount = minorAmount / 100;
  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currencySymbol = currency.toUpperCase() === 'TRY' ? 'TL' : currency.toUpperCase();
  return `${formatted} ${currencySymbol}`;
}

/**
 * Yüzdelik fiyat değişim oranını formatlar.
 * Örnek: 1.25 -> "+%1,25", -0.45 -> "-%0,45", 0 -> "%0,00"
 */
export function formatPercent(rate: number | null | undefined): string {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return '-';
  }

  const sign = rate > 0 ? '+' : rate < 0 ? '-' : '';
  const absVal = Math.abs(rate).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${sign}%${absVal}`;
}

/**
 * ISO tarih metnini Türkçe yerel tarih ve saat formatına dönüştürür.
 * Örnek: "2026-10-22T10:15:00Z" -> "22.10.2026 13:15"
 */
export function formatDateTime(isoDateString?: string | null): string {
  if (!isoDateString) return '-';

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
