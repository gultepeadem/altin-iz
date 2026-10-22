/**
 * Altın İz — Portföy Form Doğrulayıcıları (Domain Validation)
 * src/domain/validation/portfolioValidation.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 15
 * API Referansı: docs/API.md Bölüm 16.2
 *
 * Sorumluluklar:
 * 1. Tarih ayrıştırması (GG.AA.YYYY veya YYYY-MM-DD -> ISO YYYY-MM-DD)
 * 2. Gelecek tarih engeli (purchase_date <= bugünün tarihi)
 * 3. Türkçe para girişi ayrıştırması (TL -> Kuruş / minor unit)
 * 4. Metin sınır kontrolleri (Alış yeri max 100, Not max 500)
 */

/**
 * Türkçe tarih girdisini (GG.AA.YYYY veya YYYY-MM-DD) YYYY-MM-DD formatına çevirir.
 * Geçersiz ise null döner.
 */
export function parseDateInputToISO(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim();

  // GG.AA.YYYY veya GG/AA/YYYY veya GG-AA-YYYY
  const trMatch = clean.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (trMatch) {
    const day = parseInt(trMatch[1], 10);
    const month = parseInt(trMatch[2], 10);
    const year = parseInt(trMatch[3], 10);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      const yyyy = String(year).padStart(4, '0');
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return null;
  }

  // YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      return clean;
    }
    return null;
  }

  return null;
}

/**
 * Tarihin bugünden sonra (gelecekte) olup olmadığını kontrol eder.
 */
export function isFutureDate(isoDate: string): boolean {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return true;
  const [year, month, day] = isoDate.split('-').map(Number);
  const purchaseDate = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return purchaseDate > today;
}

/**
 * Kullanıcı tarafından girilen TL tutarını kuruş cinsinden tamsayıya (minor unit) çevirir.
 * Türkçe virgül (',') ve nokta ('.') formatlarını destekler.
 * Sıfır, negatif veya geçersiz girişlerde null döner.
 * Örn: "3.140,50" -> 314050 kuruş
 */
export function parseMoneyInputToMinor(input: string): number | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim().replace(/\s+/g, '');
  if (!clean) return null;

  let normalized = clean;
  if (clean.includes('.') && clean.includes(',')) {
    if (clean.indexOf('.') < clean.indexOf(',')) {
      normalized = clean.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    normalized = clean.replace(',', '.');
  }

  const num = Number(normalized);
  if (isNaN(num) || !isFinite(num) || num <= 0) return null;
  return Math.round(num * 100);
}
