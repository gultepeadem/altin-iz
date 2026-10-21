# Altın İz

**Altınlarını Kaydet, Değerini İzle**

Altın İz, kullanıcıların güncel altın alış ve satış fiyatlarını görüntüleyebileceği, satın alma veya bozdurma hesabı yapabileceği ve kişisel altın portföyünü takip edebileceği Android ve iOS uyumlu bir mobil uygulama projesidir.

> Proje şu anda planlama ve dokümantasyon aşamasındadır. Expo uygulaması, Supabase projesi ve Git deposu henüz oluşturulmamıştır. Bu README dosyasındaki kurulum komutları, gerçek proje oluşturulduktan ve güncel resmî dokümantasyonla doğrulandıktan sonra eklenecektir.

---

## Proje durumu

```text
Proje aşaması: Proje iskeleti (Faz 2)
Uygulama kodu: Varsayılan Expo Router iskeleti oluşturuldu
Expo projesi: Oluşturuldu (Expo SDK 58, TypeScript)
Supabase projesi: Henüz oluşturulmadı
Git deposu: Henüz oluşturulmadı
Gerçek fiyat API hesabı: Henüz oluşturulmadı
Android testi: Hazır (Expo Go)
iOS testi: Planlandı (EAS Build / Expo Go)
Gerçek kullanıcı verisi: Yok
```

Güncel çalışma durumu için önce şu dosyayı okuyun:

```text
docs/HANDOFF.md
```

---

## İçindekiler

- [Projenin amacı](#projenin-amacı)
- [V1 özellikleri](#v1-özellikleri)
- [V1 kapsamı dışında kalanlar](#v1-kapsamı-dışında-kalanlar)
- [Teknoloji yığını](#teknoloji-yığını)
- [Temel iş kuralları](#temel-iş-kuralları)
- [Sistem mimarisi](#sistem-mimarisi)
- [Hedef klasör yapısı](#hedef-klasör-yapısı)
- [Proje belgeleri](#proje-belgeleri)
- [Belge okuma sırası](#belge-okuma-sırası)
- [Kurulum durumu](#kurulum-durumu)
- [Ortam değişkenleri](#ortam-değişkenleri)
- [Geliştirme düzeni](#geliştirme-düzeni)
- [Test yaklaşımı](#test-yaklaşımı)
- [Güvenlik ve gizlilik](#güvenlik-ve-gizlilik)
- [Fiyat verisi yaklaşımı](#fiyat-verisi-yaklaşımı)
- [Hesap ve veri silme](#hesap-ve-veri-silme)
- [Katkı kuralları](#katkı-kuralları)
- [Yasal ve finansal uyarı](#yasal-ve-finansal-uyarı)
- [Sıradaki görev](#sıradaki-görev)

---

## Projenin amacı

Altın İz'in amacı, altın sahibi olan veya altın alım-satım hesabı yapmak isteyen kullanıcıya sade ve güvenilir bir mobil deneyim sunmaktır.

Kullanıcı:

- Farklı altın türlerinin alış ve satış fiyatlarını görebilir.
- Belirli miktarda altının tahmini satın alma tutarını hesaplayabilir.
- Elindeki altının tahmini bozdurma değerini hesaplayabilir.
- Altın alışlarını ayrı portföy kayıtları olarak saklayabilir.
- Toplam maliyetini ve tahmini güncel değerini görebilir.
- Tahmini kâr veya zararını takip edebilir.
- Portföy kayıtlarını düzenleyebilir veya silebilir.
- Hesabını ve ilişkili verilerini silme sürecini başlatabilir.

Altın İz yatırım danışmanlığı hizmeti vermez ve kesin alım-satım fiyatı sunmaz.

---

## V1 özellikleri

### Kullanıcı hesabı

- E-posta ve şifreyle hesap oluşturma
- E-posta doğrulama
- Güvenli giriş
- Oturum yenileme
- Şifre sıfırlama
- Güvenli çıkış
- Hesap durumunu yönetme
- Hesabı ve ilişkili verileri silme

### Altın fiyatları

- Altın ürünlerini listeleme
- Alış ve satış fiyatlarını ayrı gösterme
- Son fiyat zamanını gösterme
- Eski fiyat uyarısı
- Eksik veya kullanılamayan fiyat durumu
- Ürün detay ekranı
- Arama ve sıralama

### Hesaplama

- Satın alma tahmini
- Bozdurma tahmini
- Ürüne göre adet veya gram girişi
- Kullanılan fiyat türünü gösterme
- Son fiyat zamanını gösterme
- Fiyat bulunamadığında hesaplamayı engelleme

### Portföy

- Portföye altın ekleme
- Her alışın ayrı kayıt olarak tutulması
- Altın türü, miktar, alış tarihi ve toplam maliyet kaydı
- İsteğe bağlı alış yeri, not ve işçilik dâhil bilgisi
- İşçilik dâhil bilgisini yalnızca açıklayıcı veri olarak kullanma
- İşçilik bilgisini fiyat veya portföy değerine otomatik olarak eklememe
- Portföy kaydını görüntüleme
- Portföy kaydını düzenleme
- Portföy kaydını silme
- Tahmini güncel bozdurma değeri
- Tahmini kâr veya zarar
- Kısmi portföy özeti

### Ayarlar

- Açık tema
- Koyu tema
- Sistem teması
- Hesap bilgileri
- Yasal ve gizlilik belgeleri
- Çıkış
- Hesap ve veri silme

---

## V1 kapsamı dışında kalanlar

- Favoriler
- Fiyat alarmları
- Anlık bildirimler
- WebSocket fiyat akışı
- Fiyat grafikleri
- Portföy performans grafikleri
- Satış geçmişi
- Kısmi satış
- Gerçekleşmiş kâr-zarar
- Google ile giriş
- Apple ile giriş
- Telefon numarasıyla giriş
- Çoklu dil
- Çoklu para birimi
- PDF veya Excel dışa aktarma
- Kamera ile fiş tarama
- Konum ve harita
- Kuyumcu bulma
- Mesajlaşma
- Sosyal özellikler
- Reklam
- Premium üyelik
- Uygulama içi ödeme
- Altın haberleri
- Yapay zekâ fiyat tahmini
- Web uygulaması
- Gelişmiş yönetici paneli

V1 kapsamının ayrıntılı ve bağlayıcı tanımı `PROJECT_CONTEXT.md` içinde, kapsam kararının gerekçesi ise `DECISIONS.md` içindeki ADR-022 kaydında tutulur. Bu bölüm bu belgelerin özetidir. Belgeler arasında fark oluşursa önce `PROJECT_CONTEXT.md` ve ADR-022 esas alınır, ardından diğer belgeler bunlarla eşitlenir.

---

## Teknoloji yığını

### Mobil uygulama

```text
React Native
Expo
TypeScript
Expo Router
```

### Backend

```text
Supabase Auth
Supabase PostgreSQL
Supabase Data API
PostgreSQL Row Level Security
Supabase Edge Functions
```

### Hedef platformlar

```text
Android
iOS
```

Her iki platform zorunludur. Bir özellik yalnızca Android'de veya yalnızca iOS'ta çalışıyorsa tamamlanmış sayılmaz.

### Fiyat sağlayıcısı adayları

```text
Birincil aday: AltinAPI
Yedek aday: Altinapps
```

Sağlayıcı seçimi production için henüz kesinleşmemiştir. Gerçek API yanıtları, semboller, birimler, ticari kullanım hakkı ve veri saklama şartları doğrulanmalıdır.

---

## Temel iş kuralları

### Satın alma hesabı

```text
Tahmini Satın Alma Tutarı = Miktar × Güncel Satış Fiyatı
```

### Bozdurma hesabı

```text
Tahmini Bozdurma Değeri = Miktar × Güncel Alış Fiyatı
```

### Portföy güncel değeri

```text
Tahmini Güncel Değer = Miktar × Güncel Alış Fiyatı
```

### Kâr veya zarar

```text
Tahmini Kâr/Zarar = Tahmini Güncel Değer - Ödenen Toplam Tutar
```

### Değişim yüzdesi

```text
Değişim Yüzdesi = (Tahmini Kâr/Zarar ÷ Ödenen Toplam Tutar) × 100
```

### Fiyat bulunamadığında

- `0 TL` kullanılmaz.
- Başka ürünün fiyatı sessiz yedek olarak kullanılmaz.
- Hesaplama yapılmaz.
- Kullanıcıya fiyatın alınamadığı açıkça gösterilir.

### Eski fiyat

Son bilinen fiyat kullanılabilir, ancak:

- Eski olduğu açıkça belirtilir.
- Fiyat zamanı gösterilir.
- Canlı veya güncel fiyat gibi sunulmaz.

### Kısmi portföy

Bir veya daha fazla portföy kaydının fiyatı bulunamıyorsa sonuç `Kısmi toplam` olarak işaretlenir. Hesaplanamayan kayıt sayısı kullanıcıya gösterilir.

---

## Para ve miktar modeli

### Para değerleri

Para tutarları veritabanında kuruş cinsinden tam sayı olarak saklanır:

```text
Veritabanı türü: BIGINT
Alan eki: _minor
Örnek: 48.000,00 TL = 4.800.000 kuruş
```

### Miktar değerleri

```text
Veritabanı türü: NUMERIC(18,3)
```

- Adetli ürünlerde pozitif tam sayı kullanılır.
- Gramlı ürünlerde en fazla üç ondalık basamak kullanılır.
- Ölçü birimi kullanıcı tarafından serbest yazılmaz, ürün kataloğundan gelir.

TypeScript tarafındaki kesin sayısal hassasiyet yaklaşımı henüz belirlenmemiştir. Ayrıntılar `KNOWN_ISSUES.md` içindeki `KI-013` kaydında bulunur.

---

## Sistem mimarisi

```text
Kullanıcı
   ↓
React Native + Expo Mobil Uygulama
   │
   ├── Sunum Katmanı
   │      ├── Expo Router ekranları
   │      ├── Ortak bileşenler
   │      └── Formlar ve tema
   │
   ├── Uygulama Katmanı
   │      ├── Auth durumu
   │      ├── Fiyat veri akışı
   │      └── Portföy işlemleri
   │
   ├── Etki Alanı Katmanı
   │      ├── Para hesaplamaları
   │      ├── Miktar kuralları
   │      └── Kâr-zarar hesaplamaları
   │
   └── Veri Katmanı
          ├── Supabase istemcisi
          ├── Auth servisi
          ├── Fiyat servisi
          └── Portföy servisi

Supabase
   ├── Auth
   ├── PostgreSQL
   ├── Row Level Security
   ├── Data API
   └── Edge Functions
          └── Dış Fiyat Sağlayıcısı
```

Ayrıntılı mimari için:

```text
docs/ARCHITECTURE.md
```

---

## Hedef klasör yapısı

Expo projesi oluşturulduktan sonra hedeflenen ana yapı:

```text
altin-iz/
├── .github/
│   └── copilot-instructions.md
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (public)/
│   └── (protected)/
│
├── src/
│   ├── components/
│   ├── constants/
│   ├── domain/
│   ├── hooks/
│   ├── lib/
│   ├── models/
│   ├── providers/
│   ├── services/
│   ├── theme/
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── tests/
│
├── tests/
├── docs/
├── assets/
├── .env.example
├── .gitignore
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
└── README.md
```

Bu yapı henüz gerçek proje içinde oluşturulmamıştır. Güncel Expo projesinin varsayılan yapısı incelenmeden klasörler toplu biçimde oluşturulmamalıdır.

---

## Proje belgeleri

### Güncel bağlam ve çalışma durumu

```text
docs/PROJECT_CONTEXT.md
docs/HANDOFF.md
```

### Teknik tasarım

```text
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/API.md
```

### Kararlar ve çalışma planı

```text
docs/DECISIONS.md
docs/TODO.md
docs/CHANGELOG.md
docs/KNOWN_ISSUES.md
```

### Güvenlik, gizlilik ve saklama

```text
docs/SECURITY.md
docs/PRIVACY.md
docs/DATA_RETENTION.md
```

### Yapay zekâ çalışma kuralları

```text
.github/copilot-instructions.md
```

---

## Belge okuma sırası

Projeyi ilk kez açan geliştirici veya yapay zekâ şu sırayla ilerlemelidir:

```text
1. README.md
2. .github/copilot-instructions.md
3. docs/HANDOFF.md
4. docs/PROJECT_CONTEXT.md
5. docs/TODO.md
6. docs/KNOWN_ISSUES.md
7. docs/DECISIONS.md
8. docs/ARCHITECTURE.md
9. docs/DATABASE.md
10. docs/API.md
11. docs/SECURITY.md
12. docs/PRIVACY.md
13. docs/DATA_RETENTION.md
14. docs/CHANGELOG.md
```

Başlangıç belge setinde eksik dosya bulunmamaktadır. Kod veya gerçek klasör yapısı belgelerden farklıysa sessizce varsayım yapılmamalı, gerçek durum incelenmeli ve ilgili takip belgeleri birlikte güncellenmelidir.

---

## Kurulum durumu

### Şu anda kurulum yapılabilir mi?

Henüz hayır. Başlangıç belgelerinin çapraz kontrolü tamamlanmıştır; şimdi sırasıyla:

1. Bilgisayardaki mevcut geliştirme araçları kontrol edilmelidir.
2. Güncel Expo SDK ve proje oluşturma yöntemi resmî dokümantasyondan doğrulanmalıdır.
3. Android fiziksel test cihazı belirlenmelidir.
4. iOS test yöntemi planlanmalıdır.

### Gelecekte eklenecek kurulum alanı

Expo projesi oluşturulduktan sonra bu bölümde aşağıdakiler yer alacaktır:

```text
Gerekli Node.js sürümü
Gerekli npm sürümü
Projeyi klonlama komutu
Paket kurulum komutu
Ortam dosyası hazırlığı
Development uygulamasını başlatma komutu
Android çalıştırma adımları
iOS çalıştırma adımları
Supabase yerel geliştirme adımları
Test komutları
```

Doğrulanmamış komutlar bu README dosyasına eklenmemelidir.

---

## Geliştirme gereksinimleri

Gerçek sürümler Expo projesi oluşturulduktan sonra doldurulacaktır:

```text
Node.js: v24.18.0
npm: 11.16.0
Expo SDK: 58.0.16
React Native: 0.88.0
TypeScript: 6.0.3
Expo Router: 58.0.24
Supabase JavaScript istemcisi: BELİRLENMEDİ (Faz 5'te kurulacak)
Supabase CLI: GEREKLİLİĞİ VE SÜRÜMÜ BELİRLENMEDİ (Faz 4.1)
```

Gereksinimler güncel resmî kaynaklardan doğrulanmadan kullanıcıya eski sürümler kurdurulmamalıdır.

---

## Ortam değişkenleri

### Mobil istemci

Planlanan public ortam değişkenleri:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_APP_ENV=development
```

Bu değerler `.env.example` içinde yalnızca isim ve boş örnek değer olarak bulunabilir.

### Sunucu ortamı

Planlanan gizli sunucu değerleri:

```text
SUPABASE_URL
SUPABASE_SECRET_KEY veya gerekli en düşük yetkili anahtar
GOLD_PRICE_API_BASE_URL
GOLD_PRICE_API_KEY
GOLD_PRICE_PROVIDER_CODE
GOLD_PRICE_REQUEST_TIMEOUT_MS
```

### Kesinlikle mobil uygulamaya eklenmeyecekler

```text
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_PASSWORD
GOLD_PRICE_API_KEY
SMTP_PASSWORD
EMAIL_PROVIDER_SECRET
```

Gerçek anahtarlar README, `.env.example`, Git geçmişi, ekran görüntüsü veya issue kaydına yazılmamalıdır.

---

## Ortamlar

Planlanan ortamlar:

```text
Development
Preview
Production
```

### Development

- Test hesapları kullanılır.
- Gerçek kullanıcı verisi kullanılmaz.
- Production secret değerleri bulunmaz.
- Otomatik fiyat çekme kapalı veya sınırlı olabilir.

### Preview

- Sınırlı test kullanıcıları kullanılır.
- Mağaza öncesi akışlar test edilir.
- Production veritabanından ayrıdır.

### Production

- Yalnızca doğrulanmış migrationlar uygulanır.
- Test verisi bulunmaz.
- Debug logları sınırlandırılır.
- Gerçek fiyat sağlayıcısı lisansı doğrulanmış olmalıdır.
- Hukuk ve mağaza gereksinimleri tamamlanmış olmalıdır.

---

## Geliştirme düzeni

Her teknik görevde şu sıra izlenir:

```text
1. HANDOFF.md ve ilgili belgeleri oku
2. Mevcut dosya ve kodu incele
3. Değişecek dosyaları listele
4. Riskleri değerlendir
5. Git durumunu kontrol et
6. Küçük ve tek amaçlı değişiklik yap
7. TypeScript ve biçim kontrollerini çalıştır
8. İlgili testleri çalıştır
9. Android etkisini kontrol et
10. iOS etkisini kontrol et
11. Güvenlik etkisini kontrol et
12. Gizlilik ve saklama etkisini kontrol et
13. Belgeleri güncelle
14. Çalışan sürümü Git'e kaydet
15. HANDOFF.md dosyasını güncelle
```

Birden fazla bağımsız özellik tek değişiklik grubuna karıştırılmamalıdır.

---

## Git yaklaşımı

Git deposu henüz oluşturulmamıştır.

Oluşturulduktan sonra:

- Her commit tek ve anlaşılır amaç taşımalıdır.
- Commit öncesi ilgili testler çalıştırılmalıdır.
- `.env` ve `.env.local` dosyaları Git'e eklenmemelidir.
- Gerçek kullanıcı verisi Git'e eklenmemelidir.
- Kilit dosyası korunmalıdır.
- Büyük ve riskli değişiklikten önce çalışan sürüm kaydedilmelidir.
- Force push ve geçmiş yeniden yazma işlemleri sonuçları anlaşılmadan kullanılmamalıdır.

Gerçek commit oluşmadan README veya `HANDOFF.md` içine örnek commit kimliği yazılmamalıdır.

---

## Test yaklaşımı

### Birim testleri

Öncelikli alanlar:

- Para dönüştürme
- Miktar doğrulama
- Satın alma hesabı
- Bozdurma hesabı
- Kâr-zarar
- Değişim yüzdesi
- Kısmi portföy toplamı
- Eski fiyat belirleme
- Hata dönüştürme

### Entegrasyon testleri

- Auth kayıt ve giriş
- E-posta doğrulama
- Şifre sıfırlama
- Oturum yenileme
- Portföy CRUD
- Fiyat sorguları
- Yasal belge sorguları
- Edge Functions
- Hesap silme

### Güvenlik testleri

İki bağımsız kullanıcıyla:

```text
Kullanıcı A, B'nin verisini okuyamaz.
Kullanıcı A, B adına veri oluşturamaz.
Kullanıcı A, B'nin verisini güncelleyemez.
Kullanıcı A, B'nin verisini silemez.
Kullanıcı A, kayıt sahibini B olarak değiştiremez.
```

### Platform testleri

- Android fiziksel cihaz
- iPhone veya geçerli TestFlight süreci
- Açık ve koyu tema
- Klavye ve tarih seçici
- Derin bağlantılar
- Güvenli oturum saklama
- Çıkış sonrası önbellek temizliği
- Arka plan ve ön plan geçişi

Test çalıştırılmadıysa açıkça `Çalıştırılmadı` olarak belirtilmelidir.

---

## Güvenlik ve gizlilik

Ana güvenlik ilkesi:

```text
Mobil uygulama kullanıcı deneyimi sağlar.
Veritabanı ve güvenli sunucu işlemleri gerçek yetki sınırını uygular.
```

### Zorunlu güvenlik kontrolleri

- Supabase Auth
- E-posta doğrulama
- Güvenli mobil oturum saklama
- PostgreSQL RLS
- Kullanıcı sahipliği kontrolü
- En az yetki
- Secret store
- HTTPS
- Veritabanı kısıtları
- Girdi doğrulama
- Log redaksiyonu
- Ortam ayrımı
- Git secret taraması

### Gizlilik yaklaşımı

V1 yalnızca hizmet için gerekli verileri işlemeyi hedefler. Aşağıdaki veriler planlanan kapsamda değildir:

```text
TC kimlik numarası
Açık adres
Telefon rehberi
Kesin konum
Kamera ve galeri
Mikrofon
Biyometrik veri
Sağlık verisi
IBAN
Banka hesap bilgisi
Kredi kartı bilgisi
Reklam kimliği
```

Ayrıntılar:

```text
docs/SECURITY.md
docs/PRIVACY.md
docs/DATA_RETENTION.md
```

---

## Row Level Security

RLS kullanıcıya ait bütün temel tablolarda zorunludur.

Kullanıcı yalnızca:

- Kendi profilini okuyabilir, eksikse varsayılan olarak oluşturabilir ve izin verilen alanlarını (`display_name`) güncelleyebilir.
- Kendi tercihlerini okuyabilir, eksikse varsayılan olarak oluşturabilir ve yalnızca `theme` alanını güncelleyebilir.
- Kendi portföy kayıtlarını okuyabilir, kendi adına oluşturabilir, güncelleyebilir ve silebilir.
- Kendi yasal olay kayıtlarını (`user_legal_events`) ve hesap silme taleplerini (`account_deletion_requests`) yalnızca okuyabilir; bu iki tabloya doğrudan istemciden kayıt ekleyemez, güncelleyemez veya silemez.

Normal kullanıcı aşağıdaki yönetim tablolarını değiştiremez:

```text
gold_products
price_sources
price_source_product_mappings
gold_prices
price_fetch_runs
legal_documents
security_events
```

Arayüzde düğmeyi gizlemek güvenlik değildir. Yetkisiz işlem veritabanı tarafından reddedilmelidir.

---

## Fiyat verisi yaklaşımı

Mobil uygulama dış fiyat sağlayıcısına API anahtarıyla doğrudan bağlanmaz.

```text
Yetkili Edge Function
  → Dış fiyat sağlayıcısı
  → Yanıt doğrulaması
  → Ürün eşleştirmesi
  → PostgreSQL
  → Mobil uygulama
```

Her fiyat için:

- Sembol doğrulanır.
- Aktif eşleştirme aranır.
- Alış ve satış alanları doğrulanır.
- Para birimi ve ölçü birimi doğrulanır.
- Zaman damgası doğrulanır.
- Negatif veya sıfır fiyat reddedilir.
- Eski fiyat durumu korunur.
- Olağan dışı fiyat davranışı incelenir.

Dış semboller şu tabloyla merkezi ürünlere bağlanır:

```text
price_source_product_mappings
```

Bilinmeyen sembol otomatik ürün oluşturmaz.

---

## Hesap ve veri silme

Kullanıcı uygulama içinden hesabını ve ilişkili verilerini silme işlemini başlatabilecektir.

Planlanan akış:

```text
1. Oturumu doğrula
2. Yeniden kimlik doğrulama yap
3. Silme talebi oluştur
4. Hesabı deletion_pending yap
5. Portföy ve tercihleri sil
6. Yasal ve güvenlik kayıtlarını saklama politikasına göre işle
7. Profil ve Auth hesabını sil
8. Aktif oturumları kapat
9. Yerel önbelleği temizle
10. Sonucu doğrula
11. Kullanıcıyı bilgilendir
```

İşlem tamamlanmadan başarı gösterilmez. Kısmi başarısızlık telafi yöntemi production öncesinde kesinleştirilmelidir.

---

## Yasal ve finansal uyarı

Bu README teknik bir proje belgesidir. Nihai KVKK Aydınlatma Metni, Gizlilik Politikası, Kullanım Koşulları ve Veri Saklama Politikası yerine geçmez.

Uygulamada kullanılacak temel finansal bilgilendirme yaklaşımı:

```text
Uygulamada gösterilen fiyatlar ve hesaplamalar yalnızca bilgilendirme amaçlıdır. Fiyatlar kuyumcu, banka, piyasa koşulları, alış-satış farkı ve işçilik nedeniyle değişebilir. Gösterilen bilgiler yatırım danışmanlığı veya kesin alım-satım fiyatı niteliğinde değildir.
```

Production yayını öncesinde:

- Veri sorumlusu bilgileri belirlenmelidir.
- Hukuki sebepler doğrulanmalıdır.
- Yurt dışına aktarım yöntemi kesinleştirilmelidir.
- Saklama süreleri belirlenmelidir.
- Yasal metinler hukuk uzmanı tarafından incelenmelidir.
- Google Play ve App Store gizlilik beyanları gerçek uygulamayla karşılaştırılmalıdır.

---

## Katkı kuralları

Proje şu anda tek geliştiricili planlama aşamasındadır. İleride katkı kabul edilirse:

1. Önce `docs/HANDOFF.md` ve `docs/PROJECT_CONTEXT.md` okunmalıdır.
2. Görev `docs/TODO.md` içinde bulunmalıdır.
3. İlgili ADR kararları incelenmelidir.
4. Büyük mimari değişiklik ayrı karar kaydı gerektirir.
5. Kişisel veri veya yeni üçüncü taraf hizmet gizlilik incelemesi gerektirir.
6. Değişiklik küçük ve test edilebilir tutulmalıdır.
7. TypeScript, test, Android ve iOS etkisi raporlanmalıdır.
8. `CHANGELOG.md` ve `HANDOFF.md` güncellenmelidir.
9. Secret veya gerçek kullanıcı verisi katkıya eklenmemelidir.

Pull request şablonu ve dal stratejisi Git deposu oluşturulduktan sonra belirlenecektir.

---

## Bilinen önemli sorunlar

Production öncesinde çözülmesi gereken başlıca konular:

```text
Supabase production bölgesi
Yurt dışına kişisel veri aktarımı
Fiyat sağlayıcısının ticari kullanım hakkı
Gerçek fiyat sembolleri
Cumhuriyet ve Ata ürün ayrımı
Fiyatın eski sayılacağı süre
Olağan dışı fiyat doğrulama eşiği
TypeScript sayısal hassasiyet yöntemi
Mobil oturum saklama yöntemi
Android ve iOS auth derin bağlantıları
Production e-posta hizmeti
Hesap silme kısmi hata telafisi
Veri saklama süreleri
İOS gerçek test yöntemi
Marka ve uygulama kimlikleri
Hukuk uzmanı onaylı yasal metinler
Mağaza gizlilik beyanları
```

Ayrıntılı kayıtlar:

```text
docs/KNOWN_ISSUES.md
```

---

## Sıradaki görev

Güncel sıradaki tek görev `HANDOFF.md` içindeki **Sıradaki tek ve kesin görev** bölümünde tutulur. Ayrıntılı görev adımları ve tamamlanma koşulları `TODO.md` içindeki ilgili fazdan izlenir.

---

## Belge güncelleme kuralları

README aşağıdaki durumlarda güncellenmelidir:

- Proje aşaması değiştiğinde
- Expo projesi oluşturulduğunda
- Gerçek kurulum komutları doğrulandığında
- Teknoloji veya paket sürümleri kesinleştiğinde
- Klasör yapısı değiştiğinde
- Yeni ana özellik eklendiğinde
- V1 kapsamı değiştiğinde
- Ortam değişkenleri değiştiğinde
- Test komutları kesinleştiğinde
- Git ve katkı düzeni kesinleştiğinde
- Production yayımlandığında

Ayrıntılı değişiklik `CHANGELOG.md` içine kaydedilmelidir.

---

## Sürüm geçmişi

### 1.2 Taslak - 19.10.2026

- Portföy özelliklerine isteğe bağlı işçilik dâhil bilgisi eklendi.
- İşçilik bilgisinin yalnızca açıklayıcı olduğu ve hesaplamayı otomatik değiştirmediği belirtildi.
- V1 kapsamı dışında kalan özelliklere altın haberleri ve yapay zekâ fiyat tahmini eklendi.
- V1 kapsamı için `PROJECT_CONTEXT.md` ve ADR-022 tek gerçek kaynak olarak belirtildi.
- Toplanmayacak veriler listesine açık adres eklendi.
- RLS özeti `DATABASE.md` v1.2 ve `SECURITY.md` v1.1 ile eşitlendi.
- Sürüm geçmişi en yeni sürüm üstte olacak şekilde sıralandı ve dosya sonundaki bozuk kod bloğu işareti kaldırıldı.

### 1.1 Taslak - 03.09.2026

- Belge seti, kapsam kaynakları ve teknik tasarım belgeleriyle eşitlendi.
- Güvenlik, gizlilik, portföy ve fiyat verisi özetleri genişletildi.

### 1.0 Taslak - 03.09.2026

- Proje tanımı ve mevcut durum eklendi.
- V1 özellikleri ve kapsam dışı alanlar listelendi.
- Teknoloji yığını ve hedef platformlar eklendi.
- Temel hesaplama, fiyat, para ve miktar kuralları özetlendi.
- Sistem mimarisi ve hedef klasör yapısı eklendi.
- Proje belgeleri ve okuma sırası tanımlandı.
- Kurulumun henüz başlamadığı açıkça kaydedildi.
- Ortam değişkeni ve ortam ayrımı kuralları eklendi.
- Geliştirme, Git ve test yaklaşımı özetlendi.
- Güvenlik, gizlilik, RLS ve fiyat verisi kuralları eklendi.
- Hesap silme ve finansal bilgilendirme yaklaşımı eklendi.
- Katkı kuralları ve bilinen önemli sorunlar eklendi.
- Sıradaki görev bilgisayardaki mevcut geliştirme araçlarını kontrol etmek olarak belirlendi.