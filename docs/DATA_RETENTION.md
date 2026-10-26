# Altın İz V1 Veri Saklama ve İmha Politikası Taslağı

**Belge adı:** `DATA_RETENTION.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.2 Taslak  
**Son güncelleme:** 26.10.2026 
**Proje aşaması:** Bölüm 18: Hesap ve veri silme (Faz 12)  
**Kodlama durumu:** Teknik tasarım ve veri modelleri hazırlandı  
**Hedef platformlar:** Android ve iOS

---

## 1. Önemli hukuki uyarı

Bu belge, Altın İz için hazırlanmış dahili veri saklama ve imha taslağıdır.

Bu belge:

- Nihai hukuk görüşü değildir.
- Kesin yasal süreler belirlemez.
- Veri sorumlusunun resmî kişisel veri saklama ve imha politikasının yerine geçmez.
- Hukuk uzmanı incelemesi yapılmadan production politikasına dönüştürülemez.
- VERBİS yükümlülüğü değerlendirilmeden resmî sicil beyanı olarak kullanılamaz.

Kesin saklama süreleri, veri sorumlusunun kimliği, uygulanabilir mevzuat, sözleşmeler, teknik altyapı ve üçüncü taraf hizmetler doğrulandıktan sonra hukuk uzmanıyla belirlenmelidir.

---

## 2. Belgenin amacı

Bu belgenin amaçları:

1. Altın İz'de oluşabilecek veri gruplarını belirlemek
2. Her veri için saklama başlangıcını tanımlamak
3. Saklamayı sona erdiren olayı belirlemek
4. Geçici ve kesin saklama sürelerini birbirinden ayırmak
5. Silme, yok etme ve anonimleştirme yöntemlerini tanımlamak
6. Hesap silme işleminin veri gruplarına etkisini açıklamak
7. Yedeklerdeki silme davranışını planlamak
8. Yerel cihaz verilerinin temizlenmesini tanımlamak
9. Üçüncü taraf hizmetlerdeki verilerin silinmesini takip etmek
10. Periyodik imha sürecini hazırlamak
11. Silme işlemlerinin doğrulanabilir ve denetlenebilir olmasını sağlamak
12. Saklama süresi dolan verinin gerekçesiz tutulmasını önlemek

---

## 3. Temel ilkeler

Altın İz veri saklama ve imha sürecinde şu ilkeleri uygular:

- Bir veri yalnızca işleme amacı devam ettiği sürece saklanır.
- Hukuki sebep sona ererse veri tekrar değerlendirilir.
- Süresiz ve gerekçesiz saklama yapılmaz.
- Her veri grubu için azami saklama süresi veya silme olayı belirlenir.
- Veri sahibi talebi bulunmasa da şartları sona eren veri resen imha edilir.
- Kullanıcı talebi geldiğinde uygulanabilir silme süreci işletilir.
- Silme, yok etme ve anonimleştirme birbirinden ayrılır.
- İmha işlemi teknik olarak doğrulanabilir olmalıdır.
- Yedekler, loglar ve üçüncü taraf sistemler unutulmaz.
- Production verisi Development ortamına kopyalanmaz.
- İmha kaydı, silinen kişisel veriyi yeniden oluşturacak ayrıntı içermez.
- Hukuki saklama zorunluluğu varsa yalnızca gerekli veri ve süre korunur.

---

## 4. Tanımlar

### Saklama

Kişisel verinin işleme amacı ve hukuki sebebi devam ettiği sürece uygun güvenlik önlemleriyle tutulmasıdır.

### İmha

Kişisel verinin silinmesi, yok edilmesi veya anonim hâle getirilmesini kapsayan üst kavramdır.

### Silme

Kişisel verinin ilgili kullanıcılar için erişilemez ve tekrar kullanılamaz hâle getirilmesidir.

### Yok etme

Kişisel verinin hiç kimse tarafından erişilemez, geri getirilemez ve tekrar kullanılamaz hâle getirilmesidir.

### Anonimleştirme

Verinin başka verilerle eşleştirilse dahi kimliği belirli veya belirlenebilir kişiyle ilişkilendirilemez hâle getirilmesidir.

### Saklama başlangıcı

Sürenin sayılmaya başladığı olaydır.

Örnekler:

```text
Hesap oluşturma zamanı
Portföy kaydı oluşturma zamanı
Güvenlik olayının oluşma zamanı
Hesap silme talebinin tamamlanma zamanı
Destek talebinin kapanma zamanı
```

### Saklama sonu olayı

Verinin işlenmesini gerektiren amacın veya hukuki sebebin ortadan kalktığı olaydır.

### Periyodik imha

İşleme şartları sona eren verilerin politikada belirlenen düzenli aralıklarla silinmesi, yok edilmesi veya anonimleştirilmesidir.

---

## 5. Politikanın kapsamındaki kayıt ortamları

### Bulut ortamları

- Supabase Auth
- Supabase PostgreSQL
- Supabase Edge Functions
- Supabase log ve yedek sistemleri
- Production e-posta hizmeti
- Hata izleme hizmeti, eklenirse
- Analitik hizmeti, eklenirse
- Destek hizmeti, eklenirse

### Mobil cihaz

- Güvenli oturum saklama alanı
- Tema tercihi
- Son fiyat önbelleği
- Yasal belge önbelleği
- Sınırlı portföy önbelleği, kullanılırsa

### Geliştirme ortamları

- Geliştirici bilgisayarı
- Git deposu
- GitHub özel deposu
- Development ve Preview veritabanları
- Test çıktıları
- Ekran görüntüleri
- Hata raporları

### Kâğıt veya çevrimdışı ortam

V1 için planlanmamaktadır. Destek veya hukuk sürecinde basılı kayıt oluşursa politika kapsamına ayrıca eklenmelidir.

---

## 6. Saklama süresi belirleme yöntemi

Her veri grubu için aşağıdaki sıra uygulanır:

```text
1. Veri işleme amacı belirlenir
2. Hukuki sebep belirlenir
3. Uygulanabilir özel mevzuat araştırılır
4. Sözleşmesel zorunluluklar belirlenir
5. Hak düşürücü süre ve zamanaşımı ihtiyacı hukuk uzmanıyla değerlendirilir
6. Güvenlik veya doğrulama ihtiyacı değerlendirilir
7. En kısa yeterli süre seçilir
8. Süre başlangıcı açıkça tanımlanır
9. Süre sonundaki imha yöntemi belirlenir
10. Teknik otomasyon ve doğrulama hazırlanır
```

Kesin yasal dayanak bulunmadan rastgele `5 yıl`, `10 yıl` veya süresiz saklama kararı verilmeyecektir.

---

## 7. Süre durumları

```text
Kesinleşti       → Hukuki ve teknik olarak doğrulandı
Koşullu          → Teknik hedef belirlendi, hukuk doğrulaması bekleniyor
Karar bekliyor   → Süre henüz belirlenmedi
Hesap yaşamı     → Hesap aktif olduğu sürece, silme veya başka sona erme olayıyla biter
Geçici           → İşlemin tamamlanması için kısa süreli tutulur
```

Bu taslaktaki süre önerileri production için otomatik onay anlamına gelmez.

---

# Veri grupları ve saklama kuralları

## 8. Supabase Auth hesap verileri

### Kapsam

- E-posta adresi
- Auth kullanıcı kimliği
- E-posta doğrulama durumu
- Auth hesap oluşturma ve güncelleme zamanları
- Kimlik doğrulama için gerekli sağlayıcı kayıtları

### Saklama amacı

- Kullanıcı hesabını işletmek
- Giriş ve doğrulama sağlamak
- Şifre sıfırlama sürecini yürütmek
- Hesap durumunu yönetmek

### Süre durumu

```text
Durum: Hesap yaşamı
Başlangıç: Hesap oluşturma
Bitiş: Hesap silme işleminin tamamlanması veya hesabın başka hukuki sebeple kapanması
```

### İmha yöntemi

- Supabase Auth hesabının güvenli yönetici işlemiyle silinmesi
- Aktif oturumların sonlandırılması
- Yedeklerdeki davranışın sağlayıcı şartlarına göre ayrıca uygulanması

### Açık konular

- Auth denetim kayıtlarının ayrı saklama süresi
- Silinen hesabın yedeklerden çıkarılma süresi
- E-posta gönderim hizmetindeki kopyaların silinmesi

---

## 9. Oturum ve yenileme belirteçleri

### Kapsam

- Erişim belirteci
- Yenileme belirteci
- Güvenli oturum bilgisi

### Süre durumu

```text
Durum: Geçici
Başlangıç: Başarılı giriş veya oturum yenileme
Bitiş: Süre dolumu, çıkış, hesap silme, güvenlik iptali veya yenileme başarısızlığı
```

### İmha yöntemi

- Güvenli yerel saklama alanından kaldırma
- Sunucu tarafında oturumu geçersiz kılma
- Kullanıcıya ait yerel önbelleği temizleme

### Kurallar

- Token loglanmaz.
- Uygulama veritabanında normal alan olarak saklanmaz.
- Çıkış sonrası yeniden kullanılabilir kalmamalıdır.
- Başka kullanıcı girişinde önceki oturum verisi görünmemelidir.

---

## 10. Kullanıcı profil verileri

### Kapsam

- Auth kullanıcı kimliğiyle bağlantı
- İsteğe bağlı görünen ad
- Hesap durumu
- Oluşturulma ve güncellenme zamanları

### Süre durumu

```text
Durum: Hesap yaşamı
Başlangıç: Profil oluşturma
Bitiş: Hesap silme işleminin tamamlanması
```

### İmha yöntemi

- `user_profiles` satırının silinmesi
- Bağlantılı önbelleklerin temizlenmesi
- Gerekli teknik silme olayının kişisel veri içermeyecek biçimde kaydı

### İstisna

Yasal uyuşmazlık veya güvenlik olayı nedeniyle sınırlı bir verinin tutulması gerekirse hukuk uzmanı veri alanını, amacı ve azami süreyi ayrıca belirlemelidir.

---

## 11. Kullanıcı tercihleri

### Kapsam

- Tema tercihi
- Dil tercihi
- Para birimi tercihi
- İlgili zaman bilgileri

### Süre durumu

```text
Durum: Hesap yaşamı
Başlangıç: Tercih oluşturma
Bitiş: Hesap silme veya tercihin değiştirilmesi
```

### İmha yöntemi

- `user_preferences` kaydının silinmesi
- Yerel tema ve kullanıcı önbelleğinin temizlenmesi

### Güncelleme davranışı

Eski tercih değerinin geçmiş kopyası tutulmayacaktır, teknik yedekler hariç.

---

## 12. Portföy kayıtları

### Kapsam

- Altın ürünü
- Miktar veya adet
- Alış tarihi
- Ödenen toplam tutar
- İsteğe bağlı alış yeri
- İsteğe bağlı kullanıcı notu
- İşçilik dâhil bilgisi
- Oluşturulma ve güncellenme zamanları

### Süre durumu

```text
Durum: Hesap yaşamı veya kullanıcı kaydı silene kadar
Başlangıç: Portföy kaydının oluşturulması
Bitiş: Kullanıcının kaydı silmesi veya hesabın tamamen silinmesi
```

### İmha yöntemi

- Tek kayıt silme işleminde ilgili `portfolio_entries` satırının silinmesi
- Hesap silmede kullanıcıya ait bütün portföy satırlarının silinmesi
- Yerel portföy önbelleğinin temizlenmesi
- Yedeklerdeki kopyaların sağlayıcı politikasına göre zamanla sona ermesi

### Kurallar

- Silinen kayıt satış geçmişine otomatik dönüştürülmez.
- V1'de silinen portföy kaydının geri dönüşüm kutusu bulunmaz.
- Kullanıcı notu analitik veya hata kayıtlarında tutulmaz.
- Hesaplanan kâr-zarar ana veri olarak kalıcı saklanmaz.

---

## 13. Hesaplanmış portföy değerleri

### Kapsam

- Tahmini güncel bozdurma değeri
- Tahmini kâr veya zarar
- Değişim yüzdesi
- Kısmi toplam durumu

### Süre durumu

```text
Durum: Geçici veya yeniden üretilebilir
```

### Kural

Bu değerler geçerli portföy ve fiyat verisinden yeniden hesaplanır. `portfolio_entries` tablosunda ana gerçek veri olarak saklanmaz.

### İmha yöntemi

- Ekran durumu kapanınca bellekteki değerin bırakılması
- Önbellek kullanılırsa kısa süre sonunda veya kullanıcı değişiminde temizleme

---

## 14. Yasal belge içerikleri

### Kapsam

- KVKK Aydınlatma Metni
- Gizlilik Politikası
- Kullanım Koşulları
- Veri Saklama ve Silme Politikası
- Finansal Bilgilendirme
- Gerekirse Açık Rıza Metni

### Kişisel veri durumu

Belge içerikleri kendi başına kullanıcı kişisel verisi değildir. Ancak sürüm geçmişi hukuki ve operasyonel kayıt niteliğinde olabilir.

### Süre durumu

```text
Durum: Karar bekliyor
Öneri: Yürürlükten kalkan sürümler, kullanıcı olaylarının anlamını koruyacak yeterli süre saklanır
```

### İmha veya arşiv yöntemi

- Aktiflik kaldırılır.
- İçerik sürüm ve hash bilgisi korunabilir.
- Gereksiz taslaklar güvenli biçimde silinir.

Kesin süre hukuk uzmanı tarafından belirlenmelidir.

---

## 15. Kullanıcı yasal olayları

### Kapsam

- Kullanıcı kimliği
- Belge türü
- Belge sürümü
- Olay türü
- Olay zamanı
- Gerekli sınırlı teknik bağlam

### Süre durumu

```text
Durum: Karar bekliyor
Başlangıç: Olay zamanı
Bitiş: Hukuki ispat ihtiyacı, ilgili yükümlülük ve zamanaşımı değerlendirmesine göre
```

### Hesap silme davranışı

Aşağıdaki seçeneklerden biri hukuk uzmanıyla kesinleştirilmelidir:

```text
A. Tam silme
B. Kullanıcı bağlantısını kaldırarak anonimleştirme
C. Belirli hukuki süre boyunca sınırlı ve erişimi kısıtlı saklama
```

### Teknik ve geçici önlem

- Kayıtlar yalnızca güvenli sunucu işlemiyle append-only (sonradan değiştirilemez) olarak oluşturulur.
- `user_legal_events.user_id` alanı hesap silindiğinde anonimleştirme seçeneğini desteklemek üzere `nullable (ON DELETE SET NULL)` olarak tanımlanmıştır.
- Production açılmadan kesin yöntem ve süre belirlenmelidir. Süresiz saklama uygulanmayacaktır.

---

## 16. Hesap silme talepleri

### Kapsam

- Talep kimliği (UUID)
- Kullanıcı kimliği (Silme tamamlandığında `NULL` yapılır / anonimleştirilir)
- Talep zamanı (`requested_at`)
- İşlem durumu (`requested`, `identity_verification_required`, `processing`, `completed`, `failed`, `cancelled`)
- Tamamlanma zamanı (`completed_at`)
- Sınırlı güvenli hata kodu (`failure_code`)

### Süre durumu

```text
Durum: Kesinleşti (ADR-033)
Başlangıç: Talebin tamamlanması (completed_at)
Süre: 3 yıl (Hukuki uyuşmazlık zamanaşımı ve mağaza denetim süresi)
Bitiş: Süre sonunda kaydın veritabanından tamamen silinmesi
```

### İmha yaklaşımı

- İşlem devam ederken gerekli durum alanları güncellenir.
- İşlem tamamlandığında `auth.users` silindiği için `account_deletion_requests.user_id` alanı `ON DELETE SET NULL` ile otomatik olarak `NULL` yapılır; kayıt kimliği belirli/belirlenebilir kişiden tamamen koparılır (anonimleştirilir).
- Kayıt kesinlikle e-posta, isim, parola veya portföy bilgisi içermez (PII içermez).
- Tam hata metni, token veya secret tutulmaz.
- Silme kaydı kullanıcı verisini yeniden oluşturacak hiçbir içerik barındırmaz.

### Çözülen konu

Kısmi başarısızlık telafisi `KI-018` ve `ADR-033` kapsamında atomik PostgreSQL transaction ve ROLLBACK güvencesiyle kesinleştirilmiştir.

---

## 17. Güvenlik olayları

### Kapsam

- Olay türü
- Olay zamanı
- Güvenli hata kodu
- Hassas olmayan takip kimliği
- Gerekirse sınırlı kullanıcı ilişkisi
- Saklama sonu zamanı

### Süre durumu

```text
Durum: Karar bekliyor
Başlangıç: Olay zamanı veya olayın kapanma zamanı
Bitiş: Güvenlik incelemesi, hak tesisi ve hukuki yükümlülük ihtiyacının sona ermesi
```

### Kurallar

- `retention_until` alanı kullanılabilir.
- Şifre, token, API anahtarı ve tam portföy saklanmaz.
- Düşük değerli teknik log ile gerçek güvenlik olayı aynı süreye tabi olmak zorunda değildir.
- İhlal kanıtı gerekiyorsa bütünlük ve erişim kayıtları korunur.

### İmha yöntemi

- Süre sonunda silme
- Kişi bağlantısı gerekmiyorsa erken anonimleştirme
- Toplu istatistik gerekiyorsa geri döndürülemez anonim veri üretme

---

## 18. Fiyat çekme çalışma kayıtları

### Kapsam

- Sağlayıcı
- Başlangıç ve bitiş zamanı
- İşlenen, kaydedilen ve reddedilen ürün sayıları
- Durum ve güvenli hata kodu

### Kişisel veri durumu

Normal tasarımda son kullanıcı kişisel verisi içermemelidir.

### Süre durumu

```text
Durum: Koşullu
Teknik başlangıç hedefi: Kısa operasyonel izleme süresi
Kesin süre: Sağlayıcı, hata inceleme ihtiyacı ve maliyet ölçümü sonrası belirlenecek
```

### Kurallar

- API anahtarı veya gizli header saklanmaz.
- Ham cevap gereksiz yere tutulmaz.
- Sağlayıcı lisansı fiyat verisi saklama süresini etkileyebilir.

---

## 19. Altın fiyatları

### Kapsam

- Ürün kimliği
- Kaynak kimliği
- Alış ve satış fiyatı
- Para birimi ve birim
- Kaynak fiyat zamanı
- Çekilme zamanı
- Geçerlilik durumu

### Kişisel veri durumu

Ortak piyasa verisidir, tek başına kullanıcı kişisel verisi değildir.

### Süre durumu

```text
Durum: Karar bekliyor
```

### Belirleyici etkenler

- Sağlayıcının ticari lisansı
- Saklama ve geçmiş veri hakkı
- Portföy hesaplama gereksinimi
- Teknik hata inceleme ihtiyacı
- Veritabanı maliyeti

### Geçici önlem

Sağlayıcıdan yazılı saklama hakkı alınmadan uzun süreli fiyat geçmişi tutulmayacaktır.

---

## 20. Sağlayıcı ürün eşleştirmeleri

### Kapsam

- Sağlayıcı kimliği
- Altın İz ürün kimliği
- Dış sembol ve ad
- Aktiflik durumu

### Kişisel veri durumu

Kişisel veri değildir.

### Süre durumu

```text
Durum: İş ilişkisi ve teknik denetim ihtiyacı sürdükçe
```

### İmha yaklaşımı

Geçmiş fiyatların anlamını korumak için eşleştirme fiziksel olarak silinmek yerine devre dışı bırakılabilir. Sağlayıcı sözleşmesi başka yükümlülük getirirse ayrıca uygulanır.

---

## 21. E-posta gönderim kayıtları

### Kapsam

- Alıcı e-posta adresi
- İleti türü
- Gönderim zamanı
- Teslimat veya hata durumu
- Sağlayıcı teknik kayıtları

### Süre durumu

```text
Durum: Karar bekliyor
```

### Kurallar

- Doğrulama ve sıfırlama e-postaları pazarlama listesine dönüştürülmez.
- İleti içindeki token ve bağlantılar gereksiz loglanmaz.
- E-posta sağlayıcısının kendi saklama süresi incelenir.
- Başarılı teslimat sonrası gereksiz ayrıntılar mümkün olan en kısa sürede silinir.

### Hizmet seçimi etkisi

Production e-posta hizmeti seçildiğinde bu bölüm sözleşme, veri konumu ve sağlayıcı silme özellikleriyle güncellenmelidir.

---

## 22. Destek kayıtları

### Kapsam

- İletişim bilgisi
- Destek mesajı
- Uygulama sürümü
- Kullanıcının gönüllü gönderdiği ekran görüntüsü
- Çözüm durumu

### Süre durumu

```text
Durum: Karar bekliyor
Başlangıç: Destek talebinin kapanma zamanı
```

### Kurallar

- Kullanıcıdan şifre, token veya API anahtarı istenmez.
- Gereksiz kimlik belgesi istenmez.
- Ekran görüntülerindeki kişisel veriler sınırlanır veya redakte edilir.
- Talep kapandıktan sonra yalnızca gerekli süreyle saklanır.
- Genel hata istatistiği gerekiyorsa anonimleştirilir.

---

## 23. Hata izleme kayıtları

Hata izleme hizmeti V1 için kesinleşmemiştir.

Eklenirse:

```text
Durum: Yeni gizlilik ve saklama değerlendirmesi zorunlu
```

Saklanmaması gerekenler:

- Şifreler
- Tokenlar
- Secret değerler
- Tam portföy
- Kullanıcı notları
- Gereksiz e-posta adresi
- Auth callback parametreleri

Saklama süresi hizmetin varsayılanına bırakılmadan bilinçli biçimde ayarlanmalıdır.

---

## 24. Analitik verileri

V1 için analitik hizmeti kesinleşmemiştir.

Eklenirse:

- Veri minimizasyonu yapılır.
- Reklam kimliği varsayılan olarak kullanılmaz.
- Kullanıcı portföy içeriği analitik olaya yazılmaz.
- Saklama süresi kısa ve amaçla uyumlu belirlenir.
- Kullanıcıyla bağlantılı olmanın gerekli olup olmadığı değerlendirilir.
- `PRIVACY.md`, mağaza beyanları ve bu belge güncellenir.

---

## 25. Yerel mobil önbellek

### Oturum

Çıkış, hesap silme veya güvenlik iptaliyle temizlenir.

### Tema tercihi

Kullanıcı değişiminde veya uygulama verileri temizlendiğinde kaldırılabilir.

### Son fiyat önbelleği

- Kısa süreli tutulur.
- Fiyat zamanı korunur.
- Eski veri açıkça işaretlenir.
- Uygulama sürümü veya veri şeması uyumsuzsa temizlenir.

### Portföy önbelleği

- Gereksizse hiç tutulmaz.
- Kullanılırsa kullanıcıya özel ve sınırlı tutulur.
- Çıkışta, hesap silmede ve kullanıcı değişiminde temizlenir.
- Düz ve korumasız depolamada tutulmaz.

### Yasal belge önbelleği

- Belge sürümü ve hash ile tutulabilir.
- Yeni aktif sürüm geldiğinde eski istemci önbelleği güncellenir.
- Gereksiz sürümler temizlenir.

---

## 26. Development ve test verileri

### Kurallar

- Gerçek kullanıcı verisi Development ortamına kopyalanmaz.
- Gerçek e-posta gerekiyorsa yalnızca proje sahibine ait kontrollü test adresleri kullanılır.
- Test portföy verileri sentetik ve açıkça test verisi olmalıdır.
- Test tamamlandığında gereksiz test hesapları silinir.
- Ekran görüntülerinde gerçek kişisel veri kullanılmaz.
- Test çıktıları ve raporları da saklama politikasına tabidir.

### Süre durumu

```text
Durum: Koşullu
Hedef: Test amacı tamamlandığında mümkün olan en kısa sürede silme
```

Production hatasını yeniden üretmek için veri gerekiyorsa gerçek veri yerine anonim veya sentetik veri kullanılmalıdır.

---

## 27. Git deposu ve belge geçmişi

### Kural

Git geçmişine aşağıdakiler eklenmez:

- Gerçek kullanıcı verisi
- E-posta listeleri
- Portföy kayıtları
- Secret veya token
- Production veritabanı dışa aktarımı
- Redakte edilmemiş hata çıktısı

### Saklama

Kaynak kodu ve teknik belgeler proje yaşamı boyunca saklanabilir. Kişisel veri yanlışlıkla Git geçmişine girerse yalnızca yeni committe silmek yeterli değildir:

1. Secret iptal edilir.
2. Kişisel veri etkisi değerlendirilir.
3. Geçmiş güvenli yöntemle temizlenir.
4. Uzak depo ve kopyalar değerlendirilir.
5. Olay kaydedilir.

---

## 28. Yedekler

Yedekler saklama ve silme politikasının dışında tutulamaz.

### Belirlenecekler

- Yedek sıklığı
- Yedek saklama süresi
- Yedek konumu
- Şifreleme yöntemi
- Erişim rolleri
- Silinen kullanıcının verisinin yedekten ne zaman çıkacağı
- Felaket kurtarma geri yüklemesinde silinmiş verinin yeniden etkinleşmesini önleme yöntemi

### Hesap silme davranışı

Aktif sistemden veri silindikten sonra yedek kopya sağlayıcının döngüsü boyunca sınırlı süre kalabilir. Bu kopya:

- Normal kullanım için geri getirilmemelidir.
- Erişimi sınırlandırılmış olmalıdır.
- Yedek döngüsü sonunda yok edilmelidir.
- Geri yükleme yapılırsa daha önce silinen hesaplar için yeniden silme listesi uygulanmalıdır.

Kesin yedek süresi Supabase şartları ve production sözleşmesi incelendikten sonra yazılmalıdır.

---

## 29. Üçüncü taraf sistemlerde silme

Bir kullanıcının hesabı silindiğinde yalnızca ana PostgreSQL satırlarını silmek yeterli olmayabilir.

Kontrol edilecek sistemler:

- Supabase Auth
- PostgreSQL
- Edge Function logları
- E-posta hizmeti
- Hata izleme hizmeti
- Analitik hizmeti
- Destek sistemi
- Yedekler
- Yerel mobil önbellek

Her hizmet için:

```text
Silme API'si var mı?
Saklama süresi ayarlanabiliyor mu?
Yedeklerden silme davranışı nedir?
Alt işleyenler kimdir?
Silme talebi doğrulanabiliyor mu?
```

soruları cevaplanmalıdır.

---

## 30. Periyodik imha planı

### Durum

```text
Karar bekliyor
```

### Taslak yaklaşım

- Periyodik imha aralığı hukuk uzmanı ve operasyon kapasitesiyle belirlenir.
- İşleme şartının sona erdiği tarih kaydedilir.
- Bir sonraki uygun periyodik imha çalışmasında veri işlenir.
- Acil silme gerektiren durumlar periyodik takvimi beklemez.
- Başarısız imha işlemleri yeniden denenir ve takip edilir.

### Periyodik görev örnekleri

- Süresi dolmuş güvenlik olaylarını bulma
- Tamamlanmış silme taleplerini anonimleştirme
- Süresi dolmuş destek kayıtlarını silme
- Eski yerel veya sunucu önbelleklerini temizleme
- Kullanılmayan test hesaplarını silme
- Süresi dolmuş teknik logları temizleme

Kesin periyodik imha aralığı production öncesinde belirlenmelidir.

---

## 31. Anında veya olay bazlı imha

Aşağıdaki durumlarda periyodik imha beklenmeden işlem gerekebilir:

- Secret sızıntısı
- Yanlışlıkla işlenen gereksiz kişisel veri
- Hukuka aykırı işleme tespiti
- Kullanıcı hesabının doğrulanmış silme işlemi
- Güvenlik nedeniyle oturumların iptali
- Yanlış kullanıcıya ait yerel önbellek
- Production ortamına yanlışlıkla eklenen test kişisel verisi

Hukuki saklama zorunluluğu varsa bu zorunluluk ayrıca değerlendirilir.

---

## 32. İmha yöntemleri

### 32.1. Veritabanından silme

- Yetkili sunucu işlemi veya kontrollü sorgu kullanılır.
- RLS ve yönetici yetkileri doğru uygulanır.
- Bağlı kayıtlar ve yabancı anahtarlar değerlendirilir.
- İşlem sonucu doğrulanır.

### 32.2. Mobil cihazdan silme

- Güvenli storage kaydı kaldırılır.
- Kullanıcıya ait önbellek temizlenir.
- Navigasyon geçmişi temizlenir.
- Yeni oturumda eski veri görünmediği test edilir.

### 32.3. Bulut hizmetinden silme

- Sağlayıcının resmî silme yöntemi kullanılır.
- Silme sonucu veya talep kimliği güvenli biçimde kaydedilir.
- Alt işleyen ve yedek davranışı doğrulanır.

### 32.4. Yok etme

Geri döndürülemeyen silme gerektiğinde veri ve anahtarların tekrar erişilemez olması sağlanır. Şifreli ortamda uygun anahtar imhası yöntemi sağlayıcı kabiliyetlerine göre değerlendirilebilir.

### 32.5. Anonimleştirme

Anonim veri:

- Kullanıcı kimliğiyle ilişkilendirilememelidir.
- Başka veri kümeleriyle eşleştirilerek geri döndürülememelidir.
- Sadece UUID silmekle anonim sayılmamalıdır.
- Küçük gruplarda dolaylı tanımlama riski değerlendirilmelidir.

---

## 33. İmha doğrulaması

Her kritik imha işleminde mümkün olduğunca şu kontroller yapılır:

- Ana tabloda kayıt bulunmuyor.
- Bağlı tablolarda gereksiz kayıt bulunmuyor.
- Supabase Auth hesabı erişemiyor.
- Aktif oturumlar çalışmıyor.
- Yerel önbellek temizlenmiş.
- Başka kullanıcı etkilenmemiş.
- Gerekli yasal kayıt doğru yöntemle korunmuş veya anonimleştirilmiş.
- İşlem teknik olarak tamamlanmadan başarı mesajı gösterilmemiş.

İmha doğrulama kaydı, silinen kişisel verinin kendisini içermemelidir.

---

## 34. İmha kayıtları

İmha sürecini denetlemek için sınırlı kayıt tutulabilir:

```text
İşlem kimliği
Veri kategorisi
İmha yöntemi
İşlem zamanı
Başarı veya güvenli hata kodu
Yetkili işlem türü
Saklama sonu tarihi
```

Tutulmaması gerekenler:

- Silinen portföyün tam içeriği
- Şifre veya token
- Silinen kullanıcı notu
- Secret değerler
- Gereksiz tam e-posta adresi

İmha kayıtlarının kendi saklama süresi ayrıca belirlenmelidir.

---

## 35. Hukuki saklama veya silmeyi durdurma

Nadir durumlarda hukuki uyuşmazlık, yetkili kurum talebi veya hakkın tesisi amacıyla belirli veriler geçici olarak saklanabilir.

Kurallar:

- Karar yetkili kişi ve hukuk uzmanı tarafından verilir.
- Saklama kapsamı en az veriyle sınırlandırılır.
- Normal kullanıma kapatılır.
- Erişimler kaydedilir.
- Başlangıç ve yeniden değerlendirme tarihi belirlenir.
- Gerekçe sona erdiğinde imha süreci devam eder.

Genel ve süresiz `legal hold` uygulanmaz.

---

## 36. Veri sahibi silme talepleri

Kullanıcı uygulama içinden hesabını ve ilişkili verilerini silme işlemini başlatabilir.

### Süreç

```text
1. Kullanıcı oturumu doğrulanır
2. Yeniden kimlik doğrulama yapılır
3. Talep kaydı oluşturulur
4. Hesap deletion_pending olur
5. Portföy ve tercihler silinir
6. Yasal ve güvenlik kayıtları politikaya göre işlenir
7. Profil ve Auth hesabı silinir
8. Oturumlar ve yerel önbellek temizlenir
9. Sonuç doğrulanır
10. Kullanıcı bilgilendirilir
```

### Kurallar

- Kullanıcı kimliği istek gövdesinden güven kaynağı olarak alınmaz.
- Başka kullanıcı hesabı silinemez.
- İşlem yarıda kalırsa başarı gösterilmez.
- Tekrar yürütme güvenli ve mümkün olduğunca idempotent olmalıdır.
- Saklanan veri varsa türü, amacı ve süresi açıklanmalıdır.

---

## 37. Hesap silme sonrası saklanabilecek sınırlı veriler

Bu bölüm ADR-033 teknik tasarımı uyarınca kesinleştirilmiştir:

### Fiziksel Olarak Silinen (Purged) Tablolar:
- `public.portfolio_entries`: Portföy altın kayıtları, adet, fiyat ve alış tarihleri geri getirilemez biçimde silinir (`DELETE`).
- `public.user_preferences`: Kullanıcı tema ve ayar tercihleri silinir (`DELETE`).
- `public.user_profiles`: Görünen ad, avatar baş harfleri ve profil kaydı silinir (`DELETE`).
- `auth.users`: Supabase kimlik kaydı ve tüm oturum belirteçleri silinir (`DELETE`).

### Anonimleştirilerek Saklanan Sınırlı Tablolar:
- `public.user_legal_events`: Hukuki ispat (KVKK md. 5, 10, 11) gereğince sözleşme/politika sürümleri ve onay/görüntüleme tarihleri saklanır; `user_id` alanı `NULL` yapılarak kimliği belirli/belirlenebilir kişiyle bağlantısı tamamen koparılır (anonimleştirilir).
- `public.security_events`: Bilgi güvenliği denetimleri (KVKK md. 12) gereğince 1 yıl saklanır; `user_id` alanı `NULL` yapılır.
- `public.account_deletion_requests`: Silme talebinin kanıtı olarak 3 yıl saklanır; `user_id` alanı `NULL` yapılır; hiçbir kişisel veri (PII: e-posta, isim, parola, portföy detayı) İÇERMEZ.

### Kesinlikle Tutulmayanlar:
- Aktif profil veya görünen ad
- Portföy altın kayıtları ve işlem tutarları
- Kullanıcı notları veya tercihleri
- Aktif oturumlar veya yenileme belirteçleri (refresh tokens)

---

## 38. Veri geri yükleme ve felaket kurtarma

Bir yedekten geri yükleme yapılırsa daha önce silinmiş veriler yanlışlıkla geri dönebilir.

Koruma planı:

1. Silme talepleri için güvenli tombstone veya yeniden silme listesi yaklaşımı değerlendirilir.
2. Yedek geri yüklemesi sonrası silinmiş hesap kontrolü yapılır.
3. Aktif oturumlar ve Auth durumu karşılaştırılır.
4. Kullanıcının silinmiş hesabı tekrar erişilebilir hâle gelmez.
5. Geri yükleme işlemi test ortamında doğrulanır.

Bu mekanizma hesap silme teknik tasarımında kesinleştirilmelidir.

---

## 39. Roller ve sorumluluklar

Production öncesinde gerçek kişiler belirlenmelidir.

### Veri sorumlusu

- Saklama amaçlarını ve sürelerini onaylar.
- Hukuki yükümlülükleri takip eder.
- İmha politikasının uygulanmasını sağlar.

### Teknik sorumlu

- Silme otomasyonlarını geliştirir.
- RLS ve erişim kontrollerini uygular.
- Yedek ve geri yükleme davranışını test eder.
- İmha başarısızlıklarını takip eder.

### Güvenlik sorumlusu

- Güvenlik olaylarının saklama ihtiyacını belirler.
- Secret sızıntısı ve ihlal süreçlerini yönetir.
- Erişim kayıtlarını inceler.

### Hukuk danışmanı

- Hukuki sebepleri ve süreleri doğrular.
- Aktarım ve silme yükümlülüklerini değerlendirir.
- Nihai metinleri inceler.

Tek kişi birden fazla rolü üstlense bile görevler belgede ayrı tutulmalıdır.

---

## 40. Teknik otomasyon gereksinimleri

Production için değerlendirilecek otomasyonlar:

- `retention_until` tarihi dolan güvenlik kayıtlarını bulma
- Süresi dolmuş destek kayıtlarını silme
- Tamamlanmış hesap silme kayıtlarını anonimleştirme
- Eski fiyat geçmişini lisans ve süreye göre temizleme
- Eski `price_fetch_runs` kayıtlarını temizleme
- Kullanılmayan test hesaplarını raporlama
- Başarısız imha işlemleri için uyarı üretme

Otomasyon:

- Önce Development ortamında test edilir.
- Yanlış kullanıcı verisini silmeye karşı sınırlandırılır.
- Toplu işlem öncesi hedef kayıt sayısını raporlar.
- İşlem sonucunu doğrular.
- Secret veya kişisel içeriği loglamaz.

---

## 41. Test gereksinimleri

### Hesap silme testleri

- Tek kullanıcı hesabı silinir.
- Başka kullanıcı etkilenmez.
- Portföy kayıtları silinir.
- Tercihler silinir.
- Profil silinir.
- Auth hesabı silinir.
- Oturumlar kapatılır.
- Yerel önbellek temizlenir.
- İşlem yarıda kalırsa başarı dönmez.
- Tekrar deneme güvenli çalışır.

### Periyodik imha testleri

- Süresi dolmayan kayıt silinmez.
- Süresi dolan kayıt doğru yöntemle işlenir.
- Farklı veri kategorileri karışmaz.
- Başarısız işlem takip edilir.
- İmha kaydı kişisel içeriği kopyalamaz.

### Yedek testleri

- Geri yükleme sonrası silinmiş hesap tekrar aktif olmaz.
- Yeniden silme listesi uygulanır.
- Yedek erişimleri sınırlandırılır.

### Mobil testler

- Android çıkış sonrası veri temizliği
- iOS çıkış sonrası veri temizliği
- Kullanıcı değişiminde veri ayrılığı
- Hesap silme sonrası uygulama geçmişi

---

## 42. Production öncesi kontrol listesi

- [ ] Veri sorumlusu ve roller belirlendi.
- [ ] VERBİS yükümlülüğü değerlendirildi.
- [ ] Veri envanteri `PRIVACY.md` ile karşılaştırıldı.
- [ ] Her veri kategorisinin amacı belirlendi.
- [ ] Her veri kategorisinin hukuki sebebi doğrulandı.
- [ ] Her veri kategorisinin süre başlangıcı belirlendi.
- [ ] Her veri kategorisinin azami süresi belirlendi.
- [ ] Her veri kategorisinin imha yöntemi belirlendi.
- [ ] Periyodik imha aralığı belirlendi.
- [ ] Supabase yedek süresi doğrulandı.
- [ ] Supabase Auth silme davranışı doğrulandı.
- [ ] E-posta sağlayıcısı saklama süresi doğrulandı.
- [ ] Hata izleme kullanılıyorsa saklama ayarı yapıldı.
- [ ] Analitik kullanılıyorsa saklama ayarı yapıldı.
- [ ] Destek kayıtlarının süresi belirlendi.
- [ ] Fiyat sağlayıcısı saklama lisansı doğrulandı.
- [ ] Hesap silme kısmi hata telafisi test edildi.
- [ ] Aktif sistem ve yedek silme farkı kullanıcıya açıklandı.
- [ ] Otomatik imha görevleri test edildi.
- [ ] İmha kayıtlarının süresi belirlendi.
- [ ] Hukuk uzmanı belgeyi inceledi.
- [ ] Nihai kullanıcı metinleri güncellendi.

---

## 43. Açık kararlar

1. Kişisel veri saklama ve imha politikası hazırlama yükümlülüğünün kesin kapsamı
2. Periyodik imha aralığı
3. Supabase Auth kayıtlarının silme sonrası teknik davranışı
4. Supabase yedek saklama süresi
5. Yedeklerden kullanıcı verisinin çıkma süresi
6. Yasal belge sürümlerinin saklama süresi
7. Kullanıcı yasal olaylarının saklama süresi
8. Hesap silme talebi kayıtlarının saklama süresi
9. Güvenlik olaylarının kategori bazlı saklama süreleri
10. Fiyat çekme çalışma kayıtlarının saklama süresi
11. Altın fiyat geçmişinin lisanslı saklama süresi
12. E-posta gönderim kayıtlarının saklama süresi
13. Destek kayıtlarının saklama süresi
14. Hata izleme kayıtlarının saklama süresi
15. Analitik kayıtlarının saklama süresi
16. İmha doğrulama kayıtlarının saklama süresi
17. Hukuki saklama uygulamasının yetkilisi
18. Yedek geri yükleme sonrası yeniden silme mekanizması
19. Anonimleştirme tekniklerinin kesin seçimi
20. Kullanıcıya hesap silme tamamlanma süresinin nasıl bildirileceği

Bu kararlar kesinleşmeden production veri saklama uygulaması tamamlanmış sayılmaz.

---

## 44. İlgili bilinen sorunlar

```text
KI-002 → Yurt dışına kişisel veri aktarımı
KI-003 → Fiyat sağlayıcısı ticari kullanım ve saklama hakkı
KI-018 → Hesap silme kısmi hata telafisi
KI-019 → Yasal ve güvenlik kayıtlarının saklama süreleri
KI-025 → Hukuk uzmanı onaylı yasal metinler
KI-026 → Mağaza gizlilik beyanları
```

Ayrıntılar `KNOWN_ISSUES.md` içinde tutulur.

---

## 45. Resmî başvuru kaynakları

Bu taslak hazırlanırken başvurulan resmî kaynaklar:

- Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik: https://www.kvkk.gov.tr/Icerik/5441/KISISEL-VERILERIN-SILINMESI-YOK-EDILMESI-VEYA-ANONIM-HALE-GETIRILMESI-HAKKINDA-YONETMELIK
- KVKK, Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi: https://www.kvkk.gov.tr/Icerik/2038/kisisel-verilerin-silinmesi-yok-edilmesi-veya-anonim-hale-getirilmesi
- KVKK Kişisel Veri Saklama ve İmha Politikası duyurusu: https://www.kvkk.gov.tr/Icerik/5387/KVKK-Kisisel-Veri-Saklama-ve-Imha-Politikasi

Mevzuat ve sağlayıcı şartları production öncesinde güncel kaynaklardan yeniden kontrol edilmelidir.

---

## 46. İlgili proje belgeleri

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
docs/PRIVACY.md
.github/copilot-instructions.md
```

Bir saklama süresi veya imha yöntemi değişirse en az şu belgeler birlikte incelenir:

```text
DATA_RETENTION.md
PRIVACY.md
SECURITY.md
DATABASE.md
API.md
DECISIONS.md
CHANGELOG.md
```

---

## 47. Belge güncelleme kuralları

Bu belge aşağıdaki durumlarda güncellenmelidir:

- Yeni veri kategorisi eklenirse
- Veri işleme amacı değişirse
- Hukuki sebep değişirse
- Saklama süresi kesinleşirse veya değişirse
- Yeni üçüncü taraf hizmet eklenirse
- Yedek politikası değişirse
- Hesap silme akışı değişirse
- Yeni log veya analitik sistemi eklenirse
- Fiyat sağlayıcısı lisansı değişirse
- Periyodik imha aralığı değişirse
- Hukuk uzmanı görüşü alınırsa
- Güvenlik olayı yaşanırsa
- Production ortamı oluşturulursa

Değişiklik `CHANGELOG.md` içinde kaydedilmeli, önemli karar değişikliği `DECISIONS.md` içine eklenmelidir.

---

## 48. Sürüm geçmişi

### 1.2 Taslak - 26.10.2026

- Dış denetim bulguları doğrultusunda saklama süreleri ve Model A silme mimarisi kilitlendi:
  - `security_events`: 1 yıl (5651 Sayılı Kanun gereğince; `user_id = NULL`).
  - `user_legal_events`: 3 yıl (zamanaşımı ve ispat yükümlülüğü; `user_id = NULL`).
  - `account_deletion_requests`: 3 yıl (denetim ispatı; `user_id = NULL`).
  - `gold_prices` ve `price_fetch_runs`: 30 gün (`cleanup_old_data` RPC ile periyodik temizlik).
  - Model A silme mimarisi (Edge Function işlem dışı yönetim + atomik execute_account_deletion RPC) eşitlendi.

### 1.1 Taslak - 22.10.2026

- Bölüm 18 Hesap ve veri silme (Faz 12) kapsamında ADR-033 kararları işlendi.
- Bölüm 16 (Hesap silme talepleri) durumu Kesinleşti (ADR-033) olarak güncellendi; 3 yıllık saklama süresi belirlendi.
- Bölüm 37 (Hesap silme sonrası saklanabilecek sınırlı veriler) kesinleştirildi; fiziksel silinen ve anonimleştirilen tablolar netleştirildi.
- KI-018 kısmi hata telafisi konusu atomik transaction ve rollback yaklaşımıyla çözüldü.

### 1.0 Taslak - 03.09.2026

- Saklama ve imha ilkeleri tanımlandı.
- Kayıt ortamları ve süre belirleme yöntemi eklendi.
- Auth, oturum, profil, tercih ve portföy verileri için kurallar oluşturuldu.
- Yasal olay, hesap silme ve güvenlik kayıtları için açık kararlar belirlendi.
- Fiyat, teknik çalışma, e-posta, destek, hata izleme ve analitik verileri ele alındı.
- Mobil önbellek, test verisi, Git ve yedek kuralları tanımlandı.
- Üçüncü taraf sistemlerde silme kontrolü eklendi.
- Periyodik ve olay bazlı imha yaklaşımı oluşturuldu.
- Silme, yok etme ve anonimleştirme yöntemleri açıklandı.
- İmha doğrulama ve kayıt ilkeleri eklendi.
- Hesap silme, hukuki saklama ve felaket kurtarma taslağı oluşturuldu.
- Teknik otomasyon ve test gereksinimleri eklendi.
- Production kontrol listesi, açık kararlar ve resmî kaynaklar eklendi.
