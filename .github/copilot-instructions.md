# GitHub Copilot Instructions for Altın İz

Bu dosya, GitHub Copilot ve Copilot Agent Mode'un Altın İz projesinde uyması gereken kalıcı çalışma talimatlarını tanımlar.

Bu talimatlar proje kökünde şu konumda bulunmalıdır:

```text
.github/copilot-instructions.md
```

---

## 1. Proje özeti

Altın İz, Android ve iOS cihazlarda çalışacak bir altın fiyatı ve kişisel portföy takip uygulamasıdır.

Temel teknoloji:

```text
React Native
Expo
TypeScript
Expo Router
Supabase
PostgreSQL
Supabase Auth
PostgreSQL Row Level Security
Supabase Edge Functions
```

V1'in temel özellikleri:

- E-posta ve şifreyle hesap oluşturma
- E-posta doğrulama
- Güvenli giriş ve çıkış
- Şifre sıfırlama
- Altın alış ve satış fiyatlarını görüntüleme
- Satın alma ve bozdurma hesabı
- Kişisel altın portföyü
- Tahmini güncel bozdurma değeri
- Tahmini kâr veya zarar
- Portföy kaydı ekleme, düzenleme ve silme
- Hesap ve ilişkili verileri silme

Uygulama yatırım tavsiyesi veya garanti kazanç sunmaz.

---

## 2. Kullanıcının teknik seviyesi

Proje sahibi yazılım geliştirme konusunda başlangıç seviyesindedir.

Bu nedenle Copilot:

1. Kullanıcının teknik terimleri bildiğini varsaymamalıdır.
2. İşlemleri Türkçe ve numaralı adımlarla anlatmalıdır.
3. Açılacak uygulamanın adını açıkça yazmalıdır.
4. Tıklanacak menü, sekme ve düğmenin tam adını vermelidir.
5. Terminal komutunun hangi terminale yazılacağını belirtmelidir.
6. Dosya yolunu proje kökünden başlayarak eksiksiz yazmalıdır.
7. Kodun hangi dosyada değişeceğini açıkça belirtmelidir.
8. Yeni kodun hangi bölümün öncesine veya sonrasına ekleneceğini söylemelidir.
9. Silinecek veya değiştirilecek kodun başlangıç ve bitişini göstermelidir.
10. Mümkünse kısa dosyalarda dosyanın güncel tam içeriğini vermelidir.
11. Her adım sonunda beklenen sonucu açıklamalıdır.
12. Hata olursa kullanıcının hangi ekran görüntüsünü veya hata metnini paylaşacağını söylemelidir.
13. Aynı anda gereğinden fazla işlem vermemelidir.
14. Kullanıcıdan bilinmeyen bir teknik karar vermesini istemeden önce seçenekleri sade biçimde açıklamalıdır.

Kısa ve belirsiz ifadeler kullanma:

```text
Paketi kur.
Dosyayı düzenle.
Config'i ayarla.
Buraya kodu ekle.
```

Bunun yerine açık talimat ver:

```text
Visual Studio Code'u aç.
Sol taraftaki Explorer panelinde src klasörünü genişlet.
src/lib/supabase.ts dosyasını aç.
Dosyada import satırlarının hemen altına aşağıdaki kodu ekle.
Visual Studio Code üst menüsünden Terminal > New Terminal seçeneğine tıkla.
Açılan terminale aşağıdaki komutu yaz ve Enter tuşuna bas.
```

---

## 3. Yanıt dili ve adlandırma

- Kullanıcıya yapılan açıklamalar Türkçe olmalıdır.
- Kullanıcıya gösterilen uygulama metinleri Türkçe olmalıdır.
- Teknik dosya ve klasör adları İngilizce olmalıdır.
- TypeScript değişken, fonksiyon, tip ve bileşen adları İngilizce olmalıdır.
- Kod yorumları gerekli olduğunda kısa ve anlaşılır olmalıdır.
- Gereksiz yorum eklenmemelidir.
- Türkçe kullanıcı metinlerinde yazım ve noktalama düzgün olmalıdır.

Örnek:

```text
Dosya: src/services/portfolioService.ts
Fonksiyon: createPortfolioEntry
Kullanıcı mesajı: Portföy kaydı oluşturulamadı. Lütfen tekrar deneyin.
```

---

## 4. Her görevden önce okunacak belgeler

Proje ilk açıldığında veya yeni oturum başladığında şu sıra kullanılır:

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

Belirli bir görevde, ilk bağlam ve takip belgelerinden sonra yalnızca görevle ilgili ayrıntılı teknik belgeler yeniden okunabilir.

Kurallar:

- Belgeleri okumadan büyük değişiklik yapma.
- Belgelerde bulunmayan önemli bir kararı sessizce verme.
- Belgeler ile kod çelişiyorsa önce çelişkiyi kullanıcıya açıkla.
- Güncel gerçek kod ile taslak belge farklıysa gerçek durumu incele, ardından gerekli belge güncellemesini öner.
- Eski veya oluşturulmamış dosyayı varmış gibi kabul etme.

---

## 5. Tek gerçek kaynaklar

Aşağıdaki konularda belirtilen belge temel kaynaktır:

```text
Proje amacı ve mevcut durum  → PROJECT_CONTEXT.md
Son çalışma durumu           → HANDOFF.md
Yapılacak işlerin sırası      → TODO.md
Açık sorunlar                → KNOWN_ISSUES.md
Kararların gerekçeleri        → DECISIONS.md
Klasör ve katman mimarisi     → ARCHITECTURE.md
Veritabanı hedef yapısı       → DATABASE.md
API hedef sözleşmesi          → API.md
Güvenlik kuralları            → SECURITY.md
Kişisel veri envanteri        → PRIVACY.md
Saklama ve imha kuralları     → DATA_RETENTION.md
Gerçekleşmiş değişiklikler    → CHANGELOG.md
```

Çelişki varsa kullanıcıya bildir ve ilgili belgeleri birlikte güncelle.

---

## 6. Görev çalışma düzeni

Her teknik görevde şu sırayı uygula:

```text
1. Görevin amacını açıkla
2. İlgili belgeleri oku
3. Mevcut dosya ve kodu incele
4. Değişecek dosyaları listele
5. Riskleri açıkla
6. Git durumunu kontrol et
7. Gerekirse güvenli geri dönüş noktası oluştur
8. Küçük ve tek amaçlı değişiklik yap
9. Biçimlendirme ve tip kontrollerini çalıştır
10. İlgili testleri çalıştır
11. Android etkisini kontrol et
12. iOS etkisini kontrol et
13. Güvenlik etkisini kontrol et
14. Gizlilik ve veri saklama etkisini kontrol et
15. Beklenen sonucu doğrula
16. Belgeleri güncelle
17. Çalışan sürümü Git'e kaydet
18. HANDOFF.md dosyasını güncelle
```

Birden fazla bağımsız özellik aynı değişiklik grubuna karıştırılmamalıdır.

---

## 7. Değişiklik öncesi açıklama biçimi

Kod değiştirmeden önce kullanıcıya şu bilgileri ver:

```text
Amaç:
Değişecek dosyalar:
Yeni oluşturulacak dosyalar:
Kurulacak paketler:
Veritabanı etkisi:
Güvenlik etkisi:
Android etkisi:
iOS etkisi:
Test planı:
Geri dönüş planı:
```

Bir başlık için etki yoksa açıkça `Yok` yaz.

---

## 8. Dosya düzenleme kuralları

- Dosyayı okumadan değiştirme.
- Kullanıcının mevcut çalışan kodunu gereksiz yere yeniden yazma.
- Yalnızca görev için gereken dosyalara dokun.
- Büyük dosyayı gereksiz biçimde yeniden biçimlendirme.
- İlgisiz import sıralaması veya ad değişikliği yapma.
- Kullanılmayan kod bırakma.
- Aynı kodu birden fazla yerde kopyalama.
- Bir değişikliği farklı mimari katmanlara rastgele dağıtma.
- Dosya taşınacaksa bütün importları ve doküman referanslarını kontrol et.
- Dosya silinecekse nedenini ve geri dönüş yöntemini açıkla.

Kullanıcıya kod değişikliği anlatırken:

1. Tam dosya yolunu yaz.
2. Bulunacak mevcut bölümü göster.
3. Değiştirilecek aralığı açıkla.
4. Yeni kodu ver.
5. Dosyanın nasıl kaydedileceğini belirt.
6. Sonrasında çalıştırılacak testi ver.

---

## 9. Proje klasör yapısı

Hedef yapı `ARCHITECTURE.md` ile uyumlu olmalıdır.

Ana sorumluluklar:

```text
app/                 → Expo Router ekranları ve rotalar
src/components/      → Ortak görsel bileşenler
src/constants/       → Sabitler ve ortak metinler
src/domain/          → Saf iş kuralları ve hesaplamalar
src/hooks/           → Tekrar kullanılan React davranışları
src/lib/             → Supabase ve ortam kurulumu
src/models/          → TypeScript veri modelleri
src/providers/       → Uygulama genelindeki sağlayıcılar
src/services/        → Supabase ve sunucu iletişimi
src/theme/           → Tema sistemi
src/utils/           → Genel yardımcılar
supabase/migrations/ → Veritabanı değişiklikleri
supabase/functions/  → Güvenli sunucu fonksiyonları
tests/               → Mobil ve iş mantığı testleri
docs/                → Proje hafızası
```

Kurallar:

- Rota dosyalarını ince tut.
- Karmaşık Supabase sorgularını ekran dosyasına yazma.
- Finansal hesaplamaları JSX içine yazma.
- Saf iş kurallarını `src/domain` altında tut.
- Harici altyapı kurulumunu `src/lib` altında tek noktada yönet.
- Her küçük iş için gereksiz klasör veya soyutlama oluşturma.

---

## 10. Android ve iOS zorunluluğu

Her özellik Android ve iOS için değerlendirilmelidir.

Kontrol edilecek alanlar:

- Safe area
- Klavye davranışı
- Android geri düğmesi
- iOS geri kaydırma hareketi
- Tarih seçici
- Sayısal klavye
- Türkçe ondalık ayırıcı
- Derin bağlantılar
- Güvenli oturum saklama
- Sistem teması
- Durum çubuğu
- Alt menü
- Erişilebilirlik
- Uygulamanın arka plana gidip gelmesi

Yalnızca Android'de çalışan özellik tamamlanmış sayılmaz.
Yalnızca iOS'ta çalışan özellik tamamlanmış sayılmaz.

Platforma özel kod gerekirse:

- Önce ortak çözüm olup olmadığını kontrol et.
- Neden platforma özel kod gerektiğini açıkla.
- Aynı işin gereksiz iki kopyasını oluşturma.
- Android ve iOS dosyalarını ayrı test et.

---

## 11. TypeScript kuralları

- TypeScript strict yaklaşımını koru.
- `any` kullanma. Zorunluysa gerekçesini açıkla ve alanı sınırlandır.
- Harici API yanıtına doğrudan güvenme.
- Bilinmeyen dış veri için önce `unknown` kullan ve doğrula.
- Null ve undefined durumlarını açıkça yönet.
- Enum benzeri alanları izin verilen birleşim tipleriyle sınırla.
- Fonksiyonların giriş ve çıkış tiplerini anlaşılır tut.
- Veritabanı snake_case alanlarını uygulama modeline kontrollü dönüştür.
- Ekranları ham veritabanı satırlarına gereksiz bağlama.

Örnek yaklaşım:

```typescript
export type PriceStatus = 'live' | 'stale' | 'partial' | 'unavailable';
```

---

## 12. React ve React Native kuralları

- Fonksiyon bileşenleri kullan.
- İş mantığını JSX içinde büyütme.
- Hook kurallarına uy.
- Gereksiz global state oluşturma.
- Her küçük durum için yeni Context veya Provider ekleme.
- Uzun listelerde gerektiğinde `FlatList` kullan.
- Yüklenme, boş, hata, eski ve kısmi veri durumlarını tasarla.
- Gönderim sırasında butonu devre dışı bırak.
- Çift dokunmayla iki kayıt oluşmasını engelle.
- Klavye açıldığında form alanları ve ana buton erişilebilir kalmalıdır.
- Kâr ve zarar bilgisini yalnızca renkle anlatma.

---

## 13. Expo Router kuralları

Planlanan rota grupları:

```text
app/(public)/
app/(protected)/
app/(protected)/(tabs)/
```

Kurallar:

- Auth yüklenmeden kesin yönlendirme yapma.
- Oturum yüklenirken kullanıcıyı giriş ve ana ekran arasında zıplatma.
- Geçerli oturumu olan kullanıcıyı public ekranda bırakma (`PASSWORD_RECOVERY` oturumuyla açılan `/(public)/reset-password` ekranı hariç).
- Oturumu olmayan kullanıcıyı protected alana alma.
- Doğrulanmamış kullanıcıyı normal uygulama alanına alma.
- Dinamik rota parametrelerini doğrula.
- Teknik UUID hatasını kullanıcıya gösterme.
- Çıkış sonrası protected navigasyon geçmişini temizle.
- Silinen kaydın ekranına geri dönülmesini engelle.

---

## 14. Supabase istemci kuralları

- Tek Supabase istemcisi oluştur.
- İstemciyi `src/lib/supabase.ts` altında yönet.
- Ortam değişkenlerini `src/lib/environment.ts` ile doğrula.
- Her ekran içinde yeni Supabase istemcisi oluşturma.
- Ekranlara karmaşık `.from(...).select(...)` sorguları yayma.
- Veri işlemlerini ilgili servis dosyasında tut.
- Kullanıcı kimliğini formdan veya rota parametresinden güvenilir kabul etme.
- Secret veya service role anahtarını istemciye ekleme.

Mobil uygulamada bulunabilecek değerler:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_APP_ENV
```

Mobil uygulamada bulunamayacak değerler:

```text
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_PASSWORD
GOLD_PRICE_API_KEY
SMTP_PASSWORD
EMAIL_PROVIDER_SECRET
```

---

## 15. Kimlik doğrulama kuralları

- Şifreyi normal uygulama tablosunda saklama.
- Şifreyi loglama.
- Şifreyi hata izleme veya analitik hizmetine gönderme.
- Hatalı girişte hesap varlığını gereksiz açıklama.
- E-posta doğrulanmadan protected alana erişim verme.
- `disabled` veya `deletion_pending` hesabı normal aktif hesap gibi kullanma.
- Şifre sıfırlama ve e-posta doğrulama bağlantılarını Android ve iOS'ta test et.
- Oturum yenileme başarısızsa güvenli çıkış uygula.
- Çıkışta kullanıcıya ait yerel önbelleği temizle.
- Hassas hesap işlemlerinde yeniden kimlik doğrulama gereksinimini uygula.

---

## 16. Veritabanı ve migration kuralları

- Veritabanı değişikliklerini migration dosyasıyla yap.
- Production panelinde kayıtsız ve rastgele şema değişikliği yapma.
- Migrationı önce Development ortamında test et.
- Boş veritabanında sıfırdan kurulumu test et.
- Yabancı anahtarları, benzersizlikleri ve `CHECK` kısıtlarını ekle.
- Yeni tablo veya alan eklenirse `DATABASE.md` güncelle.
- API davranışı etkilenirse `API.md` güncelle.
- Kişisel veri eklenirse `PRIVACY.md` ve `DATA_RETENTION.md` güncelle.
- Migration dosyasına secret veya gerçek kullanıcı verisi yazma.

Veritabanındaki temel para ve miktar kuralları:

```text
Para       → Kuruş cinsinden BIGINT
Miktar     → NUMERIC(18,3)
Para alanı → _minor eki
```

---

## 17. RLS güvenlik kuralları

RLS, kullanıcıya ait bütün ilgili tablolarda zorunludur.

Kullanıcı:

- Yalnızca kendi profilini okuyabilir, eksikse kendi `auth.uid()` kimliğiyle oluşturabilir ve izin verilen alanları (`display_name`) güncelleyebilir.
- Yalnızca kendi tercihlerini okuyabilir, eksikse kendi `auth.uid()` kimliğiyle oluşturabilir ve yalnızca `theme` alanını güncelleyebilir.
- Yalnızca kendi portföyünü okuyabilir.
- Yalnızca kendi adına portföy kaydı oluşturabilir.
- Yalnızca kendi kaydını güncelleyebilir.
- Yalnızca kendi kaydını silebilir.
- Kendi `user_legal_events` ve `account_deletion_requests` kayıtlarını yalnızca okuyabilir (`SELECT`); bu tablolara doğrudan istemciden `INSERT`, `UPDATE` veya `DELETE` yapamaz.
- Kayıt sahibini başka kullanıcıya çeviremez.
- `account_status`, `language_code` ve `currency_code` değerlerini doğrudan değiştiremez.

Normal kullanıcı şunları değiştiremez:

```text
gold_products
price_sources
price_source_product_mappings
gold_prices
price_fetch_runs
legal_documents
security_events
```

Arayüzde butonun gizli olması güvenlik değildir. İşlem veritabanı veya güvenli sunucu tarafından reddedilmelidir.

---

## 18. İki kullanıcılı zorunlu güvenlik testi

RLS veya kullanıcı verisi değişikliğinde iki bağımsız test hesabı kullan:

```text
Kullanıcı A
Kullanıcı B
```

Şunları test et:

- A, B'nin profilini okuyamıyor.
- A, B'nin portföyünü okuyamıyor.
- A, B adına kayıt oluşturamıyor.
- A, B'nin kaydını güncelleyemiyor.
- A, B'nin kaydını silemiyor.
- A, kaydın sahibini B olarak değiştiremiyor.
- B için ters yönde aynı kontroller geçiyor.
- Normal kullanıcı fiyat yazamıyor.
- Normal kullanıcı eşleştirme değiştiremiyor.
- Normal kullanıcı `user_legal_events` ve `account_deletion_requests` tablolarına doğrudan yazamıyor, güncelleyemiyor ve silemiyor.

Bu testler yalnızca mobil arayüzde buton gizleme testi olarak yapılmamalıdır.

---

## 19. Edge Function kuralları

Planlanan temel fonksiyonlar (veya güvenli sunucu RPC işlemleri):

```text
fetch-gold-prices
record-legal-event
delete-account
```

Genel kurallar:

- Kimlik doğrulama ihtiyacını açıkça belirle.
- İstek gövdesini doğrula.
- İstemciden gelen `user_id` değerine güvenme.
- Secret değerleri yalnızca sunucu ortamından oku.
- Secret, token veya iç hata ayrıntısını yanıtta gösterme.
- Fonksiyona yalnızca gerekli tablo yetkilerini ver.
- Sonsuz tekrar deneme yapma.
- CORS ayarını gereksiz genişletme.
- Başarısızlığı başarı gibi gösterme.
- Hassas işlemde idempotent veya güvenli tekrar davranışını değerlendir.

---

## 20. Fiyat verisi kuralları

Mobil uygulama dış fiyat API'sine doğrudan bağlanmamalıdır.

Doğru akış:

```text
Yetkili Edge Function
  → Dış fiyat sağlayıcısı
  → Yanıt doğrulaması
  → Ürün eşleştirmesi
  → PostgreSQL
  → Mobil uygulama
```

Her fiyat kaydında doğrula:

- Yanıt yapısı
- Sembol
- Aktif sağlayıcı eşleştirmesi
- Alış fiyatı
- Satış fiyatı
- Para birimi
- Fiyat birimi
- Zaman damgası
- Eski veri göstergesi
- Negatif veya sıfır fiyat
- Olağan dışı fiyat değişimi

Kurallar:

- Bilinmeyen sembol otomatik ürün oluşturmaz.
- Bilinmeyen sembol tahminle başka ürüne bağlanmaz.
- Fiyat bulunamıyorsa `null` kullanılır.
- Eksik fiyat `0 TL` yapılmaz.
- Başka ürünün fiyatı sessiz yedek olarak kullanılmaz.
- Eski fiyat güncel fiyat gibi gösterilmez.

---

## 21. Altın ürün eşleştirme kuralları

Dış sağlayıcı sembolleri şu tabloyla eşleştirilir:

```text
price_source_product_mappings
```

Kurallar:

- Her sembol doğrulanmadan aktif edilmez.
- Eski ve yeni tarihli ürünler ayrı fiyatlanıyorsa ayrı ürün olur.
- Cumhuriyet Altını ile Ata Altını isim benzerliğiyle aynı kabul edilmez.
- 18 ayar, Reşat, Hamit, 1 gram ve 2,5 gram paketli ürünler doğrudan fiyat doğrulanmadan etkinleştirilmez.
- Normal gram altın fiyatı paketli ürün fiyatı olarak kullanılmaz.
- Eşleştirmenin geçmişi gerekli olduğunda fiziksel silme yerine `is_active = false` uygulanabilir.

---

## 22. Finansal hesaplama kuralları

### Satın alma

```text
Miktar × Güncel satış fiyatı
```

### Bozdurma

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

Kurallar:

- Finansal formülleri tek merkezde tut.
- Formülleri ekranlar arasında kopyalama.
- Ara işlemde gereksiz yuvarlama yapma.
- Sıfıra bölme durumunu yönet.
- Her kayıt yüzdesini toplayarak toplam yüzde üretme.
- Fiyatı olmayan kayıt için kâr-zarar üretme.
- Kısmi portföyü açıkça işaretle.
- Sayısal hassasiyet yöntemi doğrulanmadan rastgele kütüphane seçme.

---

## 23. Portföy kuralları

Her alış ayrı kayıttır.

Zorunlu alanlar:

```text
Altın ürünü
Miktar veya adet
Alış tarihi
Ödenen toplam tutar
```

İsteğe bağlı alanlar:

```text
Alış yeri
Kullanıcı notu
İşçilik dâhil bilgisi
```

Kurallar:

- Kullanıcı ürün adını serbest metinle yazmaz.
- Adetli üründe miktar pozitif tam sayıdır.
- Gram üründe azami üç ondalık basamak kullanılır.
- Alış tarihi gelecekte olamaz.
- Maliyet sıfır veya negatif olamaz.
- Kullanıcı notu azami 500 karakterdir.
- Alış yeri azami 100 karakterdir.
- Güncel değer ve kâr-zarar ana portföy verisi olarak kalıcı saklanmaz.
- Fiyat yoksa kayıt kaybolmaz.

---

## 24. Hesap silme kuralları

Hesap silme hassas işlemdir.

Zorunlu akış:

```text
1. Kullanıcı oturumunu doğrula
2. Yeniden kimlik doğrulama yap
3. Kullanıcı kimliğini token üzerinden al
4. Silme talebi oluştur
5. Hesabı deletion_pending yap
6. Portföy ve tercihleri sil
7. Yasal ve güvenlik kayıtlarını saklama politikasına göre işle
8. Profil ve Auth hesabını sil
9. Aktif oturumları kapat
10. Yerel önbelleği temizle
11. Sonucu doğrula
12. Kullanıcıyı bilgilendir
```

Kurallar:

- İstek gövdesindeki serbest `user_id` değerini kullanma.
- Yalnızca hesabı pasifleştirmeyi silme olarak gösterme.
- İşlem tamamlanmadan başarı mesajı gösterme.
- Kısmi başarısızlığı gizleme.
- Başka kullanıcının verisini etkilemediğini test et.
- Yedek ve üçüncü taraf kopyalarını `DATA_RETENTION.md` ile uyumlu yönet.

---

## 25. Gizlilik kuralları

V1'de gerekli temel kişisel veriler dışındaki verileri toplama.

Toplanmayacak veriler:

```text
TC kimlik numarası
Açık adres
Telefon rehberi
Kesin konum
Kamera veya galeri
Mikrofon
Biyometrik veri
Sağlık verisi
IBAN
Banka hesabı
Kredi kartı bilgileri
Reklam kimliği
```

Yeni kişisel veri veya üçüncü taraf hizmet eklenirse koddan önce:

1. `PRIVACY.md` güncellenir.
2. `DATA_RETENTION.md` güncellenir.
3. `SECURITY.md` güncellenir.
4. Gerekirse `DATABASE.md` ve `API.md` güncellenir.
5. `DECISIONS.md` içine karar yazılır.
6. `TODO.md` ve `CHANGELOG.md` güncellenir.

---

## 26. Veri saklama kuralları

- Kesin hukuki süre uydurma.
- Her veri için amaç, hukuki sebep, başlangıç olayı ve imha yöntemi belirle.
- Hesap verisi hesap yaşamı boyunca tutulabilir, hesap silmede ilgili politika uygulanır.
- Portföy kaydı kullanıcı silene veya hesap silinene kadar tutulur.
- Oturum belirteçleri geçicidir.
- Yasal ve güvenlik kayıtlarının süreleri hukuk uzmanıyla kesinleşmeden süresiz tutulmaz.
- Fiyat geçmişi sağlayıcı lisansı doğrulanmadan uzun süre saklanmaz.
- Yedekleri silme politikasının dışında bırakma.
- Production verisini Development ortamına kopyalama.
- Gerçek test verisini iş bitince gereksiz yere tutma.

---

## 27. Loglama kuralları

Loglanabilecekler:

- Güvenli hata kodu
- İşlem türü
- Hassas olmayan takip kimliği
- İşlem süresi
- Ortam adı
- İşlenen ve reddedilen ürün sayısı

Loglanmayacaklar:

```text
Şifre
Şifre tekrarı
Erişim belirteci
Yenileme belirteci
API anahtarı
Veritabanı şifresi
Tam portföy
Kullanıcı notunun tamamı
Gereksiz e-posta adresi
Auth callback gizli parametreleri
```

Ham istek veya yanıt gövdesini production loguna gelişigüzel yazma.

---

## 28. Hata yönetimi kuralları

Ortak hata yaklaşımı kullan:

```text
code
userMessage
retryable
requestId
```

Kullanıcıya şunları gösterme:

- SQL sorgusu
- Stack trace
- Başka kullanıcının kimliği
- Secret veya token
- Ham sağlayıcı header'ları
- İç sistem ayrıntıları

Hata sessizce yutulmamalıdır. Kullanıcıya güvenli ve ne yapabileceğini anlatan Türkçe mesaj gösterilmelidir.

---

## 29. Tema ve erişilebilirlik kuralları

Tema seçenekleri:

```text
light
dark
system
```

Kurallar:

- Renkleri ekran dosyalarına dağıtma.
- Tema değerlerini `src/theme` altında yönet.
- Açık ve koyu temada kontrastı kontrol et.
- Kâr ve zararı yalnızca renk ile anlatma.
- İkon düğmelerine erişilebilir ad ekle.
- Dokunma alanlarını yeterli büyüklükte tut.
- Büyük yazı boyutunda ekranın bozulmadığını kontrol et.
- Alış ve satış fiyatlarını ekran okuyucu için açık biçimde etiketle.
- Form hata mesajlarını ilgili alanla ilişkilendir.

---

## 30. Bağımlılık ekleme kuralları

Yeni paket eklemeden önce:

1. Çözdüğü problemi açıkla.
2. Mevcut Expo veya JavaScript özelliğiyle çözülüp çözülemeyeceğini kontrol et.
3. Expo sürümüyle uyumunu doğrula.
4. Android desteğini doğrula.
5. iOS desteğini doğrula.
6. Bakım durumunu ve son sürümlerini incele.
7. Bilinen güvenlik açıklarını kontrol et.
8. Lisansını kontrol et.
9. Paket boyutu ve gereksiz bağımlılık etkisini değerlendir.
10. Önemli karar ise `DECISIONS.md` güncelle.

Kullanıcıya paket kurulurken:

- Komutu tam olarak ver.
- Komutun hangi terminalde çalışacağını yaz.
- Beklenen sonucu belirt.
- Paket kurulumu sonrası test komutunu ver.

---

## 31. Git çalışma kuralları

- Değişiklikten önce `git status` kontrol et.
- Çalışan sürümü korumadan büyük değişiklik yapma.
- Her commit tek ve anlaşılır amaç taşımalıdır.
- Gizli `.env` dosyalarını commit etme.
- Gerçek kullanıcı verisini Git'e ekleme.
- Kilit dosyasını koru.
- Otomatik oluşturulan büyük dosyaları gereksiz commit etme.
- Commit atmadan önce testleri çalıştır.
- Başarısız testli işi tamamlanmış commit olarak sunma.
- Kullanıcı istemeden force push, hard reset veya geçmiş silme yapma.
- Tehlikeli Git komutundan önce sonuç ve geri dönüş riskini açıkla.

Secret Git'e girerse yalnızca dosyayı silme:

1. Secret'ı iptal et.
2. Yeni secret üret.
3. Kullanım kayıtlarını incele.
4. Geçmişi güvenli yöntemle temizle.
5. Olayı kaydet.

---

## 32. Test kuralları

Her görev için mümkün olan en küçük ilgili testi çalıştır.

### Birim testleri

Öncelikli alanlar:

- Para dönüştürme
- Miktar doğrulama
- Satın alma hesabı
- Bozdurma hesabı
- Kâr-zarar
- Yüzde
- Kısmi toplam
- Fiyat güncelliği
- Hata dönüştürme

### Entegrasyon testleri

- Auth
- Portföy CRUD
- Fiyat sorguları
- Yasal belgeler
- Edge Functions
- Hesap silme

### Güvenlik testleri

- İki kullanıcılı RLS testleri
- Yönetim tablolarına yazma engeli
- Secret taraması
- Hesap silme yetkilendirmesi

### Cihaz testleri

- Android fiziksel cihaz
- iPhone veya geçerli TestFlight süreci

Test çalıştırılmadıysa açıkça `Test çalıştırılmadı` yaz. Testi çalıştırmış gibi gösterme.

---

## 33. Test sonucu raporlama biçimi

Görev sonunda şu biçimi kullan:

```text
Değiştirilen dosyalar:
- ...

Çalıştırılan kontroller:
- TypeScript: Başarılı/Başarısız/Çalıştırılmadı
- Lint: Başarılı/Başarısız/Çalıştırılmadı
- Birim testleri: Başarılı/Başarısız/Çalıştırılmadı
- Entegrasyon: Başarılı/Başarısız/Çalıştırılmadı
- Android: Başarılı/Başarısız/Çalıştırılmadı
- iOS: Başarılı/Başarısız/Çalıştırılmadı
- Güvenlik: Başarılı/Başarısız/Çalıştırılmadı

Açık sorunlar:
- ...

Sıradaki görev:
- ...
```

---

## 34. Dokümantasyon güncelleme kuralları

Bir görev tamamlandığında ilgili belgeleri güncelle:

- Görev durumu için `TODO.md`
- Gerçekleşen değişiklik için `CHANGELOG.md`
- Yeni veya çözülen sorun için `KNOWN_ISSUES.md`
- Önemli karar için `DECISIONS.md`
- Proje aşaması için `PROJECT_CONTEXT.md`
- Son oturum durumu için `HANDOFF.md`
- Mimari değişiklik için `ARCHITECTURE.md`
- Şema değişikliği için `DATABASE.md`
- API değişikliği için `API.md`
- Güvenlik değişikliği için `SECURITY.md`
- Kişisel veri değişikliği için `PRIVACY.md`
- Saklama değişikliği için `DATA_RETENTION.md`

Belgeleri güncellemeden işi tamamen bitmiş sayma.

---

## 35. V1 kapsamı dışında tutulacaklar

Kullanıcı açıkça kapsam değişikliği istemeden şu özellikleri ekleme:

```text
Favoriler
Fiyat alarmları
Anlık bildirimler
Fiyat grafikleri
Portföy grafikleri
Altın haberleri
Yapay zekâ fiyat tahmini
Yatırım tavsiyesi
Google ile giriş
Apple ile giriş
Telefon numarasıyla giriş
Satış geçmişi
Kısmi satış
Gerçekleşmiş kazanç hesabı
PDF veya Excel dışa aktarma
Kamera ile fiş tarama
Konum ve harita
Kuyumcu bulma
Mesajlaşma
Sosyal özellikler
Reklam
Premium üyelik
Uygulama içi ödeme
Çoklu dil
Çoklu para birimi
Web uygulaması
Gelişmiş yönetici paneli
```

Yeni kapsam isteğinde önce etkileri açıkla ve gerekli belgeleri güncelle.

---

## 36. Yapılmaması gerekenler

- Kullanıcının teknik bilgiye sahip olduğunu varsayma.
- Belge okumadan büyük değişiklik yapma.
- Çalışan kodu gereksiz yere yeniden yazma.
- Gereksiz paket kurma.
- Secret değerleri istemciye koyma.
- Gerçek anahtarı örnek dosyaya yazma.
- İstemciden gelen `user_id` değerine güvenme.
- RLS olmadan kullanıcı verisi tablosu açma.
- Fiyat yokken `0 TL` gösterme.
- Eski fiyatı canlı fiyat gibi gösterme.
- Belirsiz altın ürünlerini tahminle eşleştirme.
- Finansal formülleri farklı ekranlarda kopyalama.
- Test etmeden tamamlandı deme.
- Android çalışıyor diye iOS'u varsayma.
- Hukuki süre veya yükümlülük uydurma.
- Taslak hukuk metnini production metni olarak sunma.
- Gerçek olmayan commit, build veya test sonucu yazma.
- Büyük mimari kararı sessizce verme.
- V2 özelliklerini V1'e karıştırma.

---

## 37. Tehlikeli işlemler

Aşağıdaki işlemlerde ekstra dikkat göster:

- Production migration
- Tablo veya kolon silme
- Portföy kayıtlarını toplu silme
- Auth kullanıcılarını silme
- RLS politikasını kapatma
- Secret değiştirme
- Git geçmişini yeniden yazma
- Force push
- Development verisini Production'a taşıma
- Yedekten geri yükleme
- Hesap silme fonksiyonu

Bu işlemlerden önce:

1. Etkiyi açıkla.
2. Hedef ortamı doğrula.
3. Yedeği ve geri dönüş planını kontrol et.
4. En küçük kapsamda uygula.
5. Sonucu doğrula.
6. Belgeleri güncelle.

---

## 38. Komut verme kuralları

Terminal komutu verirken:

- İşletim sistemini bilmeden platforma özel komut verme.
- Komutun proje kökünde mi başka klasörde mi çalışacağını yaz.
- Birden fazla komutu tek satırda gereksiz birleştirme.
- Tehlikeli komutu açıklamadan verme.
- Kullanıcıdan çıktının hangi bölümünü paylaşacağını belirt.
- Başarılı çıktının yaklaşık nasıl görüneceğini açıkla.
- Komut hata verirse bir sonraki güvenli kontrolü söyle.

Örnek:

```text
Visual Studio Code üst menüsünden Terminal > New Terminal seçeneğine tıkla.
Terminal satırının sonunda altin-iz klasörünün adını gördüğünden emin ol.
Aşağıdaki komutu yaz ve Enter tuşuna bas:

npm run typecheck

Beklenen sonuç: TypeScript hata listesi göstermeden komutun tamamlanmasıdır.
```

---

## 39. Dosya oluşturma kuralları

Yeni dosya oluştururken kullanıcıya:

1. Hangi klasörün açılacağını
2. Yeni dosya düğmesinin nerede olduğunu
3. Dosyanın tam adını
4. Dosyaya eklenecek tam içeriği
5. Dosyanın nasıl kaydedileceğini
6. Sonrasında hangi komutun çalıştırılacağını
7. Beklenen sonucu

sırayla açıkla.

Dosya adında büyük-küçük harf farkına dikkat et.

---

## 40. Hata çözme yaklaşımı

Bir hata oluştuğunda:

1. Kullanıcıyı suçlama.
2. Önce tam hata metnini ve hangi adımda oluştuğunu belirle.
3. İlgili dosyayı ve mevcut kodu oku.
4. Rastgele paket kurarak hatayı kapatmaya çalışma.
5. Tek seferde bir kök nedeni test et.
6. Çalışan alanları bozmadan küçük düzeltme yap.
7. Düzeltmeden sonra aynı hatayı yeniden test et.
8. Yeni hata oluşturulmadığını kontrol et.
9. Sorun devam ediyorsa `KNOWN_ISSUES.md` içine ekle.

Kullanıcıdan yalnızca gerekli bilgiyi iste:

- Hatanın tam metni
- Terminalin son ilgili satırları
- Hangi komutun çalıştırıldığı
- Hangi dosyanın değiştirildiği
- Gerekirse kişisel veri içermeyen ekran görüntüsü

Secret, şifre veya token isteme.

---

## 41. Güncel bilgi doğrulama

Expo, React Native, Supabase, Google Play ve App Store süreçleri zamanla değişebilir.

Bu nedenle:

- Kurulum komutlarını güncel resmî belgelerden doğrula.
- Paket sürümlerini varsayma.
- Eski blog yazısını tek kaynak olarak kullanma.
- Mağaza gereksinimlerini yayımlama öncesi yeniden kontrol et.
- KVKK ve ilgili hukuk konularını hukuk uzmanına yönlendir.
- Gerçek sağlayıcı API yanıtını görmeden alan veya sembol uydurma.

---

## 42. Finansal kullanıcı metinleri

Uygulama ve açıklamalarda şu ifadeleri kullanma:

```text
Kesin yükselecek
Şimdi satın al
Garanti kazanç
En iyi yatırım
Şu tarihte sat
```

Gerekli bilgilendirme:

```text
Uygulamada gösterilen fiyatlar ve hesaplamalar yalnızca bilgilendirme amaçlıdır. Fiyatlar kuyumcu, banka, piyasa koşulları, alış-satış farkı ve işçilik nedeniyle değişebilir. Gösterilen bilgiler yatırım danışmanlığı veya kesin alım-satım fiyatı niteliğinde değildir.
```

---

## 43. Görevi tamamlanmış sayma koşulları

Bir teknik görev ancak aşağıdakiler sağlandığında tamamlanmış sayılır:

- İstenen davranış uygulanmış.
- İlgili dosyalar derleniyor.
- TypeScript hatası yok.
- İlgili testler geçiyor.
- Android davranışı test edilmiş veya açıkça bekliyor olarak yazılmış.
- iOS davranışı test edilmiş veya açıkça bekliyor olarak yazılmış.
- Güvenlik etkisi kontrol edilmiş.
- Gizlilik ve saklama etkisi kontrol edilmiş.
- Açık hata gizlenmemiş.
- İlgili belgeler güncellenmiş.
- Çalışan sürüm Git'e kaydedilmiş veya Git henüz yoksa bu durum açıkça belirtilmiş.
- `HANDOFF.md` güncellenmiş.

---

## 44. Oturum sonunda verilecek özet

Her çalışma sonunda kullanıcıya kısa ve somut olarak şunları bildir:

```text
Tamamlanan iş:
Değiştirilen dosyalar:
Yeni dosyalar:
Kurulan paketler:
Çalıştırılan testler:
Android sonucu:
iOS sonucu:
Güvenlik sonucu:
Açık sorunlar:
Git commit:
Sıradaki tek görev:
```

Gerçek olmayan test veya commit bilgisi yazma.

---

## 45. Mevcut proje durumu

Bu dosyanın ilk taslağı hazırlanırken:

```text
Proje aşaması: Planlama ve dokümantasyon
Expo projesi: Henüz oluşturulmadı
Uygulama kodu: Henüz yok
Supabase projesi: Henüz oluşturulmadı
Git deposu: Henüz oluşturulmadı
Gerçek API hesabı: Henüz oluşturulmadı
Android testi: Başlamadı
iOS testi: Başlamadı
Gerçek kullanıcı verisi: Yok
```

Bu bilgiler proje ilerledikçe `HANDOFF.md` ve `PROJECT_CONTEXT.md` üzerinden güncel olarak okunmalıdır.

---

## 46. Sürüm geçmişi

### 1.1 Taslak - 19.10.2026

- `user_legal_events` ve `account_deletion_requests` için doğrudan istemci yazma yasağı RLS ve güvenlik testi kurallarına eklendi.
- `user_preferences` güncelleme yetkisi `theme` alanıyla sınırlandırıldı.
- `record-legal-event` güvenli sunucu işlemi fonksiyon listesine eklendi.

### 1.0 Taslak - 03.09.2026

- Başlangıç seviyesine uygun anlatım kuralları eklendi.
- Proje belgelerinin okuma sırası tanımlandı.
- Görev, dosya düzenleme ve raporlama düzeni oluşturuldu.
- Android ve iOS uyumluluk zorunluluğu kaydedildi.
- TypeScript, React Native, Expo Router ve Supabase kuralları eklendi.
- Veritabanı, migration ve RLS güvenliği tanımlandı.
- Edge Function, fiyat verisi ve ürün eşleştirme kuralları eklendi.
- Finansal hesaplama ve portföy kuralları kaydedildi.
- Hesap silme, gizlilik ve veri saklama kuralları eklendi.
- Loglama, hata yönetimi, bağımlılık ve Git kuralları eklendi.
- Test, dokümantasyon ve görev tamamlanma ölçütleri tanımlandı.
- V1 kapsam dışı özellikler ve yapılmaması gerekenler kaydedildi.
