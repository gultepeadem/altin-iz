# Altın İz Proje Bağlamı

**Belge adı:** `PROJECT_CONTEXT.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.15 Taslak  
**Son güncelleme:** 22.10.2026 
**Proje durumu:** Fiyat sistemi (Faz 6.1 tamamlandı, Faz 6.2 sıradaki)  
**Kodlama durumu:** Fiyat çekme Edge Function, zaman aşımı (8s), hata ve kota yönetimi (401, 403, 429, 500-504) ve API anahtarı maskelemesi tamamlandı

---

## 1. Bu belgenin amacı

Bu belge, Altın İz projesinin güncel durumunu tek noktadan özetleyen ana proje hafızasıdır.

Her yeni yapay zekâ oturumunda bu dosya okunarak aşağıdaki soruların cevabı alınmalıdır:

- Proje nedir?
- Uygulama ne amaçla geliştiriliyor?
- Hedef kullanıcı kimdir?
- Hangi teknolojiler kullanılacak?
- V1 sürümünde hangi özellikler bulunacak?
- Hangi özellikler V1 kapsamında olmayacak?
- Hangi kararlar kesinleşti?
- Hangi kararlar henüz açık?
- Şu ana kadar neler tamamlandı?
- Şu anda hangi aşamadayız?
- Sıradaki kesin görev nedir?
- Kod yazarken hangi kurallara uyulmalıdır?

Bu dosya ayrıntılı teknik belgelerin yerine geçmez. Ayrıntılar için `DATABASE.md`, `API.md`, `DECISIONS.md` ve diğer proje belgeleri okunmalıdır.

---

## 2. Projenin kısa tanımı

Altın İz, Android ve iOS cihazlarda çalışacak çok sayfalı bir altın fiyatı ve kişisel portföy takip uygulamasıdır.

Kullanıcılar uygulamada:

- Kişisel hesap oluşturabilecek.
- E-posta adreslerini doğrulayabilecek.
- Hesaplarına güvenli şekilde giriş yapabilecek.
- Farklı altın türlerinin alış ve satış fiyatlarını görebilecek.
- Altın hesabı yapabilecek.
- Sahip oldukları altınları kişisel portföylerine ekleyebilecek.
- Her alış için miktar, alış tarihi ve ödenen toplam tutarı kaydedebilecek.
- Portföylerinin tahmini güncel bozdurma değerini görebilecek.
- Tahmini kâr veya zararlarını görebilecek.
- Portföy kayıtlarını düzenleyebilecek ve silebilecek.
- Yalnızca kendi hesaplarına ait verileri görebilecek.
- Hesaplarından çıkış yapabilecek.
- Hesaplarını ve ilişkili verilerini silme işlemini başlatabilecek.

Uygulama fiyatları bilgilendirme amacıyla gösterecek, yatırım tavsiyesi veya garanti kazanç sunmayacaktır.

---

## 3. Projenin çalışma adı ve marka kimliği

### Uygulamanın çalışma adı

```text
Altın İz
```

### Slogan

```text
Altınlarını Kaydet, Değerini İzle
```

### Kısa mağaza açıklaması

```text
Altın fiyatlarını ve kişisel portföyünü kolayca takip et.
```

### Marka durumu

`Altın İz` şu anda projenin çalışma adıdır. Google Play, App Store, alan adı, sosyal medya ve marka tescili açısından ayrıntılı kullanılabilirlik kontrolü henüz tamamlanmamıştır.

Uygulama yayımlanmadan önce:

- Türk Patent ve Marka Kurumu araştırması
- Google Play uygulama adı araştırması
- App Store uygulama adı araştırması
- Alan adı araştırması
- Sosyal medya kullanıcı adı araştırması
- Teknik uygulama kimliği araştırması

yapılmalıdır.

### Görsel tarz

```text
Modern
Sade
Güvenilir
Anlaşılır
Gösterişsiz finans uygulaması
```

### Ana renk yaklaşımı

```text
Gece laciverti
Mat altın
Kırık beyaz
```

Altın sarısı ana arka plan olarak değil, vurgu rengi olarak kullanılacaktır.

---

## 4. Temel kullanıcı problemi

Fiziki altın sahibi kullanıcılar çoğu zaman:

- Hangi altını ne zaman aldıklarını,
- Alırken ne kadar ödediklerini,
- Altının güncel yaklaşık bozdurma değerini,
- Toplamda kârda mı zararda mı olduklarını,
- Farklı tarihlerde yaptıkları alışların durumunu

tek ve düzenli bir yerde takip edememektedir.

Altın İz, kullanıcıların altın alışlarını kişisel hesaplarında kayıt altına almasını ve güncel alış fiyatları üzerinden tahmini portföy değerlerini görmesini sağlayacaktır.

---

## 5. Hedef kullanıcılar

Uygulamanın ana hedef kitlesi:

- Fiziki altın biriktiren kişiler
- Gram altın sahibi kullanıcılar
- Çeyrek, yarım, tam ve benzeri sarrafiye altınları biriktiren kişiler
- Bilezik veya ayar bazlı altınlarını takip etmek isteyen kişiler
- Farklı tarihlerde yaptığı altın alışlarını düzenli kaydetmek isteyen kişiler
- Karmaşık finans uygulamaları kullanmak istemeyen kişiler
- Basit ve anlaşılır kâr-zarar takibi isteyen kullanıcılar

Uygulama profesyonel yatırım işlemi yapan borsa kullanıcıları için geliştirilmemektedir.

---

## 6. Temel kullanıcı değeri

Uygulama kullanıcıya şu soruların cevabını verecektir:

- Hangi altınlardan ne kadar sahibim?
- Altınları ne zaman aldım?
- Her alış için toplam ne kadar ödedim?
- Altınlarımın tahmini güncel bozdurma değeri nedir?
- Her kayıtta yaklaşık kaç TL kâr veya zarar var?
- Toplam portföyüm yaklaşık kaç TL değerinde?
- Toplamda yaklaşık kaç TL ve yüzde kaç kâr veya zarardayım?
- Hesaplamada hangi fiyat kullanıldı?
- Kullanılan fiyat ne kadar güncel?

---

## 7. Desteklenecek platformlar

V1 kesin olarak:

```text
Android
iOS
```

platformlarında çalışacaktır.

Kurallar:

- Yalnızca Android'de çalışan özellik tamamlanmış sayılmaz.
- Yalnızca iOS'ta çalışan özellik tamamlanmış sayılmaz.
- Her önemli özellik iki platform açısından kontrol edilmelidir.
- Farklı telefon ekran boyutları dikkate alınmalıdır.
- Tablet için özel yerleşim V1 kapsamında zorunlu değildir.
- Android fiziksel cihaz testi (Expo Go veya ücretsiz APK ile) yapılmalıdır.
- iOS gerçek cihaz testi (ücretsiz Expo Go ile) veya uygun test süreci uygulanmalıdır.
- Google Play kapalı test ve iOS TestFlight süreçleri yalnızca ücretli mağaza hesapları açıldığında (yayın aşamasında) uygulanacaktır; geliştirme aşamasında zorunlu engel değildir.

---

## 8. Kullanılacak teknoloji

### Mobil uygulama

```text
React Native
Expo
TypeScript
Expo Router
```

### Geliştirme ortamı

```text
Visual Studio Code
Git
GitHub
GitHub Copilot Agent Mode
```

### Backend

```text
Supabase
Supabase PostgreSQL
Supabase Auth
PostgreSQL Row Level Security
Supabase Edge Functions veya güvenli sunucu fonksiyonları
```

### Uygulama üretimi ve mağaza hazırlığı

```text
Expo EAS Build
Google Play Console
App Store Connect
TestFlight
```

### Fiyat sağlayıcısı

Birincil aday:

```text
AltinAPI
```

Yedek aday:

```text
Altinapps
```

Fiyat sağlayıcısı henüz kesin üretim sağlayıcısı değildir. Gerçek API yanıtları, ürün kapsamı, ticari kullanım ve fiyat saklama şartları doğrulanmalıdır.

---

## 9. Sistem mimarisinin kısa özeti

```text
Kullanıcı
   ↓
React Native + Expo Mobil Uygulama
   │
   ├── Supabase Auth
   │      ├── Kayıt
   │      ├── E-posta doğrulama
   │      ├── Giriş
   │      └── Şifre sıfırlama
   │
   ├── Supabase Data API
   │      ├── Altın ürünleri
   │      ├── Güncel fiyatlar
   │      ├── Kullanıcı profili
   │      ├── Portföy kayıtları
   │      └── Yasal belgeler
   │
   └── Güvenli Sunucu Fonksiyonları
          ├── Dış fiyatları çekme
          ├── Fiyatları doğrulama
          ├── Ürün eşleştirme
          ├── Yasal olay kaydı oluşturma
          └── Hesap silme

Dış Fiyat Sağlayıcısı
          ↓
Güvenli Sunucu Fonksiyonu
          ↓
Supabase PostgreSQL
```

Mobil uygulama dış fiyat servisine doğrudan bağlanmayacaktır.

---

## 10. V1'in temel amacı

V1'in temel amacı:

> Kullanıcının hesap oluşturabilmesi, güncel altın fiyatlarını görebilmesi, sahip olduğu altınları alış tarihi ve ödediği toplam tutarla kişisel portföyüne kaydedebilmesi ve tahmini kâr-zarar durumunu görebilmesidir.

V1'in merkezindeki üç ana özellik:

1. Güncel altın fiyatlarını görüntüleme
2. Tek altın için satın alma veya bozdurma hesabı
3. Kişisel altın portföyü ve tahmini kâr-zarar takibi

Bu üç özellik güvenli ve kararlı şekilde çalışmadan V2 özelliklerine geçilmeyecektir.

---

## 11. V1 ana menü yapısı

Alt menü aşağıdaki beş bölümden oluşacaktır:

```text
Ana Sayfa
Fiyatlar
Hesapla
Portföyüm
Ayarlar
```

Alt menüde bulunmayacak alt ekranlar:

- Altın detay
- Portföye altın ekleme
- Portföy kaydı detayı
- Portföy kaydı düzenleme
- Hesap bilgileri
- Yasal belgeler
- Hesap silme

Bu ekranlara ilgili ana ekranlardan geçilecektir.

---

## 12. V1 ekranları

### Giriş öncesi ve durum ekranları

1. Açılış ekranı
2. Karşılama ekranı
3. Hesap oluşturma ekranı
4. E-posta doğrulama ekranı
5. Giriş ekranı
6. Şifremi unuttum ekranı
7. Yeni şifre belirleme akışı
8. Hesap durumu / erişim bilgilendirme ekranı (`account-status`, `deletion_pending` ve `disabled` hesaplar için)

### Ana uygulama ekranları

9. Ana Sayfa
10. Fiyatlar
11. Altın Detay
12. Hesapla
13. Portföyüm
14. Portföye Altın Ekle
15. Portföy Kaydı Detayı
16. Portföy Kaydı Düzenle
17. Ayarlar
18. Hesap Bilgileri
19. Yasal ve Gizlilik Belgeleri
20. Uygulama Hakkında
21. Destek ve Hata Bildirimi
22. Hesabı ve Verileri Sil

Bazı yardımcı işlemler ayrı sayfa yerine güvenli açılır pencere veya alt panel biçiminde uygulanabilir.

---

## 13. Kullanıcı hesabı V1 kapsamı

### V1'de bulunacaklar

- E-posta ile hesap oluşturma
- Şifre belirleme
- Şifre tekrarı
- E-posta doğrulama
- E-posta ve şifreyle giriş
- Şifremi unuttum
- Şifre sıfırlama bağlantısı
- Güvenli oturum saklama
- Uygulama yeniden açıldığında oturumu kontrol etme
- Çıkış yapma
- Hesabı ve verileri silme
- Kullanıcının yalnızca kendi verilerine erişmesi

### V1'de bulunmayacaklar

- Google ile giriş
- Apple ile giriş
- Facebook ile giriş
- Telefon numarasıyla giriş
- SMS doğrulama
- Sosyal hesap bağlama

---

## 14. Ana Sayfa V1 kapsamı

Ana Sayfa üzerinde:

- Kısa karşılama alanı
- Son fiyat güncelleme zamanı
- Gram Altın (`GRAM_GOLD`) alış ve satış fiyatı
- Çeyrek Altın, Yeni Tarihli (`QUARTER_GOLD_NEW`) alış ve satış fiyatı
- Ons Altın (`OUNCE_GOLD`) değeri
- Toplam ödenen tutar
- Tahmini toplam bozdurma değeri
- Tahmini toplam kâr veya zarar
- Toplam değişim yüzdesi
- Portföye Altın Ekle butonu
- Hızlı Hesaplama butonu
- Tüm Fiyatları Gör bağlantısı
- Veri güncelliği veya bağlantı uyarısı

bulunacaktır.

Kullanıcının portföyü boşsa anlamsız sıfır kartları yerine ilk kaydı eklemeye yönlendiren boş durum gösterilecektir.

---

## 15. Fiyatlar ekranı V1 kapsamı

Her desteklenen üründe mümkünse:

- Ürün adı
- Alış fiyatı
- Satış fiyatı
- Günlük değişim, sağlayıcı veriyorsa
- Son güncelleme zamanı
- Güncellik durumu
- Altın detay ekranına geçiş

bulunacaktır.

Kullanıcı:

- Ürün adına göre arama yapabilecek.
- Listeyi yenileyebilecek.
- İsme göre sıralayabilecek.
- Satış fiyatına göre artan sıralayabilecek.
- Satış fiyatına göre azalan sıralayabilecek.
- Bir ürüne dokunarak detayını açabilecek.

Fiyat olmayan ürün `0 TL` olarak gösterilmeyecektir.

---

## 16. Altın detay ekranı V1 kapsamı

- Altının tam adı
- Güncel alış fiyatı
- Güncel satış fiyatı
- Günlük değişim, varsa
- Günün en düşük değeri, varsa
- Günün en yüksek değeri, varsa
- Son fiyat zamanı
- Veri kaynağı
- Güncellik durumu
- Hesapla butonu
- Portföye Ekle butonu
- Finansal bilgilendirme

bulunacaktır.

V1'de fiyat grafiği veya teknik analiz bulunmayacaktır.

---

## 17. Hesaplama ekranı V1 kapsamı

Kullanıcı:

- Altın türünü seçer.
- Miktarı girer.
- Satın Alacağım veya Bozduracağım seçeneğini seçer.
- Hesaplama sonucunu görür.
- Sonucu portföye aktarabilir.

Kurallar:

```text
Satın Alacağım → Güncel satış fiyatı kullanılır
Bozduracağım  → Güncel alış fiyatı kullanılır
```

Kullanıcıya:

- Kullanılan fiyat
- Kullanılan fiyat türü
- Tahmini toplam tutar
- Fiyatın son güncelleme zamanı
- Fiyatın eski olup olmadığı
- Finansal bilgilendirme

sunulacaktır.

Hesaplanan piyasa tutarı, portföye gerçek maliyet olarak otomatik kaydedilmeyecektir.

---

## 18. Portföy V1 kapsamı

### Portföy özeti

- Toplam ödenen tutar
- Tahmini güncel bozdurma değeri
- Tahmini toplam kâr veya zarar
- Toplam değişim yüzdesi
- Toplam kayıt sayısı
- Yeni Altın Ekle butonu

### Her portföy kaydında

- Altın türü
- Miktar veya adet
- Alış tarihi
- Ödenen toplam tutar
- Tahmini güncel değer
- Tahmini kâr veya zarar
- Değişim yüzdesi
- Kayıt detayına geçiş

### Portföye ekleme zorunlu alanları

```text
Altın türü
Miktar veya adet
Alış tarihi
Ödenen toplam tutar
```

### İsteğe bağlı alanlar

```text
Alış yeri
Kullanıcı notu
İşçilik dâhil bilgisi
```

### Portföy işlemleri

- Kayıt ekleme
- Kayıt görüntüleme
- Kayıt düzenleme
- Kayıt silme

Her alış ayrı kayıt olarak tutulacaktır.

---

## 19. Desteklenecek altın ürünleri

Ürün listesi fiyat sağlayıcısı test edildikten sonra kesin teknik duruma ulaşacaktır.

### Öncelikli ürünler

- Gram Altın
- Çeyrek Altın
- Yarım Altın
- Tam Altın
- Ata Altın
- Gremse Altın
- 22 Ayar Altın
- Ons Altın

### Sağlayıcı doğrularsa etkinleştirilecek ürünler

- Cumhuriyet Altını
- Reşat Altını
- Hamit Altını
- 14 Ayar Altın
- 18 Ayar Altın
- 1 Gram Paketli Altın
- 2,5 Gram Paketli Altın
- 5 Gram Paketli Altın
- 10 Gram Paketli Altın
- 20 Gram Paketli Altın
- 50 Gram Paketli Altın
- 100 Gram Paketli Altın

### Eski ve yeni tarih ayrımı

Sağlayıcının ayrı fiyat verdiği ürünler ayrı ürün olarak gösterilecektir:

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

### Ürün etkinleştirme kuralı

Doğrudan ve doğrulanmış fiyatı bulunmayan ürün için:

```text
price_display_enabled = false
calculator_enabled = false
portfolio_enabled = false
```

kullanılacaktır.

---

## 20. Hesaplama kuralları

### Tahmini güncel bozdurma değeri

```text
Miktar × Güncel alış fiyatı
```

### Tahmini satın alma tutarı

```text
Miktar × Güncel satış fiyatı
```

### Kayıt bazında tahmini kâr veya zarar

```text
Tahmini güncel bozdurma değeri - Ödenen toplam tutar
```

### Kayıt bazında değişim yüzdesi

```text
(Tahmini kâr veya zarar ÷ Ödenen toplam tutar) × 100
```

### Portföy toplam ödenen tutarı

```text
Bütün portföy kayıtlarının ödenen tutarları toplamı
```

### Portföyün tahmini toplam bozdurma değeri

```text
Hesaplanabilen bütün kayıtların tahmini bozdurma değerleri toplamı
```

### Portföy toplam kâr veya zararı

```text
Toplam tahmini bozdurma değeri - Toplam ödenen tutar
```

Bütün kayıtların fiyatı hesaplanamıyorsa veya toplam kısmi kalıyorsa yanıltıcı toplam kâr-zarar gösterilmeyecektir.

---

## 21. Para ve miktar kuralları

### Para

- Para birimi V1'de Türk lirasıdır.
- Para tutarları veritabanında kuruş cinsinden `BIGINT` tutulur.
- Kullanıcıya `48.000,00 TL` biçiminde gösterilir.
- Sonuç ekranda iki ondalık basamağa yuvarlanır.
- Ara işlemde gereksiz yuvarlama yapılmaz.

### Miktar

- Miktar `NUMERIC(18,3)` olarak saklanır.
- Adetli ürünlerde pozitif tam sayı kullanılır.
- Gramlı ürünlerde azami üç ondalık basamak kullanılır.
- Ölçü birimi kullanıcı tarafından değiştirilmez.
- Birim, ürün kataloğundan belirlenir.

### İşçilik

- İşçilik V1'de otomatik hesaplanmaz.
- `labor_included` yalnızca açıklayıcı bilgidir.
- İşçilik ve komisyon kullanıcının girdiği toplam maliyetin içinde olabilir.

---

## 22. Fiyat bulunamadığında uygulanacak kurallar

Bir ürün için geçerli fiyat bulunamazsa:

- Ürün veya portföy kaydı silinmez.
- Ürün değeri `0 TL` kabul edilmez.
- Tahmini kâr-zarar hesaplanmaz.
- `Fiyat bilgisi alınamadı` mesajı gösterilir.

Bazı kayıtların fiyatı bulunamıyorsa:

```text
Kısmi toplam
```

uyarısı gösterilir.

Fiyatı bulunamayan kayıtların maliyeti nedeniyle yanıltıcı toplam kâr-zarar gösterilmez.

---

## 23. Eski fiyat davranışı

Güncel fiyat servisine ulaşılamaz ancak daha önce kaydedilmiş geçerli fiyat bulunursa son bilinen fiyat gösterilebilir.

Kullanıcıya:

- Son bilinen fiyat olduğu
- Fiyatın tarih ve saati
- Tahmini değerlerin güncel olmayabileceği

bildirilmelidir.

Eski fiyat canlı fiyat olarak sunulmamalıdır.

---

## 24. Temel veritabanı tabloları

### Kullanıcı hesabı

```text
auth.users
user_profiles
user_preferences
```

### Altın ve fiyat

```text
gold_products
price_sources
price_source_product_mappings
gold_prices
price_fetch_runs
```

### Portföy

```text
portfolio_entries
```

### Yasal ve gizlilik

```text
legal_documents
user_legal_events
account_deletion_requests
```

### Teknik ve güvenlik

```text
security_events
```

Ayrıntılı alanlar ve ilişkiler `DATABASE.md` içinde tanımlanmıştır.

---

## 25. Kullanıcı verisi güvenliği

Her kullanıcı yalnızca kendi özel verilerine erişebilecektir.

Temel sahiplik kuralı:

```text
portfolio_entries.user_id = doğrulanmış oturumdaki kullanıcı kimliği
```

Zorunlu güvenlik davranışları:

- A kullanıcısı B kullanıcısının portföyünü okuyamaz.
- A kullanıcısı B adına kayıt oluşturamaz.
- A kullanıcısı B'nin kaydını değiştiremez.
- A kullanıcısı B'nin kaydını silemez.
- Normal kullanıcı fiyat ekleyemez.
- Normal kullanıcı fiyat değiştiremez.
- Normal kullanıcı ürün kataloğunu değiştiremez.
- Normal kullanıcı sağlayıcı ürün eşleştirmelerini değiştiremez.

Bu güvenlik sadece mobil arayüzde değil, PostgreSQL RLS ve güvenli sunucu işlemlerinde uygulanacaktır.

---

## 26. API güvenliği

Mobil uygulamada bulunabilecek değerler:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_APP_ENV
```

Mobil uygulamada kesinlikle bulunmayacak değerler:

```text
Supabase secret key
Supabase service role key
Veritabanı şifresi
Altın fiyat API anahtarı
SMTP şifresi
E-posta hizmeti gizli anahtarı
```

Dış fiyat API anahtarı güvenli sunucu ortamında tutulacaktır.

---

## 27. KVKK ve gizlilik yaklaşımı

Uygulama veri minimizasyonu ilkesine göre tasarlanacaktır.

### V1'de gerekli olabilecek kişisel veriler

- E-posta adresi
- Kullanıcı hesap kimliği
- Portföy kayıtları
- Alış tarihleri
- Ödenen tutarlar
- İsteğe bağlı alış yeri ve not
- Kullanıcı tercihleri
- Yasal belge olayları
- Sınırlı güvenlik kayıtları

### V1'de toplanmayacak veriler

- TC kimlik numarası
- Açık adres
- Telefon rehberi
- Kullanıcı fotoğrafları
- Kamera görüntüsü
- Mikrofon kaydı
- Kesin konum
- Banka hesabı
- Kredi kartı bilgisi
- Biyometrik veri

### Zorunlu yasal çalışmalar

- Veri envanteri
- KVKK aydınlatma metni
- Gizlilik politikası
- Kullanım koşulları
- Veri saklama ve silme politikası
- Hesap silme süreci
- Kişisel veri başvuru kanalı
- Yurt dışına veri aktarımı değerlendirmesi
- Google Play Veri Güvenliği beyanı
- App Store gizlilik beyanı
- Yayımlama öncesi hukuk uzmanı kontrolü

Aydınlatma metni ile açık rıza tek bir genel onaya dönüştürülmeyecektir.

---

## 28. Hesap ve veri silme

Kullanıcı uygulama içinden hesap silme işlemini başlatabilecektir.

Temel akış:

```text
Kullanıcıyı yeniden doğrula
        ↓
Hesap silme talebi oluştur
        ↓
Hesabı deletion_pending yap
        ↓
Portföy kayıtlarını sil
        ↓
Kullanıcı tercihlerini sil
        ↓
Yasal ve güvenlik kayıtlarını saklama politikasına göre ele al
        ↓
Profil kaydını sil
        ↓
Auth hesabını sil
        ↓
Aktif oturumları kapat
```

İşlem gerçekten tamamlanmadan başarı mesajı gösterilmeyecektir.

---

## 29. Finansal bilgilendirme

Uygulamanın temel uyarısı:

> Uygulamada gösterilen fiyatlar ve hesaplamalar yalnızca bilgilendirme amaçlıdır. Fiyatlar kuyumcu, banka, piyasa koşulları, alış-satış farkı ve işçilik nedeniyle değişebilir. Gösterilen bilgiler yatırım danışmanlığı veya kesin alım-satım fiyatı niteliğinde değildir.

Uygulama aşağıdaki türde ifadeler kullanmayacaktır:

```text
Kesin yükselecek
Şimdi satın al
Garanti kazanç
En iyi yatırım
Şu tarihte sat
```

---

## 30. V1'de bulunmayacak özellikler

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
Çoklu altın hesaplama sepeti
Satış geçmişi
Kısmi satış
Gerçekleşmiş kazanç hesabı
PDF dışa aktarma
Excel dışa aktarma
Kamera ile fiş tarama
Belge veya fotoğraf yükleme
Konum ve harita
Kuyumcu bulma
Kullanıcılar arası mesajlaşma
Sosyal özellikler
Reklam
Premium üyelik
Uygulama içi ödeme
Çoklu dil
Çoklu para birimi
Web uygulaması
Gelişmiş yönetici paneli
```

Bu özellikler iptal edilmemiştir. V1 kapsamının güvenli ve yönetilebilir kalması için sonraki sürümlere bırakılmıştır.

---

## 31. Yapay zekâ ile çalışma kuralları

Proje, yazılım geliştirme deneyimi olmayan bir kullanıcıyla geliştirilmektedir.

Yapay zekâ:

1. Kullanıcının teknik bilgiye sahip olduğunu varsaymamalıdır.
2. Her işlemi Türkçe ve numaralı adımlarla anlatmalıdır.
3. Açılacak programı açıkça belirtmelidir.
4. Tıklanacak menü ve düğmeyi tam adıyla yazmalıdır.
5. Açılacak klasör ve dosya yolunu eksiksiz vermelidir.
6. Mevcut kodda bulunacak bölümü göstermelidir.
7. Yeni kodun hangi bölümden önce veya sonra geleceğini söylemelidir.
8. Silinecek kod varsa başlangıç ve bitişini göstermelidir.
9. Mümkünse değiştirilen dosyanın tam hâlini vermelidir.
10. Terminal komutunun nereye yazılacağını açıklamalıdır.
11. Beklenen sonucu belirtmelidir.
12. Hata çıkarsa hangi bilginin paylaşılacağını söylemelidir.
13. Android ve iOS etkisini ayrı kontrol etmelidir.
14. Çalışan özellikleri gereksiz yere değiştirmemelidir.
15. Gereksiz bağımlılık eklememelidir.
16. Büyük mimari değişikliği sessizce yapmamalıdır.
17. Değişiklik sonrası testleri çalıştırmalıdır.
18. Proje belgelerini güncellemelidir.
19. Git ile geri dönüş noktası oluşturmalıdır.
20. Test edilmemiş işi tamamlandı saymamalıdır.

Ayrıntılı kalıcı talimatlar `.github/copilot-instructions.md` dosyasında tanımlanmıştır.

---

## 32. Git çalışma düzeni

Her özellikte aşağıdaki döngü kullanılacaktır:

```text
1. Görevi belirle
2. Proje belgelerini oku
3. Mevcut kodu incele
4. Değişecek dosyaları belirle
5. Riskleri açıkla
6. Git durumunu kontrol et
7. Güvenli geri dönüş kaydı oluştur
8. Küçük değişiklik yap
9. Uygulamayı çalıştır
10. Android'de test et
11. iOS uyumluluğunu kontrol et
12. Hataları düzelt
13. Testleri çalıştır
14. Güvenlik ve gizlilik etkisini kontrol et
15. Çalışan sürümü Git'e kaydet
16. Proje belgelerini güncelle
17. HANDOFF.md dosyasını güncelle
```

---

## 33. Hazırlanan proje belgeleri

Aşağıdaki 14 başlangıç belgesi hazırlanmıştır:

1. `PROJECT_CONTEXT.md`
2. `ARCHITECTURE.md`
3. `DATABASE.md`
4. `API.md`
5. `DECISIONS.md`
6. `TODO.md`
7. `CHANGELOG.md`
8. `KNOWN_ISSUES.md`
9. `HANDOFF.md`
10. `SECURITY.md`
11. `PRIVACY.md`
12. `DATA_RETENTION.md`
13. `.github/copilot-instructions.md`
14. `README.md`

Başlangıç belge setinde eksik belge bulunmamaktadır.

---

## 34. Tamamlanan planlama çalışmaları

- [x] Android ve iOS uyumluluğu zorunlu olarak belirlendi.
- [x] React Native, Expo ve TypeScript seçildi.
- [x] Expo Router seçildi.
- [x] Çok sayfalı uygulama yapısı belirlendi.
- [x] Ana alt menü belirlendi.
- [x] Kullanıcı hesabı zorunlu olarak belirlendi.
- [x] E-posta ve şifreyle giriş yöntemi seçildi.
- [x] Her kullanıcının verisinin ayrılması kararlaştırıldı.
- [x] Supabase backend olarak seçildi.
- [x] PostgreSQL veritabanı seçildi.
- [x] RLS güvenlik yaklaşımı seçildi.
- [x] V1 özellikleri kesinleştirildi.
- [x] V1 kapsam dışı özellikler belirlendi.
- [x] Hesaplama formülleri kesinleştirildi.
- [x] Para saklama biçimi kesinleştirildi.
- [x] Miktar ve birim kuralları kesinleştirildi.
- [x] Portföy veri modeli kesinleştirildi.
- [x] Veritabanı tabloları tasarlandı.
- [x] Fiyat sağlayıcısı adayları belirlendi.
- [x] REST fiyat entegrasyonu kararlaştırıldı.
- [x] Sağlayıcı ürün eşleştirme tablosu eklendi.
- [x] API taslağı hazırlandı.
- [x] Karar belgesi hazırlandı.
- [x] Altın İz çalışma adı belirlendi.
- [x] Görsel tasarım yönü belirlendi.
- [x] Ana kullanıcı akışları çıkarıldı.
- [x] KVKK ve mağaza gizlilik gereksinimleri plana eklendi.

---

## 35. Henüz kesinleşmeyen önemli konular

- [ ] Supabase veri merkezi bölgesi
- [ ] Yurt dışına veri aktarımının kesin hukuki yöntemi
- [ ] Üretim e-posta gönderim hizmeti
- [ ] Kesin şifre politikası
- [ ] AltinAPI gerçek test hesabı
- [ ] AltinAPI gerçek sembol listesi
- [ ] AltinAPI ticari paket ve lisans şartları
- [ ] Fiyatları uygulamada gösterme hakkı
- [ ] Fiyat geçmişini saklama hakkı ve süresi
- [ ] Üretim fiyat çekme sıklığı
- [ ] Fiyatın eski sayılacağı kesin süre
- [ ] Olağan dışı fiyat değişim eşiği
- [ ] Cumhuriyet Altını ve Ata Altını kesin ürün ayrımı
- [ ] 18 Ayar desteği
- [ ] Reşat Altını desteği
- [ ] Hamit Altını desteği
- [ ] Güvenlik olaylarının saklama süresi
- [ ] Yasal olayların saklama ve anonimleştirme yöntemi
- [ ] Hesap silme başarısızlık telafi yöntemi
- [ ] Portföy hesaplamasının SQL, RPC veya servis katmanı seçimi
- [ ] Altın İz marka kullanılabilirliği
- [ ] Android uygulama kimliği
- [ ] iOS uygulama kimliği
- [ ] Uygulama logosunun son tasarımı
- [ ] Mağaza geliştirici hesapları

---

## 36. Mevcut proje durumu

```text
Aşama: Planlama ve dokümantasyon
Kodlama: Başlamadı
Expo projesi: Oluşturulmadı
Git deposu: Oluşturulmadı
GitHub deposu: Oluşturulmadı
Supabase projesi: Oluşturulmadı
Fiyat API hesabı: Oluşturulmadı
Android testi: Başlamadı
iOS testi: Başlamadı
Mağaza hazırlığı: Başlamadı
```

Şu anda gerçek kullanıcı verisi, gerçek portföy kaydı veya üretim anahtarı bulunmamaktadır.

---

## 37. Şu anda üzerinde çalışılan konu

Bölüm 11 (Kullanıcı Hesabı Geliştirmesi) kapsamındaki Faz 5 (Supabase istemcisi) adımı başarıyla tamamlanmıştır.

Son tamamlanan ana iş:

```text
Faz 5 tamamlandı: Expo SDK 58 uyumlu @supabase/supabase-js ve @react-native-async-storage/async-storage kuruldu; src/lib/environment.ts (katı doğrulama), src/lib/supabase.ts (singleton istemci ve oturum saklama adaptörü) ve src/lib/index.ts oluşturuldu; canlı veritabanı sorgusu test edildi.
```

Mevcut geçiş durumu:

```text
Faz 6.1 (Fiyat çekme Edge Function) tamamlandı; Bölüm 12 (Fiyat Sistemi) - Faz 6.2 aşamasına geçiş
```

---

## 38. Sıradaki kesin görev

Sıradaki teknik görev:

```text
Faz 6.2: Fiyat doğrulama
```

Bu görevde dış sağlayıcıdan dönen ham fiyat verisinin JSON yapısı, liste formatı, sembol varlığı ve eşleşme durumu, alış/satış fiyatlarının sayısal pozitifliği, para birimi (TRY/USD) ve ürün birimi doğrulaması, zaman damgası kontrolleri, TL kuruşa güvenli çevrim ve `price_fetch_runs` tablosuna durum (`success`, `partial`, `failed`) kaydı kodlanacaktır.

---

## 39. Kodlamaya başlamadan önce tamamlanması gerekenler

- [x] Bütün başlangıç proje belgeleri hazırlandı.
- [x] Dört aşamalı çapraz tutarlılık kontrolü ve şema, RLS, API akışı, kapsam ve görev sırası düzeltmeleri tamamlandı.
- [ ] Supabase bölgesi değerlendirilmelidir.
- [ ] Fiyat sağlayıcısına gönderilecek ticari kullanım soruları hazırlanmalıdır.
- [ ] V1 ürün kataloğunun koşullu başlangıç listesi oluşturulmalıdır.
- [ ] Proje klasör yapısı kesinleştirilmelidir.
- [ ] Kullanılacak programların kurulum sırası hazırlanmalıdır.
- [ ] Bilgisayarın işletim sistemi ve mevcut kurulumları kontrol edilmelidir.
- [ ] Android fiziksel test cihazı belirlenmelidir.
- [ ] iOS test yöntemi belirlenmelidir.
- [ ] GitHub ve Expo hesapları hazırlanmalıdır.
- [ ] Supabase hesabı hazırlanmalıdır.

---

## 40. V1 başarı ölçütleri

V1 ancak aşağıdaki işlemler gerçekten çalıştığında tamamlanmış kabul edilecektir:

1. Kullanıcı hesap oluşturabiliyor.
2. E-posta adresini doğrulayabiliyor.
3. Hesabına giriş yapabiliyor.
4. Şifresini sıfırlayabiliyor.
5. Oturumu güvenli şekilde devam ediyor.
6. Güncel altın fiyatlarını görebiliyor.
7. Alış ve satış fiyatını ayırt edebiliyor.
8. Tek altın için satın alma hesabı yapabiliyor.
9. Tek altın için bozdurma hesabı yapabiliyor.
10. Portföyüne altın kaydı ekleyebiliyor.
11. Alış tarihini kaydedebiliyor.
12. Ödediği toplam tutarı kaydedebiliyor.
13. Kayıt uygulama kapatıldıktan sonra kaybolmuyor.
14. Başka cihazdan giriş yaptığında kendi verilerine ulaşıyor.
15. Tahmini güncel bozdurma değerini görebiliyor.
16. Tahmini kâr veya zararını görebiliyor.
17. Portföy kaydını düzenleyebiliyor.
18. Portföy kaydını silebiliyor.
19. Başka kullanıcının verilerini göremiyor.
20. Başka kullanıcının kaydını değiştiremiyor.
21. Başka kullanıcının kaydını silemiyor.
22. Hesabından çıkış yapabiliyor.
23. Hesabını ve silinmesi gereken verilerini silebiliyor.
24. İnternet ve fiyat servisi hataları güvenli yönetiliyor.
25. Fiyat yokken `0 TL` gösterilmiyor.
26. Eski fiyat güncel fiyat gibi gösterilmiyor.
27. Uygulama Android cihazda çalışıyor.
28. Uygulama iOS cihazda veya gerçek iOS test sürecinde çalışıyor.
29. KVKK ve mağaza belgeleri hazırlanmış oluyor.
30. Google Play ve App Store test süreçlerine gönderilebiliyor.

---

## 41. Temel riskler

### Fiyat verisi lisansı

Fiyat sağlayıcısının veriyi ticari uygulamada gösterme ve saklama izni henüz yazılı olarak doğrulanmamıştır.

### Ürün adları ve eşleştirmeler

Cumhuriyet, Ata, tam, ziynet, eski ve yeni gibi kavramlar sağlayıcılara göre farklı adlandırılabilir. Tahminle eşleştirme yapılmamalıdır.

### KVKK ve yurt dışı aktarım

Supabase ve diğer hizmetlerin veri konumu ve aktarım yapısı hukuk uzmanıyla değerlendirilmelidir.

### Hesap silme

Birden fazla tabloda ve Auth sisteminde işlem gerektirir. Kısmi silme ve hata telafisi dikkatli tasarlanmalıdır.

### Yapay zekâ kaynaklı kod hataları

Yapay zekâ yanlış dosyayı değiştirebilir, gereksiz paket ekleyebilir veya çalışan özelliği bozabilir. Git, testler ve proje belgeleri zorunludur.

### Kapsam büyümesi

Favoriler, alarmlar, grafikler, satış geçmişi ve premium gibi özellikler V1'e eklenirse geliştirme süresi ve hata riski artar.

---

## 42. Proje belgelerini okuma sırası

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

## 43. Belge güncelleme kuralları

Bu belge aşağıdaki durumlardan birinde güncellenmelidir:

- Proje adı değişirse
- V1 kapsamı değişirse
- Yeni ana özellik eklenirse
- Bir ana özellik çıkarılırsa
- Teknoloji değişirse
- Backend değişirse
- Fiyat sağlayıcısı kesinleşirse veya değişirse
- Yeni kişisel veri toplanırsa
- Ana ekran yapısı değişirse
- Hesaplama yöntemi değişirse
- Mevcut proje aşaması değişirse
- Önemli belge tamamlanırsa
- Kodlama başlarsa
- Test aşamasına geçilirse
- Mağaza hazırlığı başlarsa
- Sıradaki kesin görev değişirse

Ayrıntılı değişiklik ayrıca `CHANGELOG.md` dosyasına yazılmalıdır. Mimari veya ürün kararı değişiyorsa `DECISIONS.md` de güncellenmelidir.

---

## 44. Sürüm geçmişi

### 1.1 Taslak - 03.09.2026

- Hazırlanan başlangıç belge sayısı 14 olarak doğrulandı.
- Eski çalışma konusu ve oturum bilgileri güncellendi.
- Bozuk tekil rakam satırları kaldırıldı.
- Belge okuma sırası ortak standartla eşitlendi.
- Sıradaki görev geliştirme araçlarının kontrolü olarak güncellendi.

### 1.0 - 03.09.2026

- Projenin amacı ve hedef kullanıcıları kaydedildi.
- V1 kapsamı ve kapsam dışı özellikler kaydedildi.
- Teknoloji ve backend özeti eklendi.
- Ana ekran yapısı eklendi.
- Hesaplama ve fiyat kuralları eklendi.
- Veritabanı tablo özeti eklendi.
- KVKK, güvenlik ve hesap silme yaklaşımı eklendi.
- Hazırlanan proje belgeleri kaydedildi.
- Açık kararlar ve temel riskler kaydedildi.
- Mevcut proje durumu ve sıradaki görev belirlendi.
