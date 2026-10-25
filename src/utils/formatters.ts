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

/**
 * YYYY-MM-DD veya ISO tarih metnini Türkçe standart GG.AA.YYYY formatına dönüştürür.
 * Örnek: "2026-08-20" -> "20.08.2026"
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';

  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}.${match[2]}.${match[1]}`;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Sayısal miktarı Türkçe standart formatta biçimlendirir.
 * Örnek: 4 -> "4", 1.25 -> "1,25"
 */
export function formatQuantity(quantity: number | null | undefined): string {
  if (quantity === null || quantity === undefined || isNaN(quantity)) {
    return '-';
  }
  return quantity.toLocaleString('tr-TR', {
    maximumFractionDigits: 3,
  });
}

/**
 * Rakam girişine göre otomatik GG.AA.YYYY formatında maskeleme yapar (otomatik nokta ekler).
 * Kullanıcı rakam yazdıkça gün ve ay sonrasına otomatik '.' ekler; silme durumunu destekler.
 * Örnek: "24102026" -> "24.10.2026"
 */
export function applyDateMask(text: string, previousText?: string): string {
  let cleanText = text;
  if (previousText && text.length < previousText.length && previousText.endsWith('.') && !text.endsWith('.')) {
    cleanText = text.slice(0, -1);
  }

  const digits = cleanText.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

/**
 * Türkçe karakterleri ve aksanları ASCII eşdeğerlerine normalize eden arama yardımcısı.
 * Kullanıcı "ce" veya "ceyrek" yazdığında "Çeyrek", "resat" yazdığında "Reşat", "kulce" yazdığında "Külçe" bulmasını sağlar.
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

