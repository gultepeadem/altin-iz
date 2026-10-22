# Altın İz Çalışma Devri

**Belge adı:** `HANDOFF.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.43 Taslak  
**Son güncelleme:** 22.10.2026  
**Proje aşaması:** Bölüm 18: Hesap ve veri silme - Faz 12 (Hesap silme teknik tasarımı) TAMAMLANDI - Faz 12.1 (delete-account Edge Function) sıradaki  
**Kodlama durumu:** accountDeletion.ts modelleri, ADR-033 kararı, DATA_RETENTION.md güncellemeleri ve KI-018 çözümü hazırlandı; 10/10 test başarılı  
**Son çalışma durumu:** Faz 12 başarıyla tamamlandı; hesap silme teknik tasarımı (yeniden kimlik doğrulama, silme sırası, fiziksel silinen ve anonimleşen tablolar, kısmi hata telafisi KI-018 ve PII-free kayıt sözleşmesi) kesinleştirildi. Sıradaki görev Bölüm 18: Hesap ve veri silme - Faz 12.1 (delete-account Edge Function)

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
22.10.2026
```

### Oturumun ana amacı

```text
Bölüm 17 (Yasal belgeler ve gizlilik) kapsamında Faz 11 Yasal belge altyapısını; src/models/legal.ts ve src/services/legalService.ts oluşturarak 6 yasal belge türünü (KVKK, Gizlilik, Şartlar, Saklama/Silme, Finansal Uyarı, Açık Rıza), content_hash (SHA-256) üretimini, tek aktif sürüm kuralını ve Supabase RPC yasal olay kaydı altyapısını kurmak
```

### Bu oturumda tamamlanan son iş

```text
Faz 11 tamamlandı: legal.ts modelleri, 6 şablon metin (KI-025), content_hash üretimi, legalService.ts ve canlı Supabase legal_documents sorgusu kodlandı; 10/10 otomatik test ile doğrulandı
```

### Projenin mevcut aşaması

```text
Bölüm 17 - Yasal belgeler ve gizlilik (Faz 11.1: Yasal belge ekranları sıradaki)
```

### Uygulama kodu durumu

```text
Varsayılan Expo Router TypeScript proje iskeleti hazırlandı ve derleme doğrulandı.
```

### Çalışan uygulama durumu

```text
Expo Metro Bundler başarıyla başlatıldı ve doğrulandı.
```

### Gerçek kullanıcı durumu

```text
Gerçek kullanıcı hesabı veya gerçek kullanıcı verisi yok.
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
- `TODO.md`, `CHANGELOG.md`, `KNOWN_ISSUES.md` ve `PROJECT_CONTEXT.md` içindeki sürüm numaraları ve denetim kayıtları eşitlendi.
- Uygulama kodu, Expo projesi, Supabase projesi ve Git deposu henüz oluşturulmadı.

---

## 11. Git ve kaynak kod durumu

### Proje klasörü

```text
C:\Users\Adem\Desktop\altin-iz
```

### Git deposu

```text
Başlatıldı (Yerel git deposu, main dalı)
```

### GitHub deposu

```text
Henüz bağlanmadı (Kullanıcı tarafından GitHub'da private altin-iz deposu oluşturulması bekleniyor)
```

### Son commit

```text
65ae722 (feat(client): setup Supabase JS client, environment validation, and AsyncStorage session adapter (Faz 5))
```

### Son çalışan commit

```text
65ae722
```

### Aktif dal

```text
main
```

### Migration durumu

```text
6 adet SQL migration dosyası hazırlandı ve development veritabanında çalıştırıldı (12 tablo, tetikleyiciler, indeksler, RLS politikaları).
```

Gerçek olmayan commit, dal veya migration adı uydurulmamalıdır.

---

## 12. Kurulum ve hesap durumu

```text
Visual Studio Code: Kurulu (1.142.0)
Node.js: Kurulu (v24.18.0)
npm: Kurulu (11.16.0)
Git: Kurulu (2.55.0)
Git kullanıcı: Adem Gultepe <gultepeeadem02@gmail.com>
GitHub hesabı: Var
Expo hesabı: Var
Supabase hesabı: Var
Android test cihazı: Xiaomi Redmi Note 8 Pro (MIUI Global 12.5.8)
iOS test cihazı: Şu anda yok
AltinAPI hesabı: Oluşturulmadı
Altinapps hesabı: Oluşturulmadı
Google Play geliştirici hesabı: Kontrol edilmedi
Apple Developer hesabı: Kontrol edilmedi
```

Bilgisayarda hangi araçların zaten kurulu olduğu varsayılmamalıdır.

---

## 13. Test durumu

### Birim testleri

```text
Çalıştırılmadı. Uygulama kodu yok.
```

### Entegrasyon testleri

```text
Çalıştırılmadı. Supabase projesi ve uygulama kodu yok.
```

### RLS güvenlik testleri

```text
Çalıştırılmadı. Migration ve politika kodu yok.
```

### Android testi

```text
Başlamadı. Expo projesi ve test cihazı bağlantısı doğrulanmadı.
```

### iOS testi

```text
Başlamadı. Gerçek test yöntemi henüz belirlenmedi.
```

### Belge doğrulaması

```text
Dosyaların oluşturulması ve temel bütünlüğü kontrol edildi.
Dört aşamalı belge çapraz denetiminde tespit edilen şema, RLS, API akışı, sürüm zinciri, görev sırası ve Markdown biçim sorunları düzeltildi. Uygulama kodu olmadığı için teknik çalıştırma testi yapılmadı.
```

---

## 14. Açık Critical sorunlar

Aşağıdaki sorunlar production yayımdan önce mutlaka çözülmelidir:

```text
KI-002 → Yurt dışına kişisel veri aktarım yöntemi
KI-003 → Fiyat sağlayıcısı ticari kullanım hakkı
KI-018 → Hesap silme kısmi hata telafisi
KI-019 → Yasal ve güvenlik kayıtlarının saklama süreleri
KI-025 → Hukuk uzmanı tarafından doğrulanmış yasal metinler
```

Ayrıntılar `KNOWN_ISSUES.md` içinde bulunur.

---

## 15. Önemli High sorunlar

```text
KI-001 → Supabase production bölgesi
KI-004 → Gerçek fiyat sembol listesi
KI-005 → Cumhuriyet ve Ata ürün eşleştirmesi
KI-010 → Fiyatın eski sayılacağı süre
KI-011 → Olağan dışı fiyat doğrulama eşiği
KI-013 → JavaScript sayısal hassasiyet yöntemi
KI-014 → Mobil Supabase oturum saklama yöntemi
KI-015 → Auth derin bağlantıları
KI-017 → Production e-posta hizmeti
KI-020 → Development, Preview ve Production ortam ayrımı
KI-021 → Expo projesi ve gerçek paket sürümleri
KI-022 → iOS test yöntemi
KI-026 → Google Play ve App Store gizlilik beyanları
KI-030 → Git deposu ve geri dönüş noktaları
```

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
Faz 8: Portföy servisi
```

Bu görevde `src/services/portfolioService.ts` servisi kodlanacak; kullanıcının portföy kayıtlarını listeleme, tek kayıt detayı getirme, yeni kayıt oluşturma, kayıt güncelleme, kayıt silme, sıralama, RLS ile kullanıcı kimliğini oturumdan alma ve hata normalizasyonu fonksiyonları geliştirilecektir.

---

## 20. Sıradaki görev için tamamlanma şartı

Faz 8 şu koşullarda tamamlanmış sayılır:

- `src/services/portfolioService.ts` modülü mimari standartlara uygun kodlanmalı.
- Kullanıcı kimliği serbest formdan değil `authService.getCurrentUser()` veya RLS oturumundan alınmalı.
- Miktar pozitif, maliyet pozitif ve alış tarihi gelecekte olmamalı.
- Fiyatı olmayan kayıtların listelemede kaybolmadığı doğrulanmalı.
- CRUD işlemleri ve RLS güvenlik testleri %100 başarıyla geçmeli.
- `docs/TODO.md` içindeki Faz 8 maddeleri güncellenmeli.

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

Şu anda bu klasör yapısı gerçek proje içinde oluşturulmamıştır.

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
Aşama: Proje iskeleti (Faz 2)
Kod: Expo Router TypeScript iskeleti oluşturuldu
Expo projesi: Oluşturuldu (Expo SDK 58.0.16, TypeScript 6.0.3, React Native 0.88.0)
Supabase projesi: Henüz yok
Git deposu: Başlatıldı (İlk commit: 07c2c17, main dalı)
Gerçek API hesabı: Henüz yok
Gerçek kullanıcı verisi: Yok
Hazırlanan başlangıç belgesi sayısı: 14
Geliştirme ortamı (Bölüm 7): TAMAMLANDI
Proje iskeleti (Faz 2): TAMAMLANDI (tsc ve lint 0 hata, Metro bundler doğrulandı)
Git deposu (Faz 2.1): TAMAMLANDI (Commit 07c2c17, KI-030 çözüldü)
Sıradaki görev: Faz 2.2 — Proje belgelerini gerçek klasör yapısıyla doğrulama
```

En büyük production engelleri KVKK aktarım yöntemi, fiyat lisansı, veri saklama süreleri, hesap silme telafisi ve hukuk uzmanı onaylı yasal metinlerdir.

---

## 27. Sürüm geçmişi

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
