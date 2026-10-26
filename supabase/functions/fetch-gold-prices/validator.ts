/**
 * Altın İz - Fiyat Verisi Doğrulama ve Dönüştürme Servisi
 * supabase/functions/fetch-gold-prices/validator.ts
 */

import type {
  ProductMappingInfo,
  RawPriceItem,
  ValidatedPriceRecord,
  ValidationSummary,
} from './types.ts';

/**
 * Ondalıklı veya metin formatındaki TL tutarını güvenle kuruşa (tam sayı) çevirir.
 * Sıfır, negatif, geçersiz veya boş değerler için null döner.
 * Örnek: 3020.50 TL -> 302050 kuruş
 */
export function toMinorUnits(amount: unknown): number | null {
  if (amount === null || amount === undefined || amount === '') {
    return null;
  }

  let num: number;
  if (typeof amount === 'number') {
    num = amount;
  } else if (typeof amount === 'string') {
    const clean = amount.trim().replace(/[^\d.,]/g, '');
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
    num = parseFloat(normalized);
  } else {
    return null;
  }

  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }

  // IEEE-754 kayan noktalı sayı yuvarlama hatasını engellemek için Math.round
  return Math.round(num * 100);
}

/**
 * Zaman damgasını doğrular ve makul olmayan gelecek tarihleri engeller.
 * Varsayılan olarak sunucu saatinden 10 dakikadan daha ileri bir tarih reddedilir.
 */
export function parseDateSafe(
  dateVal: unknown,
  maxFutureMinutes = 10
): { valid: boolean; isoDate: string; error?: string } {
  if (!dateVal) {
    return { valid: true, isoDate: new Date().toISOString() };
  }

  let d: Date;
  if (dateVal instanceof Date) {
    d = dateVal;
  } else if (typeof dateVal === 'number') {
    // Unix saniye mi yoksa milisaniye mi kontrolü
    d = dateVal < 10000000000 ? new Date(dateVal * 1000) : new Date(dateVal);
  } else if (typeof dateVal === 'string') {
    d = new Date(dateVal.trim());
  } else {
    return { valid: false, isoDate: '', error: 'Desteklenmeyen zaman damgası formatı.' };
  }

  if (isNaN(d.getTime())) {
    return { valid: false, isoDate: '', error: 'Zaman damgası geçerli bir tarih formatı değil.' };
  }

  const now = Date.now();
  const futureLimit = now + maxFutureMinutes * 60 * 1000;

  if (d.getTime() > futureLimit) {
    return {
      valid: false,
      isoDate: d.toISOString(),
      error: 'Fiyat zaman damgası makul olmayan bir gelecek tarihi içeriyor.',
    };
  }

  return { valid: true, isoDate: d.toISOString() };
}

/**
 * Sağlayıcıdan gelen ham yanıt içinden fiyat dizisini güvenle ayıklar.
 */
export function extractPriceList(rawResponse: unknown): {
  success: boolean;
  items: RawPriceItem[];
  error?: string;
} {
  if (!rawResponse || (typeof rawResponse !== 'object' && !Array.isArray(rawResponse))) {
    return {
      success: false,
      items: [],
      error: 'Sağlayıcı yanıtı geçerli bir JSON nesnesi veya dizisi değil.',
    };
  }

  // 1. Doğrudan dizi olarak gelmişse
  if (Array.isArray(rawResponse)) {
    return { success: true, items: rawResponse as RawPriceItem[] };
  }

  const obj = rawResponse as Record<string, unknown>;

  // 2. data, items, result veya rates altında dizi olarak gelmişse
  if (Array.isArray(obj.data)) {
    return { success: true, items: obj.data as RawPriceItem[] };
  }
  if (Array.isArray(obj.items)) {
    return { success: true, items: obj.items as RawPriceItem[] };
  }
  if (Array.isArray(obj.result)) {
    return { success: true, items: obj.result as RawPriceItem[] };
  }
  if (Array.isArray(obj.rates)) {
    return { success: true, items: obj.rates as RawPriceItem[] };
  }

  // 3. rates veya data nesne olarak gelmişse (örn: { "GRAM_ALTIN": { buying: 3000, ... } })
  const targetMap = (typeof obj.rates === 'object' && obj.rates !== null
    ? obj.rates
    : typeof obj.data === 'object' && obj.data !== null
    ? obj.data
    : null) as Record<string, unknown> | null;

  if (targetMap && !Array.isArray(targetMap)) {
    const extracted: RawPriceItem[] = [];
    for (const [key, val] of Object.entries(targetMap)) {
      if (typeof val === 'object' && val !== null) {
        extracted.push({
          symbol: key,
          ...(val as Record<string, unknown>),
        } as RawPriceItem);
      }
    }
    if (extracted.length > 0) {
      return { success: true, items: extracted };
    }
  }

  return {
    success: false,
    items: [],
    error: 'Fiyat listesi sağlayıcı yanıtında beklenen yapıda bulunamadı.',
  };
}

/**
 * Tek bir fiyat öğesini tüm iş kurallarına göre doğrular ve dönüştürür.
 */
export function validateSinglePriceItem(
  item: RawPriceItem,
  sourceId: string,
  mappingsMap: Map<string, ProductMappingInfo>,
  fetchedAt: string,
  fetchRunId?: string
): ValidatedPriceRecord {
  const rawSymbol = typeof item.symbol === 'string' ? item.symbol.trim() : '';

  // Kural 1: Sembol boş olamaz
  if (!rawSymbol) {
    return {
      product_id: '00000000-0000-0000-0000-000000000000',
      source_id: sourceId,
      buy_price_minor: null,
      sell_price_minor: null,
      currency_code: 'TRY',
      price_unit: 'piece',
      source_price_at: fetchedAt,
      fetched_at: fetchedAt,
      fetch_run_id: fetchRunId,
      is_provider_stale: false,
      is_valid: false,
      validation_message: 'Dış sembol (symbol) alanı boş veya tanımsız.',
    };
  }

  // Kural 2: Sembolün aktif bir eşleştirmesi bulunmalıdır (Büyük/küçük harf duyarsız arama)
  const mapping =
    mappingsMap.get(rawSymbol) ||
    mappingsMap.get(rawSymbol.toUpperCase()) ||
    mappingsMap.get(rawSymbol.toLowerCase());
  if (!mapping) {
    return {
      product_id: '00000000-0000-0000-0000-000000000000',
      source_id: sourceId,
      buy_price_minor: null,
      sell_price_minor: null,
      currency_code: 'TRY',
      price_unit: 'piece',
      source_price_at: fetchedAt,
      fetched_at: fetchedAt,
      fetch_run_id: fetchRunId,
      is_provider_stale: false,
      is_valid: false,
      validation_message: `Dış sembol (${rawSymbol}) için aktif ürün eşleştirmesi bulunamadı.`,
    };
  }

  if (!mapping.is_active) {
    return {
      product_id: mapping.product_id,
      source_id: sourceId,
      buy_price_minor: null,
      sell_price_minor: null,
      currency_code: 'TRY',
      price_unit: mapping.product?.measurement_unit ?? 'piece',
      source_price_at: fetchedAt,
      fetched_at: fetchedAt,
      fetch_run_id: fetchRunId,
      is_provider_stale: false,
      is_valid: false,
      validation_message: `Dış sembol (${rawSymbol}) eşleştirmesi devre dışı (is_active=false).`,
    };
  }

  const rawItemObj = item as unknown as Record<string, unknown>;
  const rawBuy = item.buying ?? rawItemObj.buy_price ?? rawItemObj.alis;
  const rawSell = item.selling ?? rawItemObj.sell_price ?? rawItemObj.satis;

  // Kural 3: Sıfır ve negatif fiyat kontrolü
  const isZeroOrNegative = (v: unknown): boolean => {
    if (v === null || v === undefined || v === '') return false;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) && n <= 0;
  };

  if (isZeroOrNegative(rawBuy) || isZeroOrNegative(rawSell)) {
    return {
      product_id: mapping.product_id,
      source_id: sourceId,
      buy_price_minor: null,
      sell_price_minor: null,
      currency_code: 'TRY',
      price_unit: mapping.product?.measurement_unit ?? 'piece',
      source_price_at: fetchedAt,
      fetched_at: fetchedAt,
      fetch_run_id: fetchRunId,
      is_provider_stale: false,
      is_valid: false,
      validation_message: 'Fiyat değeri sıfır veya negatif olamaz.',
    };
  }

  // Kural 4: Kuruşa çevrim ve pozitiflik
  const buyMinor = toMinorUnits(rawBuy);
  const sellMinor = toMinorUnits(rawSell);

  // Kural 5: Alış veya satış fiyatından en az biri dolu ve geçerli olmalıdır
  if (buyMinor === null && sellMinor === null) {
    return {
      product_id: mapping.product_id,
      source_id: sourceId,
      buy_price_minor: null,
      sell_price_minor: null,
      currency_code: 'TRY',
      price_unit: mapping.product?.measurement_unit ?? 'piece',
      source_price_at: fetchedAt,
      fetched_at: fetchedAt,
      fetch_run_id: fetchRunId,
      is_provider_stale: false,
      is_valid: false,
      validation_message: 'Alış veya satış fiyatından en az biri pozitif bir sayı olmalıdır.',
    };
  }

  // Kural 6: Para birimi doğrulaması (varsayılan TRY, ONS/Uluslararası için USD)
  let currencyCode = 'TRY';
  if (
    rawSymbol.toUpperCase() === 'ONS' ||
    mapping.product?.measurement_unit === 'ounce' ||
    mapping.product?.code === 'OUNCE_GOLD' ||
    String(rawBuy ?? '').includes('$') ||
    String(rawSell ?? '').includes('$') ||
    String(rawItemObj.currency ?? '').toUpperCase() === 'USD' ||
    String(rawItemObj.name ?? '').includes('USD')
  ) {
    currencyCode = 'USD';
  } else if (typeof rawItemObj.currency === 'string' && rawItemObj.currency.trim().length === 3) {
    currencyCode = rawItemObj.currency.trim().toUpperCase();
  }

  // Kural 7: Ürün ölçü birimi doğrulaması (piece, gram, ounce)
  const productUnit = mapping.product?.measurement_unit;
  let priceUnit: 'piece' | 'gram' | 'ounce' = 'piece';

  if (productUnit) {
    priceUnit = productUnit;
  } else if (rawSymbol.toUpperCase() === 'ONS') {
    priceUnit = 'ounce';
  } else if (rawSymbol.includes('GRAM') || rawSymbol.includes('AYAR') || rawSymbol.includes('KULCE')) {
    priceUnit = 'gram';
  }

  // Kural 8: Zaman damgası doğrulaması ve gelecek zaman kontrolü
  const rawDate = item.updatedAt ?? rawItemObj.timestamp ?? rawItemObj.date;
  const dateResult = parseDateSafe(rawDate);
  if (!dateResult.valid) {
    return {
      product_id: mapping.product_id,
      source_id: sourceId,
      buy_price_minor: buyMinor,
      sell_price_minor: sellMinor,
      currency_code: currencyCode,
      price_unit: priceUnit,
      source_price_at: fetchedAt,
      fetched_at: fetchedAt,
      fetch_run_id: fetchRunId,
      is_provider_stale: false,
      is_valid: false,
      validation_message: dateResult.error ?? 'Geçersiz zaman damgası.',
    };
  }

  // Kural 9: Günlük değişim ve tavan/taban fiyatları (aykırı > ±50% değerleri engelle)
  const rawChange = item.changeRate ?? rawItemObj.change_percent ?? rawItemObj.degisim;
  let dailyChangePercent: number | null = null;
  if (rawChange !== null && rawChange !== undefined && rawChange !== '') {
    const cNum = typeof rawChange === 'number'
      ? rawChange
      : parseFloat(String(rawChange).replace('%', '').replace(/[^\d.,+-]/g, '').replace(',', '.').trim());
    if (Number.isFinite(cNum) && Math.abs(cNum) <= 50) {
      dailyChangePercent = Math.round(cNum * 100) / 100;
    }
  }

  const dayLowMinor = toMinorUnits(rawItemObj.day_low ?? rawItemObj.low ?? rawItemObj.en_dusuk);
  const dayHighMinor = toMinorUnits(rawItemObj.day_high ?? rawItemObj.high ?? rawItemObj.en_yuksek);

  // Kural 10: Sağlayıcının eski/gecikmeli veri işareti
  const isProviderStale = Boolean(
    rawItemObj.is_stale || rawItemObj.stale || rawItemObj.delayed || rawItemObj.gecikmeli
  );

  return {
    product_id: mapping.product_id,
    source_id: sourceId,
    buy_price_minor: buyMinor,
    sell_price_minor: sellMinor,
    currency_code: currencyCode,
    price_unit: priceUnit,
    daily_change_percent: dailyChangePercent,
    day_low_minor: dayLowMinor,
    day_high_minor: dayHighMinor,
    source_price_at: dateResult.isoDate,
    fetched_at: fetchedAt,
    fetch_run_id: fetchRunId,
    is_provider_stale: isProviderStale,
    is_valid: true,
    validation_message: null,
  };
}

/**
 * Sağlayıcı yanıtını baştan sona işler, tüm ürünleri doğrular,
 * sayaçları hesaplar ve price_fetch_runs durumunu ('success', 'partial', 'failed') belirler.
 */
export function validateAndTransformPrices(
  rawResponse: unknown,
  sourceId: string,
  mappings: ProductMappingInfo[],
  fetchedAt = new Date().toISOString(),
  fetchRunId?: string
): ValidationSummary {
  const mappingsMap = new Map<string, ProductMappingInfo>();
  for (const m of mappings) {
    if (m.external_symbol) {
      mappingsMap.set(m.external_symbol.trim(), m);
    }
  }

  const listResult = extractPriceList(rawResponse);
  if (!listResult.success || listResult.items.length === 0) {
    return {
      status: 'failed',
      productsReceived: 0,
      productsSaved: 0,
      productsRejected: 0,
      validRecords: [],
      rejectedRecords: [],
      allRecords: [],
      errorCode: 'INVALID_PRICE_LIST',
      errorMessage: listResult.error ?? 'Fiyat listesi boş veya ayrıştırılamadı.',
    };
  }

  const allRecords: ValidatedPriceRecord[] = [];
  const validRecords: ValidatedPriceRecord[] = [];
  const rejectedRecords: ValidatedPriceRecord[] = [];

  for (const item of listResult.items) {
    const record = validateSinglePriceItem(item, sourceId, mappingsMap, fetchedAt, fetchRunId);
    allRecords.push(record);
    if (record.is_valid) {
      validRecords.push(record);
    } else {
      rejectedRecords.push(record);
    }
  }

  const productsReceived = listResult.items.length;
  const productsSaved = validRecords.length;
  const productsRejected = rejectedRecords.length;

  let status: 'success' | 'partial' | 'failed';
  let errorCode: string | null = null;
  let errorMessage: string | null = null;

  if (productsSaved > 0 && productsRejected === 0) {
    status = 'success';
  } else if (productsSaved > 0 && productsRejected > 0) {
    status = 'partial';
    errorCode = 'PARTIAL_PRODUCTS_REJECTED';
    errorMessage = `${productsRejected} adet ürün doğrulama kurallarını geçemedi.`;
  } else {
    status = 'failed';
    errorCode = 'ALL_PRODUCTS_REJECTED';
    errorMessage = 'Hiçbir ürün doğrulama kurallarını geçemedi, geçerli fiyat bulunamadı.';
  }

  return {
    status,
    productsReceived,
    productsSaved,
    productsRejected,
    validRecords,
    rejectedRecords,
    allRecords,
    errorCode,
    errorMessage,
  };
}
