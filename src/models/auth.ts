/**
 * Altın İz — Kimlik Doğrulama Veri Modelleri
 *
 * Güvenlik Uyarısı: Şifreler hiçbir loga, analitik servisine veya uzak hata
 * raporuna yazılmamalıdır. Bu modeller sadece fonksiyon parametresi olarak kullanılır.
 */

import type { Session, User } from '@supabase/supabase-js';

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
  redirectTo?: string;
}

export interface ResendVerificationParams {
  email: string;
}

export interface AuthSuccessResult {
  user: User | null;
  session: Session | null;
}
