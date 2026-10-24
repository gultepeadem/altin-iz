# Altın İz V1 API Tasarımı

**Belge adı:** `API.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.0  
**Son güncelleme:** 24.10.2026
**Durum:** V1 Supabase REST, RPC (record_user_legal_event, execute_account_deletion) ve Edge Function sözleşmeleriyle eşitlendi ve doğrulandı  
**Mobil istemci:** React Native + Expo + TypeScript  
**Backend:** Supabase  
**Fiyat sağlayıcısı adayı:** AltinAPI  
**Yedek fiyat sağlayıcısı adayı:** Altinapps

---

## 1. Belgenin amacı

Bu belge, Altın İz V1 mobil uygulamasının dış servisler ve backend ile nasıl iletişim kuracağını tanımlar.

Belge aşağıdaki alanları kapsar:

- Kullanıcı hesabı oluşturma
- E-posta doğrulama
- Kullanıcı girişi ve güvenli oturum
- Şifre sıfırlama
- Kullanıcı profili ve tercihleri
- Altın ürün kataloğu
- Güncel altın fiyatları
- Fiyat sağlayıcısı sembol eşleştirmeleri
- Portföy kayıtlarını listeleme
- Portföye kayıt ekleme
- Portföy kaydı düzenleme
- Portföy kaydı silme
- Tahmini değer ve kâr-zarar hesaplamaları
- Yasal belge sunumu ve olay kaydı
- Hesap ve veri silme işlemi
- Fiyat verisini zamanlanmış şekilde çekme
- API hata yönetimi
- Kota ve tekrar deneme kuralları
- API anahtarı güvenliği
- Android ve iOS istemci davranışları

Bu belge gerçek erişim anahtarlarını, şifreleri veya gizli sunucu bilgilerini içermez.

---

## 2. Sistem bileşenleri

```text
React Native / Expo Mobil Uygulama
                │
                ├── Supabase Auth
                │      ├── Kayıt
                │      ├── E-posta doğrulama
                │      ├── Giriş
                │      ├── Oturum yenileme
                │      └── Şifre sıfırlama
                │
                ├── Supabase Data API
                │      ├── Kullanıcı profili
                │      ├── Kullanıcı tercihleri
                │      ├── Altın ürünleri
                │      ├── Güncel fiyatlar
                │      ├── Portföy kayıtları
                │      └── Yasal belgeler
                │
                └── Güvenli Sunucu Fonksiyonları
                       ├── Fiyatları dış API'den çekme
                       ├── Fiyatları doğrulama
                       ├── Fiyat sembollerini eşleştirme
                       ├── Yasal belge olaylarını kaydetme
                       ├── Hesap silme
                       └── Yetkili yönetim işlemleri

Dış Fiyat Sağlayıcısı
        │
        └── Güvenli Sunucu Fonksiyonu
                 │
                 └── Supabase PostgreSQL
```

---

## 3. Temel mimari kararlar

1. Mobil uygulama dış altın fiyat API'sine doğrudan bağlanmayacaktır.
2. Dış fiyat API anahtarı mobil uygulamaya eklenmeyecektir.
3. Dış fiyatlar güvenli sunucu fonksiyonu tarafından alınacaktır.
4. Doğrulanan fiyatlar Supabase PostgreSQL içinde saklanacaktır.
5. Mobil uygulama fiyatları yalnızca Supabase üzerinden okuyacaktır.
6. Kullanıcı hesabı işlemleri Supabase Auth tarafından yönetilecektir.
7. Kullanıcıya ait tablolarda Row Level Security etkin olacaktır.
8. Mobil istemcinin gönderdiği `user_id` değeri tek başına güvenilir kabul edilmeyecektir.
9. Kayıt sahipliği doğrulanmış oturum kimliği üzerinden denetlenecektir.
10. Normal kullanıcılar altın fiyatı veya ürün kataloğu yazamayacaktır.
11. Hesap silme işlemi güvenli sunucu fonksiyonuyla yürütülecektir.
12. V1'de REST tabanlı fiyat çekme kullanılacaktır.
13. V1'de dış sağlayıcının WebSocket bağlantısı kullanılmayacaktır.
14. Fiyat bulunamadığında `0` değeri üretilmeyecektir.
15. Başka bir ürünün fiyatı yedek fiyat olarak sessizce kullanılmayacaktır.
16. Para değerleri API içinde kuruş cinsinden tam sayı olarak taşınacaktır.
17. Tarih ve saatler ISO 8601 biçiminde taşınacaktır.
18. Kullanıcı arayüzündeki Türkçe biçimlendirme mobil istemcide yapılacaktır.

---

## 4. Ortamlar

Proje en az üç ayrı ortam kullanacaktır.

### 4.1. Development

Yerel geliştirme ve kişisel cihaz testleri için kullanılır.

```text
Amaç: Kodlama ve hata çözme
Veri: Yalnızca test verisi
Kullanıcılar: Test hesapları
Fiyat sağlayıcısı: Ücretsiz deneme veya sahte olduğu açıkça belirtilmiş yerel test verisi
```

### 4.2. Preview

İç test ve yayımlama öncesi doğrulama için kullanılır.

```text
Amaç: Android kapalı test ve iOS TestFlight öncesi doğrulama
Veri: Gerçek kullanıcı verisi kullanılmaz
Kullanıcılar: Sınırlı test kullanıcıları
Fiyat sağlayıcısı: Test veya sınırlı üretim bağlantısı
```

### 4.3. Production

Google Play ve App Store üzerinden yayımlanan gerçek uygulamadır.

```text
Amaç: Gerçek kullanım
Veri: Gerçek kullanıcı verileri
Kullanıcılar: Son kullanıcılar
Fiyat sağlayıcısı: Ticari kullanım izni doğrulanmış ücretli veya kurumsal plan
```

### Ortam ayrımı kuralları

- Production ortamı kesinlikle ayrı bir Supabase projesi kullanmalıdır. Ücretsiz paket (Free Tier) sınırları kapsamında Development ve Preview ortamları aynı test Supabase projesini paylaşabilir.
- Production veritabanına geliştirme amaçlı rastgele veri yazılmamalıdır.
- Ortam anahtarları birbirine karıştırılmamalıdır.
- Production gizli anahtarları yerel örnek dosyalara yazılmamalıdır.
- `.env.example` dosyasında yalnızca değişken adları bulunmalıdır.

---

## 5. Ortam değişkenleri

### 5.1. Mobil uygulamada bulunabilecek değişkenler

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_APP_ENV
```

Bu değerler istemci uygulamasında kullanılmak üzere tasarlanmış olsa da veritabanını tek başına korumaz. Asıl veri güvenliği RLS politikalarıyla sağlanır.

### 5.2. Mobil uygulamada bulunmayacak değişkenler

```text
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_PASSWORD
GOLD_PRICE_API_KEY
SMTP_PASSWORD
EMAIL_PROVIDER_SECRET
```

### 5.3. Sunucu tarafında saklanacak değişkenler

```text
SUPABASE_URL
SUPABASE_SECRET_KEY veya gerekli en düşük yetkili sunucu anahtarı
GOLD_PRICE_API_BASE_URL
GOLD_PRICE_API_KEY
GOLD_PRICE_PROVIDER_CODE
GOLD_PRICE_REQUEST_TIMEOUT_MS
```

### Güvenlik kuralları

- Gizli değişkenler Git deposuna gönderilmez.
- Gizli değerler hata kayıtlarına yazılmaz.
- API anahtarının tamamı yönetim ekranında gösterilmez.
- Anahtar sızarsa iptal edilip yenisi oluşturulur.
- Anahtar değişimi mobil uygulama güncellemesi gerektirmemelidir.

---

## 6. API veri biçimi standartları

### 6.1. Tarih ve saat

API tarih ve saatleri ISO 8601 biçiminde kullanır.

```text
2026-09-03T09:40:00.000Z
```

### 6.2. Takvim tarihi

Saat içermeyen alış tarihi şu biçimde taşınır:

```text
2026-08-20
```

### 6.3. Para

Para değerleri kuruş cinsinden tam sayıdır.

```json
{
  "total_cost_minor": 4800000,
  "currency_code": "TRY"
}
```

Bu değer kullanıcıya:

```text
48.000,00 TL
```

olarak gösterilir.

### 6.4. Miktar

Miktar hassasiyet kaybını azaltmak için Supabase istemcisinden gelen `NUMERIC` alanların davranışı doğrulanacaktır. Uygulama içinde miktar değerlerinin metin veya hassas ondalık yaklaşımıyla işlenmesi tercih edilebilir.

Örnek:

```json
{
  "quantity": "12.250",
  "measurement_unit": "gram"
}
```

### 6.5. Boş değer

Fiyat bilinmiyorsa:

```json
{
  "buy_price_minor": null
}
```

kullanılır.

Şu kullanılmaz:

```json
{
  "buy_price_minor": 0
}
```

### 6.6. Kimlikler

Kullanıcıya ait ve uygulama kayıt kimlikleri UUID biçimindedir.

```text
550e8400-e29b-41d4-a716-446655440000
```

---

# 7. Kimlik doğrulama API işlemleri

## 7.1. Hesap oluşturma

### Amaç

E-posta ve şifreyle yeni kullanıcı hesabı oluşturur.

### Mobil uygulama girdisi

```json
{
  "email": "kullanici@example.com",
  "password": "Kullanıcının girdiği şifre",
  "password_confirmation": "Aynı şifre"
}
```

`password_confirmation` yalnızca mobil uygulamada eşleşme doğrulaması için kullanılır ve backend'e ayrı kullanıcı verisi olarak kaydedilmez.

### İstemci doğrulamaları

- E-posta boş olamaz.
- E-posta biçimi geçerli olmalıdır.
- Şifre boş olamaz.
- Şifre ile şifre tekrarı aynı olmalıdır.
- Şifre politikası kullanıcıya açıkça gösterilmelidir.
- Başında veya sonunda yanlışlıkla oluşan e-posta boşlukları temizlenmelidir.
- Şifre üzerinde sessizce boşluk temizleme yapılmamalıdır.

### İşlem akışı

```text
1. Kullanıcı kayıt formunu doldurur.
2. Mobil uygulama alanları denetler.
3. Yürürlükteki yasal belgeler kullanıcıya sunulur.
4. Supabase Auth kayıt isteği gönderilir.
5. Kimlik doğrulama hesabı oluşturulur ve veritabanı tetikleyicisi (`handle_new_user`) aynı işlem kapsamında `user_profiles` ile `user_preferences` kayıtlarını otomatik oluşturur.
6. Doğrulama e-postası gönderilir.
7. İlk oturum açılışında kayıtlar eksik kalırsa istemci RLS ile sınırlandırılmış güvenli fallback (`ON CONFLICT DO NOTHING`) çalıştırır.
8. Kullanıcı e-posta doğrulama ekranına yönlendirilir.
```

### Başarı sonucu

```json
{
  "status": "verification_required",
  "message": "Doğrulama e-postası gönderildi."
}
```

### Güvenlik

- Şifre uygulama loglarına yazılmaz.
- Şifre analitik aracına gönderilmez.
- Şifre hata raporuna eklenmez.
- Kullanıcıya e-posta hesabının varlığı konusunda gereksiz ayrıntı verilmez.

---

## 7.2. E-posta doğrulama

### Amaç

Kullanıcının e-posta adresinin kendisine ait olduğunu doğrular.

### İşlemler

- Doğrulama bağlantısını açma
- Uygulamaya güvenli geri yönlendirme
- Doğrulama durumunu yenileme
- Doğrulama e-postasını tekrar gönderme

### Mobil uygulama durumları

```text
pending
verified
expired
failed
```

### Kurallar

- Süresi dolmuş bağlantı için yeni e-posta gönderme seçeneği sunulur.
- Doğrulanmamış kullanıcı korunan uygulama alanına alınmaz.
- Derin bağlantı hem Android hem iOS için test edilir.
- Aynı düğmeye art arda basılarak sınırsız e-posta gönderilmesi engellenir.

---

## 7.3. Giriş yapma

### Girdi

```json
{
  "email": "kullanici@example.com",
  "password": "Kullanıcının girdiği şifre"
}
```

### Başarı davranışı

- Güvenli oturum oluşturulur.
- Kullanıcı profili alınır.
- Hesap durumu kontrol edilir.
- Profil `active` ise Ana Sayfa açılır.
- E-posta doğrulanmamışsa doğrulama ekranı açılır.
- Hesap `deletion_pending` ise normal kullanım engellenir ve uygun bilgilendirme gösterilir.
- Hesap `disabled` ise erişim reddedilir.

### Genel hata mesajı

```text
E-posta adresi veya şifre hatalı.
```

Sistem hesap varlığını gereksiz şekilde ifşa etmez.

---

## 7.4. Oturum yenileme

### Amaç

Kullanıcının uygulamayı her açtığında yeniden giriş yapmasını önler.

### Kurallar

- Oturum güvenli cihaz saklama alanında tutulur.
- Erişim belirteci süresi dolduğunda yenileme mekanizması kullanılır.
- Yenileme başarısızsa oturum güvenli şekilde kapatılır.
- Bozuk oturum sonsuz yüklenme ekranına neden olmamalıdır.
- Kullanıcı çıkış yaptığında yerel oturum bilgileri temizlenir.

### Uygulama açılış akışı

```text
Oturum yükleniyor
      │
      ├── Geçerli → Kullanıcı durumunu kontrol et → Ana Sayfa
      ├── Yok → Karşılama
      └── Geçersiz → Yerel oturumu temizle → Giriş
```

---

## 7.5. Şifre sıfırlama

### Girdi

```json
{
  "email": "kullanici@example.com"
}
```

### Kullanıcı mesajı

```text
Bu adres sistemde kayıtlıysa şifre sıfırlama bağlantısı gönderildi.
```

### Kurallar

- Hesabın varlığı açık edilmez.
- Sıfırlama bağlantısı süreli olmalıdır.
- Bağlantı uygulamaya güvenli geri dönüş sağlamalıdır.
- Yeni şifre mevcut parola politikasını karşılamalıdır.
- İşlem sonrası eski oturumların sonlandırılması değerlendirilmelidir.

---

## 7.6. Çıkış yapma

### Amaç

Kullanıcının mevcut cihazdaki oturumunu kapatır.

### İşlem

```text
1. Supabase çıkış işlemi çağrılır.
2. Yerel oturum verileri temizlenir.
3. Özel kullanıcı önbelleği temizlenir.
4. Kullanıcı Karşılama veya Giriş ekranına gönderilir.
```

### Kurallar

- Çıkış yapmak kullanıcı hesabını silmez.
- Çıkış yapmak portföy kayıtlarını silmez.
- Çıkış başarısız olsa bile yerel hassas oturum güvenli şekilde ele alınır.

---

# 8. Kullanıcı profili ve tercih API işlemleri

## 8.1. Kullanıcı profilini getir

### Veri kaynağı

```text
user_profiles
```

### Dönen alanlar

```json
{
  "user_id": "UUID",
  "display_name": null,
  "account_status": "active",
  "created_at": "2026-09-03T09:00:00.000Z",
  "updated_at": "2026-09-03T09:00:00.000Z"
}
```

### Yetki

Kullanıcı yalnızca kendi profilini okuyabilir.

---

## 8.2. Görünen adı güncelle

### Girdi

```json
{
  "display_name": "Adem"
}
```

### Kurallar

- Alan isteğe bağlıdır.
- Azami 50 karakterdir.
- Boş metin `null` olarak normalize edilebilir.
- Kullanıcı `account_status` alanını değiştiremez.
- Kullanıcı `user_id` alanını değiştiremez.

---

## 8.3. Kullanıcı tercihlerini getir

### Veri kaynağı

```text
user_preferences
```

### Yanıt

```json
{
  "theme": "system",
  "language_code": "tr",
  "currency_code": "TRY"
}
```

### V1 kuralları

- `language_code` yalnızca `tr` olabilir.
- `currency_code` yalnızca `TRY` olabilir.
- Tema `light`, `dark` veya `system` olabilir.

---

## 8.4. Tema tercihini güncelle

### Girdi

```json
{
  "theme": "dark"
}
```

### Başarı yanıtı

```json
{
  "theme": "dark",
  "updated": true
}
```

---

# 9. Altın ürün kataloğu API işlemleri

## 9.1. Aktif fiyat ürünlerini listele

### Amaç

Fiyatlar ekranında gösterilebilecek ürünleri getirir.

### Filtre

```text
is_active = true
price_display_enabled = true
```

### Sıralama

```text
sort_order ASC, name ASC
```

### Örnek yanıt

```json
{
  "products": [
    {
      "id": "UUID",
      "code": "GRAM_GOLD",
      "name": "Gram Altın",
      "short_name": "Gram",
      "category": "gram",
      "measurement_unit": "gram",
      "quantity_precision": 3,
      "package_weight_grams": null,
      "portfolio_enabled": true,
      "calculator_enabled": true,
      "price_display_enabled": true
    }
  ]
}
```

### Yetki

Normal kullanıcı yalnızca okuyabilir.

---

## 9.2. Portföye eklenebilir ürünleri listele

### Filtre

```text
is_active = true
portfolio_enabled = true
```

### Kurallar

- Ons Altın V1'de portföye eklenmez.
- Doğrudan güvenilir alış fiyatı olmayan ürün portföye açılmaz.
- Dış sağlayıcıdaki sembol doğrulanmadan ürün etkinleştirilmez.

---

## 9.3. Hesaplanabilir ürünleri listele

### Filtre

```text
is_active = true
calculator_enabled = true
```

Satın alma hesabı için satış, bozdurma hesabı için alış fiyatı bulunmalıdır.

---

# 10. Fiyat sağlayıcısı ürün eşleştirmesi

## 10.1. Kullanılan tablo

`DATABASE.md` içinde tanımlanan aşağıdaki tablo kullanılır:

```text
price_source_product_mappings
```

### Alanlar

```text
id                  UUID
source_id           UUID
product_id          UUID
external_symbol     VARCHAR(100)
external_name       VARCHAR(200), nullable
external_category   VARCHAR(100), nullable
is_active           BOOLEAN
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### Benzersizlik

```text
(source_id, external_symbol) benzersiz
(source_id, product_id) benzersiz
```

### Örnek eşleştirme

```json
{
  "provider": "ALTINAPI",
  "external_symbol": "CEYREK_YENI",
  "product_code": "QUARTER_GOLD_NEW",
  "display_name": "Çeyrek Altın, Yeni Tarihli"
}
```

### Kurallar

- Eşleştirme tahminle yapılmaz.
- Cumhuriyet Altını ve Ata Altını otomatik olarak aynı kabul edilmez.
- Eski ve yeni tarihli ürünler ayrı ürün olarak tutulur.
- Bilinmeyen dış sembol fiyat tablosuna otomatik ürün olarak eklenmez.
- Bilinmeyen sembol güvenli teknik kayda alınır.
- Bir eşleştirme devre dışıysa ilgili dış fiyat işlenmez.

---

# 11. Güncel fiyat API işlemleri

## 11.1. Güncel fiyat listesini getir

### Amaç

Fiyatlar ekranı için aktif ürünlerin en son geçerli fiyatlarını getirir.

### Mantıksal yanıt

```json
{
  "status": "success",
  "generated_at": "2026-09-03T09:45:00.000Z",
  "data_status": "live",
  "prices": [
    {
      "product_id": "UUID",
      "product_code": "GRAM_GOLD",
      "product_name": "Gram Altın",
      "buy_price_minor": 667690,
      "sell_price_minor": 680908,
      "currency_code": "TRY",
      "price_unit": "gram",
      "daily_change_percent": "1.2547",
      "day_low_minor": null,
      "day_high_minor": null,
      "source_price_at": "2026-09-03T09:44:30.000Z",
      "fetched_at": "2026-09-03T09:44:35.000Z",
      "is_stale": false,
      "source_name": "Fiyat Sağlayıcısı"
    }
  ]
}
```

### Veri durumları

```text
live
stale
partial
unavailable
```

Anlamları:

- `live`: Beklenen güncellik süresi içindeki geçerli veriler.
- `stale`: Son bilinen ancak eski veriler.
- `partial`: Bazı ürünlerin geçerli fiyatı mevcut değildir.
- `unavailable`: Kullanılabilir fiyat bulunmamaktadır.

### Kurallar

- Kullanıcıya kaynak fiyat zamanı gösterilir.
- `fetched_at`, teknik hata çözümünde kullanılır.
- Fiyat yoksa `null` döner, `0` dönmez.
- Geçersiz fiyat kullanıcıya gösterilmez.
- Aynı ürün için belirlenen kaynak önceliğine göre tek güncel fiyat seçilir.

---

## 11.2. Tek ürün fiyatını getir

### Girdi

```text
product_id veya güvenli ürün code değeri
```

### Kullanım yerleri

- Altın detay ekranı
- Hesaplama ekranı
- Portföye ekleme ekranındaki bilgilendirme

### Bulunamadı durumu

```json
{
  "status": "unavailable",
  "product_id": "UUID",
  "message": "Bu ürün için kullanılabilir fiyat bulunamadı."
}
```

---

## 11.3. Fiyat arama ve sıralama

V1'de ürün adı araması mobil tarafta küçük veri kümesi üzerinde yapılabilir veya backend sorgusuyla uygulanabilir.

Desteklenen sıralamalar:

```text
default
name_asc
sell_price_asc
sell_price_desc
```

Fiyatı bulunmayan ürünler sıralamanın sonunda gösterilir.

---

# 12. Dış fiyat API entegrasyonu

## 12.1. Birincil aday

```text
Sağlayıcı: AltinAPI
Bağlantı türü: REST
Kimlik doğrulama: Sunucu tarafındaki API anahtarı
Plan: Geliştirmede ücretsiz deneme, üretimde ticari kullanım izni doğrulanmış plan
```

Bu seçim koşullu karardır. Sözleşme, ürün sembolleri, ticari gösterim hakkı ve gerçek API yanıtları doğrulanmadan üretim sağlayıcısı kesinleşmiş sayılmaz.

## 12.2. Yedek aday

```text
Sağlayıcı: Altinapps
Bağlantı türü: REST
Kimlik doğrulama: Bearer anahtarı, yalnızca sunucu tarafında
```

## 12.3. Dış istek kuralı

```text
Mobil Uygulama → Dış Fiyat API
```

yasaktır.

Doğru akış:

```text
Zamanlanmış Güvenli Fonksiyon → Dış Fiyat API → Doğrulama → PostgreSQL
```

## 12.4. Dış API isteği

Gerçek URL ve başlık, sağlayıcı hesabı açılıp belgeler yeniden doğrulandıktan sonra kesinleştirilecektir.

Mantıksal istek:

```http
GET /prices HTTP/1.1
Host: fiyat-saglayicisi.example
X-API-Key: SUNUCUDA_SAKLANAN_GIZLI_ANAHTAR
Accept: application/json
```

Bu örnekteki anahtar gerçek değildir ve proje dosyasına gerçek anahtar yazılmaz.

## 12.5. Beklenen sağlayıcı fiyat nesnesi

Mantıksal biçim:

```json
{
  "symbol": "ALTIN",
  "category": "MADEN",
  "bid": 6676.90,
  "ask": 6809.08,
  "timestamp": 1788428670000
}
```

Eşleştirme:

```text
symbol    → price_source_product_mappings.external_symbol
bid       → buy_price_minor
ask       → sell_price_minor
timestamp → source_price_at
```

Para dönüşümü:

```text
6676.90 TL × 100 = 667690 kuruş
```

Ondalıklı dış fiyat dönüşümünde ikili kayan nokta hatası oluşmaması için hassas ondalık dönüşüm yöntemi kullanılacaktır.

---

# 13. Zamanlanmış fiyat çekme işlemi

## 13.1. V1 yaklaşımı

V1'de bütün aktif semboller mümkünse tek REST isteğiyle alınır.

```text
Zamanlayıcı
    ↓
price_fetch_runs kaydı: running
    ↓
Dış API isteği
    ↓
Yanıt şema kontrolü
    ↓
Her sembolü eşleştir
    ↓
Her fiyatı doğrula
    ↓
Geçerli kayıtları gold_prices tablosuna ekle
    ↓
Sayaçları güncelle
    ↓
İşlem durumunu success, partial veya failed yap
```

## 13.2. Geçici geliştirme sıklığı

Ücretsiz deneme kotasını korumak için geliştirme ortamında otomatik çekim başlangıçta kapalı veya seyrek olacaktır.

Önerilen geliştirme sıklığı:

```text
Elle çalıştırma veya 30 dakikada bir
```

## 13.3. Üretim sıklığı

Üretim sıklığı aşağıdakiler doğrulandıktan sonra kesinleştirilecektir:

- Sağlayıcı kotası
- Ticari plan
- Piyasa güncelleme sıklığı
- Uygulamadaki aktif kullanıcı sayısı
- Verinin ne kadar güncel olması gerektiği
- Maliyet

Başlangıç hedefi:

```text
Aktif dönemde 5 dakikada bir
Düşük hareket döneminde 15 dakikada bir
```

Bu henüz kesin sözleşmesel kural değildir.

---

# 14. Fiyat doğrulama işlemi

Her dış fiyat aşağıdaki kontrollerden geçer:

1. Yanıt geçerli JSON mu?
2. Fiyat listesi beklenen yapıda mı?
3. Sembol boş mu?
4. Sembol aktif bir ürünle eşleşiyor mu?
5. Alış fiyatı geçerli bir sayı mı?
6. Satış fiyatı geçerli bir sayı mı?
7. Alış veya satış fiyatlarından en az biri mevcut mu?
8. Fiyatlar pozitif mi?
9. Para birimi beklenen para birimi mi?
10. Fiyat birimi ürünle uyumlu mu?
11. Zaman damgası geçerli mi?
12. Zaman damgası makul bir gelecekte değil mi?
13. Sağlayıcı veriyi eski olarak işaretlemiş mi?
14. Önceki geçerli fiyata göre olağan dışı değişim var mı?

### Geçersiz fiyat

```json
{
  "is_valid": false,
  "validation_message": "Alış fiyatı negatif geldi."
}
```

Geçersiz fiyat kullanıcıya gösterilmez.

### Bilinmeyen sembol

- Yeni ürün otomatik oluşturulmaz.
- Teknik olay kaydı oluşturulur.
- `products_rejected` artırılır.
- Fiyat çekme işlemi diğer ürünler için devam eder.

### Olağan dışı değişim

Eşik gerçek veriler incelendikten sonra belirlenecektir. Eşik kesinleşmeden rastgele bir yüzde üretim kuralı olarak kullanılmaz.

---

# 15. Kota ve tekrar deneme yönetimi

## 15.1. İstek kotası

- Her kullanıcı için dış API çağrısı yapılmaz.
- Bütün kullanıcılar Supabase'te saklanan ortak doğrulanmış fiyatları okur.
- Tek toplu fiyat isteği tercih edilir.
- Kota bilgisi varsa yanıt başlıklarından izlenir.

## 15.2. Tekrar deneme yapılabilecek hatalar

```text
408 Request Timeout
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
```

## 15.3. Tekrar deneme yapılmayacak hatalar

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found, sembol veya uç nokta yapılandırma hatasıysa
```

Kimlik doğrulama veya yetki hatasında aynı isteği sürekli tekrarlamak yerine teknik uyarı oluşturulur.

## 15.4. Geri çekilme stratejisi

Geçici hatalarda sınırlı üstel bekleme kullanılabilir:

```text
1. deneme sonrası: kısa bekleme
2. deneme sonrası: daha uzun bekleme
3. deneme sonrası: işlem failed veya partial
```

Kesin süreler uygulama aşamasında sağlayıcının kurallarına göre belirlenir. Sonsuz tekrar yapılmaz.

## 15.5. 429 durumu

- `Retry-After` başlığı varsa dikkate alınır.
- Kota doluyken sık istek gönderilmez.
- Son geçerli fiyat korunur.
- Kullanıcıya teknik 429 kodu yerine anlaşılır veri güncelliği mesajı gösterilir.

---

# 16. Portföy API işlemleri

## 16.1. Kullanıcının portföy kayıtlarını listele

### Yetki

Yalnızca giriş yapan kullanıcıya ait kayıtlar döner.

### Varsayılan sıralama

```text
purchase_date DESC
created_at DESC
```

### Mantıksal yanıt

```json
{
  "entries": [
    {
      "id": "UUID",
      "product": {
        "id": "UUID",
        "code": "QUARTER_GOLD_NEW",
        "name": "Çeyrek Altın, Yeni Tarihli",
        "measurement_unit": "piece"
      },
      "quantity": "4.000",
      "purchase_date": "2026-08-20",
      "total_cost_minor": 4800000,
      "purchase_place": "Örnek Kuyumcu",
      "note": null,
      "labor_included": null,
      "created_at": "2026-09-03T09:00:00.000Z",
      "updated_at": "2026-09-03T09:00:00.000Z"
    }
  ]
}
```

### Kurallar

- `user_id` başka kullanıcıya ait kayıtları döndüremez.
- Kullanıcı notu yalnızca kayıt sahibine gösterilir.
- Ürün devre dışı bırakılmış olsa bile eski portföy kaydı silinmez.
- Fiyat bulunmasa bile portföy kaydı döner.

---

## 16.2. Portföy kaydı oluştur

### Mobil istemcinin gönderdiği alanlar

```json
{
  "product_id": "UUID",
  "quantity": "4.000",
  "purchase_date": "2026-08-20",
  "total_cost_minor": 4800000,
  "purchase_place": "Örnek Kuyumcu",
  "note": "İsteğe bağlı not",
  "labor_included": null
}
```

### Mobil istemcinin göndermemesi gereken alanlar

```text
id
user_id
created_at
updated_at
current_value_minor
profit_loss_minor
profit_loss_percentage
```

### Sunucu ve veritabanı doğrulamaları

- Kullanıcı giriş yapmış olmalıdır.
- Ürün mevcut olmalıdır.
- Ürün aktif olmalıdır.
- `portfolio_enabled = true` olmalıdır.
- Miktar 0'dan büyük olmalıdır.
- Adetli üründe miktar tam sayı olmalıdır.
- Gramlı üründe azami üç ondalık olmalıdır.
- Alış tarihi gelecekte olamaz.
- Toplam maliyet 0'dan büyük olmalıdır.
- Alış yeri azami 100 karakter olmalıdır.
- Not azami 500 karakter olmalıdır.
- `user_id`, güvenli oturumdan atanmalıdır.

### Başarı yanıtı

```json
{
  "status": "created",
  "entry_id": "UUID",
  "message": "Altın kaydı portföyünüze eklendi."
}
```

---

## 16.3. Portföy kaydı detayını getir

### Girdi

```text
entry_id
```

### Yetki

Kayıt giriş yapan kullanıcıya ait olmalıdır.

### Bulunamadı veya yetkisiz erişim

Kayıt varlığını başka kullanıcıya açıklamayan genel yanıt tercih edilir:

```json
{
  "error": {
    "code": "PORTFOLIO_ENTRY_NOT_AVAILABLE",
    "user_message": "Portföy kaydı bulunamadı veya bu kayda erişim izniniz yok.",
    "retryable": false,
    "request_id": "Güvenli teknik takip kimliği"
  }
}
```

---

## 16.4. Portföy kaydını güncelle

### Güncellenebilir alanlar

```text
product_id
quantity
purchase_date
total_cost_minor
purchase_place
note
labor_included
```

### Güncellenemeyen alanlar

```text
id
user_id
created_at
```

### Girdi örneği

```json
{
  "quantity": "5.000",
  "total_cost_minor": 6100000,
  "note": "Düzeltilmiş kayıt"
}
```

### İşlem sonrası

- `updated_at` otomatik yenilenir.
- Güncel değer yeniden hesaplanır.
- Portföy özeti yeniden hesaplanır.
- Kullanıcı yalnızca kendi kaydını güncelleyebilir.

---

## 16.5. Portföy kaydını sil

### Girdi

```text
entry_id
```

### Kurallar

- Kayıt kullanıcıya ait olmalıdır.
- Kullanıcıdan arayüzde son onay alınmalıdır.
- Silme tamamlanmadan başarı mesajı gösterilmez.
- Silme başarısızsa kayıt ekranda geri getirilemez şekilde kaybolmuş gibi gösterilmez.
- V1'de silme işlemi satış geçmişi oluşturmaz.

### Başarı yanıtı

```json
{
  "status": "deleted",
  "message": "Portföy kaydı silindi."
}
```

---

# 17. Portföy hesaplama API modeli

## 17.1. Kayıt bazında hesaplama

### Formüller

```text
Tahmini Bozdurma Değeri = Miktar × Güncel Alış Fiyatı
```

```text
Tahmini Kâr/Zarar = Tahmini Bozdurma Değeri - Ödenen Toplam Tutar
```

```text
Değişim Yüzdesi = (Tahmini Kâr/Zarar ÷ Ödenen Toplam Tutar) × 100
```

### Mantıksal hesaplanmış yanıt

```json
{
  "entry_id": "UUID",
  "valuation_status": "calculated",
  "used_price_minor": 1280000,
  "used_price_type": "buy",
  "price_at": "2026-09-03T09:44:30.000Z",
  "is_stale": false,
  "estimated_liquidation_value_minor": 5120000,
  "profit_loss_minor": 320000,
  "profit_loss_percent": "6.6667"
}
```

Kullanıcıya yüzde `+%6,67` olarak gösterilir.

## 17.2. Fiyat olmayan kayıt

```json
{
  "entry_id": "UUID",
  "valuation_status": "price_unavailable",
  "used_price_minor": null,
  "estimated_liquidation_value_minor": null,
  "profit_loss_minor": null,
  "profit_loss_percent": null
}
```

## 17.3. Eski fiyatla hesaplanan kayıt

```json
{
  "entry_id": "UUID",
  "valuation_status": "stale_price",
  "is_stale": true,
  "price_at": "2026-09-03T08:00:00.000Z"
}
```

## 17.4. Portföy özeti

### Eksiksiz toplam

```json
{
  "summary_status": "complete",
  "entry_count": 3,
  "calculated_entry_count": 3,
  "unavailable_entry_count": 0,
  "calculated_entries_cost_minor": 20000000,
  "estimated_liquidation_value_minor": 21545000,
  "profit_loss_minor": 1545000,
  "profit_loss_percent": "7.7250",
  "total_cost_minor": 20000000
}
```

### Kısmi toplam

Fiyatı olmayan kayıt varsa yanıltıcı toplam kâr-zarar gösterilmez.

```json
{
  "summary_status": "partial",
  "entry_count": 5,
  "calculated_entry_count": 3,
  "unavailable_entry_count": 2,
  "calculated_entries_cost_minor": 12000000,
  "estimated_liquidation_value_minor": 13000000,
  "total_cost_minor": 20000000,
  "profit_loss_minor": null,
  "profit_loss_percent": null
}
```

### Kurallar

- Bütün kayıt yüzdeleri toplanmaz.
- Önce ham parasal toplamlar hesaplanır.
- Sonuç kullanıcıya gösterilirken yuvarlanır.
- Hesaplanan değerler ana gerçek veri olarak `portfolio_entries` tablosuna yazılmaz.

---

# 18. Hesaplama ekranı API modeli

## 18.1. Satın alma hesabı

### Girdi

```json
{
  "product_id": "UUID",
  "quantity": "5.000",
  "operation_type": "buy"
}
```

### Formül

```text
Tahmini Satın Alma Tutarı = Miktar × Güncel Satış Fiyatı
```

### Yanıt

```json
{
  "operation_type": "buy",
  "used_price_type": "sell",
  "used_price_minor": 1300000,
  "estimated_total_minor": 6500000,
  "currency_code": "TRY",
  "price_at": "2026-09-03T09:44:30.000Z",
  "is_stale": false
}
```

## 18.2. Bozdurma hesabı

### Girdi

```json
{
  "product_id": "UUID",
  "quantity": "5.000",
  "operation_type": "sell"
}
```

### Formül

```text
Tahmini Bozdurma Tutarı = Miktar × Güncel Alış Fiyatı
```

### Yanıt

```json
{
  "operation_type": "sell",
  "used_price_type": "buy",
  "used_price_minor": 1280000,
  "estimated_total_minor": 6400000,
  "currency_code": "TRY",
  "price_at": "2026-09-03T09:44:30.000Z",
  "is_stale": false
}
```

## 18.3. Fiyat bulunamaması

```json
{
  "error": {
    "code": "PRICE_UNAVAILABLE",
    "user_message": "Bu altın türü için kullanılabilir fiyat bulunamadığından hesaplama yapılamıyor.",
    "retryable": true,
    "request_id": "Güvenli teknik takip kimliği"
  }
}
```

---

# 19. Yasal belge API işlemleri

## 19.1. Aktif yasal belgeleri getir

### Desteklenen belge türleri

```text
kvkk_notice
privacy_policy
terms_of_use
data_retention
financial_disclaimer
explicit_consent
```

### Yanıt örneği

```json
{
  "documents": [
    {
      "id": "UUID",
      "document_type": "kvkk_notice",
      "version": "1.0",
      "title": "KVKK Aydınlatma Metni",
      "content": "Belgenin içeriği",
      "requires_action": false,
      "effective_at": "2026-09-03T00:00:00.000Z"
    }
  ]
}
```

### Kurallar

- Kullanıcı yalnızca aktif ve yürürlükteki metni görür.
- Eski sürümler denetim amacıyla veritabanında tutulabilir.
- Aydınlatma metni gereksiz bir açık rıza onayına dönüştürülmez.
- Açık rıza gerekiyorsa ayrı belge ve ayrı olay olarak yönetilir.

---

## 19.2. Yasal belge olayı kaydet

### Çağrı yöntemi

Mobil istemci `user_legal_events` tablosuna doğrudan `INSERT` yapamaz. Bu işlem yalnızca güvenli PostgreSQL RPC veya `record-legal-event` Edge Function üzerinden çağrılır.

### Girdi

```json
{
  "document_id": "UUID",
  "event_type": "presented",
  "source": "registration",
  "app_version": "1.0.0"
}
```

### Kurallar

- `user_id` doğrulanmış kullanıcı oturumundan alınır; istemciden gönderilen `user_id` kabul edilmez.
- `document_version` sunucu tarafından ilgili `legal_documents.version` alanından alınır.
- `event_at` olay zamanı sunucu veya veritabanı saatiyle atanır.
- Belgenin etkin olduğu ve `document_type` ile `event_type` birleşiminin geçerli olduğu sunucuda doğrulanır.
- Kayıtlar append-only olarak oluşturulur; geçmiş olaylar güncellenemez veya silinemez.
- `accepted`, yalnızca kabul işlemi gerçekten gereken belgelerde kullanılır.
- `declined` ve `withdrawn`, ilgili açık rıza akışında kullanılır.

---

# 20. Hesap ve veri silme API işlemi

## 20.1. Neden güvenli sunucu fonksiyonu?

Mobil kullanıcı doğrudan `auth.users` hesabını ve bütün ilişkili kayıtları güvenli biçimde silemez. İşlem yönetici yetkisi gerektiren adımlar içerebilir. Bu nedenle sınırlı amaçlı güvenli bir sunucu fonksiyonu kullanılacaktır.

## 20.2. Silme öncesi yeniden doğrulama

Kullanıcıdan güvenli yeniden kimlik doğrulama istenir. Yeniden doğrulama yöntemi Supabase'in güncel desteklediği akışa göre uygulanır.

### Mobil istek

Kullanıcı kimliği istek gövdesinde güven kaynağı olarak gönderilmez. Kimlik doğrulanmış erişim belirtecinden alınır.

Mantıksal istek:

```json
{
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

## 20.3. Silme işlem akışı

```text
1. Oturum doğrulanır.
2. Kullanıcı kimliği oturumdan alınır.
3. Yeniden doğrulama şartı kontrol edilir.
4. account_deletion_requests kaydı oluşturulur.
5. user_profiles.account_status = deletion_pending yapılır.
6. Portföy kayıtları silinir.
7. Kullanıcı tercihleri silinir.
8. Yasal ve güvenlik kayıtları saklama politikasına göre işlenir.
9. Profil kaydı silinir.
10. Auth kullanıcı hesabı silinir.
11. Aktif oturumlar sonlandırılır.
12. Kişisel veri içermeyen teknik sonuç gereksinimi uygulanır.
```

## 20.4. Başarı yanıtı

```json
{
  "status": "completed",
  "user_message": "Hesabınız ve silinmesi gereken verileriniz silindi."
}
```

## 20.5. Başarısızlık

```json
{
  "error": {
    "code": "ACCOUNT_DELETION_FAILED",
    "user_message": "Hesap silme işlemi tamamlanamadı. İşleme güvenli biçimde devam edebilmek için talebiniz beklemeye alındı. Lütfen daha sonra tekrar kontrol edin.",
    "retryable": true,
    "request_id": "Güvenli teknik takip kimliği"
  }
}
```

### Kurallar

- Kısmi başarısızlık gizlenmez.
- İşlem gerçekten tamamlanmadan başarı mesajı verilmez.
- Hata kaydına şifre veya erişim belirteci yazılmaz.
- Tekrar giriş durumu ve silme talebi durumu açıkça yönetilir.
- Kesin saklama ve anonimleştirme davranışı `DATA_RETENTION.md` ile uyumlu olmalıdır.

---

# 21. Hata yanıtı standardı

Uygulama içi servis katmanında hatalar ortak biçime dönüştürülür.

```json
{
  "error": {
    "code": "PRICE_UNAVAILABLE",
    "user_message": "Bu altın türü için kullanılabilir fiyat bulunamadı.",
    "retryable": true,
    "request_id": "Güvenli teknik takip kimliği"
  }
}
```

### Alanlar

- `code`: Uygulamanın anlayacağı sabit hata kodu
- `user_message`: Kullanıcıya gösterilecek Türkçe mesaj
- `retryable`: İşlemin tekrar denenip denenemeyeceği
- `request_id`: Hassas olmayan teknik takip kimliği

### Kullanıcıya gösterilmeyecek bilgiler

- SQL sorgusu
- Tablo iç yapısı
- Stack trace
- API anahtarı
- Erişim belirteci
- Veritabanı şifresi
- Başka kullanıcı kimliği
- Sağlayıcının hassas ham yanıtı

---

# 22. Uygulama hata kodları

## Kimlik doğrulama

```text
AUTH_INVALID_CREDENTIALS
AUTH_EMAIL_NOT_VERIFIED
AUTH_SESSION_EXPIRED
AUTH_PASSWORD_RESET_FAILED
AUTH_ACCOUNT_DISABLED
AUTH_DELETION_PENDING
```

## Portföy

```text
PORTFOLIO_ENTRY_NOT_AVAILABLE
PORTFOLIO_CREATE_FAILED
PORTFOLIO_UPDATE_FAILED
PORTFOLIO_DELETE_FAILED
PORTFOLIO_INVALID_QUANTITY
PORTFOLIO_INVALID_PURCHASE_DATE
PORTFOLIO_INVALID_TOTAL_COST
PORTFOLIO_PRODUCT_DISABLED
```

## Fiyat

```text
PRICE_UNAVAILABLE
PRICE_STALE
PRICE_PARTIAL
PRICE_PROVIDER_TIMEOUT
PRICE_PROVIDER_UNAUTHORIZED
PRICE_PROVIDER_RATE_LIMITED
PRICE_PROVIDER_UNAVAILABLE
PRICE_UNKNOWN_SYMBOL
PRICE_VALIDATION_FAILED
```

## Yasal belgeler

```text
LEGAL_DOCUMENT_NOT_FOUND
LEGAL_EVENT_INVALID
LEGAL_EVENT_SAVE_FAILED
```

## Hesap silme

```text
ACCOUNT_REAUTHENTICATION_REQUIRED
ACCOUNT_DELETION_ALREADY_PROCESSING
ACCOUNT_DELETION_FAILED
ACCOUNT_DELETION_COMPLETED
```

## Genel

```text
NETWORK_OFFLINE
REQUEST_TIMEOUT
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
SERVER_ERROR
UNKNOWN_ERROR
```

---

# 23. Kullanıcı mesajları

Teknik hata kodları doğrudan kullanıcıya gösterilmez.

### İnternet yok

```text
İnternet bağlantısı bulunamadı. Bağlantınızı kontrol edip yeniden deneyin.
```

### Son bilinen fiyat

```text
Şu anda güncel fiyatlara ulaşılamıyor. Son bilinen fiyatlar gösteriliyor.
```

### Fiyat yok

```text
Bu altın türü için kullanılabilir fiyat bulunamadı.
```

### Portföy kayıt hatası

```text
Altın kaydı portföyünüze eklenemedi. Bilgilerinizi kontrol edip yeniden deneyin.
```

### Oturum süresi doldu

```text
Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.
```

### Yetkisiz kayıt erişimi

```text
Bu portföy kaydı bulunamadı veya kayda erişim izniniz yok.
```

### Sunucu hatası

```text
İşlem şu anda tamamlanamıyor. Lütfen biraz sonra yeniden deneyin.
```

---

# 24. Önbellek ve çevrimdışı davranış

## 24.1. Fiyatlar

- Son başarılı fiyat sonucu cihazda sınırlı süreli önbelleğe alınabilir.
- Önceki fiyat gösteriliyorsa son güncelleme zamanı görünür olmalıdır.
- Önbellekteki eski fiyat canlı fiyat gibi gösterilmez.
- Hassas olmayan fiyat verileri yerel önbellekte tutulabilir.

## 24.2. Portföy

- Kullanıcının portföyü hassas kişisel finans verisi olarak değerlendirilir.
- Yerel saklama gerekiyorsa güvenli ve sınırlı tutulur.
- Çıkışta kullanıcıya ait yerel portföy önbelleği temizlenir.
- V1'de çevrimdışı kayıt ekleme, düzenleme ve silme kuyruğu bulunmaz.
- Bağlantı yokken işlem başarılı olmuş gibi gösterilmez.

## 24.3. Yasal belgeler

Yürürlükteki yasal belgeler çevrimdışı görüntüleme için güvenli biçimde önbelleğe alınabilir. Ancak belge sürümü ve güncellik durumu korunmalıdır.

---

# 25. İstek iptali ve zaman aşımı

- Kullanıcı ekrandan ayrılırsa gereksiz istemci isteği iptal edilebilir.
- Sonsuz yüklenme göstergesi oluşmamalıdır.
- Dış fiyat sağlayıcısına sunucu isteğinde zaman aşımı uygulanmalıdır.
- Zaman aşımı sonrası sınırlı tekrar deneme yapılabilir.
- Aynı kaydetme işlemine çift dokunma iki kayıt oluşturmamalıdır.

Portföy oluşturma gibi işlemlerde istemci düğmesi istek sürerken geçici olarak devre dışı bırakılır. Gerekli görülürse ileride idempotency anahtarı eklenebilir.

---

# 26. Günlükleme ve gözlemlenebilirlik

## Kaydedilebilecek teknik bilgiler

- İşlem türü
- Başarı veya hata durumu
- Güvenli hata kodu
- İşlem süresi
- Sağlayıcı durumu
- Alınan, kaydedilen ve reddedilen ürün sayısı
- Hassas olmayan takip kimliği

## Kaydedilmeyecek bilgiler

- Şifre
- Tam erişim veya yenileme belirteci
- API anahtarı
- Veritabanı şifresi
- Kullanıcının bütün portföyü
- Kullanıcı notunun tamamı
- Gereksiz e-posta içeriği

## Saklama

Teknik kayıtların saklama süresi `DATA_RETENTION.md` içinde tanımlanacaktır.

---

# 27. API güvenlik kontrol listesi

- [ ] Bütün kullanıcı tablolarında RLS etkin.
- [ ] Kullanıcı yalnızca kendi portföyünü okuyabiliyor.
- [ ] Kullanıcı başka kullanıcı adına kayıt oluşturamıyor.
- [ ] Kullanıcı başka kullanıcının kaydını güncelleyemiyor.
- [ ] Kullanıcı başka kullanıcının kaydını silemiyor.
- [ ] Mobil uygulamada secret veya service role anahtarı yok.
- [ ] Fiyat API anahtarı mobil uygulamada yok.
- [ ] Normal kullanıcı `gold_prices` tablosuna yazamıyor.
- [ ] Normal kullanıcı `gold_products` tablosunu değiştiremiyor.
- [ ] Hesap silme fonksiyonu kimliği oturumdan alıyor.
- [ ] Kullanıcı girdileri sunucu veya veritabanında tekrar doğrulanıyor.
- [ ] Hata yanıtları hassas teknik ayrıntı içermiyor.
- [ ] Çıkışta özel yerel önbellek temizleniyor.
- [ ] Android ve iOS derin bağlantıları test edildi.
- [ ] Şifre sıfırlama bağlantıları test edildi.
- [ ] E-posta doğrulama bağlantıları test edildi.
- [ ] Mobil istemci `user_legal_events` tablosuna doğrudan kayıt ekleyemez.
- [ ] Yasal olaylarda kullanıcı kimliği doğrulanmış oturumdan alınır.
- [ ] İstemcinin gönderdiği `document_version` kullanılmaz.
- [ ] İstemcinin gönderdiği `event_at` kullanılmaz.
- [ ] Yasal olay oluşturulmadan önce belge etkinliği doğrulanır.
- [ ] Belge türü ile olay türü birleşimi doğrulanır.
- [ ] Yasal olay oluşturulduktan sonra kullanıcı tarafından güncellenemez veya silinemez.


---

# 28. Fiyat entegrasyonu test listesi

- [ ] Ücretsiz deneme hesabı oluşturuldu.
- [ ] Gerçek `/prices` yanıtı güvenli ortamda alındı.
- [ ] Gerçek sembol listesi kaydedildi.
- [ ] Gram Altın eşleştirmesi doğrulandı.
- [ ] Çeyrek yeni ve eski ayrımı doğrulandı.
- [ ] Yarım yeni ve eski ayrımı doğrulandı.
- [ ] Tam yeni ve eski ayrımı doğrulandı.
- [ ] Ata yeni ve eski ayrımı doğrulandı.
- [ ] Gremse yeni ve eski ayrımı doğrulandı.
- [ ] 14 Ayar fiyatı doğrulandı.
- [ ] 22 Ayar fiyatı doğrulandı.
- [ ] 18 Ayar desteği doğrulandı veya devre dışı bırakıldı.
- [ ] Reşat desteği doğrulandı veya devre dışı bırakıldı.
- [ ] Hamit desteği doğrulandı veya devre dışı bırakıldı.
- [ ] Cumhuriyet ve Ata isim ilişkisi yazılı olarak doğrulandı.
- [ ] Paketli gram ürünleri doğrulandı.
- [ ] Alış alanının anlamı doğrulandı.
- [ ] Satış alanının anlamı doğrulandı.
- [ ] Fiyat para birimi doğrulandı.
- [ ] Fiyatın adet, gram veya ons birimi doğrulandı.
- [ ] Zaman damgası doğrulandı.
- [ ] Eski veri davranışı test edildi.
- [ ] 401, 403, 429 ve 503 yanıtları test edildi.
- [ ] Ticari mobil kullanım hakkı yazılı olarak doğrulandı.
- [ ] Fiyatı veritabanında saklama süresi yazılı olarak doğrulandı.
- [ ] Kaynak gösterme şartı doğrulandı.

---

# 29. Portföy API test listesi

- [ ] Kullanıcı kayıt ekleyebiliyor.
- [ ] Miktar 0 olduğunda reddediliyor.
- [ ] Negatif miktar reddediliyor.
- [ ] Adetli üründe kesirli miktar reddediliyor.
- [ ] Gramlı üründe üçten fazla ondalık reddediliyor.
- [ ] Gelecek alış tarihi reddediliyor.
- [ ] Toplam maliyet 0 olduğunda reddediliyor.
- [ ] Not 500 karakteri aşınca reddediliyor.
- [ ] Alış yeri 100 karakteri aşınca reddediliyor.
- [ ] Devre dışı ürün eklenemiyor.
- [ ] Kullanıcı kendi kaydını düzenleyebiliyor.
- [ ] Kullanıcı kendi kaydını silebiliyor.
- [ ] Silme satış kaydı oluşturmuyor.
- [ ] Fiyat yokken portföy kaydı kaybolmuyor.
- [ ] Fiyat yokken değer 0 gösterilmiyor.
- [ ] Kısmi portföy özeti doğru işaretleniyor.
- [ ] Çıkış sonrası başka kullanıcının önbelleği görünmüyor.

---

# 30. Kesinleştirilmesi gereken açık konular

1. Supabase proje bölgeleri ve seçilecek veri merkezi
2. Supabase'in kullanılacak güncel anahtar türleri
3. Mobil oturum saklama adaptörünün kesin uygulaması
4. Derin bağlantı alan adları ve uygulama şeması
5. Üretim e-posta gönderim hizmeti
6. Şifre politikası
7. Fiyat sağlayıcısının kesin ticari planı
8. Fiyat sağlayıcısının sözleşme koşulları
9. Gerçek ürün ve sembol listesi
10. Cumhuriyet Altını ile Ata Altını eşleştirme kararı
11. Fiyatın eski sayılacağı kesin süre
12. Üretim fiyat çekme sıklığı
13. Olağan dışı fiyat değişim eşiği
14. Fiyat geçmişinin saklama süresi
15. Güvenlik kayıtlarının saklama süresi
16. Yasal olay kayıtlarının saklama ve anonimleştirme yöntemi
17. Hesap silmede başarısızlık telafi yöntemi
18. Portföy hesaplamasının SQL görünümü, RPC veya servis katmanında yapılması
19. Gerçek fiyat sağlayıcısının aynı ürün için birden fazla dış sembol gerektirip gerektirmediğinin doğrulanması. Mevcut V1 kararı değiştirilmedikçe `(source_id, external_symbol)` ve `(source_id, product_id)` benzersizlik kısıtları geçerlidir.
20. Yedek fiyat sağlayıcısına otomatik geçiş yapılıp yapılmayacağı

---

# 31. V1'de bulunmayacak API özellikleri

```text
Favoriler API'si
Fiyat alarmı API'si
Bildirim cihazı API'si
Satış geçmişi API'si
Kısmi satış API'si
Portföy grafiği API'si
Geçmiş fiyat grafiği API'si
Ödeme API'si
Abonelik API'si
Reklam API'si
Belge yükleme API'si
Konum API'si
Mesajlaşma API'si
Sosyal hesap bağlantıları
Google ile giriş
Apple ile giriş
```

---

# 32. İlgili proje belgeleri

Bu belge aşağıdaki dosyalarla birlikte değerlendirilmelidir:

```text
docs/PROJECT_CONTEXT.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/DECISIONS.md
docs/SECURITY.md
docs/PRIVACY.md
docs/DATA_RETENTION.md
docs/TODO.md
docs/CHANGELOG.md
docs/HANDOFF.md
```

Bir API davranışı kişisel veri toplamayı veya saklama süresini değiştiriyorsa `PRIVACY.md` ve `DATA_RETENTION.md` de güncellenmelidir.

Bir API davranışı mimari kararı değiştiriyorsa `DECISIONS.md` güncellenmelidir.

Bir tablo veya alan değişiyorsa `DATABASE.md` güncellenmelidir.

---

# 33. Belge güncelleme kuralı

Aşağıdaki durumlardan birinde bu belge güncellenmelidir:

- Yeni API işlemi eklenmesi
- Supabase entegrasyon yönteminin değişmesi
- Fiyat sağlayıcısının değişmesi
- Fiyat sağlayıcısının yanıt biçiminin değişmesi
- Yeni ürün sembolü eklenmesi
- Hata kodlarının değişmesi
- Kimlik doğrulama akışının değişmesi
- Yeni kişisel veri toplanması
- Hesap silme davranışının değişmesi
- Fiyat çekme sıklığının değişmesi
- Kota veya paket koşullarının değişmesi
- Güvenlik anahtar yönetiminin değişmesi

Değişiklikler ayrıca `CHANGELOG.md` dosyasına kaydedilmeli ve gerekiyorsa `DECISIONS.md` dosyasında gerekçelendirilmelidir.

---

# 34. V1 API karar özeti

1. Backend olarak Supabase kullanılacaktır.
2. Kimlik doğrulama Supabase Auth ile yapılacaktır.
3. Kullanıcı verileri RLS ile korunacaktır.
4. Dış fiyat API'sine yalnızca güvenli sunucu fonksiyonu bağlanacaktır.
5. Fiyat API anahtarı mobil uygulamaya konulmayacaktır.
6. V1 fiyat entegrasyonunda REST kullanılacaktır.
7. Kullanıcı başına dış fiyat isteği yapılmayacaktır.
8. Doğrulanmış ortak fiyatlar PostgreSQL içinde saklanacaktır.
9. Fiyat sağlayıcısı sembolleri merkezi eşleştirme tablosuyla ürünlere bağlanacaktır.
10. Bilinmeyen sembol otomatik ürün oluşturmayacaktır.
11. Satın alma hesabında satış fiyatı kullanılacaktır.
12. Bozdurma ve portföy hesabında alış fiyatı kullanılacaktır.
13. Fiyat yoksa `0` kullanılmayacaktır.
14. Eski fiyat güncel fiyat gibi gösterilmeyecektir.
15. Portföy kayıt sahipliği doğrulanmış oturumdan belirlenecektir.
16. Kullanıcı yalnızca kendi portföy kayıtlarını yönetebilecektir.
17. Hesap silme güvenli sunucu fonksiyonuyla yürütülecektir.
18. İşlem tamamlanmadan başarı mesajı gösterilmeyecektir.
19. API hata yanıtları kullanıcıya güvenli Türkçe mesajlara dönüştürülecektir.
20. Favoriler, alarmlar, bildirimler, satış ve ödeme API'leri V1'de bulunmayacaktır.


---

## Sürüm geçmişi

### 0.2 Taslak - 19.10.2026

- `price_source_product_mappings` tablosunun zaten `DATABASE.md` içinde tanımlandığı belirtildi.
- Tablo alanlarının öneri değil mevcut tasarım olduğu açıklandı.
- Eşleştirme benzersizlik kararları V1 kararıyla uyumlu hâle getirildi.
- Yasal olaylara doğrudan istemci yazımı kapatıldı.
- Güvenli PostgreSQL RPC veya Edge Function sözleşmesi tanımlandı.
- Yasal olaylarda sunucu tarafından belirlenen alanlar açıklandı.

### 0.1 Taslak - 03.09.2026

- İlk API taslağı hazırlandı.