/**
 * Altın İz — Portföy Veri Modelleri
 * src/models/portfolio.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 10 ve Bölüm 18.2
 * Veritabanı: docs/DATABASE.md Bölüm 8 (portfolio_entries)
 * API Referansı: docs/API.md Bölüm 16 (Portföy API İşlemleri)
 *
 * Güvenlik Kuralları:
 * - Form girdisinden asla 'user_id' alınmaz; güvenli oturumdaki kullanıcı kimliği kullanılır.
 * - 'current_value_minor', 'profit_loss_minor' gibi hesaplanan değerler veritabanında saklanmaz;
 *   güncel fiyatla birlikte çalışma zamanında hesaplanır (ADR-010).
 */

import type { MeasurementUnit } from './goldProduct';
import type { GoldPrice } from './goldPrice';
import type { EntryValuationResult } from '@/domain/calculations';

/**
 * İlişkili ürün temel bilgisi (JOIN sonucu)
 */
export interface PortfolioEntryProduct {
  id: string;
  code: string;
  name: string;
  shortName?: string | null;
  measurementUnit: MeasurementUnit;
  portfolioEnabled: boolean;
  isActive: boolean;
}

/**
 * Portföy Kaydı (portfolio_entries)
 */
export interface PortfolioEntry {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  purchaseDate: string; // YYYY-MM-DD
  totalCostMinor: number; // Kuruş cinsinden ödenen toplam maliyet
  purchasePlace: string | null;
  note: string | null;
  laborIncluded: boolean | null;
  createdAt: string;
  updatedAt: string;
  product?: PortfolioEntryProduct;
}

/**
 * Yeni Portföy Kaydı Oluşturma Girdisi
 * Not: user_id bu nesnede bulunmaz, güvenli auth oturumundan atanır.
 */
export interface CreatePortfolioEntryInput {
  productId: string;
  quantity: number;
  purchaseDate: string; // YYYY-MM-DD
  totalCostMinor: number;
  purchasePlace?: string | null;
  note?: string | null;
  laborIncluded?: boolean | null;
}

/**
 * Mevcut Portföy Kaydı Güncelleme Girdisi
 * Not: id, user_id ve created_at asla güncellenemez.
 */
export interface UpdatePortfolioEntryInput {
  productId?: string;
  quantity?: number;
  purchaseDate?: string;
  totalCostMinor?: number;
  purchasePlace?: string | null;
  note?: string | null;
  laborIncluded?: boolean | null;
}

/**
 * Değerleme sonucu ile zenginleştirilmiş portföy kaydı
 */
export interface PortfolioEntryWithValuation {
  entry: PortfolioEntry;
  latestPrice: GoldPrice | null;
  valuation: EntryValuationResult;
}

/**
 * Supabase satırını PortfolioEntry modeline dönüştürür.
 */
export function mapRowToPortfolioEntry(row: any): PortfolioEntry {
  let product: PortfolioEntryProduct | undefined = undefined;

  if (row.product && typeof row.product === 'object') {
    product = {
      id: row.product.id,
      code: row.product.code,
      name: row.product.name,
      shortName: row.product.short_name ?? null,
      measurementUnit: row.product.measurement_unit as MeasurementUnit,
      portfolioEnabled: Boolean(row.product.portfolio_enabled),
      isActive: Boolean(row.product.is_active),
    };
  }

  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    quantity: typeof row.quantity === 'number' ? row.quantity : parseFloat(row.quantity),
    purchaseDate: row.purchase_date,
    totalCostMinor: typeof row.total_cost_minor === 'number' ? row.total_cost_minor : parseInt(row.total_cost_minor, 10),
    purchasePlace: row.purchase_place ?? null,
    note: row.note ?? null,
    laborIncluded: row.labor_included ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    product,
  };
}
