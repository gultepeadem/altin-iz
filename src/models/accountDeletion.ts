/**
 * Altın İz — Hesap ve Veri Silme Veri Modelleri
 * src/models/accountDeletion.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 7.4 & docs/DATA_RETENTION.md
 * Karar Referansı: docs/DECISIONS.md ADR-025 & ADR-033
 * Görev Referansı: docs/TODO.md Faz 12 (Hesap silme teknik tasarımı)
 * Veritabanı Tablosu: public.account_deletion_requests
 */

export type AccountDeletionStatus =
  | 'requested'
  | 'identity_verification_required'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export const ACCOUNT_DELETION_STATUSES: readonly AccountDeletionStatus[] = [
  'requested',
  'identity_verification_required',
  'processing',
  'completed',
  'failed',
  'cancelled',
] as const;

export interface AccountDeletionRequest {
  id: string;
  userId: string | null;
  status: AccountDeletionStatus;
  requestedAt: string;
  identityVerifiedAt: string | null;
  processingStartedAt: string | null;
  completedAt: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * ADR-033 uyarınca silme işleminin yürütüleceği katı hiyerarşik sıra.
 * İlişkisel bütünlük ve kısmi hata telafisi için bu sıra korunmalıdır.
 */
export const DELETION_TABLE_ORDER = [
  'account_deletion_requests', // 1. Talep oluşturulur ve 'processing' işaretlenir
  'portfolio_entries',        // 2. Portföy kayıtları fiziksel silinir
  'user_preferences',          // 3. Kullanıcı tercihleri fiziksel silinir
  'user_legal_events',         // 4. Yasal olaylar anonimleştirilir (user_id -> NULL)
  'security_events',           // 5. Güvenlik olayları anonimleştirilir (user_id -> NULL)
  'user_profiles',             // 6. Profil kaydı fiziksel silinir
  'auth.users',                // 7. Supabase Auth hesabı silinir
] as const;

/**
 * Fiziksel olarak silinecek (tüm satırları yok edilecek) tablolar.
 */
export const PURGED_TABLES = [
  'portfolio_entries',
  'user_preferences',
  'user_profiles',
  'auth.users',
] as const;

/**
 * Hukuki saklama veya güvenlik denetimi için user_id alanı NULL yapılarak
 * kimliği belirli/belirlenebilir kişiden koparılan (anonimleştirilen) tablolar.
 */
export const ANONYMIZED_TABLES = [
  'user_legal_events',
  'security_events',
  'account_deletion_requests',
] as const;

export function isValidDeletionStatus(status: unknown): status is AccountDeletionStatus {
  return (
    typeof status === 'string' &&
    (ACCOUNT_DELETION_STATUSES as readonly string[]).includes(status as AccountDeletionStatus)
  );
}

/**
 * Tamamlanan silme kaydının KVKK veri minimizasyonu uyarınca
 * kişisel veri (PII: e-posta, ad-soyad, şifre, portföy detayı vb.) içermediğini doğrular.
 */
export function validateDeletionRecordPiiFree(record: Partial<AccountDeletionRequest>): {
  isPiiFree: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Kayıt üzerinde yasaklı kişisel veri anahtarları kontrolü
  const forbiddenKeys = ['email', 'password', 'displayName', 'full_name', 'phone', 'asset', 'amount'];
  const recordObj = record as Record<string, unknown>;

  for (const key of forbiddenKeys) {
    if (key in recordObj && recordObj[key] !== undefined && recordObj[key] !== null) {
      violations.push(`Silme tamamlama kaydında kişisel veri alanı bulundu: ${key}`);
    }
  }

  // failureMessage içinde hassas token/şifre kontrolü
  if (record.failureMessage) {
    const sensitiveWords = ['token', 'secret', 'password', 'bearer', 'key'];
    const lowerMessage = record.failureMessage.toLowerCase();
    for (const word of sensitiveWords) {
      if (lowerMessage.includes(word)) {
        violations.push(`Hata mesajında hassas bilgi bulundu: ${word}`);
      }
    }
  }

  return {
    isPiiFree: violations.length === 0,
    violations,
  };
}

export function mapRowToAccountDeletionRequest(row: any): AccountDeletionRequest {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    status: (row.status as AccountDeletionStatus) || 'requested',
    requestedAt: row.requested_at,
    identityVerifiedAt: row.identity_verified_at ?? null,
    processingStartedAt: row.processing_started_at ?? null,
    completedAt: row.completed_at ?? null,
    failureCode: row.failure_code ?? null,
    failureMessage: row.failure_message ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
