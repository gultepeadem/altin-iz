-- Altın İz - Migration 012: Activate Missing Products, Sync Authentic Legal Documents and Refine Scheduler
-- Referans: docs/DATABASE.md, docs/API.md, docs/PRIVACY.md, docs/DECISIONS.md (ADR-017, ADR-018, ADR-033, ADR-035)

-- ============================================================================
-- 1. EKSİK ALTIN ÜRÜNLERİNİN AKTİF EDİLMESİ (gold_products)
-- ============================================================================
UPDATE public.gold_products
SET is_active = true,
    price_display_enabled = true,
    calculator_enabled = true,
    portfolio_enabled = true,
    updated_at = NOW()
WHERE code IN ('GOLD_18K', 'PACKAGED_GOLD_1G', 'PACKAGED_GOLD_2_5G', 'HAMIT_GOLD', 'RESAT_GOLD', 'REPUBLIC_GOLD');

-- ADR-018 Güvencesi: Ons Altın uluslararası göstergedir, portföye kesinlikle eklenemez
UPDATE public.gold_products
SET portfolio_enabled = false
WHERE code = 'OUNCE_GOLD';

-- ============================================================================
-- 2. FİYAT KAYNAĞI ÜRÜN EŞLEŞTİRMELERİNİN AKTİF EDİLMESİ (price_source_product_mappings)
-- ============================================================================
UPDATE public.price_source_product_mappings
SET is_active = true,
    updated_at = NOW()
WHERE external_symbol IN ('HAMIT_ALTIN', 'AYAR18', 'KULCE_1G', 'KULCE_2_5G', 'CUMHURIYET_ALTINI', 'RESAT_ALTIN');

-- ============================================================================
-- 3. GERÇEK VE GÜNCEL YASAL BELGELERİN EKLENMESİ (legal_documents)
-- ============================================================================
-- Önceki geliştirme/test sürümlerini pasife al
UPDATE public.legal_documents
SET is_active = false,
    updated_at = NOW()
WHERE is_active = true;


INSERT INTO public.legal_documents (
    document_type,
    version,
    title,
    content,
    content_hash,
    is_active,
    requires_action,
    published_at,
    effective_at
) VALUES (
    'kvkk_notice',
    '1.0.0',
    'KVKK Aydınlatma Metni',
    '# Altın İz — 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni

Bu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") m. 10 uyarınca, veri sorumlusu sıfatıyla Altın İz ("Altın İz" veya "Uygulama") tarafından, mobil uygulamamızı kullanan kullanıcılarımızın ("Kullanıcı") kişisel verilerinin toplanması, işlenmesi, saklanması ve haklarına ilişkin bilgilendirilmesi amacıyla hazırlanmıştır.

## 1. Veri Sorumlusu
Altın İz mobil uygulaması nezdinde işlenen kişisel verileriniz bakımından veri sorumlusu Altın İz yönetim ekibidir. Resmi iletişim ve veri koruma irtibat e-postası: adem@altiniz.app''dir.

## 2. İşlenen Kişisel Veriler ve Toplama Amaçları
Uygulamamız veri minimizasyonu (asgari veri) ilkesini benimsemiştir. Yalnızca hizmetin ifası için zorunlu olan veriler işlenir:
- Hesap Bilgileri: E-posta adresi, şifrelenmiş parola özeti (hash), isteğe bağlı profil görünen adı.
- Portföy Verileri: Kullanıcı tarafından sisteme kaydedilen altın türü, miktarı, alım tarihi ve birim/toplam maliyet tutarları.
- İşlem ve Güvenlik Bilgileri: Oturum belirteçleri (JWT), kimlik doğrulama logları, IP adresi, cihaz modeli ve işletim sistemi sürümü (hata takibi ve hesap güvenliği için).
- Yasal İzin Kayıtları: Kullanım koşulları onayı, açık rıza durumu ve yasal metinlerin görüntülenme zaman damgaları.

Bu veriler; kullanıcı hesabı oluşturulması, oturum güvenliğinin sağlanması, altın portföyünün değerlenmesi ve kâr-zarar analizlerinin hesaplanması, yasal mevzuattan doğan bilgi saklama yükümlülüklerinin karşılanması amaçlarıyla işlenmektedir.

## 3. Kişisel Veri Toplamanın Hukuki Sebepleri
Kişisel verileriniz, KVKK''nın 5. maddesinin 2. fıkrasında belirtilen:
- c bendi: Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (Kullanım Koşulları kapsamında portföy takip hizmetinin sunulması),
- ç bendi: Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi,
- f bendi: İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması (hesap güvenliği, dolandırıcılığın önlenmesi)
hukuki sebeplerine dayalı olarak tamamen veya kısmen otomatik yollarla doğrudan mobil uygulama arayüzünden toplanmaktadır.

## 4. Kişisel Verilerin Aktarılması
Kişisel verileriniz kesinlikle üçüncü şahıslara, veri simsarlarına veya ticari reklam ağlarına satılmaz, kiralanmaz ve ticari amaçla aktarılmaz. Verileriniz yalnızca:
- Hizmetin barındırıldığı güvenli bulut altyapısı sağlayıcımız (Supabase / AWS Frankfurt bölgesi - SOC2/ISO 27001 sertifikalı) nezdinde şifrelenmiş olarak saklanır.
- Yasal bir zorunluluk halinde veya yetkili adli/idari makamlarca usulüne uygun talep edilmesi durumunda adli mercilerle paylaşılabilir.

## 5. Veri Güvenliği Önlemleri
Verileriniz veritabanı seviyesinde Row Level Security (RLS) ile korunmakta olup, hiçbir kullanıcı bir başka kullanıcının portföy kaydına veya profiline erişemez. Ağ trafiği TLS 1.3 şifreleme protokolüyle güvence altındadır.

## 6. KVKK Kapsamındaki Haklarınız (Madde 11)
KVKK''nın 11. maddesi uyarınca her Kullanıcı;
- Kişisel verilerinin işlenip işlenmediğini öğrenme,
- Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,
- İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,
- Verilerin eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,
- Verilerin silinmesini veya yok edilmesini talep etme (Uygulama içi Hesap Yönetimi > Hesabımı Sil adımı ile anında silinebilir),
- Kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme
haklarına sahiptir.

Haklarınıza ilişkin tüm taleplerinizi adem@altiniz.app adresine yazılı olarak iletebilirsiniz. Başvurularınız en geç 30 (otuz) gün içerisinde ücretsiz olarak sonuçlandırılacaktır.',
    '29b55770438384ccc734eadbfe4b9acdd424b9ecd17be4b0abc2863412cd6416',
    true,
    false,
    NOW(),
    NOW()
)
ON CONFLICT (document_type, version) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_hash = EXCLUDED.content_hash,
    is_active = true,
    requires_action = false,
    published_at = EXCLUDED.published_at,
    effective_at = EXCLUDED.effective_at,
    updated_at = NOW();

INSERT INTO public.legal_documents (
    document_type,
    version,
    title,
    content,
    content_hash,
    is_active,
    requires_action,
    published_at,
    effective_at
) VALUES (
    'privacy_policy',
    '1.0.0',
    'Gizlilik Politikası',
    '# Altın İz — Gizlilik Politikası

Son Güncelleme: 25 Ekim 2026
Sürüm: 1.0.0

Altın İz ("biz", "uygulamamız") olarak kullanıcılarımızın kişisel gizliliğini en temel hak olarak kabul ediyoruz. Bu Gizlilik Politikası, uygulamamızı kullandığınızda kişisel verilerinizin nasıl toplandığını, korunduğunu ve kullanıldığını açıklar.

## 1. Temel Gizlilik İlkemiz
Altın İz, kullanıcılarını reklam verenlere pazarlayan bir platform değildir.
- Uygulamamızda hiçbir üçüncü taraf reklam SDK''sı (Google AdMob, Facebook Audience Network vb.) yer almaz.
- Davranışsal reklam hedeflemesi veya kişisel profil çıkarma yapılmaz.
- Verileriniz asla satılmaz ve üçüncü taraflara ticari amaçlarla devredilmez.

## 2. Toplanan Bilgiler
- Hesap ve İletişim Bilgileri: Kayıt olurken sağladığınız e-posta adresi ve şifreniz (şifreniz veritabanımızda tuzlanmış tek yönlü kriptografik karma - bcrypt olarak tutulur, açık metin olarak asla görülmez).
- Finansal Takip Bilgileri: Altın portföyünüze kendi isteğinizle girdiğiniz altın türü, adedi/gramı, alım tarihi ve alış maliyeti. Kredi kartı, banka hesap numarası veya kimlik numarası (T.C. Kimlik vb.) asla talep edilmez ve toplanmaz.
- Teknik Tanılama Verileri: Uygulama çökmelerini ve performans sorunlarını tespit etmek amacıyla anonimleştirilmiş hata raporları ve temel işletim sistemi/cihaz modeli bilgisi.

## 3. Bilgilerin Kullanım Amacı
Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:
- Kullanıcı hesabınızı doğrulamak ve güvenli giriş sağlamak,
- Eklediğiniz altın varlıklarının güncel piyasa fiyatlarıyla değerlemesini ve kâr/zarar durumunu hesaplamak,
- Uygulama ayarlarınızı ve tercihlerinizi (tema, bildirimler) hatırlamak,
- Olası siber saldırıları, kötüye kullanımları engellemek ve sistem güvenliğini sağlamak.

## 4. Veri İzolasyonu ve Güvenlik (Row Level Security)
Altın İz veritabanı, PostgreSQL Row Level Security (RLS) mimarisiyle yapılandırılmıştır. Her kullanıcının portföy ve profil kayıtları, yalnızca kendisinin sahip olduğu şifreli oturum anahtarıyla açılır. Hiçbir kullanıcı veya yetkisiz istemci başka bir kullanıcının varlıklarını göremez veya değiştiremez.

## 5. Çerezler ve Yerel Depolama
Mobil uygulamamızda web izleme çerezleri kullanılmaz. Yalnızca oturumunuzun açık kalmasını sağlayan güvenli erişim belirteçleri (JWT tokens) cihazınızın güvenli depolama alanında (SecureStore / Keystore / Keychain) şifrelenerek muhafaza edilir.

## 6. Hesabınızı ve Verilerinizi Silme Hakkı
Apple App Store ve Google Play gizlilik standartları gereğince; hesabınızı ve ilişkili tüm portföy verilerinizi hiçbir onay veya gecikme olmaksızın uygulama içerisinden (Ayarlar > Hesap Yönetimi > Hesabımı Sil) anında ve kalıcı olarak silebilirsiniz. Silme işlemi tamamlandığında verileriniz sunucularımızdan geri döndürülemez biçimde yok edilir.

## 7. İletişim
Gizlilik politikamız veya kişisel verilerinizle ilgili her türlü soru, görüş ve başvurularınız için bizimle iletişime geçebilirsiniz:
E-posta: adem@altiniz.app',
    'b264ea021e5a545a9406250ef93d18a68a233c78d9d44199db93e28fc4245c7a',
    true,
    false,
    NOW(),
    NOW()
)
ON CONFLICT (document_type, version) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_hash = EXCLUDED.content_hash,
    is_active = true,
    requires_action = false,
    published_at = EXCLUDED.published_at,
    effective_at = EXCLUDED.effective_at,
    updated_at = NOW();

INSERT INTO public.legal_documents (
    document_type,
    version,
    title,
    content,
    content_hash,
    is_active,
    requires_action,
    published_at,
    effective_at
) VALUES (
    'terms_of_use',
    '1.0.0',
    'Kullanım Koşulları',
    '# Altın İz — Kullanım Koşulları

Son Güncelleme: 25 Ekim 2026
Sürüm: 1.0.0

Lütfen Altın İz mobil uygulamasını ("Uygulama") kullanmadan önce bu Kullanım Koşullarını ("Koşullar") dikkatlice okuyunuz. Uygulamayı indirerek, hesap oluşturarak veya kullanarak bu koşulların tamamını kabul etmiş sayılırsınız.

## 1. Taraflar ve Hizmetin Niteliği
Bu sözleşme, Kullanıcı ile Altın İz yönetimi arasındadır. Altın İz; kullanıcıların serbest piyasa altın fiyatlarını takip etmelerini, kişisel altın birikimlerini kayıt altına alarak tahmini kâr/zarar durumlarını hesaplamalarını sağlayan bir kişisel finans ve portföy takip aracıdır.

## 2. Kullanım Şartları ve Hesap Güvenliği
- Kullanıcı, kayıt esnasında geçerli ve kendisine ait bir e-posta adresi bildirmekle yükümlüdür.
- Kullanıcı hesabının ve şifresinin güvenliğinden bizzat sorumludur. Hesabınızın yetkisiz kişilerce kullanıldığını fark ederseniz derhal adem@altiniz.app adresine bildirmelisiniz.
- Uygulamanın güvenliğini tehdit edecek tersine mühendislik, kaynak koda dönüştürme (decompilation), otomatik bot veya yetkisiz veri çekme (scraping) girişimleri kesinlikle yasaktır ve hukuki yaptırıma tabidir.

## 3. Portföy Kayıtları ve Değerleme Mantığı
- Portföyünüzde yer alan altın alım kayıtları, miktar ve maliyet bilgileri tamamen kullanıcı beyanına dayanır.
- Kâr ve zarar hesaplamaları, Kapalıçarşı serbest piyasa sağlayıcılarından alınan güncel alış (bozdurma) fiyatları üzerinden yaklaşık değer olarak gösterilir.
- Altın İz V1 sürümünde silinen portföy kayıtları satış geçmişi oluşturmaz; kaydınız portföyünüzden tamamen kaldırılır.

## 4. Fikri Mülkiyet Hakları
Altın İz adı, logosu, uygulama arayüzü tasarımı, grafik varlıkları, kaynak kodları ve veritabanı mimarisi 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile uluslararası telif hakları mevzuatı uyarınca korunmaktadır. Yazılı izin alınmaksızın kopyalanamaz, çoğaltılamaz veya dağıtılamaz.

## 5. Sorumluluk Sınırlandırması
Altın İz, piyasa veri sağlayıcılarından kaynaklanan gecikmeler, iletişim hattı kesintileri veya donanımsal aksaklıklar sebebiyle verilerin anlık yansıtılamamasından doğabilecek zararlardan sorumlu tutulamaz. Uygulama "olduğu gibi" (as-is) sunulmaktadır.

## 6. Değişiklikler ve Yürürlük
Altın İz, mevzuat değişiklikleri veya yeni özellikler doğrultusunda bu Kullanım Koşullarını güncelleme hakkını saklı tutar. Önemli değişiklikler uygulama içerisinden kullanıcılara duyurulur.

## 7. Uygulanacak Hukuk ve Yetki
Bu koşulların uygulanmasında ve yorumlanmasında Türkiye Cumhuriyeti Hukuku geçerlidir. Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.

İletişim: adem@altiniz.app',
    'a3f10dab4e6ea8dd3e41e73d0dbf03b07e4ce6e6f1a945943c4de43a89d7805a',
    true,
    false,
    NOW(),
    NOW()
)
ON CONFLICT (document_type, version) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_hash = EXCLUDED.content_hash,
    is_active = true,
    requires_action = false,
    published_at = EXCLUDED.published_at,
    effective_at = EXCLUDED.effective_at,
    updated_at = NOW();

INSERT INTO public.legal_documents (
    document_type,
    version,
    title,
    content,
    content_hash,
    is_active,
    requires_action,
    published_at,
    effective_at
) VALUES (
    'financial_disclaimer',
    '1.0.0',
    'Finansal Bilgilendirme ve Sorumluluk Reddi',
    '# Altın İz — Finansal Bilgilendirme ve Sorumluluk Reddi

Son Güncelleme: 25 Ekim 2026
Sürüm: 1.0.0

## 1. YASAL UYARI: YATIRIM TAVSİYESİ DEĞİLDİR
Altın İz uygulamasında sunulan altın alış ve satış fiyatları, grafikler, portföy kâr/zarar analizleri ve hesaplama araçları yalnızca kişisel bilgilendirme amacıyla sunulmaktadır.

6362 sayılı Sermaye Piyasası Kanunu ve ilgili mevzuat uyarınca; Altın İz uygulamasında yer alan hiçbir bilgi, yorum veya hesaplama sonucu kesinlikle YATIRIM DANIŞMANLIĞI VEYA YATIRIM TAVSİYESİ DEĞİLDİR.

Yatırım danışmanlığı hizmeti; aracı kurumlar, portföy yönetim şirketleri, mevduat kabul etmeyen bankalar ile müşteri arasında imzalanacak yatırım danışmanlığı sözleşmesi çerçevesinde sunulmaktadır.

## 2. Piyasa Verilerinin Gösterge Niteliği
- Uygulamada gösterilen altın fiyatları serbest piyasa ve sağlayıcı verilerinden derlenmektedir.
- Altın fiyatları anlık olarak değişkenlik gösterebilir; bankalar, Kapalıçarşı esnafı, kuyumcular veya yetkili döviz bürolarının uyguladığı makas aralıkları (spread), işçilik giderleri, saflık derecesi veya komisyonlar nedeniyle fiziksel işlem noktalarındaki fiyatlar ile uygulama fiyatları arasında farklılıklar bulunabilir.
- Altın İz, fiyat verilerinin yüzde yüz doğruluğunu, eksiksizliğini veya kesintisiz iletileceğini garanti etmez.

## 3. Kullanıcı Sorumluluğu
Uygulamada yer alan verilere, portföy kâr/zarar oranlarına veya hesaplama tablolarına dayanarak alacağınız her türlü yatırım, birikim, alım-satım veya borçlanma kararı tamamen kendi hür iradeniz ve sorumluluğunuzdadır.

Bu kararlar neticesinde doğrudan ya da dolaylı olarak ortaya çıkabilecek herhangi bir maddi veya manevi zarardan, kâr mahrumiyetinden Altın İz, geliştiricileri veya yöneticileri hiçbir ad altında hukuki veya cezai olarak sorumlu tutulamaz.

## 4. Karar Almadan Önce
Herhangi bir finansal işlem yapmadan önce bağımsız lisanslı bir finans danışmanına danışmanız, güncel fiyatları işlem yapacağınız kuyumcu veya yetkili finans kuruluşundan teyit etmeniz önemle tavsiye olunur.

İletişim: adem@altiniz.app',
    '3c6e1f98a63b775f641b8033820360910b0b225c07b30aa43ea1513fb15372ae',
    true,
    false,
    NOW(),
    NOW()
)
ON CONFLICT (document_type, version) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_hash = EXCLUDED.content_hash,
    is_active = true,
    requires_action = false,
    published_at = EXCLUDED.published_at,
    effective_at = EXCLUDED.effective_at,
    updated_at = NOW();

INSERT INTO public.legal_documents (
    document_type,
    version,
    title,
    content,
    content_hash,
    is_active,
    requires_action,
    published_at,
    effective_at
) VALUES (
    'data_retention',
    '1.0.0',
    'Veri Saklama ve İmha Politikası',
    '# Altın İz — Veri Saklama ve İmha Politikası

Son Güncelleme: 25 Ekim 2026
Sürüm: 1.0.0

Bu Veri Saklama ve İmha Politikası ("Politika"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ve Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik gereğince; Altın İz tarafından toplanan kişisel verilerin saklanma sürelerini ve silinme süreçlerini açıklar.

## 1. Veri Saklama İlkeleri
Altın İz, kişisel verileri yalnızca işlendikleri amaç için gerekli olan süre boyunca veya ilgili mevzuatta öngörülen yasal süreler sınırında saklar. Amacı sona eren, yasal saklama yükümlülüğü kalmayan veriler gecikmeksizin güvenli yöntemlerle imha edilir.

## 2. Veri Kategorileri ve Saklama Süreleri
- Kullanıcı Profil ve Hesap Bilgileri: Kullanıcı hesabı aktif kaldığı sürece saklanır. Hesap kapatıldığında derhal silinir.
- Portföy ve Varlık Kayıtları: Kullanıcı tarafından girilen altın kayıtları, kullanıcı kaydı sildiği veya hesabını kapattığı anda derhal ve kalıcı olarak imha edilir.
- Yasal İzin ve Rıza Kayıtları (user_legal_events): KVKK ve Türk Ticaret Kanunu uyarınca ispat yükümlülüğü gereğince hesap kapatılmasını takiben 3 (üç) yıl süreyle güvenli arşivde saklanır ve ardından imha edilir.
- Güvenlik ve Sistem Olay Logları (security_audit_logs): Siber güvenlik ve yetkisiz erişim denetimleri kapsamında 5651 sayılı mevzuat uyarınca en fazla 1 (bir) yıl süreyle tutulur ve otomatik temizleme mekanizmasıyla yok edilir.

## 3. Veri İmha Yöntemleri
- Silme (Deletion): Veritabanı kayıtlarının kriptografik olarak üzerine yazılarak kullanıcı ve uygulama katmanından tamamen kaldırılması.
- Yok Etme (Destruction): Dijital ortamdaki verilerin geri getirilemeyecek şekilde sıfırlanması ve disk bloklarının güvenli temizliği.
- Anonimleştirme: Verinin hiçbir surette belirli veya belirlenebilir bir gerçek kişiyle ilişkilendirilemeyecek hale getirilmesi.

## 4. Kullanıcı Talebiyle Anında Hesap ve Veri İmhası
Kullanıcı, dilediği an uygulama içerisinden (Ayarlar > Hesap Yönetimi > Hesabımı Sil) talepte bulunabilir. Bu talep doğrultusunda kullanıcının tüm portföy girdileri, profil verileri ve oturum yetkileri atomik veritabanı fonksiyonu (`execute_account_deletion`) vasıtasıyla anında ve geri alınamaz biçimde imha edilir.

## 5. İletişim
Veri saklama ve imha politikamıza ilişkin bilgi almak için: adem@altiniz.app',
    '288f66febfba17ad8aa0310ec424f7f07e622b46fea9c137a54b45efa4f03e2d',
    true,
    false,
    NOW(),
    NOW()
)
ON CONFLICT (document_type, version) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_hash = EXCLUDED.content_hash,
    is_active = true,
    requires_action = false,
    published_at = EXCLUDED.published_at,
    effective_at = EXCLUDED.effective_at,
    updated_at = NOW();

INSERT INTO public.legal_documents (
    document_type,
    version,
    title,
    content,
    content_hash,
    is_active,
    requires_action,
    published_at,
    effective_at
) VALUES (
    'explicit_consent',
    '1.0.0',
    'Açık Rıza Metni',
    '# Altın İz — Açık Rıza Metni

Son Güncelleme: 25 Ekim 2026
Sürüm: 1.0.0

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında hazırlanan KVKK Aydınlatma Metni''ni okudum ve anladım.

Altın İz uygulamasının sunduğu:
1. Kişisel altın birikimlerimin ve işlem geçmişimin güvenli biçimde saklanması,
2. Anlık piyasa fiyatları doğrultusunda portföy değerleme ve tahmini kâr/zarar hesaplama özelliklerinin kişiselleştirilmiş olarak sunulması,
3. Tercih ettiğim altın türlerine ve portföyümdeki varlıklara ilişkin güncel piyasa bildirimlerinin ve durum özetlerinin tarafıma iletilmesi

amaçlarıyla sınırlı olmak üzere, paylaştığım kişisel verilerimin KVKK''ya ve ilgili mevzuata uygun olarak işlenmesine ve güvenli bulut altyapısında şifreli olarak muhafaza edilmesine ÖZGÜR İRADEMLE AÇIK RIZA VERİYORUM.

Bilgilendirme: Bu açık rıza metnini kabul etmek tamamen isteğe bağlıdır. Vermiş olduğunuz açık rızayı, mobil uygulama içerisindeki Ayarlar > Yasal Belgeler ve Gizlilik menüsünden veya adem@altiniz.app adresine e-posta göndererek hiçbir gerekçe göstermeksizin dilediğiniz an geri çekebilirsiniz.',
    '2a79dc5ce853cdb17c99f6884ff6d5776aed53e3cddab8833691f8789db2119b',
    true,
    false,
    NOW(),
    NOW()
)
ON CONFLICT (document_type, version) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_hash = EXCLUDED.content_hash,
    is_active = true,
    requires_action = false,
    published_at = EXCLUDED.published_at,
    effective_at = EXCLUDED.effective_at,
    updated_at = NOW();

-- ============================================================================
-- 4. OTOMATİK FİYAT ÇEKME ZAMANLAYICISININ GENİŞLETİLMESİ (pg_cron)
-- ============================================================================
-- Hafta sonu ve mesai saatleri dışını da kapsayacak şekilde her 15 dakikada bir çalıştır
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('fetch-gold-prices-job')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-gold-prices-job');

    PERFORM cron.schedule(
      'fetch-gold-prices-job',
      '*/15 * * * *',
      'SELECT public.trigger_scheduled_price_fetch();'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron zamanlayıcı güncellemesi atlandı: %', SQLERRM;
END;
$$;
