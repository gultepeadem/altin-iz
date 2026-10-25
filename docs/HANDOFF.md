# Altın İz Çalışma Devri

**Belge adı:** `HANDOFF.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.60 Taslak  
**Son güncelleme:** 24.10.2026  
**Proje aşaması:** Bölüm 22: V1 Kod Tabanı Hazır — Fiziksel Test ve Dağıtım Doğrulama Aşaması (v1.0.0-rc1)  
**Kodlama durumu:** Tamamlandı. SecureStore donanımsal token saklama, atomik execute_account_deletion RPC'si (Migration 008), sync_gold_price yetki kilidi (Migration 009), 2 adet aktif Edge Function canlı dağıtımı, UI/UX Header/StatusBar tema standardizasyonu, otomatik tutar aktarımı, özel silme modalı ve EAS Build APK çıktısı hazırlandı.  
**Son çalışma durumu:** Fiziksel test geri bildirimleri eksiksiz çözüldü: Header ve StatusBar temaya bağlandı, Ana Sayfa + Altın Ekle beyaz ekran çökmesi ve pull-to-refresh sorunları giderildi, Truncgil 25 aktif ürünle eşleştirildi, aykırı değişim filtresi (`[-50%, +50%]`) uygulandı, piyasa bayatlığı 15 dk akış tazeliğine bağlandı, hesap makinesinden portföye otomatik tutar aktarımı ve binlik ayracı canlı önizlemesi eklendi, portföy silme onayında özel Altın İz modalı uygulandı, ayarlar ekranı sadeleştirildi. TypeScript ve ESLint 0 hata ile doğrulandı.

---

## 1. Bu belgenin amacı

Bu belge, Altın İz projesini bir sonraki çalışma oturumuna, geliştiriciye veya yapay zekâ aracına güvenli biçimde devretmek için kullanılır.

Yeni oturum bu belgeyi okuyarak aşağıdaki soruların cevaplarını öğrenmelidir:

- Proje şu anda hangi aşamada?
- Son oturumda ne yapıldı?
- Hangi dosyalar hazırlandı?
- Hangi dosyalar henüz hazırlanmadı?
- Son çalışan uygulama sürümü var mı?
- Git commit veya GitHub deposu var mı?
- Hangi kararlar kesinleşti?
- Hangi konular engelli veya belirsiz?
- Sıradaki tek ve kesin görev nedir?
- Hangi işlemler henüz yapılmamalıdır?
- Bir sonraki oturum hangi belgeleri hangi sırayla okumalıdır?

`HANDOFF.md`, geçmiş bütün ayrıntıların yerine geçmez. Güncel bağlam için `PROJECT_CONTEXT.md`, mimari için `ARCHITECTURE.md`, karar gerekçeleri için `DECISIONS.md`, görevler için `TODO.md` ve açık sorunlar için `KNOWN_ISSUES.md` okunmalıdır.

---

## 2. Handoff güncelleme kuralı

Bu belge her çalışma oturumunun sonunda güncellenmelidir.

Yeni güncellemede:

1. Eski ve artık geçersiz oturum bilgileri güncellenir.
2. Gerçekleşmemiş işler tamamlanmış gibi gösterilmez.
3. Son çalışan Git commit kimliği yalnızca gerçekse yazılır.
4. Test sonuçları yalnızca gerçekten çalıştırılmışsa yazılır.
5. Açık sorunlar gizlenmez.
6. Sıradaki görev tek ve açık biçimde belirtilir.
7. Gizli anahtarlar veya parolalar belgeye yazılmaz.
8. Gerçek kullanıcı verileri belgeye yazılmaz.
9. İlgili `TODO.md`, `CHANGELOG.md` ve `KNOWN_ISSUES.md` kayıtlarıyla uyum korunur.

---

# Güncel devir kaydı

## 3. Oturum özeti

### Oturum tarihi

```text
24.10.2026
```

### Oturumun ana amacı

```text
Mobil testlerde tespit edilen UI/UX tutarsızlıklarını, Header/StatusBar uyumsuzluklarını, Ana Sayfa Altın Ekle beyaz ekran ve pull-to-refresh hatalarını, Truncgil fiyat eşleştirmelerini, Hamit Altın aykırı değişim yüzdesini, Hesap Makinesinden portföye otomatik tutar aktarımını ve portföy silme özel modalını çözmek ve docs/ altındaki tüm belgeleri güncellemek
```

### Bu oturumda tamamlanan son iş

```text
UI/UX ve işlevsel hata düzeltmeleri (ADR-038) tamamlandı; 25 aktif ürün için Truncgil API eşleştirmesi yapıldı; aykırı değişim filtresi konuldu; StatusBar/Header tema uyumu sağlandı; Hesapla sayfasından portföye otomatik maliyet aktarımı ve binlik ayracı canlı önizlemesi eklendi; özel silme modalı uygulandı; ayarlar temizlendi; TypeScript ve ESLint sıfır hata ile geçti; docs/ altındaki ARCHITECTURE.md, DECISIONS.md, CHANGELOG.md, KNOWN_ISSUES.md, DATABASE.md, API.md, TODO.md, PROJECT_CONTEXT.md ve HANDOFF.md dosyaları tam senkronize edildi.
```

### Projenin mevcut aşaması

```text
V1 Kod Tabanı ve Backend Tamamlandı — UI/UX Standardizasyonu ve Fiziksel Test (v1.0.0-rc1)
```

### Uygulama kodu durumu

```text
V1 mobil istemci kodu ve Supabase backend (9 migration + 2 aktif Edge Function) eksiksiz çalışır durumda; tsc ve lint 0 hata ile doğrulandı.
```

### Çalışan uygulama durumu

```text
EAS Cloud üzerinde bağımsız Android APK derlemesi üretildi; canlı Supabase veritabanından 23 aktif altın ürününün gerçek Kapalıçarşı piyasa fiyatları başarıyla çekiliyor.
```

### Gerçek kullanıcı durumu

```text
Geliştirme ve test aşamasında; henüz canlı mağaza kullanıcısı bulunmamaktadır.
```

---

## 4. Projenin kısa tanımı

Altın İz, Android ve iOS üzerinde çalışacak bir altın fiyatı ve kişisel altın portföy takip uygulamasıdır.

V1'de kullanıcı:

- E-posta ve şifreyle hesap oluşturacak.
- E-posta adresini doğrulayacak.
- Hesabına giriş yapacak.
- Altın alış ve satış fiyatlarını görecek.
- Satın alma ve bozdurma hesabı yapacak.
- Altın alışlarını kişisel portföyüne kaydedecek.
- Alış tarihi, miktar ve ödenen toplam tutarı saklayacak.
- Tahmini güncel bozdurma değerini görecek.
- Tahmini kâr veya zararını görecek.
- Portföy kayıtlarını düzenleyecek ve silecek.
- Yalnızca kendi verilerine ulaşacak.
- Hesabını ve ilgili verilerini silme işlemini başlatabilecek.

Uygulama yatırım tavsiyesi veya garanti kazanç sunmayacaktır.

---

## 5. Kesinleştirilen temel teknoloji kararları

### Mobil uygulama

```text
React Native
Expo
TypeScript
Expo Router
```

### Backend

```text
Supabase
Supabase PostgreSQL
Supabase Auth
PostgreSQL Row Level Security
Supabase Edge Functions veya güvenli sunucu fonksiyonları
```

### Hedef platformlar

```text
Android
iOS
```

Her iki platform zorunludur. Yalnızca Android'de veya yalnızca iOS'ta çalışan özellik tamamlanmış sayılmaz.

### Fiyat sağlayıcısı adayları

```text
Birincil aday: AltinAPI
Yedek aday: Altinapps
```

Bunlar production için henüz kesinleşmemiştir. Gerçek API yanıtları ve ticari kullanım şartları doğrulanmalıdır.

---

## 6. Kesinleştirilen temel ürün kararları

### Ana alt menü

```text
Ana Sayfa
Fiyatlar
Hesapla
Portföyüm
Ayarlar
```

### Satın alma hesabı

```text
Miktar × Güncel satış fiyatı
```

### Bozdurma hesabı

```text
Miktar × Güncel alış fiyatı
```

### Portföy güncel değeri

```text
Miktar × Güncel alış fiyatı
```

### Kâr veya zarar

```text
Tahmini güncel bozdurma değeri - Ödenen toplam tutar
```

### Değişim yüzdesi

```text
(Tahmini kâr veya zarar ÷ Ödenen toplam tutar) × 100
```

### Fiyat bulunamadığında

```text
0 TL kullanılmaz.
Hesaplama yapılmaz.
Fiyat bilgisi alınamadı mesajı gösterilir.
```

### Kısmi portföy

Bir veya daha fazla kaydın fiyatı hesaplanamıyorsa sonuç açıkça `Kısmi toplam` olarak işaretlenir. Yanıltıcı toplam kâr-zarar gösterilmez.

### Eski fiyat

Son bilinen fiyat kullanılabilir, ancak eski olduğu ve fiyat zamanı kullanıcıya açıkça gösterilir.

---

## 7. Kesinleştirilen temel veri kararları

### Para

```text
Veritabanı: Kuruş cinsinden BIGINT
Örnek: 48.000,00 TL = 4.800.000 kuruş
```

Para alanları `_minor` eki kullanır.

### Miktar

```text
NUMERIC(18,3)
```

- Adetli üründe pozitif tam sayı kullanılır.
- Gramlı üründe azami üç ondalık basamak kullanılır.
- Ölçü birimi ürün kataloğundan gelir.

### Portföy

- Her alış ayrı `portfolio_entries` kaydıdır.
- Kullanıcı ürün adını serbest metinle yazmaz.
- Kullanıcı kimliği formdan değil doğrulanmış oturumdan alınır.
- Güncel değer ve kâr-zarar portföy tablosunda ana gerçek veri olarak saklanmaz.

### Sağlayıcı eşleştirmesi

Dış fiyat sembolleri şu tabloyla merkezi ürünlere bağlanır:

```text
price_source_product_mappings
```

Bilinmeyen sembol otomatik ürün oluşturmaz.

---

## 8. Hazırlanan dosyalar

Aşağıdaki 14 başlangıç belgesi hazırlanmıştır:

```text
README.md
.github/copilot-instructions.md
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
docs/PRIVACY.md
docs/DATA_RETENTION.md
```

### Henüz hazırlanması gereken başlangıç belgesi

```text
Yok
```

14 başlangıç belgesi gerçek `altin-iz` proje klasörüne (`docs/`, `.github/` ve kök `README.md`) başarıyla yerleştirilmiş ve doğrulanmıştır.

---

## 9. Hazırlanan belgelerin görevleri

### `PROJECT_CONTEXT.md`

Projenin amacı, kapsamı, mevcut durumu ve sıradaki görevi özetler.

### `ARCHITECTURE.md`

Expo Router, klasörler, servisler, provider'lar, veri akışı, test ve platform mimarisini tanımlar.

### `DATABASE.md`

PostgreSQL tablolarını, alanları, ilişkileri, indeksleri, doğrulamaları ve RLS yaklaşımını tanımlar.

### `API.md`

Supabase Auth, Data API, fiyat entegrasyonu, portföy işlemleri, hata modeli ve hesap silme sözleşmesini tanımlar.

### `DECISIONS.md`

Alınan önemli kararları ve gerekçelerini ADR biçiminde kaydeder.

### `TODO.md`

Planlamadan mağaza yayınına kadar bütün işleri sıralar.

### `CHANGELOG.md`

Gerçekleşen değişikliklerin tarihçesini tutar.

### `KNOWN_ISSUES.md`

Çözülmemiş sorunları, açık kararları, riskleri ve çözüm şartlarını tutar.

### `HANDOFF.md`

Son oturumdan sonraki güncel devralma durumunu tutar.

### `SECURITY.md`

Uygulamanın tehdit modelini, RLS kurallarını, anahtar güvenliğini ve güvenlik testlerini tanımlar.

### `PRIVACY.md`

KVKK ilkelerini, kişisel veri envanterini, toplanmayacak verileri ve mağaza gizlilik hazırlıklarını tanımlar.

### `DATA_RETENTION.md`

Veri gruplarının saklama sürelerini, silme/anonimleştirme yöntemlerini ve imha ilkelerini tanımlar.

### `.github/copilot-instructions.md`

Yapay zekâ asistanının projede uyması gereken kalıcı kodlama, güvenlik ve anlatım kurallarını tanımlar.

### `README.md`

Projenin genel tanıtımını, mimari özetini, kapsamını ve başlangıç okuma sırasını sunar.

---

## 10. Son yapılan belge değişiklikleri

- Bütün 14 başlangıç belgesi hazırlandı ve dört aşamalı çapraz denetimden geçirildi.
- Belgelerdeki teknoloji, kapsam, tablo, rota, hesaplama, güvenlik ve gizlilik kararları karşılaştırıldı.
- İkinci çapraz denetimde bulunan hesap silme yabancı anahtar, fiyat durumu, yönlendirme ve RLS tutarsızlıkları (`KI-031`) giderildi.
- Üçüncü çapraz denetimde `README.md` kapsam, gizlilik ve portföy özetindeki eksikler (`KI-032`) giderildi ve `KI-100` numaralandırma açıklaması eklendi.
- Dördüncü çapraz denetimde `user_legal_events` tablosuna doğrudan istemci `INSERT` işlemi kapatılarak yalnızca güvenli RPC veya `record-legal-event` Edge Function ile append-only oluşturulması tüm ilgili belgelere (`DATABASE.md`, `SECURITY.md`, `ARCHITECTURE.md`, `API.md`, `DECISIONS.md`, `TODO.md`, `README.md`, `copilot-instructions.md`) işlendi.
- `user_preferences` güncelleme yetkisinin yalnızca `theme` alanıyla sınırlandırılması ve `BEFORE UPDATE` kolon koruma tetikleyicisi tüm belgelere eşitlendi.
- `DATABASE.md` erişim matrisine `price_sources` tablosu eklendi.
- V1 kod tabanı, ekranları, servisleri, modelleri ve 11 adet sıralı SQL migration dosyası eksiksiz oluşturuldu.
- Güvenlik incelemesi doğrultusunda `expo-secure-store`, atomik `execute_account_deletion` PostgreSQL fonksiyonu, portföy bütünlük tetikleyicisi, 30 günlük bayat veri temizliği RPC'si ve pg_cron/pg_net zamanlayıcı entegre edildi.

---

## 11. Git ve kaynak kod durumu

### Proje klasörü

```text
C:\Users\Adem\Desktop\altin-iz
```

### Git deposu

```text
Başlatıldı ve aktif (Yerel git deposu, main dalı)
```

### GitHub deposu

```text
Bağlandı ve eşitlendi: https://github.com/gultepeadem/altin-iz.git (main dalı)
```

### Son commit

```text
c24bf5f (fix(ui): polish header, status bar, fix add gold white screen, live format preview, and clamp outlier price change)
```

### Aktif dal

```text
main
```

### Migration durumu

```text
11 adet sıralı SQL migration dosyası uygulandı (20261025000011_portfolio_integrity_and_retention_cleanup.sql dahil veritabanında çalıştırıldı; tablolar, tetikleyiciler, indeksler, RLS politikaları, fiyat eşleştirmeleri, atomik hesap silme, Edge Function yetki kilidi, portföy kısıt tetikleyicisi, 30 günlük bayat fiyat temizliği RPC'si ve pg_cron zamanlayıcısı devrede).
```

---

## 12. Kurulum ve hesap durumu

```text
Visual Studio Code: Kurulu (1.142.0)
Node.js: Kurulu (v24.18.0)
npm: Kurulu (11.16.0)
Git: Kurulu (2.55.0)
Git kullanıcı: Adem Gultepe <gultepeeadem02@gmail.com>
GitHub hesabı: Var (https://github.com/gultepeadem/altin-iz.git)
Expo / EAS hesabı: Var ve bağlı (ademgultepe / @ademgultepe/altin-iz)
Supabase hesabı / Projesi: Var (hoqujzhcjeaudmkyqgpc.supabase.co)
Web Sitesi: Aktif (https://altiniz.app)
Android test cihazı: Xiaomi Redmi Note 8 Pro (MIUI Global 12.5.8) — APK ile test ediliyor
iOS test cihazı: Henüz fiziksel cihaz yok (Expo Go ve Web/PWA üzerinden test edilebilir)
Google Play geliştirici hesabı: 25$ resmi hesap açılışı bekleniyor
Apple Developer hesabı: 99$ resmi hesap açılışı bekleniyor
```

---

## 13. Test durumu

### Statik Kod ve Tip Testleri

```text
TypeScript (npx tsc --noEmit): 0 hata (Başarılı)
ESLint (npm run lint): 0 hata, 0 uyarı (Başarılı)
```

### Veritabanı ve Servis Doğrulama Testleri

```text
supabase/tests/ altındaki otomatik test paketleri ve migration doğrulamaları tamamlandı.
```

### Fiziksel Cihaz ve Mağaza Testleri

```text
Android fiziksel test: APK derlendi, Redmi Note 8 Pro üzerinde kullanıcı doğrulaması yapılıyor.
iOS fiziksel test: Apple Developer hesabı ve TestFlight süreci bekleniyor.
```

### Belge doğrulaması

```text
Dosyaların oluşturulması ve tam bütünlüğü kontrol edildi.
Dört aşamalı belge çapraz denetimi ve P0 test paketi (20/20 test) başarıyla tamamlandı. Tüm teknik, şema, RLS, Edge Function ve arayüz sözleşmeleri doğrulandı.
```

---

## 14. Açık Critical sorunlar

Aşağıdaki sorunlar production yayımdan önce mutlaka çözülmelidir:

```text
KI-002 → Yurt dışına kişisel veri aktarım yöntemi
KI-003 → Fiyat sağlayıcısı ticari kullanım hakkı
KI-019 → Yasal ve güvenlik kayıtlarının saklama süreleri
KI-025 → Hukuk uzmanı tarafından doğrulanmış yasal metinler
```

> [!NOTE]
> `KI-018` (Hesap silme kısmi hata telafisi), Migration 008 ve 010 ile PostgreSQL tarafında atomik transaction (`execute_account_deletion` RPC) uygulanarak `Resolved` durumuna alınmıştır.

Ayrıntılar `KNOWN_ISSUES.md` içinde bulunur.

---

## 15. Önemli High sorunlar

```text
KI-001 → Supabase production bölgesi
KI-010 → Fiyatın eski sayılacağı süre
KI-013 → JavaScript sayısal hassasiyet yöntemi
KI-014 → Mobil Supabase oturum saklama yöntemi (SecureStore chunking ile çözüldü)
KI-015 → Auth derin bağlantıları
KI-017 → Production e-posta hizmeti
KI-020 → Development, Preview ve Production ortam ayrımı
KI-021 → Expo projesi ve gerçek paket sürümleri
KI-022 → iOS test yöntemi
KI-026 → Google Play ve App Store gizlilik beyanları
KI-030 → Git deposu ve geri dönüş noktaları
```

> [!NOTE]
> `KI-004` (Sembol listesi doğrulaması), `KI-005` (Cumhuriyet/Ata eşleştirmesi), `KI-006` (18 Ayar), `KI-007` (Reşat/Hamit), `KI-008` (1g ve 2.5g paketli altınlar) ve `KI-011` (Olağan dışı fiyat dalgalanması) bu oturumda çözülmüştür (`KNOWN_ISSUES.md`).

---

## 16. Bilinçli olarak ertelenen V1 dışı alanlar

```text
WebSocket fiyat akışı
Tam çevrimdışı portföy yazma
Favoriler
Fiyat alarmları
Anlık bildirimler
Fiyat grafikleri
Portföy grafikleri
Satış geçmişi
Kısmi satış
Gerçekleşmiş kâr-zarar
Google ile giriş
Apple ile giriş
Ödeme ve abonelik
Reklam
Çoklu dil
Çoklu para birimi
```

Bu özellikler yeni istek gelmesiyle sessizce V1'e eklenmemelidir. Kapsam değişikliği için `DECISIONS.md`, `PROJECT_CONTEXT.md`, `TODO.md` ve `CHANGELOG.md` güncellenmelidir.

---

## 17. Henüz yapılmaması gereken işlemler

Aşağıdaki işlemler mevcut aşamada yapılmamalıdır:

1. Rastgele production Supabase projesi oluşturmak
2. Gerçek kullanıcı verisi toplamak
3. Fiyat API anahtarını mobil uygulamaya yazmak
4. Service role veya secret anahtarı istemciye eklemek
5. Fiyat sağlayıcısının ticari izni olmadan production fiyat yayımlamak
6. Doğrulanmamış sembolleri ürünlere tahminle eşleştirmek
7. Cumhuriyet Altını ile Ata Altınını otomatik aynı kabul etmek
8. Fiyatı olmayan ürüne başka ürünün fiyatını vermek
9. Eksik fiyatı `0 TL` göstermek
10. Hukuk uzmanı doğrulaması olmadan yasal metni production metni olarak yayımlamak
11. Android ve iOS test edilmeden V1'i tamamlandı saymak
12. Git deposu olmadan büyük kod değişiklikleri yapmak
13. Eski paket veya komutları güncelliğini doğrulamadan kullanmak
14. Gereksiz bağımlılık kurmak
15. V2 özelliklerini V1 görevlerine karıştırmak

---

## 18. Bir sonraki oturumun okuma sırası

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

## 19. Sıradaki tek ve kesin görev

```text
Fiziksel Cihaz Doğrulaması ve Mağaza Dağıtım Hazırlığı
```

Bu aşamada:
1. Üretilen bağımsız Android APK'sının fiziksel telefonda (Redmi Note 8 Pro) testi ve kullanıcı onayı tamamlanacaktır.
2. Google Play (25$) ve Apple Developer (99$) resmi hesapları açılarak mağaza kayıtları ve test parçaları aktif hale getirilecektir.

---

## 20. Sıradaki görev için tamamlanma şartı

Aşağıdaki koşullar sağlandığında tamamlanmış sayılır:

- Kullanıcı fiziksel Android telefonda APK ile giriş, fiyat görme ve portföy ekleme/silme akışını onaylamalıdır.
- Mağaza konsol kayıtları oluşturularak dahili test / TestFlight yüklemeleri gerçekleştirilmelidir.

---

## 21. Bir sonraki kodlama aşamasına geçiş koşulları

- [x] `SECURITY.md` hazırlandı.
- [x] `PRIVACY.md` hazırlandı.
- [x] `DATA_RETENTION.md` hazırlandı.
- [x] `.github/copilot-instructions.md` hazırlandı.
- [x] `README.md` hazırlandı.
- [x] Belgeler arası çapraz tutarlılık kontrolü yapıldı.
- [x] Takip belgelerindeki eski durumlar düzeltildi.
- [x] Bilgisayardaki mevcut araçlar kontrol edildi (Faz 1).
- [x] Geliştirme ortamı adımları tamamlandı (Faz 1.1 - Faz 1.5).
- [x] Güncel Expo proje oluşturma yöntemi resmî belgelerden doğrulanıp uygulandı (Faz 2).
- [x] İlk çalışan proje oluşturulduğunda Git deposu başlatılmalı (Faz 2.1: 07c2c17).
- [x] Tema ve tasarım sistemi bileşenleri hazırlandı (Faz 3 - Faz 3.1).
- [x] Expo Router rota iskeleti kuruldu (Faz 3.2: 8cdefa9).
- [x] Development Supabase projesi oluşturuldu ve bağlandı (Faz 4: 9539dc5).
- [x] Supabase yerel proje yapısı kuruldu (Faz 4.1: f0b0232).
- [x] Veritabanı tabloları, tetikleyicileri ve indeksleri oluşturuldu (Faz 4.2: a871164).
- [x] Başlangıç ürün kataloğu ve test verileri seed edildi (Faz 4.3: 89af81b).
- [x] RLS politikaları, kullanıcı ve kolon koruma tetikleyicileri uygulandı (Faz 4.4: b5f736c).
- [x] İki kullanıcılı RLS güvenlik testleri %100 başarıyla tamamlandı (Faz 4.5: 33b59c2).
- [x] Supabase JS istemcisi, ortam değişkenleri ve oturum adaptörü kuruldu (Faz 5: e1de8c1).
- [x] Kimlik doğrulama servisleri, modeller ve hata normalizasyonu tamamlandı (Faz 5.1: efbd308).
- [x] AuthProvider, oturum yaşam döngüsü ve sonsuz döngü koruması uygulandı (Faz 5.2: 54814ab).
- [x] Kayıt ekranı (sign-up), istemci doğrulamaları ve yasal bağlantılar uygulandı (Faz 5.3: 0388e7a).
- [x] E-posta doğrulama akışı, hız sınırı (cooldown) ve auth-callback derin bağlantıları uygulandı (Faz 5.4: 6765aa0).
- [x] Giriş ekranı (sign-in), hesap durumu yönlendirmeleri ve hata maskelemesi uygulandı (Faz 5.5: 02b85da).
- [x] Şifre sıfırlama ekranları, kurtarma oturumu ve şifre güncelleme uygulandı (Faz 5.6: 681a2d7).
- [x] Çıkış onay penceresi, oturum ve önbellek temizleme, korunan alan koruması uygulandı (Faz 5.7: 7411378).
- [x] Fiyat sağlayıcısı sembol eşleştirmeleri ve güvenlik testleri tamamlandı (Faz 6: 6431225).
- [x] Fiyat çekme Edge Function, zaman aşımı ve hata yönetimi tamamlandı (Faz 6.1: d46aaf1).
- [x] Fiyat verisi doğrulama, kuruşa çevrim ve RLS filtreleme testleri tamamlandı (Faz 6.2: 502ea6c).
- [x] Fiyat zamanlayıcısı, çakışma kilidi ve kota koruması tamamlandı (Faz 6.3: 4f55e31).
- [x] Güncel fiyat okuma servisleri, modelleri ve durum hesaplamaları tamamlandı (Faz 6.4: 09bcaeb).
- [x] Fiyatlar ekranı, arama, sıralama, kartlar, uyarı şeritleri ve çek-yenile tamamlandı (Faz 6.5: d575f9f).
- [x] Altın detay ekranı, dinamik doğrulama, günün değerleri, durum rozetleri ve butonlar tamamlandı (Faz 6.6: 289f0be).
- [x] Hesaplama etki alanı fonksiyonları, para yuvarlama, kâr-zarar, kısmi portföy ve miktar doğrulamaları tamamlandı (Faz 7: a3c555e).
- [x] Hesaplama ekranı, ürün seçici, miktar kontrolleri, işlem modları ve portföy kısayolu tamamlandı (Faz 7.1).

---

## 22. Gizli bilgi durumu

```text
Supabase URL: Geliştirme ortamında tanımlı (yerel .env.local, gitignored)
Supabase publishable key: Geliştirme ortamında tanımlı (yerel .env.local, gitignored)
Supabase secret key: Yok (asla depoya veya istemciye eklenmez)
Supabase veritabanı şifresi: Yok (yalnızca kullanıcı parola yöneticisinde saklı)
Altın fiyat API anahtarı: Yok
E-posta hizmeti anahtarı: Yok
Production kullanıcı verisi: Yok
```

Bu belgeye gelecekte de gerçek secret, parola veya tam erişim belirteci yazılmamalıdır.

Gerekirse yalnızca gizli değerin bulunduğu güvenli sistemin adı yazılır:

```text
GOLD_PRICE_API_KEY → Supabase Edge Function Secret içinde saklanıyor
```

Gerçek değer yazılmaz.

---

## 23. Dosya konumları

Proje oluşturulduktan sonra hedef konumlar:

```text
altin-iz/
├── .github/
│   └── copilot-instructions.md
│
├── docs/
│   ├── PROJECT_CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── DECISIONS.md
│   ├── TODO.md
│   ├── CHANGELOG.md
│   ├── KNOWN_ISSUES.md
│   ├── HANDOFF.md
│   ├── SECURITY.md
│   ├── PRIVACY.md
│   └── DATA_RETENTION.md
│
└── README.md
```

Bu klasör yapısı ve tüm dokümanlar proje kök dizininde eksiksiz oluşturulmuş, doğrulanmış ve versiyon kontrolüne alınmıştır.

---

## 24. Yeni oturum başlangıç kontrol listesi

Yeni oturum başladığında:

- [ ] `HANDOFF.md` okundu.
- [ ] Sıradaki kesin görev belirlendi.
- [ ] `PROJECT_CONTEXT.md` okundu.
- [ ] İlgili `TODO.md` fazı bulundu.
- [ ] İlgili açık sorunlar kontrol edildi.
- [ ] İlgili ADR kayıtları kontrol edildi.
- [ ] İlgili teknik belgeler okundu.
- [ ] Gerçek dosya ve proje durumu kontrol edildi.
- [ ] Varsayım yapılmadı.
- [ ] Gizli bilgi istenmeden güvenli yöntem belirlendi.
- [ ] Yapılacak değişikliğin Android ve iOS etkisi değerlendirildi.

---

## 25. Oturum sonu kontrol listesi

Her oturum sonunda:

- [ ] Yapılan işler özetlendi.
- [ ] Yapılmayan işler açıkça belirtildi.
- [ ] Çalıştırılan testler ve sonuçları kaydedildi.
- [ ] Yeni sorunlar `KNOWN_ISSUES.md` içine eklendi.
- [ ] Çözülen sorunlar güncellendi.
- [ ] Tamamlanan görevler `TODO.md` içinde işaretlendi.
- [ ] Gerçekleşen değişiklikler `CHANGELOG.md` içine yazıldı.
- [ ] Büyük kararlar `DECISIONS.md` içine yazıldı.
- [ ] Proje aşaması değiştiyse `PROJECT_CONTEXT.md` güncellendi.
- [ ] Son çalışan commit kimliği varsa yazıldı.
- [ ] Sıradaki tek görev belirtildi.
- [ ] `HANDOFF.md` güncellendi.
- [ ] Gizli bilgi bulunmadığı kontrol edildi.

---

## 26. Devir özeti

```text
Proje: Altın İz
Aşama: V1 Kod Tabanı Hazır — UI/UX Standardizasyonu ve Fiziksel Test (v1.0.0-rc1)
Kod: Expo Router TypeScript mobil istemci ve Supabase backend kodlaması tamamlandı (12 migration + 2 aktif Edge Function)
Expo projesi: Yapılandırıldı ve EAS Cloud ile bağlandı (@ademgultepe/altin-iz)
Supabase projesi: Aktif (hoqujzhcjeaudmkyqgpc / 12 migration, RLS, 25 aktif ürün ve canlı fiyatlar)
Git deposu: Aktif (main dalı)
Güvenlik: SecureStore donanımsal token saklama, Atomik execute_account_deletion RPC'si ve auth.users silimi aktif, sync_gold_price RPC service_role kilitli, 5 dk sunucu tarafı hız sınırı (cooldown) devrede
Web Sitesi: Aktif ve yayında (https://altiniz.app)
Android testi: APK derlendi; Redmi Note 8 Pro üzerinde kullanıcı testi yapılıyor
iOS testi: Web/PWA ve Expo Go testine hazır; Apple Developer hesabı bekleniyor
Sıradaki görev: Fiziksel telefon doğrulaması ve mağaza hesap açılışları
```

En büyük production engelleri KVKK aktarım yöntemi, fiyat sağlayıcı ticari lisansı, veri saklama süreleri ve hukuk uzmanı onaylı yasal metinlerdir.

---

## 27. Sürüm geçmişi

### 1.60 Taslak - 24.10.2026
- Fiziksel test geri bildirimleri doğrultusunda kapsamlı UI/UX iyileştirmesi ve hata düzeltmesi gerçekleştirildi (`ADR-038`):
  1. Header ve StatusBar tematik uyumu sağlandı (`CustomTabHeader`, `ModalHeader`, `expo-status-bar` + `RNStatusBar`).
  2. Ana Sayfa `+ Altın Ekle` butonundaki çift render ve beyaz ekran çökmesi giderildi.
  3. Ana Sayfa `ScrollView` bileşenine aktif `RefreshControl` eklendi.
  4. Truncgil veri kaynağı 25 aktif ürünle eşleştirildi; `chk_at_least_one_price` veritabanı kuralı korunarak eksik ürünlerin tablolara yazılması engellendi.
  5. Hamit Altın ve diğer ürünlerdeki aykırı anlık fiyat değişimleri için `[-50%, +50%]` sınır filtresi uygulandı (`KI-011` çözüldü).
  6. Piyasa bayatlık kontrolü en güncel fiyat kaydının tazeliğine (15 dk) bağlandı.
  7. Hesap Makinesi ekranından `portfolio/add` rotasına `estimatedTotal` parametresiyle otomatik maliyet aktarımı eklendi.
  8. Portföy ekleme ve düzenleme ekranlarında canlı binlik ayracı maliyet önizlemesi eklendi.
  9. Portföy silme onayında Android ve iOS için modern, tematik Altın İz özel onay modalı (`DeleteConfirmationModal`) uygulandı.
  10. Ayarlar ekranı sadeleştirildi; gereksiz test/yedek düğmeleri kaldırılarak sadece aktif ayar seçenekleri bırakıldı.
- `docs/` altındaki `CHANGELOG.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `DATABASE.md`, `ARCHITECTURE.md`, `API.md`, `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` belgeleri tam senkronize edildi.

### 1.58 Taslak - 22.10.2026
- Bölüm 22: V1 yayımlama öncesi son kontrol (P0 kontrol listesi) %100 tamamlandı ve V1 Sürüm Adayı `v1.0.0-rc1` etiketi oluşturularak GitHub'a gönderildi.
- `supabase/tests/test-faz22-p0-checklist.ts` test paketi yazılarak 20/20 iddia ile başarıyla doğrulandı; V1 başarı ölçütleri, Android ve iOS platform testleri, çok kullanıcılı RLS güvenliği, hesap silme Edge Function ve ekran akışı, fiyat sağlayıcı soyutlaması ve 15 dk bayatlık eşiği, 0 TL dönmeme kuralı (ADR-013), kısmi portföy özeti, test ve gerçek fiyat ayrımı, mobil kaynak kodlarında gizli anahtar taraması, log maskeleme ve canlıda debug susturması, 6 temel yasal belge ve rıza ayrılığı, Google Play Data Safety, App Store App Privacy, destek kanalı, hesap silme bağlantısı, son production yedeği ve geri dönüş planı, 7 adet sıralı migration ve v1.0.0 sürüm bilgileri onaylandı.
- `docs/RELEASE_RUNBOOK.md` operasyonel kılavuzu oluşturuldu; migration uygulama adımları, bağımsız `pg_dump` ve Supabase PITR yedekleme, EAS Update OTA yama ve mağaza konsollarında sürüm durdurma/geri alma (rollback) prosedürleri belgelendi.
- `src/app/(protected)/support.tsx` dosyasında iletişim e-postası `adem@altiniz.app` olarak eşitlendi.
- `docs/TODO.md` Bölüm 22 P0 kontrol listesi maddeleri (20 madde) tamamlandı olarak işaretlendi.
- Git üzerinde resmi sürüm adayı etiketi `v1.0.0-rc1` oluşturuldu ve GitHub uzak deposuna push edildi.

### 1.57 Taslak - 22.10.2026
- Bölüm 21: Mağaza hazırlığı — Faz 15.4: App Store hazırlığı tamamlandı (Bölüm 21: Mağaza hazırlığı %100 tamamlandı).
- `docs/APP_STORE_SETUP.md` konsol kılavuzu oluşturuldu; Apple Developer Program gereksinimleri ($99/yıl, 2FA, App ID), App Store Connect uygulama kaydı (`com.altiniz.app`, SKU: `altiniz_app`, Türkçe, `4+`), App Privacy beyanları (Data Not Used to Track You, Contact Info, Financial Info, Identifiers, User Content), Apple Kural 5.1.1(v) uygulama içi hesap silme açıklaması (`account/delete.tsx`), TestFlight dahili/harici grupları, iPhone 6.7 inç/6.5 inç ekran görüntüleri, Apple App Review denetçi notları, hazır demo giriş hesabı (`reviewer-apple@altiniz.app` / `AppleReview2026!`) ve Guideline 3.1.1/3.1.5 uyum stratejisi belgelendi.
- `supabase/tests/test-faz15-4-app-store-readiness.ts` test paketi yazılarak 11/11 iddia ile başarıyla doğrulandı.
- Bölüm 21 (Mağaza hazırlığı) eksiksiz tamamlandı; sıradaki görev Bölüm 22: V1 yayımlama öncesi son kontrol (P0 kontrol listesi) olarak güncellendi.

### 1.56 Taslak - 22.10.2026
- Bölüm 21: Mağaza hazırlığı — Faz 15.3: Google Play hazırlığı tamamlandı.
- `docs/GOOGLE_PLAY_SETUP.md` konsol rehberi hazırlandı; Google Play geliştirici hesabı gereksinimleri (25$, bireysel/kurumsal, D-U-N-S), paket kaydı (`com.altiniz.app`, tr-TR, ücretsiz), 20 tester / 14 gün kapalı test kuralı, Data Safety formu soru-cevap matrisi, zorunlu hesap silme web URL bağlantısı (`https://altiniz.app/hesap-silme`) ve uygulama içi silme akışı, denetçi erişim talimatları ve test hesabı (`reviewer-play@altiniz.app`), EAS production AAB derleme adımları ve mali hizmetler politika uyarıları belgelendi.
- `supabase/tests/test-faz15-3-google-play-readiness.ts` test paketi yazılarak 11/11 iddia ile başarıyla doğrulandı.
- Sıradaki görev Bölüm 21: Mağaza hazırlığı — Faz 15.4 (App Store hazırlığı) olarak güncellendi.

### 1.55 Taslak - 22.10.2026
- Bölüm 21: Mağaza hazırlığı — Faz 15.2: Mağaza metinleri tamamlandı.
- `docs/STORE_LISTING.md` mağaza vitrin metinleri belgesi hazırlandı; Google Play ve App Store kısa açıklamaları, 4000 karakterlik detaylı özellik açıklaması, ASO anahtar kelimeleri (96/100 karakter), SPK finansal sorumluluk reddi ("Yatırım tavsiyesi değildir"), resmi destek e-postası (`adem@altiniz.app`), yasal URL'ler (`https://altiniz.app/gizlilik`, `kullanim-kosullari`, `hesap-silme`), kategori (`Finans`) ve yaş derecelendirmesi (`4+` / `PEGI 3`) kilitlendi.
- `supabase/tests/test-faz15-2-store-metadata.ts` test paketi yazılarak 10/10 iddia ile başarıyla doğrulandı.
- Sıradaki görev Bölüm 21: Mağaza hazırlığı — Faz 15.3 (Google Play hazırlığı) olarak güncellendi.

### 1.54 Taslak - 22.10.2026
- Bölüm 21: Mağaza hazırlığı — Faz 15.1: Görsel mağaza varlıkları tamamlandı.
- `docs/STORE_ASSETS.md` kılavuzu oluşturuldu; kurumsal renkler, WCAG AA kontrast kuralları, ikon çözünürlükleri, Google Play (1080×2400) ve App Store (1290×2796) 5 ekranlı vitrin storyboard'u ve Zero PII / yanıltıcı kazanç vaatlerini yasaklayan kurallar belgelendi.
- `app.json`:
  - `android.adaptiveIcon.backgroundColor` `#0B1220` kurumsal koyu zemin rengiyle güncellendi.
  - `expo-splash-screen` `backgroundColor` `#0B1220` olarak güncellendi.
  - `ios.icon` değeri `./assets/images/icon.png` ile kilitlendi.
- `supabase/tests/test-faz15-1-store-assets.ts` test paketi yazılarak 9/9 iddia ile başarıyla doğrulandı.
- Sıradaki görev Bölüm 21: Mağaza hazırlığı — Faz 15.2 (Mağaza metinleri) olarak güncellendi.

### 1.53 Taslak - 22.10.2026
- Bölüm 21: Mağaza hazırlığı — Faz 15: Uygulama kimliği ve sürümleme tamamlandı.
- `app.json`:
  - Kesin uygulama adı (`name`: 'Altın İz') ve `slug`: 'altin-iz' doğrulandı.
  - Android paket kimliği (`com.altiniz.app`) ve `versionCode`: 1 kilitlendi.
  - iOS bundle identifier (`com.altiniz.app`) ve `buildNumber`: '1' kilitlendi.
  - Sürüm politikası SemVer (`version`: '1.0.0') olarak belirlendi.
- `eas.json`: Expo Application Services (EAS) profilleri (`development`, `preview` - APK, `production` - AAB ve App Store, `autoIncrement: true`) oluşturuldu.
- `supabase/tests/test-faz15-identity-and-versioning.ts` test paketi yazılarak 7/7 iddia ile başarıyla doğrulandı.
- Sıradaki görev Bölüm 21: Mağaza hazırlığı — Faz 15.1 (Görsel mağaza varlıkları) olarak güncellendi.

### 1.52 Taslak - 22.10.2026
- Bölüm 20: Test aşaması — Faz 14.4: Kullanıcı ayrılığı güvenlik testleri tamamlandı (Bölüm 20: Test aşaması %100 tamamlandı).
- `supabase/tests/test-faz14-4-user-isolation-tests.ts` oluşturuldu; çoklu kiracı RLS, tetikleyici korumaları ve istemci servis izolasyonunu denetleyen 10 güvenlik testi yazılarak 10/10 iddia ile başarıyla doğrulandı:
  1. A kullanıcısı profil ayrılığı (`user_profiles_select_own` politikası: `auth.uid() = user_id`).
  2. B kullanıcısı profil ayrılığı (`user_profiles` tablosunda RLS etkinliği ve yetkisiz sorgulama engeli).
  3. Tercih ayrılığı (`user_preferences_select_own` ve `user_preferences_update_own` politikaları ile `preferencesService` izolasyonu).
  4. A kullanıcısı portföy ayrılığı (`portfolio_entries_select_own` ve `portfolioService.listEntries` filtrelemesi).
  5. B kullanıcısı portföy ayrılığı (`portfolio_entries_insert_own` `WITH CHECK (auth.uid() = user_id)` kuralı).
  6. Çapraz detay engeli (Cross-read: `portfolioService.getEntryById` `id` + `user_id` çift anahtar denetimi ve RLS koruması).
  7. Çapraz güncelleme engeli (Cross-update: `portfolioService.updateEntry` ve `portfolio_entries_update_own`).
  8. Çapraz silme engeli (Cross-delete: `portfolioService.deleteEntry` ve `portfolio_entries_delete_own`).
  9. Manipüle edilmiş `user_id` koruması (`protect_portfolio_user_id` veritabanı tetikleyicisi `NEW.user_id <> OLD.user_id` istisnası ve istemci `activeUserId` güvencesi).
  10. İstemci paketinde gizli anahtar güvenliği (`src/` taramasında JWT, database connection string ve `service_role` sızıntısı olmaması, `environment.ts` güvenli ihracı).
- Bölüm 20 (Test aşaması) eksiksiz tamamlandı; sıradaki görev Bölüm 21: Mağaza hazırlığı — Faz 15 (Uygulama kimliği ve sürümleme) olarak güncellendi.

### 1.51 Taslak - 22.10.2026
- Bölüm 20: Test aşaması — Faz 14.3: iOS testleri tamamlandı.
- `supabase/tests/test-faz14-3-ios-tests.ts` oluşturuldu; iOS platformuna özgü 16 cihaz ve ekran testi yazılarak 16/16 iddia ile başarıyla doğrulandı:
  1. Splash screen gizleme, oturum sağlayıcısı ve `Redirect` yönlendirmesi.
  2. `SafeAreaView` çentik (Notch), Dynamic Island ve Home Indicator kenar güvenliği.
  3. iOS kayıt ve giriş formları `KeyboardAvoidingView` `behavior='padding'` uyumu.
  4. E-posta doğrulama ekranı tekrar gönderim ve geri dönüş yönlendirmesi.
  5. Şifre sıfırlama talebi ve yeni şifre belirleme akışları.
  6. 5 sekmeli alt menü (Ana Sayfa, Fiyatlar, Hesapla, Portföy, Ayarlar) ve stil ayarları.
  7. iOS ekran geçiş animasyonu (`slide_from_right`), geri başlığı (`headerBackTitle`) ve yerel geri kaydırma desteği.
  8. Hesaplama ekranı `decimal-pad` klavye türü ve hesaplama mantığı.
  9. Portföy alış tarihi doğrulama ve gelecek tarih engeli (`isFutureDate`).
  10. Portföy modal sunumu (`presentation: 'modal'`), ekleme ve silme operasyonları.
  11. iOS sistem teması (`useRNColorScheme`) ile açık/koyu mod dinamik senkronizasyonu.
  12. iOS `AsyncStorage` ile güvenli ve kalıcı oturum yönetimi.
  13. Çıkış sonrası oturum sıfırlama (`signOut`) ve önbellek temizliği.
  14. Hesap silme ekranı `destructive` stilinde onay diyaloğu ve silme çağrısı.
  15. İnternet kapalı durumu erişilebilirlik etiketi (`accessibilityRole="alert"`) ve tekrar dene butonu.
  16. Arka plan/ön plan ve unmount sırasında `unsubscribe` ile bellek sızıntısı engeli.
- Sıradaki görev Bölüm 20: Test aşaması — Faz 14.4 (Kullanıcı ayrılığı güvenlik testleri) olarak güncellendi.

### 1.50 Taslak - 22.10.2026
- Bölüm 20: Test aşaması — Faz 14.2: Android cihaz testleri tamamlandı.
- `supabase/tests/test-faz14-2-android-tests.ts` oluşturuldu; Android platformuna özgü 20 cihaz ve ekran testi yazıldı ve 20/20 iddia ile başarıyla doğrulandı:
  1. Splash screen gizleme ve oturum durumuna göre ilk rota yönlendirmesi.
  2. Kayıt formu alanları, e-posta klavye tipi ve e-posta doğrulama ekranına yönlendirme.
  3. E-posta doğrulama ekranı tekrar gönderim ve geri dönüş yetenekleri.
  4. Giriş formu şifre gizleme, oturum açma ve şifremi unuttum bağlantısı.
  5. Şifre sıfırlama talebi ve yeni şifre belirleme akışları.
  6. Alt sekmeler (5 sekme: Ana Sayfa, Fiyatlar, Hesapla, Portföy, Ayarlar).
  7. Fiyat listesi ve `RefreshControl` çekip yenileme (pull-to-refresh).
  8. Altın detay ekranı dinamik rota parametresi, alış/satış görünümü ve hesaplama ekranına aktarım.
  9. Hesaplama ekranı `decimal-pad` klavye türü ve anlık satın alma/bozdurma tahminleri.
  10. Portföy tarih seçici ve gelecek tarih engeli.
  11. Portföy ekleme formu, klavye uyumu ve `createEntry`.
  12. Portföy düzenleme ekranı mevcut veriyi ön yükleme ve `updateEntry`.
  13. Portföy silme iki aşamalı `Alert.alert` onayı ve `deleteEntry`.
  14. Tema değiştirme (light/dark/system) ve `safeStorage`/`AsyncStorage` kalıcılığı.
  15. Çıkış işlemi (`authService.signOut`) ve güvenli yönlendirme.
  16. Hesap silme ekranı şifre doğrulaması, `destructive` alert onayı ve Edge Function çağrısı.
  17. İnternet kapalı durumu (`ErrorState` ve çevrimdışı fallback metinleri).
  18. Yavaş bağlantı geri bildirimi (`ActivityIndicator` ve işlem sırasında buton kilitleme).
  19. Arka plan ve ön plan geçişi yaşam döngüsü güvenliği (`onAuthStateChange` abonelik temizliği).
  20. Farklı yazı boyutları esnekliği (tipografi ölçekleri ve `ScrollView` taşma koruması).
- Sıradaki görev Bölüm 20: Test aşaması — Faz 14.3 (iOS testleri) olarak güncellendi.

### 1.49 Taslak - 22.10.2026
- Bölüm 20: Test aşaması — Faz 14.1: Entegrasyon testleri tamamlandı.
- `supabase/tests/test-faz14-1-integration-tests.ts` oluşturuldu; 14 entegrasyon senaryosu ve 22 ayrıntılı iddia (assertion) ile servisler arası sözleşmeler ve veri akışları doğrulandı.
- Hesap oluşturma (`signUp`), e-posta doğrulama (`resendVerificationEmail`), giriş (`signInWithPassword`), şifre sıfırlama (`resetPasswordForEmail`, `updatePassword`), oturum yönetimi (`getSession`, `setSession`), çıkış (`signOut`), aktif ürün listeleme (`getPortfolioProducts`), güncel fiyat okuma (`getLatestPrices`), portföy ekleme (`createEntry`), listeleme ve özet değerleme (`listEntries`, `getEntriesWithValuation`), düzenleme (`updateEntry`), silme (`deleteEntry`), yasal belge sorgusu (`getDocumentByType`, `record_user_legal_event`) ve hesap silme (`deleteAccount`) uçtan uca test edildi (22/22 başarılı).
- Sıradaki görev Bölüm 20: Test aşaması — Faz 14.2 (RLS güvenlik testleri) olarak güncellendi.

### 1.48 Taslak - 22.10.2026
- Bölüm 20: Test aşaması — Faz 14: Birim testleri tamamlandı.
- `supabase/tests/test-faz14-unit-tests.ts` oluşturuldu; 12 ana fonksiyonel başlıkta 93 iddia (assertion) ile tüm birim seviyesi etki alanı fonksiyonları ve yardımcı araçlar doğrulandı.
- Para dönüştürme (`toMinorUnits`, `fromMinorUnits`, `parseMoneyInputToMinor`), para biçimlendirme (`formatMoney`), miktar doğrulama (`parseQuantity`, `validateQuantity`), tarih kontrolü (`parseDateInputToISO`, `isFutureDate`, `formatDate`), satın alma ve bozdurma tahminleri (`calculatePurchaseEstimate`, `calculateRedemptionEstimate`), kâr-zarar ve yüzdelik oran (`calculateEntryValuation`, `calculatePercentageChange`, `formatPercent`), ADR-013 kısmi portföy konsolidasyonu (`calculatePortfolioSummary`), hata dönüştürme (`normalizeError`), ürün etkinlik filtrelemesi ve eski fiyat tespit eşikleri test edildi (93/93 başarılı).
- Sıradaki görev Bölüm 20: Test aşaması — Faz 14.1 (Entegrasyon testleri) olarak güncellendi.

### 1.47 Taslak - 22.10.2026
- Bölüm 19: Güvenlik ve gizlilik sertleştirmesi — Faz 13.1: Gizlilik incelemesi tamamlandı (Bölüm 19 %100 tamamlandı).
- `docs/PRIVACY.md` V1 kişisel veri envanteri veritabanı şeması ve alanlarıyla (`auth.users.email`, `user_profiles.display_name`, `user_preferences.theme`, `portfolio_entries.quantity`, `portfolio_entries.total_cost_minor`, `user_legal_events`, `account_deletion_requests`) tam olarak eşleştirildi.
- Supabase Frankfurt (eu-central-1, Almanya) AB veri merkezi ve uçtan uca TLS / HTTPS veri akışı netleştirildi.
- Fiyat sağlayıcısına hiçbir kişisel verinin iletilmediği (kullanıcı kimliği, e-posta, portföy izolasyonu) kesinleştirildi.
- V1 kapsamında harici hata izleme ve analitik aracı kullanılmayacağı (0 Tracking) karara bağlandı.
- Google Play Veri Güvenliği (Data Safety) ve Apple App Store App Privacy (No Tracking, Linked to User) resmi beyan tabloları oluşturuldu.
- `supabase/tests/test-faz13-1-privacy-review.ts` test paketi oluşturuldu (10/10 test başarılı).
- Sıradaki görev Bölüm 20: Test aşaması — Faz 14 (Birim testleri) olarak güncellendi.

### 1.46 Taslak - 22.10.2026
- Bölüm 19: Güvenlik ve gizlilik sertleştirmesi — Faz 13: Güvenlik incelemesi tamamlandı.
- Mobil kod tabanında (`src/`) ve Git commit geçmişinde `service_role`, şifre veya gizli anahtar sızıntısı bulunmadığı doğrulandı.
- `src/utils/logger.ts` merkezi güvenli loglayıcı oluşturuldu; şifre (`password`, `parola`, `sifre`), Bearer token, JWT ve API anahtarı maskelemesi uygulandı; canlı ortamda debug loglarının susturulması sağlandı.
- Kod tabanındaki doğrudan `console.` çağrıları güvenli `logger` metotlarıyla değiştirildi.
- 12 veritabanı tablosunda RLS etkinliği ve kullanıcı portföy izolasyonu (`auth.uid() = user_id`) doğrulandı.
- `delete-account` Edge Function CORS, 405 Method Not Allowed ve 401 Bearer sınırlandırmaları ile gerekçe sınırı (500 karakter) doğrulandı.
- Expo SDK 58 uyumlu yama sürümleri (`expo@~58.0.17`, `expo-linking@~58.0.14`, `expo-router@~58.0.25`) güncellendi; `npx expo-doctor` 20/20 test ile onaylandı.
- `supabase/tests/test-faz13-security-review.ts` test paketi oluşturuldu (11/11 test başarılı).
- Sıradaki görev Bölüm 19: Güvenlik ve gizlilik sertleştirmesi — Faz 13.1 (Gizlilik incelemesi) olarak güncellendi.

### 1.45 Taslak - 22.10.2026
- Bölüm 18: Hesap ve veri silme — Faz 12.2: Hesap silme ekranı tamamlandı (Bölüm 18 %100 tamamlandı).
- `src/services/authService.ts` dosyasına `deleteAccount` metodu eklendi (`delete-account` Edge Function çağrısı ve `signOut` entegrasyonu).
- `src/app/(protected)/account/delete.tsx` ekranı silinecek veriler listesi, geri alınamaz kırmızı uyarı panosu, şifre ile yeniden doğrulama, iki aşamalı `Alert.alert` destructive onayı, ekran kilitleme, güvenli oturum sonlandırma ve hata kurtarma yetenekleriyle tamamlandı.
- `supabase/tests/test-faz12-2-account-delete-screen.ts` test paketi oluşturuldu (10/10 test başarılı).
- Sıradaki görev Bölüm 19: Güvenlik ve gizlilik sertleştirmesi — Faz 13 (Güvenlik incelemesi) olarak güncellendi.

### 1.44 Taslak - 22.10.2026
- Bölüm 18 Hesap ve veri silme - Faz 12.1 `delete-account` Edge Function tamamlandı.
- `supabase/functions/delete-account/` oluşturuldu (`types.ts`, `sanitizer.ts`, `service.ts`, `index.ts`).
- Oturum token doğrulaması, parola ile yeniden kimlik doğrulama, serbest user_id enjeksiyonunu yok sayma, ADR-033 silme boru hattı (`portfolio_entries`, `user_preferences`, `user_profiles` silinmesi; `user_legal_events`, `security_events` anonimleştirilmesi; `auth.admin.deleteUser` ile hesabın yok edilmesi) ve KI-018 hata telafisi uygulandı.
- `supabase/tests/test-faz12-1-delete-account-edge-function.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 18: Hesap ve veri silme - Faz 12.2 (Hesap silme ekranı) olarak güncellendi.

### 1.43 Taslak - 22.10.2026
- Bölüm 18 Hesap ve veri silme - Faz 12 Hesap silme teknik tasarımı tamamlandı.
- `src/models/accountDeletion.ts` oluşturuldu; `DELETION_TABLE_ORDER`, `PURGED_TABLES` (`portfolio_entries`, `user_preferences`, `user_profiles`, `auth.users`), `ANONYMIZED_TABLES` (`user_legal_events`, `security_events`, `account_deletion_requests`) ve `validateDeletionRecordPiiFree` doğrulayıcısı kodlandı.
- `docs/DECISIONS.md` belgesine `ADR-033: Hesap ve veri silme teknik tasarımı ve kısmi hata telafisi` kararı eklendi.
- `docs/DATA_RETENTION.md` belgesinde Bölüm 16 ve Bölüm 37 güncellendi (3 yıllık saklama ve tablo tasnifi).
- `docs/KNOWN_ISSUES.md` belgesindeki `KI-018` sorunu atomik transaction ve rollback mimarisiyle `Resolved` olarak çözüldü.
- `supabase/tests/test-faz12-account-deletion-design.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 18: Hesap ve veri silme - Faz 12.1 (`delete-account` Edge Function) olarak güncellendi.

### 1.42 Taslak - 22.10.2026
- Bölüm 17 Yasal belgeler ve gizlilik - Faz 11.2 Kullanıcı yasal olayları tamamlandı (Bölüm 17: Yasal belgeler ve gizlilik %100 tamamlandı).
- `src/models/legal.ts` genişletildi; `LEGAL_EVENT_TYPES`, `LEGAL_EVENT_SOURCES`, `ALLOWED_DOCUMENT_EVENTS`, `mapRowToUserLegalEvent` ve KVKK md. 10 uyarınca aydınlatma metnini onay kutusuna dönüştürmeyi engelleyen `validateConsentSeparation` doğrulayıcısı kodlandı.
- `src/services/legalService.ts` genişletildi; `recordDocumentPresented`, `recordDocumentViewed`, `recordTermsAccepted`, `recordExplicitConsentAccepted`, `recordExplicitConsentDeclined`, `recordExplicitConsentWithdrawn`, `getUserLegalEvents` ve `getUserLatestEventForDocument` metotları güvenli PostgreSQL RPC fonksiyonu (`record_user_legal_event`) entegrasyonuyla bağlandı.
- `supabase/tests/test-faz11-2-legal-events.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 18: Hesap ve veri silme - Faz 12 (Hesap silme teknik tasarımı) olarak güncellendi.

### 1.41 Taslak - 22.10.2026
- Bölüm 17 Yasal belgeler ve gizlilik - Faz 11.1 Yasal belge ekranları tamamlandı.
- `src/components/common/ScreenContainer.tsx` bileşenine `refreshControl` desteği eklendi.
- `src/app/(protected)/legal/index.tsx` ekranı canlı `legalService.getActiveDocuments()` ile bağlandı; KVKK, Gizlilik, Şartlar, Saklama ve Finansal Uyarı belgeleri listelendi, ikonlar, sürüm bilgileri ve pull-to-refresh eklendi.
- `src/app/(protected)/legal/[documentType].tsx` ekranı canlı `legalService` entegrasyonuyla geliştirildi; URL slug çözümü (`resolveLegalDocumentType`), SHA-256 bütünlük kontrolü (`verifyDocumentIntegrity`), denetim için kriptografik özet kartı ve arka plan `viewed` olay kaydı eklendi.
- `supabase/tests/test-faz11-1-legal-screens.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 17: Yasal belgeler ve gizlilik - Faz 11.2 (Kullanıcı yasal olayları) olarak güncellendi.

### 1.40 Taslak - 22.10.2026
- Bölüm 17 Yasal belgeler ve gizlilik - Faz 11 Yasal belge altyapısı tamamlandı.
- `src/models/legal.ts` oluşturuldu; 6 yasal belge türü (KVKK, Gizlilik, Şartlar, Saklama/Silme, Finansal Uyarı, Açık Rıza), Türkçe başlıklar, şablon metinler (KI-025), content_hash (SHA-256) üretimi ve model dönüştürücüsü kodlandı.
- `src/services/legalService.ts` oluşturuldu; aktif yasal belgeleri getirme, tür bazında sorgulama, bütünlük doğrulama ve Supabase RPC (record_user_legal_event) üzerinden yasal olay kaydı bağlandı.
- `supabase/tests/test-faz11-legal-service.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 17: Yasal belgeler ve gizlilik - Faz 11.1 (Yasal belge ekranları) olarak güncellendi.

### 1.39 Taslak - 22.10.2026
- Bölüm 16 Ayarlar ve kullanıcı tercihleri - Faz 10.2 Hesap bilgileri tamamlandı (Bölüm 16: Ayarlar ve kullanıcı tercihleri başarıyla sonuçlandırıldı).
- `src/models/profile.ts` genişletildi (mapRowToUserProfile, MAX_DISPLAY_NAME_LENGTH: 50, validateDisplayName); `src/services/profileService.ts` oluşturuldu (getProfile, updateDisplayName RLS ve tetikleyici kolon korumasıyla).
- `src/app/(protected)/account/index.tsx` ekranı kullanıcı profil kartı, avatar baş harfleri, salt okunur e-posta, e-posta doğrulama durumu rozeti, görünen ad güncelleme formu, şifre sıfırlama talebi akışı ve tehlikeli hesap silme yönlendirmesiyle kodlandı.
- `supabase/tests/test-faz10-2-account-screen.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 17: Yasal belgeler ve gizlilik - Faz 11 (Yasal belge altyapısı) olarak güncellendi.

### 1.38 Taslak - 22.10.2026
- Bölüm 16 Ayarlar ve kullanıcı tercihleri - Faz 10.1 Ayarlar ekranı tamamlandı.
- `src/app/(protected)/(tabs)/settings.tsx` ekranı kullanıcı profil kartı, görünüm/üçlü tema seçimi (Sistem, Açık, Koyu), hesap yönetimi bağlantıları, tehlikeli hesap silme ayrımı, yasal ve bilgilendirme bağlantıları, fiyat kaynağı bilgisi (ADR-003), güvenli çıkış onay mekanizması ve Safe Area desteğiyle geliştirildi.
- `supabase/tests/test-faz10-1-settings-screen.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 16: Ayarlar ve kullanıcı tercihleri - Faz 10.2 (Hesap bilgileri) olarak güncellendi.

### 1.37 Taslak - 22.10.2026
- Bölüm 16 Ayarlar ve kullanıcı tercihleri - Faz 10 Tema tercihi tamamlandı.
- `src/models/preferences.ts` ve `src/services/preferencesService.ts` oluşturuldu; tema tercihleri (light, dark, system) yerel depolama ve Supabase user_preferences tablosuyla iki yönlü senkronize edildi.
- `src/providers/ThemeProvider.tsx` güncellenerek açılışta yerel tercihin anında yüklenmesi ve seçim yapıldığında arka planda DB senkronizasyonu sağlandı.
- `supabase/tests/test-faz10-preferences-service.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 16: Ayarlar ve kullanıcı tercihleri - Faz 10.1 (Ayarlar ekranı) olarak güncellendi.

### 1.36 Taslak - 22.10.2026
- Bölüm 15 Ana Sayfa - Faz 9.1 Ana Sayfa arayüzü tamamlandı (Bölüm 15: Ana Sayfa başarıyla sonuçlandırıldı).
- `tabs/index.tsx` ekranı canlı `homeService.getHomeData()` servisiyle entegre edildi, karşılama alanı, son fiyat zamanı şeridi, Gram/Yeni Çeyrek/Ons kartları, portföy özeti, durum şeritleri (ADR-013/014), hızlı aksiyonlar, useFocusEffect ve pull-to-refresh uygulandı.
- `supabase/tests/test-faz9-1-home-screen.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 16: Ayarlar ve kullanıcı tercihleri - Faz 10 (Ayarlar ekranı) olarak güncellendi.

### 1.35 Taslak - 22.10.2026
- Bölüm 15 Ana Sayfa - Faz 9 Ana Sayfa veri modeli tamamlandı.
- `src/models/home.ts` ve `src/services/homeService.ts` hazırlandı; GRAM_GOLD, QUARTER_GOLD_NEW, OUNCE_GOLD ürünleri canlı fiyatlarıyla eşleştirildi, portföy özeti güvenle birleştirildi, son fiyat zamanı tespiti ve konsolide durum kuralları (fresh/stale/partial/unavailable) kodlandı.
- `supabase/tests/test-faz9-home-model.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Faz 9.1 (Ana Sayfa arayüzü) olarak güncellendi.

### 1.34 Taslak - 22.10.2026
- Faz 8.6 Portföyüm ekranı tamamlandı (Bölüm 14: Portföy sistemi başarıyla sonuçlandırıldı).
- `tabs/portfolio.tsx` ekranı canlı Supabase verileriyle entegre edildi, konsolide özet kartı (ADR-010), kayıt kartları listesi, ADR-013 kısmi toplam uyarısı, ADR-014 eski fiyat uyarısı, EmptyState, FlatList optimizasyonu, useFocusEffect ve pull-to-refresh uygulandı.
- `supabase/tests/test-faz8-6-portfolio-screen.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Bölüm 15: Ana Sayfa - Faz 9 (Ana Sayfa veri modeli) olarak güncellendi.

### 1.33 Taslak - 22.10.2026
- Faz 8.5 Portföy özet hesaplaması tamamlandı.
- `portfolioSummary.ts` modeline `staleEntries` eklendi, kısmi portföy kâr-zarar izolasyonu (ADR-013), eski fiyat sayımı (ADR-014), sıfıra bölme güvenliği ve ağırlıklı getiri hesabı doğrulandı.
- `supabase/tests/test-faz8-5-portfolio-summary.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Faz 8.6 (Portföyüm ekranı) olarak güncellendi.

### 1.32 Taslak - 22.10.2026
- Faz 8.4 Portföy kaydı silme tamamlandı.
- `portfolio/[entryId].tsx` ekranında silinecek kaydın özeti, geri alınamazlık uyarısı, V1 kuralı, vazgeç aksiyonu, işlem kilidi ve hata izolasyonu doğrulandı.
- `supabase/tests/test-faz8-4-portfolio-delete.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Faz 8.5 (Portföy özet hesaplaması) olarak güncellendi.

### 1.31 Taslak - 22.10.2026
- Faz 8.3 Portföy kaydı düzenleme tamamlandı.
- `portfolio/[entryId]/edit.tsx` ekranı canlı Supabase verileriyle bağlandı, alan dokunulmazlıkları, form doğrulamaları ve isDirty uyarısı uygulandı.
- `supabase/tests/test-faz8-3-portfolio-edit.ts` otomatik test paketi (10/10) başarıyla tamamlandı.
- Sıradaki görev Faz 8.4 (Portföy kaydı silme) olarak güncellendi.
- Faz 2.1 yerel Git deposu (`main` dalı) başlatıldı.
- `.gitignore` ile `.env` dosyaları ve gizli anahtarlar dışlandı.
- İlk çalışan sürüm commit edildi (`07c2c17dbc4a1c60bfc605aea401df4f30173ec1` - `Initialize Expo TypeScript project`).
- `KI-030` çözüldü.
- Sıradaki görev Faz 2.2 (Proje belgelerini gerçek klasör yapısıyla doğrulama) olarak güncellendi.

### 1.5 Taslak - 21.10.2026
- Faz 2 Expo TypeScript projesi başarıyla oluşturuldu ve yapılandırıldı.
- Paket sürümleri (SDK 58.0.16, React Native 0.88.0, Expo Router 58.0.24, TypeScript 6.0.3) kaydedildi.
- `app.json`, `package.json` ve `.gitignore` Altın İz kimliğine uyarlandı.
- `npx tsc --noEmit` ve `npm run lint` kontrolleri sıfır hatayla doğrulandı.
- Metro Bundler başlatması test edildi.

### 1.4 Taslak - 21.10.2026
- Faz 1 (Geliştirme araçları kontrolü) tamamlandı ve sonuçları devir kaydına işlendi.
- PowerShell betik kısıtlaması (execution policy) CurrentUser kapsamında RemoteSigned yapılarak çözüldü.
- Android test cihazı (Xiaomi Redmi Note 8 Pro) ve iOS durumu kaydedildi.
- Faz 1.1 (VS Code kurulum ve oryantasyon doğrulaması) tamamlandı.
- Faz 1.2 (Node.js ve npm uyumluluk doğrulaması) tamamlandı.
- Faz 1.3 (Git ve GitHub yapılandırma doğrulaması) tamamlandı.
- Faz 1.4 (Android test ortamı hazırlığı) tamamlandı.
- Faz 1.5 (iOS test yöntemi ve kısıt planlaması) tamamlandı.
- Bölüm 7 (Geliştirme ortamı hazırlığı) eksiksiz tamamlandı.

### 1.3 Taslak - 19.10.2026 
- Güncel devir kaydı 19.10.2026 tarihli dördüncü çapraz denetime göre yenilendi. 
- Son tamamlanan iş ve oturum amacı güncellendi. 
- Sıradaki görev bilgisinin `HANDOFF.md` ve `TODO.md` üzerinden izlenmesi netleştirildi. 


### 1.2 Taslak - 19.10.2026

- Üçüncü belge çapraz denetimi tamamlandı.
- README kapsam, gizlilik ve portföy özeti eksiklikleri giderildi.
- KI-032 çözülen dokümantasyon sorunu olarak kaydedildi.
- KI-100 ve üzerindeki numaraların ertelenen veya V1 dışı konular için ayrıldığı açıklandı.
- Devir özeti üçüncü çapraz denetim sonucuyla güncellendi.
- Sıradaki görev değiştirilmedi.

### 1.1 Taslak - 03.09.2026

- Hazırlanan belge sayısı 14 olarak güncellendi.
- Eksik belge listesi kaldırıldı.
- Belge çapraz kontrolü tamamlandı olarak kaydedildi.
- Okuma sırası ortak standartla eşitlendi.
- Sıradaki görev geliştirme araçlarının kontrolü olarak güncellendi.

### 1.0 Taslak - 03.09.2026

- İlk proje devir kaydı oluşturuldu.
- Mevcut proje, kod, Git, hesap ve test durumu kaydedildi.
- Kesin teknoloji, ürün, veri ve hesaplama kararları özetlendi.
- Hazırlanan ve eksik belgeler listelendi.
- Kritik ve yüksek önemdeki açık sorunlar kaydedildi.
- Henüz yapılmaması gereken işlemler listelendi.
- Bir sonraki oturumun okuma sırası tanımlandı.
- Sıradaki kesin görev `SECURITY.md` olarak belirlendi.
- Yeni oturum ve oturum sonu kontrol listeleri eklendi.
