/**
 * Altın İz — Ana Sayfa Veri Modelleri
 * src/models/home.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 15 (Ana Sayfa)
 * Karar Referansları:
 * - ADR-007 (Minor Para Birimi - Kuruş)
 * - ADR-010 (Portföy Değerleme Yöntemi)
 * - ADR-013 (Fiyat Bulunamadığında Kısmi / Kullanılamıyor Durumu)
 * - ADR-014 (Eski Fiyat Davranışı)
 */

import type { GoldProduct } from './goldProduct.ts';
import type { GoldPrice } from './goldPrice.ts';
import type { PortfolioSummaryResult } from '../domain/calculations/portfolioSummary.ts';

export const FEATURED_PRODUCT_CODES = {
  GRAM_GOLD: 'GRAM_GOLD',
  QUARTER_GOLD_NEW: 'QUARTER_GOLD_NEW',
  OUNCE_GOLD: 'OUNCE_GOLD',
} as const;

/**
 * Ana sayfada öne çıkarılan tekil fiyat kartı modeli
 */
export interface HomeFeaturedPrice {
  product: GoldProduct;
  price: GoldPrice | null;
  isStale: boolean;
  hasPrice: boolean;
}

/**
 * Öne çıkarılan fiyatların konsolide piyasa durumu:
 * - 'fresh': Tüm öne çıkarılan fiyatlar mevcut ve güncel (canlı).
 * - 'stale': Tüm fiyatlar mevcut ancak en az bir ürün 15 dakikadan eski (ADR-014).
 * - 'partial': Bazı ürünlerin fiyatı var fakat en az bir ürünün fiyatı eksik (ADR-013).
 * - 'unavailable': Hiçbir öne çıkarılan ürünün geçerli fiyatı temin edilemedi.
 */
export type HomePriceStatus = 'fresh' | 'stale' | 'partial' | 'unavailable';

/**
 * Portföy özetinin konsolide durumu:
 * - 'fresh': Portföydeki tüm kayıtların fiyatları mevcut ve güncel.
 * - 'partial': Portföydeki bazı kayıtların fiyatı bulunamadı, kısmi kâr/zarar hesaplandı (ADR-013).
 * - 'stale': Portföydeki bazı kayıtlar 15 dakikadan eski fiyatla hesaplandı (ADR-014).
 * - 'empty': Kullanıcının henüz portföy kaydı yok.
 */
export type HomePortfolioStatus = 'fresh' | 'partial' | 'stale' | 'empty';

/**
 * Ana Sayfa Konsolide Veri Modeli
 */
export interface HomeData {
  /** Gram Altın (GRAM_GOLD) öne çıkan fiyatı */
  gramGold: HomeFeaturedPrice | null;
  /** Çeyrek Altın Yeni Tarihli (QUARTER_GOLD_NEW) öne çıkan fiyatı */
  quarterGold: HomeFeaturedPrice | null;
  /** Ons Altın (OUNCE_GOLD) uluslararası gösterge fiyatı */
  ounceGold: HomeFeaturedPrice | null;

  /** Kullanıcının portföy özeti (kullanıcı giriş yapmamışsa veya boşsa güvenli varsayılan özet) */
  portfolioSummary: PortfolioSummaryResult;

  /** Öne çıkarılan ürünler arasındaki en son fiyat güncelleme zamanı (ISO metni) */
  lastPriceTime: string | null;

  /** Öne çıkarılan piyasa fiyatlarının genel durumu */
  priceStatus: HomePriceStatus;

  /** Portföyün genel durumu */
  portfolioStatus: HomePortfolioStatus;

  /** Piyasa fiyatlarında eski (stale) veri var mı? (ADR-014) */
  isPriceStale: boolean;

  /** Öne çıkarılan en az bir ürünün fiyatı eksik mi? (ADR-013) */
  hasMissingPrice: boolean;
}

/**
 * Öne çıkarılan ürün fiyatlarının genel durumunu belirler (Pure function)
 */
export function consolidatePriceStatus(
  featuredPrices: (HomeFeaturedPrice | null)[]
): HomePriceStatus {
  // Geçerli ürünler
  const validItems = featuredPrices.filter((item): item is HomeFeaturedPrice => item !== null);

  if (validItems.length === 0) {
    return 'unavailable';
  }

  const pricedItems = validItems.filter((item) => item.hasPrice);

  // Hiçbir ürünün fiyatı yoksa
  if (pricedItems.length === 0) {
    return 'unavailable';
  }

  // Bazı ürünlerin fiyatı var ama hepsi değilse (ADR-013)
  if (pricedItems.length < validItems.length) {
    return 'partial';
  }

  // Tüm fiyatlar mevcut; en az birinde bayatlık var mı? (ADR-014)
  const hasStale = pricedItems.some((item) => item.isStale);
  if (hasStale) {
    return 'stale';
  }

  return 'fresh';
}

/**
 * Portföy özetinin durumunu belirler (Pure function)
 */
export function consolidatePortfolioStatus(
  summary: PortfolioSummaryResult
): HomePortfolioStatus {
  if (summary.totalEntries === 0) {
    return 'empty';
  }

  if (summary.hasMissingPrice || summary.isPartial) {
    return 'partial';
  }

  if (summary.isStale) {
    return 'stale';
  }

  return 'fresh';
}

/**
 * Verilen fiyat listesindeki en son geçerli zaman damgasını bulur (Pure function)
 */
export function determineLastPriceTime(
  prices: (GoldPrice | null | undefined)[]
): string | null {
  let latestTime: string | null = null;
  let latestMs = 0;

  for (const p of prices) {
    if (!p) continue;
    const timeCandidate = p.sourcePriceAt || p.fetchedAt;
    if (timeCandidate) {
      const ms = new Date(timeCandidate).getTime();
      if (!isNaN(ms) && ms > latestMs) {
        latestMs = ms;
        latestTime = timeCandidate;
      }
    }
  }

  return latestTime;
}
