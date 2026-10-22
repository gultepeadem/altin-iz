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
