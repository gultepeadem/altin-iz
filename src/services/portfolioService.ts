/**
 * Altın İz — Portföy Servisi (portfolioService)
 * src/services/portfolioService.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 10 ve Bölüm 18.2
 * API Referansı: docs/API.md Bölüm 16 ve Bölüm 17
 * Karar Referansları:
 * - ADR-009 (Miktar ve Ölçü Birimi Kuralları)
 * - ADR-010 (Portföy Değerleme Yöntemi: Miktar × Alış Fiyatı)
 * - ADR-013 (Fiyat Bulunamadığında 0 TL Üretilmez, Kısmi Portföy Davranışı)
 * - ADR-032 (Sayısal Hassasiyet ve Kuruş Seviyesi Hesaplama)
 *
 * Temel Güvenlik ve İş Kuralları:
 * 1. Kullanıcı kimliği (user_id) ASLA form girdisinden alınmaz; güvenli auth oturumundan atanır.
 * 2. Kayıtlar her zaman alış tarihi (`purchase_date DESC`) ve eklenme zamanına (`created_at DESC`) göre sıralanır.
 * 3. Fiyatı olmayan kayıtlar asla listeden düşmez veya silinmez; değerlemesi 'unavailable' olarak gösterilir.
 * 4. Tüm Supabase ve ağ hataları ortak AppError modeline dönüştürülür.
 */

import { supabase } from '@/lib/supabase';
import {
  type PortfolioEntry,
  type CreatePortfolioEntryInput,
  type UpdatePortfolioEntryInput,
  type PortfolioEntryWithValuation,
  mapRowToPortfolioEntry,
} from '@/models/portfolio';
import { goldProductService } from './goldProductService';
import { goldPriceService } from './goldPriceService';
import { normalizeError } from '@/utils/normalizeError';
import { validateQuantity } from '@/domain/validation';
import {
  calculateEntryValuation,
  calculatePortfolioSummary,
  type PortfolioSummaryResult,
} from '@/domain/calculations';
import type { AppError } from '@/models/errors';

/**
 * Alış tarihinin geçerli ve bugünden ileri bir tarih olmadığını doğrular.
 */
export function isValidPurchaseDate(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  const purchaseDate = new Date(year, month - 1, day);
  if (
    purchaseDate.getFullYear() !== year ||
    purchaseDate.getMonth() !== month - 1 ||
    purchaseDate.getDate() !== day
  ) {
    return false;
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return purchaseDate <= today;
}

export const portfolioService = {
  /**
   * Aktif oturumdaki kullanıcının kimliğini güvenle çözer.
   * Eğer oturum yoksa ve explicit userId verilmemişse hata fırlatır.
   */
  async resolveUserId(explicitUserId?: string): Promise<string> {
    if (explicitUserId) {
      return explicitUserId;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw normalizeError(
        new Error('Oturum bulunamadı. Lütfen giriş yapınız.'),
        'Bu işlem için giriş yapmış olmanız gerekmektedir.'
      );
    }
    return user.id;
  },

  /**
   * Kullanıcının portföy kayıtlarını listeler.
   * Sıralama: purchase_date DESC, created_at DESC (API.md Bölüm 16.1).
   * Ürün devre dışı veya fiyatsız olsa bile portföy kayıtları eksiksiz döner.
   */
  async listEntries(userId?: string): Promise<PortfolioEntry[]> {
    try {
      const activeUserId = await this.resolveUserId(userId);

      const { data, error } = await supabase
        .from('portfolio_entries')
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          purchase_date,
          total_cost_minor,
          purchase_place,
          note,
          labor_included,
          created_at,
          updated_at,
          product:gold_products(
            id,
            code,
            name,
            short_name,
            measurement_unit,
            portfolio_enabled,
            is_active
          )
        `)
        .eq('user_id', activeUserId)
        .order('purchase_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw normalizeError(error);
      }

      return (data || []).map(mapRowToPortfolioEntry);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Belirtilen tek bir kaydın detayını getirir.
   * Yalnızca oturumdaki kullanıcıya ait olan kayıt döner.
   */
  async getEntryById(entryId: string, userId?: string): Promise<PortfolioEntry | null> {
    try {
      const activeUserId = await this.resolveUserId(userId);

      const { data, error } = await supabase
        .from('portfolio_entries')
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          purchase_date,
          total_cost_minor,
          purchase_place,
          note,
          labor_included,
          created_at,
          updated_at,
          product:gold_products(
            id,
            code,
            name,
            short_name,
            measurement_unit,
            portfolio_enabled,
            is_active
          )
        `)
        .eq('id', entryId)
        .eq('user_id', activeUserId)
        .maybeSingle();

      if (error) {
        throw normalizeError(error);
      }

      if (!data) {
        return null;
      }

      return mapRowToPortfolioEntry(data);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Yeni portföy kaydı oluşturur.
   * Form girdisinden asla 'user_id' alınmaz!
   */
  async createEntry(
    input: CreatePortfolioEntryInput,
    userId?: string
  ): Promise<PortfolioEntry> {
    try {
      const activeUserId = await this.resolveUserId(userId);

      // 1. Ürün doğrulaması
      const product = await goldProductService.getProductById(input.productId);
      if (!product) {
        const err: AppError = {
          code: 'PORTFOLIO_PRODUCT_NOT_FOUND',
          userMessage: 'Seçilen altın ürünü bulunamadı.',
          retryable: false,
        };
        throw err;
      }

      if (!product.isActive || !product.portfolioEnabled) {
        const err: AppError = {
          code: 'PORTFOLIO_PRODUCT_DISABLED',
          userMessage: 'Bu altın ürünü portföy kaydı için kullanılamaz.',
          retryable: false,
        };
        throw err;
      }

      // 2. Miktar doğrulaması
      const qtyValidation = validateQuantity(input.quantity, product.measurementUnit);
      if (!qtyValidation.isValid) {
        const err: AppError = {
          code: 'INVALID_QUANTITY',
          userMessage: qtyValidation.error || 'Geçersiz miktar girişi.',
          retryable: false,
        };
        throw err;
      }

      // 3. Maliyet doğrulaması
      if (
        typeof input.totalCostMinor !== 'number' ||
        isNaN(input.totalCostMinor) ||
        input.totalCostMinor <= 0 ||
        !Number.isInteger(input.totalCostMinor)
      ) {
        const err: AppError = {
          code: 'INVALID_COST',
          userMessage: 'Ödenen toplam tutar sıfırdan büyük bir kuruş tam sayısı olmalıdır.',
          retryable: false,
        };
        throw err;
      }

      // 4. Alış tarihi doğrulaması (Gelecek tarih engeli)
      if (!isValidPurchaseDate(input.purchaseDate)) {
        const err: AppError = {
          code: 'INVALID_PURCHASE_DATE',
          userMessage: 'Alış tarihi geçerli bir tarih olmalı ve bugünden ileri bir tarih olamaz.',
          retryable: false,
        };
        throw err;
      }

      // 5. Metin uzunluk sınırları
      const purchasePlace = input.purchasePlace?.trim() || null;
      if (purchasePlace && purchasePlace.length > 100) {
        const err: AppError = {
          code: 'PURCHASE_PLACE_TOO_LONG',
          userMessage: 'Alış yeri en fazla 100 karakter olabilir.',
          retryable: false,
        };
        throw err;
      }

      const note = input.note?.trim() || null;
      if (note && note.length > 500) {
        const err: AppError = {
          code: 'NOTE_TOO_LONG',
          userMessage: 'Not alanı en fazla 500 karakter olabilir.',
          retryable: false,
        };
        throw err;
      }

      // 6. Veritabanına ekleme (user_id kesinlikle auth oturumundan alınır)
      const { data, error } = await supabase
        .from('portfolio_entries')
        .insert({
          user_id: activeUserId,
          product_id: input.productId,
          quantity: input.quantity,
          purchase_date: input.purchaseDate,
          total_cost_minor: input.totalCostMinor,
          purchase_place: purchasePlace,
          note: note,
          labor_included: input.laborIncluded ?? null,
        })
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          purchase_date,
          total_cost_minor,
          purchase_place,
          note,
          labor_included,
          created_at,
          updated_at,
          product:gold_products(
            id,
            code,
            name,
            short_name,
            measurement_unit,
            portfolio_enabled,
            is_active
          )
        `)
        .single();

      if (error) {
        throw normalizeError(error);
      }

      return mapRowToPortfolioEntry(data);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Mevcut portföy kaydını günceller.
   * 'id', 'user_id' ve 'created_at' asla değiştirilemez.
   */
  async updateEntry(
    entryId: string,
    input: UpdatePortfolioEntryInput,
    userId?: string
  ): Promise<PortfolioEntry> {
    try {
      const activeUserId = await this.resolveUserId(userId);

      // Güncellenecek mevcut kaydı kontrol et
      const existing = await this.getEntryById(entryId, activeUserId);
      if (!existing) {
        const err: AppError = {
          code: 'PORTFOLIO_ENTRY_NOT_AVAILABLE',
          userMessage: 'Portföy kaydı bulunamadı veya bu kayda erişim izniniz yok.',
          retryable: false,
        };
        throw err;
      }

      const updatePayload: Record<string, any> = {};

      // Ürün değişikliği varsa doğrula
      const targetProductId = input.productId || existing.productId;
      const product = await goldProductService.getProductById(targetProductId);
      if (!product || !product.isActive || !product.portfolioEnabled) {
        const err: AppError = {
          code: 'PORTFOLIO_PRODUCT_DISABLED',
          userMessage: 'Seçilen altın ürünü portföy kaydı için kullanılamaz.',
          retryable: false,
        };
        throw err;
      }

      if (input.productId !== undefined) {
        updatePayload.product_id = input.productId;
      }

      // Miktar
      if (input.quantity !== undefined) {
        const qtyValidation = validateQuantity(input.quantity, product.measurementUnit);
        if (!qtyValidation.isValid) {
          const err: AppError = {
            code: 'INVALID_QUANTITY',
            userMessage: qtyValidation.error || 'Geçersiz miktar girişi.',
            retryable: false,
          };
          throw err;
        }
        updatePayload.quantity = input.quantity;
      }

      // Maliyet
      if (input.totalCostMinor !== undefined) {
        if (
          typeof input.totalCostMinor !== 'number' ||
          isNaN(input.totalCostMinor) ||
          input.totalCostMinor <= 0 ||
          !Number.isInteger(input.totalCostMinor)
        ) {
          const err: AppError = {
            code: 'INVALID_COST',
            userMessage: 'Ödenen toplam tutar sıfırdan büyük bir kuruş tam sayısı olmalıdır.',
            retryable: false,
          };
          throw err;
        }
        updatePayload.total_cost_minor = input.totalCostMinor;
      }

      // Alış tarihi
      if (input.purchaseDate !== undefined) {
        if (!isValidPurchaseDate(input.purchaseDate)) {
          const err: AppError = {
            code: 'INVALID_PURCHASE_DATE',
            userMessage: 'Alış tarihi geçerli bir tarih olmalı ve bugünden ileri bir tarih olamaz.',
            retryable: false,
          };
          throw err;
        }
        updatePayload.purchase_date = input.purchaseDate;
      }

      // Alış yeri
      if (input.purchasePlace !== undefined) {
        const purchasePlace = input.purchasePlace?.trim() || null;
        if (purchasePlace && purchasePlace.length > 100) {
          const err: AppError = {
            code: 'PURCHASE_PLACE_TOO_LONG',
            userMessage: 'Alış yeri en fazla 100 karakter olabilir.',
            retryable: false,
          };
          throw err;
        }
        updatePayload.purchase_place = purchasePlace;
      }

      // Not
      if (input.note !== undefined) {
        const note = input.note?.trim() || null;
        if (note && note.length > 500) {
          const err: AppError = {
            code: 'NOTE_TOO_LONG',
            userMessage: 'Not alanı en fazla 500 karakter olabilir.',
            retryable: false,
          };
          throw err;
        }
        updatePayload.note = note;
      }

      // İşçilik dâhil
      if (input.laborIncluded !== undefined) {
        updatePayload.labor_included = input.laborIncluded ?? null;
      }

      // Güncelleme sorgusu
      const { data, error } = await supabase
        .from('portfolio_entries')
        .update(updatePayload)
        .eq('id', entryId)
        .eq('user_id', activeUserId)
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          purchase_date,
          total_cost_minor,
          purchase_place,
          note,
          labor_included,
          created_at,
          updated_at,
          product:gold_products(
            id,
            code,
            name,
            short_name,
            measurement_unit,
            portfolio_enabled,
            is_active
          )
        `)
        .single();

      if (error) {
        throw normalizeError(error);
      }

      return mapRowToPortfolioEntry(data);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Portföy kaydını siler.
   * Yalnızca oturumdaki kullanıcıya ait kayıt silinebilir.
   */
  async deleteEntry(entryId: string, userId?: string): Promise<boolean> {
    try {
      const activeUserId = await this.resolveUserId(userId);

      const { error } = await supabase
        .from('portfolio_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', activeUserId);

      if (error) {
        throw normalizeError(error);
      }

      return true;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  /**
   * Portföy kayıtlarını güncel canlı fiyatları ve değerleme sonuçlarıyla birlikte döner.
   *
   * ADR-010: Portföy Değeri = Miktar × Alış Fiyatı (Bozdurma değeri)
   * ADR-013: Fiyatı olmayan kayıtlar kaybolmaz, 'unavailable' olarak döner;
   *          özette 'isPartial: true' olarak işaretlenir.
   */
  async getEntriesWithValuation(
    userId?: string
  ): Promise<{
    items: PortfolioEntryWithValuation[];
    summary: PortfolioSummaryResult;
  }> {
    try {
      const activeUserId = await this.resolveUserId(userId);
      const entries = await this.listEntries(activeUserId);

      if (entries.length === 0) {
        return {
          items: [],
          summary: calculatePortfolioSummary([]),
        };
      }

      // Canlı fiyatları al
      const latestPrices = await goldPriceService.getLatestPrices();
      const priceMap = new Map<string, typeof latestPrices[0]>();
      for (const price of latestPrices) {
        priceMap.set(price.productId, price);
      }

      const items: PortfolioEntryWithValuation[] = [];
      const calculationItems = [];

      for (const entry of entries) {
        const latestPrice = priceMap.get(entry.productId) || null;
        const buyPriceMinor = latestPrice?.buyPriceMinor ?? null;

        // Her kayıt için tekil değerleme (ADR-010: Alış fiyatı üzerinden)
        const valuation = calculateEntryValuation(
          entry.quantity,
          buyPriceMinor,
          entry.totalCostMinor
        );

        items.push({
          entry,
          latestPrice,
          valuation,
        });

        calculationItems.push({
          id: entry.id,
          quantity: entry.quantity,
          totalCostMinor: entry.totalCostMinor,
          buyPriceMinor,
          isStale: latestPrice ? latestPrice.status === 'stale' || latestPrice.isProviderStale : false,
        });
      }

      // Genel portföy özeti (Kısmi portföy ve eksik fiyat korumalı - ADR-013)
      const summary = calculatePortfolioSummary(calculationItems);

      return {
        items,
        summary,
      };
    } catch (err) {
      throw normalizeError(err);
    }
  },
};
