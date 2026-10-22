/**
 * Altın İz — Uygulama Hata Modelleri
 *
 * Mimari Belge Referansı: docs/ARCHITECTURE.md Bölüm 21 (Ortak Hata Modeli)
 * Güvenlik Referansı: docs/SECURITY.md Bölüm 6 ve Bölüm 18 (Hassas Veri İfşasını Engelleme)
 */

export interface AppError {
  /**
   * Standart hata kodu (örn. AUTH_INVALID_CREDENTIALS, NETWORK_ERROR, UNKNOWN_ERROR)
   */
  code: string;

  /**
   * Kullanıcıya güvenle gösterilebilecek Türkçe açıklama mesajı
   */
  userMessage: string;

  /**
   * Kullanıcının veya sistemin işlemi tekrar deneyip deneyemeyeceği bilgisi
   */
  retryable: boolean;

  /**
   * İstek takip kimliği (isteğe bağlı)
   */
  requestId?: string;

  /**
   * Hatanın sanitize edilmiş (hassas verilerden arındırılmış) temel sebebi
   */
  cause?: unknown;
}

export type AuthErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_EMAIL_EXISTS'
  | 'AUTH_WEAK_PASSWORD'
  | 'AUTH_RATE_LIMITED'
  | 'AUTH_EXPIRED_ACTION'
  | 'AUTH_UNCONFIRMED_EMAIL'
  | 'AUTH_INVALID_EMAIL'
  | 'AUTH_USER_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';
