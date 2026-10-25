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
  "kvkk_notice": {
    "title": "KVKK Aydınlatma Metni",
    "version": "1.0.0",
    "content": "# Altın İz — 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni\n\nBu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") m. 10 uyarınca, veri sorumlusu sıfatıyla Altın İz (\"Altın İz\" veya \"Uygulama\") tarafından, mobil uygulamamızı kullanan kullanıcılarımızın (\"Kullanıcı\") kişisel verilerinin toplanması, işlenmesi, saklanması ve haklarına ilişkin bilgilendirilmesi amacıyla hazırlanmıştır.\n\n## 1. Veri Sorumlusu\nAltın İz mobil uygulaması nezdinde işlenen kişisel verileriniz bakımından veri sorumlusu Altın İz yönetim ekibidir. Resmi iletişim ve veri koruma irtibat e-postası: adem@altiniz.app'dir.\n\n## 2. İşlenen Kişisel Veriler ve Toplama Amaçları\nUygulamamız veri minimizasyonu (asgari veri) ilkesini benimsemiştir. Yalnızca hizmetin ifası için zorunlu olan veriler işlenir:\n- Hesap Bilgileri: E-posta adresi, şifrelenmiş parola özeti (hash), isteğe bağlı profil görünen adı.\n- Portföy Verileri: Kullanıcı tarafından sisteme kaydedilen altın türü, miktarı, alım tarihi ve birim/toplam maliyet tutarları.\n- İşlem ve Güvenlik Bilgileri: Oturum belirteçleri (JWT), kimlik doğrulama logları, IP adresi, cihaz modeli ve işletim sistemi sürümü (hata takibi ve hesap güvenliği için).\n- Yasal İzin Kayıtları: Kullanım koşulları onayı, açık rıza durumu ve yasal metinlerin görüntülenme zaman damgaları.\n\nBu veriler; kullanıcı hesabı oluşturulması, oturum güvenliğinin sağlanması, altın portföyünün değerlenmesi ve kâr-zarar analizlerinin hesaplanması, yasal mevzuattan doğan bilgi saklama yükümlülüklerinin karşılanması amaçlarıyla işlenmektedir.\n\n## 3. Kişisel Veri Toplamanın Hukuki Sebepleri\nKişisel verileriniz, KVKK'nın 5. maddesinin 2. fıkrasında belirtilen:\n- c bendi: Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (Kullanım Koşulları kapsamında portföy takip hizmetinin sunulması),\n- ç bendi: Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi,\n- f bendi: İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması (hesap güvenliği, dolandırıcılığın önlenmesi)\nhukuki sebeplerine dayalı olarak tamamen veya kısmen otomatik yollarla doğrudan mobil uygulama arayüzünden toplanmaktadır.\n\n## 4. Kişisel Verilerin Aktarılması\nKişisel verileriniz kesinlikle üçüncü şahıslara, veri simsarlarına veya ticari reklam ağlarına satılmaz, kiralanmaz ve ticari amaçla aktarılmaz. Verileriniz yalnızca:\n- Hizmetin barındırıldığı güvenli bulut altyapısı sağlayıcımız (Supabase / AWS Frankfurt bölgesi - SOC2/ISO 27001 sertifikalı) nezdinde şifrelenmiş olarak saklanır.\n- Yasal bir zorunluluk halinde veya yetkili adli/idari makamlarca usulüne uygun talep edilmesi durumunda adli mercilerle paylaşılabilir.\n\n## 5. Veri Güvenliği Önlemleri\nVerileriniz veritabanı seviyesinde Row Level Security (RLS) ile korunmakta olup, hiçbir kullanıcı bir başka kullanıcının portföy kaydına veya profiline erişemez. Ağ trafiği TLS 1.3 şifreleme protokolüyle güvence altındadır.\n\n## 6. KVKK Kapsamındaki Haklarınız (Madde 11)\nKVKK'nın 11. maddesi uyarınca her Kullanıcı;\n- Kişisel verilerinin işlenip işlenmediğini öğrenme,\n- Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,\n- İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,\n- Verilerin eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,\n- Verilerin silinmesini veya yok edilmesini talep etme (Uygulama içi Hesap Yönetimi > Hesabımı Sil adımı ile anında silinebilir),\n- Kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme\nhaklarına sahiptir.\n\nHaklarınıza ilişkin tüm taleplerinizi adem@altiniz.app adresine yazılı olarak iletebilirsiniz. Başvurularınız en geç 30 (otuz) gün içerisinde ücretsiz olarak sonuçlandırılacaktır."
  },
  "privacy_policy": {
    "title": "Gizlilik Politikası",
    "version": "1.0.0",
    "content": "# Altın İz — Gizlilik Politikası\n\nSon Güncelleme: 25 Ekim 2026\nSürüm: 1.0.0\n\nAltın İz (\"biz\", \"uygulamamız\") olarak kullanıcılarımızın kişisel gizliliğini en temel hak olarak kabul ediyoruz. Bu Gizlilik Politikası, uygulamamızı kullandığınızda kişisel verilerinizin nasıl toplandığını, korunduğunu ve kullanıldığını açıklar.\n\n## 1. Temel Gizlilik İlkemiz\nAltın İz, kullanıcılarını reklam verenlere pazarlayan bir platform değildir.\n- Uygulamamızda hiçbir üçüncü taraf reklam SDK'sı (Google AdMob, Facebook Audience Network vb.) yer almaz.\n- Davranışsal reklam hedeflemesi veya kişisel profil çıkarma yapılmaz.\n- Verileriniz asla satılmaz ve üçüncü taraflara ticari amaçlarla devredilmez.\n\n## 2. Toplanan Bilgiler\n- Hesap ve İletişim Bilgileri: Kayıt olurken sağladığınız e-posta adresi ve şifreniz (şifreniz veritabanımızda tuzlanmış tek yönlü kriptografik karma - bcrypt olarak tutulur, açık metin olarak asla görülmez).\n- Finansal Takip Bilgileri: Altın portföyünüze kendi isteğinizle girdiğiniz altın türü, adedi/gramı, alım tarihi ve alış maliyeti. Kredi kartı, banka hesap numarası veya kimlik numarası (T.C. Kimlik vb.) asla talep edilmez ve toplanmaz.\n- Teknik Tanılama Verileri: Uygulama çökmelerini ve performans sorunlarını tespit etmek amacıyla anonimleştirilmiş hata raporları ve temel işletim sistemi/cihaz modeli bilgisi.\n\n## 3. Bilgilerin Kullanım Amacı\nToplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:\n- Kullanıcı hesabınızı doğrulamak ve güvenli giriş sağlamak,\n- Eklediğiniz altın varlıklarının güncel piyasa fiyatlarıyla değerlemesini ve kâr/zarar durumunu hesaplamak,\n- Uygulama ayarlarınızı ve tercihlerinizi (tema, bildirimler) hatırlamak,\n- Olası siber saldırıları, kötüye kullanımları engellemek ve sistem güvenliğini sağlamak.\n\n## 4. Veri İzolasyonu ve Güvenlik (Row Level Security)\nAltın İz veritabanı, PostgreSQL Row Level Security (RLS) mimarisiyle yapılandırılmıştır. Her kullanıcının portföy ve profil kayıtları, yalnızca kendisinin sahip olduğu şifreli oturum anahtarıyla açılır. Hiçbir kullanıcı veya yetkisiz istemci başka bir kullanıcının varlıklarını göremez veya değiştiremez.\n\n## 5. Çerezler ve Yerel Depolama\nMobil uygulamamızda web izleme çerezleri kullanılmaz. Yalnızca oturumunuzun açık kalmasını sağlayan güvenli erişim belirteçleri (JWT tokens) cihazınızın güvenli depolama alanında (SecureStore / Keystore / Keychain) şifrelenerek muhafaza edilir.\n\n## 6. Hesabınızı ve Verilerinizi Silme Hakkı\nApple App Store ve Google Play gizlilik standartları gereğince; hesabınızı ve ilişkili tüm portföy verilerinizi hiçbir onay veya gecikme olmaksızın uygulama içerisinden (Ayarlar > Hesap Yönetimi > Hesabımı Sil) anında ve kalıcı olarak silebilirsiniz. Silme işlemi tamamlandığında verileriniz sunucularımızdan geri döndürülemez biçimde yok edilir.\n\n## 7. İletişim\nGizlilik politikamız veya kişisel verilerinizle ilgili her türlü soru, görüş ve başvurularınız için bizimle iletişime geçebilirsiniz:\nE-posta: adem@altiniz.app"
  },
  "terms_of_use": {
    "title": "Kullanım Koşulları",
    "version": "1.0.0",
    "content": "# Altın İz — Kullanım Koşulları\n\nSon Güncelleme: 25 Ekim 2026\nSürüm: 1.0.0\n\nLütfen Altın İz mobil uygulamasını (\"Uygulama\") kullanmadan önce bu Kullanım Koşullarını (\"Koşullar\") dikkatlice okuyunuz. Uygulamayı indirerek, hesap oluşturarak veya kullanarak bu koşulların tamamını kabul etmiş sayılırsınız.\n\n## 1. Taraflar ve Hizmetin Niteliği\nBu sözleşme, Kullanıcı ile Altın İz yönetimi arasındadır. Altın İz; kullanıcıların serbest piyasa altın fiyatlarını takip etmelerini, kişisel altın birikimlerini kayıt altına alarak tahmini kâr/zarar durumlarını hesaplamalarını sağlayan bir kişisel finans ve portföy takip aracıdır.\n\n## 2. Kullanım Şartları ve Hesap Güvenliği\n- Kullanıcı, kayıt esnasında geçerli ve kendisine ait bir e-posta adresi bildirmekle yükümlüdür.\n- Kullanıcı hesabının ve şifresinin güvenliğinden bizzat sorumludur. Hesabınızın yetkisiz kişilerce kullanıldığını fark ederseniz derhal adem@altiniz.app adresine bildirmelisiniz.\n- Uygulamanın güvenliğini tehdit edecek tersine mühendislik, kaynak koda dönüştürme (decompilation), otomatik bot veya yetkisiz veri çekme (scraping) girişimleri kesinlikle yasaktır ve hukuki yaptırıma tabidir.\n\n## 3. Portföy Kayıtları ve Değerleme Mantığı\n- Portföyünüzde yer alan altın alım kayıtları, miktar ve maliyet bilgileri tamamen kullanıcı beyanına dayanır.\n- Kâr ve zarar hesaplamaları, Kapalıçarşı serbest piyasa sağlayıcılarından alınan güncel alış (bozdurma) fiyatları üzerinden yaklaşık değer olarak gösterilir.\n- Altın İz V1 sürümünde silinen portföy kayıtları satış geçmişi oluşturmaz; kaydınız portföyünüzden tamamen kaldırılır.\n\n## 4. Fikri Mülkiyet Hakları\nAltın İz adı, logosu, uygulama arayüzü tasarımı, grafik varlıkları, kaynak kodları ve veritabanı mimarisi 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile uluslararası telif hakları mevzuatı uyarınca korunmaktadır. Yazılı izin alınmaksızın kopyalanamaz, çoğaltılamaz veya dağıtılamaz.\n\n## 5. Sorumluluk Sınırlandırması\nAltın İz, piyasa veri sağlayıcılarından kaynaklanan gecikmeler, iletişim hattı kesintileri veya donanımsal aksaklıklar sebebiyle verilerin anlık yansıtılamamasından doğabilecek zararlardan sorumlu tutulamaz. Uygulama \"olduğu gibi\" (as-is) sunulmaktadır.\n\n## 6. Değişiklikler ve Yürürlük\nAltın İz, mevzuat değişiklikleri veya yeni özellikler doğrultusunda bu Kullanım Koşullarını güncelleme hakkını saklı tutar. Önemli değişiklikler uygulama içerisinden kullanıcılara duyurulur.\n\n## 7. Uygulanacak Hukuk ve Yetki\nBu koşulların uygulanmasında ve yorumlanmasında Türkiye Cumhuriyeti Hukuku geçerlidir. Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.\n\nİletişim: adem@altiniz.app"
  },
  "financial_disclaimer": {
    "title": "Finansal Bilgilendirme ve Sorumluluk Reddi",
    "version": "1.0.0",
    "content": "# Altın İz — Finansal Bilgilendirme ve Sorumluluk Reddi\n\nSon Güncelleme: 25 Ekim 2026\nSürüm: 1.0.0\n\n## 1. YASAL UYARI: YATIRIM TAVSİYESİ DEĞİLDİR\nAltın İz uygulamasında sunulan altın alış ve satış fiyatları, grafikler, portföy kâr/zarar analizleri ve hesaplama araçları yalnızca kişisel bilgilendirme amacıyla sunulmaktadır.\n\n6362 sayılı Sermaye Piyasası Kanunu ve ilgili mevzuat uyarınca; Altın İz uygulamasında yer alan hiçbir bilgi, yorum veya hesaplama sonucu kesinlikle YATIRIM DANIŞMANLIĞI VEYA YATIRIM TAVSİYESİ DEĞİLDİR.\n\nYatırım danışmanlığı hizmeti; aracı kurumlar, portföy yönetim şirketleri, mevduat kabul etmeyen bankalar ile müşteri arasında imzalanacak yatırım danışmanlığı sözleşmesi çerçevesinde sunulmaktadır.\n\n## 2. Piyasa Verilerinin Gösterge Niteliği\n- Uygulamada gösterilen altın fiyatları serbest piyasa ve sağlayıcı verilerinden derlenmektedir.\n- Altın fiyatları anlık olarak değişkenlik gösterebilir; bankalar, Kapalıçarşı esnafı, kuyumcular veya yetkili döviz bürolarının uyguladığı makas aralıkları (spread), işçilik giderleri, saflık derecesi veya komisyonlar nedeniyle fiziksel işlem noktalarındaki fiyatlar ile uygulama fiyatları arasında farklılıklar bulunabilir.\n- Altın İz, fiyat verilerinin yüzde yüz doğruluğunu, eksiksizliğini veya kesintisiz iletileceğini garanti etmez.\n\n## 3. Kullanıcı Sorumluluğu\nUygulamada yer alan verilere, portföy kâr/zarar oranlarına veya hesaplama tablolarına dayanarak alacağınız her türlü yatırım, birikim, alım-satım veya borçlanma kararı tamamen kendi hür iradeniz ve sorumluluğunuzdadır.\n\nBu kararlar neticesinde doğrudan ya da dolaylı olarak ortaya çıkabilecek herhangi bir maddi veya manevi zarardan, kâr mahrumiyetinden Altın İz, geliştiricileri veya yöneticileri hiçbir ad altında hukuki veya cezai olarak sorumlu tutulamaz.\n\n## 4. Karar Almadan Önce\nHerhangi bir finansal işlem yapmadan önce bağımsız lisanslı bir finans danışmanına danışmanız, güncel fiyatları işlem yapacağınız kuyumcu veya yetkili finans kuruluşundan teyit etmeniz önemle tavsiye olunur.\n\nİletişim: adem@altiniz.app"
  },
  "data_retention": {
    "title": "Veri Saklama ve İmha Politikası",
    "version": "1.0.0",
    "content": "# Altın İz — Veri Saklama ve İmha Politikası\n\nSon Güncelleme: 25 Ekim 2026\nSürüm: 1.0.0\n\nBu Veri Saklama ve İmha Politikası (\"Politika\"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ve Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik gereğince; Altın İz tarafından toplanan kişisel verilerin saklanma sürelerini ve silinme süreçlerini açıklar.\n\n## 1. Veri Saklama İlkeleri\nAltın İz, kişisel verileri yalnızca işlendikleri amaç için gerekli olan süre boyunca veya ilgili mevzuatta öngörülen yasal süreler sınırında saklar. Amacı sona eren, yasal saklama yükümlülüğü kalmayan veriler gecikmeksizin güvenli yöntemlerle imha edilir.\n\n## 2. Veri Kategorileri ve Saklama Süreleri\n- Kullanıcı Profil ve Hesap Bilgileri: Kullanıcı hesabı aktif kaldığı sürece saklanır. Hesap kapatıldığında derhal silinir.\n- Portföy ve Varlık Kayıtları: Kullanıcı tarafından girilen altın kayıtları, kullanıcı kaydı sildiği veya hesabını kapattığı anda derhal ve kalıcı olarak imha edilir.\n- Yasal İzin ve Rıza Kayıtları (user_legal_events): KVKK ve Türk Ticaret Kanunu uyarınca ispat yükümlülüğü gereğince hesap kapatılmasını takiben 3 (üç) yıl süreyle güvenli arşivde saklanır ve ardından imha edilir.\n- Güvenlik ve Sistem Olay Logları (security_audit_logs): Siber güvenlik ve yetkisiz erişim denetimleri kapsamında 5651 sayılı mevzuat uyarınca en fazla 1 (bir) yıl süreyle tutulur ve otomatik temizleme mekanizmasıyla yok edilir.\n\n## 3. Veri İmha Yöntemleri\n- Silme (Deletion): Veritabanı kayıtlarının kriptografik olarak üzerine yazılarak kullanıcı ve uygulama katmanından tamamen kaldırılması.\n- Yok Etme (Destruction): Dijital ortamdaki verilerin geri getirilemeyecek şekilde sıfırlanması ve disk bloklarının güvenli temizliği.\n- Anonimleştirme: Verinin hiçbir surette belirli veya belirlenebilir bir gerçek kişiyle ilişkilendirilemeyecek hale getirilmesi.\n\n## 4. Kullanıcı Talebiyle Anında Hesap ve Veri İmhası\nKullanıcı, dilediği an uygulama içerisinden (Ayarlar > Hesap Yönetimi > Hesabımı Sil) talepte bulunabilir. Bu talep doğrultusunda kullanıcının tüm portföy girdileri, profil verileri ve oturum yetkileri atomik veritabanı fonksiyonu (`execute_account_deletion`) vasıtasıyla anında ve geri alınamaz biçimde imha edilir.\n\n## 5. İletişim\nVeri saklama ve imha politikamıza ilişkin bilgi almak için: adem@altiniz.app"
  },
  "explicit_consent": {
    "title": "Açık Rıza Metni",
    "version": "1.0.0",
    "content": "# Altın İz — Açık Rıza Metni\n\nSon Güncelleme: 25 Ekim 2026\nSürüm: 1.0.0\n\n6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") kapsamında hazırlanan KVKK Aydınlatma Metni'ni okudum ve anladım.\n\nAltın İz uygulamasının sunduğu:\n1. Kişisel altın birikimlerimin ve işlem geçmişimin güvenli biçimde saklanması,\n2. Anlık piyasa fiyatları doğrultusunda portföy değerleme ve tahmini kâr/zarar hesaplama özelliklerinin kişiselleştirilmiş olarak sunulması,\n3. Tercih ettiğim altın türlerine ve portföyümdeki varlıklara ilişkin güncel piyasa bildirimlerinin ve durum özetlerinin tarafıma iletilmesi\n\namaçlarıyla sınırlı olmak üzere, paylaştığım kişisel verilerimin KVKK'ya ve ilgili mevzuata uygun olarak işlenmesine ve güvenli bulut altyapısında şifreli olarak muhafaza edilmesine ÖZGÜR İRADEMLE AÇIK RIZA VERİYORUM.\n\nBilgilendirme: Bu açık rıza metnini kabul etmek tamamen isteğe bağlıdır. Vermiş olduğunuz açık rızayı, mobil uygulama içerisindeki Ayarlar > Yasal Belgeler ve Gizlilik menüsünden veya adem@altiniz.app adresine e-posta göndererek hiçbir gerekçe göstermeksizin dilediğiniz an geri çekebilirsiniz."
  }
};
