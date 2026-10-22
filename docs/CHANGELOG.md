# Altın İz Değişiklik Günlüğü

**Belge adı:** `CHANGELOG.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.4 Taslak  
**Son güncelleme:** 21.10.2026  
**Proje aşaması:** Proje iskeleti (Faz 2)  
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

## [0.0.0-planning.31] - 22.10.2026

### Added

- Faz 6.5 Fiyatlar ekranı tamamlandı:
  - `src/app/(protected)/(tabs)/prices.tsx`: Sahte (mock) verilerden arındırılarak canlı Supabase veritabanı fiyatları ve `goldPriceService` ile tam entegre edildi.
  - Canlı piyasa durum göstergesi (Yeşil "Canlı Piyasa" rozeti veya sarı "Gecikmeli" rozeti) ve son güncelleme zamanı bilgisi eklendi.
  - Türkçe karakter duyarlı anlık arama (Türkçe küçük/büyük harf uyumlu arama kutusu ve tek tıkla arama temizleme butonu) eklendi.
  - 4 yönlü sıralama kontrolü (`Varsayılan` [sortOrder], `İsim (A-Z)`, `Fiyat (Artan)`, `Fiyat (Azalan)`) eklendi.
  - Fiyatı olmayan ürünlerin fiyat sıralamalarında sona güvenle atılması sağlandı.
  - Kartlarda Alış (Bozdurma) ve Satış (Satın Alma) fiyatları açık ve net etiketlerle ayrıştırıldı.
  - Günlük değişim rozeti yalnızca geçerli veri olduğunda renklendirilerek gösterildi (`▲ +%0,45` veya `▼ -%0,20`).
  - ADR-013 kuralı uyarınca fiyatı olmayan ürünlerde kesinlikle `0 TL` gösterilmemesi (`-` veya `Fiyat Yok` gösterimi) uygulandı.
  - Eski veri durumunda `StaleDataBanner`, kısmi veri durumunda `PartialDataBanner` uyarı şeritleri entegre edildi.
  - Çek-yenile (pull-to-refresh) ve hata durumunda "Yeniden Dene" butonu ile dayanıklı veri yenileme mekanizması kuruldu.
  - Ürün kartına tıklandığında `/(protected)/gold/[productId]` detay sayfasına dinamik yönlendirme eklendi.
  - Uzun ürün adlarının Android ve iOS üzerinde taşmadan ve fiyatları bozmadan düzgün sarılması sağlandı.
  - `supabase/tests/test-faz6-5-prices-screen.ts`: 10/10 senaryoyu kapsayan sıralama, arama, ADR-013 kuralı ve canlı veritabanı test paketi başarıyla çalıştırıldı.

### Changed

- `docs/TODO.md`, `docs/PROJECT_CONTEXT.md` ve `docs/HANDOFF.md` güncellenerek Faz 6.5 tamamlandı olarak işaretlendi; sıradaki görev Faz 6.6 (Altın detay ekranı) olarak belirlendi.

---

## [0.0.0-planning.30] - 22.10.2026

### Added

- Faz 6.4 Güncel fiyat okuma servisi tamamlandı:
  - `src/models/goldProduct.ts`: Altın ürün modeli (`GoldProduct`, `GoldProductCategory`, `MeasurementUnit`, `mapRowToGoldProduct`) oluşturuldu.
  - `src/models/goldPrice.ts`: Altın fiyat modeli (`GoldPrice`, `PriceFreshnessStatus`, `ProductWithPrice`, `determinePriceStatus`, `mapRowToGoldPrice`) oluşturuldu.
  - `src/utils/formatters.ts`: Fiyat, para birimi, yüzdelik oran ve tarih formatlayıcı yardımcıları (`formatMoney`, `formatPercent`, `formatDateTime`) eklendi.
  - `src/services/goldProductService.ts`: Aktif ürünleri (`getActiveProducts`), fiyat gösterimine açık ürünleri (`getPriceDisplayProducts`), portföye açık ürünleri (`getPortfolioProducts`) ve hesaplamaya açık ürünleri (`getCalculatorProducts`) getiren istemci servisi yazıldı.
  - `src/services/goldPriceService.ts`: RLS uyumlu en son geçerli fiyatları (`getLatestPrices`), tek ürün fiyatını (`getLatestPriceForProduct`) ve ürün-fiyat birleşimini (`getProductsWithPrices`) getiren istemci servisi yazıldı.
  - Fiyat tazelik durumları (`live`, `stale`, `partial`, `unavailable`) modellendi.
  - Fiyat bulunamayan durumlar için `null` dönülmesi (0 TL kabul edilmemesi, ADR-013) ve hiçbir zaman başka ürün fiyatının yedek olarak bağlanmaması kuralı uygulandı.
  - `supabase/tests/test-faz6-4-price-service.ts`: Canlı veritabanı sorguları ve tüm iş kurallarını kapsayan 10/10 test başarıyla çalıştırıldı.

### Changed

- `src/models/index.ts`, `src/services/index.ts` ve `src/utils/index.ts` dosyalarına yeni modeller, servisler ve formatlayıcılar eklendi.
- `docs/TODO.md`, `docs/PROJECT_CONTEXT.md` ve `docs/HANDOFF.md` güncellenerek Faz 6.4 tamamlandı olarak işaretlendi; sıradaki görev Faz 6.5 (Fiyatlar ekranı) olarak belirlendi.

---

## [0.0.0-planning.29] - 22.10.2026

### Added

- Faz 6.3 Fiyat zamanlayıcısı tamamlandı:
  - `supabase/functions/fetch-gold-prices/scheduler.ts`: Zamanlayıcı yöneticisi, eşzamanlı çakışma koruma kilidi (`checkConcurrencyLock`), bayat kilit kurtarma mekanizması (`STALE_LOCK_CLEARED`), aylık ücretsiz kota izleme (`checkQuotaUsage`), değişmeyen veride yinelenen kayıt engelleme (`isDuplicatePriceData`) ve yetkili manuel çalıştırma motoru (`executePriceFetchRun`) kodlandı.
  - Development ortamında otomatik zamanlayıcı gereksiz kota tüketimini ve maliyet oluşumunu engellemek amacıyla varsayılan olarak kapalı tutuldu (`ENABLE_PRICE_SCHEDULER=false`, ADR-031).
  - Yetkili manuel fiyat çekme tetikleyicisi (`triggerType: 'manual'`) oluşturuldu; kilit, kota ve çalıştırma kayıtları güvenceye alındı.
  - Aylık ücretsiz API kotası (%80 erken uyarı ve %100 aşım durumunda dış isteği bloklama) uygulandı.
  - 5 dakikadan eski takılı kalan işlemlerin kilidi otomatik serbest bırakılarak kesinti engellendi.
  - Gelen fiyatların veritabanındaki son geçerli fiyatlarla aynı olması durumunda gereksiz yinelenen kayıt basımı önlendi.
  - Zamanlayıcı hata loglarında `sanitizer.ts` ile API anahtarlarının açık metin olarak saklanması engellendi.
  - `supabase/tests/test-faz6-3-price-scheduler.ts`: 7/7 senaryoyu kapsayan otomatik testler başarıyla çalıştırıldı.

### Changed

- `supabase/functions/fetch-gold-prices/types.ts`: `SchedulerConfig`, `ConcurrencyCheckResult`, `QuotaCheckResult`, `DuplicateCheckResult`, `ManualTriggerOptions` modelleri eklendi.
- `supabase/functions/fetch-gold-prices/config.ts`: `getSchedulerConfig` fonksiyonu eklendi.
- `supabase/functions/fetch-gold-prices/index.ts`: Edge Function giriş noktası `executePriceFetchRun` yetkili tetikleyicisiyle entegre edildi.
- `docs/TODO.md`, `docs/PROJECT_CONTEXT.md` ve `docs/HANDOFF.md` güncellenerek Faz 6.3 tamamlandı olarak işaretlendi; sıradaki görev Faz 6.4 (Güncel fiyat okuma servisi) olarak belirlendi.

---

## [0.0.0-planning.28] - 22.10.2026

### Added

- Faz 6.2 Fiyat doğrulama tamamlandı:
  - `supabase/functions/fetch-gold-prices/validator.ts`: Fiyat doğrulama ve dönüştürme modülü kodlandı (`toMinorUnits`, `parseDateSafe`, `extractPriceList`, `validateSinglePriceItem`, `validateAndTransformPrices`).
  - Sayısal pozitiflik denetimi: 0 ve negatif fiyatlar güvenle reddedildi.
  - Alış ve satış fiyatlarından en az birinin pozitif sayı olması şartı uygulandı.
  - Ondalıklı TL tutarları IEEE-754 kayan nokta hassasiyet hatalarından arındırılarak kuruşa (`_minor`, `BIGINT`) tam sayı olarak çevrildi.
  - Aşırı gelecek tarihli zaman damgaları (10 dakikadan ileri) engellendi.
  - TRY/USD para birimleri ve `piece`, `gram`, `ounce` ürün ölçü birimi denetimi bağlandı.
  - Sağlayıcının eski/gecikmeli veri işareti (`is_provider_stale`) entegre edildi.
  - `price_fetch_runs` tablosu için `products_received`, `products_saved`, `products_rejected` sayaçları ve `success`, `partial`, `failed` durum hesaplama kuralları kodlandı.
  - `supabase/tests/test-faz6-2-price-validation.ts`: Tüm doğrulama kurallarını ve canlı veritabanı RLS `gold_prices_read_valid` politikasını (`is_valid = false` olan kayıtların anonim/authenticated kullanıcılara asla dönmediğini) doğrulayan 11/11 test başarıyla çalıştırıldı.

### Changed

- `supabase/functions/fetch-gold-prices/types.ts`: `FetchRunStatus`, `ProductMappingInfo`, `ValidatedPriceRecord`, `ValidationSummary` tipleri eklendi.
- `supabase/functions/fetch-gold-prices/index.ts`: Çekilen ham veriyi doğrulamadan geçiren iş akışı bağlandı.
- `docs/TODO.md`, `docs/PROJECT_CONTEXT.md` ve `docs/HANDOFF.md` güncellenerek Faz 6.2 tamamlandı olarak işaretlendi; sıradaki görev Faz 6.3 (Fiyat zamanlayıcısı) olarak belirlendi.

---

## [0.0.0-planning.27] - 22.10.2026

### Added

- Faz 6.1 Fiyat çekme Edge Function tamamlandı:
  - `supabase/functions/fetch-gold-prices/types.ts`: Tip tanımları, hata sınıfları (`PriceApiError`, `PriceApiErrorCode`), istek yapılandırması ve yanıt modelleri oluşturuldu.
  - `supabase/functions/fetch-gold-prices/sanitizer.ts`: Loglarda ve hata nesnelerinde API anahtarını güvenli maskeleyen (`maskSecret`), açık metin anahtarları temizleyen (`sanitizeLog`) ve güvenli loglama yapan yardımcılar eklendi.
  - `supabase/functions/fetch-gold-prices/config.ts`: `GOLD_PRICE_API_KEY`, `GOLD_PRICE_API_BASE_URL`, `GOLD_PRICE_SOURCE_CODE`, `FETCH_TIMEOUT_MS`, `MAX_RETRIES` ve `RETRY_DELAY_MS` ortam değişkenlerini güvenli okuyan yapılandırma modülü kodlandı.
  - `supabase/functions/fetch-gold-prices/fetcher.ts`: Dış kaynaktan fiyat çeken servis yazıldı; `AbortController` tabanlı zaman aşımı mekanizması (8000 ms), HTTP 401 (yetkisiz), HTTP 403 (yasak), HTTP 429 (kota aşımı) durumlarında tekrar denemeden derhal güvenli hata üretimi; HTTP 500-504 ve ağ bağlantı hatalarında sınırlı tekrar deneme (retry) döngüsü kodlandı.
  - `supabase/functions/fetch-gold-prices/index.ts`: Supabase Edge Function Deno HTTP giriş noktası oluşturuldu; CORS başlıkları ve yetkisiz çağrıları engelleyen `isAuthorized` güvenlik kontrolü uygulandı.
  - `supabase/tests/test-faz6-1-edge-function.ts`: Ortam değişkenleri, başarılı çekim, 401/403/429 non-retryable hataları, 503 retry döngüsü, timeout iptali, log anahtar maskeleme ve HTTP yetki kontrolünü kapsayan 9/9 test başarıyla çalıştırıldı.

### Changed

- `tsconfig.json` yapılandırmasına `"allowImportingTsExtensions": true` eklendi; Edge Function Deno uyumlu `.ts` uzantılı modüllerin yerel TypeScript denetiminde sıfır hatayla derlenmesi sağlandı.
- `docs/TODO.md`, `docs/PROJECT_CONTEXT.md` ve `docs/HANDOFF.md` güncellenerek Faz 6.1 tamamlandı olarak işaretlendi; sıradaki görev Faz 6.2 (Fiyat doğrulama) olarak belirlendi.

---

## [0.0.0-planning.26] - 22.10.2026

### Added

- Faz 6 Fiyat sağlayıcısı eşleştirmeleri tamamlandı:
  - `supabase/migrations/20261022000007_price_source_product_mappings.sql` göçüyle `price_source_product_mappings` tablosuna 22 adet sağlayıcı sembol eşleştirmesi (20 aktif, 2 test/pasif) ve SELECT okuma RLS politikası (`price_source_product_mappings_read_all`) eklendi.
  - `supabase/seed.sql` dosyasına güncel eşleştirmeler ve RLS okuma politikası işlendi.
  - Eski ve yeni tarihli altın sikke ürünleri (Çeyrek, Yarım, Tam, Ata, Gremse) için `_NEW` ve `_OLD` sembolleri üzerinden ayrıştırılmış sembol eşleştirmeleri sağlandı.
  - Güvenlik ve veri bütünlüğü kuralları uyarınca Cumhuriyet Altını (`REPUBLIC_GOLD`) ile Ata Altını sembolleri resmi sağlayıcı dökümantasyonu netleşene kadar eşleştirilmedi (ADR-017 & KI-005).
  - Bilinmeyen dış sembollerin otomatik sahte ürün oluşturmadığı ve `is_active = false` olan eşleştirmelerin fiyat işlemine dahil edilmediği 7/7 otomatik test ile doğrulandı.
  - **Bölüm 12 (Fiyat Sistemi)** kapsamındaki ilk aşama olan Faz 6 tamamlandı.

### Changed

- `docs/TODO.md`, `docs/PROJECT_CONTEXT.md` ve `docs/HANDOFF.md` güncellenerek Faz 6 tamamlandı olarak işaretlendi; sıradaki görev Faz 6.1 (Fiyat çekme Edge Function) olarak belirlendi.

---

## [0.0.0-planning.25] - 22.10.2026

### Added

- Faz 5.7 Çıkış yapma tamamlandı:
  - `src/services/authService.ts` servisine çıkış sırasında kullanıcıya özel yerel portföy ve önbellek anahtarlarını silen önbellek temizleme (`AsyncStorage.multiRemove`) mekanizması entegre edildi.
  - `src/app/(protected)/(tabs)/settings.tsx` ekranı güncellendi; native platformlarda `Alert.alert`, web/yedek ortamda modal onay penceresi eklendi.
  - Onay sonrası `authService.signOut` ve `AuthProvider.signOut` çağrılarak yerel auth durumu `unauthenticated` olarak sıfırlandı.
  - Korunan navigasyon geçmişi `router.replace('/(public)/welcome')` ile temizlenerek geri tuşuyla veya hareketle korunan alana dönülmesi engellendi.
  - Çıkış sonrasında kullanıcının veritabanındaki hesap ve portföy verilerinin silinmediği, başka kullanıcı girdiğinde RLS kuralları uyarınca önceki kullanıcının verilerinin asla görünmediği (0 satır) canlı testlerle (6/6) kanıtlandı.
  - **Bölüm 11 (Kullanıcı Hesabı Geliştirmesi: Faz 5 - Faz 5.7)** eksiksiz tamamlandı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 5.7 ve Bölüm 11 tamamlandı olarak işaretlendi; sıradaki ana bölüm Bölüm 12 (Fiyat Sistemi) ve teknik görev Faz 6 (Fiyat sağlayıcısı eşleştirmeleri) olarak belirlendi.

---

## [0.0.0-planning.24] - 22.10.2026

### Added

- Faz 5.6 Şifre sıfırlama tamamlandı:
  - `src/services/authService.ts` servisine şifre güncelleme (`updatePassword`) metodu eklendi.
  - `src/app/(public)/forgot-password.tsx` ekranı kodlandı; e-posta doğrulama, `altiniz://auth-callback?type=recovery` derin bağlantısı tetikleme ve kullanıcı hesabının varlığını ifşa etmeyen genel güvenli başarı mesajı uygulandı.
  - `src/app/(public)/reset-password.tsx` ekranı kodlandı; kurtarma oturumu kontrolü, süresi dolmuş veya geçersiz bağlantı durumunda açıklayıcı hata ve yönlendirme butonları, en az 6 karakterlik şifre politikası kontrolü ve şifre eşleşme doğrulaması eklendi.
  - Şifre başarıyla güncellendikten sonra güvenlik kuralları uyarınca eski kurtarma oturumu kapatıldı ve kullanıcı güvenli biçimde `sign-in` ekranına yönlendirildi.
  - Şifre sıfırlama akışını, derin bağlantı yönlendirmesini, süresi dolmuş bağlantıyı ve yeni şifre politikasını kapsayan 5/5 test başarıyla çalıştırıldı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 5.6 tamamlandı olarak işaretlendi; sıradaki görev Faz 5.7 (Çıkış yapma) olarak belirlendi.

---

## [0.0.0-planning.23] - 22.10.2026

### Added

- Faz 5.5 Giriş ekranı tamamlandı:
  - `src/app/(public)/sign-in.tsx` eksiksiz kodlandı; e-posta ve şifre giriş alanları, `PasswordField` ile şifre göster/gizle düğmesi, istemci tarafı format doğrulama kontrolleri bağlandı.
  - Güvenlik standardı: Hatalı girişlerde e-posta hesabının mevcudiyetini ifşa etmeyen genel mesaj (`"E-posta adresi veya şifre hatalı."`) `normalizeError` üzerinden güvenle gösterildi; hiçbir şifre loglanmadı.
  - Şifremi Unuttum (`/(public)/forgot-password`) ve Hesap Oluştur (`/(public)/sign-up`) bağlantıları eklendi.
  - Çift gönderimi engelleyen yüklenme (`isSubmitting`) durumu uygulandı.
  - Durum yönlendirmeleri uygulandı: Doğrulanmamış hesapta `verify-email`, askıya alınmış veya silinme bekleyen hesapta `account-status`, aktif hesapta `/(protected)/(tabs)` rotasına tek yönlendirme yapıldı.
  - Giriş akışı, yönlendirmeler ve hata maskelemeyi doğrulayan 6/6 test başarıyla çalıştırıldı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 5.5 tamamlandı olarak işaretlendi; sıradaki görev Faz 5.6 (Şifre sıfırlama) olarak belirlendi.

---

## [0.0.0-planning.22] - 22.10.2026

### Added

- Faz 5.4 E-posta doğrulama tamamlandı:
  - `app.json` dosyasına Android (`package: "com.altiniz.app"`) ve iOS (`bundleIdentifier: "com.altiniz.app"`) kimlikleri tanımlandı; `altiniz://` şeması üzerinden derin bağlantı (deep link) altyapısı yapılandırıldı.
  - `src/services/authService.ts` servisine `exchangeCodeForSession` (PKCE akışı) ve `setSession` (belirteç oturumu) metotları eklendi.
  - `src/app/(public)/verify-email.tsx` güncellendi; 60 saniyelik hız sınırı (cooldown / rate limit) sayacı, tekrar gönderme butonu ve `handleCheckStatus` doğrulama durumu sorgulama/yenileme butonu eklendi.
  - `src/app/auth-callback.tsx` rotası tam işlevsel hâle getirildi; süresi dolmuş bağlantılarda (`otp_expired`) anlaşılır Türkçe hata sunumu ve aksiyon butonları (`verify-email` veya `sign-in`), başarılı doğrulamada `type` parametresine göre `reset-password` veya `tabs` yönlendirmesi sağlandı.
  - Derin bağlantı, hız sınırı, süresi dolmuş bağlantı ve başarılı oturum kurma durumlarını kapsayan 6/6 test başarıyla çalıştırıldı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 5.4 tamamlandı olarak işaretlendi; sıradaki görev Faz 5.5 (Giriş ekranı) olarak belirlendi.

---

## [0.0.0-planning.21] - 22.10.2026

### Added

- Faz 5.3 Kayıt ekranı tamamlandı:
  - `src/app/(public)/sign-up.tsx` baştan sona işlevsel hâle getirildi; e-posta, şifre ve şifre tekrar alanları, şifreyi göster/gizle butonları, istemci tarafı format ve eşleşme doğrulaması eklendi.
  - Çift gönderimi engelleyen yüklenme (`isSubmitting`) mekanizması ve genel hata mesajı bandı entegre edildi.
  - Kullanım Koşulları ve Gizlilik Politikası (KVKK) için modal üzerinden formdan ayrılmadan incelenebilen yasal bilgilendirme bağlantıları eklendi.
  - Başarılı kayıt sonrasında e-posta parametresi ile birlikte güvenli biçimde `/(public)/verify-email` rotasına yönlendirme akışı bağlandı.
  - `src/app/(public)/verify-email.tsx` güncellenerek kayıt olan kullanıcının e-posta adresini görüntüleme ve doğrulama e-postasını tekrar gönderme (`resendVerificationEmail`) altyapısı hazırlandı.
  - İstemci doğrulama mantığı için 5/5 test başarıyla çalıştırıldı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 5.3 tamamlandı olarak işaretlendi; sıradaki görev Faz 5.4 (E-posta doğrulama) olarak belirlendi.

---

## [0.0.0-planning.20] - 22.10.2026

### Added

- Faz 5.2 AuthProvider tamamlandı:
  - `src/models/profile.ts` oluşturuldu; `AccountStatus` (`active`, `deletion_pending`, `disabled`) ve `UserProfile` tipleri tanımlandı.
  - `src/providers/AuthProvider.tsx` oluşturuldu; oturum durumları (`loading`, `unauthenticated`, `unverified`, `active`, `deletion_pending`, `disabled`), `onAuthStateChange` aboneliği, profil sorgulama ve güvenli `signOut` fonksiyonları merkezi bağlamda birleştirildi.
  - Provider temizleme (`subscription.unsubscribe()`) yaşam döngüsü eksiksiz uygulandı.
  - `src/hooks/useAuth.ts` ve `src/providers/index.ts` oluşturuldu.
  - `src/app/_layout.tsx` kök düzenine `AuthProvider` entegre edildi.
  - `src/app/index.tsx` güncellenerek oturum yüklenirken (`loading`) tema renklerine uygun yüklenme göstergesi sunuldu; kesin oturum durumu çözümlendikten sonra tek yönlendirme yapılarak sonsuz yönlendirme döngüsü kesin olarak engellendi.
  - Birim ve sonsuz döngü testleri (6/6) başarıyla doğrulandı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 5.2 tamamlandı olarak işaretlendi; sıradaki görev Faz 5.3 (Kayıt ekranı) olarak belirlendi.

---

## [0.0.0-planning.19] - 22.10.2026

### Added

- Faz 5.1 Auth servisleri tamamlandı:
  - `src/models/errors.ts` oluşturuldu; standart `AppError` ({ code, userMessage, retryable, requestId, cause }) ve `AuthErrorCode` tipleri tanımlandı.
  - `src/models/auth.ts` oluşturuldu; `SignUpCredentials`, `SignInCredentials`, `ResetPasswordParams`, `ResendVerificationParams` ve `AuthSuccessResult` tipleri güvenli parametre yönetimi için tanımlandı.
  - `src/models/index.ts` oluşturularak modeller dışa aktarıldı.
  - `src/utils/normalizeError.ts` oluşturuldu; Supabase Auth, ağ ve JavaScript hatalarını kullanıcı dostu, güvenli Türkçe mesajlara dönüştüren yapı kuruldu.
  - Güvenlik kontrolleri: Hatalı girişlerde ve şifre sıfırlama isteklerinde e-posta hesabı varlığını gereksiz ifşa etmeyen genel mesajlar sağlandı; hiçbir şifre veya kimlik belirtecinin loglanmadığı doğrulandı.
  - `src/utils/index.ts` oluşturuldu.
  - `src/services/authService.ts` oluşturuldu; `signUp`, `signInWithPassword`, `signOut`, `getSession`, `getUser`, `resendVerificationEmail`, `resetPasswordForEmail` ve `onAuthStateChange` fonksiyonları eksiksiz uygulandı.
  - `src/services/index.ts` oluşturularak servisler dışa aktarıldı.
  - Canlı Supabase bağlantısı ve 6/6 birim/güvenlik testi başarıyla doğrulandı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 5.1 tamamlandı olarak işaretlendi; sıradaki görev Faz 5.2 (AuthProvider) olarak belirlendi.

---

## [0.0.0-planning.18] - 22.10.2026

### Added

- Faz 5 Supabase İstemcisi tamamlandı:
  - `@supabase/supabase-js` (^2.118.0) ve `@react-native-async-storage/async-storage` (2.2.0) paketleri `npx expo install` ile Expo SDK 58 uyumlu olarak kuruldu.
  - `src/lib/environment.ts` oluşturuldu; `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ortam değişkenlerini doğrulayan, eksiklik durumunda açıklayıcı hata fırlatan yapı kuruldu.
  - `src/lib/supabase.ts` oluşturuldu; mobil oturumu `AsyncStorage` ile cihazda güvenle saklayan, otomatik token yenileme (`autoRefreshToken: true`) ve kalıcı oturum (`persistSession: true`) özelliklerine sahip tek Supabase istemcisi (singleton) yapılandırıldı.
  - `src/lib/index.ts` oluşturuldu ve istemci dışa aktarımları düzenlendi.
  - Supabase JS istemcisi üzerinden veritabanı sorgusu (`gold_products`) başarıyla test edildi.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 5 tamamlandı olarak işaretlendi; sıradaki görev Faz 5.1 (Auth servisleri) olarak belirlendi.

---

## [0.0.0-planning.17] - 22.10.2026

### Added

- Faz 4.5 RLS Güvenlik Testleri tamamlandı:
  - İki test kullanıcısı (`user_a@test.com` ve `user_b@test.com`) üzerinden 16 adet RLS ve yetkilendirme testi başarıyla çalıştırıldı.
  - `handle_new_user` tetikleyicisinin profil ve tercihleri eksiksiz oluşturduğu doğrulandı.
  - A ve B kullanıcıları arasında çift yönlü portföy ve profil izolasyonu (0 satır) kanıtlandı.
  - Başkası adına portföy ekleme, güncelleme ve silme denemeleri (HTTP 403) engellendi.
  - Normal kullanıcıların fiyat eklemesi, ürün güncellemesi veya eşleştirme değiştirmesi engellendi.
  - `user_legal_events` tablosuna doğrudan INSERT engellendi; güvenli `record_user_legal_event` RPC çağrısı doğrulandı.
  - Profil `user_id` ve `account_status` kolon koruma kuralları test edilerek teyit edildi.
  - Test sonuçları `SECURITY.md` (Bölüm 9.1) ve devir belgelerine işlendi.

### Changed

- Bölüm 10 (Supabase Development Altyapısı - Faz 4'ten Faz 4.5'e kadar) eksiksiz tamamlandı. Sıradaki ana bölüm Bölüm 11 (Kullanıcı Hesabı Geliştirmesi - Faz 5: Supabase İstemcisi) olarak belirlendi.
- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellendi.

---

## [0.0.0-planning.16] - 22.10.2026

### Added

- Faz 4.4 RLS Politikaları ve Güvenlik Tetikleyicileri tamamlandı:
  - `20261022000006_rls_and_security_policies.sql` migration dosyası hazırlandı ve veritabanına uygulandı.
  - 12 tablonun tamamında Row Level Security (RLS) etkinleştirildi.
  - `handle_new_user` tetikleyicisi (`auth.users AFTER INSERT`) oluşturuldu; yeni kullanıcılarda profil ve tercihler otomatik oluşturulur hale getirildi.
  - `BEFORE UPDATE` kolon koruma tetikleyicileri uygulandı (`user_profiles`, `user_preferences`, `portfolio_entries` tablolarında yetkisiz kimlik, durum ve zaman damgası değişiklikleri engellendi).
  - Kullanıcı verisi izolasyonu (`auth.uid() = user_id`) politikaları tanımlandı (`user_profiles`, `user_preferences`, `portfolio_entries`, `user_legal_events`, `account_deletion_requests`).
  - Ortak tablolar (`gold_products`, `price_sources`, `gold_prices`, `legal_documents`) `anon` ve `authenticated` rollerine salt-okunur (`SELECT`) açıldı, yazma işlemleri engellendi.
  - Append-only yasal olay kaydı için `record_user_legal_event` RPC fonksiyonu oluşturuldu.
  - REST API üzerinden RLS okuma ve yazma koruma testleri başarıyla doğrulandı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 4.4 tamamlandı olarak işaretlendi; sıradaki görev Faz 4.5 (RLS güvenlik testleri) olarak belirlendi.

---

## [0.0.0-planning.15] - 22.10.2026

### Added

- Faz 4.3 Başlangıç Ürün Verileri tamamlandı:
  - `supabase/seed.sql` dosyası oluşturuldu ve veritabanına uygulandı.
  - `gold_products` tablosuna 25 adet başlangıç altın ürünü (Gram, Çeyrek, Yarım, Tam, Cumhuriyet, Ata, Gremse, Reşat, Hamit, 22/14/18 Ayar, 1-100g Paketli Altınlar ve Ons Altın) eklendi.
  - Eski ve yeni tarihli ürünler (`_NEW`, `_OLD`) ayrı kod ve adlarla tanımlandı.
  - `OUNCE_GOLD` için `portfolio_enabled = false` kuralı uygulandı.
  - Koşullu ürünler (`HAMIT_GOLD`, `GOLD_18K`, `PACKAGED_GOLD_1G`, `PACKAGED_GOLD_2_5G`) için portföy ve hesaplama alanları doğrudan fiyat doğrulanana kadar kapalı tutuldu.
  - `price_sources` tablosuna `ALTIN_API` birincil kaynağı eklendi.
  - `legal_documents` tablosuna "TEST METNİDİR - PRODUCTION İÇİN GEÇERLİ DEĞİLDİR" uyarısı taşıyan 5 yasal taslak eklendi.
  - Gerçek kullanıcı verisi eklenmediği ve RLS kısıtlarının korunduğu doğrulandı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 4.3 tamamlandı olarak işaretlendi; sıradaki görev Faz 4.4 (RLS politikaları) olarak belirlendi.

---

## [0.0.0-planning.14] - 22.10.2026

### Added

- Faz 4.2 Veritabanı Migration Dosyaları tamamlandı:
  - `20261022000001_extensions_and_helpers.sql`: `pgcrypto`, `uuid-ossp` uzantıları ve ortak `update_updated_at_column()` fonksiyonu oluşturuldu.
  - `20261022000002_user_tables.sql`: `user_profiles` ve `user_preferences` tabloları, CHECK kısıtları ve `updated_at` tetikleyicileriyle oluşturuldu.
  - `20261022000003_product_and_price_tables.sql`: `gold_products`, `price_sources`, `price_source_product_mappings`, `price_fetch_runs` ve `gold_prices` tabloları, benzersizlik kısıtları, doğrulamalar ve performans indeksleriyle oluşturuldu.
  - `20261022000004_portfolio_tables.sql`: `portfolio_entries` tablosu, sayısal hassasiyet, tarih kontrolü (`purchase_date <= CURRENT_DATE`) ve kullanıcı indeksleriyle oluşturuldu.
  - `20261022000005_legal_and_security_tables.sql`: `legal_documents`, `user_legal_events`, `account_deletion_requests` ve `security_events` tabloları oluşturuldu.
  - Development veritabanında tüm migrationlar çalıştırıldı ve REST API üzerinden 12 tablonun tamamının HTTP 200 ile erişilebilir olduğu doğrulandı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 4.2 tamamlandı olarak işaretlendi; sıradaki görev Faz 4.3 (Başlangıç ürün verileri) olarak belirlendi.

---

## [0.0.0-planning.13] - 22.10.2026

### Added

- Faz 4.1 Supabase Yerel Proje Yapısı tamamlandı:
  - `supabase` (v2.121.0) paketi `devDependencies` olarak projeye eklendi.
  - `supabase/config.toml` dosyası başlatıldı; portlar, migration ve seed yapılandırması ayarlandı.
  - `supabase/migrations/` dizini ve `.gitkeep` dosyası oluşturuldu.
  - `supabase/seed.sql` dosyası oluşturuldu; geliştirme/test ortamı ilkeleri ve yasal metin uyarıları eklendi.
  - `supabase/.gitignore` dosyası oluşturuldu (`.temp`, `.branches` vb. geçici dosyaların depoya eklenmesi engellendi).
  - Proje referansı (`hoqujzhcjeaudmkyqgpc`) yerel yapılandırma ile eşleştirildi.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 4.1 tamamlandı olarak işaretlendi; sıradaki görev Faz 4.2 (Veritabanı migration dosyaları) olarak belirlendi.

---

## [0.0.0-planning.12] - 22.10.2026

### Added

- Faz 4 Development Supabase projesi oluşturuldu ve doğrulandı:
  - Supabase üzerinde `altin-iz-dev` adıyla Frankfurt (`eu-central-1`) bölgesinde development projesi açıldı.
  - Mobil uygulamanın geliştirme ortamı (`.env.local`) için `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` değerleri tanımlandı.
  - Proje Auth endpoint'i (`/auth/v1/health`) üzerinden API anahtarı ve ağ bağlantısı başarıyla test edilerek HTTP 200 yanıtı alındı.
  - `service_role` veya gizli anahtarların istemciye ya da depoya eklenmediği doğrulandı.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 4 tamamlandı olarak işaretlendi; sıradaki görev Faz 4.1 (Supabase yerel proje yapısı) olarak belirlendi.

---

## [0.0.0-planning.11] - 22.10.2026

### Added

- Faz 3.2 Expo Router Rota İskeleti tamamlandı:
  - Public rotalar (`src/app/(public)/`): `welcome.tsx`, `sign-in.tsx`, `sign-up.tsx`, `verify-email.tsx`, `forgot-password.tsx`, `reset-password.tsx` ve Stack layout oluşturuldu.
  - Protected alt menü (`src/app/(protected)/(tabs)/`): `index.tsx` (Ana Sayfa), `prices.tsx` (Fiyatlar), `calculator.tsx` (Hesapla), `portfolio.tsx` (Portföyüm), `settings.tsx` (Ayarlar) ve Tabs layout oluşturuldu.
  - Dinamik ve alt sayfalar (`src/app/(protected)/`): `gold/[productId].tsx`, `portfolio/add.tsx`, `portfolio/[entryId].tsx`, `portfolio/[entryId]/edit.tsx`, `account/index.tsx`, `account/delete.tsx`, `legal/index.tsx`, `legal/[documentType].tsx`, `about.tsx`, `support.tsx` ve Protected Stack layout oluşturuldu.
  - Kök rotalar (`src/app/`): `index.tsx` (başlangıç yönlendirmesi), `_layout.tsx` (kök Stack navigatörü), `account-status.tsx`, `auth-callback.tsx` ve `+not-found.tsx` oluşturuldu.

### Changed

- Kök `_layout.tsx` Stack navigasyon yapısıyla güncellendi.
- `eslint.config.js` içine `.expo/*` kuralı eklendi; eski şablon dosyaları (`explore.tsx`, `app-tabs.tsx`, `app-tabs.web.tsx`) temizlendi.
- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Bölüm 9 (Tasarım Sistemi ve Rota İskeleti) tamamlandı olarak işaretlendi; sıradaki görev Bölüm 10 (Faz 4: Development Supabase projesi) olarak belirlendi.

---

## [0.0.0-planning.10] - 22.10.2026

### Added

- Faz 3.1 Ortak Temel Bileşenler tamamlandı:
  - `src/components/common/ScreenContainer.tsx`: SafeAreaView, dinamik arka plan ve ScrollView / KeyboardAvoidingView desteği sunan temel ekran kapsayıcısı oluşturuldu.
  - `src/components/common/PrimaryButton.tsx`: Asgari 48dp dokunma alanına, yüklenme (spinner) ve devre dışı durumlarına sahip ana eylem butonu oluşturuldu.
  - `src/components/common/SecondaryButton.tsx`: Çerçeveli ikincil eylem butonu oluşturuldu.
  - `src/components/common/DangerButton.tsx`: Yıkıcı işlemler için tehlike butonu oluşturuldu.
  - `src/components/forms/TextField.tsx`: Odaklanma, hata, etiket ve ipucu desteği sunan form metin giriş alanı oluşturuldu.
  - `src/components/forms/PasswordField.tsx`: 44x44dp şifre göster/gizle butonuna sahip güvenli şifre alanı oluşturuldu.
  - `src/components/feedback/LoadingState.tsx`: Tam ekran veya bileşen düzeyinde yüklenme durumu göstergesi oluşturuldu.
  - `src/components/feedback/EmptyState.tsx`: Boş portföy ve arama sonuçlarında kullanıcıyı eyleme yönlendiren boş durum bileşeni oluşturuldu.
  - `src/components/feedback/ErrorState.tsx`: Tekrar dene butonu içeren görsel hata ekranı oluşturuldu.
  - `src/components/feedback/StaleDataBanner.tsx`: Eski fiyat durumunda kullanıcıyı bilgilendiren uyarı şeridi oluşturuldu.
  - `src/components/feedback/PartialDataBanner.tsx`: Fiyatı bulunamayan kayıtlarda toplamın kısmi olduğunu belirten uyarı şeridi oluşturuldu.
  - `src/components/index.ts`: Modül dışa aktarımları düzenlendi.

### Changed

- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 3.1 tamamlandı olarak işaretlendi; sıradaki görev Faz 3.2 (Expo Router rota iskeleti) olarak belirlendi.

---

## [0.0.0-planning.9] - 22.10.2026

### Added

- Faz 3 Tema Altyapısı tamamlandı:
  - `src/theme/types.ts`: ColorPalette, SpacingSystem, TypographySystem, Theme ve ThemeContextValue türleri tanımlandı.
  - `src/theme/spacing.ts`: 4px/8px tabanlı boşluk sistemi oluşturuldu.
  - `src/theme/typography.ts`: Yazı boyutu, satır yüksekliği ve ağırlık sistemi oluşturuldu.
  - `src/theme/lightTheme.ts`: `ARCHITECTURE.md` Section 23 renklerine uygun açık tema paleti oluşturuldu (#F7F8FA, #14213D, #D4A72C).
  - `src/theme/darkTheme.ts`: Koyu tema paleti oluşturuldu (#0B1220, #111C2F, #E0B84F).
  - `src/models/theme.ts`: Tema veri modelleri modellendi.
  - `src/providers/ThemeProvider.tsx`: `light`, `dark` ve `system` seçeneklerini destekleyen, sistem teması değişikliklerini anlık algılayan ve React Navigation temasıyla senkron çalışan merkezi sağlayıcı oluşturuldu.
  - `src/hooks/useTheme.ts`: Tema kancası export edildi.

### Changed

- `src/app/_layout.tsx`: Kök layout yeni `ThemeProvider` sağlayıcımızla entegre edildi.
- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Faz 3 tamamlandı olarak işaretlendi; sıradaki görev Faz 3.1 (Ortak temel bileşenler) olarak belirlendi.

---

## [0.0.0-planning.8] - 22.10.2026

### Added

- Faz 2.4 kapsamında `.env.example` şablonu (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_APP_ENV`) oluşturuldu.
- Geliştirme ortamı için yerel `.env.local` oluşturuldu ve `.gitignore` tarafından dışlandığı (`git check-ignore`) doğrulandı.

### Changed

- `ARCHITECTURE.md` içine eksik ortam değişkenleri durumunda güvenli hata davranışı kuralı eklendi.
- `TODO.md`, `PROJECT_CONTEXT.md` ve `HANDOFF.md` güncellenerek Bölüm 8 (Proje İskeleti - Faz 2 serisi) tamamlandı olarak işaretlendi; sıradaki görev Faz 3 (Tema altyapısı) olarak belirlendi.

---

## [0.0.0-planning.7] - 21.10.2026

### Added

- Faz 2.2 kapsamında 14 başlangıç belgesinin proje kökü, `docs/` ve `.github/` altındaki varlığı ve tamlığı doğrulandı.
- Faz 2.3 kapsamında `ARCHITECTURE.md` mimarisine uygun olarak eksik 7 temel klasör oluşturuldu: `src/domain/`, `src/lib/`, `src/models/`, `src/providers/`, `src/services/`, `src/theme/`, `src/utils/`. Mevcut 4 klasör (`src/app/`, `src/components/`, `src/constants/`, `src/hooks/`) zaten şablondan geldiği doğrulandı. TypeScript yol takma adı (`@/*` → `./src/*`) zaten mevcut olduğu teyit edildi.

### Changed

- Expo SDK 58'in dosya tabanlı yönlendirme yapısı (`src/app/`) doğrulanarak `ARCHITECTURE.md`, `README.md`, `.github/copilot-instructions.md`, `TODO.md` ve `PROJECT_CONTEXT.md` içindeki tüm rota referansları `src/app/` yapısıyla eşitlendi.
- `TODO.md` içinde Faz 2.2 adımları tamamlandı (`[x]`) olarak işaretlendi.
- `HANDOFF.md` güncel durum ve sıradaki görev (Faz 2.3) ile eşitlendi.

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
