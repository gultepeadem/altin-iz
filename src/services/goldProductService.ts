/**
 * Altın İz — Altın Ürünleri Servisi (goldProductService)
 * src/services/goldProductService.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 12.4
 * Veritabanı: public.gold_products (RLS: gold_products_read_active)
 */

import { supabase } from '@/lib/supabase';
import { type GoldProduct, mapRowToGoldProduct } from '@/models/goldProduct';
import { normalizeError } from '@/utils/normalizeError';

export const goldProductService = {
  /**
   * Sistemdeki tüm aktif altın ürünlerini sıralı olarak getirir.
   */
  async getActiveProducts(): Promise<GoldProduct[]> {
    try {
      const { data, error } = await supabase
        .from('gold_products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw normalizeError(error);
      }

      return (data || []).map(mapRowToGoldProduct);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Fiyatlar ekranında gösterilmeye açık (price_display_enabled = true) ürünleri getirir.
   */
  async getPriceDisplayProducts(): Promise<GoldProduct[]> {
    try {
      const { data, error } = await supabase
        .from('gold_products')
        .select('*')
        .eq('is_active', true)
        .eq('price_display_enabled', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw normalizeError(error);
      }

      return (data || []).map(mapRowToGoldProduct);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Portföye eklenmeye açık (portfolio_enabled = true) ürünleri getirir.
   */
  async getPortfolioProducts(): Promise<GoldProduct[]> {
    try {
      const { data, error } = await supabase
        .from('gold_products')
        .select('*')
        .eq('is_active', true)
        .eq('portfolio_enabled', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw normalizeError(error);
      }

      return (data || []).map(mapRowToGoldProduct);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Hesaplama ekranında kullanılabilir (calculator_enabled = true) ürünleri getirir.
   */
  async getCalculatorProducts(): Promise<GoldProduct[]> {
    try {
      const { data, error } = await supabase
        .from('gold_products')
        .select('*')
        .eq('is_active', true)
        .eq('calculator_enabled', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw normalizeError(error);
      }

      return (data || []).map(mapRowToGoldProduct);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Belirtilen benzersiz ID'ye sahip ürünü getirir.
   */
  async getProductById(id: string): Promise<GoldProduct | null> {
    try {
      const { data, error } = await supabase
        .from('gold_products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw normalizeError(error);
      }

      return data ? mapRowToGoldProduct(data) : null;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Belirtilen benzersiz koda (ör. 'GRAM_GOLD', 'QUARTER_GOLD_NEW') sahip ürünü getirir.
   */
  async getProductByCode(code: string): Promise<GoldProduct | null> {
    try {
      const { data, error } = await supabase
        .from('gold_products')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        throw normalizeError(error);
      }

      return data ? mapRowToGoldProduct(data) : null;
    } catch (err) {
      throw normalizeError(err);
    }
  },
};
