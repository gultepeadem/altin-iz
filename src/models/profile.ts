/**
 * Altın İz — Kullanıcı Profili Modeli
 *
 * Veritabanı Şeması Referansı: docs/DATABASE.md Bölüm 6 (user_profiles Tablosu)
 */

export type AccountStatus = 'active' | 'deletion_pending' | 'disabled';

export interface UserProfile {
  userId: string;
  displayName: string | null;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export const MAX_DISPLAY_NAME_LENGTH = 50;

export function validateDisplayName(name: string | null | undefined): { isValid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { isValid: true };
  }
  const trimmed = name.trim();
  if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Görünen ad en fazla ${MAX_DISPLAY_NAME_LENGTH} karakter olabilir.`,
    };
  }
  return { isValid: true };
}

export function mapRowToUserProfile(row: any): UserProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name ?? null,
    accountStatus: (row.account_status as AccountStatus) || 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
