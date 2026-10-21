# Altın İz Mimari ve Ürün Kararları

**Belge adı:** `DECISIONS.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.1  
**Son güncelleme:** 19.10.2026  
**Durum:** Aktif

---

## 1. Belgenin amacı

Bu belge, Altın İz projesinde alınan önemli ürün, teknoloji, mimari, güvenlik ve veri kararlarını kaydeder.

Amaçları:

- Aynı kararların her yapay zekâ oturumunda yeniden tartışılmasını önlemek
- Proje mimarisinin sebepsiz yere değiştirilmesini engellemek
- Bir kararın neden alındığını açıklamak
- Değişen kararların geçmişini korumak
- Kod ile proje belgeleri arasında tutarlılık sağlamak
- Android ve iOS uyumluluğunu kalıcı bir gereksinim olarak korumak
- KVKK ve mağaza politikalarının sonradan eklenen işler hâline gelmesini önlemek

Bir karar değiştiğinde eski bölüm silinmez. Eski kararın durumu `Değiştirildi` veya `İptal` olarak güncellenir ve yeni karar ayrı numarayla eklenir.

---

## Karar durumları

```text
Öneri          → Henüz kesinleşmedi
Koşullu Aktif  → Kullanılacak, ancak belirtilen şartların doğrulanması gerekiyor
Aktif          → Projede uygulanması gereken güncel karar
Değiştirildi   → Daha yeni bir karar tarafından değiştirildi
İptal          → Artık uygulanmayacak
```

---

# ADR-001: Mobil uygulama altyapısı

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Altın İz mobil uygulaması aşağıdaki teknolojilerle geliştirilecektir:

```text
React Native
Expo
TypeScript
Expo Router
```

## Neden

- Android ve iOS için ortak kod tabanı kullanılabilir.
- Başlangıç seviyesindeki kullanıcı için kurulum ve test süreci sadeleştirilebilir.
- Expo ile gerçek telefonda hızlı test yapılabilir.
- Expo Router çok sayfalı uygulama yapısını düzenli hâle getirir.
- TypeScript, veri türü hatalarını geliştirme aşamasında yakalamaya yardımcı olur.
- Yapay zekâ araçlarının React Native, Expo ve TypeScript desteği güçlüdür.
- EAS Build ile Android ve iOS üretim çıktıları alınabilir.

## Sonuçları

- Uygulama kodunda TypeScript kullanılacaktır.
- Android ve iOS uyumluluğu her özellikte ayrı kontrol edilecektir.
- Yalnızca bir platformda çalışan özellik tamamlanmış sayılmayacaktır.
- Expo'nun desteklemediği zorunlu bir yerel özellik ortaya çıkarsa karar yeniden değerlendirilecektir.

## Yeniden değerlendirme koşulu

- Expo'nun desteklemediği zorunlu yerel özellik ortaya çıkması
- Güvenlik veya mağaza gereksinimlerinin karşılanamaması
- Gerekli bir üçüncü taraf kütüphanenin iki platformda çalışmaması

---

# ADR-002: Backend ve kullanıcı hesabı altyapısı

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Altın İz V1 için aşağıdaki backend yapısı kullanılacaktır:

```text
Supabase PostgreSQL
Supabase Auth
PostgreSQL Row Level Security
Supabase güvenli sunucu fonksiyonları veya Edge Functions
```

## Neden

- `DATABASE.md` ilişkisel PostgreSQL yapısına göre tasarlanmıştır.
- Kullanıcı hesabı, e-posta doğrulama ve şifre sıfırlama özellikleri sağlanabilir.
- Kullanıcı verileri satır düzeyi güvenlikle ayrılabilir.
- Yabancı anahtarlar, kısıtlar ve hassas sayısal veri türleri kullanılabilir.
- Expo ve TypeScript uygulamasıyla bütünleştirilebilir.
- V2 tabloları mevcut yapı bozulmadan eklenebilir.

## Güvenlik koşulları

- Kullanıcıya ait bütün tablolarda RLS uygulanacaktır.
- Mobil uygulamaya service role veya secret anahtar konulmayacaktır.
- Veritabanı şifresi mobil uygulamada bulunmayacaktır.
- Kullanıcı kimliği güvenli oturumdan alınacaktır.
- Mobil istemcinin gönderdiği serbest `user_id` değerine güvenilmeyecektir.
- Yönetici yetkisi gereken işlemler güvenli sunucu fonksiyonlarında çalışacaktır.

## Yeniden değerlendirme koşulu

- Veri konumu veya sözleşme şartlarının zorunlu gereksinimleri karşılamaması
- Maliyetin proje için sürdürülemez olması
- RLS veya kimlik doğrulama ihtiyaçlarının karşılanamaması
- Hukuki değerlendirmede başka altyapının zorunlu görülmesi

---

# ADR-003: Altın fiyatı veri sağlayıcısı

**Tarih:** 03.09.2026  
**Durum:** Koşullu Aktif

## Karar

Birincil fiyat sağlayıcısı adayı:

```text
AltinAPI
```

Yedek sağlayıcı adayı:

```text
Altinapps
```

AltinAPI, ücretsiz deneme hesabıyla gerçek yanıtlar ve semboller doğrulanmadan üretim sağlayıcısı olarak kesin kabul edilmeyecektir.

## Zorunlu doğrulamalar

- Gerçek ürün ve sembol listesi
- Alış ve satış alanlarının anlamı
- Fiyat zamanı
- Para birimi
- Ürün birimi
- Eski veri bildirimi
- Ticari mobil uygulamada gösterim hakkı
- Veritabanında geçici veya geçmiş fiyat saklama hakkı
- Kaynak gösterme zorunluluğu
- Kota ve ücretler
- Hizmet kesintisi davranışı

## Neden

- Türkiye piyasasına ait gram ve sarrafiye fiyatları gereklidir.
- Alış ve satış fiyatlarının ayrı verilmesi gerekir.
- Eski ve yeni tarihli ürünlerin ayrılması gerekir.
- Portföy hesaplamaları için güvenilir alış fiyatı gereklidir.

## Ürün kuralı

Doğrudan ve doğrulanmış fiyatı bulunmayan ürün:

```text
price_display_enabled = false
calculator_enabled = false
portfolio_enabled = false
```

olarak tutulacaktır.

Başka bir ürünün fiyatı sessiz biçimde kullanılmayacaktır.

## Yeniden değerlendirme koşulu

- Ticari kullanım izni verilmemesi
- Gerekli ürünlerin desteklenmemesi
- Fiyatların güvenilir olmaması
- API hizmetinin kararsız olması
- Maliyet veya kota şartlarının uygun olmaması

---

# ADR-004: Fiyat entegrasyon yöntemi

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

V1'de fiyatlar REST API ile güvenli sunucu tarafından çekilecektir.

```text
Zamanlanmış Sunucu İşlemi
        ↓
Dış Fiyat API'si
        ↓
Doğrulama ve Ürün Eşleştirme
        ↓
Supabase PostgreSQL
        ↓
Mobil Uygulama
```

V1'de WebSocket kullanılmayacaktır.

## Neden

- Altın İz alım-satım yapılan gerçek zamanlı borsa uygulaması değildir.
- Saniyelik fiyat akışı V1 için gerekli değildir.
- REST entegrasyonu daha basit ve düşük maliyetlidir.
- Mobil cihazın pil ve bağlantı tüketimi azalır.
- Dış API anahtarı mobil uygulamadan uzak tutulur.
- Bütün kullanıcılar ortak doğrulanmış fiyatları okuyabilir.

## Kurallar

- Her kullanıcı için ayrı dış API isteği yapılmayacaktır.
- Mümkünse bütün semboller tek istekle alınacaktır.
- Ücretsiz deneme kotası geliştirme sırasında kontrollü kullanılacaktır.
- Üretim sıklığı sağlayıcı sözleşmesi ve kota doğrulandıktan sonra kesinleştirilecektir.

---

# ADR-005: API anahtarlarının korunması

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Aşağıdaki gizli bilgiler mobil uygulamaya konulmayacaktır:

```text
Supabase secret key
Supabase service role key
Veritabanı şifresi
Altın fiyat API anahtarı
SMTP şifresi
E-posta hizmeti gizli anahtarı
```

## Uygulamada bulunabilecek değerler

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_APP_ENV
```

## Kurallar

- Gizli değerler Git deposuna gönderilmeyecektir.
- `.env.example` yalnızca değişken adlarını içerecektir.
- Gizli bilgiler hata mesajı veya günlüklerde bulunmayacaktır.
- Anahtar sızarsa iptal edilip yenilenecektir.
- Anahtar değişimi mobil uygulama güncellemesi gerektirmeyecek şekilde tasarlanacaktır.

---

# ADR-006: Çok kullanıcılı veri güvenliği

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Her kullanıcı yalnızca kendi özel verilerine erişecektir.

Özel kullanıcı verileri:

```text
user_profiles
user_preferences
portfolio_entries
user_legal_events
account_deletion_requests
```

## Portföy sahiplik kuralı

```text
portfolio_entries.user_id = doğrulanmış oturumdaki kullanıcı kimliği
```

## Zorunlu testler

İki ayrı test hesabı oluşturulacaktır:

```text
Test Kullanıcısı A
Test Kullanıcısı B
```

Kontroller:

- A, B'nin portföyünü okuyamamalıdır.
- A, B adına kayıt oluşturamamalıdır.
- A, B'nin kaydını değiştirememelidir.
- A, B'nin kaydını silememelidir.
- B için de aynı kurallar geçerli olmalıdır.

## Tamamlanma koşulu

Yalnızca mobil arayüzde görünmemesi yeterli değildir. Yetkisiz işlemler veritabanı tarafından da reddedilmelidir.

---

# ADR-007: Para saklama biçimi

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Türk lirası tutarları kuruş cinsinden `BIGINT` olarak saklanacaktır.

```text
48.000,00 TL = 4.800.000 kuruş
```

Alan adları `_minor` eki kullanacaktır.

```text
total_cost_minor
buy_price_minor
sell_price_minor
```

## Neden

- Kayan noktalı sayı hassasiyet sorunlarını azaltır.
- Para toplamları daha güvenilir hesaplanır.
- Veri tabanı ve API katmanında ortak biçim sağlar.

## Kurallar

- Para değeri kullanıcıya iki ondalık basamakla gösterilir.
- Negatif veya sıfır portföy maliyeti kabul edilmez.
- Ara hesaplamalarda gereksiz yuvarlama yapılmaz.
- Kullanıcıya gösterme aşamasında Türk lirası biçimlendirmesi yapılır.

---

# ADR-008: Portföy temel veri modeli

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Her altın alış işlemi ayrı `portfolio_entries` kaydı olarak saklanacaktır.

Zorunlu alanlar:

```text
product_id
quantity
purchase_date
total_cost_minor
```

İsteğe bağlı alanlar:

```text
purchase_place
note
labor_included
```

## Neden

- Aynı altın farklı tarihlerde ve farklı fiyatlarla alınabilir.
- Her alışın maliyeti ayrı takip edilebilir.
- Kullanıcının gerçek alış geçmişi korunur.
- Daha sonra satış ve ortalama maliyet özellikleri eklenebilir.

## Kurallar

- Aynı ürün kayıtları otomatik birleştirilmeyecektir.
- Kullanıcı serbest metinle ürün adı yazmayacaktır.
- Ürün `gold_products` tablosundan seçilecektir.
- Kullanıcı kimliği formdan değil güvenli oturumdan alınacaktır.
- Kayıt kullanıcının kendi isteğiyle oluşturulacaktır.

---

# ADR-009: Miktar ve ölçü birimi

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Miktar `NUMERIC(18,3)` türündeki tek `quantity` alanında saklanacaktır.

Ölçü birimi ürün kataloğundan belirlenecektir:

```text
piece
gram
ounce
```

## Kurallar

- Adetli ürünlerde yalnızca pozitif tam sayı kabul edilir.
- Gram ürünlerde azami üç ondalık basamak kabul edilir.
- Birim kullanıcı tarafından elle değiştirilemez.
- Ons Altın V1'de portföye eklenmez.
- Paketli gram ürünleri adetle takip edilir.

---

# ADR-010: Portföy değerleme yöntemi

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Portföydeki altınların tahmini değeri güncel alış fiyatıyla hesaplanacaktır.

```text
Tahmini Güncel Bozdurma Değeri = Miktar × Güncel Alış Fiyatı
```

```text
Tahmini Kâr/Zarar = Tahmini Güncel Bozdurma Değeri - Ödenen Toplam Tutar
```

```text
Değişim Yüzdesi = (Tahmini Kâr/Zarar ÷ Ödenen Toplam Tutar) × 100
```

## Neden

Kullanıcı elindeki altını bozdururken piyasanın kullanıcıdan alış fiyatı yaklaşık baz alınır.

## Gösterim adı

```text
Tahmini Güncel Bozdurma Değeri
```

Yalnızca `Güncel Değer` yazılmayacaktır.

## Kurallar

- Sonuç yatırım tavsiyesi değildir.
- Kuyumcu, banka, şehir, ürün durumu ve işçilik farkı gerçek sonucu değiştirebilir.
- Kullanıcıya kesin elde edeceği tutar izlenimi verilmez.

---

# ADR-011: Hesaplama ekranı fiyat kuralları

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

```text
Satın Alacağım → Güncel satış fiyatı
Bozduracağım  → Güncel alış fiyatı
```

Formüller:

```text
Tahmini Satın Alma Tutarı = Miktar × Güncel Satış Fiyatı
```

```text
Tahmini Bozdurma Tutarı = Miktar × Güncel Alış Fiyatı
```

## Kurallar

- Kullanılan fiyat türü ekranda gösterilir.
- Son fiyat zamanı ekranda gösterilir.
- Fiyat yoksa hesap yapılmaz.
- Hesaplanan piyasa tutarı portföye gerçek maliyet olarak otomatik yazılmaz.
- Kullanıcı portföye eklerken gerçekten ödediği tutarı kendisi girer.

---

# ADR-012: Hesaplanan değerlerin saklanmaması

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Aşağıdaki alanlar `portfolio_entries` tablosunda ana gerçek veri olarak saklanmayacaktır:

```text
current_price_minor
current_value_minor
profit_loss_minor
profit_loss_percentage
```

## Neden

Fiyatlar değiştikçe bu sonuçlar eskiyecektir. Sonuçlar geçerli fiyat ile temel portföy verisinden yeniden üretilecektir.

## İstisna

İleride performans amacıyla önbellek veya günlük portföy görüntüsü oluşturulabilir. Bu veriler temel gerçek kayıt olarak kabul edilmeyecektir.

---

# ADR-013: Fiyat bulunamadığında davranış

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Fiyat bulunamayan ürün `0 TL` kabul edilmeyecektir.

Kullanıcıya:

```text
Fiyat bilgisi alınamadı
```

gösterilecektir.

## Portföy toplamı

Bir veya daha fazla kayıt hesaplanamıyorsa sonuç:

```text
Kısmi toplam
```

olarak işaretlenecektir.

Hesaplanamayan kayıtların maliyeti nedeniyle yanıltıcı toplam kâr-zarar gösterilmeyecektir.

---

# ADR-014: Eski fiyat davranışı

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Güncel fiyat alınamazsa son geçerli fiyat kullanılabilir. Ancak eski fiyat açıkça işaretlenecektir.

Gösterilecek bilgiler:

```text
Son bilinen fiyat
Fiyat tarihi ve saati
Tahmini değerlerin güncel olmayabileceği uyarısı
```

## Kurallar

- Eski fiyat canlı fiyat olarak adlandırılmaz.
- Fiyatın eski sayılacağı kesin süre sağlayıcı güncelleme sıklığı doğrulandıktan sonra belirlenir.
- Hiç geçerli fiyat yoksa hesaplama yapılmaz.

---

# ADR-015: Ürün kataloğu ve sağlayıcı eşleştirmesi

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Altın İz ürünleri `gold_products` tablosunda merkezi olarak tanımlanacaktır.

Dış sağlayıcı sembolleri şu tabloyla bağlanacaktır:

```text
price_source_product_mappings
```

## Benzersizlik kuralları

```text
(source_id, external_symbol) benzersiz
(source_id, product_id) benzersiz
```

## Kurallar

- Bilinmeyen dış sembol otomatik ürün oluşturmaz.
- Aynı dış sembol aynı sağlayıcı içinde iki ürüne bağlanmaz.
- Aynı Altın İz ürünü aynı sağlayıcı içinde iki sembole bağlanmaz.
- Sağlayıcı teknik adı kullanıcıya gösterilen ana ürün adını değiştirmez.
- Eşleştirmeler normal kullanıcılar tarafından değiştirilemez.

---

# ADR-016: Eski ve yeni tarihli sarrafiye ürünleri

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Fiyat sağlayıcısının ayrı fiyat verdiği ürünlerde eski ve yeni tarihli ürünler ayrı katalog kayıtları olacaktır.

Örnekler:

```text
Çeyrek Altın, Yeni Tarihli
Çeyrek Altın, Eski Tarihli
Yarım Altın, Yeni Tarihli
Yarım Altın, Eski Tarihli
Tam Altın, Yeni Tarihli
Tam Altın, Eski Tarihli
Ata Altın, Yeni Tarihli
Ata Altın, Eski Tarihli
Gremse Altın, Yeni Tarihli
Gremse Altın, Eski Tarihli
```

## Neden

- Alış fiyatları farklı olabilir.
- Satış fiyatları farklı olabilir.
- Kullanıcının portföy değeri yanlış hesaplanmamalıdır.

## Kurallar

- Kullanıcı belirsiz bir eski-yeni seçeneğiyle tahmini fiyat kullanmayacaktır.
- Uygulamada kısa açıklama gösterilecektir.
- Sağlayıcı ayrım yapmıyorsa ürünler gereksiz yere ayrılmayacaktır.

---

# ADR-017: Cumhuriyet Altını ve Ata Altını eşleştirmesi

**Tarih:** 03.09.2026  
**Durum:** Koşullu Aktif

## Karar

Cumhuriyet Altını, Ata Altını, Ata Lira ve benzeri isimler yalnızca ad benzerliğiyle aynı ürün kabul edilmeyecektir.

## Zorunlu doğrulamalar

- Sağlayıcının ürün tanımı
- Teknik sembol
- Ürünün sikke veya ziynet türü
- Adet veya gram birimi
- Eski-yeni ayrımı
- Kullanıcıya gösterilecek doğru Türkçe ad

Doğrulama yapılana kadar belirsiz ürün portföy ve hesaplama için etkinleştirilmeyecektir.

---

# ADR-018: 14, 18 ve 22 ayar ürünler

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Ayar bazlı ürün yalnızca sağlayıcıdan doğrudan güvenilir alış ve satış fiyatı geliyorsa etkinleştirilecektir.

## Kurallar

- 14 ayar doğrudan fiyat doğrulanırsa etkinleştirilir.
- 22 ayar doğrudan fiyat doğrulanırsa etkinleştirilir.
- 18 ayar doğrudan fiyat doğrulanmadan etkinleştirilmez.
- 24 ayar gram fiyatına saflık yüzdesi uygulanarak gerçek kuyumcu fiyatı gibi gösterilmez.
- İşçilik ve kuyumcu kesintisi otomatik tahmin edilmez.

---

# ADR-019: Paketli gram altınlar

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Paketli gram altınlar adetle takip edilecektir.

Örnek:

```text
3 adet 5 gram paketli altın
```

Hesaplama:

```text
3 × 5 gram paketli ürünün doğrudan alış fiyatı
```

## Kurallar

- Normal gram altın fiyatı paketli ürün için sessizce kullanılmaz.
- Doğrudan paket fiyatı yoksa ürün portföy değerlemesine açılmaz.
- Sağlayıcı testine göre 5, 10, 20, 50 ve 100 gram ürünler etkinleştirilebilir.
- 1 ve 2,5 gram ürünler doğrudan fiyat doğrulanana kadar devre dışı kalır.

---

# ADR-020: Kullanıcı hesabı V1 kapsamı

**Tarih:** 03.09.2026  
**Durum:** Aktif

## V1'de bulunacaklar

- E-posta ve şifreyle kayıt
- E-posta doğrulama
- E-posta ve şifreyle giriş
- Şifre sıfırlama
- Güvenli oturum
- Çıkış yapma
- Hesabı ve verileri silme

## V1'de bulunmayacaklar

- Google ile giriş
- Apple ile giriş
- Facebook ile giriş
- Telefon numarasıyla giriş
- SMS doğrulaması

## Neden

İlk sürümde tek ve test edilebilir kimlik doğrulama yöntemi kullanmak karmaşıklığı azaltır.

---

# ADR-021: V1 ana sayfa yapısı

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Alt menü beş ana bölümden oluşacaktır:

```text
Ana Sayfa
Fiyatlar
Hesapla
Portföyüm
Ayarlar
```

Altın detay, portföy kaydı detayı, kayıt ekleme ve hesap silme gibi ekranlar alt menüye eklenmeyecektir.

---

# ADR-022: V1 kapsam dışı özellikler

**Tarih:** 03.09.2026  
**Durum:** Aktif

## V1'de bulunmayacaklar

```text
Favoriler
Fiyat alarmları
Anlık bildirimler
Fiyat grafikleri
Portföy grafikleri
Satış geçmişi
Kısmi satış
Gerçekleşmiş kazanç hesabı
Yapay zekâ fiyat tahmini
Yatırım tavsiyesi
Altın haberleri
Reklam
Premium üyelik
Uygulama içi ödeme
Çoklu dil
Çoklu para birimi
Kamera ve belge yükleme
Konum ve harita
Mesajlaşma
Web uygulaması
Gelişmiş yönetici paneli
```

## Neden

V1'in temel amacını güvenli ve test edilebilir biçimde tamamlamak, gereksiz kapsam büyümesini önlemek.

---

# ADR-023: Tasarım ve marka kimliği

**Tarih:** 03.09.2026  
**Durum:** Koşullu Aktif

## Çalışma adı

```text
Altın İz
```

## Slogan

```text
Altınlarını Kaydet, Değerini İzle
```

## Görsel tarz

```text
Modern
Sade
Güvenilir
Anlaşılır finans uygulaması
```

## Ana renkler

```text
Gece laciverti
Mat altın
Kırık beyaz
```

## Koşul

Uygulama yayımlanmadan önce marka, mağaza adı, alan adı ve teknik uygulama kimliği kullanılabilirliği ayrıntılı kontrol edilecektir.

---

# ADR-024: KVKK ve veri minimizasyonu

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Yalnızca uygulamanın çalışması için gerekli kişisel veriler toplanacaktır.

## V1'de gerekli olabilecek veriler

- E-posta adresi
- Kullanıcı hesap kimliği
- Portföy kayıtları
- Kullanıcı tercihleri
- Yasal belge olayları
- Sınırlı güvenlik kayıtları

## V1'de toplanmayacak veriler

- TC kimlik numarası
- Açık adres
- Telefon rehberi
- Kullanıcı fotoğrafı
- Mikrofon kaydı
- Kesin konum
- Banka hesabı
- Kredi kartı bilgisi
- Biyometrik veri

## Kurallar

- Aydınlatma metni ve açık rıza birbirine karıştırılmayacaktır.
- Açık rıza yalnızca gerçekten gerektiğinde ayrı süreç olarak alınacaktır.
- Yeni kişisel veri eklenirse `PRIVACY.md`, `DATA_RETENTION.md`, `API.md` ve `DATABASE.md` güncellenecektir.
- Mağaza beyanları uygulamanın gerçek davranışıyla aynı olacaktır.
- Yayımlama öncesi hukuk uzmanı kontrolü yapılacaktır.

---

# ADR-025: Hesap ve veri silme

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Kullanıcı hesabını ve ilişkili verilerini uygulama içinden silme işlemini başlatabilecektir.

## Akış

```text
Yeniden kimlik doğrulama
        ↓
Silme talebi
        ↓
Hesap deletion_pending
        ↓
Portföy ve tercihler silinir
        ↓
Yasal ve güvenlik kayıtları saklama kuralına göre ele alınır
        ↓
Profil ve Auth hesabı silinir
        ↓
Oturumlar kapatılır
```

## Kurallar

- Yalnızca hesabı geçici kapatma, hesap silme olarak sunulmaz.
- İşlem tamamlanmadan başarı mesajı gösterilmez.
- Hata durumlarında hesap kaybolmuş gibi gösterilmez.
- Kesin saklama ve anonimleştirme davranışı `DATA_RETENTION.md` ile belirlenir.

---

# ADR-026: Yasal belge sürümleme

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Yasal belgeler `legal_documents` tablosunda sürümlü olarak saklanacaktır.

Belge türleri:

```text
kvkk_notice
privacy_policy
terms_of_use
data_retention
financial_disclaimer
explicit_consent
```

Kullanıcı olayları ayrı `user_legal_events` tablosunda tutulacaktır.

## Kurallar

- Her belge türünün yürürlükte tek aktif sürümü bulunur.
- Aydınlatma sunumu `presented` olarak kaydedilebilir.
- Açık rıza gerekiyorsa `accepted`, `declined` ve `withdrawn` olayları ayrı yönetilir.
- Normal kullanıcı `user_legal_events` tablosuna doğrudan kayıt ekleyemez, güncelleyemez veya silemez; yasal olaylar yalnızca güvenli PostgreSQL RPC veya Edge Function üzerinden append-only olarak oluşturulur.
- Kullanımın hukuki doğruluğu hukuk uzmanı tarafından kontrol edilir.

---

# ADR-027: Çevrimdışı kullanım

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

V1'de tam çevrimdışı portföy düzenleme bulunmayacaktır.

## Fiyatlar

- Son bilinen fiyat sınırlı önbellekten gösterilebilir.
- Eski olduğu açıkça belirtilir.

## Portföy

- Yerel portföy önbelleği gerekirse güvenli ve sınırlı tutulur.
- Çıkışta özel kullanıcı önbelleği temizlenir.
- Bağlantı yokken ekleme, düzenleme veya silme başarılı olmuş gibi gösterilmez.
- Çevrimdışı işlem kuyruğu V2'ye bırakılır.

---

# ADR-028: Proje hafızası ve yapay zekâ çalışma düzeni

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Yapay zekânın proje hafızası sohbet geçmişi değil, proje belgeleri ve Git geçmişi olacaktır.

Zorunlu belgeler:

```text
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

## Kurallar

- Yapay zekâ kod yazmadan önce ilgili belgeleri okur.
- Büyük mimari değişiklikleri sessizce yapmaz.
- Her işlemi başlangıç seviyesine uygun ve Türkçe anlatır.
- Dosya yolu ve kodun konumu açıkça belirtilir.
- Mümkünse değişen dosyanın tam hâli verilir.
- Her özellik test edilir.
- Çalışan sürüm Git ile kaydedilir.
- Oturum sonunda proje belgeleri güncellenir.

---

# ADR-029: Git çalışma güvenliği

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Her önemli değişiklik öncesi ve sonrası Git kullanılacaktır.

Çalışma döngüsü:

```text
Belgeleri oku
Mevcut kodu incele
Git durumunu kontrol et
Güvenli kayıt oluştur
Küçük değişiklik yap
Android'de test et
iOS uyumluluğunu kontrol et
Hataları düzelt
Testleri çalıştır
Çalışan sürümü kaydet
Belgeleri güncelle
```


## Kurallar

- Çalışan özellikler büyük ve kontrolsüz değişikliklerle riske atılmaz.
- Gizli `.env` dosyaları Git'e eklenmez.
- Commit mesajları yapılan görevi açıklar.
- Bir özellik test edilmeden tamamlandı olarak işaretlenmez.

---

# ADR-030: Finansal bilgilendirme

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Uygulama yatırım tavsiyesi, garanti kazanç veya alım-satım sinyali sunmayacaktır.

Kullanılacak temel uyarı:

> Uygulamada gösterilen fiyatlar ve hesaplamalar yalnızca bilgilendirme amaçlıdır. Fiyatlar kuyumcu, banka, piyasa koşulları, alış-satış farkı ve işçilik nedeniyle değişebilir. Gösterilen bilgiler yatırım danışmanlığı veya kesin alım-satım fiyatı niteliğinde değildir.


## Yasaklanan ifadeler

```text
Kesin yükselecek
Şimdi satın al
Garanti kazanç
En iyi yatırım
Şu tarihte sat
```

# ADR-031: Sıfır Maliyetli (Ücretsiz) Geliştirme ve Doğrulama Stratejisi

**Tarih:** 03.09.2026  
**Durum:** Aktif

## Karar

Altın İz V1 geliştirme ve doğrulama sürecinde ücretli altyapı, ücretli API paketi veya ücretli mağaza hesabı zorunluluğu olmadan tamamen ücretsiz araç ve katmanlarla ilerlenecektir.

## Kurallar

- **Supabase:** Ücretsiz paket (Free Tier) en fazla 2 aktif projeye izin verdiği için Development ve Preview ortamları aynı test Supabase projesini paylaşabilir; Production projesi yalnızca gerçek yayına çıkılacağı zaman ikinci ücretsiz proje olarak açılır.
- **Fiyat Sağlayıcısı:** Geliştirme boyunca harici API kotası tüketilmez; yerel test/mock verisi veya manuel tetiklenen sınırlı geliştirme verisi kullanılır.
- **Android Testi:** Google Play Console ücreti ödenmeden önce Expo Go ve ücretsiz `.apk` çıktıları ile fiziksel Android cihazda test yapılır.
- **iOS Testi:** Apple Developer yıllık ücreti ödenmeden önce kod %100 iOS uyumlu yazılır ve fiziksel iPhone üzerinde Expo Go ile ücretsiz test edilir.
- **E-posta ve Hukuk:** Geliştirmede Supabase'in dahili ücretsiz e-posta servisi (veya ücretsiz SMTP katmanı) ve standart şablon yasal metinler kullanılır; ücretli avukat/marka tescili adımları kodlama engeli (blocker) sayılmaz, yalnızca mağaza yayını öncesi aşamaya bırakılır. Development ortamındaki yasal belge şablon/fixture kayıtları her zaman `"TEST METNİDİR - PRODUCTION İÇİN GEÇERLİ DEĞİLDİR"` işareti taşımalı ve Production seed işlemine dahil edilmemelidir.

---

# Açık kararlar

Aşağıdaki konular henüz tam kesinleşmemiştir:

1. Supabase veri merkezi bölgesi
2. Veri aktarımı için kesin hukuki yöntem
3. Üretim e-posta gönderim hizmeti
4. Kesin şifre politikası
5. AltinAPI ticari paket seçimi
6. Ticari yeniden gösterim ve fiyat saklama hakkı
7. Fiyatların üretimde çekilme sıklığı
8. Fiyatın ne zaman eski sayılacağı
9. Olağan dışı fiyat değişim eşiği
10. Cumhuriyet Altını ile Ata ürünlerinin kesin katalog yapısı
11. 18 Ayar ürün desteği
12. Reşat ve Hamit ürün desteği
13. Fiyat geçmişinin saklama süresi
14. Güvenlik olaylarının saklama süresi
15. Yasal olay kayıtlarının saklama ve anonimleştirme yöntemi
16. Hesap silme işlemindeki telafi yöntemi
17. Portföy hesaplamasının SQL görünümü, RPC veya servis katmanında yapılması
18. Altın İz marka adının kesin kullanılabilirliği
19. Android ve iOS teknik uygulama kimlikleri
20. Uygulama simgesinin son tasarımı

Bu kararlar kesinleştiğinde yeni ADR bölümleri eklenir veya ilgili koşullu kararların durumu `Aktif` yapılır.

---

# Sürüm geçmişi

## 1.1 - 03.09.2026

- ADR-031 ile sıfır maliyetli geliştirme ve doğrulama stratejisi eklendi.
- Development ve Preview ortamlarının ücretsiz paket kapsamında aynı test Supabase projesini paylaşabileceği kararlaştırıldı.
- Development ortamındaki şablon yasal metinlerin açık test ibaresi taşıması kuralı eklendi.

## 1.0 - 03.09.2026

- Mobil teknoloji kararı kaydedildi.
- Backend ve kullanıcı hesabı kararı kaydedildi.
- Fiyat sağlayıcısı adayları kaydedildi.
- REST fiyat entegrasyon yöntemi kaydedildi.
- Veri güvenliği ve RLS kararları kaydedildi.
- Para, miktar ve portföy hesaplama kararları kaydedildi.
- Ürün kataloğu ve sağlayıcı eşleştirme kararı kaydedildi.
- V1 kapsamı ve kapsam dışı özellikler kaydedildi.
- KVKK, hesap silme ve yasal belge kararları kaydedildi.
- Yapay zekâ ve Git çalışma düzeni kaydedildi.

---

# Belge güncelleme kuralı

Aşağıdaki durumlardan biri oluştuğunda bu belge güncellenmelidir:

- Teknoloji veya framework değişikliği
- Backend hizmeti değişikliği
- Fiyat sağlayıcısı değişikliği
- Veritabanı mimarisi değişikliği
- Hesaplama formülü değişikliği
- Yeni kişisel veri toplanması
- Kullanıcı erişim modelinin değişmesi
- V1 kapsamının değiştirilmesi
- Yeni mağaza veya hukuki gereksinim
- Hesap silme davranışının değişmesi
- Marka veya tasarım kararının değişmesi

Değişen karar silinmemeli, geçmişi korunmalı ve yeni kararın gerekçesi yazılmalıdır.
