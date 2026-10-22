/**
 * Altın İz — Altın Ürün Modeli
 * src/models/goldProduct.ts
 *
 * Veritabanı Tablosu: public.gold_products
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 12.4
 */

export type GoldProductCategory = 'gram' | 'coin' | 'karat' | 'international' | 'packaged';
export type MeasurementUnit = 'piece' | 'gram' | 'ounce';

export interface GoldProduct {
  id: string;
  code: string;
  name: string;
  shortName: string | null;
  category: GoldProductCategory;
  measurementUnit: MeasurementUnit;
  quantityPrecision: number;
  packageWeightGrams: number | null;
  portfolioEnabled: boolean;
  calculatorEnabled: boolean;
  priceDisplayEnabled: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Supabase ham veritabanı satırını uygulama modeline dönüştürür.
 */
export function mapRowToGoldProduct(row: any): GoldProduct {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    shortName: row.short_name ?? null,
    category: row.category as GoldProductCategory,
    measurementUnit: row.measurement_unit as MeasurementUnit,
    quantityPrecision: Number(row.quantity_precision ?? 0),
    packageWeightGrams: row.package_weight_grams ? Number(row.package_weight_grams) : null,
    portfolioEnabled: Boolean(row.portfolio_enabled),
    calculatorEnabled: Boolean(row.calculator_enabled),
    priceDisplayEnabled: Boolean(row.price_display_enabled),
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
