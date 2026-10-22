/**
 * Altın İz - Fiyat Çekme Güvenlik ve Maskeleme Yardımcısı
 * supabase/functions/fetch-gold-prices/sanitizer.ts
 */

/**
 * Gizli anahtarı loglarda güvenle maskeler (örnek: "dev...026" veya "***")
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return '[YOK]';
  const trimmed = secret.trim();
  if (trimmed.length <= 6) {
    return '***';
  }
  const prefix = trimmed.slice(0, 3);
  const suffix = trimmed.slice(-3);
  return `${prefix}...${suffix}`;
}

/**
 * Verilen metin veya nesne içindeki API anahtarını güvenli şekilde sansürler.
 */
export function sanitizeLog(message: unknown, secret?: string | null): string {
  let text = typeof message === 'string' ? message : JSON.stringify(message);
  if (secret && secret.trim().length > 0) {
    const trimmedSecret = secret.trim();
    // Metin içindeki açık anahtarı maskeli haliyle değiştir
    text = text.split(trimmedSecret).join(maskSecret(trimmedSecret));
  }
  return text;
}

/**
 * Güvenli konsol loglama yardımcıları
 */
export function safeLog(message: string, context?: Record<string, unknown>, secret?: string | null): void {
  const sanitizedMsg = sanitizeLog(message, secret);
  if (context) {
    const sanitizedCtx = sanitizeLog(context, secret);
    console.log(`[fetch-gold-prices] ${sanitizedMsg}`, sanitizedCtx);
  } else {
    console.log(`[fetch-gold-prices] ${sanitizedMsg}`);
  }
}

export function safeWarn(message: string, context?: Record<string, unknown>, secret?: string | null): void {
  const sanitizedMsg = sanitizeLog(message, secret);
  if (context) {
    const sanitizedCtx = sanitizeLog(context, secret);
    console.warn(`[fetch-gold-prices] ⚠️ ${sanitizedMsg}`, sanitizedCtx);
  } else {
    console.warn(`[fetch-gold-prices] ⚠️ ${sanitizedMsg}`);
  }
}

export function safeError(message: string, context?: Record<string, unknown>, secret?: string | null): void {
  const sanitizedMsg = sanitizeLog(message, secret);
  if (context) {
    const sanitizedCtx = sanitizeLog(context, secret);
    console.error(`[fetch-gold-prices] ❌ ${sanitizedMsg}`, sanitizedCtx);
  } else {
    console.error(`[fetch-gold-prices] ❌ ${sanitizedMsg}`);
  }
}
