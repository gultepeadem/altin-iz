/**
 * Altın İz — Hata Dönüştürme ve Güvenlik Normalizasyonu (normalizeError)
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 21 (Hata Yönetimi Mimarisi)
 * Güvenlik Referansı: docs/SECURITY.md Bölüm 6 ve Bölüm 18 (Hassas Veri İfşasını Engelleme)
 *
 * Prensipler:
 * 1. Kullanıcıya asla SQL sorgusu, stack trace, şifre, token veya sunucu iç hatası gösterilmez.
 * 2. Giriş ve şifre sıfırlama hatalarında e-posta hesabının varlığı gereksiz yere ifşa edilmez.
 * 3. Bütün hatalar standart AppError arayüzüne dönüştürülerek kullanıcı dostu Türkçe mesaj döner.
 */

import { AuthError } from '@supabase/supabase-js';
import type { AppError } from '@/models/errors';

/**
 * Bilinen bir nesnenin AppError olup olmadığını kontrol eder.
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'userMessage' in error &&
    'retryable' in error
  );
}

/**
 * Gelen herhangi bir hatayı güvenli ve standart AppError nesnesine dönüştürür.
 *
 * @param error Yakalanan ham hata (Supabase AuthError, JavaScript Error veya bilinmeyen tip)
 * @param defaultUserMessage İsteğe bağlı varsayılan kullanıcı mesajı
 * @returns Güvenli AppError nesnesi
 */
export function normalizeError(
  error: unknown,
  defaultUserMessage = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
): AppError {
  // 1. Zaten normalize edilmiş bir AppError ise doğrudan döndür
  if (isAppError(error)) {
    return error;
  }

  // 2. Ağ ve bağlantı hatalarını tespit et
  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();
    if (
      lowerMessage.includes('network request failed') ||
      lowerMessage.includes('failed to fetch') ||
      lowerMessage.includes('network error') ||
      lowerMessage.includes('abort') ||
      lowerMessage.includes('timeout')
    ) {
      return {
        code: 'NETWORK_ERROR',
        userMessage: 'İnternet bağlantınızı kontrol edip lütfen tekrar deneyin.',
        retryable: true,
        cause: { name: error.name },
      };
    }
  }

  // 3. Supabase Auth hatalarını güvenli kullanıcı mesajlarına dönüştür
  if (error instanceof AuthError || (typeof error === 'object' && error !== null && 'status' in error)) {
    const authErr = error as AuthError;
    const message = (authErr.message || '').toLowerCase();
    const status = authErr.status || 0;
    const errCode = (authErr.code || '').toLowerCase();

    // Hatalı kimlik bilgisi (Giriş hatası: e-posta veya şifre hatalı)
    // Güvenlik Kuralı: E-postanın sistemde bulunup bulunmadığı gereksiz yere açıklanmaz.
    if (
      message.includes('invalid login credentials') ||
      message.includes('invalid_grant') ||
      errCode.includes('invalid_credentials') ||
      status === 400 && message.includes('invalid')
    ) {
      return {
        code: 'AUTH_INVALID_CREDENTIALS',
        userMessage: 'E-posta adresi veya şifre hatalı.',
        retryable: true,
        cause: { status },
      };
    }

    // E-posta zaten kayıtlı
    if (
      message.includes('user already registered') ||
      message.includes('already exists') ||
      errCode.includes('user_already_exists')
    ) {
      return {
        code: 'AUTH_EMAIL_EXISTS',
        userMessage: 'Bu e-posta adresi ile zaten bir hesap bulunmaktadır veya geçersizdir.',
        retryable: false,
        cause: { status },
      };
    }

    // Hız limiti aşımı (Rate limit)
    if (
      status === 429 ||
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      errCode.includes('over_request_rate_limit') ||
      errCode.includes('over_email_send_rate_limit')
    ) {
      return {
        code: 'AUTH_RATE_LIMITED',
        userMessage: 'Çok fazla deneme yaptınız. Lütfen bir süre bekleyip tekrar deneyin.',
        retryable: true,
        cause: { status },
      };
    }

    // Zayıf şifre
    if (
      message.includes('password should be at least') ||
      message.includes('weak_password') ||
      errCode.includes('weak_password')
    ) {
      return {
        code: 'AUTH_WEAK_PASSWORD',
        userMessage: 'Şifreniz güvenlik kriterlerini karşılamıyor (en az 6 karakter olmalıdır).',
        retryable: true,
        cause: { status },
      };
    }

    // E-posta henüz doğrulanmamış
    if (
      message.includes('email not confirmed') ||
      errCode.includes('email_not_confirmed')
    ) {
      return {
        code: 'AUTH_UNCONFIRMED_EMAIL',
        userMessage: 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.',
        retryable: true,
        cause: { status },
      };
    }

    // Süresi dolmuş token / oturum / link
    if (
      message.includes('token has expired') ||
      message.includes('otp expired') ||
      errCode.includes('otp_expired') ||
      errCode.includes('flow_state_not_found')
    ) {
      return {
        code: 'AUTH_EXPIRED_ACTION',
        userMessage: 'Doğrulama bağlantısının veya oturumun süresi dolmuş. Lütfen tekrar deneyin.',
        retryable: true,
        cause: { status },
      };
    }

    // Geçersiz e-posta formatı
    if (
      message.includes('unable to validate email') ||
      message.includes('invalid email') ||
      errCode.includes('validation_failed')
    ) {
      return {
        code: 'AUTH_INVALID_EMAIL',
        userMessage: 'Girilen e-posta adresi geçersizdir.',
        retryable: true,
        cause: { status },
      };
    }

    return {
      code: 'AUTH_ERROR',
      userMessage: defaultUserMessage,
      retryable: true,
      cause: { status },
    };
  }

  // 4. Genel standart Error nesneleri
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      userMessage: defaultUserMessage,
      retryable: true,
      cause: { name: error.name },
    };
  }

  // 5. Bilinmeyen tüm durumlar
  return {
    code: 'UNKNOWN_ERROR',
    userMessage: defaultUserMessage,
    retryable: true,
  };
}
