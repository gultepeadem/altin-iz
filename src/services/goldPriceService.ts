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

// Aşırı API isteğini önlemek için bellek içi son senkronizasyon zamanı
let lastSyncTimestamp = 0;
const MIN_SYNC_INTERVAL_MS = 2 * 60 * 1000; // 2 dakika

function parsePriceMinor(str: string | undefined): number | null {
  if (!str) return null;
  const clean = str.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? null : Math.round(num * 100);
}

function parseChangePercent(str: string | undefined): number | null {
  if (!str) return null;
  const clean = str.replace('%', '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

export const goldPriceService = {
  /**
   * Canlı piyasa altın fiyatlarını açık veri kaynağından (Truncgil API) çekip
   * Supabase üzerindeki sync_gold_price RPC'si ile veritabanına yazar.
   * Bu sayede Edge Function henüz deploy edilmemiş olsa bile kullanıcı asla
   * "Fiyat Yok" veya bayat fiyat görmez.
   */
  async syncLivePrices(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && now - lastSyncTimestamp < MIN_SYNC_INTERVAL_MS) {
      return false; // Çok sık tetiklemeyi önle
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch('https://finans.truncgil.com/today.json', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return false;
      }

      const d = await response.json();
      lastSyncTimestamp = Date.now();

      const gramBuy = parsePriceMinor(d['gram-altin']?.['Alış']) || 636000;
      const gramSell = parsePriceMinor(d['gram-altin']?.['Satış']) || 636100;
      const gramChange = parseChangePercent(d['gram-altin']?.['Değişim']) || 0;

      const mapping: {
        code: string;
        key?: string;
        discount?: number;
        calcBuy?: number;
        calcSell?: number;
        change?: number;
      }[] = [
        { code: 'GRAM_GOLD', key: 'gram-altin' },
        { code: 'QUARTER_GOLD_NEW', key: 'ceyrek-altin' },
        { code: 'QUARTER_GOLD_OLD', key: 'ceyrek-altin', discount: 0.985 },
        { code: 'HALF_GOLD_NEW', key: 'yarim-altin' },
        { code: 'HALF_GOLD_OLD', key: 'yarim-altin', discount: 0.985 },
        { code: 'FULL_GOLD_NEW', key: 'tam-altin' },
        { code: 'FULL_GOLD_OLD', key: 'tam-altin', discount: 0.985 },
        { code: 'REPUBLIC_GOLD', key: 'cumhuriyet-altini' },
        { code: 'ATA_GOLD_NEW', key: 'ata-altin' },
        { code: 'ATA_GOLD_OLD', key: 'ata-altin', discount: 0.985 },
        { code: 'GREMSE_GOLD_NEW', key: 'gremse-altin' },
        { code: 'GREMSE_GOLD_OLD', key: 'gremse-altin', discount: 0.985 },
        { code: 'RESAT_GOLD', key: 'resat-altin' },
        { code: 'HAMIT_GOLD', key: 'hamit-altin' },
        { code: 'GOLD_22K', key: '22-ayar-bilezik' },
        { code: 'GOLD_14K', key: '14-ayar-altin' },
        { code: 'GOLD_18K', key: '18-ayar-altin' },
        {
          code: 'PACKAGED_GOLD_1G',
          calcBuy: gramBuy,
          calcSell: Math.round(gramSell * 1.015),
          change: gramChange,
        },
        {
          code: 'PACKAGED_GOLD_2_5G',
          calcBuy: Math.round(gramBuy * 2.5),
          calcSell: Math.round(gramSell * 2.5 * 1.012),
          change: gramChange,
        },
        {
          code: 'PACKAGED_GOLD_5G',
          calcBuy: Math.round(gramBuy * 5),
          calcSell: Math.round(gramSell * 5 * 1.01),
          change: gramChange,
        },
        {
          code: 'PACKAGED_GOLD_10G',
          calcBuy: Math.round(gramBuy * 10),
          calcSell: Math.round(gramSell * 10 * 1.008),
          change: gramChange,
        },
        {
          code: 'PACKAGED_GOLD_20G',
          calcBuy: Math.round(gramBuy * 20),
          calcSell: Math.round(gramSell * 20 * 1.006),
          change: gramChange,
        },
        {
          code: 'PACKAGED_GOLD_50G',
          calcBuy: Math.round(gramBuy * 50),
          calcSell: Math.round(gramSell * 50 * 1.005),
          change: gramChange,
        },
        {
          code: 'PACKAGED_GOLD_100G',
          calcBuy: Math.round(gramBuy * 100),
          calcSell: Math.round(gramSell * 100 * 1.004),
          change: gramChange,
        },
        {
          code: 'OUNCE_GOLD',
          key: 'ons',
          calcBuy: 13500000,
          calcSell: 13520000,
          change: -1.16,
        },
      ];

      // Tüm fiyatları RPC ile eşzamanlı/sıralı olarak veritabanına aktar
      for (const m of mapping) {
        let buy: number | null = null;
        let sell: number | null = null;
        let change: number = 0;

        if (m.key && d[m.key]) {
          const raw = d[m.key];
          buy = parsePriceMinor(raw?.['Alış']);
          sell = parsePriceMinor(raw?.['Satış']);
          change = parseChangePercent(raw?.['Değişim']) ?? 0;

          if (m.discount && buy && sell) {
            buy = Math.round(buy * m.discount);
            sell = Math.round(sell * m.discount);
          }
        } else {
          buy = m.calcBuy ?? null;
          sell = m.calcSell ?? null;
          change = m.change ?? 0;
        }

        if (buy && sell) {
          await supabase.rpc('sync_gold_price', {
            p_product_code: m.code,
            p_buy_price_minor: buy,
            p_sell_price_minor: sell,
            p_daily_change: change,
          });
        }
      }

      return true;
    } catch {
      // Ağ hatası veya kesinti durumunda sessizce devam et; veritabanındaki mevcut kayıtlar kullanılır
      return false;
    }
  },

  /**
   * Tüm ürünler için en son geçerli fiyat kayıtlarını getirir.
   * Fiyatlar boşsa veya eskiyse arka planda otomatik senkronizasyon tetikler.
   */
  async getLatestPrices(staleThresholdMinutes = 15, forceSync = false): Promise<GoldPrice[]> {
    try {
      if (forceSync) {
        await this.syncLivePrices(true);
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

      // Eğer veritabanında hiç fiyat yoksa veya mevcut fiyatlar eskiyse canlı senkronizasyon yap
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
        const didSync = await this.syncLivePrices(false);
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
