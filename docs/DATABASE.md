# Altın İz V1 Veritabanı Tasarımı

**Belge adı:** `DATABASE.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.4  
**Son güncelleme:** 24.10.2026 
**Durum:** 9 migration dosyası ile Supabase PostgreSQL üzerinde uygulanmış ve doğrulanmıştır.  
**Hedef veritabanı:** Supabase PostgreSQL (eu-central-1 Frankfurt)

---

## 1. Belgenin amacı

Bu belge, Altın İz mobil uygulamasının V1 sürümünde kullanılacak veritabanı tablolarını, alan türlerini, tablolar arasındaki ilişkileri, doğrulama kurallarını, erişim politikalarını ve veri saklama kararlarını tanımlar.

Uygulamanın V1 sürümünde kullanıcılar:

- E-posta ve şifreyle hesap oluşturabilecek.
- E-posta adreslerini doğrulayabilecek.
- Kendi portföylerine altın alış kayıtları ekleyebilecek.
- Alış tarihi ve ödedikleri toplam tutarı saklayabilecek.
- Güncel altın fiyatlarını görüntüleyebilecek.
- Tahmini güncel bozdurma değerlerini görebilecek.
- Tahmini kâr veya zararlarını hesaplayabilecek.
- Kendi kayıtlarını düzenleyebilecek ve silebilecek.
- Hesaplarının ve ilişkili verilerinin silinmesini başlatabilecek.
- Başka kullanıcıların özel verilerine erişemeyecek.

Bu belge V1 kapsamıyla sınırlıdır. Favoriler, fiyat alarmları, bildirimler, satış geçmişi, portföy grafikleri, ödeme ve abonelik tabloları V1 kapsamına dâhil değildir.

---

## 2. Temel tasarım kararları

1. PostgreSQL uyumlu ilişkisel bir veritabanı kullanılacaktır.
2. Kullanıcı hesap kimlikleri `UUID` olacaktır.
3. Kullanıcı şifreleri uygulamanın normal tablolarında saklanmayacaktır.
4. Kimlik doğrulama seçilen güvenli kimlik hizmeti tarafından yönetilecektir.
5. Her kullanıcı yalnızca kendi özel verilerine erişebilecektir.
6. Normal kullanıcılar altın ürünlerini ve fiyat kayıtlarını değiştiremeyecektir.
7. Para tutarları kuruş cinsinden tam sayı olarak saklanacaktır.
8. Türk lirası için `1 TL = 100 kuruş` kabul edilecektir.
9. Miktar değerleri en fazla üç ondalık basamak destekleyecektir.
10. Alış tarihi saat içermeyen `DATE` türünde saklanacaktır.
11. Sistem zamanları `TIMESTAMPTZ` türünde saklanacaktır.
12. Kullanıcıya gösterilecek yerel zaman dönüşümü mobil uygulamada yapılacaktır.
13. Altın ürün adları portföy kayıtlarına serbest metin olarak yazılmayacaktır.
14. Portföy kayıtları merkezi ürün kataloğundaki bir ürüne bağlanacaktır.
15. Her altın alış işlemi ayrı bir portföy kaydı olacaktır.
16. Aynı altının farklı tarihlerdeki alışları otomatik olarak birleştirilmeyecektir.
17. Güncel değer, kâr-zarar ve değişim yüzdesi ana gerçek veri olarak portföy tablosunda saklanmayacaktır.
18. Hesaplanan değerler portföy kaydı ile geçerli son fiyat birleştirilerek yeniden üretilecektir.
19. Fiyat bulunamadığında fiyat alanına `0` yazılmayacaktır.
20. Doğrudan fiyatı bulunmayan ürün için başka bir ürünün fiyatı sessizce kullanılmayacaktır.
21. Geçersiz miktar ve para değerleri hem uygulamada hem veritabanında engellenecektir.
22. Teknik tablo ve alan adları İngilizce olacaktır.
23. Kullanıcı arayüzündeki metinler Türkçe olacaktır.
24. Gizli API anahtarları normal veritabanı tablolarında tutulmayacaktır.
25. Hesap silme işlemi tamamlanmadan kullanıcıya başarılı mesajı gösterilmeyecektir.

---

## 3. Para, miktar ve zaman standartları

### 3.1. Para saklama standardı

Para tutarları kuruş cinsinden `BIGINT` olarak saklanacaktır.

Örnek:

```text
Kullanıcıya gösterilen: 48.000,00 TL
Veritabanında saklanan: 4800000
```

Ana para alanlarının sonunda `_minor` eki bulunacaktır.

Örnekler:

```text
total_cost_minor
buy_price_minor
sell_price_minor
```

### 3.2. Miktar standardı

Portföy miktarı `NUMERIC(18,3)` olarak saklanacaktır.

Örnekler:

```text
4 adet       → 4.000
12,250 gram  → 12.250
```

Ürünün adetle mi, gramla mı kullanıldığı `gold_products.measurement_unit` alanından anlaşılacaktır.

### 3.3. Tarih ve saat standardı

- Alış tarihi: `DATE`
- Oluşturulma ve güncellenme zamanı: `TIMESTAMPTZ`
- Fiyatın kaynaktaki zamanı: `TIMESTAMPTZ`
- Fiyatın sistem tarafından alınma zamanı: `TIMESTAMPTZ`

Veritabanı zamanları standart zaman dilimiyle saklanacak, kullanıcı arayüzünde yerel saate dönüştürülecektir.

---

## 4. Kullanılacak temel veri türleri

### `UUID`

Tahmin edilmesi zor ve benzersiz kayıt kimlikleri için kullanılır.

Kullanım alanları:

- Kullanıcı kimliği
- Portföy kayıt kimliği
- Altın ürün kimliği
- Fiyat kaynağı kimliği
- Veri çekme işlemi kimliği
- Yasal belge kimliği
- Kullanıcı yasal olay kimliği
- Hesap silme talebi kimliği

### `TEXT`

Uzunluğu sabit olmayan metinler için kullanılır.

### `VARCHAR(n)`

Azami karakter uzunluğu belirli kısa metinler için kullanılır.

### `BIGINT`

Kuruş cinsinden para tutarları ve yüksek sayıda oluşabilecek otomatik kayıt kimlikleri için kullanılır.

### `INTEGER`

Sıralama değeri, adet sayacı ve işlem sonucu sayacı gibi tam sayılar için kullanılır.

### `SMALLINT`

Ondalık hassasiyet gibi küçük tam sayılar için kullanılır.

### `NUMERIC(18,3)`

Gram veya adet miktarı gibi hassas ondalıklı değerler için kullanılır.

### `NUMERIC(10,4)`

Günlük değişim yüzdesi gibi oranlar için kullanılır.

### `BOOLEAN`

`true`, `false` veya alan boş bırakılabiliyorsa `null` değerleri için kullanılır.

### `DATE`

Saat içermeyen takvim tarihleri için kullanılır.

### `TIMESTAMPTZ`

Zaman dilimi bilgisiyle birlikte tarih ve saat saklamak için kullanılır.

### `JSONB`

Yalnızca gerekli teknik ayrıntılar gibi değişken yapılı veriler için kullanılır. Portföyün temel kullanıcı verileri `JSONB` içinde saklanmaz.

---

## 5. V1 tablo listesi

### Kullanıcı hesabı

1. `auth.users`
2. `user_profiles`
3. `user_preferences`

### Altın ve fiyat

4. `gold_products`
5. `price_sources`
6. `price_source_product_mappings`
7. `gold_prices`
8. `price_fetch_runs`

### Portföy

9. `portfolio_entries`

### Yasal ve gizlilik

10. `legal_documents`
11. `user_legal_events`
12. `account_deletion_requests`

### Teknik ve güvenlik

13. `security_events`

---

# 6. Kullanıcı hesabı tabloları

## 6.1. `auth.users`

### Amaç

Kullanıcı hesabı, e-posta doğrulama, güvenli şifre ve oturum işlemlerini yönetir. Supabase gibi bir hizmet seçilirse bu tablo hizmet tarafından sağlanır ve doğrudan uygulama tablosu gibi değiştirilmez.

### Alanlar

#### `id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
Açıklama: Kullanıcının benzersiz ve güvenli kimliği
```

#### `email`

```text
Tür: TEXT
Zorunlu: Evet
Benzersiz: Evet
Açıklama: Kullanıcının giriş yapacağı e-posta adresi
```

E-posta adresinin büyük-küçük harf ve benzersizlik davranışı seçilecek kimlik doğrulama hizmetinin kurallarına göre doğrulanacaktır.

#### `encrypted_password`

```text
Tür: Kimlik doğrulama hizmeti tarafından yönetilir
Zorunlu: Hizmete bağlı
Açıklama: Şifrenin güvenli biçimde saklanan karşılığı
```

Kurallar:

- Mobil uygulamaya gönderilmez.
- Düz metin olarak saklanmaz.
- `user_profiles` tablosuna kopyalanmaz.
- Yönetici arayüzünde gösterilmez.

#### `email_confirmed_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Hayır
Açıklama: E-posta adresinin doğrulandığı zaman
```

Alan boşsa e-posta henüz doğrulanmamıştır.

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Açıklama: Kullanıcı hesabının oluşturulma zamanı
```

#### `last_sign_in_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Hayır
Açıklama: Son başarılı giriş zamanı
```

### Önemli güvenlik kararı

```text
Kimlik doğrulama ve şifre → auth.users
Uygulama profil bilgileri → user_profiles
```

---

## 6.2. `user_profiles`

### Amaç

Kullanıcının uygulamaya ait sınırlı profil bilgilerini ve hesap durumunu tutar. Her kullanıcı için en fazla bir profil kaydı bulunur.

### Alanlar

#### `user_id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
Yabancı anahtar: auth.users.id
Silme davranışı: Hesap silme sürecine göre kontrollü silme
```

#### `display_name`

```text
Tür: VARCHAR(50)
Zorunlu: Hayır
Azami uzunluk: 50 karakter
Açıklama: Kullanıcının uygulamada görünen isteğe bağlı adı
```

Kullanıcı adını girmezse ana sayfada genel bir karşılama metni gösterilir.

#### `account_status`

```text
Tür: TEXT
Zorunlu: Evet
Varsayılan: active
```

Kabul edilen değerler:

```text
active
deletion_pending
disabled
```

> Uygulamada gerçek değer `deletion_pending` olarak boşluksuz saklanacaktır.

Anlamları:

- `active`: Hesap normal şekilde kullanılabilir.
- `deletion_pending`: Hesap silme işlemi devam etmektedir.
- `disabled`: Hesap güvenlik veya yönetim gerekçesiyle devre dışıdır.

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Kullanıcı değiştirebilir: Hayır
```

#### `updated_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Otomatik güncelleme: Evet
```

### Saklanmayacak veriler

V1 kapsamında bu tabloda şunlar bulunmaz:

- TC kimlik numarası
- Telefon numarası
- Açık adres
- Doğum tarihi
- Profil fotoğrafı
- Cinsiyet
- Meslek
- Banka hesabı
- Kredi kartı bilgisi

---

## 6.3. `user_preferences`

### Amaç

Kullanıcının uygulama görünümü ve temel yerelleştirme tercihlerini tutar. Her kullanıcı için en fazla bir tercih kaydı bulunur.

### Alanlar

#### `user_id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
Yabancı anahtar: auth.users.id
```

#### `theme`

```text
Tür: TEXT
Zorunlu: Evet
Varsayılan: system
```

Kabul edilen değerler:

```text
light
dark
system
```

#### `language_code`

```text
Tür: VARCHAR(10)
Zorunlu: Evet
Varsayılan: tr
```

V1 yalnızca Türkçe olsa da gelecekte genişletme için saklanır.

#### `currency_code`

```text
Tür: CHAR(3)
Zorunlu: Evet
Varsayılan: TRY
```

V1 portföy hesaplamalarında yalnızca `TRY` kullanılır.

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
```

#### `updated_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Otomatik güncelleme: Evet
```

### V1’de bulunmayacak tercih alanları

```text
price_notifications_enabled
marketing_notifications_enabled
favorite_sort_order
```

Bu özellikler V1’de bulunmadığı için ilgili alanlar şimdilik oluşturulmaz.

---

# 7. Altın ürünü ve fiyat tabloları

## 7.1. `gold_products`

### Amaç

Uygulamanın desteklediği altın ürünlerini merkezi olarak tanımlar. Kullanıcı portföye serbest metinle ürün adı yazamaz, bu tablodaki aktif ürünlerden seçim yapar.

### Alanlar

#### `id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
```

#### `code`

```text
Tür: VARCHAR(50)
Zorunlu: Evet
Benzersiz: Evet
Normal şartlarda değiştirilebilir: Hayır
```

Örnek değerler:

```text
GRAM_GOLD
QUARTER_GOLD_NEW
QUARTER_GOLD_OLD
HALF_GOLD_NEW
HALF_GOLD_OLD
FULL_GOLD_NEW
FULL_GOLD_OLD
REPUBLIC_GOLD
ATA_GOLD_NEW
ATA_GOLD_OLD
GREMSE_GOLD_NEW
GREMSE_GOLD_OLD
RESAT_GOLD
HAMIT_GOLD
GOLD_14K
GOLD_18K
GOLD_22K
PACKAGED_GOLD_1G
PACKAGED_GOLD_2_5G
PACKAGED_GOLD_5G
PACKAGED_GOLD_10G
PACKAGED_GOLD_20G
PACKAGED_GOLD_50G
PACKAGED_GOLD_100G
OUNCE_GOLD
```

#### `name`

```text
Tür: VARCHAR(100)
Zorunlu: Evet
Açıklama: Kullanıcıya gösterilecek tam ürün adı
```

#### `short_name`

```text
Tür: VARCHAR(50)
Zorunlu: Hayır
Açıklama: Küçük kartlarda kullanılabilecek kısa ad
```

#### `category`

```text
Tür: TEXT
Zorunlu: Evet
```

Kabul edilen değerler:

```text
gram
coin
karat
international
packaged
```

Anlamları:

- `gram`: Gramla girilen standart altın.
- `coin`: Adetle girilen ziynet veya sikke altın.
- `karat`: 14, 18 veya 22 ayar ürün.
- `international`: Ons gibi uluslararası gösterge.
- `packaged`: Belirli gramaja sahip paketli altın.

#### `measurement_unit`

```text
Tür: TEXT
Zorunlu: Evet
```

Kabul edilen değerler:

```text
piece
gram
ounce
```

#### `quantity_precision`

```text
Tür: SMALLINT
Zorunlu: Evet
İzin verilen aralık: 0 ile 3
```

Örnekler:

```text
Çeyrek Altın → 0
Gram Altın   → 3
22 Ayar      → 3
```

#### `package_weight_grams`

```text
Tür: NUMERIC(10,3)
Zorunlu: Hayır
Kural: Doluysa 0'dan büyük olmalı
Açıklama: Paketli ürünün tek adedindeki gram miktarı
```

Örnekler:

```text
5 gram paketli altın  → 5.000
10 gram paketli altın → 10.000
```

#### `portfolio_enabled`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: true
Açıklama: Ürünün portföye eklenip eklenemeyeceği
```

V1 örneği:

```text
Ons Altın    → false
Çeyrek Altın → true
```

#### `calculator_enabled`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: true
Açıklama: Ürünün hesaplama sayfasında kullanılıp kullanılamayacağı
```

#### `price_display_enabled`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: true
Açıklama: Ürünün fiyat listesinde gösterilip gösterilmeyeceği
```

#### `sort_order`

```text
Tür: INTEGER
Zorunlu: Evet
Varsayılan: 0
Açıklama: Ürünlerin kullanıcı arayüzündeki sırası
```

#### `is_active`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: true
Açıklama: Ürünü silmeden kullanım dışı bırakır
```

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
```

#### `updated_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Otomatik güncelleme: Evet
```

### Ürün kuralları

- `code` benzersiz olmalıdır.
- `measurement_unit` izin verilen değerlerden biri olmalıdır.
- `quantity_precision` 0 ile 3 arasında olmalıdır.
- `package_weight_grams`, yalnızca paketli ürünlerde kullanılmalıdır.
- Paket ağırlığı doluysa 0'dan büyük olmalıdır.
- Portföye açık ürünün V1 hesaplama kurallarıyla uyumlu doğrudan fiyatı bulunmalıdır.
- Ons altın V1’de fiyat olarak gösterilebilir, ancak portföye eklenmez.

---

## 7.2. `price_sources`

### Amaç

Altın fiyatlarının alındığı dış kaynağı veya hizmeti tanımlar.

### Alanlar

#### `id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
```

#### `code`

```text
Tür: VARCHAR(50)
Zorunlu: Evet
Benzersiz: Evet
Açıklama: Fiyat kaynağının teknik kodu
```

#### `name`

```text
Tür: VARCHAR(150)
Zorunlu: Evet
Açıklama: Kaynağın kullanıcıya veya yöneticiye gösterilecek adı
```

#### `website_url`

```text
Tür: TEXT
Zorunlu: Hayır
Açıklama: Fiyat kaynağının resmî internet adresi
```

#### `timezone`

```text
Tür: VARCHAR(50)
Zorunlu: Evet
Varsayılan: Europe/Istanbul
```

#### `expected_update_interval_seconds`

```text
Tür: INTEGER
Zorunlu: Hayır
Kural: Doluysa 0'dan büyük olmalı
Açıklama: Kaynağın genel beklenen yaklaşık güncelleme aralığı
```

Bu alan fiyatın güncel veya eski olarak değerlendirilmesinde yardımcı olur.

#### `priority`

```text
Tür: SMALLINT
Zorunlu: Evet
Varsayılan: 1
Kural: 0'dan büyük olmalı (1 = en yüksek öncelikli birincil kaynak)
Açıklama: Aynı ürün için birden fazla aktif kaynak bulunduğunda hangi kaynağın seçileceğini belirleyen öncelik sırası
```

#### `is_active`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: true
Açıklama: Fiyat kaynağının yeni fiyat işlemlerinde kullanılıp kullanılmayacağını belirtir. Devre dışı bırakılan kaynağın zamanlanmış görev tarafından çağrılmaması gerekir; ancak geçmiş fiyat verileri denetim ve saklama politikası gereği silinmez.
```

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
```

#### `updated_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Otomatik güncelleme: Evet
```

### Saklanmayacak bilgiler

Fiyat servisinin gizli API anahtarı bu tabloda tutulmaz. Anahtar yalnızca güvenli sunucu ortamının gizli değişken yönetiminde saklanır ve mobil uygulamaya gönderilmez.

---

## 7.3. `price_source_product_mappings`

### Amaç

Dış fiyat sağlayıcılarının kullandığı sembolleri Altın İz içindeki merkezi altın ürünleriyle eşleştirir.

Bu tablo sayesinde:

- Dış sağlayıcının teknik sembolleri uygulamanın her yerine yayılmaz.
- Aynı ürün farklı sağlayıcılardaki farklı sembollerle eşleştirilebilir.
- Bir fiyat sağlayıcısı değiştirildiğinde portföy kayıtları bozulmaz.
- Eski ve yeni tarihli sarrafiye ürünleri ayrı ayrı yönetilebilir.
- Bilinmeyen bir dış sembolün yanlış ürüne otomatik bağlanması engellenir.
- Bir eşleştirme silinmeden geçici olarak devre dışı bırakılabilir.

Örnek:

```text
Dış sağlayıcı sembolü: CEYREK_YENI
Altın İz ürün kodu: QUARTER_GOLD_NEW
Kullanıcıya gösterilen ad: Çeyrek Altın, Yeni Tarihli
```

### Alanlar

#### `id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
Sistem tarafından oluşturulur: Evet
```

#### `source_id`

```text
Tür: UUID
Zorunlu: Evet
Yabancı anahtar: price_sources.id
Açıklama: Dış sembolün ait olduğu fiyat sağlayıcısı
```

#### `product_id`

```text
Tür: UUID
Zorunlu: Evet
Yabancı anahtar: gold_products.id
Açıklama: Dış sembolün eşleştirildiği Altın İz ürünü
```

#### `external_symbol`

```text
Tür: VARCHAR(100)
Zorunlu: Evet
Açıklama: Fiyat sağlayıcısının kullandığı değişmez teknik sembol
```

Örnekler:

```text
ALTIN
CEYREK_YENI
CEYREK_ESKI
YARIM_YENI
ATA_YENI
AYAR22
```

Dış sembol, karşılaştırmadan önce baş ve son boşluklardan temizlenir. Sağlayıcının sembolleri büyük-küçük harfe duyarsız tanımlıyorsa normalleştirme yöntemi sağlayıcı bazında uygulanır.

#### `external_name`

```text
Tür: VARCHAR(200)
Zorunlu: Hayır
Açıklama: Sağlayıcının sembol için verdiği açıklayıcı ad
```

Bu alan kullanıcı arayüzündeki ana ürün adı değildir. Kullanıcıya gösterilen ad `gold_products.name` alanından alınır.

#### `external_category`

```text
Tür: VARCHAR(100)
Zorunlu: Hayır
Açıklama: Sağlayıcının ürünü yerleştirdiği dış kategori
```

Örnekler:

```text
MADEN
GRAM ALTIN
SARRAFIYE
```

#### `is_active`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: true
Açıklama: Eşleştirmenin fiyat işleme sürecinde kullanılıp kullanılmayacağı
```

`false` olduğunda dış sembolden gelen fiyat işlenmez. Eski kayıtların bağlantısı ve denetim izi korunabilir.

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Kullanıcı değiştirebilir: Hayır
```

#### `updated_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Otomatik güncelleme: Evet
```

### Benzersizlik kuralları

Kesin V1 kuralları:

```text
(source_id, external_symbol) benzersiz olmalı
(source_id, product_id) benzersiz olmalı
```

Böylece:

- Aynı sağlayıcıdaki bir dış sembol iki farklı ürüne bağlanamaz.
- Aynı Altın İz ürünü aynı sağlayıcı içinde iki farklı aktif sembole bağlanamaz.

Bir sağlayıcının gelecekte aynı ürün için birden fazla zorunlu sembol kullanması gerekirse ikinci kural değiştirilmeden önce `DECISIONS.md`, `API.md` ve bu belge güncellenir.

### Doğrulama ve iş kuralları

1. `source_id` mevcut bir fiyat kaynağına ait olmalıdır.
2. `product_id` mevcut bir altın ürününe ait olmalıdır.
3. `external_symbol` boş olamaz.
4. `external_symbol` 100 karakteri aşamaz.
5. Aynı sağlayıcı ve sembol birleşimi yalnızca bir kez bulunabilir.
6. Aynı sağlayıcı ve ürün birleşimi yalnızca bir kez bulunabilir.
7. Sağlayıcı aktif değilse eşleştirme kullanılarak yeni fiyat işlenmez.
8. Eşleştirme aktif değilse dış fiyat işlenmez.
9. Ürün aktif değilse yeni fiyat kullanıcıya açık fiyat olarak sunulmaz.
10. Bilinmeyen dış sembol için otomatik `gold_products` kaydı oluşturulmaz.
11. Bilinmeyen dış sembol güvenli teknik olay veya fiyat çekme sonucu içinde reddedilmiş ürün olarak kaydedilir.
12. Cumhuriyet Altını ile Ata Altını yalnızca isim benzerliğine dayanılarak eşleştirilmez.
13. Eski ve yeni tarihli ürünler ayrı `gold_products` kayıtlarıyla eşleştirilir.
14. `external_name` veya `external_category`, uygulamanın kullanıcıya gösterdiği ürün adını otomatik değiştirmez.
15. Normal kullanıcılar eşleştirme oluşturamaz, değiştiremez veya silemez.

### Silme davranışı

- Kullanılmış eşleştirmeler fiziksel olarak hemen silinmez, öncelikle `is_active = false` yapılır.
- Bir fiyat kaynağı geçmiş fiyatlarda kullanılmışsa kaynak kaydı ve eşleştirmeleri kontrollü biçimde devre dışı bırakılır.
- Bir altın ürünü portföy veya fiyat geçmişinde kullanılmışsa ürün ve eşleştirme fiziksel olarak silinmez.
- Kesin yabancı anahtar silme davranışları SQL uygulama aşamasında geçmiş veri ve denetim ihtiyacına göre belirlenir.

### Örnek kayıt

```text
id: Oluşturulan UUID
source_id: AltinAPI kaynak UUID değeri
product_id: Çeyrek Altın, Yeni Tarihli ürün UUID değeri
external_symbol: CEYREK_YENI
external_name: Çeyrek Altın (Yeni Cumhuriyet)
external_category: SARRAFIYE
is_active: true
created_at: Sistem zamanı
updated_at: Sistem zamanı
```

---

## 7.4. `price_fetch_runs`

### Amaç

Fiyat servisinden veri çekme işlemlerinin başlangıç, sonuç ve hata bilgilerini tutar. Kullanıcıya doğrudan gösterilmez. Sistem sağlığı ve hata çözümü için kullanılır.

### Alanlar

#### `id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
```

#### `source_id`

```text
Tür: UUID
Zorunlu: Evet
Yabancı anahtar: price_sources.id
```

#### `started_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
```

#### `completed_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Hayır
```

#### `status`

```text
Tür: TEXT
Zorunlu: Evet
```

Kabul edilen değerler:

```text
running
success
partial
failed
```

#### `products_received`

```text
Tür: INTEGER
Zorunlu: Evet
Varsayılan: 0
Kural: Negatif olamaz
```

#### `products_saved`

```text
Tür: INTEGER
Zorunlu: Evet
Varsayılan: 0
Kural: Negatif olamaz
```

#### `products_rejected`

```text
Tür: INTEGER
Zorunlu: Evet
Varsayılan: 0
Kural: Negatif olamaz
```

#### `error_code`

```text
Tür: VARCHAR(100)
Zorunlu: Hayır
```

#### `error_message`

```text
Tür: TEXT
Zorunlu: Hayır
```

Bu alanlarda API anahtarı, erişim belirteci, şifre veya başka bir gizli bilgi bulunamaz.

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
```

### İş kuralları

- `completed_at`, işlem tamamlandığında doldurulur.
- `success`, bütün geçerli ürünlerin kaydedildiğini ifade eder.
- `partial`, bazı ürünlerin kaydedildiğini ve bazılarının reddedildiğini ifade eder.
- `failed`, kullanılabilir fiyat verisi kaydedilemediğini ifade eder.
- Sayaç alanları negatif olamaz.

---

## 7.5. `gold_prices`

### Amaç

Altın ürünlerinin kaynak bazında alış, satış ve isteğe bağlı piyasa bilgilerini tutar. V1’de en son geçerli fiyatı bulmak için kullanılır. Geçmiş fiyat kayıtlarının saklanması ileride grafik altyapısına temel oluşturabilir.

### Alanlar

#### `id`

```text
Tür: BIGINT
Zorunlu: Evet
Birincil anahtar: Evet
Otomatik artan: Evet
```

#### `product_id`

```text
Tür: UUID
Zorunlu: Evet
Yabancı anahtar: gold_products.id
```

#### `source_id`

```text
Tür: UUID
Zorunlu: Evet
Yabancı anahtar: price_sources.id
```

#### `buy_price_minor`

```text
Tür: BIGINT
Zorunlu: Hayır
Kural: Doluysa 0'dan büyük olmalı
Açıklama: Ürünün alış fiyatı, para biriminin en küçük biriminde
```

Fiyat bulunamazsa `null` kullanılır, `0` kullanılmaz.

#### `sell_price_minor`

```text
Tür: BIGINT
Zorunlu: Hayır
Kural: Doluysa 0'dan büyük olmalı
Açıklama: Ürünün satış fiyatı, para biriminin en küçük biriminde
```

Fiyat bulunamazsa `null` kullanılır, `0` kullanılmaz.

#### `currency_code`

```text
Tür: CHAR(3)
Zorunlu: Evet
Varsayılan: TRY
```

Örnekler:

```text
TRY
USD
EUR
```

V1 portföy hesabına yalnızca uygun `TRY` fiyatları dâhil edilir. Ons fiyatı kaynaktan USD gelebilir ancak V1 portföyüne eklenmez.

#### `price_unit`

```text
Tür: TEXT
Zorunlu: Evet
```

Kabul edilen değerler:

```text
piece
gram
ounce
```

Değer, ilgili ürünün ölçü birimiyle uyumlu olmalıdır.

#### `daily_change_percent`

```text
Tür: NUMERIC(10,4)
Zorunlu: Hayır
Açıklama: Kaynağın sağladığı günlük fiyat değişim yüzdesi
```

Örnek:

```text
Saklanan: 1.2547
Gösterilen: +%1,25
```

#### `day_low_minor`

```text
Tür: BIGINT
Zorunlu: Hayır
Kural: Doluysa 0'dan büyük olmalı
```

#### `day_high_minor`

```text
Tür: BIGINT
Zorunlu: Hayır
Kural: Doluysa 0'dan büyük olmalı
```

#### `source_price_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Açıklama: Fiyatın kaynak sistemde ait olduğu zaman
```

#### `fetched_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Açıklama: Altın İz sisteminin fiyatı aldığı zaman
```

#### `fetch_run_id`

```text
Tür: UUID
Zorunlu: Hayır
Yabancı anahtar: price_fetch_runs.id
```

#### `is_provider_stale`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: false
Açıklama: Fiyat sağlayıcısının veriyi eski veya gecikmeli olarak işaretleyip işaretlemediği
```

#### `is_valid`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: true
```

#### `validation_message`

```text
Tür: TEXT
Zorunlu: Hayır
Açıklama: Geçersiz fiyatın reddedilme veya işaretlenme nedeni
```

Örnekler:

```text
Alış fiyatı negatif geldi.
Satış fiyatı beklenmeyen biçimde geldi.
Ürün eşleştirmesi bulunamadı.
```

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
```

### Fiyat doğrulama kuralları

- `buy_price_minor` boş veya 0'dan büyük olmalıdır.
- `sell_price_minor` boş veya 0'dan büyük olmalıdır.
- Alış ve satış alanlarından en az biri dolu olmalıdır.
- Fiyat bulunamadığında `0` yazılmamalıdır.
- `day_low_minor` ve `day_high_minor` boş veya pozitif olmalıdır.
- Her fiyatın para birimi açıkça belirtilmelidir.
- `price_unit`, bağlı ürünün birimiyle uyumlu olmalıdır.
- Portföy hesabında yalnızca geçerli alış fiyatı kullanılır.
- Satın alma hesabında yalnızca geçerli satış fiyatı kullanılır.
- Normal kullanıcılar fiyat ekleyemez, değiştiremez veya silemez.

### Güncel fiyatı bulma kuralı

Her ürün için aşağıdaki koşulları sağlayan kayıt (`price_sources.priority ASC, source_price_at DESC` sırasıyla) kullanılır:

```text
Ürün eşleşiyor
Fiyat kaynağı aktif (öncelik sırası en yüksek olan kaynak tercih edilir)
Fiyat kaydı geçerli (is_valid = true)
Para birimi işlem için uygun
Gerekli alış veya satış fiyatı mevcut
Kaynak zamanı en yeni
```

Kullanım:

```text
Portföy değeri     → En son geçerli alış fiyatı
Bozdurma hesabı    → En son geçerli alış fiyatı
Satın alma hesabı  → En son geçerli satış fiyatı
```

Başka bir ürünün fiyatı yedek olarak kullanılmaz.

---

**Kaynak önceliği ve yedek geçiş kuralı:** 

V1'de otomatik yedek sağlayıcı geçişi yoktur; yedek kaynak yalnızca yetkili konfigürasyon değişikliğiyle aktif edilir. Dolayısıyla en yüksek öncelikli (`priority = 1`) aktif kaynağın son geçerli fiyatı eski (`stale`) olsa bile kullanılır ve kullanıcıya açıkça `stale` (son bilinen fiyat) uyarısıyla gösterilir.

# 8. Portföy tablosu

## 8.1. `portfolio_entries`

### Amaç

Kullanıcının yaptığı her altın alışını ayrı bir kayıt olarak tutar. Uygulamanın ana kullanıcı tablosudur.

### Alanlar

#### `id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
Sistem tarafından oluşturulur: Evet
```

#### `user_id`

```text
Tür: UUID
Zorunlu: Evet
Yabancı anahtar: auth.users.id
Açıklama: Kaydın sahibi
```

Bu alan formda kullanıcıya gösterilmez ve kullanıcı tarafından yazılmaz. Güvenli oturumdan alınır.

#### `product_id`

```text
Tür: UUID
Zorunlu: Evet
Yabancı anahtar: gold_products.id
```

Yalnızca `portfolio_enabled = true` olan aktif ürünler seçilebilir.

#### `quantity`

```text
Tür: NUMERIC(18,3)
Zorunlu: Evet
Kural: 0'dan büyük olmalı
```

Örnekler:

```text
4 adet       → 4.000
12,250 gram  → 12.250
```

Ürün adetle ölçülüyorsa miktarın kesirli kısmı olmamalıdır. Ürün gramla ölçülüyorsa en fazla üç ondalık basamak kullanılabilir.

#### `purchase_date`

```text
Tür: DATE
Zorunlu: Evet
Kural: Bugünden sonraki bir tarih olamaz
```

Saat bilgisi saklanmaz. Kullanıcının gerçek alış tarihidir.

#### `total_cost_minor`

```text
Tür: BIGINT
Zorunlu: Evet
Kural: 0'dan büyük olmalı
Açıklama: Kullanıcının alış için gerçekte ödediği toplam tutar, kuruş cinsinden
```

Bu değer:

- Kullanıcı tarafından girilir.
- Güncel piyasa fiyatından otomatik oluşturulmaz.
- İşçilik ve komisyon dâhil gerçek ödemeyi temsil edebilir.

#### `purchase_place`

```text
Tür: VARCHAR(100)
Zorunlu: Hayır
Azami uzunluk: 100 karakter
```

Örnekler:

```text
Kapalıçarşı
Örnek Kuyumcu
Banka altın hesabı
```

Konum izni veya harita kullanılmaz.

#### `note`

```text
Tür: VARCHAR(500)
Zorunlu: Hayır
Azami uzunluk: 500 karakter
```

Not yalnızca kayıt sahibi tarafından görülebilir. Metin çalıştırılabilir kod olarak değerlendirilmez.

#### `labor_included`

```text
Tür: BOOLEAN
Zorunlu: Hayır
```

Anlamı:

```text
true  → Ödenen toplam tutara işçilik dâhil
false → İşçilik dâhil değil
null  → Belirtilmedi
```

İşçilik V1’de ayrıca hesaplanmaz. Bu alan yalnızca açıklayıcı bilgidir.

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Kullanıcı değiştirebilir: Hayır
```

#### `updated_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Otomatik güncelleme: Evet
```

### Saklanmayacak hesaplama alanları

Aşağıdaki alanlar `portfolio_entries` tablosunda ana veri olarak saklanmaz:

```text
current_price_minor
current_value_minor
profit_loss_minor
profit_loss_percentage
```

Bu değerler fiyat değiştikçe eskiyeceği için sorgu veya servis katmanında yeniden hesaplanır.

### Portföy doğrulama kuralları

```text
quantity > 0
total_cost_minor > 0
purchase_date <= bugün
note uzunluğu <= 500
purchase_place uzunluğu <= 100
```

Ek ürün kuralları:

- Adetle kullanılan üründe `quantity` tam sayı olmalıdır.
- Gramla kullanılan üründe en fazla üç ondalık basamak bulunabilir.
- Ürün aktif olmalıdır.
- Ürün portföy kullanımına açık olmalıdır.
- Kullanıcı kimliği güvenli oturumdan alınmalıdır.

### Aynı altının farklı tarihlerde alınması

Her alış ayrı kayıttır.

Örnek:

```text
10.06.2026 → 2 çeyrek → 20.000 TL
20.08.2026 → 4 çeyrek → 48.000 TL
01.09.2026 → 1 çeyrek → 13.000 TL
```

Bu üç işlem üç ayrı `portfolio_entries` kaydı olarak saklanır. Sistem kayıtları otomatik birleştirmez.

---

# 9. Hesaplama kuralları

## 9.1. Tahmini güncel bozdurma değeri

Portföy kaydının değeri güncel alış fiyatıyla hesaplanır.

```text
Tahmini Güncel Bozdurma Değeri = Miktar × Güncel Alış Fiyatı
```

Adet örneği:

```text
4 çeyrek × 12.800,00 TL = 51.200,00 TL
```

Gram örneği:

```text
15 gram × 6.150,00 TL/gram = 92.250,00 TL
```

## 9.2. Tahmini kâr veya zarar

```text
Tahmini Kâr/Zarar = Tahmini Güncel Bozdurma Değeri - Ödenen Toplam Tutar
```

## 9.3. Kâr-zarar yüzdesi

```text
Kâr-Zarar Yüzdesi = (Tahmini Kâr/Zarar ÷ Ödenen Toplam Tutar) × 100
```

Yüzdeler ana veri olarak saklanmaz. Tam hassasiyetle hesaplanır ve kullanıcıya gösterilirken iki ondalık basamağa yuvarlanır.

## 9.4. Portföy toplamları

```text
Toplam Ödenen Tutar = Tüm kayıtların total_cost_minor toplamı
```

```text
Hesaplanabilen Kayıtların Maliyeti = Geçerli fiyatı bulunan kayıtların total_cost_minor toplamı
```

```text
Toplam Tahmini Bozdurma Değeri = Hesaplanabilen tüm kayıtların tahmini değerleri toplamı
```

```text
Toplam Kâr/Zarar (Tam Portföy) = Toplam Tahmini Bozdurma Değeri - Toplam Ödenen Tutar
```

```text
Toplam Değişim Yüzdesi (Tam Portföy) = (Toplam Kâr/Zarar ÷ Toplam Ödenen Tutar) × 100
```

Her kaydın yüzdesi toplanarak toplam yüzde hesaplanmaz.

## 9.5. Fiyat bulunamayan kayıt

Bir ürünün geçerli alış fiyatı yoksa:

- Portföy kaydı silinmez.
- Değeri `0 TL` kabul edilmez.
- Kâr veya zarar hesaplanmaz.
- Kullanıcıya `Fiyat bilgisi alınamadı` durumu gösterilir.

Bir veya daha fazla ürün hesaplanamıyorsa toplam:

```text
Kısmi toplam
```

olarak işaretlenir. Hesaplanamayan kayıtların maliyetleri nedeniyle yanıltıcı toplam kâr-zarar gösterilmez.

## 9.6. Eski fiyat

Son bilinen fiyat kullanılıyorsa:

- Son fiyat zamanı gösterilir.
- Sonuç canlı değer olarak adlandırılmaz.
- Kullanıcıya son bilinen fiyatlarla hesaplandığı belirtilir.
- Fiyatın eski sayılma süresi, fiyat kaynağının beklenen güncelleme aralığına göre belirlenir.

---

# 10. Yasal ve gizlilik tabloları

## 10.1. `legal_documents`

### Amaç

KVKK aydınlatma metni, gizlilik politikası, kullanım koşulları, veri saklama politikası ve finansal bilgilendirme metni gibi belgelerin sürümlerini saklar.

### Alanlar

#### `id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
```

#### `document_type`

```text
Tür: TEXT
Zorunlu: Evet
```

V1 için kabul edilen değerler:

```text
kvkk_notice
privacy_policy
terms_of_use
data_retention
financial_disclaimer
explicit_consent
```

`explicit_consent` yalnızca gerçekten açık rıza gerektiren ayrı bir işlem bulunursa kullanılır.

#### `version`

```text
Tür: VARCHAR(30)
Zorunlu: Evet
```

Örnekler:

```text
1.0
1.1
2026-09-03
```

Aynı belge türü ve sürüm birleşimi benzersiz olmalıdır.

#### `title`

```text
Tür: VARCHAR(200)
Zorunlu: Evet
```

#### `content`

```text
Tür: TEXT
Zorunlu: Evet
Açıklama: Belgenin tam içeriği
```

#### `content_hash`

```text
Tür: TEXT
Zorunlu: Evet
Açıklama: Belge içeriğinin bütünlüğünü doğrulamaya yardımcı olan özet değer
```

#### `is_active`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: false
```

Her belge türü için aynı anda yalnızca bir aktif sürüm bulunmalıdır.

#### `requires_action`

```text
Tür: BOOLEAN
Zorunlu: Evet
Varsayılan: false
```

Belgenin kullanıcıdan ayrıca eylem gerektirip gerektirmediğini belirtir. Aydınlatma metni için gereksiz onay oluşturulmaz. Son kullanım hukuk incelemesine göre kesinleştirilir.

#### `published_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Hayır
```

#### `effective_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Açıklama: Belgenin yürürlüğe girdiği zaman
```

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
```

#### `updated_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Otomatik güncelleme: Evet
```

---

## 10.2. `user_legal_events`

### Amaç

Belirli bir yasal belge sürümünün kullanıcıya ne zaman sunulduğunu, görüntülendiğini ve gerekiyorsa kullanıcının hangi tercihte bulunduğunu olay bazında kaydeder.

Aydınlatma ve açık rıza tek bir genel kabul kaydına dönüştürülmez.

### Alanlar

#### `id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
```

#### `user_id`

```text
Tür: UUID
Zorunlu: Hayır (Kayıt oluşturulurken zorunludur; hesap silindiğinde anonimleştirme için NULL yapılabilir)
Yabancı anahtar: auth.users.id (ON DELETE SET NULL)
```

#### `document_id`

```text
Tür: UUID
Zorunlu: Evet
Yabancı anahtar: legal_documents.id
```

#### `event_type`

```text
Tür: TEXT
Zorunlu: Evet
```

Kabul edilen değerler:

```text
presented
viewed
accepted
declined
withdrawn
```

Her olay her belge türü için kullanılmaz.

Örnek:

```text
Aydınlatma metni → presented
Açık rıza        → accepted, declined veya withdrawn
```

#### `event_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
```

#### `document_version`

```text
Tür: VARCHAR(30)
Zorunlu: Evet
Açıklama: Olay anındaki belge sürümünün değişmez kaydı
```

#### `source`

```text
Tür: TEXT
Zorunlu: Evet
```

Kabul edilen değerler:

```text
registration
settings
document_update
account_deletion
```

#### `app_version`

```text
Tür: VARCHAR(30)
Zorunlu: Hayır
```

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
```

### Gizlilik kuralı

IP adresi gibi ek kişisel veriler ihtiyaç, hukuki amaç, saklama süresi ve güvenlik yöntemi belirlenmeden bu tabloya eklenmez.

---

## 10.3. `account_deletion_requests`

### Amaç

Kullanıcının hesap ve veri silme sürecini durum bazında takip eder. İşlem yarıda kesilirse hesabın silinmiş gibi gösterilmesini önler.

### Alanlar

#### `id`

```text
Tür: UUID
Zorunlu: Evet
Birincil anahtar: Evet
```

#### `user_id`

```text
Tür: UUID
Zorunlu: Hayır (Kayıt oluşturulurken zorunludur; hesap silindiğinde anonimleştirme için NULL yapılabilir)
Yabancı anahtar: auth.users.id (ON DELETE SET NULL)
```

#### `status`

```text
Tür: TEXT
Zorunlu: Evet
Varsayılan: requested
```

Kabul edilen değerler:

```text
requested
identity_verification_required
processing
completed
failed
cancelled
```

#### `requested_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
```

#### `identity_verified_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Hayır
```

#### `processing_started_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Hayır
```

#### `completed_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Hayır
```

#### `failure_code`

```text
Tür: VARCHAR(100)
Zorunlu: Hayır
```

#### `failure_message`

```text
Tür: TEXT
Zorunlu: Hayır
```

Bu alanda şifre, oturum belirteci, API anahtarı veya başka bir gizli bilgi tutulmaz.

#### `created_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
```

#### `updated_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
Varsayılan: Veritabanı sistem zamanı
Otomatik güncelleme: Evet
```

### Hesap silme işlem sırası

```text
1. Kullanıcı yeniden doğrulanır.
2. Silme talebi oluşturulur.
3. Hesap durumu deletion_pending yapılır.
4. Portföy kayıtları silinir.
5. Kullanıcı tercihleri silinir.
6. Kullanıcıya bağlı yasal ve güvenlik kayıtları saklama kurallarına göre ele alınır.
7. Kullanıcı profili silinir.
8. Kimlik doğrulama hesabı silinir.
9. Kişisel veri içermeyen tamamlanma kaydının gerekliliği değerlendirilir.
10. Bütün aktif oturumlar sonlandırılır.
```

Kullanıcı hesabıyla birlikte silme talebi kaydı da silinecekse, kişisel veri içermeyen teknik sonuç kaydının tutulup tutulmayacağı hukuk ve güvenlik incelemesinde kararlaştırılır.

---

# 11. Teknik ve güvenlik tablosu

## 11.1. `security_events`

### Amaç

Yalnızca gerekli ve sınırlı güvenlik olaylarını kaydeder. Kullanıcının her hareketini izleyen genel bir davranış takip tablosu değildir.

### Alanlar

#### `id`

```text
Tür: BIGINT
Zorunlu: Evet
Birincil anahtar: Evet
Otomatik artan: Evet
```

#### `user_id`

```text
Tür: UUID
Zorunlu: Hayır
Yabancı anahtar: auth.users.id (ON DELETE SET NULL)
```

Giriş yapılmadan oluşan olaylarda boş olabilir. Hesap silindiğinde yabancı anahtar davranışı gereği kullanıcı bağlantısı kaldırılarak `NULL` yapılabilir (`ON DELETE SET NULL`).

#### `event_type`

```text
Tür: VARCHAR(100)
Zorunlu: Evet
```

Örnekler:

```text
unauthorized_portfolio_access
account_deletion_started
account_deletion_failed
repeated_validation_failure
```

Kimlik doğrulama hizmeti başarısız girişleri yeterli şekilde kaydediyorsa bu kayıt gereksiz yere tekrar tutulmaz.

#### `severity`

```text
Tür: TEXT
Zorunlu: Evet
```

Kabul edilen değerler:

```text
info
warning
critical
```

#### `event_at`

```text
Tür: TIMESTAMPTZ
Zorunlu: Evet
```

#### `details`

```text
Tür: JSONB
Zorunlu: Hayır
Açıklama: Kısıtlı ve hassas olmayan teknik ayrıntılar
```

Bu alana şunlar yazılamaz:

- Şifre
- Oturum veya yenileme belirteci
- API anahtarı
- Portföyün tamamı
- Kullanıcı notunun tamamı
- Gereksiz kişisel veri

#### `retention_until`

```text
Tür: TIMESTAMPTZ
Zorunlu: Hayır (Kategori bazlı saklama süreleri KI-019 kapsamında kesinleşene kadar geçici olarak nullable tutulur; rastgele hukuki süre uydurulmaz)
Açıklama: Güvenlik olayının silinmesi veya anonimleştirilmesi gereken zaman
```

---

# 12. Tablolar arası ilişkiler

```text
auth.users
    │
    ├── 1:1 ── user_profiles
    ├── 1:1 ── user_preferences
    ├── 1:N ── portfolio_entries
    ├── 1:N ── user_legal_events
    ├── 1:N ── account_deletion_requests
    └── 1:N ── security_events

gold_products
    │
    ├── 1:N ── portfolio_entries
    ├── 1:N ── price_source_product_mappings
    └── 1:N ── gold_prices

price_sources
    │
    ├── 1:N ── price_source_product_mappings
    ├── 1:N ── price_fetch_runs
    └── 1:N ── gold_prices

price_fetch_runs
    │
    └── 1:N ── gold_prices

legal_documents
    │
    └── 1:N ── user_legal_events
```

Açıklama:

```text
1:1 = Bir kayda karşı en fazla bir kayıt
1:N = Bir kayda karşı birden fazla kayıt
```

---

# 13. Yabancı anahtar ve silme davranışları

Kesin `ON DELETE` davranışları backend hizmeti ve hukuk incelemesinden sonra SQL aşamasında doğrulanacaktır.

Başlangıç kararları:

## Kullanıcıya bağlı özel uygulama verileri

- `user_profiles`: Hesap silinince kaldırılır.
- `user_preferences`: Hesap silinince kaldırılır.
- `portfolio_entries`: Hesap silinince kaldırılır.

## Hukuki ve güvenlik kayıtları

- `user_legal_events`: Yasal saklama amacı ve süresine göre silinir, anonimleştirilir veya sınırlı tutulur.
- `account_deletion_requests`: Silme işleminin ispatı ve veri minimizasyonu birlikte değerlendirilir.
- `security_events`: `retention_until` alanına göre silinir veya anonimleştirilir.

## Ürün ve fiyat bağlantıları

- Kullanılmış bir `gold_product` fiziksel olarak hemen silinmez, `is_active = false` yapılır.
- Kullanılmış bir `price_source` fiziksel olarak hemen silinmez, `is_active = false` yapılır.
- Kullanılmış bir `price_source_product_mappings` kaydı fiziksel olarak hemen silinmez, `is_active = false` yapılır.
- Fiyat kayıtlarının saklama süresi `DATA_RETENTION.md` belgesinde tanımlanır.

---

# 14. Satır düzeyi erişim politikaları

PostgreSQL altyapısı destekliyorsa kullanıcıya ait tablolarda Satır Düzeyi Güvenlik, yani Row Level Security kullanılacaktır.

## 14.1. `user_profiles`

Kullanıcı:

- Yalnızca kendi profilini okuyabilir (`SELECT`).
- Eksik kalması durumunda yalnızca kendi `auth.uid()` kimliği ve `active` durumuyla başlangıç profilini oluşturabilir (`INSERT` fallback).
- Yalnızca kendi profilini güncelleyebilir (`UPDATE`).
- Başka kullanıcı profilini okuyamaz ve `DELETE` işlemi yapamaz.
- **Kolon koruma kuralı:** PostgreSQL RLS satır bazlı çalıştığı için, normal kullanıcının (`authenticated` rolü) `user_id`, `account_status` ve `created_at` kolonlarını değiştirmesi `BEFORE UPDATE` veritabanı tetikleyicisi (trigger) ile kesin olarak engellenir.

## 14.2. `user_preferences`

Kullanıcı:

- Yalnızca kendi tercihlerini okuyabilir (`SELECT`).
- Eksik kalması durumunda yalnızca kendi `auth.uid()` kimliğiyle varsayılan tercih kaydını oluşturabilir (`INSERT` fallback).
- Yalnızca kendi tercih kaydındaki `theme` alanını güncelleyebilir (`UPDATE`).
- **Kolon koruma kuralı:** Normal kullanıcının (`authenticated` rolü) `user_id`, `language_code`, `currency_code` ve `created_at` alanlarını değiştirmesi `BEFORE UPDATE` veritabanı tetikleyicisi (trigger) ile kesin olarak engellenir. `updated_at` alanı istemciden gelen değerle değil, veritabanı tetikleyicisi tarafından güncellenir.
- Başka kullanıcının tercihlerini göremez ve silme (`DELETE`) yapamaz.

## 14.3. `portfolio_entries`

Kullanıcı:

- Yalnızca kendi kayıtlarını okuyabilir.
- Yalnızca kendi adına kayıt oluşturabilir.
- Yalnızca kendi kaydını güncelleyebilir.
- Yalnızca kendi kaydını silebilir.
- Bir kaydın `user_id` alanını başka kullanıcı kimliğine değiştiremez.

Temel sahiplik kuralı:

```text
portfolio_entries.user_id = güvenli oturumdaki kullanıcı kimliği
```

Mobil uygulamanın gönderdiği serbest kullanıcı kimliğine güvenilmez.

## 14.4. `gold_products`

Normal kullanıcı:

- Aktif ve gösterime açık ürünleri okuyabilir.
- Ürün ekleyemez.
- Ürün güncelleyemez.
- Ürün silemez.

## 14.5. `gold_prices`

Normal kullanıcı:

- Uygulamanın kendisine sunduğu geçerli güncel fiyatları okuyabilir.
- Fiyat ekleyemez.
- Fiyat güncelleyemez.
- Fiyat silemez.

Fiyat yazma yetkisi yalnızca güvenli sunucu işlemindedir.

## 14.6. `price_source_product_mappings`

Normal kullanıcı:

- Aktif ürün-fiyat kaynağı eşleştirmelerini doğrudan değiştiremez.
- Eşleştirme ekleyemez.
- Eşleştirme güncelleyemez.
- Eşleştirme silemez.

Mobil uygulamanın bu tabloyu doğrudan okuması zorunlu değildir. Eşleştirmeler öncelikle güvenli fiyat çekme fonksiyonu tarafından kullanılır.

## 14.7. `legal_documents`

Normal kullanıcı:

- Yürürlükteki ve kullanıcıya sunulması gereken belgeleri okuyabilir (`SELECT`).
- Belge oluşturamaz, değiştiremez veya silemez.

## 14.8. `user_legal_events`

`user_legal_events`, yasal belge görüntüleme, kabul, reddetme ve açık rıza geri çekme olaylarını değiştirilemez kayıtlar olarak tutar.

Normal kullanıcı:

- Yalnızca kendi `user_id = auth.uid()` yasal olay kayıtlarını okuyabilir (`SELECT`).
- Tabloya doğrudan kayıt ekleyemez (`INSERT` kapalı).
- Mevcut yasal olay kayıtlarını güncelleyemez (`UPDATE` kapalı).
- Mevcut yasal olay kayıtlarını silemez (`DELETE` kapalı).

Yeni yasal olay yalnızca güvenli PostgreSQL RPC fonksiyonu (`record_user_legal_event`) üzerinden oluşturulur:

```sql
CREATE OR REPLACE FUNCTION public.record_user_legal_event(
    p_document_id UUID,
    p_event_type TEXT,
    p_source TEXT,
    p_app_version VARCHAR DEFAULT NULL
) RETURNS UUID;
```

Güvenli sunucu işlemi:

1. `user_id` değerini doğrulanmış kullanıcı oturumundan (`auth.uid()`) alır.
2. İstek gövdesinden gönderilen serbest `user_id` parametresini güven kaynağı kabul etmez.
3. İlgili belgeyi `legal_documents` tablosundan okur ve aktif olduğunu doğrular.
4. `document_version` değerini aktif belgeden otomatik çeker.
5. `event_at` değerini veritabanı zamanıyla (`NOW()`) oluşturur.
6. Olayı `user_legal_events` tablosuna append-only olarak ekler.

## 14.9. `account_deletion_requests` ve Atomik Hesap Silme RPC'si

Kullanıcı:

- Yalnızca kendi `user_id = auth.uid()` silme taleplerini okuyabilir (`SELECT`).
- Doğrudan istemciden `INSERT`, `UPDATE` veya `DELETE` yapamaz; silme talebi ve veritabanı silme adımları atomik PostgreSQL RPC fonksiyonu üzerinden yürütülür:

```sql
CREATE OR REPLACE FUNCTION public.execute_account_deletion(
    p_user_id UUID,
    p_request_id UUID DEFAULT NULL
) RETURNS JSONB;
```

Bu fonksiyon (`Migration 008`), `portfolio_entries`, `user_preferences`, `user_legal_events` (anonimleştirme), `security_events` (anonimleştirme) ve `user_profiles` silme adımlarını tek bir transaction bloğunda (`BEGIN ... EXCEPTION ROLLBACK`) yürüterek yüzde yüz atomiklik sağlar (`ADR-033`).

## 14.10. Tablo Erişim Matrisi (Özet)

| Tablo Adı | SELECT | INSERT | UPDATE | DELETE | Açıklama |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_profiles` | Yalnızca Kendi | Kendi (Fallback) | Yalnızca Kendi | Kapalı | Tetikleyici + RLS |
| `user_preferences` | Yalnızca Kendi | Kendi (Fallback) | Yalnızca Kendi | Kapalı | Tetikleyici + RLS |
| `gold_products` | Aktif Ürünler | Kapalı | Kapalı | Kapalı | Yalnızca Okuma |
| `price_sources` | Aktif Kaynaklar | Kapalı | Kapalı | Kapalı | Yalnızca Okuma |
| `gold_prices` | Geçerli Fiyatlar | Kapalı | Kapalı | Kapalı | Yalnızca Okuma |
| `portfolio_entries` | Yalnızca Kendi | Yalnızca Kendi | Yalnızca Kendi | Yalnızca Kendi | Tam Sahiplik |
| `legal_documents` | Aktif Belgeler | Kapalı | Kapalı | Kapalı | Yalnızca Okuma |
| `user_legal_events` | Yalnızca Kendi | Yalnızca Güvenli RPC / Edge Function | Kapalı | Kapalı | Append-only yasal olay kaydı |
| `account_deletion_requests` | Yalnızca Kendi | Yalnızca Edge Fn | Yalnızca Edge Fn | Kapalı | Güvenli Sunucu |
| `price_source_product_mappings` | Kapalı | Kapalı | Kapalı | Kapalı | Yönetim / Sunucu |
| `price_fetch_runs` | Kapalı | Kapalı | Kapalı | Kapalı | Yönetim / Sunucu |
| `security_events` | Kapalı | Kapalı | Kapalı | Kapalı | Yönetim / Sunucu |


# 15. Zorunlu veritabanı kontrolleri

## 15.1. Portföy

```text
quantity > 0
total_cost_minor > 0
purchase_date <= bugün
char_length(note) <= 500
char_length(purchase_place) <= 100
```

Ürüne bağlı kontroller:

```text
measurement_unit = piece ise quantity tam sayı olmalı
measurement_unit = gram ise en fazla 3 ondalık olmalı
portfolio_enabled = true olmalı
is_active = true olmalı
```

Ürüne bağlı kontroller basit `CHECK` kısıtıyla yapılamıyorsa güvenli veritabanı fonksiyonu, tetikleyici veya sunucu servisinde uygulanır. Yalnızca mobil uygulama kontrolüne güvenilmez.

## 15.2. Fiyat

```text
buy_price_minor > 0 veya null
sell_price_minor > 0 veya null
buy_price_minor ve sell_price_minor aynı anda null olamaz
day_low_minor > 0 veya null
day_high_minor > 0 veya null
char_length(currency_code) = 3
```

## 15.3. Ürün

```text
code benzersiz olmalı
measurement_unit izin verilen değerlerden biri olmalı
quantity_precision 0 ile 3 arasında olmalı
package_weight_grams > 0 veya null
```

## 15.4. Fiyat kaynağı ürün eşleştirmesi

```text
external_symbol boş olamaz
char_length(external_symbol) <= 100
char_length(external_name) <= 200 veya null
char_length(external_category) <= 100 veya null
(source_id, external_symbol) benzersiz olmalı
(source_id, product_id) benzersiz olmalı
```

## 15.5. İşlem sayaçları

```text
products_received >= 0
products_saved >= 0
products_rejected >= 0
```

---

# 16. Gerekli indeksler

İndeksler sık kullanılan sorguları hızlandırmak için oluşturulur. Gereksiz indeks eklenmez.

## 16.1. Portföy indeksleri

```text
portfolio_entries(user_id)
portfolio_entries(user_id, purchase_date DESC)
portfolio_entries(user_id, created_at DESC)
portfolio_entries(product_id)
```

Temel sorgu:

```text
Giriş yapan kullanıcının portföy kayıtlarını alış tarihine göre getir.
```

## 16.2. Fiyat indeksleri

```text
gold_prices(product_id, source_price_at DESC)
gold_prices(product_id, source_id, source_price_at DESC)
gold_prices(source_id, fetched_at DESC)
```

Geçerli fiyat sorgularında `is_valid` alanını dikkate alan kısmi indeks kullanımı SQL uygulama aşamasında değerlendirilebilir.

Temel sorgu:

```text
Bir ürün için en son geçerli alış veya satış fiyatını getir.
```

## 16.3. Fiyat kaynağı ürün eşleştirme indeksleri

```text
price_source_product_mappings(source_id, external_symbol)
price_source_product_mappings(source_id, product_id)
price_source_product_mappings(product_id)
price_source_product_mappings(source_id, is_active)
```

İlk iki birleşim benzersiz kısıtlarla zaten indekslenebilir. SQL uygulama aşamasında aynı işi yapan gereksiz yinelenen indeks oluşturulmaz.

Temel sorgu:

```text
Belirli bir sağlayıcıdan gelen dış sembolü Altın İz ürününe eşleştir.
```

## 16.4. Yasal olay indeksleri

```text
user_legal_events(user_id, document_id)
user_legal_events(user_id, event_at DESC)
```

## 16.5. Hesap silme indeksleri

```text
account_deletion_requests(user_id, status)
```

## 16.6. Ürün sıralama indeksi

```text
gold_products(is_active, price_display_enabled, sort_order)
```

# 17. Otomatik işlemler ve tetikleyiciler

## 17.1. Yeni kullanıcı oluşturulduğunda

1. **Birincil yöntem (Otomatik Tetikleyici):** `auth.users` tablosunda yeni kullanıcı kaydı oluştuğunda (`AFTER INSERT`), `SECURITY DEFINER` yetkisiyle çalışan veritabanı tetikleyicisi (`handle_new_user`) aynı işlem (transaction) içinde `user_profiles` (`account_status = 'active'`) ve `user_preferences` (`theme = 'system'`, `language_code = 'tr'`, `currency_code = 'TRY'`) kayıtlarını otomatik olarak oluşturur.

2. **İkincil geri dönüş (Fallback):** İstisnai bir durumda profil veya tercih satırı eksik kalırsa, mobil istemci oturum açılışında RLS `INSERT` politikası (`user_id = auth.uid()`) kapsamında varsayılan satırı güvenli şekilde oluşturabilir (`ON CONFLICT DO NOTHING`).

İşlem yarıda kalırsa eksik profil veya tercih kaydı güvenli şekilde tekrar oluşturulabilmelidir.

## 17.2. `updated_at` güncellemesi

Aşağıdaki tablolarda kayıt değiştiğinde `updated_at` otomatik yenilenir:

```text
user_profiles
user_preferences
gold_products
price_sources
price_source_product_mappings
portfolio_entries
legal_documents
account_deletion_requests
```

## 17.3. Kullanıcı silme

Hesap silme tek bir kontrolsüz zincirleme silme işlemine bırakılmaz. Portföy gibi açıkça kullanıcıya ait veriler silinir; yasal ve güvenlik kayıtları belirlenen saklama politikasına göre ele alınır.

## 17.4. Fiyat doğrulama

Fiyat kaydı oluşturulmadan önce:

- Ürün eşleştirmesi,
- Kaynak eşleştirmesi,
- Fiyatların pozitifliği,
- Para birimi,
- Birim uyumu,
- Kaynak zamanı

kontrol edilir.

---

# 18. Örnek veri senaryosu

Kullanıcı şu kaydı oluşturur:

```text
Altın türü: Çeyrek Altın, Yeni Tarihli
Miktar: 4 adet
Alış tarihi: 20.08.2026
Ödenen toplam tutar: 48.000,00 TL
Alış yeri: Örnek Kuyumcu
İşçilik dâhil: Belirtilmedi
```

`portfolio_entries` kaydı mantıksal olarak:

```text
id: Oluşturulan UUID
user_id: Giriş yapan kullanıcının UUID değeri
product_id: Çeyrek Altın, Yeni Tarihli ürün UUID değeri
quantity: 4.000
purchase_date: 2026-08-20
total_cost_minor: 4800000
purchase_place: Örnek Kuyumcu
note: null
labor_included: null
created_at: Sistem zamanı
updated_at: Sistem zamanı
```

Son geçerli alış fiyatı:

```text
12.800,00 TL = 1280000 kuruş
```

Hesap:

```text
Tahmini bozdurma değeri:
4 × 1280000 = 5120000 kuruş = 51.200,00 TL
```

```text
Tahmini kâr:
5120000 - 4800000 = 320000 kuruş = 3.200,00 TL
```

```text
Değişim yüzdesi:
(3200 ÷ 48000) × 100 = %6,666...
```

Kullanıcıya gösterilen sonuç:

```text
Tahmini Güncel Bozdurma Değeri: 51.200,00 TL
Tahmini Kâr: +3.200,00 TL
Değişim: +%6,67
```

---

# 19. V1’de oluşturulmayacak tablolar

Aşağıdaki tablolar V1 kapsamında oluşturulmaz:

```text
favorites
price_alerts
notifications
portfolio_sales
portfolio_charts
daily_portfolio_snapshots
payments
subscriptions
advertisements
user_locations
uploaded_documents
social_connections
messages
admin_users
```

Gerekçeler:

- Favoriler V2 kapsamındadır.
- Fiyat alarmları ve bildirimler V2 kapsamındadır.
- Satış geçmişi ve gerçekleşmiş kâr-zarar V2 kapsamındadır.
- Grafikler ve günlük portföy anlık görüntüleri V2 kapsamındadır.
- Ödeme, premium ve reklam V1’de yoktur.
- Konum ve belge yükleme V1’de yoktur.
- Sosyal özellikler V1’de yoktur.
- Gelişmiş yönetici paneli V1’de yoktur.

---

# 20. V2 genişletme noktaları

Mevcut şema bozulmadan ileride şu tablolar eklenebilir:

```text
favorites
price_alerts
notification_devices
notification_deliveries
portfolio_sales
portfolio_daily_snapshots
subscriptions
```

V2’de değerlendirilebilecek özellikler:

- Favori altınlar
- Hedef fiyat alarmları
- Anlık bildirimler
- Fiyat grafikleri
- Portföy performans grafikleri
- Kısmi satış
- Satış geçmişi
- Gerçekleşmiş ve gerçekleşmemiş kazanç ayrımı
- Ortalama maliyet

---

# 21. Açık teknik kararlar

Aşağıdaki konular gerçek Supabase projesi, fiyat sağlayıcısı ve ilgili testler tamamlandıktan sonra kesinleştirilecektir:

1. Hangi Supabase veri merkezi bölgesinin kullanılacağı
2. Yurt dışına veri aktarımı hukuki değerlendirmesi
3. Birincil fiyat sağlayıcısı adayı AltinAPI'nin üretim onayı ve ticari kullanım/saklama şartları
4. Fiyatların üretimde çekilme sıklığı
5. Fiyatın hangi süreden sonra eski (`stale`) sayılacağı
6. `gold_prices` geçmiş kayıtlarının ne kadar süre tutulacağı
7. Yasal, silme ve güvenlik kayıtlarının kesin saklama süreleri
8. Satır düzeyi güvenlik (RLS) politikalarının ve `BEFORE UPDATE` kolon koruma tetikleyicisinin kesin SQL ifadeleri
9. Ürüne bağlı miktar kontrolünün veritabanı tetikleyicisiyle uygulanması
10. Aktif yasal belge sürümü için kullanılacak kısmi benzersizlik indeksi (`WHERE is_active = true`)
11. `price_source_product_mappings` eşleştirmelerinin gerçek sağlayıcı sembolleriyle doğrulanması

Bu kararlar kesinleştiğinde `DECISIONS.md`, `SECURITY.md`, `PRIVACY.md`, `DATA_RETENTION.md` ve bu belge birlikte güncellenecektir.

---

# 22. Uygulama öncesi kontrol listesi

## Şema

- [ ] Bütün tabloların SQL karşılıkları hazırlandı.
- [ ] Birincil anahtarlar tanımlandı.
- [ ] Yabancı anahtarlar tanımlandı.
- [ ] Benzersizlik kısıtları tanımlandı.
- [ ] `CHECK` kısıtları tanımlandı.
- [ ] İndeksler oluşturuldu.
- [ ] `updated_at` otomasyonu oluşturuldu.

## Güvenlik

- [ ] Satır düzeyi güvenlik etkinleştirildi.
- [ ] Kullanıcı A, Kullanıcı B’nin portföyünü okuyamıyor.
- [ ] Kullanıcı A, Kullanıcı B adına kayıt oluşturamıyor.
- [ ] Kullanıcı A, Kullanıcı B’nin kaydını değiştiremiyor.
- [ ] Kullanıcı A, Kullanıcı B’nin kaydını silemiyor.
- [ ] Normal kullanıcı fiyat kaydı ekleyemiyor.
- [ ] Normal kullanıcı altın ürününü değiştiremiyor.
- [ ] Normal kullanıcı fiyat kaynağı ürün eşleştirmelerini değiştiremiyor.
- [ ] Bilinmeyen dış sembol otomatik ürüne bağlanmıyor.
- [ ] Gizli API anahtarı mobil uygulamada bulunmuyor.
- [ ] Normal kullanıcı `user_legal_events` tablosuna doğrudan `INSERT` yapamaz.
- [ ] Normal kullanıcı geçmiş yasal olayları güncelleyemez.
- [ ] Normal kullanıcı geçmiş yasal olayları silemez.
- [ ] Yasal olayın `user_id` değeri doğrulanmış oturumdan alınır.
- [ ] İstemcinin gönderdiği `user_id` değeri güvenilir kabul edilmez.
- [ ] `document_version` ilgili `legal_documents.version` alanından alınır.
- [ ] İstemcinin gönderdiği `document_version` değeri güvenilir kabul edilmez.
- [ ] `event_at` veritabanı veya güvenli sunucu zamanı ile oluşturulur.
- [ ] İstemcinin gönderdiği `event_at` değeri güvenilir kabul edilmez.
- [ ] Geçersiz `document_type` ve `event_type` birleşimleri reddedilir.
- [ ] Rıza geri çekme işlemi eski kaydı değiştirmek yerine yeni olay oluşturur.

## Hesaplama

- [ ] Para değerleri kuruş olarak saklanıyor.
- [ ] Miktar hassasiyeti doğru uygulanıyor.
- [ ] Bozdurma değeri alış fiyatıyla hesaplanıyor.
- [ ] Satın alma hesabı satış fiyatıyla hesaplanıyor.
- [ ] Fiyat yokken `0 TL` gösterilmiyor.
- [ ] Kısmi toplam açıkça belirtiliyor.
- [ ] Güncel değer ve kâr-zarar portföy tablosunda kalıcı ana veri olarak saklanmıyor.

## Hesap silme

- [ ] Kullanıcının kimliği yeniden doğrulanıyor.
- [ ] Portföy kayıtları siliniyor.
- [ ] Kullanıcı tercihleri siliniyor.
- [ ] Profil kaydı siliniyor.
- [ ] Kimlik doğrulama hesabı siliniyor.
- [ ] Aktif oturumlar kapatılıyor.
- [ ] Yasal ve güvenlik kayıtları saklama politikasına göre işleniyor.
- [ ] İşlem gerçekten tamamlanmadan başarı mesajı gösterilmiyor.

## Gizlilik ve hukuk

- [ ] Veri envanteri bu şemayla eşleşiyor.
- [ ] KVKK aydınlatma metni gerçek veri akışını açıklıyor.
- [ ] Gizlilik politikası üçüncü taraf hizmetleri açıklıyor.
- [ ] Google Play Veri Güvenliği beyanı gerçek davranışla eşleşiyor.
- [ ] App Store gizlilik beyanı gerçek davranışla eşleşiyor.
- [ ] Veri saklama süreleri belirlendi.
- [ ] Hukuk uzmanı son kontrolü tamamlandı.

---

# 23. Kesinleşmiş veritabanı kararlarının özeti

1. PostgreSQL uyumlu ilişkisel veritabanı kullanılacaktır.
2. Kullanıcı şifreleri uygulamanın normal tablolarında tutulmayacaktır.
3. Kullanıcı kimlikleri `UUID` olacaktır.
4. Her kullanıcı için bir profil kaydı olacaktır.
5. Her kullanıcı için bir tercih kaydı olacaktır.
6. Altın ürünleri merkezi `gold_products` tablosunda tanımlanacaktır.
7. Dış sağlayıcı sembolleri `price_source_product_mappings` tablosuyla merkezi ürünlere bağlanacaktır.
8. Bilinmeyen dış semboller otomatik olarak ürün oluşturmayacaktır.
9. Portföye serbest metinle altın adı yazılmayacaktır.
10. Her alış ayrı `portfolio_entries` kaydı olacaktır.
11. Miktar `quantity` alanında `NUMERIC(18,3)` olarak tutulacaktır.
12. Ölçü birimi altın ürününden belirlenecektir.
13. Ödenen toplam tutar kuruş cinsinden `BIGINT` olacaktır.
14. Alış tarihi `DATE` olacaktır.
15. Fiyatlar ürün ve kaynakla ilişkilendirilecektir.
16. Alış ve satış fiyatları ayrı tutulacaktır.
17. Fiyatın kaynak zamanı ile alınma zamanı ayrı tutulacaktır.
18. Fiyat bulunamadığında `0` kullanılmayacaktır.
19. Güncel değer portföy tablosunda kalıcı ana veri olarak saklanmayacaktır.
20. Kâr-zarar portföy tablosunda kalıcı ana veri olarak saklanmayacaktır.
21. Hesaplanan değerler geçerli fiyatlardan yeniden üretilecektir.
22. Yasal belgeler sürümlü olarak saklanacaktır.
23. Aydınlatma ve açık rıza olayları tek bir genel onaya dönüştürülmeyecektir.
24. Hesap silme işlemi durum takibiyle yürütülecektir.
25. Kullanıcı yalnızca kendi özel kayıtlarına erişebilecektir.
26. Fiyatları yalnızca güvenli sunucu işlemi değiştirebilecektir.
27. V1’de favori, alarm, satış, bildirim ve ödeme tabloları oluşturulmayacaktır.

---

# 24. Son şema görünümü

```text
auth.users
├── user_profiles
├── user_preferences
├── portfolio_entries
├── user_legal_events
├── account_deletion_requests
└── security_events

gold_products
├── portfolio_entries
├── price_source_product_mappings
└── gold_prices

price_sources
├── price_source_product_mappings
├── price_fetch_runs
└── gold_prices

price_fetch_runs
└── gold_prices

legal_documents
└── user_legal_events
```

---


## Sürüm geçmişi

### 1.4 - 24.10.2026

- `20261024000009_lock_sync_gold_price.sql` migration'ı uygulandı: `sync_gold_price` fonksiyonu `anon` ve `authenticated` rollerinden tamamen geri alındı (REVOKE); yalnızca `service_role` rolüne kilitlendi (SECURITY.md Bölüm 8.6 uyumu).
- Toplam uygulanan migration sayısı 9'a ulaştı.

### 1.3 - 24.10.2026

- `20261024000008_atomic_account_deletion.sql` migration'ı uygulandı: `execute_account_deletion` PostgreSQL RPC'si eklendi.
- ADR-033 uyarınca hesap silme adımları tek bir atomik transaction (ROLLBACK garantili) içine alındı; KI-018 çözüldü.

### 1.5 - 24.10.2026

- `price_source_product_mappings` tablosuna 5 yeni dış sembol eşleştirmesi tanımlandı ve canlıya alındı:
  - `HAMIT_GOLD` -> `HAMIT_ALTIN` (Hamit Altın)
  - `REPUBLIC_GOLD` -> `CUMHURIYET_ALTINI` (Cumhuriyet Altını)
  - `GOLD_18K` -> `AYAR18` (18 Ayar Altın Gram)
  - `PACKAGED_GOLD_1G` -> `KULCE_1G` (1 Gram Paketli Külçe Altın)
  - `PACKAGED_GOLD_2_5G` -> `KULCE_2_5G` (2.5 Gram Paketli Külçe Altın)
- `sync_gold_price` fonksiyonu yetkileri revize edildi; istemci (anon/authenticated) yazma yetkileri tamamen kapatılarak yalnızca `service_role` rolüne kilitlendi.
- `gold_prices` tablosundaki `chk_at_least_one_price` kısıtı uyarınca `fetch-gold-prices` yürütücüsünde alış veya satış fiyatı olmayan boş/geçersiz satırların filtrelenmesi uygulandı.

### 1.2 - 19.10.2026

- Normal kullanıcının `user_legal_events` tablosuna doğrudan kayıt eklemesi kapatıldı.
- Yasal olayların yalnızca güvenli PostgreSQL RPC veya Edge Function üzerinden oluşturulması kararlaştırıldı.
- `user_id`, `document_id`, `document_version` ve `event_at` alanlarının güvenilir sunucu verilerinden üretilmesi zorunlu hâle getirildi.
- Yasal olayların append-only olarak tutulacağı açıklandı.
- `user_preferences` güncelleme yetkisi yalnızca `theme` alanıyla sınırlandırıldı.
- `updated_at` alanının veritabanı tetikleyicisi tarafından yönetileceği açıklandı.
- `17.1. Yeni kullanıcı oluşturulduğunda` bölümündeki fazladan Markdown kod bloğu işareti kaldırıldı.

### 1.1 - 03.09.2026


- `price_source_product_mappings` tablosu eklendi.
- Dış sağlayıcı sembolleriyle merkezi ürünler arasındaki ilişki tanımlandı.
- Benzersizlik ve doğrulama kuralları eklendi.
- İlişki şeması güncellendi.
- Satır düzeyi erişim yaklaşımı güncellendi.
- Gerekli indeksler eklendi.
- Güncellenme zamanı otomasyonu listesine yeni tablo eklendi.
- Veritabanı güvenlik kontrol listesi güncellendi.

### 1.0 - 03.09.2026

- Altın İz V1 ilk veritabanı tasarımı oluşturuldu.

---

## Belge güncelleme kuralı

Aşağıdaki değişikliklerden biri yapıldığında bu belge güncellenmelidir:

- Yeni tablo eklenmesi
- Alan eklenmesi veya kaldırılması
- Alan türünün değiştirilmesi
- Yabancı anahtar davranışının değiştirilmesi
- Erişim politikasının değiştirilmesi
- Hesaplama yönteminin değiştirilmesi
- Fiyat kaynağının değiştirilmesi
- Yeni kişisel veri toplanması
- Veri saklama süresinin değiştirilmesi
- Hesap silme davranışının değiştirilmesi

Değişiklik ayrıca `CHANGELOG.md` ve gerekliyse `DECISIONS.md` dosyasına kaydedilmelidir.
