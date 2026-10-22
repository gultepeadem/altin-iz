/**
 * Altın İz — Güvenli ve Prodüksiyon Duyarlı Loglama Yöneticisi (logger)
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 21 & docs/SECURITY.md Bölüm 6, 18
 * Görev Referansı: docs/TODO.md Bölüm 19 (Faz 13: Güvenlik İncelemesi)
 *
 * Prensipler:
 * 1. Şifreler, erişim belirteçleri (Bearer, JWT), oturum anahtarları ve servis anahtarları
 *    ASLA konsola veya loglara açık metin olarak yazdırılmaz.
 * 2. Prodüksiyon ortamında (canlı derleme) hata ayıklama (debug) logları tamamen susturulur.
 * 3. Hata loglarında iç sistem ayrıntıları ve hassas nesneler otomatik olarak maskelenir ([REDACTED]).
 */

import { env } from '../lib/environment.ts';

// React Native __DEV__ global bayrağı desteği
declare const __DEV__: boolean | undefined;

/**
 * Maskelenecek anahtar kelimeler (büyük/küçük harf duyarsız)
 */
const SENSITIVE_KEY_PATTERNS = [
  'password',
  'parola',
  'sifre',
  'token',
  'jwt',
  'secret',
  'authorization',
  'bearer',
  'api_key',
  'apikey',
  'service_role',
  'access_token',
  'refresh_token',
  'credit_card',
  'iban',
];

/**
 * Metin içindeki token ve parola örüntülerini yakalayan düzenli ifadeler
 */
const SENSITIVE_REGEXES = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/g, // JWT
  /(?:password|parola|sifre)["']?\s*[:=]\s*["']?[^"',\s}]+/gi,
  /service_role[a-zA-Z0-9_\-.]*/gi,
];

/**
 * Ortamın canlı (production) olup olmadığını belirler.
 */
export function isProductionEnv(): boolean {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return true;
  }
  return env.appEnv === 'production';
}

/**
 * Verilen dize içerisindeki hassas belirteçleri ve şifreleri maskeler.
 */
export function sanitizeString(text: string): string {
  if (!text) return '';
  let sanitized = text;
  for (const regex of SENSITIVE_REGEXES) {
    sanitized = sanitized.replace(regex, '[REDACTED]');
  }
  return sanitized;
}

/**
 * Herhangi bir nesneyi, hatayı veya meta veriyi yinelemeli (recursive) olarak
 * tarayıp hassas alanları maskeler.
 */
export function sanitizeLogData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeString(data) as unknown as T;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (data instanceof Error) {
    return {
      name: data.name,
      message: sanitizeString(data.message),
      // Prodüksiyonda stack trace gizlenir
      ...(isProductionEnv() ? {} : { stack: sanitizeString(data.stack || '') }),
    } as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) =>
        lowerKey.includes(pattern)
      );

      if (isSensitiveKey) {
        cleanObj[key] = '[REDACTED]';
      } else {
        cleanObj[key] = sanitizeLogData(value);
      }
    }
    return cleanObj as unknown as T;
  }

  return data;
}

/**
 * Merkezi Güvenli Loglama Arayüzü
 */
export const logger = {
  /**
   * Hata ayıklama mesajı. Canlı ortamda tamamen sessizdir.
   */
  debug(tag: string, message: string, meta?: unknown): void {
    if (isProductionEnv()) return;
    const cleanMsg = sanitizeString(message);
    if (meta !== undefined) {
      console.log(`[DEBUG][${tag}] ${cleanMsg}`, sanitizeLogData(meta));
    } else {
      console.log(`[DEBUG][${tag}] ${cleanMsg}`);
    }
  },

  /**
   * Bilgilendirme mesajı.
   */
  info(tag: string, message: string, meta?: unknown): void {
    const cleanMsg = sanitizeString(message);
    if (meta !== undefined) {
      console.log(`[INFO][${tag}] ${cleanMsg}`, sanitizeLogData(meta));
    } else {
      console.log(`[INFO][${tag}] ${cleanMsg}`);
    }
  },

  /**
   * Uyarı mesajı.
   */
  warn(tag: string, message: string, meta?: unknown): void {
    const cleanMsg = sanitizeString(message);
    if (meta !== undefined) {
      console.warn(`[WARN][${tag}] ${cleanMsg}`, sanitizeLogData(meta));
    } else {
      console.warn(`[WARN][${tag}] ${cleanMsg}`);
    }
  },

  /**
   * Hata mesajı. Hassas veriler maskelenerek güvenle günlüğe kaydedilir.
   */
  error(tag: string, message: string, error?: unknown): void {
    const cleanMsg = sanitizeString(message);
    if (error !== undefined) {
      console.error(`[ERROR][${tag}] ${cleanMsg}`, sanitizeLogData(error));
    } else {
      console.error(`[ERROR][${tag}] ${cleanMsg}`);
    }
  },

  /**
   * Nesne veya metin temizleme yardımcısı.
   */
  sanitize: sanitizeLogData,
};
