/**
 * Altın İz — Altın Fiyat Modeli ve Durumları
 * src/models/goldPrice.ts
 *
 * Veritabanı Tablosu: public.gold_prices
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 12.5
 * Karar Referansları: ADR-007 (Kuruş/minor), ADR-013 (Fiyat yoksa null), ADR-014 (Eski fiyat)
 */

import type { GoldProduct, MeasurementUnit } from './goldProduct';

/**
 * Fiyat Tazelik ve Geçerlilik Durumları:
 * - 'live': Fiyat güncel (son 15 dk içinde), sağlayıcı taze ve alış/satış tam.
 * - 'stale': Fiyat 15 dakikadan eski veya sağlayıcı gecikmeli/eski olarak işaretlemiş (ADR-014).
 * - 'partial': Alış veya satış fiyatından yalnızca biri mevcut.
 * - 'unavailable': Ürün için geçerli hiçbir fiyat bulunamadı (ADR-013).
 */
export type PriceFreshnessStatus = 'live' | 'stale' | 'partial' | 'unavailable';

export interface GoldPrice {
  id: number;
  productId: string;
  sourceId: string;
  buyPriceMinor: number | null;
  sellPriceMinor: number | null;
  buyPrice: number | null;
  sellPrice: number | null;
  currencyCode: string;
  priceUnit: MeasurementUnit;
  dailyChangePercent: number | null;
  dayLowMinor: number | null;
  dayHighMinor: number | null;
  dayLow: number | null;
  dayHigh: number | null;
  sourcePriceAt: string;
  fetchedAt: string;
  isProviderStale: boolean;
  isValid: boolean;
  status: PriceFreshnessStatus;
}

export interface ProductWithPrice {
  product: GoldProduct;
  price: GoldPrice | null;
}

/**
 * Fiyatın tazelik durumunu hesaplar.
 */
export function determinePriceStatus(
  buyPriceMinor: number | null,
  sellPriceMinor: number | null,
  sourcePriceAt: string,
  isProviderStale: boolean,
  staleThresholdMinutes = 15
): PriceFreshnessStatus {
  // Fiyat yoksa veya her iki taraf da null ise
  if (buyPriceMinor === null && sellPriceMinor === null) {
    return 'unavailable';
  }

  // Alış veya satıştan yalnızca biri varsa
  if (buyPriceMinor === null || sellPriceMinor === null) {
    return 'partial';
  }

  // Sağlayıcı eski olarak işaretlemişse
  if (isProviderStale) {
    return 'stale';
  }

  // Kaynak zamanı eşik süresinden daha eskiyse (varsayılan: 15 dakika)
  const priceTime = new Date(sourcePriceAt).getTime();
  if (isNaN(priceTime)) {
    return 'stale';
  }

  const elapsedMinutes = (Date.now() - priceTime) / (60 * 1000);
  if (elapsedMinutes > staleThresholdMinutes) {
    return 'stale';
  }

  return 'live';
}

/**
 * Supabase ham veritabanı satırını uygulama modeline dönüştürür.
 */
export function mapRowToGoldPrice(row: any, staleThresholdMinutes = 15): GoldPrice {
  const buyMinor = row.buy_price_minor !== null && row.buy_price_minor !== undefined ? Number(row.buy_price_minor) : null;
  const sellMinor = row.sell_price_minor !== null && row.sell_price_minor !== undefined ? Number(row.sell_price_minor) : null;
  const lowMinor = row.day_low_minor !== null && row.day_low_minor !== undefined ? Number(row.day_low_minor) : null;
  const highMinor = row.day_high_minor !== null && row.day_high_minor !== undefined ? Number(row.day_high_minor) : null;

  const isProviderStale = Boolean(row.is_provider_stale);
  const sourcePriceAt = row.source_price_at ?? row.created_at ?? new Date().toISOString();

  const status = determinePriceStatus(buyMinor, sellMinor, sourcePriceAt, isProviderStale, staleThresholdMinutes);

  return {
    id: Number(row.id),
    productId: row.product_id,
    sourceId: row.source_id,
    buyPriceMinor: buyMinor,
    sellPriceMinor: sellMinor,
    buyPrice: buyMinor !== null ? buyMinor / 100 : null,
    sellPrice: sellMinor !== null ? sellMinor / 100 : null,
    currencyCode: (row.currency_code ?? 'TRY').trim(),
    priceUnit: (row.price_unit ?? 'piece') as MeasurementUnit,
    dailyChangePercent: row.daily_change_percent !== null && row.daily_change_percent !== undefined ? Number(row.daily_change_percent) : null,
    dayLowMinor: lowMinor,
    dayHighMinor: highMinor,
    dayLow: lowMinor !== null ? lowMinor / 100 : null,
    dayHigh: highMinor !== null ? highMinor / 100 : null,
    sourcePriceAt,
    fetchedAt: row.fetched_at ?? row.created_at ?? new Date().toISOString(),
    isProviderStale,
    isValid: Boolean(row.is_valid ?? true),
    status,
  };
}
