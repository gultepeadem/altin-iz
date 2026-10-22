/**
 * Altın İz — Güncel Fiyat Okuma Servisi (goldPriceService)
 * src/services/goldPriceService.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 12.5 ve Bölüm 18.1
 * Karar Referansları: ADR-013 (Fiyat yoksa null), ADR-014 (Eski fiyat davranışı)
 * Veritabanı: public.gold_prices (RLS: gold_prices_read_valid, is_valid = true)
 *
 * Güvenlik ve Doğruluk Kuralları:
 * - Fiyatı bulunamayan ürün için asla '0 TL' dönülmez, null dönülür (ADR-013).
 * - Bir ürün için asla başka bir ürünün fiyatı yedek veya tahmin olarak kullanılamaz!
 * - Fiyat 15 dakikadan eskiyse 'stale' olarak işaretlenir ve arayüze bildirilir (ADR-014).
 * - Bu servis doğrudan dış sağlayıcıya bağlanmaz; veritabanındaki doğrulanmış fiyatları okur.
 */

import { supabase } from '@/lib/supabase';
import { type GoldPrice, mapRowToGoldPrice, type ProductWithPrice } from '@/models/goldPrice';
import { goldProductService } from './goldProductService';
import { normalizeError } from '@/utils/normalizeError';

export const goldPriceService = {
  /**
   * Tüm ürünler için en son geçerli fiyat kayıtlarını getirir.
   * RLS politikası uyarınca yalnızca doğrulanmış (is_valid = true) kayıtlar döner.
   */
  async getLatestPrices(staleThresholdMinutes = 15): Promise<GoldPrice[]> {
    try {
      // En güncel fiyat kayıtlarını al
      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .eq('is_valid', true)
        .order('fetched_at', { ascending: false });

      if (error) {
        throw normalizeError(error);
      }

      // Her ürün (product_id) için yalnızca en son geçerli fiyatı sakla
      const latestPriceByProduct = new Map<string, any>();
      for (const row of data || []) {
        if (!latestPriceByProduct.has(row.product_id)) {
          latestPriceByProduct.set(row.product_id, row);
        }
      }

      return Array.from(latestPriceByProduct.values()).map((row) =>
        mapRowToGoldPrice(row, staleThresholdMinutes)
      );
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Belirtilen tek bir ürünün en son geçerli fiyatını getirir.
   * Fiyat bulunamazsa kesinlikle null döner; başka ürün fiyatı bağlanmaz.
   */
  async getLatestPriceForProduct(
    productId: string,
    staleThresholdMinutes = 15
  ): Promise<GoldPrice | null> {
    try {
      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .eq('product_id', productId)
        .eq('is_valid', true)
        .order('fetched_at', { ascending: false })
        .limit(1);

      if (error) {
        throw normalizeError(error);
      }

      if (!data || data.length === 0) {
        return null;
      }

      return mapRowToGoldPrice(data[0], staleThresholdMinutes);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Fiyat ekranı için açık ürünleri en son fiyatlarıyla birlikte birleşik getirir.
   * Fiyatı olmayan ürünler için price: null döner (asla 0 dönülmez veya başka ürün bağlanmaz).
   */
  async getProductsWithPrices(staleThresholdMinutes = 15): Promise<ProductWithPrice[]> {
    try {
      const [products, prices] = await Promise.all([
        goldProductService.getPriceDisplayProducts(),
        this.getLatestPrices(staleThresholdMinutes),
      ]);

      const priceMap = new Map<string, GoldPrice>();
      for (const p of prices) {
        priceMap.set(p.productId, p);
      }

      return products.map((product) => ({
        product,
        price: priceMap.get(product.id) ?? null,
      }));
    } catch (err) {
      throw normalizeError(err);
    }
  },
};
