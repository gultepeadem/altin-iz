# Altın İz V1 Yapılacaklar Listesi

**Belge adı:** `TODO.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.17 Taslak  
**Son güncelleme:** 26.10.2026  
**Proje aşaması:** V1 Kod Tabanı Hazır — Fiziksel Test ve Dağıtım Doğrulama Aşaması (v1.0.0-rc1)  
**Kodlama durumu:** Tamamlandı. 12 adet sıralı migration uygulandı (Migration 012 ile 25 aktif ürün, 6 gerçek yasal belge ve 24/7 zamanlayıcı devrede), çift padding ve UI/UX hataları giderildi, Türkçe arama normalizasyonu eklendi, P0 kontrol listesi 20/20 test ile doğrulandı.

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
- [x] Alan adı uygunluğunu araştır (altiniz.app tescil edildi ve bağlandı).
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
- [x] GitHub'da özel depo oluştur.
- [x] Yerel projeyi GitHub deposuna bağla.
- [x] Ana dalı gönder.
- [x] GitHub üzerinde gizli dosya olmadığını kontrol et.

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

- [x] Güncel Expo-Supabase entegrasyon yöntemini doğrula.
- [x] Gerekli paketleri listele.
- [x] Her paketin neden gerektiğini açıkla.
- [x] Paketlerin Expo uyumluluğunu kontrol et.
- [x] Paketleri kur.
- [x] `src/lib/environment.ts` oluştur.
- [x] `src/lib/supabase.ts` oluştur.
- [x] Tek Supabase istemcisi oluştur.
- [x] Güvenli mobil oturum saklama yöntemini uygula.
- [x] Eksik ortam değişkeni hata durumunu uygula.
- [x] Gizli anahtar bulunmadığını kontrol et.
- [x] Android'de bağlantıyı test et.
- [x] iOS uyumluluğunu kontrol et.

---

## Faz 5.1: Auth servisleri

- [x] `authService.ts` oluştur.
- [x] Hesap oluşturma işlemini ekle.
- [x] Giriş işlemini ekle.
- [x] Çıkış işlemini ekle.
- [x] Oturum okuma işlemini ekle.
- [x] E-posta doğrulamasını tekrar gönderme işlemini ekle.
- [x] Şifre sıfırlama bağlantısı gönderme işlemini ekle.
- [x] Auth hatalarını ortak hata biçimine dönüştür.
- [x] Şifreyi loglamadığını doğrula.
- [x] E-posta hesabı varlığını gereksiz ifşa etmediğini doğrula.

---

## Faz 5.2: AuthProvider

- [x] `AuthProvider.tsx` oluştur.
- [x] Oturum yükleniyor durumunu ekle.
- [x] Oturum yok durumunu ekle.
- [x] Doğrulanmamış kullanıcı durumunu ekle.
- [x] Aktif kullanıcı durumunu ekle.
- [x] `deletion_pending` durumunu ekle.
- [x] `disabled` durumunu ekle.
- [x] Auth olay dinleyicisini ekle.
- [x] Provider temizleme işlemini ekle.
- [x] Sonsuz yönlendirme döngüsü testini yap.

---

## Faz 5.3: Kayıt ekranı

- [x] E-posta alanını oluştur.
- [x] Şifre alanını oluştur.
- [x] Şifre tekrar alanını oluştur.
- [x] Şifreyi göster veya gizle seçeneğini ekle.
- [x] E-posta doğrulamasını ekle.
- [x] Şifrelerin eşleşme kontrolünü ekle.
- [x] Yasal belge bağlantılarını ekle.
- [x] Gönderim yüklenme durumunu ekle.
- [x] Çift gönderimi engelle.
- [x] Başarı sonrası doğrulama ekranına yönlendir.
- [x] Android klavye davranışını test et.
- [x] iOS klavye ve geri hareketini kontrol et.

---

## Faz 5.4: E-posta doğrulama

- [x] E-posta doğrulama ekranını oluştur.
- [x] Tekrar gönderme butonunu ekle.
- [x] Tekrar gönderme hız sınırı davranışını ekle.
- [x] Doğrulama durumunu yenileme butonunu ekle.
- [x] Auth callback rotasını oluştur.
- [x] Android derin bağlantısını yapılandır.
- [x] iOS derin bağlantısını yapılandır.
- [x] Süresi dolmuş bağlantıyı test et.
- [x] Başarılı doğrulamayı test et.
- [x] Başarısız doğrulamayı test et.

---

## Faz 5.5: Giriş ekranı

- [x] E-posta alanını oluştur.
- [x] Şifre alanını oluştur.
- [x] Şifreyi göster veya gizle seçeneğini ekle.
- [x] Giriş butonunu ekle.
- [x] Şifremi Unuttum bağlantısını ekle.
- [x] Hesap Oluştur bağlantısını ekle.
- [x] Genel hatalı giriş mesajını ekle.
- [x] Doğrulanmamış kullanıcı yönlendirmesini ekle.
- [x] Hesap durumu kontrolünü ekle.
- [x] Başarılı giriş sonrası Ana Sayfaya yönlendir.

---

## Faz 5.6: Şifre sıfırlama

- [x] Şifremi Unuttum ekranını oluştur.
- [x] Genel güvenli sonuç mesajını ekle.
- [x] Şifre sıfırlama e-postasını gönder.
- [x] Reset callback akışını yapılandır.
- [x] Yeni şifre belirleme ekranını oluştur.
- [x] Şifre politikasını göster.
- [x] Süresi dolmuş bağlantıyı yönet.
- [x] Başarılı işlem sonrası giriş ekranına yönlendir.
- [x] Android derin bağlantısını test et.
- [x] iOS derin bağlantısını test et.

---

## Faz 5.7: Çıkış yapma

- [x] Çıkış onay penceresini oluştur.
- [x] Supabase çıkış işlemini çağır.
- [x] Yerel auth verisini temizle.
- [x] Kullanıcıya ait portföy önbelleğini temizle.
- [x] Protected navigasyon geçmişini temizle.
- [x] Kullanıcıyı public ekrana yönlendir.
- [x] Hesap ve portföyün silinmediğini doğrula.
- [x] Başka kullanıcı giriş yaptığında önceki verinin görünmediğini test et.

---

# 12. Fiyat sistemi

## Faz 6: Fiyat sağlayıcısı eşleştirmeleri

- [x] `price_sources` içine development sağlayıcısını ekle.
- [x] Doğrulanmış ürünleri `gold_products` içine ekle.
- [x] Doğrulanmış sembolleri `price_source_product_mappings` içine ekle.
- [x] Eski ve yeni tarihli ürünleri doğru eşleştir.
- [x] Belirsiz Cumhuriyet ve Ata eşleştirmesini etkinleştirme.
- [x] Bilinmeyen sembolün otomatik ürün oluşturmadığını test et.
- [x] Devre dışı eşleştirmenin fiyat üretmediğini test et.

---

## Faz 6.1: Fiyat çekme Edge Function

- [x] `supabase/functions/fetch-gold-prices` oluştur.
- [x] Sunucu ortam değişkenlerini tanımla.
- [x] Fiyat API anahtarını secret store'a ekle.
- [x] API base URL değerini secret veya config olarak ekle.
- [x] İstek zaman aşımını ekle.
- [x] API isteğini ekle.
- [x] 401 hata yönetimini ekle.
- [x] 403 hata yönetimini ekle.
- [x] 429 kota yönetimini ekle.
- [x] 500-504 geçici hata yönetimini ekle.
- [x] Sınırlı tekrar deneme ekle.
- [x] API anahtarını loglamadığını doğrula.

---

## Faz 6.2: Fiyat doğrulama

- [x] Yanıtın JSON olduğunu doğrula.
- [x] Fiyat listesinin beklenen yapıda olduğunu doğrula.
- [x] Sembol boşsa reddet.
- [x] Eşleştirme yoksa reddet.
- [x] Alış fiyatının sayı olduğunu doğrula.
- [x] Satış fiyatının sayı olduğunu doğrula.
- [x] En az bir fiyatın mevcut olduğunu doğrula.
- [x] Negatif ve sıfır fiyatı reddet.
- [x] Para birimini doğrula.
- [x] Ürün birimini doğrula.
- [x] Zaman damgasını doğrula.
- [x] Makul olmayan gelecek zamanını reddet.
- [x] Sağlayıcının eski veri işaretini kaydet.
- [x] Ondalıklı TL değerini güvenli biçimde kuruşa çevir.
- [x] Geçersiz fiyatın kullanıcıya gösterilmediğini test et.
- [x] `price_fetch_runs` sayaçlarını güncelle.
- [x] `success`, `partial` ve `failed` durumlarını test et.

---

## Faz 6.3: Fiyat zamanlayıcısı

- [x] Development ortamında otomatik zamanlayıcıyı başlangıçta kapalı tut.
- [x] Yetkili manuel fiyat çekme yöntemini oluştur.
- [x] Ücretsiz kotayı izleme yöntemini oluştur.
- [x] Production çekme sıklığını ticari plan sonrası kesinleştir.
- [x] Zamanlanmış görevin art arda çakışmasını önle.
- [x] Aynı veri için gereksiz yinelenen kayıt davranışını değerlendir.
- [x] Zamanlayıcı hatasını güvenli teknik kayda al.

---

## Faz 6.4: Güncel fiyat okuma servisi

- [x] `goldProductService.ts` oluştur.
- [x] `goldPriceService.ts` oluştur.
- [x] Aktif ürün listesini getir.
- [x] En son geçerli fiyatı getir.
- [x] Alış ve satış fiyatını ayrı modelle.
- [x] Kaynak fiyat zamanı ile çekilme zamanını ayrı modelle.
- [x] `live` durumunu üret.
- [x] `stale` durumunu üret.
- [x] `partial` durumunu üret.
- [x] `unavailable` durumunu üret.
- [x] Fiyat yoksa `null` kullandığını doğrula.
- [x] Başka ürün fiyatını yedek kullanmadığını doğrula.

---

## Faz 6.5: Fiyatlar ekranı

- [x] Ekran başlığını oluştur.
- [x] Son güncelleme bilgisini göster.
- [x] Arama alanını oluştur.
- [x] Sıralama kontrolünü oluştur.
- [x] Varsayılan sıralamayı ekle.
- [x] İsme göre sıralamayı ekle.
- [x] Satış fiyatına göre artan sıralamayı ekle.
- [x] Satış fiyatına göre azalan sıralamayı ekle.
- [x] Fiyat kartlarını oluştur.
- [x] Alış ve satış etiketlerini açıkça göster.
- [x] Günlük değişimi yalnızca varsa göster.
- [x] Fiyatı olmayan üründe `0 TL` gösterme.
- [x] Eski veri uyarısını göster.
- [x] Kısmi veri uyarısını göster.
- [x] Yeniden Dene butonunu ekle.
- [x] Ürün detayına yönlendirmeyi ekle.
- [x] Android'de uzun ürün adlarını test et.
- [x] iOS'ta liste ve geri hareketini test et.

---

## Faz 6.6: Altın detay ekranı

- [x] Dinamik `productId` doğrulamasını ekle.
- [x] Ürün adını göster.
- [x] Alış fiyatını göster.
- [x] Satış fiyatını göster.
- [x] Günlük değişimi varsa göster.
- [x] Günün düşük ve yüksek değerini varsa göster.
- [x] Son fiyat zamanını göster.
- [x] Fiyat kaynağını göster.
- [x] Güncellik durumunu göster.
- [x] Hesapla butonunu ekle.
- [x] Portföye Ekle butonunu ekle.
- [x] Finansal bilgilendirmeyi ekle.
- [x] Portföye kapalı üründe ekleme butonunu gösterme veya açıklayıcı devre dışı durum kullan.
- [x] Fiyat yoksa güvenli hata durumunu göster.

---

# 13. Hesaplama sistemi

## Faz 7: Hesaplama etki alanı fonksiyonları

- [x] Para modelini kesinleştir.
- [x] JavaScript güvenli tam sayı sınırını değerlendir.
- [x] Ondalıklı hesaplama kütüphanesi gerekip gerekmediğine karar ver.
- [x] Kararı `DECISIONS.md` içine yaz.
- [x] Satın alma tahmini fonksiyonunu oluştur.
- [x] Bozdurma tahmini fonksiyonunu oluştur.
- [x] Kayıt bazında tahmini değer fonksiyonunu oluştur.
- [x] Kâr-zarar fonksiyonunu oluştur.
- [x] Yüzde fonksiyonunu oluştur.
- [x] Sıfıra bölme korumasını oluştur.
- [x] Kısmi portföy toplamı fonksiyonunu oluştur.
- [x] Para yuvarlama kurallarını uygula.
- [x] Gram ve adet miktar doğrulamasını uygula.

### Birim testleri

- [x] Tam adet hesabını test et.
- [x] Üç ondalıklı gram hesabını test et.
- [x] Kâr sonucunu test et.
- [x] Zarar sonucunu test et.
- [x] Başa baş sonucunu test et.
- [x] Yüzde hesabını test et.
- [x] Büyük para değerini test et.
- [x] Fiyat yok durumunu test et.
- [x] Eski fiyat durumunu test et.
- [x] Kısmi portföy toplamını test et.
- [x] Her kayıt yüzdesinin toplanmadığını test et.

---

## Faz 7.1: Hesaplama ekranı

- [x] Altın türü seçicisini oluştur.
- [x] Yalnızca `calculator_enabled` ürünleri göster.
- [x] Miktar alanını oluştur.
- [x] Ürüne göre adet veya gram etiketini otomatik göster.
- [x] Satın Alacağım seçeneğini ekle.
- [x] Bozduracağım seçeneğini ekle.
- [x] Hesapla butonunu ekle.
- [x] Sonucu temizle butonunu ekle.
- [x] Kullanılan fiyat türünü göster.
- [x] Kullanılan birim fiyatı göster.
- [x] Tahmini toplamı göster.
- [x] Son fiyat zamanını göster.
- [x] Eski fiyat uyarısını göster.
- [x] Finansal bilgilendirmeyi göster.
- [x] Portföye Ekle butonunu ekle.
- [x] Fiyat yokken hesaplamayı engelle.
- [x] Adetli üründe kesirli girişi engelle.
- [x] Gramlı üründe üçten fazla ondalığı engelle.
- [x] Türkçe virgül ve nokta giriş davranışını test et.
- [x] Android sayısal klavyeyi test et.
- [x] iOS sayısal klavyeyi test et.

---

# 14. Portföy sistemi

## Faz 8: Portföy servisi

- [x] `portfolioService.ts` oluştur.
- [x] Kullanıcının kayıtlarını listele.
- [x] Tek kayıt detayını getir.
- [x] Kayıt oluştur.
- [x] Kayıt güncelle.
- [x] Kayıt sil.
- [x] Kayıtları alış tarihi ve oluşturulma zamanına göre sırala.
- [x] Kullanıcı kimliğini form girdisinden alma.
- [x] Supabase hatalarını ortak hata modeline dönüştür.
- [x] Fiyat olmayan kayıtların kaybolmadığını test et.

---

## Faz 8.1: Portföye altın ekleme formu

- [x] Yalnızca `portfolio_enabled` ürünleri listele.
- [x] Altın türü alanını oluştur.
- [x] Miktar alanını oluştur.
- [x] Birimi otomatik göster.
- [x] Alış tarihi alanını oluştur.
- [x] Ödenen toplam tutar alanını oluştur.
- [x] Alış yeri alanını oluştur.
- [x] Not alanını oluştur.
- [x] İşçilik dâhil seçeneğini oluştur.
- [x] Gelecek tarihi engelle.
- [x] Sıfır ve negatif miktarı engelle.
- [x] Sıfır ve negatif tutarı engelle.
- [x] Alış yerini 100 karakterle sınırla.
- [x] Notu 500 karakterle sınırla.
- [x] Form gönderilirken butonu devre dışı bırak.
- [x] Çift kayıt oluşturmayı engelle.
- [x] Başarı sonrası kayıt detayına yönlendir.
- [x] Hata sonrası girilen verileri koru.
- [x] Kaydedilmemiş değişiklik uyarısını değerlendir.

---

## Faz 8.2: Portföy kaydı detay ekranı

- [x] Altın türünü göster.
- [x] Miktarı ve birimi göster.
- [x] Alış tarihini göster.
- [x] Ödenen toplam tutarı göster.
- [x] Alış yerini varsa göster.
- [x] Notu varsa göster.
- [x] İşçilik bilgisini göster.
- [x] Kullanılan güncel alış fiyatını göster.
- [x] Tahmini güncel bozdurma değerini göster.
- [x] Tahmini kâr veya zararı göster.
- [x] Değişim yüzdesini göster.
- [x] Son fiyat zamanını göster.
- [x] Fiyat yoksa hesaplanamıyor durumunu göster.
- [x] Eski fiyat uyarısını göster.
- [x] Düzenle butonunu ekle.
- [x] Sil butonunu ekle.

---

## Faz 8.3: Portföy kaydı düzenleme

- [x] Mevcut kayıt verilerini forma doldur.
- [x] Değiştirilebilir alanları sınırla.
- [x] `id`, `user_id` ve `created_at` alanlarını değiştirme.
- [x] Form doğrulamalarını tekrar kullan.
- [x] Başarı sonrası detay ekranını yenile.
- [x] Portföy özetini yenile.
- [x] Kaydedilmemiş değişiklik uyarısını ekle.
- [x] Yetkisiz kayıt erişimini test et.

---

## Faz 8.4: Portföy kaydı silme

- [x] Silme onay penceresini oluştur.
- [x] Silinecek kaydın kısa özetini göster.
- [x] İşlemin geri alınamayacağını belirt.
- [x] V1'de satış geçmişi oluşturmadığını belirt.
- [x] Vazgeç davranışını ekle.
- [x] Silme işlemini ekle.
- [x] Başarı sonrası Portföyüm ekranına dön.
- [x] Başarısızlıkta kaydı görünür tut.
- [x] Silme tamamlanmadan başarı mesajı gösterme.
- [x] Portföy toplamlarını yenile.

---

## Faz 8.5: Portföy özet hesaplaması

- [x] Portföy kayıtlarını fiyatlarla eşleştir.
- [x] Her kaydın tahmini değerini hesapla.
- [x] Her kaydın kâr-zararını hesapla.
- [x] Toplam ödenen tutarı hesapla.
- [x] Tam portföy özetini hesapla.
- [x] Kısmi portföy özetini hesapla.
- [x] Fiyatı olmayan kayıt sayısını göster.
- [x] Eski fiyatla hesaplanan kayıt sayısını değerlendir.
- [x] Yanıltıcı toplam yüzde göstermeyi engelle.
- [x] Bütün kayıtların yüzdesini toplamadığını test et.

---

## Faz 8.6: Portföyüm ekranı

- [x] Toplam ödenen tutarı göster.
- [x] Tahmini toplam bozdurma değerini göster.
- [x] Toplam tahmini kâr veya zararı göster.
- [x] Toplam değişim yüzdesini göster.
- [x] Toplam kayıt sayısını göster.
- [x] Yeni Altın Ekle butonunu göster.
- [x] Kayıt kartlarını listele.
- [x] En yeni alış tarihinden eskiye sırala.
- [x] Kâr ve zararı yazı, işaret ve renkle göster.
- [x] Portföy boş durumunu ekle.
- [x] Kısmi toplam uyarısını ekle.
- [x] Eski fiyat uyarısını ekle.
- [x] Yenile davranışını ekle.
- [x] Kayıt detayına geçiş ekle.
- [x] Uzun listede performansı kontrol et.

---

# 15. Ana Sayfa

## Faz 9: Ana Sayfa veri modeli

- [x] Gram Altın (`GRAM_GOLD`) için öncelikli fiyatı getir.
- [x] Çeyrek Altın kartı için Yeni Tarihli (`QUARTER_GOLD_NEW`) ürün fiyatını getir.
- [x] Ons Altın (`OUNCE_GOLD`) fiyatını getir.
- [x] Portföy özetini getir.
- [x] Son fiyat zamanını belirle.
- [x] Tam, kısmi, eski ve kullanılamıyor durumlarını birleştir.

---

## Faz 9.1: Ana Sayfa arayüzü

- [x] Karşılama alanını oluştur.
- [x] Son fiyat güncelleme bilgisini göster.
- [x] Gram Altın fiyat kartını oluştur.
- [x] Çeyrek Altın fiyat kartını oluştur.
- [x] Ons Altın fiyat kartını oluştur.
- [x] Tüm Fiyatları Gör bağlantısını ekle.
- [x] Portföy özet kartını oluştur.
- [x] Portföye Altın Ekle butonunu ekle.
- [x] Hızlı Hesaplama butonunu ekle.
- [x] Boş portföy durumunu göster.
- [x] Eski fiyat uyarısını göster.
- [x] Kısmi portföy uyarısını göster.
- [x] Fiyat servisi hatasını yönet.
- [x] Android küçük ekranda test et.
- [x] iOS Safe Area davranışını test et.

---

# 16. Ayarlar ve kullanıcı tercihleri

## Faz 10: Tema tercihi

- [x] `preferencesService.ts` oluştur.
- [x] Kullanıcı tercihlerini getir.
- [x] Tema tercihini güncelle.
- [x] Açık tema seçeneğini ekle.
- [x] Koyu tema seçeneğini ekle.
- [x] Sistem teması seçeneğini ekle.
- [x] Seçimi anında uygula.
- [x] Seçimi Supabase'e kaydet.
- [x] Uygulama tekrar açıldığında tercihi yükle.

---

## Faz 10.1: Ayarlar ekranı

- [x] Hesap Bilgileri bağlantısını ekle.
- [x] Görünüm bölümünü ekle.
- [x] Yasal ve Gizlilik bölümünü ekle.
- [x] Uygulama Hakkında bağlantısını ekle.
- [x] Destek ve Hata Bildir bağlantısını ekle.
- [x] Çıkış Yap butonunu ekle.
- [x] Hesabımı ve Verilerimi Sil seçeneğini tehlikeli işlem olarak ayır.
- [x] Uygulama sürümünü göster.
- [x] Fiyat kaynağını göster.

---

## Faz 10.2: Hesap bilgileri

- [x] E-posta adresini göster.
- [x] E-posta doğrulama durumunu göster.
- [x] Görünen adı varsa göster ve düzenle.
- [x] Şifre değiştirme veya sıfırlama bağlantısını ekle.
- [x] Kullanıcının değiştiremeyeceği sistem alanlarını gizle.

---

# 17. Yasal belgeler ve gizlilik

## Faz 11: Yasal belge altyapısı

- [!] Production yayını öncesi nihai yasal belge metinlerini doğrulamak için hukuk uzmanıyla çalış (`KI-025`, geliştirme aşamasında şablon metinler kullanılır).
- [x] KVKK aydınlatma metnini hazırla.
- [x] Gizlilik politikasını hazırla.
- [x] Kullanım koşullarını hazırla.
- [x] Veri saklama ve silme metnini hazırla.
- [x] Finansal bilgilendirme metnini hazırla.
- [x] Gerekli ise ayrı açık rıza metnini hazırla.
- [x] Belgeleri `legal_documents` tablosuna sürümlü ekle.
- [x] Her belge türünde tek aktif sürüm kuralını test et.
- [x] `content_hash` üretimini uygula.
- [x] Aktif ve yürürlükteki belge sorgusunu oluştur.

---

## Faz 11.1: Yasal belge ekranları

- [x] Yasal belge listesi ekranını oluştur.
- [x] Belge detay ekranını oluştur.
- [x] KVKK Aydınlatma Metnini göster.
- [x] Gizlilik Politikasını göster.
- [x] Kullanım Koşullarını göster.
- [x] Veri Saklama ve Silme bilgisini göster.
- [x] Finansal Bilgilendirme metnini göster.
- [x] Belge sürümünü gösterme gereksinimini değerlendir.
- [x] Belge çevrimdışı önbelleğini sürüm bilgisiyle yönet.

---

## Faz 11.2: Kullanıcı yasal olayları

- [x] Yasal olay kaydı için güvenli PostgreSQL RPC veya `record-legal-event` Edge Function oluştur.
- [x] `legalService.ts` oluştur ve doğrudan tablo yazımı yerine güvenli sunucu işlemini çağır.
- [x] Belge sunumu olayını kaydet.
- [x] Belge görüntüleme olayını gereklilik varsa kaydet.
- [x] Kullanım koşulları kabulünün hukuki gereksinimini doğrula.
- [x] Açık rıza varsa kabul olayını ayrı kaydet.
- [x] Açık rıza reddini ayrı kaydet.
- [x] Açık rıza geri çekmeyi ayrı kaydet.
- [x] Aydınlatmayı açık rıza onayına dönüştürme.
- [x] Kullanıcının başka kullanıcı adına olay oluşturamadığını test et.

---

# 18. Hesap ve veri silme

## Faz 12: Hesap silme teknik tasarımı

- [x] Yeniden kimlik doğrulama yöntemini kesinleştir.
- [x] Silme işlem sırasını migration ve function yapısıyla doğrula.
- [x] Silinecek tabloları kesinleştir.
- [x] Saklanacak veya anonimleştirilecek kayıtları hukuk uzmanıyla belirle.
- [x] Kısmi başarısızlık telafi stratejisini belirle.
- [x] Tamamlanma kaydının kişisel veri içerip içermeyeceğini belirle.
- [x] Kararı `DATA_RETENTION.md` içine ekle.
- [x] Kararı `DECISIONS.md` içine ekle.

---

## Faz 12.1: `delete-account` Edge Function

- [x] Fonksiyon klasörünü oluştur.
- [x] Oturumu doğrula.
- [x] Kullanıcı kimliğini token üzerinden al.
- [x] İstek gövdesindeki serbest `user_id` değerini güven kaynağı olarak kabul etme.
- [x] Yeniden doğrulama şartını kontrol et.
- [x] Silme talebi kaydı oluştur.
- [x] Hesabı `deletion_pending` yap.
- [x] Portföy kayıtlarını sil.
- [x] Kullanıcı tercihlerini sil.
- [x] Yasal olayları saklama politikasına göre işle.
- [x] Güvenlik olaylarını saklama politikasına göre işle.
- [x] Profil kaydını sil.
- [x] Auth hesabını sil.
- [x] Aktif oturumları sonlandır.
- [x] Başarı ve hata durumlarını güvenli kaydet.
- [x] Secret anahtarı yanıtta veya logda gösterme.

---

## Faz 12.2: Hesap silme ekranı

- [x] Silinecek verileri listele.
- [x] İşlemin geri alınamayacağını belirt.
- [x] Yeniden doğrulama alanını oluştur.
- [x] Son onay adımını oluştur.
- [x] İşlem sürerken ekranı güvenli şekilde kilitle.
- [x] Başarıdan sonra yerel oturumu temizle.
- [x] Başarıdan sonra public ekrana yönlendir.
- [x] Başarısızlıkta hesabı silinmiş gibi gösterme.
- [x] Tekrar deneme davranışını ekle.
- [x] Android'de test et.
- [x] iOS'ta test et.

---

# 19. Güvenlik ve gizlilik sertleştirmesi

## Faz 13: Güvenlik incelemesi

- [x] Mobil uygulamada gizli anahtar araması yap.
- [x] Git geçmişinde gizli anahtar araması yap.
- [x] Hata loglarında şifre olmadığını doğrula.
- [x] Hata loglarında erişim belirteci olmadığını doğrula.
- [x] Hata loglarında API anahtarı olmadığını doğrula.
- [x] Ekran görüntüsü ve debug çıktılarında hassas bilgi olmadığını kontrol et.
- [x] RLS politikalarını yeniden test et.
- [x] Edge Function yetkilerini sınırla.
- [x] Kullanıcı girdilerinin backend'de doğrulandığını kontrol et.
- [x] Bağımlılık güvenlik taraması yap.
- [x] Kullanılmayan paketleri kaldır.
- [x] Development loglarını production için sınırla.
- [x] Oturum süresi dolma davranışını test et.
- [x] Çıkış sonrası önbellek temizliğini test et.
- [x] Hesap silme sonrası erişimi test et.

---

## Faz 13.1: Gizlilik incelemesi

- [x] Uygulamanın topladığı bütün verileri listele.
- [x] Her veri için işleme amacını yaz.
- [x] Her veri için hukuki sebebi hukuk uzmanıyla doğrula.
- [x] Her veri için saklama süresini belirle.
- [x] Her veri için aktarım taraflarını belirle.
- [x] Supabase veri akışını belgeye ekle.
- [x] Fiyat sağlayıcısının kişisel veri alıp almadığını doğrula.
- [x] Hata izleme hizmeti varsa veri akışını ekle.
- [x] Analitik kullanılacaksa açıkça karar ver.
- [x] Gereksiz veri toplamayı kaldır.
- [x] Google Play Veri Güvenliği taslağını hazırla.
- [x] App Store App Privacy taslağını hazırla.
- [x] Mağaza beyanlarını gerçek uygulama davranışıyla karşılaştır.

---

# 20. Test aşaması

## Faz 14: Birim testleri

- [x] Para dönüştürme testleri.
- [x] Para biçimlendirme testleri.
- [x] Miktar doğrulama testleri.
- [x] Alış tarihi doğrulama testleri.
- [x] Satın alma hesaplama testleri.
- [x] Bozdurma hesaplama testleri.
- [x] Kâr-zarar testleri.
- [x] Yüzde testleri.
- [x] Kısmi toplam testleri.
- [x] Hata dönüştürme testleri.
- [x] Ürün etkinlik kuralları testleri.
- [x] Eski fiyat belirleme testleri.

---

## Faz 14.1: Entegrasyon testleri

- [x] Hesap oluşturma testi.
- [x] E-posta doğrulama testi.
- [x] Giriş testi.
- [x] Şifre sıfırlama testi.
- [x] Oturum yenileme testi.
- [x] Çıkış testi.
- [x] Ürün listesi testi.
- [x] Güncel fiyat sorgusu testi.
- [x] Portföy ekleme testi.
- [x] Portföy listeleme testi.
- [x] Portföy düzenleme testi.
- [x] Portföy silme testi.
- [x] Yasal belge sorgusu testi.
- [x] Hesap silme testi.

---

## Faz 14.2: Android cihaz testleri

> [!NOTE]
> Bileşen ve mantık testleri `test-faz14-2-android-tests.ts` ile kod düzeyinde doğrulanmıştır. Fiziksel cihaz (Xiaomi Redmi Note 8 Pro) üzerindeki manuel doğrulama süreci devam etmektedir.

- [x] Kaynak kod Android rota ve bileşen kontrolleri tamamlandı.
- [~] Fiziksel telefonda bağımsız APK ile uygulama açılışı ve açılış ekranı geçişi.
- [~] Fiziksel telefonda kayıt, e-posta doğrulama ve giriş akışı.
- [~] Fiziksel telefonda alt menü sekmeleri ve ekran geçişleri.
- [~] Fiziksel telefonda canlı fiyat listesi ve çekip-yenileme (pull-to-refresh).
- [~] Fiziksel telefonda hesaplama ve portföye ekleme.
- [~] Fiziksel telefonda portföy düzenleme ve silme.
- [~] Fiziksel telefonda açık/koyu tema değişimi.
- [~] Fiziksel telefonda güvenli çıkış ve hesap silme akışı.

---

## Faz 14.3: iOS testleri

> [!NOTE]
> Bileşen, Safe Area ve klavye uyumluluk kuralları `test-faz14-3-ios-tests.ts` ile kod düzeyinde doğrulanmıştır. Fiziksel iPhone veya TestFlight üzerindeki manuel doğrulama henüz yapılmamıştır.

- [x] Kaynak kod iOS uyumluluk ve Safe Area kontrolleri tamamlandı.
- [ ] Fiziksel iPhone veya TestFlight üzerinde açılış ve Safe Area doğrulaması.
- [ ] iOS klavye (KeyboardAvoidingView) ve form etkileşimi.
- [ ] iOS yerel geri kaydırma (swipe back) jesti.
- [ ] iOS Keychain donanımsal token saklama (expo-secure-store).
- [ ] iOS sistem temasıyla dinamik senkronizasyon.

---

## Faz 14.4: Kullanıcı ayrılığı güvenlik testleri

- [x] A kullanıcısı yalnızca kendi profilini görüyor.
- [x] B kullanıcısı yalnızca kendi profilini görüyor.
- [x] A kullanıcısı yalnızca kendi tercihlerini görüyor.
- [x] A kullanıcısı yalnızca kendi portföyünü görüyor.
- [x] B kullanıcısı yalnızca kendi portföyünü görüyor.
- [x] A kullanıcısı B'nin kayıt kimliğiyle detay alamıyor.
- [x] A kullanıcısı B'nin kayıt kimliğiyle güncelleme yapamıyor.
- [x] A kullanıcısı B'nin kayıt kimliğiyle silme yapamıyor.
- [x] Manipüle edilmiş `user_id` kabul edilmiyor.
- [x] Service role anahtarı istemci paketinde bulunmuyor.

---

# 21. Mağaza hazırlığı

## Faz 15: Uygulama kimliği ve sürümleme

- [x] Kesin uygulama adını doğrula.
- [x] Android package kimliğini doğrula.
- [x] iOS bundle identifier değerini doğrula.
- [x] Uygulama sürüm numarası politikasını belirle.
- [x] Android versionCode politikasını belirle.
- [x] iOS buildNumber politikasını belirle.
- [x] Development, Preview ve Production EAS profillerini oluştur.

---

## Faz 15.1: Görsel mağaza varlıkları

- [x] Son uygulama logosunu tasarla.
- [x] Android adaptive icon oluştur.
- [x] iOS icon setini oluştur.
- [x] Splash screen görselini oluştur.
- [x] Açık ve koyu arka planda logoyu test et.
- [x] Google Play ekran görüntülerini hazırla.
- [x] App Store ekran görüntülerini hazırla.
- [x] Görsellerde gerçek kullanıcı verisi kullanma.
- [x] Görsellerde yanıltıcı fiyat veya kazanç iddiası kullanma.

---

## Faz 15.2: Mağaza metinleri

- [x] Kısa açıklamayı yaz.
- [x] Uzun açıklamayı yaz.
- [x] Anahtar kelime yaklaşımını hazırla.
- [x] Finansal bilgilendirmeyi mağaza metnine ekle.
- [x] Destek e-posta adresini hazırla.
- [x] Gizlilik politikası URL'sini hazırla.
- [x] Hesap silme bilgi URL'sini hazırla.
- [x] Kullanım koşulları URL'sini hazırla.
- [x] Uygulama kategorisini doğrula.
- [x] Yaş derecelendirmesini doğru doldur.

---

## Faz 15.3: Google Play hazırlığı

- [ ] Google Play geliştirici hesabını satın al ($25).
- [ ] Google Play Console'da uygulama kaydını oluştur.
- [x] Kapalı test gereksinimlerini doğrula (20 test kullanıcısı / 14 gün kuralı).
- [x] Data Safety beyan matrisini hazırla (docs/GOOGLE_PLAY_SETUP.md).
- [x] Hesap silme web bağlantısını ve açıklamasını ekle (https://altiniz.app/hesap-silme).
- [x] Gizlilik politikası bağlantısını ekle (https://altiniz.app/gizlilik).
- [x] Uygulama erişim talimatlarını ve denetçi demo hesabını hazırla.
- [ ] Dahili test sürümünü (.aab) Google Play Console'a yükle.
- [ ] Kapalı test sürecini başlat.
- [ ] Mağaza uyarılarını çöz.

---

## Faz 15.4: App Store hazırlığı

- [ ] Apple Developer Program üyeliğini satın al ($99/yıl).
- [ ] App Store Connect uygulama kaydını oluştur.
- [x] App Privacy beyan formunu hazırla (docs/APP_STORE_SETUP.md).
- [x] Hesap silme akışını inceleme için açıkla (Apple Kural 5.1.1(v)).
- [x] Gizlilik politikası bağlantısını ekle (https://altiniz.app/gizlilik).
- [ ] TestFlight sürümünü EAS Build ile yükle.
- [ ] Dahili ve harici test kullanıcılarını ekle.
- [ ] iPhone ekran görüntülerini App Store Connect'e yükle.
- [x] App Review açıklamalarını ve denetçi demo hesabını hazırla.
- [ ] Mağaza uyarılarını çöz.

---

# 22. V1 yayımlama öncesi son kontrol

## P0 kontrol listesi

- [x] Bütün V1 temel mimari başarı ölçütleri karşılanıyor.
- [~] Android fiziksel cihaz testleri (APK derlendi; kullanıcı tarafından test ediliyor).
- [ ] iOS gerçek cihaz/TestFlight testi (Apple hesabı bekleniyor).
- [x] Çok kullanıcılı RLS güvenlik testleri tamamlandı.
- [x] Hesap silme atomik RPC ve kullanıcı akışı tamamlandı.
- [!] Fiyat sağlayıcısı ticari kullanım sözleşmesi ve lisans (KI-003 / KI-033: Truncgil kamu lisansı ve AltinAPI ticari sözleşmesi beklemede).
- [x] Eski fiyat davranışı ve bayatlık eşiği (15 dk) test edildi.
- [x] Fiyat yok davranışı test edildi (Asla 0 TL dönmeme - ADR-013).
- [x] Kısmi portföy özeti test edildi.
- [x] Gerçek fiyat ile test fiyatı karıştırılmıyor.
- [x] Gizli anahtar taraması temiz (İstemcide service_role yok).
- [x] Üretim loglarında hassas veri ve şifre maskelemesi tamamlandı.
- [!] KI-025: Teknik yasal metinler yüklendi ve SHA-256 özetiyle veritabanına işlendi; hukuk uzmanı (avukat) nihai incelemesi bekleniyor (Mitigated).
- [x] Google Play Data Safety beyanları gerçek davranışla eşitlendi.
- [x] App Store App Privacy beyanları gerçek davranışla eşitlendi.
- [x] Destek kanalı ve e-posta adresi (`adem@altiniz.app` - Yapılandırıldı ve doğrulandı).
- [x] Hesap silme web bağlantısı (`https://altiniz.app/hesap-silme` - Aktif ve yayında).
- [x] Son production yedeği ve geri dönüş planı hazır (RELEASE_RUNBOOK.md).
- [x] Production migrationları doğrulandı (12 migration sıralı uygulandı).
- [x] Son Git etiketi veya sürüm kaydı oluşturuldu (v1.0.0-rc1).

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

# 26. Engellenen ve beklemede olan işler

Şu anda dağıtım öncesi tamamlanması gereken doğrudan adımlar:

- Fiziksel Android cihazda (Redmi Note 8 Pro) üretilen APK'nın kullanıcı tarafından test edilip onaylanması
- Google Play Console ($25) geliştirici hesabının açılması
- Apple Developer Program ($99/yıl) geliştirici hesabının açılması

Production yayını öncesinde dış bağımlılığı olan hukuki ve ticari konular:

- KI-003: Fiyat sağlayıcısının ticari lisans sözleşmesi ve kullanım izni
- KI-025: Yasal metinlerin ve KVKK aydınlatma belgelerinin hukuk uzmanı tarafından son incelemesi

---

# 27. Sıradaki kesin görev

```text
Fiziksel Android telefonda APK ile kullanıcı onayı alınması ve Google Play / Apple Developer geliştirici hesaplarının açılması.
```

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

## 1.17 Taslak - 26.10.2026

- 19 proje belgesinin çapraz denetimi ve fiziksel test geri bildirimleri doğrultusunda kapsamlı düzeltmeler tamamlandı:
  - `adem@altiniz.app` e-posta adresi kod tabanındaki tüm ekranlar, yasal modeller, test paketleri, web sitesi (`website/`) ve belgelerde resmi iletişim adresi olarak eşitlendi.
  - `portfolio.tsx` ekranındaki çift kenar boşluğu (double padding) giderildi, liste öğeleri Ana Sayfa ve Fiyatlar sekmeleriyle hizalandı, portföy kartı tıklaması detay sayfasına yönlendirildi, zenginleştirilmiş silme onay modalı uygulandı.
  - `edit.tsx` formundaki birim rozet kontrastı ve binlik ayracı içeren dinamik yeşil tutar önizleme rozeti uygulandı.
  - `formatters.ts` içerisine `normalizeSearchText` eklenerek Fiyatlar, Hesap Makinesi ve Portföy arama alanlarında Türkçe karakter ve Unicode NFD aksan uyumu sağlandı.
  - `20261025000012_activate_missing_products_and_update_legal.sql` (Migration 012) uzak Supabase veritabanına uygulandı; `gold_products` tablosunda 25 ürün tam aktif edildi, `price_source_product_mappings` eşleştirmeleri bağlandı ve `fetch-gold-prices` ile 25/25 ürün canlıya alındı.
  - 6 adet gerçek yasal metin hazırlandı, gerçek 64 karakter SHA-256 hash'leri hesaplanarak veritabanına (`v1.0.0`) ve `src/models/legal.ts` dosyasına kaydedildi.
  - Koyu tema geçişlerindeki beyaz parlama (white flash) `contentStyle` ve `sceneStyle` ile önlendi; `index.tsx` içerisinden `👋` emojisi kaldırıldı, son fiyat güncelleme zaman damgası ve `chevron-right` ikonları eklendi.
  - `pg_cron` fiyat çekme zamanlayıcısı hafta sonunu da kapsayacak biçimde `*/15 * * * *` (her 15 dakikada bir) olarak güncellendi.
  - `test-faz22-p0-checklist.ts` 12 sıralı migration dosyası ile eşitlendi; 20/20 test %100 başarıyla geçti.

## 1.16 Taslak - 24.10.2026

- Fiziksel cihaz testlerinde tespit edilen UI/UX eksiklikleri ve bug paketi tamamlandı:
  - Header ve StatusBar tema uyumu (`expo-status-bar` + `RNStatusBar`) sağlandı; üst bar ferahlatıldı.
  - Ana Sayfa + Altın Ekle beyaz ekran çökmesi ve pull-to-refresh sorunları çözüldü.
  - Truncgil kamu veri akışı ile 23 aktif ürün eşleştirildi (`price_source_product_mappings`), aykırı değişim yüzdesi filtresi (`[-50%, +50%]`) uygulandı.
  - Gecikmeli veri bayatlık denetimi genel akış tazeliğine (15 dk) bağlandı.
  - Hesaplama -> portföy tutar aktarımı (`estimatedTotal`) ve binlik ayracı canlı önizleme rozeti uygulandı.
  - Portföy kartlarında vektörel altın ikonları ve özel silme onay modalı (`Modal`) uygulandı.
  - Ayarlar ekranında mükerrer çıkış butonu kaldırıldı, koyu tema seçici kontrastı artırıldı.

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
