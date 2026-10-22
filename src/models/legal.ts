/**
 * Altın İz — Yasal Belgeler ve Gizlilik Veri Modelleri
 * src/models/legal.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 17 & docs/PRIVACY.md
 * Veritabanı Tablosu: public.legal_documents
 * Karar Referansı: docs/DECISIONS.md & docs/DATA_RETENTION.md
 */

export type LegalDocumentType =
  | 'kvkk_notice'
  | 'privacy_policy'
  | 'terms_of_use'
  | 'data_retention'
  | 'financial_disclaimer'
  | 'explicit_consent';

export const LEGAL_DOCUMENT_TYPES: readonly LegalDocumentType[] = [
  'kvkk_notice',
  'privacy_policy',
  'terms_of_use',
  'data_retention',
  'financial_disclaimer',
  'explicit_consent',
] as const;

export const LEGAL_DOCUMENT_TITLES: Record<LegalDocumentType, string> = {
  kvkk_notice: 'KVKK Aydınlatma Metni',
  privacy_policy: 'Gizlilik Politikası',
  terms_of_use: 'Kullanım Koşulları',
  data_retention: 'Veri Saklama ve İmha Politikası',
  financial_disclaimer: 'Finansal Bilgilendirme ve Sorumluluk Reddi',
  explicit_consent: 'Açık Rıza Metni',
};

export interface LegalDocument {
  id: string;
  documentType: LegalDocumentType;
  version: string;
  title: string;
  content: string;
  contentHash: string;
  isActive: boolean;
  requiresAction: boolean;
  publishedAt: string | null;
  effectiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export type LegalEventType =
  | 'presented'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'withdrawn';

export const LEGAL_EVENT_TYPES: readonly LegalEventType[] = [
  'presented',
  'viewed',
  'accepted',
  'declined',
  'withdrawn',
] as const;

export type LegalEventSource =
  | 'registration'
  | 'settings'
  | 'document_update'
  | 'account_deletion';

export const LEGAL_EVENT_SOURCES: readonly LegalEventSource[] = [
  'registration',
  'settings',
  'document_update',
  'account_deletion',
] as const;

/**
 * KVKK ve Hukuki İlkelere Uygun Belge-Olay Eşleşme Tablosu
 * Referans: docs/PRIVACY.md Bölüm 26 & docs/TODO.md Faz 11.2
 *
 * Hukuki Kurallar:
 * 1. Aydınlatma Metni (kvkk_notice): Tek taraflı yasal bilgilendirme yükümlülüğüdür (KVKK m. 10).
 *    Onay veya ret kutusuna dönüştürülemez (Aydınlatmayı açık rıza onayına dönüştürme yasağı).
 *    Yalnızca 'presented' (sunuldu) veya 'viewed' (görüntülendi) olabilir.
 * 2. Gizlilik Politikası, Veri Saklama ve Finansal Sorumluluk Reddi: Bilgilendirici metinlerdir.
 * 3. Kullanım Koşulları (terms_of_use): Sözleşme akdi gereği 'accepted' (kabul edildi) olabilir.
 * 4. Açık Rıza Metni (explicit_consent): İsteğe bağlıdır; 'accepted', 'declined' ve 'withdrawn' olabilir.
 */
export const ALLOWED_DOCUMENT_EVENTS: Record<LegalDocumentType, readonly LegalEventType[]> = {
  kvkk_notice: ['presented', 'viewed'],
  privacy_policy: ['presented', 'viewed'],
  terms_of_use: ['presented', 'viewed', 'accepted'],
  data_retention: ['presented', 'viewed'],
  financial_disclaimer: ['presented', 'viewed'],
  explicit_consent: ['presented', 'viewed', 'accepted', 'declined', 'withdrawn'],
};

export interface UserLegalEvent {
  id: string;
  userId: string | null;
  documentId: string;
  eventType: LegalEventType;
  eventAt: string;
  documentVersion: string;
  source: LegalEventSource;
  appVersion: string | null;
  createdAt: string;
}

export function isValidDocumentType(type: unknown): type is LegalDocumentType {
  return (
    typeof type === 'string' &&
    (LEGAL_DOCUMENT_TYPES as readonly string[]).includes(type)
  );
}

export function isValidEventType(type: unknown): type is LegalEventType {
  return (
    typeof type === 'string' &&
    (LEGAL_EVENT_TYPES as readonly string[]).includes(type as LegalEventType)
  );
}

export function isValidEventSource(source: unknown): source is LegalEventSource {
  return (
    typeof source === 'string' &&
    (LEGAL_EVENT_SOURCES as readonly string[]).includes(source as LegalEventSource)
  );
}

/**
 * KVKK md. 10 uyarınca Aydınlatma Metninin Açık Rızaya dönüştürülmesini engelleyen
 * ve olay-belge türü uyumunu denetleyen hukuki doğrulama fonksiyonu.
 */
export function validateConsentSeparation(
  documentType: LegalDocumentType,
  eventType: LegalEventType
): { isValid: boolean; error?: string } {
  // 1. Kural: Aydınlatma metni asla onay veya ret alamaz (KVKK md. 10 vs md. 5/6 ayrımı)
  if (documentType === 'kvkk_notice' && (eventType === 'accepted' || eventType === 'declined' || eventType === 'withdrawn')) {
    return {
      isValid: false,
      error: 'KVKK Aydınlatma Metni tek taraflı bir bilgilendirme yükümlülüğüdür; açık rıza onayına veya onay kutusuna dönüştürülemez (KVKK m. 10).',
    };
  }

  // 2. Kural: Rıza geri çekme ve ret yalnızca Açık Rıza metninde geçerlidir
  if (documentType !== 'explicit_consent' && (eventType === 'declined' || eventType === 'withdrawn')) {
    return {
      isValid: false,
      error: 'Rıza reddi veya geri çekme olayı yalnızca Açık Rıza Metni (explicit_consent) için uygulanabilir.',
    };
  }

  // 3. Kural: İzin verilen olay türleri kontrolü
  const allowed = ALLOWED_DOCUMENT_EVENTS[documentType];
  if (!allowed || !allowed.includes(eventType)) {
    return {
      isValid: false,
      error: `'${documentType}' belge türü için '${eventType}' yasal olayı hukuken geçersizdir.`,
    };
  }

  return { isValid: true };
}

export function mapRowToUserLegalEvent(row: any): UserLegalEvent {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    documentId: row.document_id,
    eventType: (row.event_type as LegalEventType) || 'viewed',
    eventAt: row.event_at,
    documentVersion: row.document_version,
    source: (row.source as LegalEventSource) || 'settings',
    appVersion: row.app_version ?? null,
    createdAt: row.created_at,
  };
}

export function mapRowToLegalDocument(row: any): LegalDocument {
  return {
    id: row.id,
    documentType: (row.document_type as LegalDocumentType) || 'terms_of_use',
    version: row.version,
    title: row.title || LEGAL_DOCUMENT_TITLES[row.document_type as LegalDocumentType] || 'Yasal Belge',
    content: row.content,
    contentHash: row.content_hash,
    isActive: Boolean(row.is_active),
    requiresAction: Boolean(row.requires_action),
    publishedAt: row.published_at ?? null,
    effectiveAt: row.effective_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Belge metninin SHA-256 özet değerini (content_hash) üretir.
 * Web Crypto API (crypto.subtle) kullanır; bulunamazsa deterministik karma üretir.
 */
export async function computeContentHash(content: string): Promise<string> {
  const normalized = content.trim();

  if (
    typeof crypto !== 'undefined' &&
    crypto.subtle &&
    typeof crypto.subtle.digest === 'function'
  ) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Crypto hatasında yedek karma hesaplayıcıya düş
    }
  }

  // Deterministik 64 karakter karma algoritması (Fallback)
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `fallback_${part1}${part2}`.padEnd(64, '0');
}

/**
 * Çevrimdışı ve başlangıç durumları için şablon yasal metinler (KI-025 uyarısı kapsamındadır)
 */
export const FALLBACK_LEGAL_DOCUMENTS: Record<LegalDocumentType, { title: string; content: string; version: string }> = {
  kvkk_notice: {
    title: 'KVKK Aydınlatma Metni',
    version: '1.0-dev',
    content: `Altın İz — 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni

1. Veri Sorumlusu:
Altın İz uygulaması olarak kişisel verilerinizin güvenliğine ve gizliliğine azami önem veriyoruz.

2. İşlenen Kişisel Veriler:
Uygulama kapsamında yalnızca hizmetin sunulması için zorunlu olan e-posta adresi, oturum bilgileri, isteğe bağlı görünen ad ve kişisel altın portföy kayıtları işlenmektedir. Kimlik numarası, banka hesabı veya kredi kartı bilgisi toplanmaz.

3. Veri İşleme Amaçları:
Kullanıcı hesabı oluşturulması, güvenli oturum sağlanması, altın portföyü takibi ve yasal yükümlülüklerin yerine getirilmesi.

4. İlgili Kişinin Hakları:
KVKK'nın 11. maddesi uyarınca dilediğiniz zaman verilerinize erişebilir, güncelleyebilir veya hesabınızı silerek verilerinizin imha edilmesini talep edebilirsiniz.`,
  },
  privacy_policy: {
    title: 'Gizlilik Politikası',
    version: '1.0-dev',
    content: `Altın İz — Gizlilik Politikası

1. Genel İlkeler:
Altın İz, kullanıcı gizliliğini temel bir hak olarak kabul eder. Verileriniz üçüncü taraf reklam şirketleriyle asla paylaşılmaz veya satılmaz.

2. Veri Güvenliği:
Verileriniz PostgreSQL Row Level Security (RLS) teknolojisiyle yalnızca sizin hesabınıza özel olarak şifreli ve güvenli biçimde saklanır.

3. Çerezler ve Takip:
Uygulama içinde reklam amaçlı izleme çerezleri veya üçüncü taraf takipçiler kullanılmaz.

4. Politika Değişiklikleri:
Gizlilik politikasındaki güncellemeler uygulama üzerinden ve yasal belgeler sekmesinden kullanıcılara bildirilir.`,
  },
  terms_of_use: {
    title: 'Kullanım Koşulları',
    version: '1.0-dev',
    content: `Altın İz — Kullanım Koşulları

1. Kabul ve Koşullar:
Altın İz uygulamasını indirerek ve kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız.

2. Hizmetin Niteliği:
Altın İz, piyasa altın fiyatlarını takip etme ve kişisel altın birikimlerinizi kaydetme imkânı sunan bilgilendirme amaçlı bir mobil uygulamadır.

3. Kullanıcı Sorumluluğu:
Kullanıcı, hesap şifresinin güvenliğinden ve girdiği portföy verilerinin doğruluğundan bizzat sorumludur.`,
  },
  data_retention: {
    title: 'Veri Saklama ve İmha Politikası',
    version: '1.0-dev',
    content: `Altın İz — Veri Saklama ve İmha Politikası

1. Saklama Süreleri:
Kişisel verileriniz ve portföy kayıtlarınız, kullanıcı hesabınız aktif olduğu müddetçe güvenli veritabanımızda saklanır.

2. Hesap Silme ve Veri İmhası:
Hesabınızı silme talebinde bulunduğunuzda, portföy kayıtlarınız ve profil bilgileriniz geri alınamaz biçimde silinir.

3. Güvenlik Olayları:
Yetkisiz erişim denemeleri gibi güvenlik olay kayıtları, yasal yükümlülükler doğrultusunda 1 yıl süreyle saklanır ve ardından otomatik olarak imha edilir.`,
  },
  financial_disclaimer: {
    title: 'Finansal Bilgilendirme ve Sorumluluk Reddi',
    version: '1.0-dev',
    content: `Altın İz — Finansal Bilgilendirme ve Sorumluluk Reddi

1. Yatırım Tavsiyesi Değildir:
Altın İz uygulamasında sunulan altın alış-satış fiyatları, hesaplama araçları ve portföy kâr-zarar tahminleri yalnızca bilgilendirme amaçlıdır. Sermaye Piyasası Kanunu kapsamında kesinlikle yatırım danışmanlığı veya tavsiyesi niteliği taşımaz.

2. Fiyatların Gösterge Niteliği:
Piyasa fiyatları serbest piyasa ve sağlayıcı verilerine dayanır; anlık kur farkları, kuyumcu marjları veya işçilik giderleri nedeniyle fiziksel alım-satım noktalarında farklılık gösterebilir.

3. Sorumluluk Sınırı:
Uygulamadaki verilere dayanarak alınan alım-satım kararlarından ve doğabilecek kâr veya zararlardan Altın İz sorumlu tutulamaz.`,
  },
  explicit_consent: {
    title: 'Açık Rıza Metni',
    version: '1.0-dev',
    content: `Altın İz — Açık Rıza Metni

Kişisel verilerimin KVKK Aydınlatma Metni'nde belirtilen kapsam ve ilkeler çerçevesinde, yalnızca seçtiğim hizmetlerin sunulabilmesi amacıyla işlenmesini özgür irademle kabul ediyorum.`,
  },
};
