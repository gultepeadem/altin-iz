/**
 * Altın İz — delete-account Edge Function Güvenlik ve Sanitizer Yardımcısı
 * supabase/functions/delete-account/sanitizer.ts
 */

const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /service_role[a-zA-Z0-9_\-.]*/gi,
  /eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/g, // JWT
  /password["']?\s*[:=]\s*["']?[^"',\s}]+/gi,
];

/**
 * Hassas verileri (parolalar, JWT belirteçleri, service_role anahtarları) maskeler.
 */
export function sanitizeString(text: string): string {
  if (!text) return '';
  let sanitized = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

/**
 * Güvenli console.log çıktısı üretir; gizli anahtar veya şifre sızmasını önler.
 */
export function safeLog(message: string, meta?: Record<string, unknown>): void {
  const cleanMessage = sanitizeString(message);
  if (meta) {
    const cleanMeta: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(meta)) {
      if (
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('key')
      ) {
        cleanMeta[key] = '[REDACTED]';
      } else if (typeof value === 'string') {
        cleanMeta[key] = sanitizeString(value);
      } else {
        cleanMeta[key] = value;
      }
    }
    console.log(cleanMessage, cleanMeta);
  } else {
    console.log(cleanMessage);
  }
}

/**
 * Güvenli console.error çıktısı üretir.
 */
export function safeError(message: string, error?: unknown): void {
  const cleanMessage = sanitizeString(message);
  const errMsg = error instanceof Error ? error.message : String(error || '');
  console.error(cleanMessage, sanitizeString(errMsg));
}
