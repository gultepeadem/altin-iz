# Altın İz V1 Yapılacaklar Listesi

**Belge adı:** `TODO.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.13 Taslak  
**Son güncelleme:** 22.10.2026  
**Proje aşaması:** Bölüm 10 (Supabase development altyapısı) tamamlandı; Bölüm 11 (Supabase JS SDK ve oturum yönetimi - Faz 5) sıradaki  
**Kodlama durumu:** RLS politikaları ve güvenlik testleri (16 senaryo) başarıyla doğrulandı

---

## 1. Belgenin amacı

Bu belge, Altın İz V1 projesindeki bütün işleri doğru sıraya koyar ve ilerlemeyi takip eder.

Her görev mümkün olduğunca:

- Küçük
- Tek amaçlı
- Test edilebilir
- Geri alınabilir
- Android ve iOS açısından değerlendirilebilir
- Güvenlik ve gizlilik etkisi kontrol edilebilir

olmalıdır.

Bu dosya yalnızca yapılacak işleri listelemez. Bir görevin ne zaman tamamlanmış sayılacağını da belirtir.

---

## 2. Görev durumları

```text
[ ] Başlanmadı
[~] Devam ediyor
[x] Tamamlandı ve doğrulandı
[!] Engellendi
[-] V1 kapsamından çıkarıldı
```

### Durum kuralları

- Test edilmemiş görev `[x]` yapılmaz.
- Yalnızca kod yazılması görevin tamamlandığı anlamına gelmez.
- Android testi gereken görev Android'de denenmeden tamamlanmaz.
- iOS etkisi kontrol edilmeden platformlar arası görev tamamlanmaz.
- Güvenlik görevi yalnızca arayüz kontrolüyle tamamlanmaz.
- Engellenen görevin nedeni `KNOWN_ISSUES.md` veya görev altındaki notta belirtilir.
- V1 kapsamından çıkarılan görev silinmez, `[-]` olarak işaretlenir.

---

## 3. Görev öncelikleri

```text
P0 → Projeyi engelleyen veya güvenlik açısından zorunlu
P1 → V1 için zorunlu
P2 → V1 için yararlı, ancak başka görevden sonra yapılabilir
P3 → V2 veya daha sonraki sürüm
```

---

## 4. Her görevde uygulanacak çalışma döngüsü

```text
1. İlgili proje belgelerini oku
2. Mevcut durumu kontrol et
3. Değişecek dosyaları belirle
4. Riskleri açıkla
5. Git durumunu kontrol et
6. Güvenli geri dönüş noktası oluştur
7. Tek ve küçük değişiklik yap
8. Dosyaları kaydet
9. İlgili testleri çalıştır
10. Android etkisini kontrol et
11. iOS etkisini kontrol et
12. Güvenlik etkisini kontrol et
13. Gizlilik etkisini kontrol et
14. Belgeleri güncelle
15. Çalışan sürümü Git'e kaydet
16. HANDOFF.md dosyasını güncelle
```

---

# 5. Şu anda yapılacaklar

## Faz 0: Başlangıç dokümantasyonunu tamamlama

### P0 görevleri

- [x] `PROJECT_CONTEXT.md` taslağını hazırla.
- [x] `ARCHITECTURE.md` taslağını hazırla.
- [x] `DATABASE.md` taslağını hazırla.
- [x] `DATABASE.md` içine `price_source_product_mappings` tablosunu ekle.
- [x] `API.md` taslağını hazırla.
- [x] `DECISIONS.md` taslağını hazırla.
- [x] `TODO.md` taslağını hazırla.
- [x] `CHANGELOG.md` taslağını hazırla.
- [x] `KNOWN_ISSUES.md` taslağını hazırla.
- [x] `HANDOFF.md` taslağını hazırla.
- [x] `SECURITY.md` taslağını hazırla.
- [x] `PRIVACY.md` taslağını hazırla.
- [x] `DATA_RETENTION.md` taslağını hazırla.
- [x] `.github/copilot-instructions.md` dosyasını hazırla.
- [x] `README.md` taslağını hazırla.
- [x] 14 başlangıç belgesinin çapraz tutarlılık denetimini tamamla.

### Tamamlanma şartı

- Bütün başlangıç belgeleri mevcut olmalı.
- Belgelerdeki proje adı, V1 kapsamı ve teknoloji kararları birbiriyle uyumlu olmalı.
- Belgelerde çelişen tablo, alan, rota veya hesaplama kuralı bulunmamalı.
- `PROJECT_CONTEXT.md`, tamamlanan belgeleri ve sıradaki görevi doğru göstermeli.

---

## Faz 0.1: Belgeler arası tutarlılık kontrolü

- [x] `PROJECT_CONTEXT.md` ile `DECISIONS.md` kararlarını karşılaştır.
- [x] `ARCHITECTURE.md` klasör yapısını `PROJECT_CONTEXT.md` ile karşılaştır.
- [x] `DATABASE.md` tablo listesini `API.md` ile karşılaştır.
- [x] `price_source_product_mappings` tablosunun `DATABASE.md` ve `API.md` içinde aynı alanlara sahip olduğunu kontrol et.
- [x] Portföy hesaplama formüllerinin bütün belgelerde aynı olduğunu kontrol et.
- [x] Satın alma hesabında satış fiyatı kullanıldığını bütün belgelerde doğrula.
- [x] Bozdurma ve portföy hesabında alış fiyatı kullanıldığını bütün belgelerde doğrula.
- [x] Fiyat bulunamadığında `0 TL` kullanılmadığını bütün belgelerde doğrula.
- [x] Eski fiyat davranışının bütün belgelerde aynı olduğunu kontrol et.
- [x] V1 kapsam dışı özelliklerin belgeler arasında tutarlı olduğunu kontrol et.
- [x] Android ve iOS zorunluluğunun bütün ana belgelerde bulunduğunu kontrol et.
- [x] Hazırlanan belgelerin sürüm numaralarını kaydet.
- [x] `README.md` V1 kapsam dışı özellikler listesini `PROJECT_CONTEXT.md` ve ADR-022 ile karşılaştır.
- [x] `README.md` kapsam dışı özellikler listesine altın haberleri ve yapay zekâ fiyat tahminini ekle.
- [x] `README.md` gizlilik özetini `PRIVACY.md` ile karşılaştır.
- [x] `README.md` toplanmayacak veriler listesine açık adresi ekle.
- [x] `README.md` portföy özetini `DATABASE.md` ve `API.md` ile karşılaştır.
- [x] `README.md` portföy özetine isteğe bağlı işçilik dâhil bilgisini ekle.
- [x] V1 kapsamı için bağlayıcı belge sırasını `README.md` içinde açıkla.
- [x] `KNOWN_ISSUES.md` içinde KI-100 numaralandırma yaklaşımını açıkla.
- [x] Üçüncü çapraz denetim sonucunu KI-032 olarak kaydet.
- [x] Üçüncü çapraz denetim değişikliklerini `CHANGELOG.md` ve `HANDOFF.md` içine işle.

### Tamamlanma şartı

- Belge çelişkileri düzeltilmiş olmalı.
- Yapılan belge değişiklikleri `CHANGELOG.md` içine yazılmış olmalı.
- Büyük karar değişiklikleri `DECISIONS.md` içinde kayıtlı olmalı.

---

# 6. Karar verilmesi gereken işler

Bu bölümdeki Faz 0.2-0.4 araştırmaları, geliştirme ortamı hazırlığıyla paralel yürütülebilir. Sıradaki operasyonel görev 7. bölümdeki Faz 1'dir.

## Faz 0.2: Supabase ve veri konumu kararları (Paralel / Yayın Öncesi Araştırma)

### P0 görevleri

- [ ] Supabase'in güncel proje bölgesi seçeneklerini araştır.
- [ ] Türkiye'ye teknik olarak yakın bölge seçeneklerini listele.
- [ ] Bölge seçiminin sonradan değiştirilip değiştirilemediğini doğrula.
- [ ] Supabase veri işleme sözleşmesini incele.
- [ ] Kullanılan alt hizmet sağlayıcıları incele.
- [ ] Yedeklerin hangi bölgede tutulduğunu araştır.
- [ ] Verilerin yurt dışına aktarım durumunu belirle.
- [ ] KVKK açısından hukuk uzmanına sorulacak soruları hazırla.
- [ ] Development Supabase projesi için önerilen bölgeyi belirle.
- [!] Production bölgesi ve KVKK yurt dışı aktarım yöntemi kesinleşene kadar production projesi oluşturma (`KI-001`, `KI-002`).
- [ ] Development bölge kararını `DECISIONS.md` içine ekle.
- [!] Production veri aktarımı sonucunu hukuk değerlendirmesi sonrası `PRIVACY.md` içine ekle (`KI-002`).

### Tamamlanma şartı

- Seçilecek bölgenin teknik ve hukuki etkisi belgelenmiş olmalı.
- Rastgele bir production bölgesi seçilmemiş olmalı.
- Karar `DECISIONS.md` içinde yeni ADR kaydıyla bulunmalı.

---

## Faz 0.3: Fiyat sağlayıcısı doğrulaması (Paralel / Yayın Öncesi Araştırma)

### P0 görevleri

- [ ] AltinAPI ücretsiz test hesabı oluştur.
- [ ] Gerçek API anahtarını yalnızca güvenli geçici ortamda sakla.
- [ ] Gerçek `/prices` yanıtını al.
- [ ] Gerçek sembol listesini al.
- [ ] Yanıt örneğini gizli anahtar olmadan teknik belgeye ekle.
- [ ] Alış alanının kullanıcıdan alış fiyatı olduğunu doğrula.
- [ ] Satış alanının kullanıcıya satış fiyatı olduğunu doğrula.
- [ ] Zaman damgası biçimini doğrula.
- [ ] Para birimlerini doğrula.
- [ ] Ürünlerin adet, gram veya ons birimlerini doğrula.
- [ ] Eski veri göstergesinin gerçek davranışını test et.
- [ ] 401 hata davranışını test et.
- [ ] 403 hata davranışını test et.
- [ ] 429 kota hata davranışını test et.
- [ ] 503 veya kaynak kesintisi davranışını doğrula.

### Ürün eşleştirme görevleri

- [ ] Gram Altın sembolünü doğrula.
- [ ] Çeyrek Altın, Yeni Tarihli sembolünü doğrula.
- [ ] Çeyrek Altın, Eski Tarihli sembolünü doğrula.
- [ ] Yarım Altın, Yeni Tarihli sembolünü doğrula.
- [ ] Yarım Altın, Eski Tarihli sembolünü doğrula.
- [ ] Tam Altın, Yeni Tarihli sembolünü doğrula.
- [ ] Tam Altın, Eski Tarihli sembolünü doğrula.
- [ ] Ata Altın, Yeni Tarihli sembolünü doğrula.
- [ ] Ata Altın, Eski Tarihli sembolünü doğrula.
- [ ] Gremse Altın, Yeni Tarihli sembolünü doğrula.
- [ ] Gremse Altın, Eski Tarihli sembolünü doğrula.
- [ ] 14 Ayar Altın sembolünü doğrula.
- [ ] 22 Ayar Altın sembolünü doğrula.
- [ ] 18 Ayar Altın desteğini doğrula veya devre dışı bırak.
- [ ] Cumhuriyet Altını ile Ata Altını arasındaki ürün ilişkisini yazılı doğrula.
- [ ] Reşat Altını desteğini doğrula veya devre dışı bırak.
- [ ] Hamit Altını desteğini doğrula veya devre dışı bırak.
- [ ] 1 Gram Paketli Altın desteğini doğrula veya devre dışı bırak.
- [ ] 2,5 Gram Paketli Altın desteğini doğrula veya devre dışı bırak.
- [ ] 5 Gram Paketli Altın desteğini doğrula.
- [ ] 10 Gram Paketli Altın desteğini doğrula.
- [ ] 20 Gram Paketli Altın desteğini doğrula.
- [ ] 50 Gram Paketli Altın desteğini doğrula.
- [ ] 100 Gram Paketli Altın desteğini doğrula.
- [ ] Ons Altın sembolünü ve para birimini doğrula.

### Ticari ve hukuki görevler (Production yayını için `KI-003` kapsamında sağlayıcı yanıtı bekliyor)

- [!] Mobil uygulamada fiyatları son kullanıcılara göstermeye izin verilip verilmediğini yazılı sor (`KI-003`).
- [!] Google Play ve App Store'da yayımlamaya izin verilip verilmediğini yazılı sor (`KI-003`).
- [!] Fiyatları Supabase veritabanında saklamaya izin verilip verilmediğini yazılı sor (`KI-003`).
- [!] Geçmiş fiyatların ne kadar süre saklanabileceğini yazılı sor (`KI-003`).
- [!] Portföy ve kâr-zarar hesabında fiyatları kullanma hakkını yazılı sor (`KI-003`).
- [ ] Kaynak adını göstermenin zorunlu olup olmadığını yazılı sor.
- [ ] Ücretsiz, Starter ve Pro paketlerin ticari kullanım farkını yazılı sor.
- [ ] Fatura ve ödeme koşullarını öğren.
- [ ] Hizmet sonlandırıldığında saklanan fiyatların durumunu öğren.
- [ ] Gelen yazılı cevapları proje belgelerinde özetle.

### Yedek sağlayıcı görevleri

- [ ] Altinapps güncel dokümantasyonunu tekrar doğrula.
- [ ] Altinapps gerçek sembol kapsamını doğrula.
- [ ] Altinapps ticari kullanım şartlarını öğren.
- [ ] Birincil sağlayıcı başarısız olursa geçiş maliyetini değerlendir.
- [ ] V1'de otomatik yedek geçiş yapılıp yapılmayacağına karar ver.

### Tamamlanma şartı

- Üretimde kullanılabilecek ürün listesi kesinleşmiş olmalı.
- Ürün-sembol eşleştirmeleri tahminle yapılmamış olmalı.
- Ticari kullanım ve saklama şartları yazılı olarak doğrulanmış olmalı.
- `API.md`, `DATABASE.md`, `PROJECT_CONTEXT.md` ve `DECISIONS.md` güncellenmiş olmalı.

---

## Faz 0.4: Marka ve teknik kimlik doğrulaması (Paralel / Yayın Öncesi Araştırma)

- [ ] `Altın İz` adına ilişkin Türk Patent ve Marka Kurumu araştırması yap.
- [ ] Google Play'de aynı veya karıştırılabilir adı araştır.
- [ ] App Store'da aynı veya karıştırılabilir adı araştır.
- [ ] Alan adı uygunluğunu araştır.
- [ ] Sosyal medya kullanıcı adlarını araştır.
- [ ] Android uygulama kimliği adaylarını oluştur.
- [ ] iOS bundle identifier adaylarını oluştur.
- [ ] Teknik kimliklerin başka uygulamalarla çakışmadığını kontrol et.
- [ ] Marka adı uygun değilse yedek isimleri değerlendir.
- [ ] Kesin marka kararını `DECISIONS.md` içine yaz.

### Mevcut geçici teknik adlar

```text
Proje klasörü: altin-iz
Görünen ad: Altın İz
Geçici Android kimliği: Belirlenmedi
Geçici iOS kimliği: Belirlenmedi
```

---

# 7. Geliştirme ortamı hazırlığı

## Faz 1: Bilgisayarın mevcut durumunu kontrol etme

### P0 görevleri

- [x] Bilgisayarın işletim sistemini ve sürümünü belirle.
- [x] Bilgisayarın 64 bit olup olmadığını kontrol et.
- [x] Kullanılabilir disk alanını kontrol et.
- [x] Visual Studio Code kurulu mu kontrol et.
- [x] Node.js kurulu mu kontrol et.
- [x] Node.js sürümünü kontrol et.
- [x] npm sürümünü kontrol et.
- [x] Git kurulu mu kontrol et.
- [x] Git sürümünü kontrol et.
- [x] GitHub hesabı var mı kontrol et.
- [x] Expo hesabı var mı kontrol et.
- [x] Supabase hesabı var mı kontrol et.
- [x] Android fiziksel test telefonunu belirle.
- [x] Telefon ve bilgisayarın aynı ağa bağlanabildiğini kontrol et.
- [x] iOS test yöntemi için erişilebilir cihazları belirle.

### Tamamlanma şartı

- Eksik araçlar listelenmiş olmalı.
- Mevcut sürümler kaydedilmiş olmalı.
- Kurulum sırası belirlenmiş olmalı.
- Henüz gerekmeyen Android Studio veya başka ağır araçlar kurulmamış olmalı.

---

## Faz 1.1: Visual Studio Code kurulumu

- [x] Visual Studio Code'u resmî kaynaktan indir.
- [x] Kurulum seçeneklerini başlangıç seviyesine uygun seç.
- [x] Visual Studio Code'u aç.
- [x] Türkçe arayüz gerekip gerekmediğine karar ver.
- [x] GitHub Copilot eklentisini kur.
- [x] GitHub hesabıyla oturum aç.
- [x] Copilot Agent Mode erişimini kontrol et.
- [x] Terminal menüsünün yerini öğren.
- [x] Explorer dosya panelinin yerini öğren.
- [x] Visual Studio Code sürümünü kaydet.

---

## Faz 1.2: Node.js ve npm kurulumu

- [x] Expo'nun güncel desteklediği Node.js sürümünü doğrula.
- [x] Uygun Node.js LTS sürümünü resmî kaynaktan indir.
- [x] Node.js'i kur.
- [x] Yeni terminal aç.
- [x] `node --version` komutunu çalıştır.
- [x] `npm --version` komutunu çalıştır.
- [x] Beklenen sürümlerin görüntülendiğini doğrula.
- [x] Kurulum hatası varsa `KNOWN_ISSUES.md` içine ekle.

---

## Faz 1.3: Git ve GitHub kurulumu

- [x] Git'i resmî kaynaktan indir.
- [x] Git'i kur.
- [x] `git --version` komutunu çalıştır.
- [x] Git kullanıcı adını ayarla.
- [x] Git e-posta adresini ayarla.
- [x] GitHub hesabıyla güvenli bağlantı yöntemini belirle.
- [x] GitHub'da geçici depo oluşturmadan önce proje adını doğrula.
- [x] Gizli `.env` dosyalarının Git'e eklenmemesi için kuralları hazırla.

---

## Faz 1.4: Android test ortamı

- [x] Android telefona Expo Go kurulmasının uygun olup olmadığını güncel Expo sürümüne göre doğrula.
- [x] Gerekliyse Expo Go'yu kur.
- [x] Telefon ve bilgisayarı aynı ağa bağla.
- [x] QR koduyla test bağlantısını planla.
- [x] Yerel ağ sorunu için alternatif bağlantı yöntemini not et.
- [x] Fiziksel telefonda temel test başarı ölçütlerini yaz.
- [x] Android Studio'nun hemen gerekli olup olmadığını değerlendir.
- [x] Gerekli değilse Android Studio kurulumunu ertele.

---

## Faz 1.5: iOS test yöntemi

- [x] Kullanılabilir iPhone olup olmadığını belirle.
- [x] Windows kullanılıyorsa iOS test sınırlamalarını belgeye ekle.
- [x] Expo Go ile iPhone testi mümkünse yöntemi hazırla.
- [x] EAS Build ve TestFlight gereksinimlerini listele.
- [x] Apple Developer hesabının ne zaman gerekli olacağını belirle.
- [x] V1 boyunca iOS uyumluluğunun yalnızca varsayımla kontrol edilmemesi için test takvimi hazırla.

---

# 8. Proje iskeleti

## Faz 2: Expo projesini oluşturma

### P0 görevleri

- [x] Güncel Expo proje oluşturma komutunu resmî dokümantasyondan doğrula.
- [x] Proje klasörünün oluşturulacağı yeri belirle.
- [x] `altin-iz` proje klasörünü oluştur.
- [x] Expo projesini TypeScript ile oluştur.
- [x] Oluşan dosya ve klasörleri incele.
- [x] Expo SDK sürümünü kaydet.
- [x] React Native sürümünü kaydet.
- [x] TypeScript sürümünü kaydet.
- [x] Expo Router'ın hazır olup olmadığını kontrol et.
- [x] Uygulamayı değiştirmeden ilk kez çalıştır.
- [x] Terminalde hata olmadığını doğrula.
- [ ] Android fiziksel telefonda varsayılan uygulamayı aç.
- [ ] iOS test imkânı varsa varsayılan uygulamayı aç.
- [ ] İlk çalışan ekranın görüntüsünü kaydet.

### Tamamlanma şartı

- Uygulama Android'de açılmalı.
- Terminalde engelleyici hata olmamalı.
- iOS uyumluluğu için yöntem kaydedilmiş olmalı.
- Varsayılan proje değiştirilmeden önce ilk Git kaydı hazırlanmalı.

---

## Faz 2.1: Git deposunu başlatma

- [x] Proje kök klasöründe Git durumunu kontrol et.
- [x] `.gitignore` dosyasını incele.
- [x] `.env`, `.env.local` ve gizli dosyaların dışlandığını doğrula.
- [x] İlk çalışan sürümü Git'e ekle.
- [x] İlk commit kaydını oluştur.
- [x] Commit kimliğini `HANDOFF.md` içine yaz.
- [ ] GitHub'da özel depo oluştur.
- [ ] Yerel projeyi GitHub deposuna bağla.
- [ ] Ana dalı gönder.
- [ ] GitHub üzerinde gizli dosya olmadığını kontrol et.

### Önerilen ilk commit amacı

```text
Initialize Expo TypeScript project
```

---

## Faz 2.2: Proje belgelerini gerçek klasöre yerleştirme

- [x] Proje kökünde `docs` klasörünü oluştur.
- [x] `PROJECT_CONTEXT.md` dosyasını yerleştir.
- [x] `ARCHITECTURE.md` dosyasını yerleştir.
- [x] `DATABASE.md` dosyasını yerleştir.
- [x] `API.md` dosyasını yerleştir.
- [x] `DECISIONS.md` dosyasını yerleştir.
- [x] `TODO.md` dosyasını yerleştir.
- [x] `CHANGELOG.md` dosyasını yerleştir.
- [x] `KNOWN_ISSUES.md` dosyasını yerleştir.
- [x] `HANDOFF.md` dosyasını yerleştir.
- [x] `SECURITY.md` dosyasını yerleştir.
- [x] `PRIVACY.md` dosyasını yerleştir.
- [x] `DATA_RETENTION.md` dosyasını yerleştir.
- [x] `.github/copilot-instructions.md` dosyasını yerleştir.
- [x] Gerçek Expo klasör yapısıyla `ARCHITECTURE.md` taslağını karşılaştır.
- [x] Gerekli farklılıkları belgelere işle.

---

## Faz 2.3: Temel klasörlerin oluşturulması

- [x] `src/components` klasörünü oluştur.
- [x] `src/constants` klasörünü oluştur.
- [x] `src/domain` klasörünü oluştur.
- [x] `src/hooks` klasörünü oluştur.
- [x] `src/lib` klasörünü oluştur.
- [x] `src/models` klasörünü oluştur.
- [x] `src/providers` klasörünü oluştur.
- [x] `src/services` klasörünü oluştur.
- [x] `src/theme` klasörünü oluştur.
- [x] `src/utils` klasörünü oluştur.
- [x] Yalnızca gerekli alt klasörleri oluştur.
- [x] Boş klasörler için gereksiz dosyalar ekleme.
- [x] TypeScript yol takma adı gerekip gerekmediğini değerlendir.
- [x] Klasör yapısını `ARCHITECTURE.md` ile doğrula.

---

## Faz 2.4: Ortam dosyaları

- [x] `.env.example` dosyasını oluştur.
- [x] `EXPO_PUBLIC_SUPABASE_URL` adını ekle.
- [x] `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` adını ekle.
- [x] `EXPO_PUBLIC_APP_ENV` adını ekle.
- [x] Örnek dosyaya gerçek anahtar yazma.
- [x] Geliştirme ortamı için gerçek `.env.local` dosyasını oluştur.
- [x] `.env.local` dosyasının Git tarafından dışlandığını doğrula.
- [x] Eksik ortam değişkenleri için güvenli hata davranışını planla.

---

# 9. Tasarım sistemi ve rota iskeleti

## Faz 3: Tema altyapısı

- [x] Açık tema renk dosyasını oluştur.
- [x] Koyu tema renk dosyasını oluştur.
- [x] Boşluk sistemini oluştur.
- [x] Yazı boyutu sistemini oluştur.
- [x] Tema TypeScript modelini oluştur.
- [x] `ThemeProvider` oluştur.
- [x] `light`, `dark` ve `system` seçeneklerini destekle.
- [x] Sistem teması değiştiğinde uygulamanın güncellendiğini kontrol et.
- [x] Açık tema kontrastını kontrol et.
- [x] Koyu tema kontrastını kontrol et.
- [x] Kâr ve zarar bilgisinin yalnızca renkle anlatılmadığını doğrula.

---

## Faz 3.1: Ortak temel bileşenler

- [x] `ScreenContainer` oluştur.
- [x] `PrimaryButton` oluştur.
- [x] `SecondaryButton` oluştur.
- [x] `DangerButton` oluştur.
- [x] `TextField` oluştur.
- [x] `PasswordField` oluştur.
- [x] `LoadingState` oluştur.
- [x] `EmptyState` oluştur.
- [x] `ErrorState` oluştur.
- [x] `StaleDataBanner` oluştur.
- [x] `PartialDataBanner` oluştur.
- [x] Bileşenleri Android'de test et.
- [x] Bileşenlerin iOS etkisini kontrol et.
- [x] Dokunma alanlarının yeterli olduğunu kontrol et.
- [x] Ekran okuyucu etiketlerini ekle.

### Tamamlanma şartı

- Bileşenler hem açık hem koyu temada okunabilir olmalı.
- Butonlar yüklenme ve devre dışı durumlarını desteklemeli.
- Bileşenlerde sabit ve dağınık renk kodları bulunmamalı.

---

## Faz 3.2: Expo Router rota iskeleti

- [x] Kök `src/app/_layout.tsx` dosyasını incele.
- [x] Public rota grubunu oluştur.
- [x] Protected rota grubunu oluştur.
- [x] Tabs rota grubunu oluştur.
- [x] Ana Sayfa geçici ekranını oluştur.
- [x] Fiyatlar geçici ekranını oluştur.
- [x] Hesapla geçici ekranını oluştur.
- [x] Portföyüm geçici ekranını oluştur.
- [x] Ayarlar geçici ekranını oluştur.
- [x] Altın detay dinamik rotasını oluştur.
- [x] Portföy ekleme rotasını oluştur.
- [x] Portföy detay rotasını oluştur.
- [x] Portföy düzenleme rotasını oluştur.
- [x] Hesap rotalarını oluştur.
- [x] Yasal belge rotalarını oluştur.
- [x] `+not-found.tsx` ekranını oluştur.
- [x] Alt menü geçişlerini Android'de test et.
- [x] iOS geri hareketlerini kontrol et.

---

# 10. Supabase development altyapısı

## Faz 4: Development Supabase projesi

- [x] Supabase hesabına giriş yap.
- [x] Production değil Development projesi oluştur.
- [x] Daha önce verilen bölge kararına uygun bölgeyi seç.
- [x] Proje adını açıkça development olarak işaretle.
- [x] Proje URL değerini güvenli yere kaydet.
- [x] Publishable key değerini güvenli development ortamına kaydet.
- [x] Veritabanı şifresini parola yöneticisinde sakla.
- [x] Secret veya service role anahtarını mobil `.env` dosyasına yazma.
- [x] Supabase projesinin hazır olduğunu doğrula.

---

## Faz 4.1: Supabase yerel proje yapısı

- [x] Supabase CLI gereksinimini güncel dokümantasyondan doğrula.
- [x] Gerekliyse Supabase CLI'ı uygun yöntemle kur.
- [x] `supabase` klasörünü başlat.
- [x] Development projesini yerel projeye bağla.
- [x] Bağlantı kimliklerini gizli olmayan doğru yerde tut.
- [x] Migration klasörünü doğrula.
- [x] Seed dosyasını oluştur.
- [x] Veritabanı değişikliklerinin panelde kayıtsız yapılmaması kuralını uygula.

---

## Faz 4.2: Veritabanı migration dosyaları

Migration görevleri küçük dosyalara ayrılabilir:

- [x] UUID veya gerekli PostgreSQL özelliklerini hazırla.
- [x] Ortak `updated_at` fonksiyonunu oluştur.
- [x] `user_profiles` tablosunu oluştur.
- [x] `user_preferences` tablosunu oluştur.
- [x] `gold_products` tablosunu oluştur.
- [x] `price_sources` tablosunu oluştur.
- [x] `price_source_product_mappings` tablosunu oluştur.
- [x] `price_fetch_runs` tablosunu oluştur.
- [x] `gold_prices` tablosunu oluştur.
- [x] `portfolio_entries` tablosunu oluştur.
- [x] `legal_documents` tablosunu oluştur.
- [x] `user_legal_events` tablosunu oluştur.
- [x] `account_deletion_requests` tablosunu oluştur.
- [x] `security_events` tablosunu oluştur.
- [x] Yabancı anahtarları ekle.
- [x] Benzersizlik kurallarını ekle.
- [x] `CHECK` kısıtlarını ekle.
- [x] İndeksleri ekle.
- [x] `updated_at` tetikleyicilerini ekle.
- [x] Migrationları boş development veritabanında çalıştır.
- [x] Migrationları ikinci kez sıfırdan kurarak doğrula.
- [x] Şemayı `DATABASE.md` ile karşılaştır.

---

## Faz 4.3: Başlangıç ürün verileri

- [x] Kesinleşen ürün kodlarını hazırla.
- [x] Ürün adlarını hazırla.
- [x] Eski ve yeni tarihli ürünleri ayrı tanımla.
- [x] Ölçü birimlerini tanımla.
- [x] Miktar hassasiyetlerini tanımla.
- [x] Paket ağırlıklarını tanımla.
- [x] Portföy için koşullu ürünleri devre dışı bırak.
- [x] Hesaplama için koşullu ürünleri devre dışı bırak.
- [x] Fiyat gösterimi için koşullu ürünleri devre dışı bırak.
- [x] Ons Altın için `portfolio_enabled = false` yap.
- [x] Seed dosyasına yalnızca doğrulanmış ürünleri ekle.
- [x] Seed dosyasına gerçek kullanıcı verisi ekleme.

---

## Faz 4.4: RLS politikaları

### Kullanıcı profili

- [x] `auth.users` kaydı oluştuğunda `SECURITY DEFINER` tetikleyicisi ile `user_profiles` ve `user_preferences` kayıtlarını otomatik oluştur.
- [x] Kullanıcı yalnızca kendi profilini okuyabilsin (`SELECT`).
- [x] Kullanıcı olası tetikleyici hatasında eksik profil kaydını yalnızca kendi `auth.uid()` kimliği ve `active` durumuyla oluşturabilsin (`INSERT` fallback).
- [x] Kullanıcı yalnızca izin verilen profil alanlarını (`display_name`) güncelleyebilsin (`UPDATE`).
- [x] Kullanıcının `user_id`, `account_status` ve `created_at` alanlarını değiştirmesini `BEFORE UPDATE` tetikleyicisiyle veritabanı seviyesinde engelle.

### Kullanıcı tercihleri

- [x] Kullanıcı yalnızca kendi tercihlerini okuyabilsin (`SELECT`).
- [x] Kullanıcı eksik tercih kaydını yalnızca kendi `auth.uid()` kimliğiyle oluşturabilsin (`INSERT` fallback).
- [x] Kullanıcı kendi tercih kaydında yalnızca `theme` alanını güncelleyebilsin (`UPDATE`).
- [x] Kullanıcının `user_id`, `language_code`, `currency_code` ve `created_at` alanlarını değiştirmesini `BEFORE UPDATE` tetikleyicisiyle veritabanı seviyesinde engelle.

### Portföy

- [x] Kullanıcı yalnızca kendi kayıtlarını okuyabilsin.
- [x] Kullanıcı yalnızca kendi adına kayıt oluşturabilsin.
- [x] Kullanıcı yalnızca kendi kaydını güncelleyebilsin.
- [x] Kullanıcı yalnızca kendi kaydını silebilsin.
- [x] Kullanıcı kayıt sahibini değiştiremesin.

### Ortak fiyat tabloları

- [x] Normal kullanıcı aktif altın ürünlerini okuyabilsin.
- [x] Normal kullanıcı ürün ekleyemesin.
- [x] Normal kullanıcı ürün değiştiremesin.
- [x] Normal kullanıcı fiyat ekleyemesin.
- [x] Normal kullanıcı fiyat değiştiremesin.
- [x] Normal kullanıcı fiyat silemesin.
- [x] Normal kullanıcı sağlayıcı eşleştirmesi değiştiremesin.
- [x] Normal kullanıcı fiyat çekme çalışma kayıtlarını okuyamasın.
- [x] Normal kullanıcı güvenlik olaylarını okuyamasın.

### Yasal belgeler ve hesap silme talepleri

- [x] Kullanıcı aktif ve yürürlükteki belgeleri okuyabilsin (`SELECT`).
- [x] Normal kullanıcı belge metnini değiştiremesin.
- [x] `user_legal_events`: Kullanıcı yalnızca kendi olaylarını okuyabilsin (`SELECT`); doğrudan istemci `INSERT`, `UPDATE` ve `DELETE` işlemleri kapalı olsun; yeni yasal olay yalnızca güvenli PostgreSQL RPC veya `record-legal-event` Edge Function üzerinden append-only olarak oluşturulsun.
- [x] `account_deletion_requests`: Kullanıcı yalnızca kendi silme talebini okuyabilsin (`SELECT`); oluşturma ve durum güncellemeleri yalnızca `delete-account` Edge Function (service role) tarafından yapılsın (`INSERT`, `UPDATE`, `DELETE` istemciye kapalı olsun).

---

## Faz 4.5: RLS güvenlik testleri

- [x] Test Kullanıcısı A oluştur.
- [x] Test Kullanıcısı B oluştur.
- [x] A için portföy kaydı oluştur.
- [x] B için portföy kaydı oluştur.
- [x] A, B'nin kaydını okuyamıyor testi.
- [x] A, B adına kayıt oluşturamıyor testi.
- [x] A, B'nin kaydını güncelleyemiyor testi.
- [x] A, B'nin kaydını silemiyor testi.
- [x] B için ters yönlü aynı testleri yap.
- [x] Normal kullanıcı fiyat yazamıyor testi.
- [x] Normal kullanıcı ürün değiştiremiyor testi.
- [x] Normal kullanıcı eşleştirme değiştiremiyor testi.
- [x] Normal kullanıcı `user_legal_events` tablosuna doğrudan `INSERT`, `UPDATE` ve `DELETE` yapamıyor testi.
- [x] Yasal olay kaydında sahte `document_version` veya `event_at` gönderildiğinde sunucu değerlerinin kullanıldığı testi.
- [x] Test sonuçlarını `SECURITY.md` ve `HANDOFF.md` içine yaz.

### Tamamlanma şartı

- Bütün yetkisiz işlemler veritabanı tarafından reddedilmeli.
- Yalnızca uygulama arayüzünde gizleme yeterli sayılmamalı.
- Test edilmemiş RLS politikası production'a gönderilmemeli.

---

# 11. Kullanıcı hesabı geliştirmesi

## Faz 5: Supabase istemcisi

- [ ] Güncel Expo-Supabase entegrasyon yöntemini doğrula.
- [ ] Gerekli paketleri listele.
- [ ] Her paketin neden gerektiğini açıkla.
- [ ] Paketlerin Expo uyumluluğunu kontrol et.
- [ ] Paketleri kur.
- [ ] `src/lib/environment.ts` oluştur.
- [ ] `src/lib/supabase.ts` oluştur.
- [ ] Tek Supabase istemcisi oluştur.
- [ ] Güvenli mobil oturum saklama yöntemini uygula.
- [ ] Eksik ortam değişkeni hata durumunu uygula.
- [ ] Gizli anahtar bulunmadığını kontrol et.
- [ ] Android'de bağlantıyı test et.
- [ ] iOS uyumluluğunu kontrol et.

---

## Faz 5.1: Auth servisleri

- [ ] `authService.ts` oluştur.
- [ ] Hesap oluşturma işlemini ekle.
- [ ] Giriş işlemini ekle.
- [ ] Çıkış işlemini ekle.
- [ ] Oturum okuma işlemini ekle.
- [ ] E-posta doğrulamasını tekrar gönderme işlemini ekle.
- [ ] Şifre sıfırlama bağlantısı gönderme işlemini ekle.
- [ ] Auth hatalarını ortak hata biçimine dönüştür.
- [ ] Şifreyi loglamadığını doğrula.
- [ ] E-posta hesabı varlığını gereksiz ifşa etmediğini doğrula.

---

## Faz 5.2: AuthProvider

- [ ] `AuthProvider.tsx` oluştur.
- [ ] Oturum yükleniyor durumunu ekle.
- [ ] Oturum yok durumunu ekle.
- [ ] Doğrulanmamış kullanıcı durumunu ekle.
- [ ] Aktif kullanıcı durumunu ekle.
- [ ] `deletion_pending` durumunu ekle.
- [ ] `disabled` durumunu ekle.
- [ ] Auth olay dinleyicisini ekle.
- [ ] Provider temizleme işlemini ekle.
- [ ] Sonsuz yönlendirme döngüsü testini yap.

---

## Faz 5.3: Kayıt ekranı

- [ ] E-posta alanını oluştur.
- [ ] Şifre alanını oluştur.
- [ ] Şifre tekrar alanını oluştur.
- [ ] Şifreyi göster veya gizle seçeneğini ekle.
- [ ] E-posta doğrulamasını ekle.
- [ ] Şifrelerin eşleşme kontrolünü ekle.
- [ ] Yasal belge bağlantılarını ekle.
- [ ] Gönderim yüklenme durumunu ekle.
- [ ] Çift gönderimi engelle.
- [ ] Başarı sonrası doğrulama ekranına yönlendir.
- [ ] Android klavye davranışını test et.
- [ ] iOS klavye ve geri hareketini kontrol et.

---

## Faz 5.4: E-posta doğrulama

- [ ] E-posta doğrulama ekranını oluştur.
- [ ] Tekrar gönderme butonunu ekle.
- [ ] Tekrar gönderme hız sınırı davranışını ekle.
- [ ] Doğrulama durumunu yenileme butonunu ekle.
- [ ] Auth callback rotasını oluştur.
- [ ] Android derin bağlantısını yapılandır.
- [ ] iOS derin bağlantısını yapılandır.
- [ ] Süresi dolmuş bağlantıyı test et.
- [ ] Başarılı doğrulamayı test et.
- [ ] Başarısız doğrulamayı test et.

---

## Faz 5.5: Giriş ekranı

- [ ] E-posta alanını oluştur.
- [ ] Şifre alanını oluştur.
- [ ] Şifreyi göster veya gizle seçeneğini ekle.
- [ ] Giriş butonunu ekle.
- [ ] Şifremi Unuttum bağlantısını ekle.
- [ ] Hesap Oluştur bağlantısını ekle.
- [ ] Genel hatalı giriş mesajını ekle.
- [ ] Doğrulanmamış kullanıcı yönlendirmesini ekle.
- [ ] Hesap durumu kontrolünü ekle.
- [ ] Başarılı giriş sonrası Ana Sayfaya yönlendir.

---

## Faz 5.6: Şifre sıfırlama

- [ ] Şifremi Unuttum ekranını oluştur.
- [ ] Genel güvenli sonuç mesajını ekle.
- [ ] Şifre sıfırlama e-postasını gönder.
- [ ] Reset callback akışını yapılandır.
- [ ] Yeni şifre belirleme ekranını oluştur.
- [ ] Şifre politikasını göster.
- [ ] Süresi dolmuş bağlantıyı yönet.
- [ ] Başarılı işlem sonrası giriş ekranına yönlendir.
- [ ] Android derin bağlantısını test et.
- [ ] iOS derin bağlantısını test et.

---

## Faz 5.7: Çıkış yapma

- [ ] Çıkış onay penceresini oluştur.
- [ ] Supabase çıkış işlemini çağır.
- [ ] Yerel auth verisini temizle.
- [ ] Kullanıcıya ait portföy önbelleğini temizle.
- [ ] Protected navigasyon geçmişini temizle.
- [ ] Kullanıcıyı public ekrana yönlendir.
- [ ] Hesap ve portföyün silinmediğini doğrula.
- [ ] Başka kullanıcı giriş yaptığında önceki verinin görünmediğini test et.

---

# 12. Fiyat sistemi

## Faz 6: Fiyat sağlayıcısı eşleştirmeleri

- [ ] `price_sources` içine development sağlayıcısını ekle.
- [ ] Doğrulanmış ürünleri `gold_products` içine ekle.
- [ ] Doğrulanmış sembolleri `price_source_product_mappings` içine ekle.
- [ ] Eski ve yeni tarihli ürünleri doğru eşleştir.
- [ ] Belirsiz Cumhuriyet ve Ata eşleştirmesini etkinleştirme.
- [ ] Bilinmeyen sembolün otomatik ürün oluşturmadığını test et.
- [ ] Devre dışı eşleştirmenin fiyat üretmediğini test et.

---

## Faz 6.1: Fiyat çekme Edge Function

- [ ] `supabase/functions/fetch-gold-prices` oluştur.
- [ ] Sunucu ortam değişkenlerini tanımla.
- [ ] Fiyat API anahtarını secret store'a ekle.
- [ ] API base URL değerini secret veya config olarak ekle.
- [ ] İstek zaman aşımını ekle.
- [ ] API isteğini ekle.
- [ ] 401 hata yönetimini ekle.
- [ ] 403 hata yönetimini ekle.
- [ ] 429 kota yönetimini ekle.
- [ ] 500-504 geçici hata yönetimini ekle.
- [ ] Sınırlı tekrar deneme ekle.
- [ ] API anahtarını loglamadığını doğrula.

---

## Faz 6.2: Fiyat doğrulama

- [ ] Yanıtın JSON olduğunu doğrula.
- [ ] Fiyat listesinin beklenen yapıda olduğunu doğrula.
- [ ] Sembol boşsa reddet.
- [ ] Eşleştirme yoksa reddet.
- [ ] Alış fiyatının sayı olduğunu doğrula.
- [ ] Satış fiyatının sayı olduğunu doğrula.
- [ ] En az bir fiyatın mevcut olduğunu doğrula.
- [ ] Negatif ve sıfır fiyatı reddet.
- [ ] Para birimini doğrula.
- [ ] Ürün birimini doğrula.
- [ ] Zaman damgasını doğrula.
- [ ] Makul olmayan gelecek zamanını reddet.
- [ ] Sağlayıcının eski veri işaretini kaydet.
- [ ] Ondalıklı TL değerini güvenli biçimde kuruşa çevir.
- [ ] Geçersiz fiyatın kullanıcıya gösterilmediğini test et.
- [ ] `price_fetch_runs` sayaçlarını güncelle.
- [ ] `success`, `partial` ve `failed` durumlarını test et.

---

## Faz 6.3: Fiyat zamanlayıcısı

- [ ] Development ortamında otomatik zamanlayıcıyı başlangıçta kapalı tut.
- [ ] Yetkili manuel fiyat çekme yöntemini oluştur.
- [ ] Ücretsiz kotayı izleme yöntemini oluştur.
- [ ] Production çekme sıklığını ticari plan sonrası kesinleştir.
- [ ] Zamanlanmış görevin art arda çakışmasını önle.
- [ ] Aynı veri için gereksiz yinelenen kayıt davranışını değerlendir.
- [ ] Zamanlayıcı hatasını güvenli teknik kayda al.

---

## Faz 6.4: Güncel fiyat okuma servisi

- [ ] `goldProductService.ts` oluştur.
- [ ] `goldPriceService.ts` oluştur.
- [ ] Aktif ürün listesini getir.
- [ ] En son geçerli fiyatı getir.
- [ ] Alış ve satış fiyatını ayrı modelle.
- [ ] Kaynak fiyat zamanı ile çekilme zamanını ayrı modelle.
- [ ] `live` durumunu üret.
- [ ] `stale` durumunu üret.
- [ ] `partial` durumunu üret.
- [ ] `unavailable` durumunu üret.
- [ ] Fiyat yoksa `null` kullandığını doğrula.
- [ ] Başka ürün fiyatını yedek kullanmadığını doğrula.

---

## Faz 6.5: Fiyatlar ekranı

- [ ] Ekran başlığını oluştur.
- [ ] Son güncelleme bilgisini göster.
- [ ] Arama alanını oluştur.
- [ ] Sıralama kontrolünü oluştur.
- [ ] Varsayılan sıralamayı ekle.
- [ ] İsme göre sıralamayı ekle.
- [ ] Satış fiyatına göre artan sıralamayı ekle.
- [ ] Satış fiyatına göre azalan sıralamayı ekle.
- [ ] Fiyat kartlarını oluştur.
- [ ] Alış ve satış etiketlerini açıkça göster.
- [ ] Günlük değişimi yalnızca varsa göster.
- [ ] Fiyatı olmayan üründe `0 TL` gösterme.
- [ ] Eski veri uyarısını göster.
- [ ] Kısmi veri uyarısını göster.
- [ ] Yeniden Dene butonunu ekle.
- [ ] Ürün detayına yönlendirmeyi ekle.
- [ ] Android'de uzun ürün adlarını test et.
- [ ] iOS'ta liste ve geri hareketini test et.

---

## Faz 6.6: Altın detay ekranı

- [ ] Dinamik `productId` doğrulamasını ekle.
- [ ] Ürün adını göster.
- [ ] Alış fiyatını göster.
- [ ] Satış fiyatını göster.
- [ ] Günlük değişimi varsa göster.
- [ ] Günün düşük ve yüksek değerini varsa göster.
- [ ] Son fiyat zamanını göster.
- [ ] Fiyat kaynağını göster.
- [ ] Güncellik durumunu göster.
- [ ] Hesapla butonunu ekle.
- [ ] Portföye Ekle butonunu ekle.
- [ ] Finansal bilgilendirmeyi ekle.
- [ ] Portföye kapalı üründe ekleme butonunu gösterme veya açıklayıcı devre dışı durum kullan.
- [ ] Fiyat yoksa güvenli hata durumunu göster.

---

# 13. Hesaplama sistemi

## Faz 7: Hesaplama etki alanı fonksiyonları

- [ ] Para modelini kesinleştir.
- [ ] JavaScript güvenli tam sayı sınırını değerlendir.
- [ ] Ondalıklı hesaplama kütüphanesi gerekip gerekmediğine karar ver.
- [ ] Kararı `DECISIONS.md` içine yaz.
- [ ] Satın alma tahmini fonksiyonunu oluştur.
- [ ] Bozdurma tahmini fonksiyonunu oluştur.
- [ ] Kayıt bazında tahmini değer fonksiyonunu oluştur.
- [ ] Kâr-zarar fonksiyonunu oluştur.
- [ ] Yüzde fonksiyonunu oluştur.
- [ ] Sıfıra bölme korumasını oluştur.
- [ ] Kısmi portföy toplamı fonksiyonunu oluştur.
- [ ] Para yuvarlama kurallarını uygula.
- [ ] Gram ve adet miktar doğrulamasını uygula.

### Birim testleri

- [ ] Tam adet hesabını test et.
- [ ] Üç ondalıklı gram hesabını test et.
- [ ] Kâr sonucunu test et.
- [ ] Zarar sonucunu test et.
- [ ] Başa baş sonucunu test et.
- [ ] Yüzde hesabını test et.
- [ ] Büyük para değerini test et.
- [ ] Fiyat yok durumunu test et.
- [ ] Eski fiyat durumunu test et.
- [ ] Kısmi portföy toplamını test et.
- [ ] Her kayıt yüzdesinin toplanmadığını test et.

---

## Faz 7.1: Hesaplama ekranı

- [ ] Altın türü seçicisini oluştur.
- [ ] Yalnızca `calculator_enabled` ürünleri göster.
- [ ] Miktar alanını oluştur.
- [ ] Ürüne göre adet veya gram etiketini otomatik göster.
- [ ] Satın Alacağım seçeneğini ekle.
- [ ] Bozduracağım seçeneğini ekle.
- [ ] Hesapla butonunu ekle.
- [ ] Sonucu temizle butonunu ekle.
- [ ] Kullanılan fiyat türünü göster.
- [ ] Kullanılan birim fiyatı göster.
- [ ] Tahmini toplamı göster.
- [ ] Son fiyat zamanını göster.
- [ ] Eski fiyat uyarısını göster.
- [ ] Finansal bilgilendirmeyi göster.
- [ ] Portföye Ekle butonunu ekle.
- [ ] Fiyat yokken hesaplamayı engelle.
- [ ] Adetli üründe kesirli girişi engelle.
- [ ] Gramlı üründe üçten fazla ondalığı engelle.
- [ ] Türkçe virgül ve nokta giriş davranışını test et.
- [ ] Android sayısal klavyeyi test et.
- [ ] iOS sayısal klavyeyi test et.

---

# 14. Portföy sistemi

## Faz 8: Portföy servisi

- [ ] `portfolioService.ts` oluştur.
- [ ] Kullanıcının kayıtlarını listele.
- [ ] Tek kayıt detayını getir.
- [ ] Kayıt oluştur.
- [ ] Kayıt güncelle.
- [ ] Kayıt sil.
- [ ] Kayıtları alış tarihi ve oluşturulma zamanına göre sırala.
- [ ] Kullanıcı kimliğini form girdisinden alma.
- [ ] Supabase hatalarını ortak hata modeline dönüştür.
- [ ] Fiyat olmayan kayıtların kaybolmadığını test et.

---

## Faz 8.1: Portföye altın ekleme formu

- [ ] Yalnızca `portfolio_enabled` ürünleri listele.
- [ ] Altın türü alanını oluştur.
- [ ] Miktar alanını oluştur.
- [ ] Birimi otomatik göster.
- [ ] Alış tarihi alanını oluştur.
- [ ] Ödenen toplam tutar alanını oluştur.
- [ ] Alış yeri alanını oluştur.
- [ ] Not alanını oluştur.
- [ ] İşçilik dâhil seçeneğini oluştur.
- [ ] Gelecek tarihi engelle.
- [ ] Sıfır ve negatif miktarı engelle.
- [ ] Sıfır ve negatif tutarı engelle.
- [ ] Alış yerini 100 karakterle sınırla.
- [ ] Notu 500 karakterle sınırla.
- [ ] Form gönderilirken butonu devre dışı bırak.
- [ ] Çift kayıt oluşturmayı engelle.
- [ ] Başarı sonrası kayıt detayına yönlendir.
- [ ] Hata sonrası girilen verileri koru.
- [ ] Kaydedilmemiş değişiklik uyarısını değerlendir.

---

## Faz 8.2: Portföy kaydı detay ekranı

- [ ] Altın türünü göster.
- [ ] Miktarı ve birimi göster.
- [ ] Alış tarihini göster.
- [ ] Ödenen toplam tutarı göster.
- [ ] Alış yerini varsa göster.
- [ ] Notu varsa göster.
- [ ] İşçilik bilgisini göster.
- [ ] Kullanılan güncel alış fiyatını göster.
- [ ] Tahmini güncel bozdurma değerini göster.
- [ ] Tahmini kâr veya zararı göster.
- [ ] Değişim yüzdesini göster.
- [ ] Son fiyat zamanını göster.
- [ ] Fiyat yoksa hesaplanamıyor durumunu göster.
- [ ] Eski fiyat uyarısını göster.
- [ ] Düzenle butonunu ekle.
- [ ] Sil butonunu ekle.

---

## Faz 8.3: Portföy kaydı düzenleme

- [ ] Mevcut kayıt verilerini forma doldur.
- [ ] Değiştirilebilir alanları sınırla.
- [ ] `id`, `user_id` ve `created_at` alanlarını değiştirme.
- [ ] Form doğrulamalarını tekrar kullan.
- [ ] Başarı sonrası detay ekranını yenile.
- [ ] Portföy özetini yenile.
- [ ] Kaydedilmemiş değişiklik uyarısını ekle.
- [ ] Yetkisiz kayıt erişimini test et.

---

## Faz 8.4: Portföy kaydı silme

- [ ] Silme onay penceresini oluştur.
- [ ] Silinecek kaydın kısa özetini göster.
- [ ] İşlemin geri alınamayacağını belirt.
- [ ] V1'de satış geçmişi oluşturmadığını belirt.
- [ ] Vazgeç davranışını ekle.
- [ ] Silme işlemini ekle.
- [ ] Başarı sonrası Portföyüm ekranına dön.
- [ ] Başarısızlıkta kaydı görünür tut.
- [ ] Silme tamamlanmadan başarı mesajı gösterme.
- [ ] Portföy toplamlarını yenile.

---

## Faz 8.5: Portföy özet hesaplaması

- [ ] Portföy kayıtlarını fiyatlarla eşleştir.
- [ ] Her kaydın tahmini değerini hesapla.
- [ ] Her kaydın kâr-zararını hesapla.
- [ ] Toplam ödenen tutarı hesapla.
- [ ] Tam portföy özetini hesapla.
- [ ] Kısmi portföy özetini hesapla.
- [ ] Fiyatı olmayan kayıt sayısını göster.
- [ ] Eski fiyatla hesaplanan kayıt sayısını değerlendir.
- [ ] Yanıltıcı toplam yüzde göstermeyi engelle.
- [ ] Bütün kayıtların yüzdesini toplamadığını test et.

---

## Faz 8.6: Portföyüm ekranı

- [ ] Toplam ödenen tutarı göster.
- [ ] Tahmini toplam bozdurma değerini göster.
- [ ] Toplam tahmini kâr veya zararı göster.
- [ ] Toplam değişim yüzdesini göster.
- [ ] Toplam kayıt sayısını göster.
- [ ] Yeni Altın Ekle butonunu göster.
- [ ] Kayıt kartlarını listele.
- [ ] En yeni alış tarihinden eskiye sırala.
- [ ] Kâr ve zararı yazı, işaret ve renkle göster.
- [ ] Portföy boş durumunu ekle.
- [ ] Kısmi toplam uyarısını ekle.
- [ ] Eski fiyat uyarısını ekle.
- [ ] Yenile davranışını ekle.
- [ ] Kayıt detayına geçiş ekle.
- [ ] Uzun listede performansı kontrol et.

---

# 15. Ana Sayfa

## Faz 9: Ana Sayfa veri modeli

- [ ] Gram Altın (`GRAM_GOLD`) için öncelikli fiyatı getir.
- [ ] Çeyrek Altın kartı için Yeni Tarihli (`QUARTER_GOLD_NEW`) ürün fiyatını getir.
- [ ] Ons Altın (`OUNCE_GOLD`) fiyatını getir.
- [ ] Portföy özetini getir.
- [ ] Son fiyat zamanını belirle.
- [ ] Tam, kısmi, eski ve kullanılamıyor durumlarını birleştir.

---

## Faz 9.1: Ana Sayfa arayüzü

- [ ] Karşılama alanını oluştur.
- [ ] Son fiyat güncelleme bilgisini göster.
- [ ] Gram Altın fiyat kartını oluştur.
- [ ] Çeyrek Altın fiyat kartını oluştur.
- [ ] Ons Altın fiyat kartını oluştur.
- [ ] Tüm Fiyatları Gör bağlantısını ekle.
- [ ] Portföy özet kartını oluştur.
- [ ] Portföye Altın Ekle butonunu ekle.
- [ ] Hızlı Hesaplama butonunu ekle.
- [ ] Boş portföy durumunu göster.
- [ ] Eski fiyat uyarısını göster.
- [ ] Kısmi portföy uyarısını göster.
- [ ] Fiyat servisi hatasını yönet.
- [ ] Android küçük ekranda test et.
- [ ] iOS Safe Area davranışını test et.

---

# 16. Ayarlar ve kullanıcı tercihleri

## Faz 10: Tema tercihi

- [ ] `preferencesService.ts` oluştur.
- [ ] Kullanıcı tercihlerini getir.
- [ ] Tema tercihini güncelle.
- [ ] Açık tema seçeneğini ekle.
- [ ] Koyu tema seçeneğini ekle.
- [ ] Sistem teması seçeneğini ekle.
- [ ] Seçimi anında uygula.
- [ ] Seçimi Supabase'e kaydet.
- [ ] Uygulama tekrar açıldığında tercihi yükle.

---

## Faz 10.1: Ayarlar ekranı

- [ ] Hesap Bilgileri bağlantısını ekle.
- [ ] Görünüm bölümünü ekle.
- [ ] Yasal ve Gizlilik bölümünü ekle.
- [ ] Uygulama Hakkında bağlantısını ekle.
- [ ] Destek ve Hata Bildir bağlantısını ekle.
- [ ] Çıkış Yap butonunu ekle.
- [ ] Hesabımı ve Verilerimi Sil seçeneğini tehlikeli işlem olarak ayır.
- [ ] Uygulama sürümünü göster.
- [ ] Fiyat kaynağını göster.

---

## Faz 10.2: Hesap bilgileri

- [ ] E-posta adresini göster.
- [ ] E-posta doğrulama durumunu göster.
- [ ] Görünen adı varsa göster ve düzenle.
- [ ] Şifre değiştirme veya sıfırlama bağlantısını ekle.
- [ ] Kullanıcının değiştiremeyeceği sistem alanlarını gizle.

---

# 17. Yasal belgeler ve gizlilik

## Faz 11: Yasal belge altyapısı

- [!] Production yayını öncesi nihai yasal belge metinlerini doğrulamak için hukuk uzmanıyla çalış (`KI-025`, geliştirme aşamasında şablon metinler kullanılır).
- [ ] KVKK aydınlatma metnini hazırla.
- [ ] Gizlilik politikasını hazırla.
- [ ] Kullanım koşullarını hazırla.
- [ ] Veri saklama ve silme metnini hazırla.
- [ ] Finansal bilgilendirme metnini hazırla.
- [ ] Gerekli ise ayrı açık rıza metnini hazırla.
- [ ] Belgeleri `legal_documents` tablosuna sürümlü ekle.
- [ ] Her belge türünde tek aktif sürüm kuralını test et.
- [ ] `content_hash` üretimini uygula.
- [ ] Aktif ve yürürlükteki belge sorgusunu oluştur.

---

## Faz 11.1: Yasal belge ekranları

- [ ] Yasal belge listesi ekranını oluştur.
- [ ] Belge detay ekranını oluştur.
- [ ] KVKK Aydınlatma Metnini göster.
- [ ] Gizlilik Politikasını göster.
- [ ] Kullanım Koşullarını göster.
- [ ] Veri Saklama ve Silme bilgisini göster.
- [ ] Finansal Bilgilendirme metnini göster.
- [ ] Belge sürümünü gösterme gereksinimini değerlendir.
- [ ] Belge çevrimdışı önbelleğini sürüm bilgisiyle yönet.

---

## Faz 11.2: Kullanıcı yasal olayları

- [ ] Yasal olay kaydı için güvenli PostgreSQL RPC veya `record-legal-event` Edge Function oluştur.
- [ ] `legalService.ts` oluştur ve doğrudan tablo yazımı yerine güvenli sunucu işlemini çağır.
- [ ] Belge sunumu olayını kaydet.
- [ ] Belge görüntüleme olayını gereklilik varsa kaydet.
- [ ] Kullanım koşulları kabulünün hukuki gereksinimini doğrula.
- [ ] Açık rıza varsa kabul olayını ayrı kaydet.
- [ ] Açık rıza reddini ayrı kaydet.
- [ ] Açık rıza geri çekmeyi ayrı kaydet.
- [ ] Aydınlatmayı açık rıza onayına dönüştürme.
- [ ] Kullanıcının başka kullanıcı adına olay oluşturamadığını test et.

---

# 18. Hesap ve veri silme

## Faz 12: Hesap silme teknik tasarımı

- [ ] Yeniden kimlik doğrulama yöntemini kesinleştir.
- [ ] Silme işlem sırasını migration ve function yapısıyla doğrula.
- [ ] Silinecek tabloları kesinleştir.
- [ ] Saklanacak veya anonimleştirilecek kayıtları hukuk uzmanıyla belirle.
- [ ] Kısmi başarısızlık telafi stratejisini belirle.
- [ ] Tamamlanma kaydının kişisel veri içerip içermeyeceğini belirle.
- [ ] Kararı `DATA_RETENTION.md` içine ekle.
- [ ] Kararı `DECISIONS.md` içine ekle.

---

## Faz 12.1: `delete-account` Edge Function

- [ ] Fonksiyon klasörünü oluştur.
- [ ] Oturumu doğrula.
- [ ] Kullanıcı kimliğini token üzerinden al.
- [ ] İstek gövdesindeki serbest `user_id` değerini güven kaynağı olarak kabul etme.
- [ ] Yeniden doğrulama şartını kontrol et.
- [ ] Silme talebi kaydı oluştur.
- [ ] Hesabı `deletion_pending` yap.
- [ ] Portföy kayıtlarını sil.
- [ ] Kullanıcı tercihlerini sil.
- [ ] Yasal olayları saklama politikasına göre işle.
- [ ] Güvenlik olaylarını saklama politikasına göre işle.
- [ ] Profil kaydını sil.
- [ ] Auth hesabını sil.
- [ ] Aktif oturumları sonlandır.
- [ ] Başarı ve hata durumlarını güvenli kaydet.
- [ ] Secret anahtarı yanıtta veya logda gösterme.

---

## Faz 12.2: Hesap silme ekranı

- [ ] Silinecek verileri listele.
- [ ] İşlemin geri alınamayacağını belirt.
- [ ] Yeniden doğrulama alanını oluştur.
- [ ] Son onay adımını oluştur.
- [ ] İşlem sürerken ekranı güvenli şekilde kilitle.
- [ ] Başarıdan sonra yerel oturumu temizle.
- [ ] Başarıdan sonra public ekrana yönlendir.
- [ ] Başarısızlıkta hesabı silinmiş gibi gösterme.
- [ ] Tekrar deneme davranışını ekle.
- [ ] Android'de test et.
- [ ] iOS'ta test et.

---

# 19. Güvenlik ve gizlilik sertleştirmesi

## Faz 13: Güvenlik incelemesi

- [ ] Mobil uygulamada gizli anahtar araması yap.
- [ ] Git geçmişinde gizli anahtar araması yap.
- [ ] Hata loglarında şifre olmadığını doğrula.
- [ ] Hata loglarında erişim belirteci olmadığını doğrula.
- [ ] Hata loglarında API anahtarı olmadığını doğrula.
- [ ] Ekran görüntüsü ve debug çıktılarında hassas bilgi olmadığını kontrol et.
- [ ] RLS politikalarını yeniden test et.
- [ ] Edge Function yetkilerini sınırla.
- [ ] Kullanıcı girdilerinin backend'de doğrulandığını kontrol et.
- [ ] Bağımlılık güvenlik taraması yap.
- [ ] Kullanılmayan paketleri kaldır.
- [ ] Development loglarını production için sınırla.
- [ ] Oturum süresi dolma davranışını test et.
- [ ] Çıkış sonrası önbellek temizliğini test et.
- [ ] Hesap silme sonrası erişimi test et.

---

## Faz 13.1: Gizlilik incelemesi

- [ ] Uygulamanın topladığı bütün verileri listele.
- [ ] Her veri için işleme amacını yaz.
- [ ] Her veri için hukuki sebebi hukuk uzmanıyla doğrula.
- [ ] Her veri için saklama süresini belirle.
- [ ] Her veri için aktarım taraflarını belirle.
- [ ] Supabase veri akışını belgeye ekle.
- [ ] Fiyat sağlayıcısının kişisel veri alıp almadığını doğrula.
- [ ] Hata izleme hizmeti varsa veri akışını ekle.
- [ ] Analitik kullanılacaksa açıkça karar ver.
- [ ] Gereksiz veri toplamayı kaldır.
- [ ] Google Play Veri Güvenliği taslağını hazırla.
- [ ] App Store App Privacy taslağını hazırla.
- [ ] Mağaza beyanlarını gerçek uygulama davranışıyla karşılaştır.

---

# 20. Test aşaması

## Faz 14: Birim testleri

- [ ] Para dönüştürme testleri.
- [ ] Para biçimlendirme testleri.
- [ ] Miktar doğrulama testleri.
- [ ] Alış tarihi doğrulama testleri.
- [ ] Satın alma hesaplama testleri.
- [ ] Bozdurma hesaplama testleri.
- [ ] Kâr-zarar testleri.
- [ ] Yüzde testleri.
- [ ] Kısmi toplam testleri.
- [ ] Hata dönüştürme testleri.
- [ ] Ürün etkinlik kuralları testleri.
- [ ] Eski fiyat belirleme testleri.

---

## Faz 14.1: Entegrasyon testleri

- [ ] Hesap oluşturma testi.
- [ ] E-posta doğrulama testi.
- [ ] Giriş testi.
- [ ] Şifre sıfırlama testi.
- [ ] Oturum yenileme testi.
- [ ] Çıkış testi.
- [ ] Ürün listesi testi.
- [ ] Güncel fiyat sorgusu testi.
- [ ] Portföy ekleme testi.
- [ ] Portföy listeleme testi.
- [ ] Portföy düzenleme testi.
- [ ] Portföy silme testi.
- [ ] Yasal belge sorgusu testi.
- [ ] Hesap silme testi.

---

## Faz 14.2: Android cihaz testleri

- [ ] Uygulama açılışı.
- [ ] Kayıt formu.
- [ ] E-posta bağlantısı.
- [ ] Giriş formu.
- [ ] Şifre sıfırlama bağlantısı.
- [ ] Alt menü.
- [ ] Fiyat listesi.
- [ ] Altın detay ekranı.
- [ ] Hesaplama klavyesi.
- [ ] Tarih seçici.
- [ ] Portföy ekleme.
- [ ] Portföy düzenleme.
- [ ] Portföy silme.
- [ ] Tema değiştirme.
- [ ] Çıkış.
- [ ] Hesap silme.
- [ ] İnternet kapalı durumu.
- [ ] Yavaş bağlantı.
- [ ] Uygulama arka plan ve ön plan geçişi.
- [ ] Farklı yazı boyutları.

---

## Faz 14.3: iOS testleri

- [ ] Uygulama açılışı.
- [ ] Safe Area.
- [ ] Kayıt ve giriş klavyesi.
- [ ] E-posta bağlantısı.
- [ ] Şifre sıfırlama bağlantısı.
- [ ] Alt menü.
- [ ] Geri kaydırma hareketi.
- [ ] Hesaplama klavyesi.
- [ ] Tarih seçici.
- [ ] Portföy işlemleri.
- [ ] Tema değiştirme.
- [ ] Secure storage.
- [ ] Çıkış sonrası önbellek.
- [ ] Hesap silme.
- [ ] İnternet kapalı durumu.
- [ ] Uygulama arka plan ve ön plan geçişi.

---

## Faz 14.4: Kullanıcı ayrılığı güvenlik testleri

- [ ] A kullanıcısı yalnızca kendi profilini görüyor.
- [ ] B kullanıcısı yalnızca kendi profilini görüyor.
- [ ] A kullanıcısı yalnızca kendi tercihlerini görüyor.
- [ ] A kullanıcısı yalnızca kendi portföyünü görüyor.
- [ ] B kullanıcısı yalnızca kendi portföyünü görüyor.
- [ ] A kullanıcısı B'nin kayıt kimliğiyle detay alamıyor.
- [ ] A kullanıcısı B'nin kayıt kimliğiyle güncelleme yapamıyor.
- [ ] A kullanıcısı B'nin kayıt kimliğiyle silme yapamıyor.
- [ ] Manipüle edilmiş `user_id` kabul edilmiyor.
- [ ] Service role anahtarı istemci paketinde bulunmuyor.

---

# 21. Mağaza hazırlığı

## Faz 15: Uygulama kimliği ve sürümleme

- [ ] Kesin uygulama adını doğrula.
- [ ] Android package kimliğini doğrula.
- [ ] iOS bundle identifier değerini doğrula.
- [ ] Uygulama sürüm numarası politikasını belirle.
- [ ] Android versionCode politikasını belirle.
- [ ] iOS buildNumber politikasını belirle.
- [ ] Development, Preview ve Production EAS profillerini oluştur.

---

## Faz 15.1: Görsel mağaza varlıkları

- [ ] Son uygulama logosunu tasarla.
- [ ] Android adaptive icon oluştur.
- [ ] iOS icon setini oluştur.
- [ ] Splash screen görselini oluştur.
- [ ] Açık ve koyu arka planda logoyu test et.
- [ ] Google Play ekran görüntülerini hazırla.
- [ ] App Store ekran görüntülerini hazırla.
- [ ] Görsellerde gerçek kullanıcı verisi kullanma.
- [ ] Görsellerde yanıltıcı fiyat veya kazanç iddiası kullanma.

---

## Faz 15.2: Mağaza metinleri

- [ ] Kısa açıklamayı yaz.
- [ ] Uzun açıklamayı yaz.
- [ ] Anahtar kelime yaklaşımını hazırla.
- [ ] Finansal bilgilendirmeyi mağaza metnine ekle.
- [ ] Destek e-posta adresini hazırla.
- [ ] Gizlilik politikası URL'sini hazırla.
- [ ] Hesap silme bilgi URL'sini hazırla.
- [ ] Kullanım koşulları URL'sini hazırla.
- [ ] Uygulama kategorisini doğrula.
- [ ] Yaş derecelendirmesini doğru doldur.

---

## Faz 15.3: Google Play hazırlığı

- [ ] Google Play geliştirici hesabını hazırla.
- [ ] Uygulama kaydını oluştur.
- [ ] Kapalı test gereksinimlerini doğrula.
- [ ] Data Safety formunu doldur.
- [ ] Hesap silme bilgisini ekle.
- [ ] Gizlilik politikası bağlantısını ekle.
- [ ] Uygulama erişim talimatlarını hazırla.
- [ ] Test hesabı gerekiyorsa güvenli test hesabı oluştur.
- [ ] İç test sürümünü yükle.
- [ ] Kapalı test sürümünü yükle.
- [ ] Mağaza uyarılarını çöz.

---

## Faz 15.4: App Store hazırlığı

- [ ] Apple Developer hesabını hazırla.
- [ ] App Store Connect uygulama kaydını oluştur.
- [ ] App Privacy beyanını doldur.
- [ ] Hesap silme akışını inceleme için açıkla.
- [ ] Gizlilik politikası bağlantısını ekle.
- [ ] TestFlight sürümünü yükle.
- [ ] Test kullanıcılarını ekle.
- [ ] iPhone ekran görüntülerini yükle.
- [ ] App Review açıklamalarını hazırla.
- [ ] İnceleme test hesabını hazırla.
- [ ] Mağaza uyarılarını çöz.

---

# 22. V1 yayımlama öncesi son kontrol

## P0 kontrol listesi

- [ ] Bütün V1 başarı ölçütleri karşılanıyor.
- [ ] Android testleri tamamlandı.
- [ ] iOS testleri tamamlandı.
- [ ] RLS güvenlik testleri tamamlandı.
- [ ] Hesap silme testi tamamlandı.
- [ ] Fiyat sağlayıcısı ticari kullanımı doğrulandı.
- [ ] Eski fiyat davranışı test edildi.
- [ ] Fiyat yok davranışı test edildi.
- [ ] Kısmi portföy özeti test edildi.
- [ ] Gerçek fiyat ile test fiyatı karıştırılmıyor.
- [ ] Gizli anahtar taraması temiz.
- [ ] Üretim loglarında hassas veri yok.
- [ ] KVKK belgeleri hukuk uzmanı tarafından kontrol edildi.
- [ ] Google Play Data Safety gerçek davranışla uyumlu.
- [ ] App Store App Privacy gerçek davranışla uyumlu.
- [ ] Destek kanalı çalışıyor.
- [ ] Hesap silme bağlantısı ve uygulama içi akış çalışıyor.
- [ ] Son production yedeği ve geri dönüş planı hazır.
- [ ] Production migrationları doğrulandı.
- [ ] Son Git etiketi veya sürüm kaydı oluşturuldu.

---

# 23. V1'de tamamlanmış sayılmayacak durumlar

Aşağıdaki durumlarda V1 tamamlanmış kabul edilmez:

- Uygulama yalnızca Android'de çalışıyorsa
- iOS akışı gerçek yöntemle test edilmediyse
- Kullanıcı A, B'nin verisine erişebiliyorsa
- Fiyat API anahtarı mobil uygulamada bulunuyorsa
- Fiyat sağlayıcısı ticari kullanım izni doğrulanmadıysa
- Fiyat bulunmadığında `0 TL` gösteriliyorsa
- Eski fiyat canlı fiyat gibi gösteriliyorsa
- Hesap silme yalnızca hesabı pasifleştiriyorsa
- Hesap silme yarıda kaldığında kullanıcıya başarı gösteriliyorsa
- Portföy hesaplamaları test edilmediyse
- KVKK ve mağaza beyanları hazırlanmadıysa
- Production'da test verileri bulunuyorsa
- Gizli dosyalar GitHub'a gönderildiyse

---

# 24. V2 görev havuzu

Aşağıdaki görevler V1'e alınmayacaktır:

- [ ] Favori altınlar
- [ ] Fiyat alarmları
- [ ] Anlık bildirimler
- [ ] Günlük fiyat grafikleri
- [ ] Haftalık fiyat grafikleri
- [ ] Aylık fiyat grafikleri
- [ ] Portföy performans grafikleri
- [ ] Satış kaydı
- [ ] Kısmi satış
- [ ] Gerçekleşmiş kâr-zarar
- [ ] Ağırlıklı ortalama maliyet
- [ ] Çoklu altın hesaplama sepeti
- [ ] PDF raporu
- [ ] Excel raporu
- [ ] Google ile giriş
- [ ] Apple ile giriş
- [ ] Çoklu dil
- [ ] Çoklu para birimi
- [ ] Haber sistemi
- [ ] Reklam
- [ ] Premium üyelik
- [ ] Uygulama içi ödeme
- [ ] Fatura fotoğrafı
- [ ] Kamera ile fiş tarama
- [ ] Konum ve harita
- [ ] Kuyumcu bulma
- [ ] Aile portföyü
- [ ] Portföy paylaşımı
- [ ] Web uygulaması
- [ ] Gelişmiş yönetici paneli

---

# 25. Tamamlanan işler

## Dokümantasyon denetimleri

- [x] Birinci belgeler arası tutarlılık denetimi tamamlandı.
- [x] İkinci çapraz denetimde bulunan şema ve akış tutarsızlıkları giderildi.
- [x] Üçüncü çapraz denetimde bulunan kapsam ve özet tutarsızlıkları giderildi.
- [x] `README.md` V1 kapsam dışı özellikler listesi ana kapsam kararıyla eşitlendi.
- [x] `README.md` gizlilik özeti veri envanteriyle eşitlendi.
- [x] `README.md` portföy özeti veritabanı ve API alanlarıyla eşitlendi.
- [x] `KNOWN_ISSUES.md` ertelenen kayıt numaralandırması açıklandı.

## Ürün ve kapsam

- [x] Uygulamanın temel fikri belirlendi.
- [x] Hedef kullanıcı grubu belirlendi.
- [x] Android ve iOS desteği zorunlu hâle getirildi.
- [x] Çok sayfalı yapı kararlaştırıldı.
- [x] V1 kapsamı belirlendi.
- [x] V1 kapsam dışı özellikler belirlendi.
- [x] Ana menü yapısı belirlendi.
- [x] Ana kullanıcı akışları çıkarıldı.

## Marka ve tasarım

- [x] `Altın İz` çalışma adı belirlendi.
- [x] Slogan belirlendi.
- [x] Modern, sade ve güvenilir tasarım yönü belirlendi.
- [x] Gece laciverti, mat altın ve kırık beyaz renk yaklaşımı belirlendi.

## Teknoloji

- [x] React Native seçildi.
- [x] Expo seçildi.
- [x] TypeScript seçildi.
- [x] Expo Router seçildi.
- [x] Supabase backend olarak seçildi.
- [x] PostgreSQL seçildi.
- [x] Supabase Auth seçildi.
- [x] RLS zorunlu güvenlik yaklaşımı olarak seçildi.
- [x] REST fiyat entegrasyonu kararlaştırıldı.
- [x] WebSocket V1 kapsamından çıkarıldı.

## Hesaplama ve veri

- [x] Satın alma hesabında satış fiyatı kullanılması kararlaştırıldı.
- [x] Bozdurma hesabında alış fiyatı kullanılması kararlaştırıldı.
- [x] Portföy değerinde alış fiyatı kullanılması kararlaştırıldı.
- [x] Kâr-zarar formülü kesinleştirildi.
- [x] Yüzde formülü kesinleştirildi.
- [x] Para tutarlarının kuruş olarak saklanması kararlaştırıldı.
- [x] Miktarın `NUMERIC(18,3)` olması kararlaştırıldı.
- [x] Her alışın ayrı kayıt olması kararlaştırıldı.
- [x] Fiyat yokken `0 TL` kullanılmaması kararlaştırıldı.
- [x] Kısmi toplam davranışı belirlendi.
- [x] Eski fiyat davranışı belirlendi.

## Dokümantasyon

- [x] `PROJECT_CONTEXT.md` (1.1 Taslak) hazırlandı.
- [x] `ARCHITECTURE.md` (0.2 Taslak) hazırlandı.
- [x] `DATABASE.md` (1.2) hazırlandı.
- [x] `API.md` (0.2 Taslak) hazırlandı.
- [x] `DECISIONS.md` (1.1) hazırlandı.
- [x] `TODO.md` (1.2 Taslak) hazırlandı.
- [x] `CHANGELOG.md` (1.3 Taslak) hazırlandı.
- [x] `KNOWN_ISSUES.md` (1.2 Taslak) hazırlandı.
- [x] `HANDOFF.md` (1.3 Taslak) hazırlandı.
- [x] `SECURITY.md` (1.1 Taslak) hazırlandı.
- [x] `PRIVACY.md` (1.0 Taslak) hazırlandı.
- [x] `DATA_RETENTION.md` (1.0 Taslak) hazırlandı.
- [x] `.github/copilot-instructions.md` (1.1 Taslak) hazırlandı.
- [x] `README.md` (1.2 Taslak) hazırlandı.

---

# 26. Engellenen işler

Şu anda kodlamadan önce tamamlanması gereken doğrudan hazırlıklar:

- Bilgisayardaki mevcut geliştirme araçlarının kontrolü
- Güncel Expo gereksinimlerinin resmî kaynaktan doğrulanması
- İlk çalışan proje ile birlikte Git deposunun oluşturulması

Production yayımlama aşamasını ayrıca engelleyen konular:

- Supabase production bölgesi ve yurt dışına veri aktarımı kararı
- Fiyat sağlayıcısının ticari lisansı ve gerçek sembolleri
- Veri saklama süreleri
- Hesap silme kısmi hata telafisi
- Hukuk uzmanı onaylı yasal metinler

Bu ayrım geliştirme ortamı hazırlığı ile production engellerinin birbirine karıştırılmaması için yapılmıştır.

---

# 27. Sıradaki kesin görev

```text
Bilgisayardaki mevcut geliştirme araçlarını kontrol etmek
```

Bu görev `Faz 1` altında yürütülecektir. Önce mevcut durum tespit edilecek, daha sonra yalnızca gerçekten eksik ve güncel gereksinim olan araçlar için kurulum planı hazırlanacaktır.

---

# 28. Belge güncelleme kuralları

Bu dosya aşağıdaki durumlarda güncellenmelidir:

- Yeni görev eklendiğinde
- Görev başladığında
- Görev tamamlandığında
- Görev engellendiğinde
- Görev V1 kapsamından çıkarıldığında
- Yeni teknik karar verildiğinde
- Bir belge tamamlandığında
- Kodlama aşaması değiştiğinde
- Test sonucu alındığında
- Mağaza hazırlığı başladığında
- Sıradaki kesin görev değiştiğinde

Görev tamamlandı olarak işaretlenirken:

1. İlgili test yapılmış olmalıdır.
2. Beklenen sonuç görülmüş olmalıdır.
3. Hata yoksa Git kaydı oluşturulmalıdır.
4. İlgili belgeler güncellenmelidir.
5. `CHANGELOG.md` güncellenmelidir.
6. Oturum sonunda `HANDOFF.md` güncellenmelidir.

---

# 29. Sürüm geçmişi

## 1.2 Taslak - 19.10.2026

- Üçüncü ve dördüncü belge çapraz denetim görevleri tamamlandı olarak işaretlendi.
- `user_legal_events` doğrudan istemci `INSERT` yasağı ve güvenli RPC / Edge Function görevleri Faz 4.4, Faz 4.5 ve Faz 11.2'ye işlendi.
- `user_preferences` için `theme` alanı kısıtı ve `BEFORE UPDATE` tetikleyici görevi Faz 4.4'e eklendi.
- Bölüm 25'teki tamamlanan dokümantasyon sürüm numaraları güncel belge sürümleriyle eşitlendi.

## 1.1 Taslak - 03.09.2026

- 14 başlangıç belgesi tamamlandı olarak işaretlendi.
- Çapraz tutarlılık kontrolü tamamlandı olarak kaydedildi.
- Tamamlanan dokümantasyon listesi güncellendi.
- Kodlamayı bekleten hazırlıklar production engellerinden ayrıldı.
- Sıradaki görev geliştirme araçlarının kontrolü olarak güncellendi.

## 1.0 Taslak - 03.09.2026

- Başlangıç dokümantasyon görevleri eklendi.
- Supabase ve fiyat sağlayıcısı karar görevleri eklendi.
- Geliştirme ortamı kurulum görevleri eklendi.
- Expo proje iskeleti görevleri eklendi.
- Supabase migration ve RLS görevleri eklendi.
- Kullanıcı hesabı geliştirme görevleri eklendi.
- Fiyat sistemi görevleri eklendi.
- Hesaplama ve portföy görevleri eklendi.
- Ayarlar, yasal belgeler ve hesap silme görevleri eklendi.
- Güvenlik, gizlilik ve test görevleri eklendi.
- Google Play ve App Store hazırlık görevleri eklendi.
- V2 görev havuzu oluşturuldu.
- Tamamlanan ve engellenen işler ayrı bölümlere ayrıldı.
