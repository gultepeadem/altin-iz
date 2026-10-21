# Altın İz Değişiklik Günlüğü

**Belge adı:** `CHANGELOG.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.3 Taslak  
**Son güncelleme:** 19.10.2026  
**Proje aşaması:** Planlama ve dokümantasyon  
**Uygulama sürümü:** Henüz oluşturulmadı

---

## 1. Belgenin amacı

Bu dosya, Altın İz projesinde yapılan önemli değişiklikleri tarih ve sürüm sırasıyla kaydeder.

Şunları takip eder:

- Yeni eklenen özellikler
- Değiştirilen davranışlar
- Düzeltilen hatalar
- Güvenlik değişiklikleri
- Veritabanı değişiklikleri
- API değişiklikleri
- Mimari değişiklikler
- Belge değişiklikleri
- V1 kapsamına eklenen veya kapsamdan çıkarılan işler
- Bilinen sorunların çözülmesi
- Android ve iOS uyumluluğunu etkileyen değişiklikler

Bu belge yapılacak işleri değil, gerçekleşmiş değişiklikleri kaydeder. Gelecekte yapılacak işler `TODO.md`, açık sorunlar `KNOWN_ISSUES.md`, kararların gerekçeleri ise `DECISIONS.md` içinde tutulur.

---

## 2. Kullanılacak biçim

Değişiklikler en yeni kayıt üstte olacak şekilde yazılır.

Ana başlık biçimi:

```markdown
## [Sürüm] - GG.AA.YYYY
```
Sürüm henüz yayımlanmamışsa:

```markdown
## [Unreleased]
```

---

# Değişiklik Kayıtları

## [Unreleased]

- Henüz yayımlanmamış yeni uygulama değişikliği bulunmuyor.

---

## [0.0.0-planning.6] - 21.10.2026

### Added

- Bilgisayardaki mevcut geliştirme araçlarının kontrol raporu oluşturuldu (TODO.md Faz 1).
- Android test cihazı belirlendi: Xiaomi Redmi Note 8 Pro, MIUI Global 12.5.8.
- iOS test imkânının şu anda bulunmadığı kaydedildi.
- Faz 1.1 Visual Studio Code ortamı doğrulandı (Sürüm 1.142.0, Copilot/Agent aktif, İngilizce arayüz tercihi teyit edildi).
- Faz 1.2 Node.js (v24.18.0) ve npm (11.16.0) uyumluluğu Expo SDK asgari sürüm gereksinimleriyle karşılaştırılarak doğrulandı.
- Faz 1.3 Git (2.55.0) ve GitHub yapılandırması doğrulandı; kullanıcı adı (`Adem Gultepe`), e-posta (`gultepeeadem02@gmail.com`), VS Code güvenli bağlantı yaklaşımı ve `.env` dışlama kuralları teyit edildi.
- Faz 1.4 Android test ortamı (Xiaomi Redmi Note 8 Pro / Android 11) için Expo Go uyumluluğu, Wi-Fi ve Tünel bağlantı yöntemleri, başarı kriterleri belirlendi; Android Studio kurulumunun bu aşamada gereksiz olduğu teyit edildi.
- Faz 1.5 iOS test yöntemi ve kısıt planlaması tamamlandı; Windows kısıtları belgelendi, geliştirme süresince Expo Go + EAS Build stratejisi benimsendi, Apple Developer hesabının mağaza aşamasına (Faz 15) ertelenmesi teyit edildi. Geliştirme ortamı hazırlıkları (Faz 1 serisi) eksiksiz tamamlandı.
- Faz 2 Expo TypeScript projesi oluşturuldu; Expo SDK (58.0.16), React Native (0.88.0), React (19.3.0), TypeScript (6.0.3), Expo Router (58.0.24) sürümleri kaydedildi. Proje yapılandırması (app.json, package.json, .gitignore) Altın İz kimliğine uyarlandı. `npx tsc --noEmit` ve `npm run lint` testleri sıfır hatayla geçti. Metro Bundler başlatması doğrulandı.
- Faz 2.1 yerel Git deposu başlatıldı (`main` dalı); `.gitignore` kuralları ve gizlilik denetimleri doğrulanarak ilk çalışan sürüm commit edildi (`07c2c17` - `Initialize Expo TypeScript project`). KI-030 çözüldü.

### Fixed

- PowerShell betik politikası sorunu çözüldü: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` uygulandı.
- npm ve npx komutları artık PowerShell üzerinden çalışıyor.

### Tespit edilen mevcut araçlar

```text
İşletim sistemi: Windows 11 Pro (Build 26200, x64)
Boş disk alanı: 109,7 GB
Visual Studio Code: 1.142.0
Node.js: v24.18.0
npm: 11.16.0
Git: 2.55.0
Git kullanıcı adı: Adem Gultepe
Git e-posta: gultepeeadem02@gmail.com
GitHub hesabı: Var
Expo hesabı: Var
Supabase hesabı: Var
Android test cihazı: Xiaomi Redmi Note 8 Pro (MIUI Global 12.5.8)
iOS test imkânı: Şu anda yok
```

---

## [0.0.0-planning.5] - 19.10.2026

### Changed

- `HANDOFF.md` güncel oturum, son tamamlanan iş ve belge sürümüyle eşitlendi.
- `README.md` içindeki V1 kapsam dışı özellikler gerçek Markdown listesine dönüştürüldü.
- `README.md` içindeki yanlışlıkla açılmış `markdown` kod bloğu kaldırıldı.
- `README.md` sürüm geçmişine eksik 1.1 kaydı eklendi.
- Sıradaki görev kaynağı `HANDOFF.md` ve ayrıntılı adımlar için `TODO.md` olarak merkezileştirildi.
- `TODO.md` içindeki erken ve yinelenen Faz 1 başlığı kaldırıldı.
- Faz 0.2-0.4 araştırmalarının paralel yürütülebileceği açıklandı.
- `copilot-instructions.md` içindeki yinelenen `Kullanıcı:` satırı kaldırıldı.
- `DATABASE.md` (1.2), `SECURITY.md` (1.1), `ARCHITECTURE.md` (0.2) ve `API.md` (0.2) içinde `user_legal_events` tablosuna doğrudan istemci `INSERT` işlemi kapatılarak yalnızca güvenli RPC veya `record-legal-event` Edge Function üzerinden append-only kayıt oluşturulması kararlaştırıldı.
- `user_preferences` güncelleme yetkisi yalnızca `theme` alanıyla sınırlandırıldı ve `price_sources` tablosu erişim matrisine eklendi.
- Çapraz denetlenen belgelerin üst bilgi tarihleri 19.10.2026 olarak eşitlendi.

### Fixed

- Markdown liste görünümü ve bozuk kod blokları düzeltildi.
- `README.md` ve `TODO.md` sürüm zincirleri tamamlandı.
- Görev sırası ve denetim kayıtları tüm belgelerde netleştirildi.
- Yinelenen başlık, ekran numarası ve satır sorunları giderildi.

---

## [0.0.0-planning.4] - 19.10.2026

### Added

- `KNOWN_ISSUES.md` içine üçüncü belge çapraz denetim sonucu `KI-032` olarak eklendi.
- `KNOWN_ISSUES.md` içine KI-100 ve üzerindeki kayıtların ertelenen veya V1 kapsamı dışında bırakılan konular için ayrıldığına ilişkin numaralandırma kuralı eklendi.
- `README.md` V1 kapsam dışı özellikler listesine altın haberleri ve yapay zekâ fiyat tahmini eklendi.
- `README.md` toplanmayacak veriler listesine açık adres eklendi.
- `README.md` portföy özelliklerine isteğe bağlı işçilik dâhil bilgisi eklendi.

### Changed

- `README.md` içinde V1 kapsamı için `PROJECT_CONTEXT.md` ve `DECISIONS.md` içindeki ADR-022 bağlayıcı kaynak olarak belirtildi.
- İşçilik dâhil bilgisinin yalnızca açıklayıcı olduğu ve hesaplamaya otomatik katılmadığı açıklandı.
- `TODO.md` üçüncü çapraz denetim görevleriyle güncellendi.
- `HANDOFF.md` son belge değişiklikleri ve çapraz denetim durumuyla eşitlendi.
- `KNOWN_ISSUES.md` sorun özeti KI-032 ile güncellendi.

### Fixed

- `README.md`, `PROJECT_CONTEXT.md`, `DECISIONS.md`, `PRIVACY.md`, `DATABASE.md`, `API.md` ve `copilot-instructions.md` arasındaki kapsam, gizlilik ve portföy özeti farklılıkları giderildi.
- Ertelenen sorun kayıtlarında kullanılan KI-100 numaralandırmasının açıklanmaması giderildi.

### Security

- Toplanmayacak veriler özetine açık adres eklenerek gizlilik envanteri belgeler arasında eşitlendi.
- Yeni secret, anahtar, gerçek kullanıcı verisi veya hassas bilgi eklenmedi.

---

## [0.0.0-planning.3] - 03.09.2026

### Added

- 14 başlangıç proje belgesinin tamamı oluşturuldu.
- `SECURITY.md`, `PRIVACY.md`, `DATA_RETENTION.md`, `.github/copilot-instructions.md` ve `README.md` belge setine eklendi.
- `DECISIONS.md` içine sıfır maliyetli geliştirme stratejisi (`ADR-031`) eklendi ve ortam kuralları güncellendi.

### Changed

- Başlangıç dokümantasyon aşaması tamamlandı.
- Belge okuma sırası ortak standartla eşitlendi.
- Sıradaki görev bilgisayardaki mevcut geliştirme araçlarının kontrolü olarak güncellendi.
- `API.md` ve `DATABASE.md` üst bilgilerindeki eski backend ifadeleri düzeltildi.

### Fixed

- `PROJECT_CONTEXT.md`, `TODO.md` ve `HANDOFF.md` içindeki eski belge sayıları, tamamlanma durumları ve görev bilgileri düzeltildi.
- `PROJECT_CONTEXT.md` içindeki bozuk tekil rakam satırları kaldırıldı.
- `KNOWN_ISSUES.md` içindeki KI-027, KI-028, KI-029 ve KI-031 çözüldü olarak güncellendi.
- Planlama sürümleri en yeni kayıt üstte olacak biçimde sıralandı.
- `DATABASE.md` içinde `user_legal_events`, `account_deletion_requests` ve `security_events` tablolarındaki `user_id` alanı hesap silme ve anonimleştirme uyumu için `nullable (ON DELETE SET NULL)` yapıldı; `gold_prices` tablosuna `is_provider_stale` alanı eklendi; ürün kodları eski/yeni ayrımına göre standartlaştırıldı.
- `ARCHITECTURE.md` içinde `account-status.tsx` rotası tanımlandı ve `reset-password.tsx` için `PASSWORD_RECOVERY` oturum istisnası eklendi.
- `DATABASE.md`, `SECURITY.md` ve `TODO.md` içinde `user_profiles` ve `user_preferences` için eksik `INSERT` RLS kuralları eşitlendi.

### Testing

- Uygulama kodu olmadığı için çalıştırılabilir uygulama testi yapılmadı.
- 14 belge üzerinde başlık, durum, görev, teknoloji, tablo, rota, hesaplama, güvenlik ve gizlilik tutarlılığı kontrol edildi.

---

## [0.0.0-planning.2] - 03.09.2026

Bu kayıt, ilk veritabanı tasarımına sonradan eklenen sağlayıcı ürün eşleştirme yapısını temsil eder.

### Added

- `price_source_product_mappings` tablosu veritabanı tasarımına eklendi.
- Dış sağlayıcı sembolü ile merkezi Altın İz ürünü arasındaki ilişki tanımlandı.
- `external_symbol`, `external_name` ve `external_category` alanları eklendi.
- Eşleştirmeyi fiziksel olarak silmeden devre dışı bırakmak için `is_active` alanı tanımlandı.
- Eşleştirme tablosunun erişim, doğrulama ve indeks kuralları eklendi.

### Changed

- `DATABASE.md` belge sürümü 1.0'dan 1.1'e yükseltildi.
- Toplam veri modeli `auth.users` dahil 13 tabloyu, başka bir ifadeyle 1 Supabase Auth tablosu ve 12 uygulama tablosunu içerecek şekilde güncellendi.
- Tablo ilişki şeması `gold_products` ve `price_sources` bağlantılarını içerecek şekilde güncellendi.
- Veritabanı güvenlik kontrol listesi yeni eşleştirme tablosunu kapsayacak şekilde güncellendi.
- `updated_at` otomasyonu listesine yeni tablo eklendi.

### Database

- `(source_id, external_symbol)` benzersizlik kuralı tanımlandı.
- `(source_id, product_id)` benzersizlik kuralı tanımlandı.
- Bilinmeyen dış sembolün otomatik olarak yeni ürün oluşturmaması kuralı eklendi.
- Eski ve yeni tarihli ürünlerin ayrı merkezi ürünlere bağlanması kuralı eklendi.
- Cumhuriyet Altını ile Ata Altınının tahminle eşleştirilmemesi kuralı eklendi.
- Normal kullanıcıların eşleştirme tablosunu değiştirememesi kararlaştırıldı.

### API

- `API.md` içinde fiyat sağlayıcısı ürün eşleştirme modeli tanımlandı.
- Fiyat çekme akışına dış sembol doğrulaması ve merkezi ürün eşleştirmesi eklendi.
- Bilinmeyen sembollerin reddedilmiş ürün olarak işlenmesi tanımlandı.

### Docs

- `DATABASE.md` sürüm geçmişine 1.1 kaydı eklendi.
- `DECISIONS.md` içinde ürün kataloğu ve sağlayıcı eşleştirmesi kararı ADR-015 olarak kaydedildi.
- `PROJECT_CONTEXT.md`, yeni tabloyu temel veritabanı tabloları arasında gösterecek şekilde hazırlandı.
- `ARCHITECTURE.md`, sembol eşleştirme veri akışını içerecek şekilde hazırlandı.
- `TODO.md`, eşleştirme tablosunun migration, seed, RLS ve test görevlerini içerecek şekilde hazırlandı.

---


## [0.0.0-planning.1] - 03.09.2026

Bu kayıt uygulama yayını değildir. İlk ürün, mimari ve dokümantasyon planlama çalışmasını temsil eder.

### Added

#### Proje ve kapsam

- Altın fiyatlarını ve kişisel altın portföyünü takip eden mobil uygulama fikri tanımlandı.
- Uygulamanın çalışma adı `Altın İz` olarak belirlendi.
- `Altınlarını Kaydet, Değerini İzle` sloganı belirlendi.
- Android ve iOS desteği zorunlu gereksinim olarak kaydedildi.
- V1 kapsamı ve V1 dışında bırakılacak özellikler tanımlandı.
- Ana alt menü `Ana Sayfa`, `Fiyatlar`, `Hesapla`, `Portföyüm` ve `Ayarlar` olarak belirlendi.

#### Teknoloji ve mimari

- React Native, Expo, TypeScript ve Expo Router çalışma teknolojileri olarak seçildi.
- Backend için Supabase seçildi.
- Veritabanı için PostgreSQL seçildi.
- Kullanıcı hesapları için Supabase Auth seçildi.
- Kullanıcı veri ayrılığı için Row Level Security zorunlu kılındı.
- Mobil uygulama, uygulama katmanı, etki alanı ve veri katmanı yaklaşımı tanımlandı.
- Public, protected ve tabs Expo Router grupları tasarlandı.
- Auth, profil, tercih, ürün, fiyat, portföy, yasal belge ve hesap servislerinin sorumlulukları belirlendi.
- `fetch-gold-prices` ve `delete-account` Edge Function adayları tanımlandı.

#### Hesaplama ve iş kuralları

- Portföy değerlemesinde güncel alış fiyatının kullanılmasına karar verildi.
- Satın alma hesabında satış fiyatının kullanılmasına karar verildi.
- Bozdurma hesabında alış fiyatının kullanılmasına karar verildi.
- Kullanıcının gerçek maliyetinin girdiği toplam ödenen tutar olmasına karar verildi.
- Kâr-zarar ve değişim yüzdesi formülleri tanımlandı.
- Para tutarlarının kuruş cinsinden tam sayı olarak saklanmasına karar verildi.
- Gram miktarlarında azami üç ondalık basamak kabul edilmesine karar verildi.
- Adetli ürünlerde yalnızca pozitif tam sayı kabul edilmesine karar verildi.
- Her altın alışının ayrı portföy kaydı olmasına karar verildi.
- Fiyat bulunamayan ürünün `0 TL` kabul edilmemesine karar verildi.
- Eksik fiyat bulunan portföyde kısmi toplam davranışı tanımlandı.
- Eski fiyatların güncel fiyat gibi gösterilmemesi kararlaştırıldı.

#### Fiyat verisi

- Birincil fiyat sağlayıcısı adayı olarak AltinAPI belirlendi.
- Yedek sağlayıcı adayı olarak Altinapps belirlendi.
- V1'de dış fiyat entegrasyonu için REST yaklaşımı seçildi.
- WebSocket entegrasyonu V1 kapsamı dışında bırakıldı.
- Dış fiyat API anahtarının mobil uygulamada tutulmamasına karar verildi.
- Fiyatların güvenli sunucu işlemiyle alınması ve doğrulandıktan sonra PostgreSQL'e yazılması kararlaştırıldı.
- Eski ve yeni tarihli sarrafiye ürünlerinin sağlayıcı ayrı fiyat veriyorsa ayrı ürün olarak tutulması kararlaştırıldı.
- Cumhuriyet Altını ile Ata Altınının isim benzerliğiyle otomatik eşleştirilmemesi kararlaştırıldı.
- Doğrudan fiyatı doğrulanmayan ürünlerin fiyat, hesaplama ve portföy işlemlerinde devre dışı kalması kararlaştırıldı.

#### Veritabanı

- `auth.users` kimlik doğrulama kaynağı olarak kabul edildi.
- `user_profiles` tablosu tasarlandı.
- `user_preferences` tablosu tasarlandı.
- `gold_products` tablosu tasarlandı.
- `price_sources` tablosu tasarlandı.
- `gold_prices` tablosu tasarlandı.
- `price_fetch_runs` tablosu tasarlandı.
- `portfolio_entries` tablosu tasarlandı.
- `legal_documents` tablosu tasarlandı.
- `user_legal_events` tablosu tasarlandı.
- `account_deletion_requests` tablosu tasarlandı.
- `security_events` tablosu tasarlandı.
- Tablo ilişkileri, veri türleri, indeksler ve temel doğrulamalar tanımlandı.

#### Güvenlik ve gizlilik

- Kullanıcı kimliğinin güvenli oturumdan alınması kararlaştırıldı.
- Mobil uygulamanın gönderdiği serbest `user_id` değerine güvenilmemesi kararlaştırıldı.
- Secret, service role, veritabanı şifresi ve dış API anahtarının mobil uygulamaya eklenmemesi kararlaştırıldı.
- Hesap silme işleminin güvenli sunucu fonksiyonuyla yürütülmesi kararlaştırıldı.
- Aydınlatma metni ile açık rızanın ayrı yönetilmesi kararlaştırıldı.
- Veri minimizasyonu temel gizlilik ilkesi olarak kabul edildi.
- Yayımlama öncesi hukuk uzmanı kontrolü zorunlu iş olarak eklendi.

### Database

- `DATABASE.md` sürüm 1.0 oluşturuldu.
- Para alanlarının `_minor` ekiyle `BIGINT` olarak tutulması belgelendi.
- Miktar alanının `NUMERIC(18,3)` olması belgelendi.
- Güncel değer ve kâr-zarar sonuçlarının portföy ana tablosunda kalıcı gerçek veri olarak saklanmaması belgelendi.

### API

- Supabase Auth, Data API ve güvenli sunucu fonksiyonlarını kapsayan `API.md` sürüm 0.1 taslağı oluşturuldu.
- Ortam ayrımı Development, Preview ve Production olarak tanımlandı.
- Ortak API hata modeli ve Türkçe kullanıcı mesajları tanımlandı.
- Fiyat çekme, doğrulama, kota ve tekrar deneme yaklaşımı tanımlandı.
- Portföy CRUD, hesaplama, yasal belge ve hesap silme API modelleri tanımlandı.

### Docs

- `PROJECT_CONTEXT.md` sürüm 1.0 oluşturuldu.
- `ARCHITECTURE.md` sürüm 0.1 taslağı oluşturuldu.
- `DATABASE.md` sürüm 1.0 oluşturuldu.
- `API.md` sürüm 0.1 taslağı oluşturuldu.
- `DECISIONS.md` sürüm 1.0 oluşturuldu ve 30 ADR kaydı eklendi.
- `TODO.md` sürüm 1.0 taslağı oluşturuldu.
- Planlamadan mağaza yayınına kadar görev fazları oluşturuldu.

### Security

- RLS güvenlik yaklaşımı proje kararı olarak kaydedildi.
- Kullanıcı A ve Kullanıcı B ayrılığı için zorunlu güvenlik testleri tanımlandı.
- Normal kullanıcıların fiyat, ürün ve yönetim tablolarına yazamaması kuralı eklendi.
- Gizli anahtarların Git deposuna ve mobil uygulama paketine girmemesi kuralı eklendi.

### Platform

- Android fiziksel cihaz testi zorunlu kılındı.
- iOS için gerçek cihaz veya geçerli TestFlight test süreci zorunlu kılındı.
- Safe area, klavye, derin bağlantı, secure storage, geri hareketi ve tema davranışı platform kontrol listesine eklendi.

### Testing

- Para, miktar, kâr-zarar, yüzde ve kısmi toplam için birim test ihtiyaçları tanımlandı.
- Auth, portföy, fiyat ve hesap silme için entegrasyon test ihtiyaçları tanımlandı.
- RLS için iki kullanıcılı güvenlik test planı oluşturuldu.
- Android ve iOS manuel cihaz test listeleri oluşturuldu.

---

# Gelecek sürüm kayıt şablonu

Aşağıdaki şablon yeni sürüm veya önemli çalışma grubu eklenirken kullanılabilir:

```markdown
## [Unreleased]

### Added

- Yeni eklenen özellik.

### Changed

- Değiştirilen davranış.

### Fixed

- Düzeltilen hata.

### Security

- Güvenlik iyileştirmesi.

### Database

- Etkilenen migration, tablo veya politika.

### API

- Değişen API sözleşmesi.

### Testing

- Eklenen veya tamamlanan testler.

### Platform

- Android veya iOS özel değişikliği.

### Docs

- Güncellenen proje belgeleri.
```

---

## 6. Değişiklik günlüğü ile diğer belgelerin ilişkisi

### `TODO.md`

Gelecekte yapılacak işleri içerir. Görev tamamlandığında sonucu buraya taşınır.

### `DECISIONS.md`

Bir değişikliğin neden yapıldığını açıklar. Bu dosya değişikliğin ne olduğunu kaydeder.

### `KNOWN_ISSUES.md`

Henüz çözülmemiş sorunları içerir. Sorun çözüldüğünde `Fixed` bölümüne kayıt eklenir.

### `HANDOFF.md`

Son oturumun durumu, son çalışan commit ve sıradaki kesin adımı içerir.

### `DATABASE.md`

Veritabanının güncel hedef durumunu tanımlar. Bu dosya veritabanının hangi sürümde nasıl değiştiğini kaydeder.

### `API.md`

API'nin güncel hedef sözleşmesini tanımlar. Bu dosya sözleşmedeki değişikliklerin tarihçesini kaydeder.

---

## 7. Yayımlama kaydı kontrol listesi

Yeni uygulama sürümü yayımlanmadan önce:

- [ ] `Unreleased` bölümündeki kayıtlar gözden geçirildi.
- [ ] Yalnızca gerçekleşmiş değişiklikler bırakıldı.
- [ ] Sürüm numarası belirlendi.
- [ ] Yayın tarihi eklendi.
- [ ] Geriye uyumsuz değişiklikler işaretlendi.
- [ ] Veritabanı migrationları belirtildi.
- [ ] Güvenlik değişiklikleri belirtildi.
- [ ] Android ve iOS etkileri belirtildi.
- [ ] Test sonuçları belirtildi.
- [ ] Git etiketi oluşturuldu.
- [ ] EAS build kimlikleri kaydedildi.
- [ ] Google Play versionCode kaydedildi.
- [ ] iOS buildNumber kaydedildi.
- [ ] `PROJECT_CONTEXT.md` güncellendi.
- [ ] `TODO.md` güncellendi.
- [ ] `HANDOFF.md` güncellendi.

---

## 8. Bilinen mevcut sınırlar

- Expo projesi henüz oluşturulmadı.
- Git deposu henüz oluşturulmadı.
- Gerçek commit kimliği bulunmuyor.
- Supabase projesi henüz oluşturulmadı.
- Veritabanı migrationları henüz yazılmadı.
- Gerçek fiyat API hesabı henüz oluşturulmadı.
- Gerçek uygulama sürümü ve build numarası bulunmuyor.
- Android veya iOS uygulama testi henüz yapılmadı.

Bu nedenle mevcut kayıtlar planlama ve belge değişikliklerini temsil eder, çalışan uygulama sürümü iddiası taşımaz.

---

## 9. Belge güncelleme kuralı

Bu belge aşağıdaki durumlarda güncellenmelidir:

- Yeni özellik tamamlandığında
- Mevcut özellik değiştirildiğinde
- Hata düzeltildiğinde
- Güvenlik iyileştirmesi yapıldığında
- Veritabanı migrationı eklendiğinde
- RLS politikası değiştiğinde
- API sözleşmesi değiştiğinde
- Bağımlılık eklendiğinde, kaldırıldığında veya önemli sürüm yükseltildiğinde
- Android ya da iOS davranışı değiştiğinde
- Yeni uygulama sürümü yayımlandığında
- Planlama belgesi önemli ölçüde değiştiğinde

Değişiklik kaydı kısa, somut ve doğrulanabilir olmalıdır. Günlük, yapılacaklar listesine veya uzun karar gerekçesine dönüştürülmemelidir.

---

## 10. Belge sürüm geçmişi

### 1.3 Taslak - 19.10.2026

- `0.0.0-planning.4` ve `0.0.0-planning.5` kayıtları `# Değişiklik Kayıtları` bölümüne taşındı.
- `0.0.0-planning.3` kaydı ayrıştırıldı ve dördüncü çapraz denetim değişiklikleri eklendi.
- Bölüm 2'deki eksik `Unreleased` başlık şablonu tamamlandı.

### 1.2 Taslak - 19.10.2026

- Üçüncü belge çapraz denetim kayıtları (`0.0.0-planning.4`) eklendi.

### 1.1 Taslak - 03.09.2026

- Başlangıç belge setinin tamamlanması kaydedildi.
- Çapraz tutarlılık düzeltmeleri kaydedildi.
- Planlama sürümleri tarihçe kuralına göre sıralandı.
- Belge sürümü 1.1 Taslak olarak güncellendi.

### 1.0 Taslak - 03.09.2026

- Değişiklik günlüğü biçimi oluşturuldu.
- Kategori ve kayıt kuralları tanımlandı.
- Sürümleme yaklaşımı belirlendi.
- İlk planlama değişiklikleri geriye dönük olarak kaydedildi.
- `price_source_product_mappings` veritabanı değişikliği ayrı kayıt olarak eklendi.
- Gelecek sürüm kayıt şablonu eklendi.
- Yayımlama kontrol listesi ve mevcut sınırlar eklendi.
