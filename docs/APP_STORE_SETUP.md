# Altın İz — Apple App Store Connect Kurulum ve Yayın Kılavuzu

**Belge adı:** `APP_STORE_SETUP.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.0 Taslak  
**Son güncelleme:** 22.10.2026  
**Proje aşaması:** Bölüm 21: Mağaza hazırlığı (Faz 15.4: App Store hazırlığı)  
**Hedef Platform:** Apple App Store (iOS)  
**Bundle Kimliği (Bundle Identifier):** `com.altiniz.app`  
**SKU:** `altiniz_app`

---

## 1. Apple Developer Hesabı Gereksinimleri

1. **Hesap Türü ve Kayıt:**
   - Apple Developer Program ($99/yıl).
   - Bireysel (Individual) veya Kurumsal (Organization) hesap.
   - Kurumsal hesaplar için geçerli D-U-N-S numarası, kurumsal web sitesi ve şirketi temsil yetkisi belgesi zorunludur.
   - Apple ID üzerinde İki Faktörlü Kimlik Doğrulama (2FA) zorunludur.
2. **Apple Certificates, Identifiers & Profiles:**
   - **App ID (Identifier):** `com.altiniz.app`
   - **Capabilities:** Push Notifications (Gelecek V2 için opsiyonel), Associated Domains (`altiniz.app` deep linking için).

---

## 2. App Store Connect Uygulama Kaydı

1. **Yeni Uygulama Oluştur (New App):**
   - Platform: `iOS`
   - Uygulama Adı: `Altın İz`
   - Birincil Dil: `Türkçe`
   - Bundle ID: `com.altiniz.app`
   - SKU: `altiniz_app`
   - Kullanıcı Erişimi: `Tam Erişim`
2. **Kategori ve Yaş Derecelendirmesi:**
   - Birincil Kategori: `Finans (Finance)`
   - İkincil Kategori: `Araçlar (Utilities)`
   - Yaş Derecelendirmesi: `4+` (Şiddet, kumar, bahis, cinsel içerik veya yaş kısıtlı ürünler içermez).
3. **Gizlilik Politikası URL'si (Privacy Policy URL):**
   - Resmi Bağlantı: `https://altiniz.app/gizlilik` (Zorunlu alan).
   - Destek URL'si: `https://altiniz.app`

---

## 3. App Privacy (Veri Gizliliği) Formu Yanıtları

Apple App Store Review Guidelines Bölüm 5.1 uyarınca App Store Connect App Privacy formunda verilecek resmi beyanlar:

### 3.1. Takip (Tracking) Beyanı
- **Bu uygulama kullanıcıları takip etmek için veri topluyor mu?**  
  -> **HAYIR (Data Not Used to Track You / No Tracking).**  
  Uygulama, kullanıcı verilerini reklam veya pazarlama amacıyla üçüncü taraf uygulamalar ya da web siteleriyle asla eşleştirmez. Harici reklam SDK'sı içermez.

### 3.2. Toplanan Veri Türleri ve Kullanıcı İlişkisi Matrisi
| Veri Türü (Data Type) | Toplanıyor mu? | Kullanıcıyla İlişkili mi? (Linked to User) | Takip Amaçlı mı? | Kullanım Amacı (Purpose) |
|---|---|---|---|---|
| **İletişim Bilgileri (Contact Info)** -> *Email Address* | Evet | **Evet** | Hayır | App Functionality (Hesap oluşturma, oturum açma, güvenlik) |
| **Finansal Bilgiler (Financial Info)** -> *Other Financial Info* | Evet | **Evet** | Hayır | App Functionality (Kullanıcının girdiği altın varlıkları, maliyet ve kâr/zarar hesabı) |
| **Tanımlayıcılar (Identifiers)** -> *User ID* | Evet | **Evet** | Hayır | App Functionality (Kullanıcı veritabanı eşleştirmesi) |
| **Kullanıcı İçeriği (User Content)** -> *Other User Content* | Evet | **Evet** | Hayır | App Functionality (Görünen ad, portföy kaydı açıklaması) |
| **Tanılama / Hata Raporları (Diagnostics)** | Hayır | Hayır | Hayır | Canlı ortamda cihaz dışına gönderilmez (Yerel logger) |

---

## 4. Apple Kural 5.1.1(v) — Hesap Silme Akışı ve İnceleme Notu

Apple İnceleme Yönergesi Kural 5.1.1(v) gereğince, hesap oluşturmayı destekleyen tüm uygulamalar, kullanıcının hesap ve verilerini uygulama içinden doğrudan silebilmesini zorunlu kılar.

### 4.1. Uygulama İçi Silme Yolu (In-App Path)
1. Kullanıcı alt menüden **Ayarlar** (`settings.tsx`) sekmesini açar.
2. **Hesap Ayarları** (`account/index.tsx`) ekranına geçer.
3. Kırmızı renkle vurgulanan **Hesabı Sil** (`account/delete.tsx`) seçeneğine dokunur.
4. Silinecek veriler listesini (tüm portföy altın kayıtları, tercihler, profil) ve geri alınamazlık uyarısını inceler.
5. Kimliğini doğrulamak için mevcut şifresini girer.
6. Sistem yerel onay penceresi (`Alert.alert` `style: 'destructive'`) ile son teyidi alır.
7. Onay verildiğinde `delete-account` Edge Function çalıştırılarak veriler anında ve fiziksel olarak yok edilir; kullanıcı karşılama ekranına yönlendirilir.

### 4.2. Web Üzerinden Silme Bağlantısı
- URL: `https://altiniz.app/hesap-silme` (Kullanıcının uygulamayı cihazından kaldırmış olması durumunda web üzerinden kimlik doğrulayarak silme talep edebileceği resmi form).

---

## 5. EAS Build ve TestFlight Dağıtım Süreci

### 5.1. iOS Üretim Derlemesi (IPA)
EAS Build bulut altyapısıyla App Store uyumlu derleme üretimi:

```bash
# App Store / TestFlight için IPA derlemesi:
npx eas-cli@latest build --platform ios --profile production

# Derleme bittiğinde doğrudan TestFlight'a aktarmak için:
npx eas-cli@latest submit --platform ios --profile production
```

### 5.2. TestFlight Grupları ve Dağıtım
1. **Dahili Test Grubu (Internal Testers):**
   - App Store Connect hesabındaki yöneticiler ve geliştiriciler (azami 100 kişi).
   - Apple incelemesi gerekmez; derleme işlenir işlenmez anında test edilebilir.
2. **Harici Test Grubu (External Testers):**
   - Genel beta kullanıcıları (azami 10.000 kişi).
   - İlk harici derlemede hızlı bir TestFlight App Review incelemesi (genellikle 24 saat içinde) yapılır.
   - Genel davet bağlantısı (Public Link) üzerinden test kullanıcıları kabul edilir.

---

## 6. App Review (Uygulama İnceleme) Notları ve Denetçi Giriş Bilgileri

App Store Connect -> **Version Information** -> **App Review Information** alanına yazılacak resmi denetçi metni:

### 6.1. Giriş Bilgileri (Sign-In Information)
> [!NOTE]
> Bu bilgiler şirket e-posta şifresi DEĞİLDİR. Apple App Review denetçisinin mobil uygulamaya test girişi yapabilmesi için oluşturulacak örnek uygulama içi demo kullanıcı hesabıdır.

- **Giriş Gerekli mi (Sign-in required):** `İşaretli (Evet)`
- **Demo Kullanıcı Adı (Demo E-posta):** `reviewer-apple@altiniz.app`
- **Demo Uygulama Şifresi:** `AppleReview2026!`

### 6.2. İnceleme Notları (Notes for Reviewer)
```text
Dear Apple Review Team,

Thank you for reviewing Altın İz.

About the App:
Altın İz is a personal finance assistant designed for Turkish physical gold investors. It allows users to track live Kapalıçarşı (Grand Bazaar) and free market gold prices, analyze buy-sell spreads, calculate estimated purchase/redemption values, and monitor their physical gold holdings with real profit/loss tracking.

Important Review Highlights:
1. No Real Money Transactions / No Trading:
   Altın İz is NOT a crypto exchange, stock broker, or banking app. Users CANNOT buy, sell, or deposit real money/gold in the app. It is strictly an informational price tracking and personal portfolio valuation tool (Compliant with Guidelines 3.1.1 and 3.1.5).

2. Account Deletion (Guideline 5.1.1(v)):
   Users can permanently delete their account and all associated data directly inside the app by navigating to:
   Settings -> Account Settings -> Delete Account.
   This action requires password re-authentication, presents a native destructive confirmation alert, and immediately purges all user data via our backend Edge Function. We also provide a web-based deletion portal at: https://altiniz.app/hesap-silme.

3. Privacy & Zero Tracking (Guideline 5.1):
   Altın İz does not track users across other companies' apps or websites. It contains zero third-party advertising or tracking SDKs.

4. Demo Account Credentials:
   Username: reviewer-apple@altiniz.app
   Password: AppleReview2026!
   (This test account has its email pre-verified and includes a sample portfolio entry for immediate review).

Should you need any additional information, please contact us at: adem@altiniz.app.
```

---

## 7. Mağaza Politika Uyarılarının Çözümü

1. **Guideline 3.1.1 (In-App Purchase):** Uygulama tamamen ücretsizdir; dijital içerik, kilitli özellik veya abonelik satışı yoktur.
2. **Guideline 3.1.5 (Cryptocurrencies):** Altın İz yalnızca geleneksel fiziksel altın türlerini (Gram, Çeyrek, Cumhuriyet vb.) takip eder; kripto para, token veya borsa alım-satımı içermez.
3. **Guideline 5.1.2 (Data Use and Sharing):** Fiyat sağlayıcılara hiçbir kullanıcı verisi aktarılmaz (Tamamen anonim sunucu arka plan sorgusu).
