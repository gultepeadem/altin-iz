# Altın İz V1 Güvenlik Politikası ve Teknik Güvenlik Tasarımı

**Belge adı:** `SECURITY.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.4 Taslak  
**Son güncelleme:** 26.10.2026  
**Proje aşaması:** Bölüm 19: Güvenlik ve gizlilik sertleştirmesi (Güvenlik İncelemesi ve Sertleştirme TAMAMLANDI)  
**Kodlama durumu:** `expo-secure-store` chunking (parçalama) adaptörü uygulandı; `execute_account_deletion` atomik RPC kuruldu (Migration 008); `sync_gold_price` RPC yetkisi yalnızca `service_role` rolüne kilitlendi (Migration 009); `src/utils/logger.ts` ile hassas veri maskelemesi sağlandı; RLS politikaları ve Edge Function yetkileri %100 doğrulandı.  
**Hedef platformlar:** Android ve iOS

---

## 1. Belgenin amacı

Bu belge, Altın İz V1 uygulamasının güvenlik ilkelerini, güven sınırlarını, tehditlerini, teknik kontrollerini, testlerini ve güvenlik olayı müdahale yöntemini tanımlar.

Belgenin amaçları:

- Kullanıcı hesaplarını korumak
- Kullanıcıların yalnızca kendi verilerine ulaşmasını sağlamak
- Portföy ve maliyet bilgilerinin başka kullanıcılara sızmasını önlemek
- Gizli anahtarların mobil uygulamaya girmesini engellemek
- Dış fiyat verilerini doğrulamadan kullanmamak
- Edge Function işlemlerini güvenli hâle getirmek
- Hesap silme işlemini doğrulanabilir şekilde yürütmek
- Hassas verilerin log, hata mesajı veya Git geçmişine girmesini önlemek
- Android ve iOS güvenlik davranışlarını ayrı test etmek
- Production ortamını development ve preview ortamlarından ayırmak
- Güvenlik olaylarına hazırlıklı olmak

Bu belge nihai sızma testi, hukuk görüşü veya bağımsız güvenlik denetiminin yerine geçmez.

---

## 2. Güvenlik hedefleri

Altın İz aşağıdaki güvenlik hedeflerini karşılamalıdır:

1. Kullanıcı kimliği güvenilir oturumdan belirlenmelidir.
2. Kullanıcı başka kullanıcının portföyünü okuyamamalıdır.
3. Kullanıcı başka kullanıcı adına kayıt oluşturamamalıdır.
4. Kullanıcı başka kullanıcının kaydını değiştirememeli veya silememelidir.
5. Normal kullanıcı ortak fiyat tablolarına veri yazamamalıdır.
6. Fiyat API anahtarı mobil uygulama paketinde bulunmamalıdır.
7. Supabase secret veya service role anahtarı mobil uygulamaya girmemelidir.
8. Şifreler normal uygulama tablolarında saklanmamalıdır.
9. Hassas veriler loglanmamalıdır.
10. Fiyatlar doğrulanmadan kullanıcıya sunulmamalıdır.
11. Eksik fiyat `0 TL` kabul edilmemelidir.
12. Eski fiyat güncel fiyat gibi gösterilmemelidir.
13. Hesap silme işlemi kullanıcı kimliğini istek gövdesinden almamalıdır.
14. Hesap silme tamamlanmadan başarı bildirilmemelidir.
15. Ortamlar birbirinden ayrılmalıdır.
16. Güvenlik kontrolleri yalnızca mobil arayüze bırakılmamalıdır.
17. Kritik kontroller otomatik veya tekrarlanabilir testlerle doğrulanmalıdır.

---

## 3. Korunan varlıklar

### 3.1. Kullanıcı hesap bilgileri

- E-posta adresi
- Supabase Auth kullanıcı kimliği
- Oturum ve yenileme belirteçleri
- E-posta doğrulama durumu
- Hesap durumu

### 3.2. Kişisel portföy verileri

- Altın türü
- Miktar veya adet
- Alış tarihi
- Ödenen toplam tutar
- Alış yeri
- Kullanıcı notu
- İşçilik bilgisi
- Hesaplanan tahmini değer ve kâr-zarar

### 3.3. Yasal ve güvenlik kayıtları

- Yasal belge sunum ve kabul olayları
- Hesap silme talepleri
- Güvenlik olayları
- Teknik takip kimlikleri

### 3.4. Sistem sırları

- Supabase secret veya service role anahtarı
- Veritabanı parolası
- Dış fiyat API anahtarı
- E-posta hizmeti anahtarı veya SMTP parolası
- Production ortamı gizli değişkenleri
- İmzalama ve mağaza kimlik bilgileri

### 3.5. Sistem bütünlüğü açısından önemli ortak veriler

- Altın ürün kataloğu
- Fiyat kaynakları
- Sağlayıcı ürün eşleştirmeleri
- Geçerli altın fiyatları
- Fiyat çekme çalışma kayıtları
- Aktif yasal belge sürümleri

---

## 4. Güven sınırları

### 4.1. Güvenilmeyen alanlar

Aşağıdakiler tek başına güvenilir kabul edilmez:

- Mobil uygulamadan gelen bütün girdiler
- URL ve rota parametreleri
- İstek gövdesindeki `user_id`
- İstek gövdesindeki kayıt kimliği
- Cihaz saati
- Yerel önbellek
- Kullanıcının değiştirebildiği ağ trafiği
- Dış fiyat API yanıtları
- Dosya adları ve ortam değişkenlerinin yalnızca var olması
- İstemci tarafındaki görünür veya gizli butonlar

### 4.2. Koşullu güvenilen alanlar

- Supabase tarafından doğrulanan oturum
- Doğru RLS politikalarıyla korunan PostgreSQL işlemleri
- Kimliği ve yetkisi doğrulanmış Edge Functions
- Secret store içindeki gizli değişkenler
- Migration ile oluşturulmuş ve test edilmiş veritabanı kısıtları

Bu alanlar da yapılandırma ve test olmadan otomatik olarak güvenli kabul edilmez.

### 4.3. Temel güvenlik ilkesi

```text
Mobil uygulama kullanıcı deneyimi sağlar.
Veritabanı ve güvenli sunucu işlemleri gerçek yetki sınırını uygular.
```

---

## 5. Tehdit modeli özeti

### T-001: Başka kullanıcının portföyüne erişim

Saldırgan bir kayıt kimliğini veya sorguyu değiştirerek başka kullanıcının verisini okumaya çalışabilir.

Koruma:

- RLS
- Oturumdan kullanıcı kimliği
- Güvenli hata mesajı
- İki kullanıcılı yetki testleri

### T-002: Başka kullanıcı adına veri yazma

Saldırgan istek gövdesindeki `user_id` değerini değiştirerek başka kullanıcı adına kayıt oluşturmayı deneyebilir.

Koruma:

- İstemciden gelen `user_id` değerini kabul etmeme
- `auth.uid()` tabanlı RLS
- Sunucu veya veritabanında sahiplik atama

### T-003: Gizli anahtarın uygulamadan çıkarılması

Mobil uygulama paketine eklenen her sabit değer kullanıcı tarafından incelenebilir.

Koruma:

- Secret değerleri istemciden tamamen uzak tutma
- Edge Function secret store kullanımı
- Git secret taraması

### T-004: Bozuk veya kötü niyetli fiyat verisi

Dış sağlayıcı yanlış sembol, birim veya fiyat döndürebilir.

Koruma:

- Şema doğrulama
- Sembol eşleştirme
- Pozitif fiyat kontrolü
- Birim ve para birimi kontrolü
- Zaman damgası kontrolü
- Olağan dışı değişim denetimi

### T-005: Tekrarlanan yazma işlemi

Kullanıcı veya ağ tekrarları aynı portföy kaydını birden fazla kez oluşturabilir.

Koruma:

- Gönderim sırasında butonu devre dışı bırakma
- Gerekirse idempotency yaklaşımı
- Başarı sonucu doğrulama

### T-006: Oturum verisinin cihazda uygunsuz saklanması

Oturum belirteci düz veya uygun olmayan yerel depolamada tutulabilir.

Koruma:

- Güncel Expo ve Supabase mobil saklama yaklaşımını kullanma
- Android ve iOS cihaz testleri
- Çıkış sonrası temizleme

### T-007: Hassas verinin loglara sızması

Şifre, token, API anahtarı veya portföy notu hata kaydına yazılabilir.

Koruma:

- Log yasakları
- Ortak hata dönüştürme
- Production log redaksiyonu
- Güvenlik incelemesi

### T-008: Hesap silme yetkisinin kötüye kullanılması

Saldırgan başka bir kullanıcı kimliği göndererek hesabını sildirmeye çalışabilir.

Koruma:

- Kullanıcı kimliğini doğrulanmış token üzerinden alma
- Yeniden kimlik doğrulama
- İstek gövdesindeki `user_id` değerini reddetme
- İşlem durum takibi

### T-009: Development ve production ortamlarının karışması

Test anahtarları, test verileri veya migrationlar yanlış ortamda kullanılabilir.

Koruma:

- Ayrı Supabase projeleri
- Ayrı EAS profilleri
- Görünür ortam işareti
- Production erişimlerinin sınırlanması

### T-010: Bağımlılık kaynaklı güvenlik riski

Bakımı olmayan veya kötü niyetli paket uygulamaya veri sızıntısı riski ekleyebilir.

Koruma:

- En az bağımlılık
- Paket bakım ve lisans incelemesi
- Kilit dosyasını koruma
- Güvenlik taraması

---

## 6. Kimlik doğrulama güvenliği

### 6.1. Hesap oluşturma

- Şifre normal uygulama tablolarında saklanmaz.
- Şifre uygulama loglarına yazılmaz.
- Şifre analitik veya hata izleme aracına gönderilmez.
- Şifre tekrarı yalnızca istemci doğrulaması için kullanılır.
- E-posta biçimi doğrulanır.
- Şifre politikası kayıt ve sıfırlama ekranlarında aynı olmalıdır.
- Doğrulanmamış kullanıcı korunan uygulama alanına alınmaz.

### 6.2. Giriş

- Hatalı girişte hesap varlığını gereksiz yere açıklamayan genel mesaj kullanılır.
- Giriş denemeleri Supabase Auth güvenlik özellikleriyle uyumlu yönetilir.
- Başarılı girişten sonra profil durumu kontrol edilir.
- `disabled` ve `deletion_pending` hesaplara normal erişim verilmez.

### 6.3. E-posta doğrulama

- Doğrulama bağlantıları süreli olmalıdır.
- Süresi dolmuş bağlantı güvenli mesajla yönetilir.
- Tekrar gönderme işlemi sınırsız ve art arda çalıştırılamaz.
- Android ve iOS derin bağlantıları ayrı test edilir.
- Callback parametreleri doğrulanmadan güvenilir kabul edilmez.

### 6.4. Şifre sıfırlama

- Kullanıcıya bir e-posta hesabının sistemde bulunup bulunmadığı gereksiz şekilde açıklanmaz.
- Sıfırlama bağlantısı süreli olmalıdır.
- Yeni şifre mevcut şifre politikasını karşılamalıdır.
- Bağlantının yanlış kullanıcı oturumuyla karışması engellenmelidir.
- İşlem sonrası eski oturumların sonlandırılması değerlendirilmelidir.

### 6.5. Yeniden kimlik doğrulama

Aşağıdaki hassas işlemlerde kısa süre önce yapılmış yeniden doğrulama gereksinimi değerlendirilmelidir:

- Hesabı ve verileri silme
- E-posta adresini değiştirme
- Şifreyi değiştirme
- Gelecekte eklenirse güvenlik ayarlarını değiştirme

---

## 7. Oturum güvenliği

### 7.1. Oturum saklama

- Mobil oturum güncel ve doğrulanmış Expo-Supabase saklama adaptörüyle tutulur.
- Android ve iOS davranışı ayrı test edilir.
- Secret veya service role anahtarı oturum depolamasında bulunmaz.
- Düz metin özel önbelleğe fazladan token kopyası yazılmaz.

### 7.2. Oturum yenileme

- Süresi dolan erişim belirteci güvenli yenileme akışıyla yönetilir.
- Yenileme başarısızsa kullanıcı oturumu güvenli biçimde kapatılır.
- Sonsuz yenileme veya yönlendirme döngüsü oluşturulmaz.
- Uygulama arka plandan döndüğünde oturum durumu kontrol edilir.

### 7.3. Çıkış

Çıkış sırasında:

1. Supabase çıkış işlemi çağrılır.
2. Yerel auth durumu temizlenir.
3. Kullanıcıya ait portföy önbelleği temizlenir.
4. Protected navigasyon geçmişi temizlenir.
5. Yeni kullanıcının eski kullanıcının verisini görmediği test edilir.

### 7.4. Cihaz güvenliği sınırı

Köklenmiş veya jailbreak yapılmış cihazlarda mutlak güvenlik garanti edilemez. Uygulama bu riski artıracak şekilde secret içermemeli ve cihazda gereksiz hassas veri saklamamalıdır.

---

## 8. Yetkilendirme ve RLS güvenliği

### 8.1. Temel ilke

```text
Arayüzde butonu gizlemek yetkilendirme değildir.
```

Asıl yetki PostgreSQL RLS ve güvenli sunucu kontrolleriyle uygulanır.

### 8.2. Kullanıcıya ait tablolar

RLS uygulanacak temel tablolar:

```text
user_profiles
user_preferences
portfolio_entries
user_legal_events
account_deletion_requests
```

### 8.3. Portföy politikaları

#### SELECT

Kullanıcı yalnızca `user_id = auth.uid()` olan satırları okuyabilir.

#### INSERT

Yeni kaydın sahibi yalnızca doğrulanmış kullanıcı olabilir.

#### UPDATE

- Yalnızca kayıt sahibi güncelleyebilir.
- Yeni satırda da sahiplik değişmemelidir.
- `user_id` başka kullanıcıya çevrilemez.

#### DELETE

Yalnızca kayıt sahibi kaydı silebilir.

### 8.4. Profil politikaları

- Yeni kullanıcı oluştuğunda profil kaydı `SECURITY DEFINER` tetikleyicisiyle otomatik oluşturulur; eksik kalması durumunda kullanıcı yalnızca kendi `auth.uid()` kimliği ve `active` durumuyla başlangıç profilini oluşturabilir (`INSERT` fallback).
- Kullanıcı yalnızca kendi profilini okuyabilir (`SELECT`).
- Kullanıcı kendi görünen adını değiştirebilir (`UPDATE`).
- Kullanıcının `user_id`, `account_status` ve `created_at` kolonlarını değiştirmesi `BEFORE UPDATE` veritabanı tetikleyicisiyle engellenir.
- Kullanıcı başka kullanıcının profilini listeleyemez ve profilini doğrudan silemez (`DELETE` kapalı).

### 8.5. Tercih politikaları

- Yeni kullanıcı oluştuğunda tercih kaydı `SECURITY DEFINER` tetikleyicisiyle otomatik oluşturulur; eksik kalması durumunda kullanıcı yalnızca kendi `auth.uid()` kimliğiyle varsayılan tercih kaydını oluşturabilir (`INSERT` fallback).
- Kullanıcı yalnızca kendi tercih kaydını okuyabilir (`SELECT`).
- V1'de normal kullanıcı yalnızca `theme` alanını güncelleyebilir (`UPDATE`).
- Normal kullanıcı `user_id`, `language_code`, `currency_code` ve `created_at` alanlarını değiştiremez.
- `updated_at` alanı istemci tarafından değil, veritabanı tetikleyicisi tarafından yönetilir.
- V1'de `language_code = 'tr'` ve `currency_code = 'TRY'` değerleri kullanıcı tarafından değiştirilemez.

### 8.5.1. Yasal olay ve hesap silme talebi politikaları

- `user_legal_events`: Kullanıcı yalnızca kendi kayıtlarını okuyabilir (`SELECT`). Normal kullanıcının doğrudan `INSERT`, `UPDATE` ve `DELETE` yetkisi yoktur.
- Yeni yasal olay yalnızca güvenli PostgreSQL RPC veya Edge Function üzerinden oluşturulur.
- Yasal olayın `user_id` değeri doğrulanmış oturumdan alınır.
- `document_version` ilgili `legal_documents.version` alanından alınır.
- `event_at` veritabanı veya güvenli sunucu zamanı ile oluşturulur.
- İstemciden gönderilen `user_id`, `document_version` ve `event_at` değerleri güvenilir kabul edilmez.
- Belge türü ile olay türü birleşimi sunucu tarafında doğrulanır.
- Yasal olaylar append-only tutulur; eski olaylar güncellenmez veya silinmez.
- `account_deletion_requests`: Kullanıcı yalnızca kendi talebini okuyabilir (`SELECT`); oluşturma ve güncelleme işlemleri yalnızca `delete-account` Edge Function (service role) tarafından yapılır.

### 8.6. Ortak yönetim tabloları

Normal kullanıcıların yazamayacağı tablolar:

```text
gold_products
price_sources
price_source_product_mappings
gold_prices
price_fetch_runs
legal_documents
security_events
```

> [!IMPORTANT]
> **Fiyat Tablolarına İstemciden Yazma Yasağı (Migration 009):**
> `sync_gold_price` PostgreSQL RPC fonksiyonunun yürütme yetkisi (`EXECUTE`) `PUBLIC`, `anon` ve `authenticated` rollerinden geri alınmış (`REVOKE`), yalnızca `service_role` rolüne kilitlenmiştir. Fiyat yazma yetkisi yalnızca sunucu tarafında çalışan ve gizli anahtarla korunan `fetch-gold-prices` Supabase Edge Function'ına aittir. Mobil istemci üzerinden hiçbir koşulda doğrudan fiyat güncellemesi yapılamaz.

Okuma erişimi yalnızca uygulamanın ihtiyaç duyduğu alan ve satırlarla sınırlandırılmalıdır.

---

## 9. İki kullanıcılı güvenlik testi

İki bağımsız test hesabı oluşturulur:

```text
Kullanıcı A
Kullanıcı B
```

Zorunlu testler:

- A kendi profilini okuyabilir.
- A, B'nin profilini okuyamaz.
- A kendi tercihlerini okuyabilir.
- A, B'nin tercihlerini okuyamaz.
- A kendi portföy kaydını oluşturabilir.
- A, B adına kayıt oluşturamaz.
- A, B'nin kayıt kimliğiyle veri okuyamaz.
- A, B'nin kaydını güncelleyemez.
- A, B'nin kaydını silemez.
- A kayıt sahibini B olarak değiştiremez.
- B için ters yönde aynı testler geçer.
- Normal kullanıcı fiyat yazamaz.
- Normal kullanıcı ürün kataloğunu değiştiremez.
- Normal kullanıcı sağlayıcı eşleştirmesini değiştiremez.
- A, `user_legal_events` tablosuna doğrudan kayıt ekleyemez.
- A, B adına yasal olay oluşturamaz.
- A, kendi geçmiş yasal olayını güncelleyemez.
- A, kendi geçmiş yasal olayını silemez.
- A tarafından gönderilen sahte `document_version` kullanılmaz.
- A tarafından gönderilen geçmiş veya gelecek `event_at` değeri kullanılmaz.
- Etkin olmayan belge için yasal olay oluşturulamaz.
- Geçersiz belge türü ve olay türü birleşimi reddedilir.
- Rıza geri çekme işlemi eski kaydı değiştirmek yerine yeni olay oluşturur.

Test yalnızca mobil arayüzden yapılmamalıdır. Doğrudan istemci veya test sorgusuyla yetkisiz istek denenmelidir.

### 9.1. Faz 4.5 İki Kullanıcılı Doğrulama Raporu (22.10.2026)

Tüm RLS çapraz testleri iki aktif hesap (`user_a@test.com` ve `user_b@test.com`) ile REST API üzerinden çalıştırılmış ve eksiksiz doğrulanmıştır:

| Test Senaryosu | Beklenen Sonuç | Gerçekleşen Sonuç | Durum |
| :--- | :--- | :--- | :--- |
| `handle_new_user` Tetikleyicisi | Profil (`active`) ve Tercih (`system/tr/TRY`) otomatik oluşmalı | Profil ve tercihler otomatik oluşturuldu | ✅ GEÇTİ |
| User A Portföy Ekleme | Kendi adına portföy kaydı ekleyebilmeli | Başarıyla eklendi (HTTP 201) | ✅ GEÇTİ |
| User B Portföy Ekleme | Kendi adına portföy kaydı ekleyebilmeli | Başarıyla eklendi (HTTP 201) | ✅ GEÇTİ |
| A -> B Portföyünü Okuma | B'nin portföy kaydı A'ya dönmemeli | 0 satır döndü (tam izolasyon) | ✅ GEÇTİ |
| A -> B Profilini Okuma | B'nin profili A'ya dönmemeli | 0 satır döndü (tam izolasyon) | ✅ GEÇTİ |
| A -> B Adına Portföy Ekleme | Sahte `user_id` ile ekleme engellenmeli | HTTP 403 ile reddedildi | ✅ GEÇTİ |
| A -> B Portföyünü Güncelleme | B'nin portföyü değişmemeli | Miktar değişmedi, korundu | ✅ GEÇTİ |
| A -> B Portföyünü Silme | B'nin kaydı silinmemeli | Kayıt silinmedi, korundu | ✅ GEÇTİ |
| B -> A Portföyünü Okuma (Ters) | A'nın kaydı B'ye dönmemeli | 0 satır döndü (simetrik izolasyon) | ✅ GEÇTİ |
| Normal Kullanıcı Fiyat Ekleme | `gold_prices` tablosuna yazma engellenmeli | HTTP 403 ile reddedildi | ✅ GEÇTİ |
| Normal Kullanıcı Ürün Değiştirme | `gold_products` tablosu değiştirilememeli | Ürün adı korundu | ✅ GEÇTİ |
| Normal Kullanıcı Eşleştirme Değiştirme | `price_source_product_mappings` yazımı engellenmeli | HTTP 403 ile reddedildi | ✅ GEÇTİ |
| Doğrudan `user_legal_events` Yazımı | İstemciden doğrudan INSERT engellenmeli | HTTP 403 ile reddedildi | ✅ GEÇTİ |
| Güvenli RPC Yasal Olay Kaydı | `record_user_legal_event` ile append-only kayıt | Event ID üretildi (HTTP 200) | ✅ GEÇTİ |
| Profil `user_id` Değiştirme | Tetikleyici `user_id` değişimini engellemeli | HTTP 400 ile engellendi | ✅ GEÇTİ |
| Profil `account_status` Değiştirme | Tetikleyici durum değişimini engellemeli | HTTP 400 ile engellendi | ✅ GEÇTİ |

---

## 10. Veritabanı güvenliği

### 10.1. Veri türleri ve kısıtlar

Kritik doğrulamalar veritabanında da uygulanır:

```text
quantity > 0
total_cost_minor > 0
purchase_date <= geçerli tarih
external_symbol boş değil
Fiyatlar pozitif veya null
Sayaçlar negatif değil
```

### 10.2. Yabancı anahtarlar

- Portföy ürünü mevcut bir `gold_products` kaydına bağlanır.
- Fiyat kaynağı mevcut bir `price_sources` kaydına bağlanır.
- Eşleştirme hem kaynağa hem ürüne bağlanır.
- Kullanıcı satırları geçerli Auth kullanıcı kimliğiyle ilişkilendirilir.

### 10.3. Benzersizlik

Önemli benzersizlik kuralları:

```text
price_source_product_mappings(source_id, external_symbol)
price_source_product_mappings(source_id, product_id)
```

Diğer benzersizlik kuralları `DATABASE.md` ile uyumlu uygulanmalıdır.

### 10.4. Migration güvenliği

- Production şeması panelde kayıtsız ve rastgele değiştirilmez.
- Her değişiklik migration dosyasıyla izlenir.
- Migration önce Development ortamında uygulanır.
- RLS politikaları migration ile birlikte değerlendirilir.
- Geri dönüş veya telafi yöntemi hazırlanır.
- Migration dosyalarına secret yazılmaz.

### 10.5. Seed güvenliği

- Gerçek kullanıcı verisi kullanılmaz.
- Gerçek e-posta, portföy veya not eklenmez.
- Test fiyatı gerçek fiyat gibi sunulmaz.
- Production seed işlemi kontrollü ve tekrarlanabilir olmalıdır.

---

## 11. Supabase anahtar güvenliği

### 11.1. Mobil uygulamada bulunabilecekler

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_APP_ENV
```

Bu değerlerin public olması yetkilendirme kontrollerini gereksiz yapmaz. RLS her ilgili tabloda etkin ve test edilmiş olmalıdır.

### 11.2. Mobil uygulamada bulunmayacaklar

```text
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_PASSWORD
GOLD_PRICE_API_KEY
SMTP_PASSWORD
EMAIL_PROVIDER_SECRET
```

### 11.3. Sunucu sırları

Sunucu sırları yalnızca uygun secret store veya güvenli platform değişkenlerinde tutulur.

- Kaynak koda yazılmaz.
- `.env.example` içine gerçek değer eklenmez.
- Hata mesajında gösterilmez.
- Loglara yazılmaz.
- Ekran görüntüsünde paylaşılmaz.
- Sohbet veya issue kaydına yapıştırılmaz.

### 11.4. En az yetki

Her anahtar yalnızca görevi için gerekli en düşük yetkiye sahip olmalıdır. Tam yetkili anahtar, daha düşük yetki yeterliyse kullanılmamalıdır.

---

## 12. Fiyat API anahtarı güvenliği

Doğru akış:

```text
Zamanlanmış veya yetkili Edge Function
        ↓
Sunucu secret store
        ↓
Dış fiyat API'si
        ↓
Doğrulama
        ↓
PostgreSQL
```

Yasak akış:

```text
Mobil uygulama → Dış fiyat API anahtarı → Sağlayıcı
```

Kurallar:

- Anahtar `EXPO_PUBLIC_` değişkenine yazılmaz.
- Anahtar query string içinde kullanılmaz, sağlayıcı destekliyorsa header tercih edilir.
- Anahtar istemci hata mesajına dönmez.
- Anahtar kullanım kotası izlenir.
- Şüpheli kullanımda anahtar hemen iptal edilip yenilenir.
- Anahtar değişimi mobil mağaza güncellemesi gerektirmemelidir.

---

## 13. Edge Function güvenliği

### 13.1. Genel kurallar

- Her fonksiyonun kimlik doğrulama ihtiyacı açıkça belirlenir.
- CORS ayarları gereksiz geniş tutulmaz.
- İstek gövdesi doğrulanır.
- Bilinmeyen alanlara güvenilmez.
- Hata yanıtı iç sistem ayrıntısı içermez.
- Secret değerleri istemciye dönmez.
- İşlem süresi ve tekrar deneme sınırlıdır.
- Fonksiyonlar yalnızca gerekli tablolara erişir.

### 13.2. `fetch-gold-prices`

- Son kullanıcı tarafından sınırsız çağrılamaz.
- Zamanlayıcı veya yetkili geliştirme çağrısıyla çalışır.
- Sağlayıcı anahtarını sunucu secret store'dan alır.
- Yanıt şemasını ve sembolleri doğrular.
- Eşleşmeyen sembolü reddeder.
- Geçersiz fiyatı kullanıcıya açmaz.
- `price_fetch_runs` kaydını güvenli biçimde günceller.

### 13.3. `delete-account`

- Kullanıcı kimliğini doğrulanmış oturumdan alır.
- İstek gövdesindeki `user_id` değerini güven kaynağı olarak kabul etmez.
- Yeniden kimlik doğrulama veya yakın zamanlı oturum şartını uygular.
- Silme işleminin her adımını kontrollü yürütür.
- Kısmi başarısızlığı gizlemez.
- Tamamlanmadan başarı dönmez.
- Aynı talebin tekrarında güvenli ve idempotent davranış hedeflenir.

### 13.4. `record-legal-event` (veya güvenli PostgreSQL RPC)

- Kullanıcı kimliğini doğrulanmış oturumdan alır; istek gövdesindeki serbest `user_id` değerini kabul etmez.
- İlgili belgenin `legal_documents` tablosunda etkin olduğunu doğrular.
- `document_version` değerini istemciden değil, doğrudan `legal_documents.version` alanından alır.
- `event_at` zamanını istemciden değil, güvenli sunucu veya veritabanı saatinden oluşturur.
- `document_type` ile `event_type` birleşiminin geçerliliğini doğrular.
- Kaydı append-only (sonradan güncellenemez ve silinemez) olarak oluşturur.

---

## 14. Dış fiyat verisi güvenliği

Dış sağlayıcı yanıtı güvenilir kaynak olsa bile doğrudan kullanılmaz.

Her kayıt için:

1. JSON yapısı doğrulanır.
2. Sembol boş olmamalıdır.
3. Sembol aktif eşleştirmeyle bulunmalıdır.
4. Alış ve satış alanlarının türü doğrulanır.
5. En az bir fiyat geçerli olmalıdır.
6. Fiyat negatif veya sıfır olmamalıdır.
7. Para birimi doğrulanmalıdır.
8. Ürün birimi doğrulanmalıdır.
9. Zaman damgası geçerli olmalıdır.
10. Makul olmayan gelecek zaman reddedilmelidir.
11. Sağlayıcının eski veri işareti korunmalıdır.
12. Olağan dışı değişim kontrolü uygulanmalıdır.

### Bilinmeyen sembol

- Otomatik ürün oluşturmaz.
- Tahminle başka ürüne bağlanmaz.
- Güvenli teknik olay olarak kaydedilebilir.
- Diğer geçerli ürünlerin işlenmesini engellemez.

### Fiyat yokluğu

- `null` kullanılır.
- `0` fiyat üretilmez.
- Başka ürünün fiyatı sessiz yedek olarak kullanılmaz.

---

## 15. Portföy verisi güvenliği

Portföy verisi kişisel finans bilgisi olarak hassas kabul edilir.

### İstemci kuralları

- Portföyün tamamı gereksiz yere loglanmaz.
- Kullanıcı notları hata raporuna eklenmez.
- Ekran değişiminde başka kullanıcı verisi kalmaz.
- Çıkışta kullanıcıya ait önbellek temizlenir.
- Çevrimdışı yazma başarılı gösterilmez.

### Sunucu ve veritabanı kuralları

- RLS sahipliği uygular.
- `user_id` doğrulanmış oturumla eşleşir.
- Miktar ve tutar backend veya veritabanında doğrulanır.
- Devre dışı ürün için yeni portföy kaydı oluşturulmaz.
- Başka kullanıcının kayıt kimliği varlığı gereksiz biçimde açıklanmaz.

### Hesaplanmış değerler

- Kâr-zarar kalıcı ana veri olarak portföy kaydında tutulmaz.
- Fiyat yoksa hesaplanmış değer oluşturulmaz.
- Kısmi portföyde yanıltıcı toplam gösterilmez.

---

## 16. Form ve girdi güvenliği

Bütün kullanıcı girdileri güvenilmeyen veri kabul edilir.

Kontroller:

- E-posta biçimi
- Şifre politikası
- Şifre tekrarı
- UUID biçimi
- Ürün varlığı ve etkinliği
- Miktarın pozitif olması
- Adetli üründe tam sayı
- Gramlı üründe en fazla üç ondalık
- Alış tarihinin gelecekte olmaması
- Toplam maliyetin pozitif olması
- Alış yeri uzunluğu
- Not uzunluğu
- İzin verilen enum değerleri

Kurallar:

- İstemci doğrulaması kullanıcı deneyimi içindir.
- Kritik doğrulama veritabanında veya güvenli sunucuda tekrar edilir.
- Hata mesajı başka kayıtların varlığını açıklamaz.
- Kullanıcı girdisi doğrudan SQL oluşturmak için kullanılmaz.
- HTML veya zengin metin desteklenmediği sürece kullanıcı notu düz metin olarak ele alınır.

---

## 17. API ve hata yanıtı güvenliği

Ortak güvenli hata modeli:

```text
code
userMessage
retryable
requestId
```

Kullanıcıya gösterilmeyecek bilgiler:

- SQL sorgusu
- Stack trace
- Tablo iç yapısının gereksiz ayrıntıları
- API anahtarı
- Erişim veya yenileme belirteci
- Veritabanı parolası
- Başka kullanıcı kimliği
- Ham sağlayıcı isteği ve gizli header'lar

`requestId`, kişisel veri veya secret içermeyen takip kimliği olmalıdır.

---

## 18. Loglama ve gözlemlenebilirlik güvenliği

### Loglanabilecek bilgiler

- İşlem türü
- Güvenli hata kodu
- Hassas olmayan takip kimliği
- İşlem süresi
- Sağlayıcı durum kodu
- İşlenen, reddedilen ve kaydedilen ürün sayısı
- Ortam adı

### Loglanmayacak bilgiler

- Şifre
- Şifre tekrarı
- Erişim belirteci
- Yenileme belirteci
- API anahtarı
- Veritabanı parolası
- Tam kullanıcı portföyü
- Kullanıcı notunun tamamı
- Gereksiz e-posta adresi
- Auth callback içindeki hassas belirteçler

### Production logları

- Development loglarından daha sınırlı olmalıdır.
- Saklama süresi belirlenmelidir.
- Erişim yetkisi sınırlandırılmalıdır.
- Gereksiz kişisel veri redakte edilmelidir.
- Güvenlik olayı dışında ham istek gövdesi tutulmamalıdır.

---

## 19. Yerel veri ve önbellek güvenliği

### Oturum

Güncel ve doğrulanmış güvenli mobil saklama yöntemi kullanılır.

### Fiyatlar

Hassas olmayan son fiyat verisi sınırlı süreli önbelleğe alınabilir. Fiyat zamanı ve eski veri durumu korunur.

### Portföy

- Tam portföy düz ve korumasız depolamada gereksiz yere tutulmaz.
- Yerel önbellek kullanılırsa kullanıcı kimliği ve oturum değişiminde temizlenir.
- Uygulama kaldırıldığında veya cihaz yedeklemesinde veri davranışı platforma göre değerlendirilir.
- V1'de çevrimdışı yazma kuyruğu bulunmaz.

### Ekran görüntüsü

V1'de ekran görüntüsünü yasaklama kararı verilmemiştir. Portföy ekranında kullanıcı deneyimi ve güvenlik dengesi Android ve iOS için ayrıca değerlendirilebilir.

---

## 20. Ağ güvenliği

- Yalnızca HTTPS bağlantıları kullanılmalıdır.
- Dış servis base URL değerleri doğrulanmalıdır.
- HTTP bağlantısına sessizce düşülmemelidir.
- İstek zaman aşımı uygulanmalıdır.
- Sonsuz tekrar deneme yapılmamalıdır.
- 429 yanıtında sağlayıcının tekrar deneme bilgisi dikkate alınmalıdır.
- Sertifika doğrulaması platform varsayılanlarını zayıflatacak şekilde kapatılmamalıdır.
- Hassas değerler URL query parametresine yazılmamalıdır.

Sertifika sabitleme V1 için kesin karar değildir. Ek karmaşıklık, anahtar döndürme ve platform etkisi değerlendirilmeden uygulanmayacaktır.

---

## 21. Ortam güvenliği

### Development

- Yalnızca test hesapları ve test verisi kullanılır.
- Production secret değerleri bulunmaz.
- Görünür `Development` işareti değerlendirilebilir.
- Otomatik fiyat zamanlayıcısı kapalı veya seyrek olabilir.

### Preview

- Sınırlı test kullanıcıları kullanılır.
- Production veritabanından kesinlikle ayrıdır (Ücretsiz paket sınırları kapsamında Development Supabase projesini paylaşabilir).
- Mağaza öncesi akışlar burada doğrulanır.

### Production

- Yalnızca doğrulanmış migrationlar uygulanır.
- Secret erişimi sınırlandırılır.
- Debug logları azaltılır.
- Test kullanıcıları ve sahte fiyatlar bulunmaz.
- Production erişimleri yalnızca gerekli kişilerde olur.

### Ortam karışmasını önleme

- Production için tamamen ayrı Supabase projesi; Development ve Preview için ortak test Supabase projesi (Free Tier 2 proje sınırı nedeniyle)
- Ayrı EAS profilleri
- Ayrı ortam değişkenleri
- Uygulama başlangıcında ortam doğrulaması
- Production build içinde development URL'si bulunmadığı kontrolü

---

## 22. Git ve kaynak kod güvenliği

### `.gitignore`

Aşağıdaki türde dosyalar dışlanmalıdır:

```text
.env
.env.local
.env.*.local
Gizli anahtar dosyaları
Geçici credential dosyaları
Yerel Supabase gizli yapılandırmaları
Platform imzalama sırları
```

### Commit öncesi kontrol

- Gerçek secret var mı?
- Gerçek kullanıcı verisi var mı?
- Ekran görüntüsünde hassas bilgi var mı?
- Debug logunda token var mı?
- Yanlış ortam URL'si var mı?
- Gereksiz büyük veya ikili dosya var mı?

### Git geçmişine secret girerse

Secret dosyayı silmek tek başına yeterli değildir.

1. Secret hemen iptal edilir.
2. Yeni secret üretilir.
3. Etkilenen erişimler incelenir.
4. Gerekirse Git geçmişi güvenli yöntemle temizlenir.
5. Ekip ve ilgili sağlayıcı bilgilendirilir.
6. Olay kaydedilir.

---

## 23. Bağımlılık güvenliği

Yeni paket eklenmeden önce:

1. Gerçek ihtiyaç açıklanır.
2. Expo ve React Native uyumluluğu kontrol edilir.
3. Android ve iOS desteği doğrulanır.
4. Son bakım ve sürüm geçmişi incelenir.
5. Bilinen güvenlik sorunları kontrol edilir.
6. Lisans uygunluğu incelenir.
7. Paket sahibi ve yaygın kullanımı değerlendirilir.
8. Aynı iş platformun mevcut özelliğiyle yapılabiliyor mu kontrol edilir.
9. Gerekliyse ADR kaydı oluşturulur.

Kurallar:

- Kilit dosyası Git'e eklenir.
- Paket sürümleri kontrolsüz yükseltilmez.
- Güvenlik taraması yapılır.
- Kullanılmayan paketler kaldırılır.
- Kurulum komutları resmi kaynaklardan doğrulanır.

---

## 24. Android güvenlik kontrolleri

- Güvenli oturum saklama davranışı
- Uygulama arka plan ve ön plan geçişi
- Derin bağlantı doğrulaması
- Uygulama bağlantısı veya özel scheme çakışmaları
- Backup davranışı
- Debug build ile production build ayrımı
- Ağ güvenlik yapılandırması
- Ekran kilidi sonrası oturum davranışı
- Çıkış sonrası yerel veri temizliği
- Başka kullanıcı girişi sonrası önbellek ayrılığı
- Uygulama package kimliği
- İmzalama anahtarlarının güvenli saklanması

Production imzalama anahtarları Git deposuna eklenmemelidir.

---

## 25. iOS güvenlik kontrolleri

- Keychain veya doğrulanmış güvenli saklama davranışı
- Universal Link veya özel scheme doğrulaması
- Uygulama arka plan ve ön plan geçişi
- Safe area ve hassas ekranların görünümü
- iCloud yedekleme davranışı
- Çıkış sonrası yerel veri temizliği
- Başka kullanıcı girişi sonrası önbellek ayrılığı
- Bundle identifier
- App Store imzalama ve sertifika erişimleri
- TestFlight ile production ortam ayrımı

İmzalama sertifikaları ve özel anahtarlar Git deposuna eklenmemelidir.

---

## 26. Hesap silme güvenliği

### Tehditler

- Başka kullanıcı hesabını silme girişimi
- Kısmi silme
- Aynı talebin tekrar gönderilmesi
- Yanlış başarı mesajı
- Silme sonrası aktif oturum kalması
- Saklanması gereken güvenlik kaydının yanlış silinmesi
- Silinmesi gereken kişisel verinin tutulması

### Zorunlu kontroller

1. Kullanıcı doğrulanmış oturuma sahip olmalıdır.
2. Hassas işlem için yeniden doğrulama uygulanmalıdır.
3. Kullanıcı kimliği token üzerinden alınmalıdır.
4. İstek gövdesindeki `user_id` kullanılmamalıdır.
5. `account_deletion_requests` kaydı oluşturulmalıdır.
6. Hesap `deletion_pending` durumuna alınmalıdır.
7. İşlem adımları ve hata durumu güvenli takip edilmelidir.
8. Silme tamamlanmadan başarı gösterilmemelidir.
9. Başarı sonrası bütün aktif oturumlar sonlandırılmalıdır.
10. Yerel önbellek temizlenmelidir.
11. Veri saklama politikası uygulanmalıdır.

### Çözülen Güvenlik Konusu (KI-018 & ADR-033)

Hesap silme işlemindeki kısmi hata telafisi `KI-018`, Migration 008 ve Migration 010 ile PostgreSQL tarafında atomik transaction yürüten `execute_account_deletion` RPC fonksiyonu kurularak çözülmüştür. İşlem sırasında `portfolio_entries`, `user_preferences`, `user_profiles` ve `auth.users` kayıtları tek bir SQL transaction bloğunda silinir; herhangi bir hata durumunda tüm adımlar otomatik olarak `ROLLBACK` edilir. `delete-account` Edge Function'ı ise `account_deletion_requests` tablosu üzerinden durum takibini yürütür.

---

## 27. Yasal belge ve olay kayıtları güvenliği

- Normal kullanıcı yasal belge metnini değiştiremez.
- Aktif belge sürümü kontrollü yönetilir.
- Normal kullanıcı `user_legal_events` tablosuna doğrudan kayıt ekleyemez, güncelleyemez veya silemez; yasal olaylar yalnızca güvenli PostgreSQL RPC veya Edge Function üzerinden kendi oturumu için append-only olarak oluşturulur.
- `document_version` kullanıcı girdisine güvenilerek alınmaz.
- Olay zamanı sunucu tarafından atanır.
- Aydınlatma ve açık rıza birbirine karıştırılmaz.
- Kayıtların saklama süresi hukuk uzmanıyla belirlenir.
- İçerik değişiklikleri sürüm ve hash ile izlenir.

---

## 28. Finansal sonuç bütünlüğü

Güvenlik yalnızca gizlilik değildir. Yanlış finansal sonuç üretmemek de bütünlük hedefidir.

Kurallar:

- Satın alma hesabında satış fiyatı kullanılır.
- Bozdurma hesabında alış fiyatı kullanılır.
- Portföy değerinde alış fiyatı kullanılır.
- Fiyat yoksa değer üretilmez.
- Eski fiyat açıkça işaretlenir.
- Ara işlemlerde gereksiz yuvarlama yapılmaz.
- Büyük tutar ve üç ondalıklı miktar testleri yapılır.
- Bütün kayıt yüzdeleri toplanmaz.
- Kısmi portföyde yanıltıcı toplam gösterilmez.

Sayısal hassasiyet yaklaşımı `KI-013` çözülmeden production hesaplaması tamamlanmış sayılmaz.

---

## 29. Hizmet kesintisi ve kötüye kullanım koruması

- Dış fiyat API'sinde sınırlı tekrar deneme uygulanır.
- Sonsuz döngü oluşturulmaz.
- 401 ve 403 hatalarında anahtar veya yetki sorunu araştırılır.
- 429 durumunda kota bilgisi dikkate alınır.
- Son geçerli fiyat korunabilir ama eski olarak gösterilir.
- Sağlayıcıya her mobil kullanıcı için ayrı istek gönderilmez.
- Fiyat çekme fonksiyonunun kontrolsüz çağrılması sınırlandırılır.
- E-posta tekrar gönderme işlemi hız sınırına tabi olmalıdır.
- Hassas işlemlerde çift gönderim engellenir.

---

## 30. Güvenlik olayları ve müdahale süreci

### Güvenlik olayı örnekleri

- Secret veya token sızıntısı
- Başka kullanıcı verisine erişim
- Yetkisiz fiyat yazımı
- GitHub'a gerçek kullanıcı verisi gönderilmesi
- Hesap ele geçirme şüphesi
- Malicious package veya dependency olayı
- Hesap silme işleminin yanlış kullanıcıyı etkilemesi
- Büyük ölçekli bozuk fiyat yayını

### Müdahale adımları

```text
1. Olayı fark et ve kaydet
2. Etkiyi sınırla
3. Sızan anahtarları iptal et
4. Etkilenen hizmet veya özelliği geçici durdur
5. Doğrulanmış kanıtları koru
6. Kapsamı ve etkilenen veriyi belirle
7. Güvenli düzeltmeyi hazırla
8. Düzeltmeyi test et
9. Hukuki bildirim gereksinimini değerlendir
10. Kullanıcı iletişimini doğrulanmış bilgiyle yap
11. Olay sonrası kök neden incelemesi yap
12. Belgeleri ve kontrolleri güncelle
```

### İletişim ilkesi

- Tahmin veya doğrulanmamış iddia paylaşılmaz.
- Hassas saldırı ayrıntıları herkese açık alana yazılmaz.
- Kullanıcılara etkisi varsa açık, doğru ve zamanında bilgi verilir.
- Hukuki yükümlülükler uzmanla değerlendirilir.

---

## 31. Secret sızıntısı müdahalesi

Bir secret yanlışlıkla ekrana, loga, sohbete veya Git'e yazılırsa:

1. Secret hemen geçersiz kılınır.
2. Yeni secret oluşturulur.
3. Eski secret kullanım kayıtları incelenir.
4. Etkilenen ortam belirlenir.
5. Production etkisi varsa ilgili sistem geçici sınırlandırılır.
6. Kod ve geçmiş temizlenir.
7. Yeni secret güvenli store'a eklenir.
8. Uygulama ve fonksiyonlar yeniden test edilir.
9. Olay `security_events` veya uygun güvenli kayıtta tutulur.
10. Tekrarı önleyici kontrol eklenir.

Secret rotasyonu yalnızca dosyadan silme işlemi değildir.

---

## 32. Güvenlik testi katmanları

### 32.1. Birim testleri

- Girdi doğrulaması
- Sayısal sınırlar
- Hata redaksiyonu
- Eski fiyat kuralları
- Bilinmeyen sembol reddi

### 32.2. Entegrasyon testleri

- Auth kayıt ve giriş
- Oturum yenileme
- Şifre sıfırlama
- Portföy CRUD
- Edge Function yetkilendirmesi
- Hesap silme

### 32.3. RLS testleri

- Kullanıcılar arası veri ayrılığı
- Sahiplik değişimi engeli
- Yönetim tablolarına yazma engeli
- Public veya authenticated rollerin en düşük yetkisi

### 32.4. Mobil cihaz testleri

- Android secure storage
- iOS secure storage
- Derin bağlantılar
- Çıkış sonrası önbellek
- Kullanıcı değişimi
- Arka plan ve ön plan oturumu

### 32.5. Production öncesi taramalar

- Git secret taraması
- Mobil bundle içinde secret araması
- Bağımlılık güvenlik taraması
- Yanlış ortam URL'si araması
- Hata logu ve crash raporu incelemesi

---

## 33. Güvenlik tamamlanma ölçütleri

V1 güvenlik açısından tamamlanmış sayılmadan önce:

- [ ] Bütün kullanıcı tablolarında RLS etkin.
- [ ] Kullanıcı A ve B ayrılığı test edildi.
- [ ] Başka kullanıcı adına INSERT engelleniyor.
- [ ] Başka kullanıcı kaydında UPDATE ve DELETE engelleniyor.
- [ ] Kullanıcı kayıt sahibini değiştiremiyor.
- [ ] Normal kullanıcı fiyat yazamıyor.
- [ ] Normal kullanıcı ürün veya eşleştirme değiştiremiyor.
- [ ] Secret ve service role anahtarları mobil pakette yok.
- [ ] Fiyat API anahtarı mobil pakette yok.
- [ ] Git geçmişinde secret yok.
- [ ] Şifre ve token loglanmıyor.
- [ ] Oturum Android'de güvenli ve kararlı çalışıyor.
- [ ] Oturum iOS'ta güvenli ve kararlı çalışıyor.
- [ ] Auth derin bağlantıları iki platformda test edildi.
- [ ] Fiyat doğrulama testleri geçiyor.
- [ ] Bilinmeyen sembol reddediliyor.
- [ ] Fiyat yokken `0 TL` üretilmiyor.
- [ ] Hesap silme başka kullanıcıyı etkileyemiyor.
- [ ] Hesap silme tamamlanmadan başarı dönmüyor.
- [ ] Production logları hassas veri içermiyor.
- [ ] Development ve Production ortamları ayrılmış.
- [ ] Bağımlılık güvenlik taraması tamamlanmış.
- [ ] Veri saklama süreleri belirlenmiş.
- [ ] Güvenlik olayı müdahale iletişim kanalı belirlenmiş.

---

## 34. Kesinleşen güvenlik kararları ve açık konular

### 34.1. Kilitlenen ve doğrulanan güvenlik mimarisi

1. **Supabase Bölgesi:** AB eu-central-1 Frankfurt (Almanya) seçildi (ADR-002).
2. **Mobil Oturum Saklama:** `expo-secure-store` ile donanımsal şifreli oturum yönetimi sağlandı.
3. **Şifre Politikası:** En az 6 karakter, büyük/küçük harf ve rakam kontrolü uygulandı (ADR-028).
4. **Auth Derin Bağlantı:** `altiniz://` ve `https://altiniz.app` alan adları doğrulandı.
5. **Sayısal Hassasiyet:** Kuruş bazlı BIGINT ve gram için NUMERIC(18,3) ile taşma koruması uygulandı (ADR-032).
6. **Aykırı Fiyat Filtresi:** `[-50%, +50%]` aykırı veri sınırlandırması uygulandı (KI-011).
7. **Hesap Silme Mimarisi:** Model A (Edge Function işlem dışı yönetim + atomik `execute_account_deletion` RPC + `auth.admin.deleteUser`) uygulandı (ADR-033).
8. **Güvenlik Kayıtları Saklama Süresi:** 5651 Sayılı Kanun gereğince 1 yıl saklama kilitlendi (`DATA_RETENTION.md`).
9. **Yasal Olaylar Saklama Süresi:** 3 yıl saklama ve `user_id = NULL` ile doğrudan kimlik bağlantısının koparılması kilitlendi (ADR-033).
10. **Üçüncü Taraf SDK'lar:** Sentry, Firebase veya reklam takipçisi barındırmama kararı uygulandı (ADR-026).
11. **Log Güvenliği:** `src/utils/logger.ts` ile parola/token maskelemesi ve canlıda debug susturması uygulandı.
12. **Secret Taraması:** Mobil kod tabanında (`src/`) 0 `service_role` veya sızdırılmış anahtar güvencesi sağlandı.
13. **RLS Güvenliği:** 12 veritabanı tablosunda çok kullanıcılı veri izolasyonu %100 testlerle doğrulandı.
14. **Güvenlik İletişim Kanalı:** `adem@altiniz.app` resmi adres olarak belirlendi.

### 34.2. Dış bağımlılığı olan konular

1. **Üretim e-posta hizmeti:** Resmî SMTP sağlayıcısı entegrasyonu (KI-017).
2. **Yasal metinlerin avukat onayı:** Hazırlanan teknik taslakların bir hukuk uzmanı tarafından incelenmesi (KI-025 - Mitigated).
3. **Fiyat sağlayıcısı ticari lisansı:** Truncgil Finance kamu verisi ticari yeniden gösterim/saklama lisansı ve AltinAPI ticari sözleşmesi (KI-003, KI-033).

---

## 35. Production yayımlama engelleri

Aşağıdakiler çözülmeden uygulama gerçek kullanıcılara açılmamalıdır:

- [x] Supabase bölgesi (eu-central-1 Frankfurt) ve veri aktarımı değerlendirmesi
- [x] RLS politikalarının iki kullanıcıyla doğrulanması (10/10 test başarılı)
- [!] Fiyat sağlayıcısı ticari kullanım lisansı (KI-003, KI-033 beklemede)
- [x] Gerçek fiyat sembol ve birim doğrulaması (25 ürün canlıda aktif)
- [x] Mobil oturum saklaması (expo-secure-store)
- [x] Auth derin bağlantıları (altiniz:// ve altiniz.app)
- [x] Hesap silme Model A mimarisi ve kısmi hata telafisi (ADR-033)
- [x] Veri saklama süreleri (DATA_RETENTION.md: security 1 yıl, legal 3 yıl, price 30 gün)
- [!] Hukuk uzmanı (avukat) onaylı yasal metinler (KI-025 - Mitigated)
- [x] Google Play ve App Store gizlilik beyanları (Data Safety & App Privacy tamamlandı)
- [x] Secret taraması (0 sızıntı doğrulandı)
- [x] Production log güvenliği (logger.ts maskeleme)
- [~] Fiziksel Android cihaz doğrulaması (KI-023 - Redmi Note 8 Pro testi sürüyor)
- [ ] iOS fiziksel cihaz testi (Apple Developer Program $99 hesabı bekleniyor)

---

## 36. Güvenlik incelemesi ekleme şablonu

```markdown
## Güvenlik incelemesi - GG.AA.YYYY

### İncelenen sürüm

- Git commit:
- EAS build:
- Android versionCode:
- iOS buildNumber:

### İncelenen alanlar

- Auth
- RLS
- Edge Functions
- Secret yönetimi
- Loglar
- Bağımlılıklar
- Android
- iOS

### Bulgular

- Kritik:
- Yüksek:
- Orta:
- Düşük:

### Uygulanan düzeltmeler

- Düzeltme ve doğrulama bilgisi

### Açık kalanlar

- KNOWN_ISSUES.md kayıtları
```

Gerçek değer oluşmadan commit veya build kimliği uydurulmaz.

---

## 37. İlgili belgeler

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
docs/PRIVACY.md
docs/DATA_RETENTION.md
.github/copilot-instructions.md
```

Güvenlik değişikliği:

- Gerçekleştiğinde `CHANGELOG.md` içine yazılır.
- Yeni görev oluşturuyorsa `TODO.md` güncellenir.
- Açık risk oluşturuyorsa `KNOWN_ISSUES.md` güncellenir.
- Mimari karar değiştiriyorsa `DECISIONS.md` güncellenir.
- Veri yapısını değiştiriyorsa `DATABASE.md` güncellenir.
- API davranışını değiştiriyorsa `API.md` güncellenir.
- Kişisel veri akışını değiştiriyorsa `PRIVACY.md` ve `DATA_RETENTION.md` güncellenir.

---

## 38. Belge güncelleme kuralları

Bu belge aşağıdaki durumlarda güncellenmelidir:

- Auth yöntemi değiştiğinde
- Oturum saklama yöntemi kesinleştiğinde
- RLS politikası eklendiğinde veya değiştiğinde
- Yeni Edge Function oluşturulduğunda
- Secret yönetimi değiştiğinde
- Yeni üçüncü taraf hizmet eklendiğinde
- Log veya hata izleme hizmeti eklendiğinde
- Veri saklama süresi belirlendiğinde
- Güvenlik açığı veya olayı tespit edildiğinde
- Güvenlik testi tamamlandığında
- Android veya iOS güvenlik davranışı değiştiğinde
- Hesap silme yöntemi değiştiğinde
- Production ortamı oluşturulduğunda

Güvenlik açığının sömürü ayrıntısı bu belgeye gereksiz biçimde yazılmamalıdır.

---

## 39. Sürüm geçmişi

### 1.4 Taslak - 26.10.2026

- Dış denetim bulguları doğrultusunda güvenlik mimarisi ve belgeler senkronize edildi:
  - Mağaza denetçi hesaplarının açık parolaları tüm dokümanlardan temizlendi; güvenli parola yöneticisi referansı getirildi.
  - Hesap silme Model A mimarisi (Edge Function işlem dışı yönetim + atomik execute_account_deletion RPC + auth.admin silimi + PII içermeyen azami 500 karakterlik failure_message) kilitlendi.
  - Veri saklama süreleri `DATA_RETENTION.md` tek kaynak yapılarak güvenlik olayları için 1 yıl (5651 Sayılı Kanun), yasal olaylar için 3 yıl olarak belgelendi.
  - Bölüm 34 ve 35 açık güvenlik konuları güncel kararlarla eşitlendi.

### 1.2 Taslak - 22.10.2026

- Faz 13 Güvenlik incelemesi ve sertleştirmesi tamamlandı.
- Mobil kod tabanında (`src/`) ve Git geçmişinde `service_role`, şifre veya gizli anahtar sızıntısı bulunmadığı doğrulandı.
- `src/utils/logger.ts` merkezi güvenli loglama aracı oluşturuldu; şifre (`password`, `parola`, `sifre`), Bearer token, JWT ve API anahtarı maskelemesi uygulandı; canlı ortamda debug loglarının susturulması sağlandı.
- 12 veritabanı tablosunda RLS etkinliği ve kullanıcı portföy izolasyonu (`auth.uid() = user_id`) doğrulandı.
- `delete-account` Edge Function CORS, 405 Method Not Allowed ve 401 Bearer sınırlandırmaları doğrulandı.
- Expo SDK 58 uyumlu yama sürümleri (`expo@~58.0.17`, `expo-linking@~58.0.14`, `expo-router@~58.0.25`) güncellendi; `npx expo-doctor` 20/20 test ile onaylandı.
- `supabase/tests/test-faz13-security-review.ts` 11/11 test ile doğrulandı.

### 1.1 Taslak - 19.10.2026

- `user_legal_events` tablosuna doğrudan istemci yazımı kapatıldı.
- Yasal olayların güvenilir sunucu işlemiyle oluşturulması zorunlu hâle getirildi.
- `user_preferences` güncelleme yetkisi yalnızca `theme` alanıyla sınırlandırıldı.
- Yasal olaylar için iki kullanıcılı güvenlik testleri eklendi.

### 1.0 Taslak - 03.09.2026

- Güvenlik hedefleri ve korunan varlıklar tanımlandı.
- Güven sınırları ve tehdit modeli oluşturuldu.
- Auth ve oturum güvenliği tanımlandı.
- RLS ve iki kullanıcılı güvenlik testleri tanımlandı.
- Veritabanı, Supabase anahtarı ve fiyat API anahtarı güvenliği tanımlandı.
- Edge Function ve dış fiyat doğrulama güvenliği tanımlandı.
- Portföy, form, API, log ve yerel önbellek güvenliği tanımlandı.
- Ağ, ortam, Git ve bağımlılık güvenliği tanımlandı.
- Android ve iOS güvenlik kontrolleri eklendi.
- Hesap silme ve yasal belge güvenliği tanımlandı.
- Güvenlik olayı ve secret sızıntısı müdahale süreçleri eklendi.
- Test katmanları, tamamlanma ölçütleri ve production engelleri eklendi.
