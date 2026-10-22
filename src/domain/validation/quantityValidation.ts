/**
 * Altın İz — Miktar Doğrulayıcı (Domain Validation)
 * src/domain/validation/quantityValidation.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 15
 * Karar Referansı: ADR-009 (Miktar ve Ölçü Birimi)
 *
 * Kurallar:
 * - Adetli ürünlerde (`piece`) yalnızca pozitif tam sayılar geçerlidir (ör. 1, 2, 5).
 * - Gramlı ürünlerde (`gram`) azami 3 ondalık basamak geçerlidir (ör. 0.250, 1.500, 3.125).
 * - Miktar her zaman sıfırdan büyük pozitif bir sayı olmalıdır.
 */

import type { MeasurementUnit } from '../../models/goldProduct.ts';

export interface QuantityValidationResult {
  isValid: boolean;
  error?: string;
  normalizedQuantity?: number;
}

/**
 * Kullanıcı tarafından girilen metinsel miktar değerini sayıya dönüştürür.
 * Türkçe virgül (',') veya nokta ('.') ayracını destekler.
 * Geçersiz ise null döner.
 */
export function parseQuantity(input: string): number | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const clean = input.trim().replace(/\s+/g, '').replace(',', '.');
  if (clean === '') {
    return null;
  }

  const parsed = Number(clean);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * Ürünün ölçü birimine göre girilen miktarı doğrular.
 */
export function validateQuantity(
  quantity: number | null | undefined,
  measurementUnit: MeasurementUnit = 'gram'
): QuantityValidationResult {
  if (quantity === null || quantity === undefined || isNaN(quantity)) {
    return {
      isValid: false,
      error: 'Lütfen geçerli bir miktar giriniz.',
    };
  }

  if (quantity <= 0) {
    return {
      isValid: false,
      error: 'Miktar sıfırdan büyük olmalıdır.',
    };
  }

  // 1. Adetli ürün kontrolü: Yalnızca pozitif tam sayı
  if (measurementUnit === 'piece') {
    if (!Number.isInteger(quantity)) {
      return {
        isValid: false,
        error: 'Adetli altınlar için küsuratlı miktar girilemez. Lütfen tam sayı giriniz (ör. 1, 2, 3).',
      };
    }
  }

  // 2. Gramlı veya onsluk ürün kontrolü: Azami 3 ondalık basamak
  if (measurementUnit === 'gram' || measurementUnit === 'ounce') {
    // Ondalık basamak sayısını kontrol et
    const strVal = quantity.toString();
    const parts = strVal.split('.');

    if (parts.length > 1 && parts[1].length > 3) {
      return {
        isValid: false,
        error: 'Gram miktarı en fazla 3 ondalık basamak içerebilir (ör. 1.250 veya 0.500).',
      };
    }
  }

  return {
    isValid: true,
    normalizedQuantity: quantity,
  };
}
