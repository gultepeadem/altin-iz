# Altın İz V1 Gizlilik Tasarımı ve Kişisel Veri Envanteri

**Belge adı:** `PRIVACY.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.0 Taslak  
**Son güncelleme:** 19.10.2026 
**Proje aşaması:** Planlama ve dokümantasyon  
**Kodlama durumu:** Henüz başlanmadı  
**Hedef platformlar:** Android ve iOS

---

## 1. Önemli hukuki uyarı

Bu belge:

- Uygulamanın gizlilik tasarımını,
- Planlanan kişisel veri akışlarını,
- Veri minimizasyonu kurallarını,
- Mağaza beyanı hazırlıklarını,
- Hukuk uzmanının doğrulaması gereken açık noktaları

belgeleyen dahili çalışma taslağıdır.

Bu belge nihai KVKK Aydınlatma Metni, Açık Rıza Metni, Gizlilik Politikası veya hukuk görüşü değildir. Production yayını ve gerçek kullanıcı kaydı açılmadan önce güncel mevzuata göre hukuk uzmanı tarafından incelenmeli ve veri sorumlusu bilgileriyle tamamlanmalıdır.

---

## 2. Belgenin amacı

Bu belgenin amaçları:

1. Altın İz'in işlemesi planlanan kişisel verileri listelemek
2. Her veri için işleme amacını açıklamak
3. Zorunlu ve isteğe bağlı verileri ayırmak
4. Gereksiz veri toplamayı engellemek
5. Verinin uygulama içinde hangi sistemlere aktığını göstermek
6. Üçüncü taraf hizmetleri ve veri işleyenleri takip etmek
7. Yurt dışına aktarım ihtimalini görünür kılmak
8. Hesap silme ve saklama süreçlerini gizlilik açısından tanımlamak
9. Google Play ve App Store beyanlarına kaynak oluşturmak
10. Yeni özellik eklenirken gizlilik etkisi değerlendirmesini zorunlu kılmak

---

## 3. Temel gizlilik ilkeleri

Altın İz aşağıdaki ilkelere göre geliştirilecektir:

- Hukuka ve dürüstlük kurallarına uygun işleme
- Doğru ve gerektiğinde güncel veri
- Belirli, açık ve meşru amaçlar
- Amaçla bağlantılı, sınırlı ve ölçülü veri
- Gerekli süre kadar saklama
- Veri minimizasyonu
- Varsayılan olarak gizlilik
- Tasarımdan itibaren gizlilik
- Şeffaflık
- Hesap verebilirlik
- En az yetki
- Kullanıcılar arası veri ayrılığı
- Güvenli silme ve anonimleştirme

Bir özellik kişisel veri olmadan çalışabiliyorsa kişisel veri toplanmayacaktır.

---

## 4. Gizlilik kapsamı

Bu belge aşağıdaki sistemleri kapsar:

```text
React Native + Expo mobil uygulama
Supabase Auth
Supabase PostgreSQL
Supabase Data API
Supabase Edge Functions
Production e-posta gönderim hizmeti
Altın fiyat sağlayıcısı
Gelecekte eklenirse hata izleme hizmeti
Gelecekte eklenirse analitik hizmeti
Google Play
App Store
Destek ve veri sahibi başvuru kanalları
```

Henüz seçilmemiş üçüncü taraf hizmetler kesinleşmiş gibi gösterilmez.

---

## 5. Veri konusu kişi grupları

V1'de planlanan kişi grupları:

- Hesap oluşturan kullanıcılar
- Hesap silme talebinde bulunan kullanıcılar
- Destek talebi gönderen kullanıcılar
- Test kullanıcıları
- Güvenlik olayıyla ilişkili kullanıcılar

Çocuklara özel bir hizmet tasarlanmamıştır. Uygulamanın yaş derecelendirmesi, hedef kitlesi ve çocuklara ilişkin yükümlülükler yayımlama öncesinde ayrıca değerlendirilmelidir.

---

## 6. Veri sorumlusu bilgileri

Aşağıdaki bilgiler henüz kesinleşmemiştir ve production öncesinde doldurulmalıdır:

```text
Veri sorumlusu gerçek veya tüzel kişi: BELİRLENMEDİ
Ticari unvan: BELİRLENMEDİ
Adres: BELİRLENMEDİ
İletişim e-postası: BELİRLENMEDİ
KVKK başvuru kanalı: BELİRLENMEDİ
Destek e-postası: BELİRLENMEDİ
MERSİS veya ilgili sicil bilgisi: UYGULANABİLİRLİĞİ DEĞERLENDİRİLECEK
VERBİS durumu: YÜKÜMLÜLÜK VE İSTİSNA DURUMU DEĞERLENDİRİLECEK
```

Bu alanlar tamamlanmadan nihai aydınlatma metni yayımlanmamalıdır.

---

## 7. V1 kişisel veri envanteri

### 7.1. Hesap ve kimlik doğrulama verileri

#### E-posta adresi

```text
Kaynak: Kullanıcı
Zorunlu: Evet
Amaç: Hesap oluşturma, giriş, doğrulama, şifre sıfırlama ve hesap iletişimi
Ana sistem: Supabase Auth
Kullanıcıyla bağlantılı: Evet
Saklama: DATA_RETENTION.md ile kesinleştirilecek
```

#### Auth kullanıcı kimliği

```text
Kaynak: Supabase Auth
Zorunlu: Evet
Amaç: Kullanıcı kayıtlarını güvenli biçimde ilişkilendirmek
Tür: UUID
Kullanıcıyla bağlantılı: Evet
```

#### E-posta doğrulama durumu

```text
Kaynak: Supabase Auth
Amaç: Doğrulanmamış hesapların korunan alana erişimini engellemek
```

#### Oturum ve yenileme belirteçleri

```text
Kaynak: Supabase Auth
Amaç: Güvenli oturumun sürdürülmesi
Yer: Doğrulanmış mobil güvenli saklama yöntemi
Uygulama veritabanında kalıcı alan: Hayır
Loglama: Yasak
```

#### Şifre

```text
Kaynak: Kullanıcı
Amaç: Kimlik doğrulama
Normal uygulama tablolarında saklama: Yasak
Loglama: Yasak
Analitik veya hata izlemeye gönderme: Yasak
```

### 7.2. Profil verileri

#### Görünen ad

```text
Kaynak: Kullanıcı
Zorunlu: Hayır
Amaç: Uygulama içi kişiselleştirilmiş karşılama
Pazarlama amacı: Hayır
```

#### Hesap durumu

```text
Kaynak: Sistem
Örnekler: active, deletion_pending, disabled
Amaç: Hesap yaşam döngüsünü ve güvenli erişimi yönetmek
Kullanıcı tarafından doğrudan değiştirilebilir: Hayır
```

### 7.3. Kullanıcı tercihleri

#### Tema tercihi

```text
Değerler: light, dark, system
Amaç: Kullanıcı deneyimini kişiselleştirmek
Zorunlu: Hayır
```

#### Dil ve para birimi

```text
V1 dili: tr
V1 para birimi: TRY
Amaç: Gösterim tercihleri
V1'de kullanıcı tarafından serbest seçim: Hayır (V1'de yalnızca tr ve TRY sabittir)
```

### 7.4. Portföy verileri

#### Altın ürünü

```text
Kaynak: Kullanıcının merkezi katalogdan seçimi
Amaç: Kullanıcının sahip olduğu altını kaydetmek
```

#### Miktar veya adet

```text
Kaynak: Kullanıcı
Amaç: Portföy değerini hesaplamak
Hassasiyet: Ürüne göre adet veya azami üç ondalıklı gram
```

#### Alış tarihi

```text
Kaynak: Kullanıcı
Amaç: Altın alış kaydını ve geçmişini tutmak
Saat bilgisi: V1'de alınmaz
```

#### Ödenen toplam tutar

```text
Kaynak: Kullanıcı
Amaç: Tahmini kâr-zarar hesaplamak
Saklama biçimi: Kuruş cinsinden tam sayı
Finansal hesap veya banka verisi: Hayır
```

#### Alış yeri

```text
Kaynak: Kullanıcı
Zorunlu: Hayır
Amaç: Kullanıcının kendi kaydını açıklaması
Serbest metin: Evet, sınırlı uzunluk
```

#### Kullanıcı notu

```text
Kaynak: Kullanıcı
Zorunlu: Hayır
Amaç: Kullanıcının kendi portföy kaydına açıklama eklemesi
Serbest metin: Evet, azami 500 karakter
Özel nitelikli veri girmemesi kullanıcıya hatırlatılabilir
```

#### İşçilik dâhil bilgisi

```text
Kaynak: Kullanıcı
Amaç: Girilen toplam maliyetin açıklanmasına yardımcı olmak
Otomatik işçilik hesabı: Hayır
```

### 7.5. Hesaplanan finansal sonuçlar

- Tahmini güncel bozdurma değeri
- Tahmini kâr veya zarar
- Değişim yüzdesi
- Kısmi veya tam toplam durumu

Bu değerler kullanıcının portföy verisi ile ortak fiyat verilerinden türetilir. `portfolio_entries` tablosunda ana gerçek veri olarak kalıcı biçimde saklanmaz.

### 7.6. Yasal olay verileri

- İlgili kullanıcı kimliği
- Belge türü
- Belge sürümü
- Olay türü
- Sunum, kabul, ret veya geri çekme zamanı
- Gerekli sınırlı teknik bağlam

Aydınlatma metninin gösterilmesi ile açık rıza birbirine dönüştürülmez.

### 7.7. Hesap silme verileri

- Silme talebi kimliği
- Kullanıcı kimliği
- Talep zamanı
- Durum
- Tamamlanma zamanı
- Güvenli ve sınırlı hata kodu

Tam hata metni veya hassas sistem ayrıntıları kullanıcı kaydında tutulmamalıdır.

### 7.8. Güvenlik ve teknik olay verileri

Planlanan sınırlı alanlar:

- Güvenli olay türü
- Olay zamanı
- Hassas olmayan takip kimliği
- Başarı veya hata durumu
- Gerekirse anonimleştirilmiş veya sınırlı kullanıcı bağlantısı
- Saklama sonu zamanı

Şifre, token, secret, tam portföy veya kullanıcı notu teknik olay içinde tutulmaz.

### 7.9. Destek verileri

Destek kanalı kesinleştiğinde aşağıdakiler işlenebilir:

- Kullanıcının verdiği iletişim adresi
- Destek mesajı
- İlişkili uygulama sürümü
- Kullanıcının gönüllü gönderdiği ekran görüntüsü
- Destek durumu

Destek formu V1'de gerçek veri akışı oluşturursa envanter, saklama süresi ve gizlilik metinleri güncellenmelidir.

---

## 8. V1'de toplanmayacak veriler

Altın İz V1 aşağıdaki verileri işlemek üzere tasarlanmamıştır:

```text
TC kimlik numarası
Pasaport bilgisi
Açık adres
Telefon rehberi
Kesin konum
Arka plan konumu
Mikrofon kaydı
Kamera görüntüsü
Fotoğraf galerisi
Biyometrik veri
Sağlık verisi
Banka hesap bilgisi
IBAN
Kredi kartı bilgisi
Ödeme kartı güvenlik kodu
SMS içeriği
Arama geçmişi
Reklam kimliği
Kişiler arası mesajlar
Sosyal medya bağlantıları
```

Yeni bir özellik bu verilerden birini gerektirirse kod eklenmeden önce gizlilik etki değerlendirmesi, hukuk incelemesi ve belge güncellemeleri yapılmalıdır.

---

## 9. Özel nitelikli kişisel veriler

V1 özel nitelikli kişisel veri işlemeyi amaçlamaz.

Kullanıcı serbest metin notuna hassas bilgi yazabilir. Bu riski azaltmak için:

- Not alanı isteğe bağlı tutulur.
- Kullanıcıdan sağlık, kimlik, finans hesabı veya başka kişilere ait bilgi yazmaması istenebilir.
- Notlar analitik veya hata kayıtlarına gönderilmez.
- Not içeriği yalnızca ilgili kullanıcıya gösterilir.
- Not alanı gereksiz teknik loglara yazılmaz.

---

## 10. Veri işleme amaçları

V1 için planlanan amaçlar:

1. Kullanıcı hesabı oluşturmak ve yönetmek
2. E-posta adresini doğrulamak
3. Kullanıcı oturumunu güvenli biçimde sürdürmek
4. Şifre sıfırlamak
5. Kişisel portföy kayıtlarını saklamak
6. Tahmini portföy değerini ve kâr-zararı hesaplamak
7. Kullanıcı tercihlerini saklamak
8. Yasal belgeleri sunmak ve gerekli olayları kaydetmek
9. Hesap ve veri silme talebini yürütmek
10. Güvenlik olaylarını tespit etmek ve incelemek
11. Teknik hataları gidermek
12. Kullanıcı destek taleplerini yanıtlamak
13. Uygulamanın mağaza, hukuk ve sözleşme yükümlülüklerini yerine getirmek

Veriler bu amaçlarla bağdaşmayan reklam, profil çıkarma veya veri satışı için kullanılmayacaktır.

---

## 11. Hukuki sebep çalışma alanı

Her veri işleme faaliyeti için uygulanacak hukuki sebep hukuk uzmanıyla kesinleştirilecektir.

Çalışma adayları:

```text
Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olma
Hukuki yükümlülüğün yerine getirilmesi
Bir hakkın tesisi, kullanılması veya korunması
Veri sorumlusunun meşru menfaati
Açık rıza, yalnızca gerçekten gerekli ve uygun olduğunda
```

Kurallar:

- Açık rıza varsayılan veya her işlem için genel dayanak olarak kullanılmaz.
- Aydınlatma metni onay kutusuna dönüştürülmez.
- Hizmet için zorunlu olmayan bir veri açık rızaya dayanıyorsa ret hâlinde temel hizmet gereksiz yere engellenmez.
- Açık rıza gerekli ise özgür iradeyle, belirli konuya ilişkin ve bilgilendirmeye dayalı olmalıdır.
- Rıza geri çekme yöntemi sağlanmalıdır.

---

## 12. Veri akışları

### 12.1. Hesap oluşturma

```text
Kullanıcı
  ↓ e-posta ve şifre
Mobil uygulama
  ↓
Supabase Auth
  ↓ kullanıcı kimliği ve doğrulama durumu
Mobil uygulama ve kullanıcı profil tabloları
```

Şifre normal PostgreSQL uygulama tablolarına yazılmaz.

### 12.2. Portföy kaydı

```text
Kullanıcı
  ↓ ürün, miktar, tarih, maliyet, isteğe bağlı açıklamalar
Mobil uygulama
  ↓ doğrulanmış oturum
Supabase Data API
  ↓ RLS ve veritabanı doğrulaması
portfolio_entries
```

### 12.3. Fiyat verisi

```text
Zamanlanmış güvenli sunucu işlemi
  ↓
Dış fiyat sağlayıcısı
  ↓ ortak piyasa fiyatı
Doğrulama ve ürün eşleştirme
  ↓
Supabase PostgreSQL
  ↓
Mobil uygulama
```

Mobil uygulamanın kullanıcının kişisel portföyünü dış fiyat sağlayıcısına göndermesi planlanmamaktadır.

### 12.4. Portföy hesaplama

```text
Kullanıcının portföy kayıtları
  +
Ortak güncel alış fiyatları
  ↓
Tahmini bozdurma değeri ve kâr-zarar
  ↓
Yalnızca ilgili kullanıcıya gösterim
```

### 12.5. Hesap silme

```text
Kullanıcı yeniden doğrulama
  ↓
Güvenli delete-account fonksiyonu
  ↓
Silme talebi ve durum takibi
  ↓
Portföy, tercih, profil ve Auth işlemleri
  ↓
Saklama politikasına göre yasal ve güvenlik kayıtları
```

---

## 13. Üçüncü taraf hizmet envanteri

### 13.1. Supabase

Planlanan kullanım:

- Kimlik doğrulama
- PostgreSQL veritabanı
- Data API
- Row Level Security
- Edge Functions
- Sunucu secret yönetimi

Kesinleştirilecekler:

- Production bölgesi
- Sözleşme ve veri işleme şartları
- Alt işleyenler
- Yedek konumu
- Silme ve yedeklerden çıkarma davranışı
- Yurt dışına aktarım yöntemi

### 13.2. Altın fiyat sağlayıcısı

Adaylar:

```text
AltinAPI
Altinapps
```

Planlanan kişisel veri aktarımı:

```text
Yok
```

Mobil kullanıcı kimliği, e-posta ve portföyün fiyat sağlayıcısına gönderilmemesi hedeflenmektedir. Teknik istek kayıtları veya sunucu IP bilgileri sağlayıcı tarafından işlenebileceğinden sözleşme ve gizlilik şartları incelenmelidir.

### 13.3. Production e-posta hizmeti

Henüz seçilmedi.

İşlenebilecek veri:

- E-posta adresi
- Doğrulama veya şifre sıfırlama ileti içeriği
- Gönderim durumu
- Teknik teslimat kayıtları

Hizmet seçilmeden önce veri konumu, alt işleyenler, saklama süresi ve güvenlik önlemleri değerlendirilmelidir.

### 13.4. Hata izleme

V1 için kesin karar verilmedi.

Eklenirse:

- Kullanıcı e-postasının otomatik gönderimi kapalı veya sınırlı olmalıdır.
- Şifre, token, API anahtarı ve portföy notları redakte edilmelidir.
- Ekran kaydı veya kullanıcı oturumu kaydı varsayılan olarak açılmamalıdır.
- Gizlilik metinleri ve mağaza beyanları güncellenmelidir.

### 13.5. Analitik

V1 için kesin karar verilmedi.

Eklenirse veri minimizasyonu uygulanmalı, reklam odaklı izleme veya gereksiz cihaz tanımlayıcıları kullanılmamalı ve mağaza beyanları güncellenmelidir.

### 13.6. Google Play ve App Store

Mağazalar uygulama dağıtımı, inceleme ve mağaza sayfası için kendi verilerini işler. Geliştirici tarafından doldurulan veri güvenliği ve gizlilik beyanları, uygulamanın ve entegre üçüncü taraf SDK'ların gerçek davranışıyla uyumlu olmalıdır.

---

## 14. Yurt dışına veri aktarımı

Supabase, e-posta hizmeti, hata izleme veya analitik hizmeti yurt dışında bulunabilir. Bu nedenle yurt dışına aktarım ihtimali production öncesi ayrı değerlendirilmelidir.

Kesinleştirilecekler:

1. Hangi kişisel verinin aktarıldığı
2. Hangi ülkeye veya uluslararası kuruluşa aktarıldığı
3. Aktarım alıcısının rolü
4. Aktarım amacı
5. Hukuki sebep
6. Yeterlilik kararı bulunup bulunmadığı
7. Uygun güvence yöntemi
8. Standart sözleşme veya başka belgenin gerekip gerekmediği
9. Bildirim ve kayıt yükümlülükleri
10. Alt işleyenler ve sonraki aktarımlar
11. Veri sahibinin nasıl bilgilendirileceği

Production projesi rastgele bir bölgede oluşturulmamalı ve aktarım yöntemi kesinleşmeden gerçek kullanıcı verisi işlenmemelidir.

---

## 15. Veri paylaşımı ve satış

### Planlanan veri satışı

```text
Yok
```

### Planlanan reklam amaçlı paylaşım

```text
Yok
```

### Kullanıcılar arası paylaşım

```text
Yok
```

### Zorunlu veya hizmet amaçlı alıcı grupları

Kesin hizmet seçimine bağlı olarak:

- Altyapı ve barındırma sağlayıcısı
- Kimlik doğrulama altyapısı
- E-posta gönderim hizmeti
- Yetkili hukuk ve güvenlik tarafları
- Kanunen yetkili kamu kurumları

Her alıcı yalnızca gerekli veri ve amaç kapsamında değerlendirilmelidir.

---

## 16. Veri minimizasyonu kuralları

- Hesap için telefon numarası istenmez.
- Kullanıcının gerçek adı zorunlu tutulmaz.
- TC kimlik numarası istenmez.
- Konum izni istenmez.
- Kamera ve galeri izni istenmez.
- Mikrofon izni istenmez.
- Bildirim izni V1'de istenmez.
- Reklam kimliği kullanılmaz.
- Portföy için bankacılık hesabı istenmez.
- Kullanıcının ödediği toplam tutar dışında ödeme aracı bilgisi alınmaz.
- Alış yeri ve not isteğe bağlıdır.
- Teknik loglara tam istek gövdesi yazılmaz.
- Destek için gereksiz kimlik belgesi istenmez.

---

## 17. Kullanıcı kontrolü ve hakları

Nihai metin hukuk uzmanı tarafından hazırlanmak üzere, kullanıcıya uygulanabilir olduğu ölçüde şu başvuru olanakları sağlanmalıdır:

- Kişisel verisinin işlenip işlenmediğini öğrenme
- İşlenen verilere ilişkin bilgi talep etme
- İşleme amacını ve amaca uygun kullanımı öğrenme
- Verilerin aktarıldığı taraflar hakkında bilgi talep etme
- Yanlış veya eksik verinin düzeltilmesini isteme
- Uygulanabilir şartlarla silinmesini veya yok edilmesini isteme
- Düzeltme veya silme işlemlerinin ilgili alıcılara bildirilmesini isteme
- Uygulanabilir itiraz ve zarar giderim taleplerini iletme
- Açık rıza işleme dayanağıysa rızayı geri çekme

### Uygulama içi kontroller

- Görünen adı değiştirme
- Tema tercihini değiştirme
- Portföy kaydı ekleme, düzenleme ve silme
- Hesabı ve ilişkili verileri silme sürecini başlatma
- Yasal ve gizlilik belgelerini görüntüleme

### Başvuru kanalı

Production öncesinde güvenli ve doğrulanabilir bir başvuru kanalı oluşturulmalıdır. Başvuran kişinin kimliği gereğinden fazla veri toplamadan doğrulanmalıdır.

---

## 18. Hesap ve veri silme

Altın İz hesap oluşturan kullanıcıya uygulama içinden hesap silme işlemini başlatma yolu sunacaktır.

### Silinecek veya işlenecek veri grupları

- Portföy kayıtları
- Kullanıcı tercihleri
- Profil kaydı
- Supabase Auth hesabı
- Aktif oturumlar
- Yerel kullanıcı önbelleği
- Yasal olaylar ve güvenlik kayıtları, saklama politikasına göre silinir veya anonimleştirilir

### Kurallar

- Yalnızca hesabı pasifleştirmek silme sayılmaz.
- İşlem kolay bulunabilir olmalıdır.
- Yanlışlıkla silmeyi önlemek için yeniden doğrulama ve açık onay alınabilir.
- Silme gereksiz yere zorlaştırılmaz.
- İşlem ek süre gerektiriyorsa kullanıcı bilgilendirilir.
- İşlem tamamlanmadan başarı gösterilmez.
- Saklanması gereken veri varsa türü, nedeni ve süresi kullanıcıya açıklanır.

### Web üzerinden silme talebi

Google Play yayımlama gereksinimleri için uygulama içi yola ek olarak erişilebilir bir web kaynağı veya talep yolu hazırlanması planlanmalıdır.

---

## 19. Veri saklama ve silme

Kesin süreler `DATA_RETENTION.md` içinde belirlenecektir.

Temel kurallar:

- Veri süresiz ve gerekçesiz tutulmaz.
- Hesap aktifken hizmet için gereken veriler saklanır.
- Hesap silme sonrası gerekli olmayan kişisel veriler silinir.
- Hukuki veya güvenlik amacıyla tutulacak kayıtlar sınırlandırılır.
- Saklama süresi sona erdiğinde veri silinir, yok edilir veya geri döndürülemez biçimde anonimleştirilir.
- Yedek sistemlerindeki silme gecikmesi ayrıca açıklanır.
- Silme işlemleri mümkün olduğunca otomatik ve denetlenebilir olur.

Açık sorun: Yasal olay, güvenlik olayı, hesap silme talebi ve fiyat geçmişi süreleri henüz kesinleşmemiştir.

---

## 20. Yerel cihaz verileri

### Saklanabilecekler

- Güvenli oturum verisi
- Tema tercihi için sınırlı yerel değer
- Son fiyatlar için sınırlı önbellek
- Gerekirse sürümlü yasal belge önbelleği

### Sınırlanacaklar

- Tam portföyün düz metin saklanması
- Kullanıcı notlarının gereksiz önbelleği
- Başka kullanıcının oturumundan kalan veri
- Auth token'ın birden fazla yerde kopyalanması

### Çıkışta

- Oturum temizlenir.
- Kullanıcıya ait hassas önbellek temizlenir.
- Yeni kullanıcının önceki kullanıcı verisini görmediği test edilir.

---

## 21. Loglar, hata kayıtları ve destek içerikleri

### Loglanmayacaklar

```text
Şifre
Şifre tekrarı
Erişim belirteci
Yenileme belirteci
API anahtarı
Veritabanı parolası
Tam portföy
Kullanıcı notunun tamamı
Gereksiz e-posta bilgisi
Auth callback secret değerleri
```

### Sınırlı olarak loglanabilecekler

- Güvenli hata kodu
- İşlem türü
- Hassas olmayan takip kimliği
- İşlem süresi
- Ortam adı
- Başarı veya hata durumu
- Fiyat çekmede işlenen ve reddedilen ürün sayısı

Production hata izleme hizmeti eklenmeden önce gizlilik etkisi değerlendirilmelidir.

---

## 22. Güvenlik tedbirleri özeti

- Supabase Auth
- E-posta doğrulama
- Güvenli oturum saklama
- PostgreSQL Row Level Security
- Kullanıcı sahipliği kontrolü
- En az yetki
- Secret store
- HTTPS
- Veritabanı kısıtları
- Girdi doğrulama
- İki kullanıcılı yetki testleri
- Development ve Production ayrımı
- Git secret taraması
- Hesap silmede yeniden doğrulama
- Log redaksiyonu
- Bağımlılık güvenlik incelemesi

Ayrıntılar `SECURITY.md` içinde tanımlanmıştır.

---

## 23. Google Play gizlilik hazırlığı

Google Play için:

- Data Safety formu gerçek uygulama davranışına göre doldurulmalıdır.
- Uygulama ve tüm üçüncü taraf SDK'ların topladığı ve paylaştığı veriler değerlendirilmelidir.
- Veri şifreleme ve silme uygulamaları doğru beyan edilmelidir.
- Hesap oluşturan uygulama, uygulama içinden hesap silme yolu sağlamalıdır.
- Ayrıca hesap ve ilişkili veri silme talebi için erişilebilir web kaynağı hazırlanmalıdır.
- Kapalı, açık ve production test aşamalarındaki mağaza beyanları güncel tutulmalıdır.

Tahminle veya gelecekte planlanan davranışa göre form doldurulmamalıdır.

---

## 24. App Store gizlilik hazırlığı

App Store için:

- App Store Connect'te uygulamanın ve üçüncü tarafların topladığı veri türleri doğru açıklanmalıdır.
- Verinin kullanıcıyla bağlantılı olup olmadığı doğru belirtilmelidir.
- İzleme yapılıp yapılmadığı doğru belirtilmelidir.
- App Privacy cevapları değişen veri akışlarında güncellenmelidir.
- Gizlilik politikası için herkese açık URL hazırlanmalıdır.
- Hesap oluşturan uygulamada uygulama içinden tüm hesabı silme başlatılabilmelidir.
- Yalnızca geçici devre dışı bırakma yeterli kabul edilmemelidir.

---

## 25. Çocukların gizliliği

Altın İz çocuklara özel olarak tasarlanmamıştır. Yayımlama öncesinde:

- Hedef yaş grubu belirlenmeli.
- Mağaza yaş derecelendirmesi doğru seçilmeli.
- Çocukların uygulamayı kullanma ihtimali değerlendirilmelidir.
- Gerekirse ek ebeveyn onayı ve veri minimizasyonu yükümlülükleri hukuk uzmanıyla incelenmelidir.

Çocuklara yönelik reklam veya profil çıkarma V1 kapsamında değildir.

---

## 26. Açık rıza yönetimi

V1'de genel ve toplu bir açık rıza kutusu kullanılmayacaktır.

Açık rıza gerçekten gerekirse:

- Ayrı ve belirli amaç için alınır.
- Aydınlatma metninden ayrılır.
- Önceden işaretli olmaz.
- Ret seçeneği bulunur.
- Geri çekme yöntemi sağlanır.
- Belge sürümü ve olay zamanı kaydedilir.
- Geri çekmenin gelecekteki işleme etkisi uygulanır.

Hizmet için başka geçerli hukuki sebep varken gereksiz açık rıza talep edilmez.

---

## 27. Gizlilik etki değerlendirmesi gerektiren değişiklikler

Aşağıdakilerden biri planlandığında koddan önce gizlilik değerlendirmesi yapılmalıdır:

- Yeni kişisel veri alanı
- Konum
- Kamera veya fotoğraf
- Bildirim tokenı
- Analitik SDK
- Hata izleme SDK
- Reklam SDK
- Sosyal giriş
- Google veya Apple ile giriş
- Ödeme veya abonelik
- Portföy paylaşımı
- Aile hesabı
- Veri dışa aktarma
- Yapay zekâ analizi
- Yeni ülke veya bölge
- Yeni barındırma hizmeti
- Yeni e-posta hizmeti
- Yeni destek platformu

Değerlendirme sonucu `DECISIONS.md`, `PRIVACY.md`, `SECURITY.md`, `DATA_RETENTION.md`, `TODO.md` ve `CHANGELOG.md` belgelerine yansıtılır.

---

## 28. Veri ihlali ve kullanıcı bilgilendirmesi

Bir kişisel veri ihlali şüphesinde:

1. Olay doğrulanır ve etkisi sınırlandırılır.
2. Sızan secret'lar iptal edilir.
3. Etkilenen veri ve kullanıcı grupları belirlenir.
4. Kanıtlar güvenli biçimde korunur.
5. Hukuki bildirim yükümlülükleri ve süreleri uzmanla değerlendirilir.
6. Gerekli kurum ve kullanıcı bildirimleri doğrulanmış bilgiyle yapılır.
7. Kök neden ve tekrar önleme çalışması tamamlanır.
8. `SECURITY.md`, `KNOWN_ISSUES.md` ve `CHANGELOG.md` uygun gizlilik seviyesinde güncellenir.

Hassas saldırı ayrıntıları herkese açık belgelerde gereksiz biçimde yayımlanmaz.

---

## 29. Production öncesi gizlilik kontrol listesi

- [ ] Veri sorumlusu bilgileri kesinleşti.
- [ ] KVKK başvuru kanalı hazırlandı.
- [ ] VERBİS yükümlülüğü değerlendirildi.
- [ ] Bütün kişisel veri alanları doğrulandı.
- [ ] Her veri için amaç belirlendi.
- [ ] Her veri için hukuki sebep uzman tarafından doğrulandı.
- [ ] Saklama süreleri belirlendi.
- [ ] Supabase bölgesi kesinleşti.
- [ ] Yurt dışına aktarım yöntemi kesinleşti.
- [ ] Bütün veri işleyenler ve alt işleyenler listelendi.
- [ ] E-posta hizmeti kesinleşti.
- [ ] Hata izleme kullanımı kesinleşti.
- [ ] Analitik kullanımı kesinleşti.
- [ ] Gereksiz veri ve izinler kaldırıldı.
- [ ] Hesap silme uygulama içinde çalışıyor.
- [ ] Hesap silme web kaynağı hazır.
- [ ] Yedeklerden silme davranışı açıklandı.
- [ ] KVKK Aydınlatma Metni hukuk uzmanı tarafından kontrol edildi.
- [ ] Gizlilik Politikası hukuk uzmanı tarafından kontrol edildi.
- [ ] Gerekli açık rıza süreçleri ayrı tasarlandı.
- [ ] Google Play Data Safety formu gerçek davranışla uyumlu.
- [ ] App Store App Privacy beyanı gerçek davranışla uyumlu.
- [ ] Gizlilik politikası URL'si çalışıyor.
- [ ] Destek ve başvuru kanalı çalışıyor.
- [ ] Android ve iOS'ta silme ve gizlilik ekranları test edildi.

---

## 30. Açık gizlilik konuları

1. Veri sorumlusunun kesin kimliği ve iletişim bilgileri
2. VERBİS kayıt veya istisna durumu
3. Supabase production bölgesi
4. Yurt dışına aktarım yöntemi
5. Supabase alt işleyenleri ve yedek konumu
6. Production e-posta hizmeti
7. Hata izleme kullanımı
8. Analitik kullanımı
9. Yasal olayların saklama süresi
10. Güvenlik olaylarının saklama süresi
11. Hesap silme talebi kayıtlarının saklama süresi
12. Yedeklerden silme süresi
13. Destek kayıtlarının saklama süresi
14. Çocuklara ilişkin yaş yaklaşımı
15. Nihai KVKK Aydınlatma Metni
16. Nihai Gizlilik Politikası
17. Gerekirse Açık Rıza Metni
18. Veri sahibi başvuru yöntemi
19. Google Play Data Safety cevapları
20. App Store App Privacy cevapları

Bu konular hukuk, teknik yapı ve gerçek üçüncü taraf sözleşmeleri incelenmeden kesin kabul edilmemelidir.

---

## 31. İlgili bilinen sorunlar

```text
KI-001 → Supabase production bölgesi
KI-002 → Yurt dışına veri aktarımı
KI-003 → Fiyat sağlayıcısı ticari kullanım hakkı
KI-017 → Production e-posta hizmeti
KI-018 → Hesap silme kısmi hata telafisi
KI-019 → Saklama süreleri
KI-025 → Hukuk uzmanı onaylı metinler
KI-026 → Google Play ve App Store gizlilik beyanları
```

Ayrıntılar `KNOWN_ISSUES.md` içinde tutulur.

---

## 32. Resmî ve güncel başvuru kaynakları

Bu çalışma taslağı hazırlanırken başvurulan resmî kaynaklar:

- Kişisel Verileri Koruma Kurumu, Kişisel Verilerin Yurt Dışına Aktarılması Rehberi: https://www.kvkk.gov.tr/Icerik/8143/Kisisel-Verilerin-Yurt-Disina-Aktarilmasi-Rehberi
- Kişisel Verileri Koruma Kurumu, Yurt Dışına Aktarım: https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim
- Google Play Console Help, Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play Console Help, Account Deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Apple Developer, App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Apple Developer, Offering Account Deletion in Your App: https://developer.apple.com/support/offering-account-deletion-in-your-app

Bu kaynaklar ve mevzuat zamanla değişebilir. Production öncesinde güncel sürümleri yeniden kontrol edilmelidir.

---

## 33. İlgili proje belgeleri

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
docs/SECURITY.md
docs/DATA_RETENTION.md
.github/copilot-instructions.md
```

Yeni kişisel veri veya üçüncü taraf hizmet eklendiğinde en az şu belgeler birlikte incelenir:

```text
PRIVACY.md
SECURITY.md
DATA_RETENTION.md
DATABASE.md
API.md
DECISIONS.md
TODO.md
CHANGELOG.md
```

---

## 34. Belge güncelleme kuralları

Bu belge aşağıdaki durumlarda güncellenmelidir:

- Yeni kişisel veri toplanırsa
- Mevcut veri alanı kaldırılırsa
- İşleme amacı değişirse
- Yeni üçüncü taraf hizmet eklenirse
- Supabase bölgesi veya sağlayıcısı değişirse
- Yurt dışına aktarım yöntemi kesinleşirse
- Saklama süreleri değişirse
- Hesap silme davranışı değişirse
- Hata izleme veya analitik eklenirse
- Google Play veya App Store beyanı değişirse
- Veri sorumlusu veya iletişim bilgileri değişirse
- Hukuk uzmanı geri bildirimi alınırsa
- Güvenlik ihlali yaşanırsa

Değişiklik ayrıca `CHANGELOG.md` içine kaydedilmeli, karar değişiyorsa `DECISIONS.md` güncellenmelidir.

---

## 35. Sürüm geçmişi

### 1.0 Taslak - 03.09.2026

- Gizlilik kapsamı ve temel ilkeler tanımlandı.
- Veri konusu kişi grupları eklendi.
- Veri sorumlusu için tamamlanacak alanlar oluşturuldu.
- Hesap, profil, tercih, portföy, yasal olay, silme ve güvenlik verileri envantere eklendi.
- V1'de toplanmayacak veriler açıkça listelendi.
- Veri işleme amaçları ve hukuki sebep çalışma alanı oluşturuldu.
- Temel veri akışları belgelendi.
- Üçüncü taraf hizmet envanteri oluşturuldu.
- Yurt dışına aktarım değerlendirme maddeleri eklendi.
- Kullanıcı hakları ve uygulama içi kontroller tanımlandı.
- Hesap silme ve saklama ilkeleri eklendi.
- Google Play ve App Store gizlilik hazırlıkları eklendi.
- Production öncesi gizlilik kontrol listesi oluşturuldu.
- Açık gizlilik konuları ve resmî başvuru kaynakları eklendi.
