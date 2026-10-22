/**
 * Altın İz — Ana Sayfa Veri Servisi (homeService)
 * src/services/homeService.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 15 (Ana Sayfa)
 * Karar Referansları:
 * - ADR-010 (Portföy Değerleme Yöntemi)
 * - ADR-013 (Fiyat Bulunamadığında Kısmi / Kullanılamıyor Durumu)
 * - ADR-014 (Eski Fiyat Davranışı)
 * - ADR-017 (Fiyat Kaynakları ve Ürün Eşleştirmesi)
 *
 * İş Kuralları:
 * 1. Gram Altın ('GRAM_GOLD') öncelikli fiyatı getirilir.
 * 2. Çeyrek Altın ('QUARTER_GOLD_NEW' - Yeni Tarihli) ürün fiyatı getirilir.
 * 3. Ons Altın ('OUNCE_GOLD') uluslararası gösterge fiyatı getirilir.
 * 4. Kullanıcının portföy özeti portföy servisinden çekilir; oturum yoksa veya boşsa güvenli varsayılan döner.
 * 5. Öne çıkan fiyatların en son güncellenme zamanı ('lastPriceTime') tespit edilir.
 * 6. Tam, kısmi, eski ve kullanılamıyor durumları konsolide edilir.
 */

import { supabase } from '@/lib/supabase';
import { mapRowToGoldProduct, type GoldProduct } from '@/models/goldProduct';
import type { GoldPrice } from '@/models/goldPrice';
import { goldPriceService } from './goldPriceService';
import { portfolioService } from './portfolioService';
import { calculatePortfolioSummary } from '@/domain/calculations/portfolioSummary';
import {
  type HomeData,
  type HomeFeaturedPrice,
  FEATURED_PRODUCT_CODES,
  consolidatePriceStatus,
  consolidatePortfolioStatus,
  determineLastPriceTime,
} from '@/models/home';
import { normalizeError } from '@/utils/normalizeError';

export { FEATURED_PRODUCT_CODES };

export const homeService = {
  /**
   * Ana sayfa için öne çıkarılan 3 temel ürünü ('GRAM_GOLD', 'QUARTER_GOLD_NEW', 'OUNCE_GOLD')
   * ve en son geçerli fiyatlarını getirir.
   */
  async getFeaturedProductsWithPrices(
    staleThresholdMinutes = 15
  ): Promise<{
    gramGold: HomeFeaturedPrice | null;
    quarterGold: HomeFeaturedPrice | null;
    ounceGold: HomeFeaturedPrice | null;
  }> {
    try {
      const targetCodes = [
        FEATURED_PRODUCT_CODES.GRAM_GOLD,
        FEATURED_PRODUCT_CODES.QUARTER_GOLD_NEW,
        FEATURED_PRODUCT_CODES.OUNCE_GOLD,
      ];

      // 1. Öne çıkan ürünleri veritabanından getir
      const { data: productsData, error: prodError } = await supabase
        .from('gold_products')
        .select('*')
        .in('code', targetCodes)
        .eq('is_active', true);

      if (prodError) {
        throw normalizeError(prodError);
      }

      const productMap = new Map<string, GoldProduct>();
      for (const row of productsData || []) {
        const prod = mapRowToGoldProduct(row);
        productMap.set(prod.code, prod);
      }

      // 2. Canlı fiyatları getir
      const latestPrices = await goldPriceService.getLatestPrices(staleThresholdMinutes);
      const priceMap = new Map<string, GoldPrice>();
      for (const price of latestPrices) {
        priceMap.set(price.productId, price);
      }

      // 3. Her kod için HomeFeaturedPrice nesnesi oluştur
      const buildFeatured = (code: string): HomeFeaturedPrice | null => {
        const product = productMap.get(code);
        if (!product) return null;

        const price = priceMap.get(product.id) || null;
        const hasPrice =
          price !== null &&
          price.buyPriceMinor !== null &&
          price.buyPriceMinor !== undefined &&
          !isNaN(price.buyPriceMinor) &&
          price.buyPriceMinor > 0;

        const isStale = price
          ? price.status === 'stale' || price.isProviderStale
          : false;

        return {
          product,
          price,
          isStale,
          hasPrice,
        };
      };

      return {
        gramGold: buildFeatured(FEATURED_PRODUCT_CODES.GRAM_GOLD),
        quarterGold: buildFeatured(FEATURED_PRODUCT_CODES.QUARTER_GOLD_NEW),
        ounceGold: buildFeatured(FEATURED_PRODUCT_CODES.OUNCE_GOLD),
      };
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Ana Sayfa için konsolide tüm veri modelini tek çağrıda döner:
   * - Öne çıkarılan fiyatlar
   * - Portföy özeti
   * - En son fiyat zamanı
   * - Konsolide fiyat ve portföy durumları
   */
  async getHomeData(
    userId?: string,
    staleThresholdMinutes = 15
  ): Promise<HomeData> {
    try {
      // Fiyatlar ve portföy özetini paralel olarak çek
      const [featuredPrices, portfolioResult] = await Promise.allSettled([
        this.getFeaturedProductsWithPrices(staleThresholdMinutes),
        portfolioService.getEntriesWithValuation(userId),
      ]);

      // 1. Öne çıkan ürün fiyatları
      let gramGold: HomeFeaturedPrice | null = null;
      let quarterGold: HomeFeaturedPrice | null = null;
      let ounceGold: HomeFeaturedPrice | null = null;

      if (featuredPrices.status === 'fulfilled') {
        gramGold = featuredPrices.value.gramGold;
        quarterGold = featuredPrices.value.quarterGold;
        ounceGold = featuredPrices.value.ounceGold;
      }

      // 2. Portföy özeti (Hata durumunda veya oturum yoksa güvenli boş özet döner)
      let portfolioSummary = calculatePortfolioSummary([]);
      if (portfolioResult.status === 'fulfilled') {
        portfolioSummary = portfolioResult.value.summary;
      }

      const allFeatured = [gramGold, quarterGold, ounceGold];

      // 3. En son fiyat güncelleme zamanını tespit et
      const pricesForTime = allFeatured
        .map((f) => f?.price)
        .filter((p): p is GoldPrice => Boolean(p));

      const lastPriceTime = determineLastPriceTime(pricesForTime);

      // 4. Durumları konsolide et
      const priceStatus = consolidatePriceStatus(allFeatured);
      const portfolioStatus = consolidatePortfolioStatus(portfolioSummary);

      const isPriceStale = allFeatured.some((f) => f?.isStale === true);
      const hasMissingPrice = allFeatured.some((f) => f === null || !f.hasPrice);

      return {
        gramGold,
        quarterGold,
        ounceGold,
        portfolioSummary,
        lastPriceTime,
        priceStatus,
        portfolioStatus,
        isPriceStale,
        hasMissingPrice,
      };
    } catch (err) {
      throw normalizeError(err);
    }
  },
};
