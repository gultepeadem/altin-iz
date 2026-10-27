# Altın İz V1 Gizlilik Tasarımı ve Kişisel Veri Envanteri

**Belge adı:** `PRIVACY.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.4  
**Son güncelleme:** 27.10.2026 
**Proje aşaması:** Bölüm 19: Güvenlik ve gizlilik sertleştirmesi - Faz 13.1 (Gizlilik incelemesi) TAMAMLANDI  
**Kodlama durumu:** Veri envanteri, Supabase Frankfurt akışı, fiyat sağlayıcı izolasyonu, adem@altiniz.app resmi başvuru kanalı, Google Play Data Safety ve Apple App Privacy beyan tabloları kesinleştirildi  
**Hedef platformlar:** Android ve iOS

---

## 1. Önemli hukuki uyarı

Bu belge:

- Uygulamanın gizlilik tasarımını,
- Planlanan kişisel veri akışlarını,
- Veri minimizasyonu kurallarını,
- Mağaza beyanı hazırlıklarını,
- Hukuk uzmanının doğrulaması gereken açık noktaları

belgeleyen dahili çalışma taslağıdır.

Bu belge nihai KVKK Aydınlatma Metni, Açık Rıza Metni, Gizlilik Politikası veya hukuk görüşü değildir. Production yayını ve gerçek kullanıcı kaydı açılmadan önce güncel mevzuata göre hukuk uzmanı tarafından incelenmeli ve veri sorumlusu bilgileriyle tamamlanmalıdır.

---

## 2. Belgenin amacı

Bu belgenin amaçları:

1. Altın İz'in işlemesi planlanan kişisel verileri listelemek
2. Her veri için işleme amacını açıklamak
3. Zorunlu ve isteğe bağlı verileri ayırmak
4. Gereksiz veri toplamayı engellemek
5. Verinin uygulama içinde hangi sistemlere aktığını göstermek
6. Üçüncü taraf hizmetleri ve veri işleyenleri takip etmek
7. Yurt dışına aktarım ihtimalini görünür kılmak
8. Hesap silme ve saklama süreçlerini gizlilik açısından tanımlamak
9. Google Play ve App Store beyanlarına kaynak oluşturmak
10. Yeni özellik eklenirken gizlilik etkisi değerlendirmesini zorunlu kılmak

---

## 3. Temel gizlilik ilkeleri

Altın İz aşağıdaki ilkelere göre geliştirilecektir:

- Hukuka ve dürüstlük kurallarına uygun işleme
- Doğru ve gerektiğinde güncel veri
- Belirli, açık ve meşru amaçlar
- Amaçla bağlantılı, sınırlı ve ölçülü veri
- Gerekli süre kadar saklama
- Veri minimizasyonu
- Varsayılan olarak gizlilik
- Tasarımdan itibaren gizlilik
- Şeffaflık
- Hesap verebilirlik
- En az yetki
- Kullanıcılar arası veri ayrılığı
- Güvenli silme ve anonimleştirme

Bir özellik kişisel veri olmadan çalışabiliyorsa kişisel veri toplanmayacaktır.

---

## 4. Gizlilik kapsamı

Bu belge aşağıdaki sistemleri kapsar:

```text
React Native + Expo mobil uygulama
Supabase Auth
Supabase PostgreSQL
Supabase Data API
Supabase Edge Functions
Production e-posta gönderim hizmeti
Altın fiyat sağlayıcısı
Gelecekte eklenirse hata izleme hizmeti
Gelecekte eklenirse analitik hizmeti
Google Play
App Store
Destek ve veri sahibi başvuru kanalları
```

Henüz seçilmemiş üçüncü taraf hizmetler kesinleşmiş gibi gösterilmez.

---

## 5. Veri konusu kişi grupları

V1'de planlanan kişi grupları:

- Hesap oluşturan kullanıcılar
- Hesap silme talebinde bulunan kullanıcılar
- Destek talebi gönderen kullanıcılar
- Test kullanıcıları
- Güvenlik olayıyla ilişkili kullanıcılar

Çocuklara özel bir hizmet tasarlanmamıştır. Uygulamanın yaş derecelendirmesi, hedef kitlesi ve çocuklara ilişkin yükümlülükler yayımlama öncesinde ayrıca değerlendirilmelidir.

---

## 6. Veri sorumlusu bilgileri

Aşağıdaki bilgiler resmi başvuru ve iletişim kanalları ile eşitlenmiştir:

```text
Veri sorumlusu gerçek veya tüzel kişi: Altın İz Yönetimi
Ticari unvan: Altın İz
Adres: İstanbul, Türkiye
İletişim e-postası: adem@altiniz.app
KVKK başvuru kanalı: adem@altiniz.app
Destek e-postası: adem@altiniz.app
MERSİS veya ilgili sicil bilgisi: UYGULANABİLİRLİĞİ DEĞERLENDİRİLECEK
VERBİS durumu: Yıllık çalışan sayısı ve mali bilanço istisnası kapsamında
```

Bu alanlar tamamlanmadan nihai aydınlatma metni yayımlanmamalıdır.

---

## 7. V1 kişisel veri envanteri

Aşağıdaki envanter, veritabanı şemasındaki somut alanlar (`DATABASE.md`) ile birebir eşleştirilmiştir:

### 7.1. Hesap ve kimlik doğrulama verileri

#### E-posta adresi (`auth.users.email`)

```text
Kaynak: Kullanıcı
Zorunlu: Evet
Veritabanı alanı: auth.users.email
Amaç: Hesap oluşturma, giriş, doğrulama, şifre sıfırlama ve hesap iletişimi
Ana sistem: Supabase Auth
Kullanıcıyla bağlantılı: Evet
Saklama: DATA_RETENTION.md uyarınca hesap silinene kadar, silme anında derhal yok edilir
```

#### Auth kullanıcı kimliği (`auth.users.id`)

```text
Kaynak: Supabase Auth
Zorunlu: Evet
Veritabanı alanı: auth.users.id
Amaç: Kullanıcı kayıtlarını güvenli biçimde ilişkilendirmek
Tür: UUID
Kullanıcıyla bağlantılı: Evet
```

#### E-posta doğrulama durumu

```text
Kaynak: Supabase Auth
Amaç: Doğrulanmamış hesapların korunan alana erişimini engellemek
```

#### Oturum ve yenileme belirteçleri

```text
Kaynak: Supabase Auth
Amaç: Güvenli oturumun sürdürülmesi
Yer: Doğrulanmış donanımsal güvenli saklama yöntemi (expo-secure-store / iOS Keychain & Android Keystore — ADR-034)
Uygulama veritabanında kalıcı alan: Hayır
Loglama: Yasak
```

#### Şifre

```text
Kaynak: Kullanıcı
Amaç: Kimlik doğrulama
Normal uygulama tablolarında saklama: Yasak (Supabase Auth içinde Argon2 / bcrypt hash olarak tutulur)
Loglama: Yasak (src/utils/logger.ts ile otomatik maskelenir)
Analitik veya hata izlemeye gönderme: Yasak
```

### 7.2. Profil verileri

#### Görünen ad (`user_profiles.display_name`)

```text
Kaynak: Kullanıcı
Zorunlu: Hayır
Veritabanı alanı: user_profiles.display_name
Amaç: Uygulama içi kişiselleştirilmiş karşılama
Pazarlama amacı: Hayır
```

#### Hesap durumu (`user_profiles.account_status`)

```text
Kaynak: Sistem
Veritabanı alanı: user_profiles.account_status
Örnekler: active, deletion_pending, disabled
Amaç: Hesap yaşam döngüsünü ve güvenli erişimi yönetmek
Kullanıcı tarafından doğrudan değiştirilebilir: Hayır
```

### 7.3. Kullanıcı tercihleri

#### Tema tercihi (`user_preferences.theme`)

```text
Değerler: light, dark, system
Veritabanı alanı: user_preferences.theme
Amaç: Kullanıcı deneyimini kişiselleştirmek
Zorunlu: Hayır
```

#### Dil ve para birimi (`user_preferences.language_code`, `user_preferences.currency_code`)

```text
V1 dili: tr (user_preferences.language_code)
V1 para birimi: TRY (user_preferences.currency_code)
Amaç: Gösterim tercihleri
V1'de kullanıcı tarafından serbest seçim: Hayır (V1'de yalnızca tr ve TRY sabittir)
```

### 7.4. Portföy verileri

#### Altın ürünü (`portfolio_entries.product_id`)

```text
Kaynak: Kullanıcının merkezi katalogdan seçimi
Veritabanı alanı: portfolio_entries.product_id
Amaç: Kullanıcının sahip olduğu altını kaydetmek
```

#### Miktar veya adet (`portfolio_entries.quantity`)

```text
Kaynak: Kullanıcı
Veritabanı alanı: portfolio_entries.quantity
Amaç: Portföy değerini hesaplamak
Hassasiyet: Ürüne göre adet veya azami üç ondalıklı gram (NUMERIC(18,3))
```

#### Alış tarihi (`portfolio_entries.purchase_date`)

```text
Kaynak: Kullanıcı
Veritabanı alanı: portfolio_entries.purchase_date
Amaç: Altın alış kaydını ve geçmişini tutmak
Saat bilgisi: V1'de alınmaz
```

#### Ödenen toplam tutar (`portfolio_entries.total_cost_minor`)

```text
Kaynak: Kullanıcı
Veritabanı alanı: portfolio_entries.total_cost_minor
Amaç: Tahmini kâr-zarar hesaplamak
Saklama biçimi: Kuruş cinsinden tam sayı (BIGINT)
Finansal hesap veya banka verisi: Hayır
```

#### Alış yeri (`portfolio_entries.purchase_place`)

```text
Kaynak: Kullanıcı
Zorunlu: Hayır
Veritabanı alanı: portfolio_entries.purchase_place
Amaç: Kullanıcının kendi kaydını açıklaması (VARCHAR(100))
Serbest metin: Evet, sınırlı uzunluk
```

#### Kullanıcı notu (`portfolio_entries.note`)

```text
Kaynak: Kullanıcı
Zorunlu: Hayır
Veritabanı alanı: portfolio_entries.note
Amaç: Kullanıcının kendi portföy kaydına açıklama eklemesi
Serbest metin: Evet, azami 500 karakter (VARCHAR(500))
Özel nitelikli veri girmemesi kullanıcıya hatırlatılabilir
```

#### İşçilik dâhil bilgisi

```text
Kaynak: Kullanıcı
Amaç: Girilen toplam maliyetin açıklanmasına yardımcı olmak
Otomatik işçilik hesabı: Hayır
```

### 7.5. Hukuki ve Güvenlik Denetim Verileri

#### Yasal Olay Kayıtları (`user_legal_events`)

```text
Kaynak: Sistem (SECURITY DEFINER RPC record_user_legal_event)
Veritabanı tablosu: public.user_legal_events
Alanlar: document_id, event_type, source, app_version, created_at
Amaç: Aydınlatma ve rıza işlemlerinin hukuki ispatı (KVKK m.5/2-ç)
Saklama: 3 yıl (hesap silinirken user_id = null yapılarak anonimleştirilir)
```

#### Hesap Silme Talepleri (`account_deletion_requests`)

```text
Kaynak: Kullanıcı / delete-account Edge Function
Veritabanı tablosu: public.account_deletion_requests
Alanlar: requested_at, status, identity_verified_at, processing_started_at, completed_at, failure_code, failure_message
Not: ADR-033 ve KVKK veri minimizasyonu uyarınca PII oluşmasını önlemek amacıyla API isteğinde ve bu tabloda gerekçe (reason) alanı yer almaz ve saklanmaz.
Amaç: Hesap silme taleplerinin takibi, mağaza denetimi ve ispatı
Saklama: 3 yıl (PII içermez, auth silimi tamamlandığında user_id = null yapılır)
```

### 7.6. Hesaplanan finansal sonuçlar

- Tahmini güncel bozdurma değeri
- Tahmini kâr veya zarar
- Değişim yüzdesi
- Kısmi veya tam toplam durumu

Bu değerler kullanıcının portföy verisi ile ortak fiyat verilerinden türetilir. `portfolio_entries` tablosunda ana gerçek veri olarak kalıcı biçimde saklanmaz.

### 7.7. Yasal olay verileri ve rıza ayrılığı

- İlgili kullanıcı kimliği
- Belge türü
- Belge sürümü
- Olay türü
- Sunum, kabul, ret veya geri çekme zamanı
- Gerekli sınırlı teknik bağlam

Aydınlatma metninin gösterilmesi ile açık rıza birbirine dönüştürülmez.

### 7.8. Hesap silme verileri

- Silme talebi kimliği
- Kullanıcı kimliği
- Talep zamanı
- Durum (`processing`, `completed`, `failed`, `auth_deletion_pending`)
- Tamamlanma zamanı
- Güvenli ve sınırlı hata kodu

Tam hata metni veya hassas sistem ayrıntıları kullanıcı kaydında tutulmamalıdır.

### 7.9. Güvenlik ve teknik olay verileri

Planlanan sınırlı alanlar:

- Güvenli olay türü
- Olay zamanı
- Hassas olmayan takip kimliği
- Başarı veya hata durumu
- Gerekirse anonimleştirilmiş veya sınırlı kullanıcı bağlantısı
- Saklama sonu zamanı

Şifre, token, secret, tam portföy veya kullanıcı notu teknik olay içinde tutulmaz.

### 7.10. Destek verileri

Destek kanalı kesinleştiğinde aşağıdakiler işlenebilir:

- Kullanıcının verdiği iletişim adresi
- Destek mesajı
- İlişkili uygulama sürümü
- Kullanıcının gönüllü gönderdiği ekran görüntüsü
- Destek durumu

Destek formu V1'de gerçek veri akışı oluşturursa envanter, saklama süresi ve gizlilik metinleri güncellenmelidir.

---

## 8. V1'de toplanmayacak veriler

Altın İz V1 aşağıdaki verileri işlemek üzere tasarlanmamıştır:

```text
TC kimlik numarası
Pasaport bilgisi
Açık adres
Telefon rehberi
Kesin konum
Arka plan konumu
Mikrofon kaydı
Kamera görüntüsü
Fotoğraf galerisi
Biyometrik veri
Sağlık verisi
Banka hesap bilgisi
IBAN
Kredi kartı bilgisi
Ödeme kartı güvenlik kodu
SMS içeriği
Arama geçmişi
Reklam kimliği
Kişiler arası mesajlar
Sosyal medya bağlantıları
```

Yeni bir özellik bu verilerden birini gerektirirse kod eklenmeden önce gizlilik etki değerlendirmesi, hukuk incelemesi ve belge güncellemeleri yapılmalıdır.

---

## 9. Özel nitelikli kişisel veriler

V1 özel nitelikli kişisel veri işlemeyi amaçlamaz.

Kullanıcı serbest metin notuna hassas bilgi yazabilir. Bu riski azaltmak için:

- Not alanı isteğe bağlı tutulur.
- Kullanıcıdan sağlık, kimlik, finans hesabı veya başka kişilere ait bilgi yazmaması istenebilir.
- Notlar analitik veya hata kayıtlarına gönderilmez.
- Not içeriği yalnızca ilgili kullanıcıya gösterilir.
- Not alanı gereksiz teknik loglara yazılmaz.

---

## 10. Veri işleme amaçları

V1 için planlanan amaçlar:

1. Kullanıcı hesabı oluşturmak ve yönetmek
2. E-posta adresini doğrulamak
3. Kullanıcı oturumunu güvenli biçimde sürdürmek
4. Şifre sıfırlamak
5. Kişisel portföy kayıtlarını saklamak
6. Tahmini portföy değerini ve kâr-zararı hesaplamak
7. Kullanıcı tercihlerini saklamak
8. Yasal belgeleri sunmak ve gerekli olayları kaydetmek
9. Hesap ve veri silme talebini yürütmek
10. Güvenlik olaylarını tespit etmek ve incelemek
11. Teknik hataları gidermek
12. Kullanıcı destek taleplerini yanıtlamak
13. Uygulamanın mağaza, hukuk ve sözleşme yükümlülüklerini yerine getirmek

Veriler bu amaçlarla bağdaşmayan reklam, profil çıkarma veya veri satışı için kullanılmayacaktır.

---

## 11. Hukuki sebep çalışma alanı

Her veri işleme faaliyeti için uygulanacak hukuki sebep hukuk uzmanıyla kesinleştirilecektir.

Çalışma adayları:

```text
Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olma
Hukuki yükümlülüğün yerine getirilmesi
Bir hakkın tesisi, kullanılması veya korunması
Veri sorumlusunun meşru menfaati
Açık rıza, yalnızca gerçekten gerekli ve uygun olduğunda
```

Kurallar:

- Açık rıza varsayılan veya her işlem için genel dayanak olarak kullanılmaz.
- Aydınlatma metni onay kutusuna dönüştürülmez.
- Hizmet için zorunlu olmayan bir veri açık rızaya dayanıyorsa ret hâlinde temel hizmet gereksiz yere engellenmez.
- Açık rıza gerekli ise özgür iradeyle, belirli konuya ilişkin ve bilgilendirmeye dayalı olmalıdır.
- Rıza geri çekme yöntemi sağlanmalıdır.

---

## 12. Veri akışları

### 12.1. Hesap oluşturma

```text
Kullanıcı
  ↓ e-posta ve şifre
Mobil uygulama
  ↓
Supabase Auth
  ↓ kullanıcı kimliği ve doğrulama durumu
Mobil uygulama ve kullanıcı profil tabloları
```

Şifre normal PostgreSQL uygulama tablolarına yazılmaz.

### 12.2. Portföy kaydı

```text
Kullanıcı
  ↓ ürün, miktar, tarih, maliyet, isteğe bağlı açıklamalar
Mobil uygulama
  ↓ doğrulanmış oturum
Supabase Data API
  ↓ RLS ve veritabanı doğrulaması
portfolio_entries
```

### 12.3. Fiyat verisi

```text
Zamanlanmış güvenli sunucu işlemi
  ↓
Dış fiyat sağlayıcısı
  ↓ ortak piyasa fiyatı
Doğrulama ve ürün eşleştirme
  ↓
Supabase PostgreSQL
  ↓
Mobil uygulama
```

Mobil uygulamanın kullanıcının kişisel portföyünü dış fiyat sağlayıcısına göndermesi planlanmamaktadır.

### 12.4. Portföy hesaplama

```text
Kullanıcının portföy kayıtları
  +
Ortak güncel alış fiyatları
  ↓
Tahmini bozdurma değeri ve kâr-zarar
  ↓
Yalnızca ilgili kullanıcıya gösterim
```

### 12.5. Hesap silme

```text
Kullanıcı yeniden doğrulama
  ↓
Güvenli delete-account fonksiyonu
  ↓
Silme talebi ve durum takibi
  ↓
Portföy, tercih, profil ve Auth işlemleri
  ↓
Saklama politikasına göre yasal ve güvenlik kayıtları
```

---

## 13. Üçüncü taraf hizmet envanteri

### 13.1. Supabase

Kullanım:

- Kimlik doğrulama (Supabase Auth)
- PostgreSQL veritabanı
- Data API & Row Level Security (RLS)
- Edge Functions (`delete-account`, `retry-account-deletions`, `fetch-gold-prices`)
- Sunucu secret yönetimi

Kesinleşen Durum:
- Bölge: Frankfurt, Almanya (AB Bölgesi - eu-central-1).
- İletişim: Uçtan uca TLS / HTTPS zorunludur.
- Veri Saklama ve Silme: ADR-033 boru hattıyla tam uyumlu.

### 13.2. Altın fiyat sağlayıcısı

Fiyat sağlayıcısına hiçbir kullanıcı kimliği, e-posta veya portföy verisi aktarılmaz (Fiyat sağlayıcısının kişisel veri almadığı doğrulanmıştır). Fiyatlar istemciden tamamen bağımsız olarak arka planda ortak `gold_prices` tablosuna çekilir ve kullanıcılar bu ortak tabloyu yalnızca okuma yetkisiyle sorgular.

### 13.3. Production e-posta hizmeti

İşlenebilecek veri: E-posta adresi ve doğrulama/şifre sıfırlama bağlantısı. Hizmet seçimi aşamasında AB bölgesi ve standart sözleşme şartları aranacaktır.

### 13.4. Hata izleme

V1 kapsamında harici hata izleme servisi (Sentry, Bugsnag vb.) KULLANILMAZ.
Hata ve istisnalar istemci cihazında yerel olarak [`src/utils/logger.ts`](file:///C:/Users/Adem/Desktop/altin-iz/src/utils/logger.ts) modülü ile güvenli şekilde filtrelenir; şifre ve token maskelenir; canlı derlemede debug logları susturulur.

### 13.5. Analitik

V1 kapsamında hiçbir harici analitik aracı (Google Analytics, Firebase Analytics vb.) KULLANILMAZ (0 Tracking, 0 Reklam Takibi). Kullanıcıların uygulama içi hareketleri harici sunuculara veya profilleme şirketlerine raporlanmaz.

### 13.6. Google Play ve App Store

Mağazalar uygulama dağıtımı, inceleme ve mağaza sayfası için kendi verilerini işler. Geliştirici tarafından doldurulan veri güvenliği ve gizlilik beyanları, uygulamanın ve entegre üçüncü taraf SDK'ların gerçek davranışıyla uyumlu olmalıdır.

---

## 14. Yurt dışına veri aktarımı

Supabase, e-posta hizmeti, hata izleme veya analitik hizmeti yurt dışında bulunabilir. Bu nedenle yurt dışına aktarım ihtimali production öncesi ayrı değerlendirilmelidir.

Kesinleştirilecekler:

1. Hangi kişisel verinin aktarıldığı
2. Hangi ülkeye veya uluslararası kuruluşa aktarıldığı
3. Aktarım alıcısının rolü
4. Aktarım amacı
5. Hukuki sebep
6. Yeterlilik kararı bulunup bulunmadığı
7. Uygun güvence yöntemi
8. Standart sözleşme veya başka belgenin gerekip gerekmediği
9. Bildirim ve kayıt yükümlülükleri
10. Alt işleyenler ve sonraki aktarımlar
11. Veri sahibinin nasıl bilgilendirileceği

Production projesi rastgele bir bölgede oluşturulmamalı ve aktarım yöntemi kesinleşmeden gerçek kullanıcı verisi işlenmemelidir.

---

## 15. Veri paylaşımı ve satış

### Planlanan veri satışı

```text
Yok
```

### Planlanan reklam amaçlı paylaşım

```text
Yok
```

### Kullanıcılar arası paylaşım

```text
Yok
```

### Zorunlu veya hizmet amaçlı alıcı grupları

Kesin hizmet seçimine bağlı olarak:

- Altyapı ve barındırma sağlayıcısı
- Kimlik doğrulama altyapısı
- E-posta gönderim hizmeti
- Yetkili hukuk ve güvenlik tarafları
- Kanunen yetkili kamu kurumları

Her alıcı yalnızca gerekli veri ve amaç kapsamında değerlendirilmelidir.

---

## 16. Veri minimizasyonu kuralları

- Hesap için telefon numarası istenmez.
- Kullanıcının gerçek adı zorunlu tutulmaz.
- TC kimlik numarası istenmez.
- Konum izni istenmez.
- Kamera ve galeri izni istenmez.
- Mikrofon izni istenmez.
- Bildirim izni V1'de istenmez.
- Reklam kimliği kullanılmaz.
- Portföy için bankacılık hesabı istenmez.
- Kullanıcının ödediği toplam tutar dışında ödeme aracı bilgisi alınmaz.
- Alış yeri ve not isteğe bağlıdır.
- Teknik loglara tam istek gövdesi yazılmaz.
- Destek için gereksiz kimlik belgesi istenmez.

---

## 17. Kullanıcı kontrolü ve hakları

Nihai metin hukuk uzmanı tarafından hazırlanmak üzere, kullanıcıya uygulanabilir olduğu ölçüde şu başvuru olanakları sağlanmalıdır:

- Kişisel verisinin işlenip işlenmediğini öğrenme
- İşlenen verilere ilişkin bilgi talep etme
- İşleme amacını ve amaca uygun kullanımı öğrenme
- Verilerin aktarıldığı taraflar hakkında bilgi talep etme
- Yanlış veya eksik verinin düzeltilmesini isteme
- Uygulanabilir şartlarla silinmesini veya yok edilmesini isteme
- Düzeltme veya silme işlemlerinin ilgili alıcılara bildirilmesini isteme
- Uygulanabilir itiraz ve zarar giderim taleplerini iletme
- Açık rıza işleme dayanağıysa rızayı geri çekme

### Uygulama içi kontroller

- Görünen adı değiştirme
- Tema tercihini değiştirme
- Portföy kaydı ekleme, düzenleme ve silme
- Hesabı ve ilişkili verileri silme sürecini başlatma
- Yasal ve gizlilik belgelerini görüntüleme

### Başvuru kanalı

Production öncesinde güvenli ve doğrulanabilir bir başvuru kanalı oluşturulmalıdır. Başvuran kişinin kimliği gereğinden fazla veri toplamadan doğrulanmalıdır.

---

## 18. Hesap ve veri silme

Altın İz hesap oluşturan kullanıcıya uygulama içinden hesap silme işlemini başlatma yolu sunacaktır.

### Silinecek veya işlenecek veri grupları

- Portföy kayıtları
- Kullanıcı tercihleri
- Profil kaydı
- Supabase Auth hesabı
- Aktif oturumlar
- Yerel kullanıcı önbelleği
- Yasal olaylar ve güvenlik kayıtları, saklama politikasına göre silinir veya anonimleştirilir

### Kurallar

- Yalnızca hesabı pasifleştirmek silme sayılmaz.
- İşlem kolay bulunabilir olmalıdır.
- Yanlışlıkla silmeyi önlemek için yeniden doğrulama ve açık onay alınabilir.
- Silme gereksiz yere zorlaştırılmaz.
- İşlem ek süre gerektiriyorsa kullanıcı bilgilendirilir.
- İşlem tamamlanmadan başarı gösterilmez.
- Saklanması gereken veri varsa türü, nedeni ve süresi kullanıcıya açıklanır.

### Web üzerinden silme talebi

Google Play yayımlama gereksinimleri için uygulama içi yola ek olarak erişilebilir bir web kaynağı veya talep yolu hazırlanması planlanmalıdır.

---

## 19. Veri saklama ve silme

Kesin süreler `DATA_RETENTION.md` içinde belirlenecektir.

Temel kurallar:

- Veri süresiz ve gerekçesiz tutulmaz.
- Hesap aktifken hizmet için gereken veriler saklanır.
- Hesap silme sonrası gerekli olmayan kişisel veriler silinir.
- Hukuki veya güvenlik amacıyla tutulacak kayıtlar sınırlandırılır.
- Saklama süresi sona erdiğinde veri silinir, yok edilir veya geri döndürülemez biçimde anonimleştirilir.
- Yedek sistemlerindeki silme gecikmesi ayrıca açıklanır.
- Silme işlemleri mümkün olduğunca otomatik ve denetlenebilir olur.

Açık sorun: Yasal olay, güvenlik olayı, hesap silme talebi ve fiyat geçmişi süreleri henüz kesinleşmemiştir.

---

## 20. Yerel cihaz verileri

### Saklanabilecekler

- Güvenli oturum verisi
- Tema tercihi için sınırlı yerel değer
- Son fiyatlar için sınırlı önbellek
- Gerekirse sürümlü yasal belge önbelleği

### Sınırlanacaklar

- Tam portföyün düz metin saklanması
- Kullanıcı notlarının gereksiz önbelleği
- Başka kullanıcının oturumundan kalan veri
- Auth token'ın birden fazla yerde kopyalanması

### Çıkışta

- Oturum temizlenir.
- Kullanıcıya ait hassas önbellek temizlenir.
- Yeni kullanıcının önceki kullanıcı verisini görmediği test edilir.

---

## 21. Loglar, hata kayıtları ve destek içerikleri

### Loglanmayacaklar

```text
Şifre
Şifre tekrarı
Erişim belirteci
Yenileme belirteci
API anahtarı
Veritabanı parolası
Tam portföy
Kullanıcı notunun tamamı
Gereksiz e-posta bilgisi
Auth callback secret değerleri
```

### Sınırlı olarak loglanabilecekler

- Güvenli hata kodu
- İşlem türü
- Hassas olmayan takip kimliği
- İşlem süresi
- Ortam adı
- Başarı veya hata durumu
- Fiyat çekmede işlenen ve reddedilen ürün sayısı

Production hata izleme hizmeti eklenmeden önce gizlilik etkisi değerlendirilmelidir.

---

## 22. Güvenlik tedbirleri özeti

- Supabase Auth
- E-posta doğrulama
- Güvenli oturum saklama
- PostgreSQL Row Level Security
- Kullanıcı sahipliği kontrolü
- En az yetki
- Secret store
- HTTPS
- Veritabanı kısıtları
- Girdi doğrulama
- İki kullanıcılı yetki testleri
- Development ve Production ayrımı
- Git secret taraması
- Hesap silmede yeniden doğrulama
- Log redaksiyonu
- Bağımlılık güvenlik incelemesi

Ayrıntılar `SECURITY.md` içinde tanımlanmıştır.

---

## 23. Google Play gizlilik hazırlığı (Google Play Veri Güvenliği / Data Safety)

Google Play Store Data Safety formu için doğrulanmış V1 beyan matrisi:

### 23.1. Genel Güvenlik Uygulamaları

| Soru | Yanıt | Açıklama |
| :--- | :--- | :--- |
| **Veriler aktarım sırasında şifreleniyor mu?** | **Evet** | Aktarım sırasında şifreleme zorunludur (Tüm ağ istekleri TLS 1.3 / HTTPS üzerinden yürütülür). |
| **Kullanıcıların veri silme talebinde bulunması için bir yöntem sağlanıyor mu?** | **Evet** | Uygulama içi `account/delete.tsx` onay ekranı ve `delete-account` Edge Function ile hesap silme talebi ve verilerin fiziksel yok edilmesi sağlanır. |

### 23.2. Veri Türleri ve İşleme Amaçları Matrisi

| Veri Kategorisi | Veri Türü | Toplanıyor mu? | Paylaşılıyor mu? | İsteğe Bağlı mı? | Kullanıcıyla İlişkili mi? | İşleme Amacı |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Kişisel Bilgiler** | E-posta adresi | **Evet** | **Hayır** | Hayır (Zorunlu) | **Evet** | Uygulama işlevselliği, Hesap yönetimi |
| **Kişisel Bilgiler** | Kullanıcı Kimlikleri (User ID) | **Evet** | **Hayır** | Hayır (Zorunlu) | **Evet** | Uygulama işlevselliği, Hesap yönetimi |
| **Kişisel Bilgiler** | İsim / Görünen ad | **Evet** | **Hayır** | Evet (İsteğe bağlı) | **Evet** | Uygulama işlevselliği, Kişiselleştirme |
| **Finansal Bilgiler** | Satın Alma Geçmişi / Portföy Kayıtları | **Evet** | **Hayır** | Hayır (Zorunlu) | **Evet** | Uygulama işlevselliği (Altın takip ve kâr-zarar hesabı) |
| **Uygulama Etkinliği** | Yasal Olaylar / Rıza Kayıtları | **Evet** | **Hayır** | Hayır (Zorunlu) | **Evet** | Yasal uyumluluk, Dolandırıcılığı önleme ve güvenlik |

> [!NOTE]
> Uygulama hiçbir konum, rehber, kamera, ses, SMS, sağlık verisi veya cihaz tanımlayıcı (AD_ID) TOPLAMAZ ve PAYLAŞMAZ.

---

## 24. App Store gizlilik hazırlığı (Apple App Privacy Details)

Apple App Store Connect App Privacy formu için doğrulanmış V1 beyan matrisi:

### 24.1. Takip (Tracking) Beyanı

- **Bu uygulama kullanıcıları takip etmek için veri topluyor mu?**  
  **HAYIR (Takip İçin Kullanılmaz / No Tracking).**  
  Uygulama verileri, üçüncü taraf uygulamalar veya web sitelerindeki kullanıcı verileriyle reklam veya hedefleme amacıyla asla eşleştirilmez. Üçüncü taraf reklam SDK'sı bulunmamaktadır.

### 24.2. Toplanan Veri Türleri ve Bağlantı Durumu

| Veri Kategorisi (Data Type) | Toplanan Veri | Kullanıcıyla İlişkili (Linked to User) | Takip Amaçlı Kullanım | Amaç (Purpose) |
| :--- | :--- | :--- | :--- | :--- |
| **Contact Info (İletişim Bilgileri)** | Email Address | **Evet (Linked to User)** | **Hayır (No Tracking)** | App Functionality (Uygulama İşlevselliği) |
| **Financial Info (Finansal Bilgiler)** | Other Financial Info (Altın varlıkları, maliyet) | **Evet (Linked to User)** | **Hayır (No Tracking)** | App Functionality (Uygulama İşlevselliği) |
| **Identifiers (Tanımlayıcılar)** | User ID (UUID) | **Evet (Linked to User)** | **Hayır (No Tracking)** | App Functionality (Uygulama İşlevselliği) |
| **User Content (Kullanıcı İçeriği)** | Other User Content (Görünen ad, portföy notu) | **Evet (Linked to User)** | **Hayır (No Tracking)** | App Functionality (Uygulama İşlevselliği) |
| **Usage Data / Diagnostics** | Yerel hata ayıklama | **Hayır** | **Hayır** | Cihaz içinde yerel kalır, sunucuya aktarılmaz |

### 24.3. Hesap Silme Yükümlülüğü
App Store İnceleme Yönergesi 5.1.1(v) uyarınca, kullanıcıların uygulama içinden hesaplarını ve tüm ilişkili verilerini doğrudan silebileceği akış (`account/delete.tsx`) ve `delete-account` Edge Function ile karşılanmıştır.

---

## 25. Çocukların gizliliği

Altın İz çocuklara özel olarak tasarlanmamıştır. Yayımlama öncesinde:

- Hedef yaş grubu belirlenmeli.
- Mağaza yaş derecelendirmesi doğru seçilmeli.
- Çocukların uygulamayı kullanma ihtimali değerlendirilmelidir.
- Gerekirse ek ebeveyn onayı ve veri minimizasyonu yükümlülükleri hukuk uzmanıyla incelenmelidir.

Çocuklara yönelik reklam veya profil çıkarma V1 kapsamında değildir.

---

## 26. Açık rıza yönetimi

V1'de genel ve toplu bir açık rıza kutusu kullanılmayacaktır.

Açık rıza gerçekten gerekirse:

- Ayrı ve belirli amaç için alınır.
- Aydınlatma metninden ayrılır.
- Önceden işaretli olmaz.
- Ret seçeneği bulunur.
- Geri çekme yöntemi sağlanır.
- Belge sürümü ve olay zamanı kaydedilir.
- Geri çekmenin gelecekteki işleme etkisi uygulanır.

Hizmet için başka geçerli hukuki sebep varken gereksiz açık rıza talep edilmez.

---

## 27. Gizlilik etki değerlendirmesi gerektiren değişiklikler

Aşağıdakilerden biri planlandığında koddan önce gizlilik değerlendirmesi yapılmalıdır:

- Yeni kişisel veri alanı
- Konum
- Kamera veya fotoğraf
- Bildirim tokenı
- Analitik SDK
- Hata izleme SDK
- Reklam SDK
- Sosyal giriş
- Google veya Apple ile giriş
- Ödeme veya abonelik
- Portföy paylaşımı
- Aile hesabı
- Veri dışa aktarma
- Yapay zekâ analizi
- Yeni ülke veya bölge
- Yeni barındırma hizmeti
- Yeni e-posta hizmeti
- Yeni destek platformu

Değerlendirme sonucu `DECISIONS.md`, `PRIVACY.md`, `SECURITY.md`, `DATA_RETENTION.md`, `TODO.md` ve `CHANGELOG.md` belgelerine yansıtılır.

---

## 28. Veri ihlali ve kullanıcı bilgilendirmesi

Bir kişisel veri ihlali şüphesinde:

1. Olay doğrulanır ve etkisi sınırlandırılır.
2. Sızan secret'lar iptal edilir.
3. Etkilenen veri ve kullanıcı grupları belirlenir.
4. Kanıtlar güvenli biçimde korunur.
5. Hukuki bildirim yükümlülükleri ve süreleri uzmanla değerlendirilir.
6. Gerekli kurum ve kullanıcı bildirimleri doğrulanmış bilgiyle yapılır.
7. Kök neden ve tekrar önleme çalışması tamamlanır.
8. `SECURITY.md`, `KNOWN_ISSUES.md` ve `CHANGELOG.md` uygun gizlilik seviyesinde güncellenir.

Hassas saldırı ayrıntıları herkese açık belgelerde gereksiz biçimde yayımlanmaz.

---

## 29. Production öncesi gizlilik kontrol listesi

- [ ] Veri sorumlusu bilgileri kesinleşti.
- [ ] KVKK başvuru kanalı hazırlandı.
- [ ] VERBİS yükümlülüğü değerlendirildi.
- [ ] Bütün kişisel veri alanları doğrulandı.
- [ ] Her veri için amaç belirlendi.
- [ ] Her veri için hukuki sebep uzman tarafından doğrulandı.
- [ ] Saklama süreleri belirlendi.
- [ ] Supabase bölgesi kesinleşti.
- [ ] Yurt dışına aktarım yöntemi kesinleşti.
- [ ] Bütün veri işleyenler ve alt işleyenler listelendi.
- [ ] E-posta hizmeti kesinleşti.
- [ ] Hata izleme kullanımı kesinleşti.
- [ ] Analitik kullanımı kesinleşti.
- [ ] Gereksiz veri ve izinler kaldırıldı.
- [ ] Hesap silme uygulama içinde çalışıyor.
- [ ] Hesap silme web kaynağı hazır.
- [ ] Yedeklerden silme davranışı açıklandı.
- [ ] KVKK Aydınlatma Metni hukuk uzmanı tarafından kontrol edildi.
- [ ] Gizlilik Politikası hukuk uzmanı tarafından kontrol edildi.
- [ ] Gerekli açık rıza süreçleri ayrı tasarlandı.
- [ ] Google Play Data Safety formu gerçek davranışla uyumlu.
- [ ] App Store App Privacy beyanı gerçek davranışla uyumlu.
- [ ] Gizlilik politikası URL'si çalışıyor.
- [ ] Destek ve başvuru kanalı çalışıyor.
- [ ] Android ve iOS'ta silme ve gizlilik ekranları test edildi.

---

## 30. Açık gizlilik konuları

1. Veri sorumlusunun kesin kimliği ve iletişim bilgileri
2. VERBİS kayıt veya istisna durumu
3. Supabase production bölgesi
4. Yurt dışına aktarım yöntemi
5. Supabase alt işleyenleri ve yedek konumu
6. Production e-posta hizmeti
7. Hata izleme kullanımı
8. Analitik kullanımı
9. Yasal olayların saklama süresi
10. Güvenlik olaylarının saklama süresi
11. Hesap silme talebi kayıtlarının saklama süresi
12. Yedeklerden silme süresi
13. Destek kayıtlarının saklama süresi
14. Çocuklara ilişkin yaş yaklaşımı
15. Nihai KVKK Aydınlatma Metni
16. Nihai Gizlilik Politikası
17. Gerekirse Açık Rıza Metni
18. Veri sahibi başvuru yöntemi
19. Google Play Data Safety cevapları
20. App Store App Privacy cevapları

Bu konular hukuk, teknik yapı ve gerçek üçüncü taraf sözleşmeleri incelenmeden kesin kabul edilmemelidir.

---

## 31. İlgili bilinen sorunlar

```text
KI-001 → Supabase production bölgesi
KI-002 → Yurt dışına veri aktarımı
KI-003 → Fiyat sağlayıcısı ticari kullanım hakkı
KI-017 → Production e-posta hizmeti
KI-018 → Hesap silme kısmi hata telafisi
KI-019 → Saklama süreleri
KI-025 → Hukuk uzmanı onaylı metinler
KI-026 → Google Play ve App Store gizlilik beyanları
```

Ayrıntılar `KNOWN_ISSUES.md` içinde tutulur.

---

## 32. Resmî ve güncel başvuru kaynakları

Bu çalışma taslağı hazırlanırken başvurulan resmî kaynaklar:

- Kişisel Verileri Koruma Kurumu, Kişisel Verilerin Yurt Dışına Aktarılması Rehberi: https://www.kvkk.gov.tr/Icerik/8143/Kisisel-Verilerin-Yurt-Disina-Aktarilmasi-Rehberi
- Kişisel Verileri Koruma Kurumu, Yurt Dışına Aktarım: https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim
- Google Play Console Help, Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play Console Help, Account Deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Apple Developer, App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Apple Developer, Offering Account Deletion in Your App: https://developer.apple.com/support/offering-account-deletion-in-your-app

Bu kaynaklar ve mevzuat zamanla değişebilir. Production öncesinde güncel sürümleri yeniden kontrol edilmelidir.

---

## 33. İlgili proje belgeleri

```text
docs/PROJECT_CONTEXT.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/API.md
docs/DECISIONS.md
docs/TODO.md
docs/CHANGELOG.md
docs/KNOWN_ISSUES.md
docs/HANDOFF.md
docs/SECURITY.md
docs/DATA_RETENTION.md
.github/copilot-instructions.md
```

Yeni kişisel veri veya üçüncü taraf hizmet eklendiğinde en az şu belgeler birlikte incelenir:

```text
PRIVACY.md
SECURITY.md
DATA_RETENTION.md
DATABASE.md
API.md
DECISIONS.md
TODO.md
CHANGELOG.md
```

---

## 34. Belge güncelleme kuralları

Bu belge aşağıdaki durumlarda güncellenmelidir:

- Yeni kişisel veri toplanırsa
- Mevcut veri alanı kaldırılırsa
- İşleme amacı değişirse
- Yeni üçüncü taraf hizmet eklenirse
- Supabase bölgesi veya sağlayıcısı değişirse
- Yurt dışına aktarım yöntemi kesinleşirse
- Saklama süreleri değişirse
- Hesap silme davranışı değişirse
- Hata izleme veya analitik eklenirse
- Google Play veya App Store beyanı değişirse
- Veri sorumlusu veya iletişim bilgileri değişirse
- Hukuk uzmanı geri bildirimi alınırsa
- Güvenlik ihlali yaşanırsa

Değişiklik ayrıca `CHANGELOG.md` içine kaydedilmeli, karar değişiyorsa `DECISIONS.md` güncellenmelidir.

---

## 35. Sürüm geçmişi

### 1.4 - 27.10.2026

- Bölüm 7 mükerrer 7.7 başlığı giderildi, "İşçilik dâhil bilgisi" portföy verileri (7.4) altına taşındı ve alt başlıklar (7.4 - 7.10) ardışık olarak numaralandırıldı.
- KVKK veri minimizasyonu uyarınca `delete-account` istek gövdesinden ve tablodan `reason` parametresi kaldırıldı.
- Edge Functions listesine `retry-account-deletions` ve `fetch-gold-prices` eklendi.

### 1.3 Taslak - 26.10.2026

- Dış denetim bulguları giderildi:
  - Bölüm 7.5 mükerrer başlık numaralandırması düzeltildi (7.6 Finansal Sonuçlar, 7.7 Yasal Olaylar).
  - Hesap silme ve anonimleştirme mimarisi Model A (Edge Function işlem dışı yönetim + atomik execute_account_deletion RPC) ve saklama süreleri (güvenlik 1 yıl, yasal/silme 3 yıl) senkronize edildi.

### 1.2 Taslak - 26.10.2026

- Veri sorumlusu iletişim e-postası `adem@altiniz.app` olarak eşitlendi.
- Migration 012 ile 6 adet gerçek yasal metin ve SHA-256 hash bütünlüğü veritabanı ile senkronize edildi.
- Destek ve başvuru kanalları güncellendi.

### 1.1 Taslak - 22.10.2026

- Faz 13.1 Gizlilik incelemesi tamamlandı.
- V1 kişisel veri envanteri veritabanı şemasıyla (`auth.users.email`, `user_profiles.display_name`, `user_preferences.theme`, `portfolio_entries.quantity`, `portfolio_entries.total_cost_minor`, `portfolio_entries.purchase_place`, `portfolio_entries.note`, `user_legal_events`, `account_deletion_requests`) tam olarak eşleştirildi.
- Supabase Frankfurt (eu-central-1, Almanya) AB veri merkezi ve uçtan uca TLS / HTTPS veri akışı netleştirildi.
- Fiyat sağlayıcısına hiçbir kişisel verinin iletilmediği (kullanıcı kimliği, e-posta, portföy izolasyonu) kesinleştirildi.
- V1 kapsamında harici hata izleme ve analitik aracı kullanılmayacağı (0 Tracking) karara bağlandı.
- Google Play Veri Güvenliği (Data Safety) ve Apple App Store App Privacy (No Tracking, Linked to User) resmi beyan tabloları oluşturuldu.
- `supabase/tests/test-faz13-1-privacy-review.ts` test paketi hazırlandı ve doğrulandı.

### 1.0 Taslak - 03.09.2026

- Gizlilik kapsamı ve temel ilkeler tanımlandı.
- Veri konusu kişi grupları eklendi.
- Veri sorumlusu için tamamlanacak alanlar oluşturuldu.
- Hesap, profil, tercih, portföy, yasal olay, silme ve güvenlik verileri envantere eklendi.
- V1'de toplanmayacak veriler açıkça listelendi.
- Veri işleme amaçları ve hukuki sebep çalışma alanı oluşturuldu.
- Temel veri akışları belgelendi.
- Üçüncü taraf hizmet envanteri oluşturuldu.
- Yurt dışına aktarım değerlendirme maddeleri eklendi.
- Kullanıcı hakları ve uygulama içi kontroller tanımlandı.
- Hesap silme ve saklama ilkeleri eklendi.
- Google Play ve App Store gizlilik hazırlıkları eklendi.
- Production öncesi gizlilik kontrol listesi oluşturuldu.
- Açık gizlilik konuları ve resmî başvuru kaynakları eklendi.
