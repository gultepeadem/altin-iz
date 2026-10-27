# Altın İz — Google Play Console Kurulum ve Yayın Kılavuzu

**Belge adı:** `GOOGLE_PLAY_SETUP.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.1 Taslak  
**Son güncelleme:** 26.10.2026  
**Proje aşaması:** Bölüm 21: Mağaza hazırlığı (Faz 15.3: Google Play hazırlığı)  
**Hedef Platform:** Google Play Store (Android)  
**Paket Kimliği (Package Name):** `com.altiniz.app`

---

## 1. Google Play Geliştirici Hesabı Gereksinimleri

1. **Hesap Türü ve Kayıt:**
   - Bireysel (Personal) veya Kurumsal (Organization) hesap türü.
   - 25$ tek seferlik kayıt ücreti.
   - Kurumsal hesaplar için geçerli D-U-N-S numarası ve şirket tescil belgesi zorunludur.
   - Bireysel hesaplar için resmi kimlik ve adres doğrulaması zorunludur.
2. **2024/2026 Bireysel Hesap Kapalı Test Zorunluluğu (12 Tester / 14 Gün Kuralı):**
   - 13 Kasım 2023'ten sonra açılan tüm kişisel hesaplarda, uygulamanın genel kullanıma (Production) sunulabilmesi için **en az 12 test kullanıcısının en az 14 gün boyunca kesintisiz olarak kapalı teste katılmış olması** zorunludur.
   - 14 günlük sürenin tamamlanması doğrudan otomatik yayın anlamına gelmez; geliştirici Google Play Console üzerinden Üretime Başvur (Apply for Production) formunu doldurur ve Google inceleme süreci tamamlandıktan sonra genel dağıtıma geçilir.
   - 14 günün ardından Google Play Console üzerinden "Üretime Başvur" (Apply for Production) adımı açılır.

---

## 2. Uygulama Kaydı ve Temel Yapılandırma

1. **Yeni Uygulama Oluştur:**
   - Uygulama adı: `Altın İz`
   - Varsayılan dil: `Türkçe - tr-TR`
   - Uygulama veya oyun: `Uygulama`
   - Ücretli veya ücretsiz: `Ücretsiz`
2. **Beyanlar:**
   - Geliştirici Program Politikaları kabul edilir.
   - ABD ihracat kanunları kabul edilir.
3. **Mağaza Girişi İletişim Bilgileri:**
   - E-posta adresi: adem@altiniz.app
   - Web sitesi: https://altiniz.app
   - Gizlilik politikası URL: https://altiniz.app/gizlilik

---

## 3. Data Safety (Veri Güvenliği) Formu Yanıtları

Google Play Console -> **Politika ve Programlar** -> **Uygulama İçeriği** -> **Veri Güvenliği** formunda verilecek resmi cevaplar:

### 3.1. Genel Güvenlik Soruları
- **Uygulamanız desteklenen kullanıcı verisi türlerinden herhangi birini topluyor veya paylaşıyor mu?** -> **Evet**
- **Uygulamanız tarafından toplanan tüm kullanıcı verileri aktarım sırasında şifreleniyor mu?** -> **Evet** (TLS 1.3 / HTTPS)
- **Kullanıcıların hesap oluşturması için bir yöntem sağlıyor musunuz?** -> **Evet** (E-posta ve şifre ile kayıt)
- **Kullanıcıların hesaplarının ve ilişkili verilerinin silinmesini talep etmeleri için bir bağlantı sağlıyor musunuz?** -> **Evet**
  - Web URL: `https://altiniz.app/hesap-silme` (Kullanıcının uygulamayı yeniden yüklemesine gerek kalmadan web üzerinden hesap ve veri silme talebinde bulunabilmesini sağlar).
  - Uygulama İçi Silme: `Hesap Ayarları -> Hesabı Sil` (`src/app/(protected)/account/delete.tsx`) ekranı üzerinden `delete-account` Edge Function tetiklenerek kullanıcı verileri anında ve fiziksel olarak yok edilir.

### 3.2. Toplanan Veri Türleri ve İşleme Amaçları
| Veri Türü | Toplanıyor mu? | Paylaşılıyor mu? | İşleme Amacı | İsteğe Bağlı mı? | Kullanıcı Kimliğiyle Eşleşiyor mu? |
|---|---|---|---|---|---|
| **E-posta Adresi** | Evet | Hayır | Uygulama işlevselliği, Hesap yönetimi | Hayır (Zorunlu) | Evet |
| **Kullanıcı Kimlikleri (User ID)** | Evet | Hayır | Uygulama işlevselliği, Hesap yönetimi | Hayır (Zorunlu) | Evet |
| **İsim (Görünen Ad)** | Evet | Hayır | Uygulama işlevselliği, Kişiselleştirme | Evet (İsteğe bağlı) | Evet |
| **Satın Alma Geçmişi (Portföy)** | Evet | Hayır | Uygulama işlevselliği (Kâr-zarar takibi) | Hayır (Zorunlu) | Evet |
| **Yasal Olaylar (Kayıtlar)** | Evet | Hayır | Dolandırıcılığı önleme, Güvenlik ve Uyumluluk | Hayır (Zorunlu) | Evet |

> [!IMPORTANT]
> Uygulama kesinlikle **Konum**, **Kişiler (Rehber)**, **Fotoğraflar/Medya**, **Sağlık/Fitness**, **Kısa Mesaj (SMS)** veya **Cihaz/Reklam Tanımlayıcısı (AD_ID)** TOPLAMAZ ve PAYLAŞMAZ.

---

## 4. Uygulama İçeriği ve Politika Beyanları

1. **Gizlilik Politikası:**
   - URL: `https://altiniz.app/gizlilik`
2. **Uygulama Erişimi (App Access - Google Denetçi Girişi):**
   > [!NOTE]
   > Bu bilgiler kurumsal e-posta şifresi DEĞİLDİR. Google Play denetçisinin mobil uygulamaya test girişi yapabilmesi için oluşturulacak örnek uygulama içi demo kullanıcı hesabıdır.
   - Seçenek: *"Bazı işlevler kısıtlanmıştır"* (Giriş gerektiren portföy ve hesap ekranları).
   - Talimat Adı: `Google Play İnceleme Test Hesabı`
   - Demo Kullanıcı Adı: `reviewer-play@altiniz.app`
   - Demo Uygulama Şifresi: `Güvenli parola yöneticisinde saklanmaktadır (Google Play Console Uygulama Erişimi formunda özel iletilecektir).`
   - Ek Talimatlar: *"Uygulamaya doğrudan giriş yapabilirsiniz; test hesabı için e-posta doğrulaması önceden tamamlanmıştır. Portföy ekleme, fiyat izleme ve hesap ayarlarını test edebilirsiniz."*
3. **Reklamlar:**
   - *"Hayır, uygulamam reklam içermiyor"*
4. **Hedef Kitle ve İçerik:**
   - Hedef Yaş Grubu: `18 yaş ve üzeri` (veya `13 yaş ve üzeri` genel kitle; kişisel finansal varlık takip aracı).
   - Çocukların ilgisini çekebilecek tasarım: `Hayır` (Uygulama çocuklara yönelik pazarlanmaz).
   - IARC İçerik Derecelendirmesi: `PEGI 3` / `Everyone` (Kumar, bahis, şiddet veya sakıncalı içerik barındırmaz; teknik olarak her yaş grubuna uygundur).
5. **Mali Özellikler Beyanı (Financial Features):**
   - Altın İz bir banka, dijital cüzdan, kredi verme kurumu veya kripto borsası DEĞİLDİR.
   - Seçenek: *"Kişisel finans yönetimi / Varlık takip aracı"*
   - Belgeler: SPK lisansı gerektirmez (Yalnızca genel piyasa kurlarını gösteren ve kullanıcının girdiği fiziki altınları kaydeden bilgilendirme aracıdır; yatırım danışmanlığı yapılmaz).
6. **Devlet Uygulamaları:** `Hayır`
7. **Haber Uygulamaları:** `Hayır`
8. **COVID-19 Temas Takibi:** `Hayır`

---

## 5. EAS Build ve Sürüm Dağıtım Süreci

### 5.1. İç Test (Internal Testing) Sürümü Derleme
Kendi Android cihazınızda anında test etmek için APK veya AAB derlemesi:

```bash
# Doğrudan cihaza yüklenebilir APK derlemesi:
npx eas-cli@latest build --platform android --profile preview

# Google Play Console'a yüklenecek AAB derlemesi:
npx eas-cli@latest build --platform android --profile production
```

### 5.2. Dahili Test Parçasına Yükleme (Internal Track)
1. Google Play Console -> Sol Menü -> **Test etme** -> **Dahili test**.
2. **Yeni sürüm oluştur** butonuna tıklayın.
3. EAS Build'den indirilen `.aab` dosyasını sürükleyip bırakın.
4. Sürüm adı: `1.0.0 (1)`.
5. Sürüm notu (tr-TR):
   ```text
   Altın İz ilk kapalı test sürümü. Canlı Kapalıçarşı fiyatları, makas analizi, hesaplama aracı ve portföy kâr-zarar yönetimi.
   ```
6. **Kaydet** ve **Sürümü İncele** diyerek dahili test grubuna dağıtın.

### 5.3. Kapalı Test (Closed Testing - 12 Tester / 14 Gün)
1. Sol Menü -> **Kapalı test** -> **Kanalı Yönet**.
2. Bir e-posta listesi (Google Grubu veya e-posta listesi) oluşturup en az 12 gönüllü test kullanıcısını ekleyin.
3. Dahili testte doğrulanan AAB sürümünü Kapalı Test kanalına yükseltin.
4. Kullanıcılara web katılım linkini (`https://play.google.com/apps/testing/com.altiniz.app`) gönderin.
5. Kullanıcıların uygulamayı indirip 14 gün boyunca cihazlarında tutmalarını sağlayın.
6. 14 günün sonunda Google Play Console'da beliren **Üretim için başvur** (Apply for Production) formunu doldurun (onay süreci Google ekibince yürütülür).


---

## Sürüm geçmişi

### 1.1 - 27.10.2026

- Destek e-postası yazım hatası giderildi (dem@altiniz.app).
- Güncel Google Play kapalı test kuralı (12 test kullanıcısı / 14 gün ve üretim erişim başvuru süreci) güncellendi.

### 1.0 - 24.10.2026

- Google Play Konsol Kurulum ve Dağıtım Rehberi oluşturuldu.
