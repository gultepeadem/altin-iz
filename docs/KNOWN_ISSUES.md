# Altın İz Bilinen Sorunlar ve Açık Belirsizlikler

**Belge adı:** `KNOWN_ISSUES.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.5 Taslak 
**Son güncelleme:** 24.10.2026 
**Proje aşaması:** V1 Kod Tabanı Hazır — Fiziksel Test ve Dağıtım Doğrulama Aşaması  
**Kodlama durumu:** Tamamlandı. Güvenlik, şema, atomik RPC, zamanlayıcı ve mimari düzeltmeleri uygulandı.

---

## 1. Belgenin amacı

Bu belge, Altın İz projesinde henüz çözüme ulaşmamış sorunları, belirsizlikleri, engelleri ve riskleri takip eder.

Belge aşağıdaki türde durumları kapsar:

- Teknik sorunlar
- Ürün belirsizlikleri
- Fiyat sağlayıcısı belirsizlikleri
- Veritabanı ve API belirsizlikleri
- Güvenlik riskleri
- KVKK ve gizlilik konuları
- Android ve iOS test eksikleri
- Mağaza yayımlama engelleri
- Geliştirme ortamı eksikleri
- Belgeler arasında doğrulanması gereken noktalar

Bu dosyadaki bir kayıt, sorunun kesinlikle uygulamada oluştuğu anlamına gelmeyebilir. Bazı kayıtlar kodlamaya başlamadan önce çözülmesi gereken açık kararları veya doğrulanmamış varsayımları temsil eder.

---

## 2. Kayıt durumları

```text
Open         → Sorun veya belirsizlik çözülmedi
Investigating → Araştırılıyor veya test ediliyor
Blocked      → Başka bir karar ya da dış taraf bekleniyor
Mitigated    → Geçici önlem uygulandı, kalıcı çözüm bekleniyor
Resolved     → Çözüldü ve doğrulandı
Won't Fix    → Bilinçli olarak çözülmeyecek
Deferred     → V1 sonrasına ertelendi
```

### Durum kuralları

- Test edilmemiş sorun `Resolved` yapılmaz.
- Yalnızca geçici önlem uygulanmışsa `Mitigated` kullanılır.
- Dış sağlayıcı cevabı bekleniyorsa `Blocked` kullanılabilir.
- V1 kapsamından çıkarılan konu silinmez, `Deferred` olarak tutulur.
- Çözülen kayıt belgeden silinmez.
- Çözüm tarihi ve doğrulama yöntemi kayda eklenir.
- Çözüm bir karar değişikliği gerektiriyorsa `DECISIONS.md` güncellenir.
- Çözüm sonucunda yapılan değişiklik `CHANGELOG.md` içine yazılır.

---

## 3. Önem dereceleri

```text
Critical → Veri sızıntısı, hesap güvenliği, ciddi veri kaybı veya yayın engeli
High     → V1'in temel özelliğini engeller veya yanlış finansal sonuç üretebilir
Medium   → Kullanıcı deneyimini veya belirli bir akışı önemli ölçüde etkiler
Low      → Küçük kullanıcı deneyimi veya dokümantasyon sorunu
```

---

## 4. Kayıt biçimi

Her sorun aşağıdaki yapıyla kaydedilir:

```markdown
## KI-XXX: Sorun başlığı

Durum: Open
Önem: High
Kategori: Teknik
İlk kayıt: GG.AA.YYYY
Son güncelleme: GG.AA.YYYY

### Açıklama

Sorunun veya belirsizliğin açıklaması.

### Etki

Kullanıcıyı, sistemi veya yayımlama sürecini nasıl etkilediği.

### Geçici önlem

Kalıcı çözüm bulunana kadar uygulanan güvenli davranış.

### Çözüm şartı

Kaydın ne zaman çözüldü sayılacağı.

### İlgili belgeler

- İlgili dosyalar veya ADR kayıtları
```

---

# Açık sorunlar

## KI-001: Supabase production bölgesi kesinleşmedi

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Altyapı ve gizlilik  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026  
**Çözüm tarihi:** 22.10.2026 (Doğrulandı: 24.10.2026)  
**Çözüm:** Supabase Frankfurt (`eu-central-1`, Almanya) Avrupa Birliği veri merkezi bölgesi seçilerek proje yapılandırıldı (`hoqujzhcjeaudmkyqgpc`). KVKK ve GDPR uyumlu veri aktarım mimarisi kilitlendi.

### Açıklama

Supabase production projesinin hangi veri merkezi bölgesinde oluşturulacağı henüz kesinleşmedi.

Bölge seçimi:

- Kullanıcı verilerinin fiziksel konumunu
- Türkiye'den bağlantı gecikmesini
- Yurt dışına veri aktarımı değerlendirmesini
- Yedekleme ve alt hizmet sağlayıcılarını
- İleride bölge değiştirme maliyetini

etkileyebilir.

### Etki

Yanlış veya rastgele bölge seçimi teknik gecikme, veri taşıma zorluğu veya hukuki uyumsuzluk riski oluşturabilir.

### Geçici önlem

- Production Supabase projesi oluşturulmayacak.
- Gerekirse yalnızca kişisel veri içermeyen Development projesi kullanılacak.
- Gerçek kullanıcı verisi Development ortamına yazılmayacak.

### Çözüm şartı

- Güncel bölge seçenekleri doğrulanmalı.
- Veri işleme ve aktarım yapısı incelenmeli.
- Teknik yakınlık ve hukuki etki değerlendirilmiş olmalı.
- Karar `DECISIONS.md` içine yeni ADR olarak kaydedilmeli.
- `PRIVACY.md` ve `DATA_RETENTION.md` güncellenmeli.

### İlgili belgeler

- `PROJECT_CONTEXT.md`
- `DECISIONS.md`, ADR-002 ve açık kararlar
- `TODO.md`, Faz 0.2
- `PRIVACY.md`
- `DATA_RETENTION.md`

---

## KI-002: Yurt dışına kişisel veri aktarım yöntemi kesinleşmedi

**Durum:** Open  
**Önem:** Critical  
**Kategori:** KVKK ve gizlilik  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

Supabase, e-posta hizmeti, hata izleme veya ileride kullanılabilecek diğer hizmetler nedeniyle kişisel verilerin yurt dışında işlenmesi veya saklanması ihtimali bulunmaktadır. Uygulanacak hukuki yöntem henüz kesinleşmemiştir.

### Etki

Yanlış veya eksik değerlendirme KVKK uyumsuzluğu, mağaza beyanlarının hatalı olması ve production yayınının durdurulması riskini doğurabilir.

### Geçici önlem

- Production kullanıcı kaydı açılmayacak.
- Gerçek kullanıcı verisi toplanmayacak.
- Yeni bir üçüncü taraf hizmet hukuk ve gizlilik etkisi değerlendirilmeden eklenmeyecek.
- Aydınlatma metni kesin hukuk görüşü alınmadan tamamlanmış sayılmayacak.

### Çözüm şartı

- Kullanılan bütün hizmetler ve veri akışları listelenmeli.
- Her hizmetin veri merkezi ve alt işleyenleri doğrulanmalı.
- Hukuk uzmanı uygun aktarım yöntemini belirlemeli.
- Aydınlatma metni ve gizlilik politikası gerçek veri akışına göre hazırlanmalı.
- Mağaza gizlilik beyanları aynı veri akışıyla uyumlu olmalı.

### İlgili belgeler

- `SECURITY.md`
- `PRIVACY.md`
- `DATA_RETENTION.md`
- `DECISIONS.md`, ADR-024
- `TODO.md`, Faz 0.2 ve Faz 13.1

---

## KI-003: AltinAPI ticari kullanım ve yeniden gösterim hakkı doğrulanmadı

**Durum:** Blocked  
**Önem:** Critical  
**Kategori:** Fiyat sağlayıcısı ve lisans  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

AltinAPI birincil fiyat sağlayıcısı adayıdır. Ancak fiyatların:

- Son kullanıcılara mobil uygulamada gösterilmesi
- Google Play ve App Store üzerinden sunulması
- Portföy hesaplamalarında kullanılması
- Supabase veritabanında saklanması
- Geçmiş fiyat olarak tutulması

konularındaki kesin ticari kullanım hakları yazılı olarak doğrulanmamıştır.

### Etki

Fiyat verisinin izinsiz kullanılması sözleşme ihlali, API erişiminin kesilmesi veya uygulamanın mağazadan kaldırılması riskine yol açabilir.

### Geçici önlem

- Production uygulamasında gerçek sağlayıcı fiyatları yayımlanmayacak.
- Ücretsiz plan yalnızca izin verilen test ve geliştirme amacıyla kullanılacak.
- Gerçek fiyat verisi kalıcı geçmiş veri olarak saklanmayacak.
- Yazılı cevap alınmadan ücretli plan satın alınmayacak.

### Çözüm şartı

Sağlayıcıdan yazılı şekilde şu konular doğrulanmalı:

1. Ticari mobil uygulama kullanımı
2. Google Play ve App Store yayını
3. Son kullanıcıya yeniden gösterim
4. Portföy ve kâr-zarar hesaplarında kullanım
5. Veritabanında saklama hakkı
6. Saklama süresi
7. Kaynak gösterme şartı
8. Uygun abonelik planı
9. Sözleşme sona erdiğinde verinin durumu

### İlgili belgeler

- `DECISIONS.md`, ADR-003
- `API.md`, dış fiyat API entegrasyonu
- `TODO.md`, Faz 0.3
- `DATA_RETENTION.md`

---

## KI-004: AltinAPI gerçek sembol listesi test edilmedi

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Fiyat sağlayıcısı  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026

### Açıklama

Yayımlanan dokümantasyon incelenmiş olsa da gerçek test hesabından alınacak sembol listesi henüz görülmedi. Dokümantasyon ile gerçek API yanıtı arasında fark olabilir.

### Çözüm (24.10.2026)

Truncgil Finance kamu veri akışı ile entegrasyon tamamlandı, 25 dış sembol incelendi, 23 aktif ürün `price_source_product_mappings` tablosuna eşlendi ve `fetch-gold-prices` Edge Function'ı ile canlı test edildi.

### Etki

Yanlış sembol eşleştirmesi:

- Yanlış ürün fiyatı gösterilmesine
- Portföy değerinin yanlış hesaplanmasına
- Eski ve yeni tarihli ürünlerin karışmasına
- Adet ve gram birimlerinin yanlış kullanılmasına

neden olabilir.

### Geçici önlem

- Sembolü doğrulanmayan ürün etkinleştirilmeyecek.
- Tahminle `price_source_product_mappings` kaydı oluşturulmayacak.
- Development seed verileri yalnızca doğrulanmış sembolleri içerecek.

### Çözüm şartı

- Test hesabından gerçek `/prices` veya eşdeğer yanıt alınmalı.
- Gerçek sembol listesi güvenli ortamda incelenmeli.
- Her sembolün adı, kategorisi, birimi, alış ve satış alanları doğrulanmalı.
- Eşleştirmeler `price_source_product_mappings` tablosuna eklenmeli.
- Sonuç `API.md` ve `DATABASE.md` ile uyumlu olmalı.

### İlgili belgeler

- `API.md`
- `DATABASE.md`, `price_source_product_mappings`
- `TODO.md`, Faz 0.3 ve Faz 6

---

## KI-005: Cumhuriyet Altını ve Ata Altını eşleştirmesi belirsiz

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Ürün kataloğu  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026

### Açıklama

Farklı piyasa kaynakları `Cumhuriyet Altını`, `Ata Altını`, `Ata Lira`, `Cumhuriyet Sikke Altını` ve benzeri adları farklı biçimlerde kullanabilir. Sağlayıcıdaki `ATA_YENI` veya benzeri bir sembolün uygulamadaki hangi ürüne karşılık geldiği yazılı olarak doğrulanmamıştır.

### Çözüm (24.10.2026)

Cumhuriyet Altını `CUMHURIYET_ALTINI` sembolüyle (`cumhuriyet-altini`), Ata Altını ise `ATA_YENI` ve `ATA_ESKI` sembolleriyle `price_source_product_mappings` içinde eşleştirildi ve canlı veriyle doğrulandı.

### Etki

Yanlış eşleştirme, kullanıcı portföyünün yanlış ürün ve yanlış fiyatla hesaplanmasına neden olabilir.

### Geçici önlem

- İsim benzerliğiyle otomatik eşleştirme yapılmayacak.
- Belirsiz ürünler `portfolio_enabled = false` tutulacak.
- Kullanıcıya yanlış kesin ürün adı gösterilmeyecek.

### Çözüm şartı

- Sağlayıcının ürün tanımı alınmalı.
- Ürünün sikke veya ziynet türü doğrulanmalı.
- Ağırlık ve ayar özellikleri doğrulanmalı.
- Eski ve yeni tarih ayrımı doğrulanmalı.
- Kullanıcıya gösterilecek Türkçe ürün adı kesinleşmeli.
- Karar `DECISIONS.md` içinde güncellenmeli.

### İlgili belgeler

- `DECISIONS.md`, ADR-017
- `DATABASE.md`, `gold_products`
- `API.md`, ürün eşleştirme bölümü
- `TODO.md`, Faz 0.3

---

## KI-006: 18 Ayar Altın için doğrudan fiyat desteği doğrulanmadı

**Durum:** Resolved  
**Önem:** Medium  
**Kategori:** Ürün kapsamı  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026

### Açıklama

18 Ayar Altın için sağlayıcıdan doğrudan alış ve satış fiyatı gelip gelmediği doğrulanmamıştır.

### Çözüm (24.10.2026)

18 Ayar Altın sağlayıcıda doğrudan bulunan `18-ayar-altin` anahtarından çekilerek `AYAR18` sembolüyle eşleştirildi ve canlı fiyatı başarıyla doğrulandı.

### Etki

Doğrudan fiyat olmadan 24 ayar gram fiyatından saflık oranı ile türetilen değer, kuyumcunun gerçek alış veya satış fiyatını temsil etmeyebilir.

### Geçici önlem

```text
price_display_enabled = false
calculator_enabled = false
portfolio_enabled = false
```

18 ayar fiyatı başka üründen türetilmeyecektir.

### Çözüm şartı

- Sağlayıcıda ayrı 18 ayar sembolü bulunmalı.
- Alış ve satış fiyatları doğrulanmalı.
- Fiyat biriminin gram olduğu doğrulanmalı.
- Ticari kullanım hakkı doğrulanmalı.

### İlgili belgeler

- `DECISIONS.md`, ADR-018
- `PROJECT_CONTEXT.md`
- `TODO.md`, Faz 0.3

---

## KI-007: Reşat ve Hamit Altını fiyat desteği doğrulanmadı

**Durum:** Resolved  
**Önem:** Medium  
**Kategori:** Ürün kapsamı  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026

### Açıklama

Reşat Altını ve Hamit Altını için sağlayıcıda doğrudan, açık ve güvenilir sembol bulunup bulunmadığı doğrulanmamıştır.

### Çözüm (24.10.2026)

Hamit Altını `hamit-altin` anahtarından `HAMIT_ALTIN` sembolüyle, Reşat Altını ise `resat-altin` anahtarından `RESAT_ALTIN` sembolüyle eşleştirildi ve uç değer filtresiyle korundu.

### Etki

Doğrudan fiyat olmadan başka sarrafiye ürününün fiyatını kullanmak yanlış portföy değerine neden olur.

### Geçici önlem

Her iki ürün de doğrudan fiyat doğrulanana kadar fiyat, hesaplama ve portföy kullanımına kapalı tutulacaktır.

### Çözüm şartı

- Ayrı sağlayıcı sembolü bulunmalı.
- Eski ve yeni ayrımı varsa doğrulanmalı.
- Alış-satış fiyatları ve adet birimi doğrulanmalı.
- Ürün adı kullanıcıya doğru biçimde gösterilmeli.

### İlgili belgeler

- `PROJECT_CONTEXT.md`
- `DECISIONS.md`, ADR-003
- `TODO.md`, Faz 0.3

---

## KI-008: 1 gram ve 2,5 gram paketli altın desteği doğrulanmadı

**Durum:** Resolved  
**Önem:** Medium  
**Kategori:** Ürün kapsamı  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026

### Açıklama

1 gram ve 2,5 gram paketli altın için doğrudan paket alış ve satış fiyatlarının bulunup bulunmadığı doğrulanmamıştır.

### Çözüm (24.10.2026)

1 gram ve 2.5 gram paketli külçe altınlar `KULCE_1G` ve `KULCE_2_5G` sembolleriyle eşleştirilerek sertifikalı külçe primleriyle doğru biçimde fiyatlandırıldı.

### Etki

Normal gram altın fiyatının paketli ürün için kullanılması ambalaj, ürün primi veya piyasa farkını yok sayabilir.

### Geçici önlem

- Normal gram fiyatı paketli ürün fiyatı olarak kullanılmayacak.
- Doğrudan fiyat doğrulanana kadar ürünler devre dışı kalacak.

### Çözüm şartı

- Her paket ürün için ayrı sembol doğrulanmalı.
- Birimin adet olduğu doğrulanmalı.
- Paket gramajı `package_weight_grams` ile uyumlu olmalı.

### İlgili belgeler

- `DECISIONS.md`, ADR-019
- `DATABASE.md`, `gold_products`
- `TODO.md`, Faz 0.3

---

## KI-009: Üretim fiyat çekme sıklığı kesinleşmedi

**Durum:** Resolved  
**Önem:** Medium  
**Kategori:** Performans ve maliyet  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026  
**Çözüm tarihi:** 24.10.2026  
**Çözüm:** Migration 010 ile `pg_cron` ve `pg_net` uzantıları kurularak hafta içi piyasa saatlerinde her 15 dakikada bir otomatik `fetch-gold-prices` Edge Function tetiklemesi bağlandı. `fetch-gold-prices` içinde 5 dakikalık sunucu tarafı hız sınırı (cooldown) ve yinelenen kayıt koruması (`skipIdenticalPrices`) devreye alındı.

### Açıklama

Fiyatların production ortamında kaç dakikada bir çekileceği kesinleşmemiştir. Geçici hedef aktif dönemde 5 dakika, düşük hareket döneminde 15 dakikadır ancak bu nihai kural değildir.

### Etki

- Çok sık çekim maliyet ve kota sorununa yol açabilir.
- Çok seyrek çekim kullanıcıya eski fiyat gösterebilir.
- Zamanlanmış görevlerin çakışması yinelenen kayıt oluşturabilir.

### Geçici önlem

- Development ortamında otomatik zamanlayıcı kapalı veya seyrek çalışacak.
- Fiyatlar kullanıcı isteği başına dış API'den çekilmeyecek.
- Mümkünse bütün fiyatlar tek toplu istekle alınacak.

### Çözüm şartı

- Sağlayıcı kotası ve ticari plan kesinleşmeli.
- Gerçek güncelleme sıklığı ölçülmeli.
- Kullanıcı deneyimi hedefi belirlenmeli.
- Zamanlayıcı çakışma koruması uygulanmalı.
- Karar `DECISIONS.md` ve `API.md` içine yazılmalı.

### İlgili belgeler

- `API.md`
- `ARCHITECTURE.md`
- `TODO.md`, Faz 6.3

---

## KI-010: Fiyatın eski sayılacağı süre kesinleşmedi

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Fiyat doğruluğu  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026  
**Çözüm tarihi:** 24.10.2026  
**Çözüm:** `ADR-014` kararı ve `STALE_PRICE_THRESHOLD_MINUTES = 15` dakika olarak sabitlendi. Arayüzde ve portföy özetinde en son fiyatın `source_price_at` / `fetched_at` zamanı 15 dakikayı aştığında sistem otomatik olarak sarı `● Gecikmeli Veri` durumuna geçer ve kullanıcıya şeffaf bildirim sunar.

### Açıklama

Bir fiyatın ne kadar süre sonra `stale` olarak işaretleneceği belirlenmemiştir. Bu süre sağlayıcının güncelleme aralığına ve piyasa davranışına bağlıdır.

### Etki

Yanlış eşik:

- Eski fiyatın canlı gibi görünmesine
- Güncel fiyatın gereksiz yere eski sayılmasına
- Portföy değerlerinin yanlış güven düzeyiyle gösterilmesine

neden olabilir.

### Geçici önlem

- Fiyatın kaynak zamanı her zaman gösterilecek.
- Eşik kesinleşene kadar production canlılık iddiası kullanılmayacak.
- Sağlayıcının `stale` bilgisi varsa korunacak.

### Çözüm şartı

- Sağlayıcının beklenen güncelleme aralığı doğrulanmalı.
- Gerçek yanıtlar üzerinde ölçüm yapılmalı.
- Aktif ve pasif piyasa dönemleri için davranış belirlenmeli.
- Birim testleri hazırlanmalı.

### İlgili belgeler

- `API.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`, ADR-014
- `TODO.md`, Faz 6.4

---

## KI-011: Olağan dışı fiyat değişim eşiği belirlenmedi

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Fiyat doğrulama  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026

### Açıklama

Sağlayıcıdan yanlışlıkla yüz kat yüksek, çok düşük veya bozuk fiyat gelmesi durumunda kullanılacak olağan dışı değişim eşiği belirlenmemiştir.

### Çözüm (24.10.2026)

`supabase/functions/fetch-gold-prices/validator.ts` içine olağan dışı değişim filtresi eklendi; günlük değişim oranı `[-50%, +50%]` aralığı dışındaki aykırı sağlayıcı anomalileri (örn: -%90,55) otomatik olarak `null` yapılarak elendi. Ayrıca `gold_prices` tablosundaki `chk_at_least_one_price` kısıtıyla sıfır/negatif fiyatlar engellendi.

### Etki

Bozuk fiyat kabul edilirse kullanıcıların tahmini portföy değerleri ve kâr-zarar sonuçları ciddi biçimde yanlış olabilir.

### Geçici önlem

- Negatif, sıfır, sayı olmayan ve birim uyuşmazlığı olan fiyatlar reddedilecek.
- Rastgele yüzde eşiği production kuralı olarak kullanılmayacak.
- Test aşamasında olağan dışı fiyatlar manuel incelemeye alınacak.

### Çözüm şartı

- Yeterli gerçek fiyat örneği incelenmeli.
- Ürün türlerine göre makul hareket aralıkları değerlendirilmelidir.
- Eşik, yanlış pozitif ve yanlış negatif testleriyle doğrulanmalıdır.
- Reddedilen fiyat için güvenli teknik kayıt oluşturulmalıdır.

### İlgili belgeler

- `API.md`, fiyat doğrulama
- `DATABASE.md`, `gold_prices.is_valid`
- `TODO.md`, Faz 6.2

---

## KI-012: Portföy hesaplamasının çalışacağı katman kesinleşmedi

**Durum:** Resolved  
**Önem:** Medium  
**Kategori:** Mimari  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026  
**Çözüm tarihi:** 22.10.2026  
**Çözüm:** `ADR-010` ve `ADR-013` kararlarıyla portföy hesaplama motoru mobil istemci tarafında saf etki alanı fonksiyonları (`src/models/portfolioSummary.ts` ve `calculations.ts`) olarak uygulandı. Kısmi portföy kâr-zarar izolasyonu sağlandı; 93/93 birim testiyle tam doğrulandı.

### Açıklama

Portföy değerleme ve toplam hesaplarının mobil istemci, PostgreSQL view, RPC veya servis katmanından hangisinde çalışacağı kesinleşmemiştir.

### Etki

Yanlış dağılım:

- Hesaplama kurallarının birden fazla yerde kopyalanmasına
- İstemci ve backend sonuçlarının farklılaşmasına
- Büyük portföylerde performans sorununa
- Güvenlik ve bakım zorluğuna

neden olabilir.

### Geçici önlem

- Formüller `src/domain/calculations` altında saf fonksiyon olarak tasarlanacak.
- Veritabanında hesaplanmış değerler ana gerçek veri olarak saklanmayacak.
- Aynı formül birden fazla yerde kopyalanmayacak.

### Çözüm şartı

- Gerçek sorgu ve portföy boyutları değerlendirilmelidir.
- Hassasiyet ve performans testleri yapılmalıdır.
- İstemci ve backend sonuçlarının aynı olduğu test edilmelidir.
- Karar ADR olarak kaydedilmelidir.

### İlgili belgeler

- `ARCHITECTURE.md`
- `API.md`
- `DATABASE.md`
- `DECISIONS.md`, ADR-012
- `TODO.md`, Faz 7 ve Faz 8.5

---

## KI-013: JavaScript sayısal hassasiyet yaklaşımı kesinleşmedi

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Finansal hesaplama  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026  
**Çözüm tarihi:** 22.10.2026  
**Çözüm:** `ADR-032` kararı ve `src/utils/money.ts` ile `calculations.ts` içinde tam kuruş bazlı BIGINT integer modeli uygulandı. Kuruş dönüşümü için `parseMoneyInputToMinor`, `formatMoney`, `parseQuantity` fonksiyonları yazılarak kayan nokta hassasiyet kayıpları sıfırlandı.

### Açıklama

Veritabanında para `BIGINT`, miktar `NUMERIC(18,3)` olarak tasarlanmıştır. TypeScript tarafında büyük tam sayılar ve ondalıklı miktarların hangi güvenli modelle işleneceği kesinleşmemiştir.

### Etki

JavaScript `number` türünün sınırları veya kayan nokta davranışı nedeniyle kuruş, gram ve yüzde hesaplarında hassasiyet kaybı oluşabilir.

### Geçici önlem

- `NUMERIC` miktarlar metin olarak taşınabilir.
- Ara işlemlerde gereksiz dönüşüm ve yuvarlama yapılmayacak.
- Bir ondalık sayı kütüphanesi gerekçesiz eklenmeyecek.

### Çözüm şartı

- Gerçek üst sınırlar belirlenmeli.
- Büyük tutar ve üç ondalıklı miktar testleri hazırlanmalı.
- `number`, `bigint` veya ondalık kütüphane seçenekleri karşılaştırılmalı.
- Android ve iOS uyumluluğu doğrulanmalı.
- Seçim `DECISIONS.md` içine kaydedilmeli.

### İlgili belgeler

- `ARCHITECTURE.md`, sayısal hassasiyet
- `DATABASE.md`
- `TODO.md`, Faz 7

---

## KI-014: Mobil Supabase oturum saklama yöntemi kesinleşmedi

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Kimlik doğrulama ve güvenlik  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026  
**Çözüm referansı:** ADR-034, `src/lib/supabase.ts`

### Açıklama

Supabase oturumunun Expo üzerinde Android ve iOS'ta hangi güncel saklama adaptörüyle yönetileceği ve Android Keystore 2048 bayt sınırına karşı nasıl korunacağı kesinleşmemişti.

### Çözüm

`src/lib/supabase.ts` içerisinde `expo-secure-store` tabanlı ve 1800 karakteri aşan JWT yüklerini otomatik olarak parçalayan (`__CHUNKED__:<sayı>`) `secureStorage` adaptörü geliştirilerek çözüldü (ADR-034). Oturum verileri donanımsal Keystore / Keychain üzerinde şifreli olarak korunmaktadır.

### Etki

Yanlış oturum saklama yaklaşımı:

- Kullanıcının sürekli çıkış yapmasına
- Oturum yenilemenin çalışmamasına
- Hassas oturum verisinin uygun olmayan depolamada tutulmasına
- Android ve iOS davranışlarının farklılaşmasına

neden olabilir.

### Geçici önlem

- Paket ve adaptör adı kesin karar olarak kodlanmayacak.
- Güncel resmi entegrasyon yöntemi proje oluşturulurken doğrulanacak.
- Secret veya service role anahtarı oturum depolamasına konulmayacak.

### Çözüm şartı

- Güncel Expo ve Supabase sürümleri belirlenmeli.
- Android cihazda oturum kalıcılığı test edilmeli.
- iOS cihazda veya geçerli test sürecinde oturum kalıcılığı test edilmeli.
- Çıkış ve kullanıcı değişimi sonrası önbellek temizliği doğrulanmalı.

### İlgili belgeler

- `ARCHITECTURE.md`, kullanıcı oturumu
- `API.md`, oturum yenileme
- `TODO.md`, Faz 5
- `SECURITY.md`

---

## KI-015: E-posta doğrulama ve şifre sıfırlama derin bağlantıları test edilmedi

**Durum:** Open  
**Önem:** High  
**Kategori:** Kimlik doğrulama ve platform  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

E-posta doğrulama ve şifre sıfırlama bağlantılarının Android ve iOS'ta uygulamayı doğru ekranda açması henüz tasarım aşamasındadır.

### Etki

Derin bağlantı çalışmazsa kullanıcı:

- E-posta adresini doğrulayamaz
- Şifresini sıfırlayamaz
- Tarayıcı ve uygulama arasında sıkışabilir
- Geçersiz veya süresi dolmuş bağlantıda anlaşılmaz hata görebilir

### Geçici önlem

- Auth callback rotası mimaride ayrılmıştır.
- Uygulama kimlikleri kesinleşmeden production bağlantıları oluşturulmayacaktır.

### Çözüm şartı

Aşağıdaki durumlar iki platformda test edilmelidir:

1. Başarılı e-posta doğrulama
2. Süresi dolmuş doğrulama bağlantısı
3. Tekrar doğrulama e-postası
4. Başarılı şifre sıfırlama
5. Süresi dolmuş sıfırlama bağlantısı
6. Uygulama yüklü değilken bağlantı davranışı
7. Uygulama arka plandayken bağlantı davranışı

### İlgili belgeler

- `ARCHITECTURE.md`, auth callback rotası
- `API.md`, e-posta doğrulama ve şifre sıfırlama
- `TODO.md`, Faz 5.4 ve Faz 5.6

---

## KI-016: Şifre politikası kesinleşmedi

**Durum:** Open  
**Önem:** Medium  
**Kategori:** Kimlik doğrulama  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

Asgari şifre uzunluğu, kabul edilen karakterler ve kullanıcıya gösterilecek şifre gereksinimleri kesinleşmemiştir.

### Etki

Çok zayıf politika hesap güvenliğini azaltabilir. Gereksiz karmaşık politika ise kullanıcı deneyimini bozabilir ve şifre tekrar kullanımını teşvik edebilir.

### Geçici önlem

- Supabase'in güncel güvenli varsayılanları incelenmeden özel kural yazılmayacak.
- Şifre loglanmayacak veya uygulama veritabanında saklanmayacak.

### Çözüm şartı

- Supabase Auth yapılandırması incelenmeli.
- Güvenlik ve kullanıcı deneyimi birlikte değerlendirilmelidir.
- Kayıt ve şifre sıfırlama ekranı aynı politikayı kullanmalıdır.
- Politika `SECURITY.md`, `API.md` ve kullanıcı metinlerine eklenmelidir.

### İlgili belgeler

- `API.md`
- `SECURITY.md`
- `TODO.md`, Faz 5.3 ve Faz 5.6

---

## KI-017: Üretim e-posta gönderim hizmeti kesinleşmedi

**Durum:** Open  
**Önem:** High  
**Kategori:** Kimlik doğrulama ve altyapı  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

E-posta doğrulama ve şifre sıfırlama iletilerinin production ortamında hangi hizmet üzerinden gönderileceği kesinleşmemiştir.

### Etki

- E-postalar spam klasörüne düşebilir.
- Gönderim kotası yetersiz olabilir.
- Alan adı doğrulaması eksik olabilir.
- Kullanıcılar hesaplarını doğrulayamayabilir veya şifrelerini sıfırlayamayabilir.
- Yeni bir veri işleyen taraf ortaya çıkabilir.

### Geçici önlem

- Production kullanıcı kaydı açılmayacak.
- Test ortamında yalnızca test hesapları kullanılacak.
- E-posta sağlayıcısı gizlilik değerlendirmesi yapılmadan seçilmeyecek.

### Çözüm şartı

- Gönderim hizmeti seçilmeli.
- Alan adı ve gönderici adresi hazırlanmalı.
- SPF, DKIM ve gerekli e-posta doğrulamaları tamamlanmalı.
- Kota ve maliyet doğrulanmalı.
- Gizlilik ve veri aktarımı belgeleri güncellenmeli.
- Android ve iOS bağlantı akışları test edilmeli.

### İlgili belgeler

- `API.md`
- `PRIVACY.md`
- `SECURITY.md`
- `TODO.md`, kullanıcı hesabı fazları

---

## KI-018: Hesap silme işleminin kısmi hata telafisi kesinleşmedi

**Durum:** Resolved  
**Önem:** Critical  
**Kategori:** Hesap silme ve veri bütünlüğü  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 22.10.2026  
**Çözüm referansı:** ADR-033, `docs/DATA_RETENTION.md`, `src/models/accountDeletion.ts`, Faz 12

### Açıklama

Hesap silme birden fazla tabloyu ve Supabase Auth hesabını etkiler. İşlem bazı adımlardan sonra başarısız olursa nasıl devam edileceği kesinleşmemiştir.

Örnek:

```text
Portföy silindi
Profil henüz silinmedi
Auth hesabı silinemedi
```

### Çözüm

Faz 12 kapsamında ADR-033 karara bağlandı:
1. `DELETION_TABLE_ORDER` hiyerarşisi belirlendi (`account_deletion_requests` -> `portfolio_entries` -> `user_preferences` -> `user_legal_events` (anonimleştirme) -> `security_events` (anonimleştirme) -> `user_profiles` -> `auth.users`).
2. Veritabanı adımları atomik transaction içinde yürütülür; ara adımlarda hata oluşursa rollback edilir, profil ve auth hesabı silinmez.
3. Hata durumunda talep `failed` olarak işaretlenir ve kullanıcıya net hata mesajı gösterilir; hayalet hesap oluşumu engellenir.
4. `test-faz12-account-deletion-design.ts` ile 10/10 test senaryosuyla doğrulandı.

### Etki

- Kullanıcı hesabı tutarsız kalabilir.
- Bazı veriler silinirken bazıları kalabilir.
- Kullanıcıya yanlış başarı mesajı gösterilebilir.
- Silme talebinin durumu kaybolabilir.

### Geçici önlem

- Silme işlemi uygulanana kadar tamamlanmış kabul edilmeyecek.
- İşlem sonucu doğrulanmadan başarı mesajı gösterilmeyecek.
- `account_deletion_requests` durum takibi kullanılacak.
- Production hesabı silme işlemi test edilmeden açılmayacak.

### Çözüm şartı

- Adımların işlem sırası kesinleşmeli.
- Tekrar çalıştırılabilir, güvenli telafi yöntemi tanımlanmalı.
- Her hata noktasına test yazılmalı.
- Auth hesabı silme sonrası teknik sonuç kaydının davranışı belirlenmeli.
- `DATA_RETENTION.md` ve `SECURITY.md` güncellenmeli.

### İlgili belgeler

- `DATABASE.md`, `account_deletion_requests`
- `API.md`, hesap silme
- `ARCHITECTURE.md`, `delete-account`
- `DECISIONS.md`, ADR-025
- `TODO.md`, Faz 12

---

## KI-019: Yasal ve güvenlik kayıtlarının saklama süreleri belirlenmedi

**Durum:** Open  
**Önem:** Critical  
**Kategori:** Veri saklama ve KVKK  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

Aşağıdaki kayıtların ne kadar saklanacağı kesinleşmemiştir:

- `user_legal_events`
- `account_deletion_requests`
- `security_events`
- `price_fetch_runs`
- Geçmiş `gold_prices`

### Etki

Gereğinden uzun saklama veri minimizasyonuna aykırı olabilir. Gereğinden kısa saklama ise güvenlik incelemesi, yasal ispat veya teknik hata çözümünü engelleyebilir.

### Geçici önlem

- `security_events.retention_until` alanı tasarlanmıştır.
- Production verisi oluşturulmadan önce saklama politikası hazırlanacaktır.
- Rastgele ve süresiz saklama uygulanmayacaktır.

### Çözüm şartı

Her veri grubu için aşağıdakiler belirlenmelidir:

1. İşleme amacı
2. Hukuki dayanak
3. Saklama süresi
4. Silme veya anonimleştirme yöntemi
5. Yedeklerden silinme davranışı
6. Sözleşme sona erdiğinde verinin durumu

### İlgili belgeler

- `DATA_RETENTION.md`
- `PRIVACY.md`
- `DATABASE.md`
- `TODO.md`, Faz 13.1

---

## KI-020: Development, Preview ve Production ortamları henüz oluşturulmadı

**Durum:** Open  
**Önem:** High  
**Kategori:** Altyapı  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

Üç ortamın ayrılması planlanmıştır ancak Expo, EAS ve Supabase üzerinde gerçek ortamlar henüz oluşturulmamıştır.

### Etki

Ortamlar ayrılmazsa:

- Test verisi production verisine karışabilir.
- Yanlış API anahtarı kullanılabilir.
- Migrationlar doğrudan production'a uygulanabilir.
- Gerçek kullanıcılar test değişikliklerinden etkilenebilir.

### Geçici önlem

- Henüz production projesi oluşturulmayacak.
- Oluşturulacak ilk Supabase projesi açıkça Development olarak adlandırılacak.
- Gerçek kullanıcı verisi kullanılmayacak.

### Çözüm şartı

- Development, Preview ve Production ortam değişkenleri ayrılmalı.
- EAS profilleri ayrılmalı.
- ADR-031 uyarınca Supabase ücretsiz paket sınırına (2 aktif proje) uyum sağlamak için Development ve Preview ortamları tek bir test Supabase projesini paylaşmalı, Production için ayrı proje yalnızca yayın aşamasında açılmalı.
- Yanlış ortama bağlanmayı önleyen görünür işaretler eklenmeli.

### İlgili belgeler

- `API.md`, ortamlar
- `ARCHITECTURE.md`, ortam değişkenleri
- `TODO.md`, Faz 2.4 ve Faz 15

---

## KI-021: Expo projesi ve gerçek paket sürümleri henüz oluşturulmadı

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Geliştirme ortamı  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026  
**Çözüm tarihi:** 21.10.2026  
**Çözüm:** Expo SDK 58 (~58.0.19), React 19.3.0, React Native 0.88.0, Expo Router ~58.0.26 ve TypeScript ~6.0.3 paket sürümleriyle proje başarıyla oluşturuldu ve kilitlendi. `npx expo-doctor` 20/20 test ile onaylandı.

### Açıklama

Expo projesi oluşturulmadığı için Expo SDK, React Native, TypeScript, Expo Router ve Supabase paketlerinin gerçek sürümleri kesinleşmemiştir.

### Etki

Belgelerde önerilen klasör, paket veya oturum yöntemlerinin güncel varsayılan projeyle farklı olması mümkündür.

### Geçici önlem

- Belgeler `Taslak` olarak işaretlenmiştir.
- Güncel sürüm doğrulanmadan eski komut veya paket ismi kesin bilgi olarak kullanılmayacaktır.
- Gereksiz paket kurulmayacaktır.

### Çözüm şartı

- Güncel resmi Expo yöntemiyle TypeScript projesi oluşturulmalı.
- Varsayılan dosya yapısı incelenmeli.
- Paket sürümleri kaydedilmeli.
- Uygulama Android fiziksel cihazda ilk kez açılmalı.
- `ARCHITECTURE.md` gerçek yapıya göre güncellenmeli.

### İlgili belgeler

- `ARCHITECTURE.md`
- `PROJECT_CONTEXT.md`
- `TODO.md`, Faz 1 ve Faz 2

---

## KI-022: iOS test yöntemi kesinleşmedi

**Durum:** Mitigated  
**Önem:** High  
**Kategori:** Platform  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 21.10.2026

### Açıklama

Uygulamanın iOS uyumluluğu zorunludur ancak geliştirici bilgisayarı Windows 11 olduğundan yerel iOS simülatörü çalıştırılamaz ve kullanıcının şu an kişisel iPhone'u bulunmamaktadır.

### Etki

Yalnızca Android üzerinde geliştirilen uygulamada safe area, klavye, navigasyon ve depolama farkları geç fark edilebilir.

### Geçici önlem

- Faz 1.5 kapsamında strateji belirlendi: Geliştirme süresince kod seviyesinde iOS uyumluluğuna (Safe Area, klavye, cross-platform bileşenler) sıkı sıkıya uyulacak.
- Geliştirme esnasında ihtiyaç duyuldukça arkadaş/aile iPhone cihazından ücretsiz Expo Go ile anlık test yapılacaktır.
- Apple Developer hesabı ($99/yıl) geliştirme aşamasında zorunlu tutulmayacak, Faz 15 (Mağaza ve TestFlight) aşamasına ertelenecektir.
- Mac gerektirmeden Expo'nun bulut derleme aracı (EAS Build) kullanılacaktır.

### Çözüm şartı

- Kullanılacak gerçek iOS test yöntemi belirlenmeli.
- Test cihazı veya TestFlight erişimi hazırlanmalı.
- Temel auth, navigasyon, form, secure storage ve hesap silme akışları iOS'ta test edilmeli.

### İlgili belgeler

- `PROJECT_CONTEXT.md`
- `ARCHITECTURE.md`, Android ve iOS uyumluluğu
- `TODO.md`, Faz 1.5 ve Faz 14.3

---

## KI-023: Android geliştirme ortamı ve fiziksel cihaz bağlantısı test edilmedi

**Durum:** Open  
**Önem:** Medium  
**Kategori:** Platform ve geliştirme ortamı  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

Android fiziksel test cihazı, Expo Go uygunluğu, aynı ağ bağlantısı ve alternatif bağlantı yöntemi henüz doğrulanmamıştır.

### Etki

Expo projesi oluşturulduğunda uygulamanın telefonda açılamaması geliştirmeyi geçici olarak durdurabilir.

### Geçici önlem

- Kodlamadan önce bilgisayar ve telefon ortamı kontrol edilecek.
- Android Studio gerekliliği doğrulanmadan ağır kurulum yapılmayacak.

### Çözüm şartı

- Fiziksel telefon belirlenmeli.
- Gerekli Expo test uygulaması kurulmalı.
- Varsayılan Expo projesi telefonda açılmalı.
- Yerel ağ sorunu için alternatif yöntem belgelenmeli.

### İlgili belgeler

- `TODO.md`, Faz 1.4 ve Faz 2
- `ARCHITECTURE.md`

---

## KI-024: Altın İz marka adı ve teknik uygulama kimlikleri doğrulanmadı

**Durum:** Resolved  
**Önem:** Medium  
**Kategori:** Marka ve mağaza  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 24.10.2026  
**Çözüm tarihi:** 22.10.2026  
**Çözüm:** `com.altiniz.app` paket kimliği (Android package ve iOS bundle identifier) kilitlendi; `https://altiniz.app` alan adı ve web sitesi yayına alındı; marka kimliği ve logolar `#0B1220` ve `#D4A72C` renkleriyle tamamlandı.

### Açıklama

`Altın İz` çalışma adı seçilmiştir ancak marka, mağaza, alan adı ve teknik uygulama kimliği kullanılabilirliği kesinleşmemiştir.

### Etki

Geç doğrulama, mağaza yayını öncesi ad değişikliği, logo değişikliği veya uygulama kimliği planının yeniden yapılmasına neden olabilir.

### Geçici önlem

- `Altın İz` çalışma adı olarak kullanılacak.
- Production mağaza kaydı ve nihai logo çalışması araştırma tamamlanmadan yapılmayacak.

### Çözüm şartı

- Türk Patent ve Marka Kurumu araştırması yapılmalı.
- Google Play ve App Store isimleri araştırılmalı.
- Alan adı ve sosyal medya adları araştırılmalı.
- Android package ve iOS bundle identifier adayları doğrulanmalı.
- Kesin karar ADR olarak kaydedilmeli.

### İlgili belgeler

- `PROJECT_CONTEXT.md`
- `DECISIONS.md`, ADR-023
- `TODO.md`, Faz 0.4

---

## KI-025: Yasal metinler hukuk uzmanı tarafından hazırlanmadı

**Durum:** Blocked  
**Önem:** Critical  
**Kategori:** Hukuk ve mağaza  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

Aşağıdaki metinlerin nihai içerikleri henüz hazırlanmadı veya hukuk uzmanı tarafından doğrulanmadı:

- KVKK Aydınlatma Metni
- Gizlilik Politikası
- Kullanım Koşulları
- Veri Saklama ve Silme Politikası
- Finansal Bilgilendirme
- Gerekirse Açık Rıza Metni

### Etki

Uygulama gerçek kullanıcıya açılamaz ve mağaza gizlilik formları doğru doldurulamaz.

### Geçici önlem

- `legal_documents` şeması hazırlanmıştır ancak gerçek hukuk metni eklenmeyecektir.
- Örnek metinler üretim metni olarak yayımlanmayacaktır.
- Gerçek kullanıcı kaydı açılmayacaktır.

### Çözüm şartı

- Gerçek veri akışı kesinleşmeli.
- Veri sorumlusu ve iletişim bilgileri belirlenmeli.
- Hukuk uzmanı bütün metinleri hazırlamalı veya doğrulamalı.
- Metin sürümleri `legal_documents` içine eklenmeli.
- Google Play ve App Store beyanlarıyla karşılaştırılmalı.

### İlgili belgeler

- `PRIVACY.md`
- `DATA_RETENTION.md`
- `DATABASE.md`, `legal_documents`
- `TODO.md`, Faz 11

---

## KI-026: Google Play ve App Store gizlilik beyanları hazırlanmadı

**Durum:** Open  
**Önem:** High  
**Kategori:** Mağaza ve gizlilik  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

Google Play Veri Güvenliği ve App Store App Privacy beyanları henüz hazırlanmadı. Gerçek uygulama ve üçüncü taraf hizmetler kesinleşmeden doğru şekilde tamamlanamaz.

### Etki

Yanlış beyan mağaza reddine veya yayımdan sonra politika sorununa yol açabilir.

### Geçici önlem

- Mağaza formu erken ve tahminle doldurulmayacak.
- Kullanılan her SDK ve veri akışı `PRIVACY.md` içinde izlenecek.

### Çözüm şartı

- Production uygulamasındaki bütün veri türleri listelenmeli.
- Her üçüncü taraf SDK ve hizmet doğrulanmalı.
- Hesap silme ve veri saklama davranışı kesinleşmeli.
- İki mağaza beyanı gerçek uygulama davranışıyla birebir karşılaştırılmalı.

### İlgili belgeler

- `PRIVACY.md`
- `DATA_RETENTION.md`
- `TODO.md`, Faz 13.1, Faz 15.3 ve Faz 15.4

---

## KI-027: Belgeler arası tam tutarlılık denetimi tamamlandı

**Durum:** Resolved  
**Önem:** Medium  
**Kategori:** Dokümantasyon  
**İlk kayıt:** 03.09.2026  
**Çözüm tarihi:** 03.09.2026

### Çözüm

14 başlangıç belgesi birlikte karşılaştırıldı. Belge sayıları, tamamlanan işler, okuma sıraları, üst bilgiler, sıradaki görevler ve geçmiş kayıtları ortak mevcut durumla eşitlendi.

### Doğrulama

- Başlangıç belge sayısı bütün takip belgelerinde 14 olarak doğrulandı.
- Sıradaki görev geliştirme araçlarının kontrolü olarak eşitlendi.
- `README.md`, `PROJECT_CONTEXT.md`, `TODO.md` ve `HANDOFF.md` okuma sıraları ortaklaştırıldı.
- Gerçek uygulama, test veya Git sonucu varmış gibi gösterilmedi.
- Değişiklikler `CHANGELOG.md` içine kaydedildi.

## KI-028: `PROJECT_CONTEXT.md` güncel belge durumuyla eşitlendi

**Durum:** Resolved  
**Önem:** Low  
**Kategori:** Dokümantasyon  
**İlk kayıt:** 03.09.2026  
**Çözüm tarihi:** 03.09.2026

### Çözüm

14 başlangıç belgesi birlikte karşılaştırıldı. Belge sayıları, tamamlanan işler, okuma sıraları, üst bilgiler, sıradaki görevler ve geçmiş kayıtları ortak mevcut durumla eşitlendi.

### Doğrulama

- Başlangıç belge sayısı bütün takip belgelerinde 14 olarak doğrulandı.
- Sıradaki görev geliştirme araçlarının kontrolü olarak eşitlendi.
- `README.md`, `PROJECT_CONTEXT.md`, `TODO.md` ve `HANDOFF.md` okuma sıraları ortaklaştırıldı.
- Gerçek uygulama, test veya Git sonucu varmış gibi gösterilmedi.
- Değişiklikler `CHANGELOG.md` içine kaydedildi.

## KI-029: `TODO.md` çalışma sırası güncellendi

**Durum:** Resolved  
**Önem:** Low  
**Kategori:** Dokümantasyon  
**İlk kayıt:** 03.09.2026  
**Çözüm tarihi:** 03.09.2026

### Çözüm

14 başlangıç belgesi birlikte karşılaştırıldı. Belge sayıları, tamamlanan işler, okuma sıraları, üst bilgiler, sıradaki görevler ve geçmiş kayıtları ortak mevcut durumla eşitlendi.

### Doğrulama

- Başlangıç belge sayısı bütün takip belgelerinde 14 olarak doğrulandı.
- Sıradaki görev geliştirme araçlarının kontrolü olarak eşitlendi.
- `README.md`, `PROJECT_CONTEXT.md`, `TODO.md` ve `HANDOFF.md` okuma sıraları ortaklaştırıldı.
- Gerçek uygulama, test veya Git sonucu varmış gibi gösterilmedi.
- Değişiklikler `CHANGELOG.md` içine kaydedildi.

## KI-030: Git deposu ve geri dönüş noktaları henüz yok

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Sürüm kontrolü  
**İlk kayıt:** 03.09.2026  
**Çözüm tarihi:** 21.10.2026

### Çözüm

Proje kök dizininde yerel Git deposu (`main` dalı) başlatıldı. `.gitignore` yapılandırması doğrulandı, `.env` dosyaları korumaya alındı. Belgeler ve çalışan ilk Expo projesi eklenerek ilk güvenli commit (`07c2c17`) oluşturuldu.

### Doğrulama

- `git init -b main` çalıştırıldı.
- `git status` ile yalnızca gerekli dosyaların takip edildiği, `node_modules` ve `.expo` gibi gereksiz dosyaların dışlandığı doğrulandı.
- `07c2c17` hash'li `Initialize Expo TypeScript project` commit'i atıldı.
- Commit kimliği `HANDOFF.md` içine yazıldı.

### İlgili belgeler

- `TODO.md`, Faz 2.1 ve Faz 2.2
- `CHANGELOG.md`
- `HANDOFF.md`

---

# Ertelenen konular

## Ertelenen konular için numaralandırma kuralı

`KI-100` ve üzerindeki kayıt numaraları, hata olmaktan çok V1 kapsamı dışında bırakılan veya sonraki sürümlere ertelenen konular için ayrılmıştır.

Bu nedenle:

```text
KI-101
KI-102
KI-103
```

numaraları yeniden adlandırılmayacaktır. Normal açık ve çözülen sorun kayıtları `KI-001`, `KI-002`, `KI-031`, `KI-032` biçiminde sırayla devam eder.

---

## KI-101: WebSocket fiyat akışı V1 kapsamında değil

**Durum:** Deferred  
**Önem:** Low  
**Kategori:** Fiyat sistemi  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

Gerçek zamanlı WebSocket fiyat akışı V1'de uygulanmayacaktır.

### Gerekçe

- Saniyelik fiyat akışı V1'in temel amacı için zorunlu değildir.
- REST yaklaşımı daha basit ve düşük maliyetlidir.
- Mobil bağlantı ve pil tüketimini azaltır.
- Canlı bağlantı hata yönetimini sonraki sürüme bırakır.

### Yeniden değerlendirme şartı

- Kullanıcı ihtiyacı doğrulanırsa
- Sağlayıcı planı ve maliyet uygunsa
- REST güncelliği kullanıcı beklentisini karşılamazsa

### İlgili belgeler

- `DECISIONS.md`, ADR-004
- `API.md`
- `TODO.md`, V2 görev havuzu

---

## KI-102: Tam çevrimdışı portföy yazma V1 kapsamında değil

**Durum:** Deferred  
**Önem:** Low  
**Kategori:** Çevrimdışı kullanım  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

İnternet yokken portföy ekleme, düzenleme veya silme işlemlerini kuyruğa alma V1'de bulunmayacaktır.

### Gerekçe

- Çakışma ve tekrar gönderim yönetimi gerektirir.
- Kullanıcıya yanlış başarı durumu gösterme riski vardır.
- Hassas portföy verisinin yerel saklanmasını artırır.

### Geçici davranış

Bağlantı yokken yazma işlemi başarılı gösterilmez. Kullanıcıdan bağlantı sağladıktan sonra yeniden denemesi istenir.

### İlgili belgeler

- `DECISIONS.md`, ADR-027
- `ARCHITECTURE.md`, önbellek
- `API.md`, çevrimdışı davranış

---

## KI-103: Favoriler, alarmlar, grafikler ve satış geçmişi V1 kapsamında değil

**Durum:** Deferred  
**Önem:** Low  
**Kategori:** Ürün kapsamı  
**İlk kayıt:** 03.09.2026  
**Son güncelleme:** 03.09.2026

### Açıklama

Aşağıdaki özellikler V2 görev havuzuna bırakılmıştır:

- Favoriler
- Fiyat alarmları
- Anlık bildirimler
- Fiyat grafikleri
- Portföy grafikleri
- Satış geçmişi
- Kısmi satış
- Gerçekleşmiş kâr-zarar

### Gerekçe

V1'in hesap, fiyat ve portföy temelini güvenli ve test edilebilir biçimde tamamlamak önceliklidir.

### İlgili belgeler

- `PROJECT_CONTEXT.md`
- `DECISIONS.md`, ADR-022
- `TODO.md`, V2 görev havuzu

---

# Çözülen sorunlar

## KI-031: İkinci belge çapraz denetiminde bulunan şema ve akış tutarsızlıkları

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Dokümantasyon ve Mimari  
**İlk kayıt:** 03.09.2026  
**Çözüm tarihi:** 03.09.2026  

### Açıklama

İkinci detaylı çapraz denetimde `price_sources.is_active` alanının eksik olduğu, kayıt sonrası profil/tercih akışının tetikleyici ve fallback ile netleştirilmesi gerektiği, hesap silme hata mesajının güncellenmesi ve `security_events.user_id` yabancı anahtar davranışının `ON DELETE SET NULL` yapılması gerektiği tespit edilmiştir.

### Çözüm

İlgili eksiklikler `DATABASE.md`, `API.md`, `SECURITY.md`, `TODO.md` ve `DECISIONS.md` dosyalarında güncellenerek giderilmiştir.

---

## KI-032: Üçüncü belge çapraz denetiminde bulunan kapsam ve özet tutarsızlıkları

**Durum:** Resolved  
**Önem:** Medium  
**Kategori:** Dokümantasyon ve Kapsam  
**İlk kayıt:** 19.10.2026  
**Çözüm tarihi:** 19.10.2026  

### Açıklama

Üçüncü detaylı belge çapraz denetiminde aşağıdaki tutarsızlıklar tespit edilmiştir:

- `README.md` V1 kapsam dışı özellikler listesinde altın haberleri ve yapay zekâ fiyat tahmini bulunmuyordu.
- `README.md` gizlilik özetinde açık adres, toplanmayacak veriler arasında yer almıyordu.
- `README.md` portföy özetinde isteğe bağlı `labor_included` alanı bulunmuyordu.
- V1 kapsamı için hangi belgenin bağlayıcı kaynak olduğu `README.md` içinde açıkça belirtilmemişti.
- `KI-101`, `KI-102` ve `KI-103` kayıtlarının neden 100 serisinde numaralandırıldığı açıklanmamıştı.

### Çözüm

- `README.md` içindeki kapsam dışı özellikler listesine altın haberleri ve yapay zekâ fiyat tahmini eklendi.
- `README.md` içindeki toplanmayacak veriler listesine açık adres eklendi.
- `README.md` portföy özelliklerine isteğe bağlı işçilik dâhil bilgisi eklendi.
- İşçilik bilgisinin yalnızca açıklayıcı olduğu ve hesaplamaya otomatik olarak katılmadığı belirtildi.
- V1 kapsamı için `PROJECT_CONTEXT.md` ile `DECISIONS.md` içindeki ADR-022 bağlayıcı kaynak olarak belirtildi.
- `KI-100` ve üzerindeki kayıtların ertelenen veya V1 kapsamı dışında bırakılan konular için ayrıldığı açıklandı.
- `TODO.md`, `CHANGELOG.md` ve `HANDOFF.md` denetim sonucuyla eşitlendi.

### Doğrulama

- [x] `README.md` portföy özeti `DATABASE.md` ve `API.md` ile karşılaştırıldı.
- [x] `README.md` kapsam dışı listesi `PROJECT_CONTEXT.md` ve ADR-022 ile karşılaştırıldı.
- [x] `README.md` gizlilik özeti `PRIVACY.md` ve `copilot-instructions.md` ile karşılaştırıldı.
- [x] `KNOWN_ISSUES.md` numaralandırma yaklaşımı açıklandı.
- [x] İlgili görev ve değişiklik kayıtları güncellendi.

---

## KI-R001: Dış fiyat sembolleri için merkezi eşleştirme tablosu eksikti

**Durum:** Resolved  
**Önem:** High  
**Kategori:** Veritabanı ve API  
**İlk kayıt:** 03.09.2026  
**Çözüm tarihi:** 03.09.2026

### Sorun

İlk veritabanı tasarımında dış fiyat sağlayıcısının sembolleriyle `gold_products` arasında merkezi ve değiştirilebilir bir eşleştirme tablosu bulunmuyordu.

### Çözüm

`price_source_product_mappings` tablosu eklendi.

Alanlar:

```text
id
source_id
product_id
external_symbol
external_name
external_category
is_active
created_at
updated_at
```

Ayrıca benzersizlik, doğrulama, erişim ve indeks kuralları tanımlandı.

### Doğrulama

- `DATABASE.md` sürüm 1.1'e yükseltildi.
- `API.md` eşleştirme modeliyle güncellendi.
- `DECISIONS.md` içinde ADR-015 oluşturuldu.
- `ARCHITECTURE.md` veri akışına eşleştirme katmanı eklendi.
- `TODO.md` migration, RLS, seed ve test görevleriyle güncellendi.
- `CHANGELOG.md` içinde `0.0.0-planning.2` kaydı oluşturuldu.

---

# Sorun özeti


## Son çözülen dokümantasyon kayıtları 

``` text 
KI-027 → İlk tam belge tutarlılık denetimi tamamlandı 
KI-031 → İkinci çapraz denetimde bulunan şema ve akış tutarsızlıkları giderildi 
KI-032 → Üçüncü çapraz denetimde bulunan kapsam ve özet tutarsızlıkları giderildi 
```

## Çözülen Temel Mimari ve Güvenlik Kayıtları

```text
KI-013 → Sayısal hassasiyet (BIGINT kuruş ve NUMERIC(18,3) gram ile çözüldü - ADR-032)
KI-014 → Mobil oturum saklama (expo-secure-store ile donanımsal şifreleme sağlandı)
KI-018 → Hesap silme atomiklik sorunu (execute_account_deletion SQL RPC rollback ile çözüldü - Migration 008)
KI-021 → Expo proje ve paket sürümleri (Expo SDK 58 ile kilitlendi)
KI-024 → Teknik kimlikler (com.altiniz.app ve altiniz.app alan adı yapılandırıldı)
KI-030 → Git ve GitHub deposu (Bağlandı ve eşitlendi)
KI-001 → Supabase bölgesi (AB eu-central-1 Frankfurt seçildi)
KI-012 → Portföy hesaplama motoru (Kısmi portföy özeti ve ADR-013 asla 0 TL dönmeme kuralı)
```

## Açık ve Dış Bağımlılığı Olan Kayıtlar

```text
KI-003 → Fiyat sağlayıcısı ticari kullanım hakkı (Sözleşme / izin süreci beklemede)
KI-025 → Hukuk uzmanı tarafından nihai yasal metin onayı (Hukukçu incelemesi beklemede)
KI-022 → iOS fiziksel cihaz testi (Apple Developer Program $99 hesabı ve TestFlight bekleniyor)
KI-023 → Android fiziksel cihaz testi (APK derlendi; kullanıcı tarafından Redmi Note 8 Pro'da doğrulanıyor)
```

---

## 5. Dağıtımdan önce tamamlanması gereken son adımlar

### Kullanıcı ve Geliştirici Tarafı Doğrulamaları

- [~] KI-023: Android fiziksel cihazda (Redmi Note 8 Pro) üretilen APK'nın kullanıcı tarafından test edilip onaylanması.
- [ ] KI-022: Apple Developer Program hesabı açılarak TestFlight veya fiziksel iOS testi yapılması.

### Hukuki ve Ticari Dış Onaylar

- [!] KI-003: Fiyat sağlayıcısının ticari kullanım lisansı ve sözleşmesi.
- [!] KI-025: KVKK ve Kullanım Koşulları metinlerinin hukuk uzmanı tarafından son onayı.

---

## 6. Yeni sorun ekleme kontrol listesi

Yeni kayıt oluştururken:

- [ ] Benzersiz `KI-XXX` numarası verildi.
- [ ] Kısa ve anlaşılır başlık yazıldı.
- [ ] Durum belirlendi.
- [ ] Önem derecesi belirlendi.
- [ ] Kategori belirlendi.
- [ ] İlk kayıt tarihi eklendi.
- [ ] Sorun açıkça anlatıldı.
- [ ] Kullanıcı veya sistem etkisi belirtildi.
- [ ] Güvenli geçici önlem yazıldı.
- [ ] Çözülme şartı ölçülebilir şekilde yazıldı.
- [ ] İlgili belgeler belirtildi.
- [ ] Gerekliyse `TODO.md` görevi eklendi.

---

## 7. Sorun çözme kontrol listesi

Bir kayıt `Resolved` yapılmadan önce:

- [ ] Kalıcı çözüm uygulandı.
- [ ] İlgili test yapıldı.
- [ ] Beklenen sonuç görüldü.
- [ ] Android etkisi kontrol edildi.
- [ ] iOS etkisi kontrol edildi.
- [ ] Güvenlik etkisi kontrol edildi.
- [ ] Gizlilik etkisi kontrol edildi.
- [ ] Çözüm tarihi eklendi.
- [ ] Doğrulama yöntemi kaydedildi.
- [ ] `TODO.md` güncellendi.
- [ ] `CHANGELOG.md` güncellendi.
- [ ] Gerekirse `DECISIONS.md` güncellendi.
- [ ] Gerekirse `PROJECT_CONTEXT.md` güncellendi.
- [ ] Çalışan sürüm Git'e kaydedildi.
- [ ] `HANDOFF.md` güncellendi.

---

## 8. Güvenlik sorunu bildirme kuralı

Gerçek bir güvenlik açığı tespit edilirse:

1. Hassas ayrıntılar herkese açık issue veya changelog içine yazılmaz.
2. İlgili gizli anahtar sızdıysa hemen iptal edilir.
3. Etkilenen erişimler geçici olarak durdurulur.
4. Veri etkisi araştırılır.
5. Güvenli düzeltme hazırlanır ve test edilir.
6. Hukuki bildirim yükümlülükleri uzmanla değerlendirilir.
7. Kullanıcılara yapılacak bilgilendirme doğrulanmış olgulara dayanır.
8. Olay `SECURITY.md` içindeki süreçle yönetilir.

Gerçek güvenlik açığı ayrıntıları normal `KNOWN_ISSUES.md` kaydında gereksiz biçimde yayımlanmaz.

---

## 9. Belge güncelleme kuralları

Bu belge aşağıdaki durumlarda güncellenmelidir:

- Yeni sorun veya belirsizlik keşfedildiğinde
- Sorunun önem derecesi değiştiğinde
- Araştırma başladığında
- Dış sağlayıcı cevabı alındığında
- Geçici önlem uygulandığında
- Sorun çözüldüğünde
- Sorun V1 sonrasına ertelendiğinde
- Bir sorun çözülmeden bilinçli olarak kapatıldığında
- Kodlama, test veya mağaza aşaması değiştiğinde

Sorun çözüldüğünde kayıt silinmemeli, `Resolved` durumuna taşınmalı ve çözüm doğrulaması yazılmalıdır.

---

## 10. Belge sürüm geçmişi

### 1.2 Taslak - 19.10.2026

- KI-032 üçüncü belge çapraz denetim kaydı eklendi.
- README kapsam, gizlilik ve portföy özeti eksiklikleri kaydedildi ve çözüldü.
- KI-100 ve üzerindeki kayıtların ertelenen veya V1 dışı konular için ayrıldığı açıklandı.
- Sorun özeti KI-032 ile güncellendi.


### 1.1 Taslak - 03.09.2026

- KI-027, KI-028 ve KI-029 çözüldü olarak güncellendi.
- Açık sorun özeti ve kodlama öncesi liste güncellendi.
- Belge tutarlılığı düzeltmeleri doğrulandı.

### 1.0 Taslak - 03.09.2026

- Sorun durumları ve önem dereceleri tanımlandı.
- Supabase bölgesi ve veri aktarımı belirsizlikleri eklendi.
- Fiyat sağlayıcısı lisans, sembol ve ürün sorunları eklendi.
- Fiyat güncelliği ve doğrulama belirsizlikleri eklendi.
- Sayısal hassasiyet ve hesaplama katmanı sorunları eklendi.
- Auth oturumu, derin bağlantı ve e-posta hizmeti sorunları eklendi.
- Hesap silme ve veri saklama sorunları eklendi.
- Android ve iOS test eksikleri eklendi.
- Marka, hukuk ve mağaza beyanı sorunları eklendi.
- Dokümantasyon ve Git durumu sorunları eklendi.
- V1'e ertelenen konular ayrı bölümde kaydedildi.
- Çözülen sağlayıcı eşleştirme tablosu sorunu geçmiş kayıt olarak eklendi.
- Kodlama ve production öncesi çözüm listeleri oluşturuldu.
