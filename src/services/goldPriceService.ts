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

// Aşırı Edge Function isteğini önlemek için bellek içi son senkronizasyon zamanı
let lastSyncTimestamp = 0;
const MIN_SYNC_INTERVAL_MS = 2 * 60 * 1000; // 2 dakika

export const goldPriceService = {
  /**
   * Sunucu tarafındaki fetch-gold-prices Edge Function'ını tetikler.
   * Güvenlik Kuralı (SECURITY.md Bölüm 8.6): İstemci doğrudan dış kaynağa bağlanmaz
   * ve doğrudan veritabanına fiyat yazamaz. Tüm doğrulama ve kayıt sunucu tarafında yapılır.
   */
  async triggerServerPriceFetch(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && now - lastSyncTimestamp < MIN_SYNC_INTERVAL_MS) {
      return false; // Çok sık tetiklemeyi önle
    }

    try {
      lastSyncTimestamp = now;
      const { data, error } = await supabase.functions.invoke('fetch-gold-prices', {
        body: { force },
      });

      if (error) {
        return false;
      }

      return data?.success === true;
    } catch {
      return false;
    }
  },

  /**
   * Tüm ürünler için en son geçerli fiyat kayıtlarını getirir.
   * Fiyatlar boşsa veya eskiyse arka planda Edge Function tetikler.
   */
  async getLatestPrices(staleThresholdMinutes = 15, forceSync = false): Promise<GoldPrice[]> {
    try {
      if (forceSync) {
        await this.triggerServerPriceFetch(true);
      }

      // En güncel fiyat kayıtlarını al
      let { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .eq('is_valid', true)
        .order('fetched_at', { ascending: false });

      if (error) {
        throw normalizeError(error);
      }

      // Eğer veritabanında hiç fiyat yoksa veya mevcut fiyatlar eskiyse sunucu tarafında güncelleme tetikle
      const hasPrices = data && data.length > 0;
      let shouldSync = !hasPrices;

      if (hasPrices && !forceSync) {
        const latestTime = new Date(data![0].fetched_at).getTime();
        const diffMinutes = (Date.now() - latestTime) / (1000 * 60);
        if (diffMinutes > staleThresholdMinutes) {
          shouldSync = true;
        }
      }

      if (shouldSync && !forceSync) {
        const didSync = await this.triggerServerPriceFetch(false);
        if (didSync) {
          // Güncel verileri tekrar oku
          const refetch = await supabase
            .from('gold_prices')
            .select('*')
            .eq('is_valid', true)
            .order('fetched_at', { ascending: false });
          if (!refetch.error && refetch.data) {
            data = refetch.data;
          }
        }
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
  async getProductsWithPrices(
    staleThresholdMinutes = 15,
    forceSync = false
  ): Promise<ProductWithPrice[]> {
    try {
      const [products, prices] = await Promise.all([
        goldProductService.getPriceDisplayProducts(),
        this.getLatestPrices(staleThresholdMinutes, forceSync),
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
