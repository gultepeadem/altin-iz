# Altın İz V1 Yazılım Mimarisi

**Belge adı:** `ARCHITECTURE.md`  
**Proje:** Altın İz  
**Belge sürümü:** 0.5 Taslak  
**Son güncelleme:** 26.10.2026
**Durum:** Expo SDK 58 klasör yapısıyla (`src/app/`) eşitlendi ve doğrulandı  
**Hedef platformlar:** Android ve iOS

---

## 1. Belgenin amacı

Bu belge, Altın İz mobil uygulamasının teknik mimarisini tanımlar.

Belgenin amaçları:

- Proje klasörlerinin görevlerini kesinleştirmek
- Ekran ve rota yapısını belirlemek
- Kullanıcı arayüzünü iş mantığından ayırmak
- Supabase bağlantısının nerede yönetileceğini belirlemek
- Kullanıcı oturumunun nasıl yönetileceğini tanımlamak
- Altın fiyatlarının nasıl okunacağını açıklamak
- Portföy kayıtlarının nasıl yönetileceğini tanımlamak
- Hesaplama kurallarının tek merkezde tutulmasını sağlamak
- Hata, yüklenme ve boş veri durumlarını standartlaştırmak
- Android ve iOS uyumluluğunu korumak
- Yapay zekânın projede gereksiz mimari değişiklik yapmasını önlemek
- Test edilebilir ve geliştirilebilir bir yapı oluşturmak

Bu belge kodun kendisi değildir. Proje oluşturulduktan sonra gerçek klasör ve dosya adları bu belgeyle karşılaştırılmalı, gerekli değişiklikler gerekçesiyle birlikte `DECISIONS.md` dosyasına kaydedilmelidir.

---

## 2. Mimari hedefler

Altın İz mimarisi aşağıdaki hedefleri karşılamalıdır:

1. Android ve iOS üzerinde ortak kod tabanı kullanmak
2. Başlangıç seviyesindeki kullanıcı için anlaşılır klasör yapısı sağlamak
3. Ekranları küçük ve yönetilebilir parçalara ayırmak
4. API çağrılarını ekran dosyalarından ayırmak
5. Hesaplama kurallarını tek bir merkezde toplamak
6. Kullanıcı oturumunu merkezi olarak yönetmek
7. Kullanıcı verilerini RLS ile korumak
8. Gizli sunucu anahtarlarını mobil uygulamadan uzak tutmak
9. Hata mesajlarını ortak bir biçime dönüştürmek
10. Fiyat bulunamadığında güvenli davranmak
11. Eski fiyatı güncel fiyat gibi göstermemek
12. V1 kapsamını gereksiz paket ve özelliklerle büyütmemek
13. Test edilebilir saf fonksiyonlar kullanmak
14. Proje belgeleri ile kod arasında tutarlılık sağlamak

---

## 3. Üst seviye sistem mimarisi

```text
Kullanıcı
   ↓
React Native + Expo Mobil Uygulama
   │
   ├── Sunum Katmanı
   │      ├── Expo Router ekranları
   │      ├── Ortak bileşenler
   │      ├── Formlar
   │      └── Tema ve erişilebilirlik
   │
   ├── Uygulama Katmanı
   │      ├── Kimlik doğrulama durumu
   │      ├── Fiyat veri akışı
   │      ├── Portföy işlemleri
   │      ├── Form doğrulama
   │      └── Hata dönüştürme
   │
   ├── Etki Alanı Katmanı
   │      ├── Para hesaplamaları
   │      ├── Miktar kuralları
   │      ├── Kâr-zarar hesaplamaları
   │      ├── Fiyat güncelliği
   │      └── Portföy toplamları
   │
   └── Veri Katmanı
          ├── Supabase istemcisi
          ├── Auth servisi
          ├── Fiyat servisi
          ├── Portföy servisi
          ├── Profil servisi
          └── Yasal belge servisi

Supabase
   │
   ├── Auth
   ├── PostgreSQL
   ├── Row Level Security
   ├── Data API
   └── Edge Functions
          │
          └── Dış Fiyat Sağlayıcısı
```

---

## 4. Mimari katmanlar

### 4.1. Sunum katmanı

Kullanıcının gördüğü ve etkileşime girdiği bölümdür.

İçerir:

- Expo Router rota dosyaları
- Sayfa bileşenleri
- Butonlar
- Kartlar
- Form alanları
- Yüklenme göstergeleri
- Hata ve boş durum bileşenleri
- Onay pencereleri
- Alt menü
- Tema stilleri

Sunum katmanı doğrudan karmaşık hesaplama yapmamalıdır.

Yanlış yaklaşım:

```text
Portföy kartının içinde para ve yüzde hesaplamak
```

Doğru yaklaşım:

```text
Hesaplama yardımcı fonksiyonu sonucu üretir
        ↓
Ekran yalnızca sonucu gösterir
```

### 4.2. Uygulama katmanı

Kullanıcı işlemlerini ve veri akışını yönetir.

Örnek görevler:

- Giriş formu gönderildiğinde Auth servisini çağırmak
- Portföy kaydı ekleme sürecini yönetmek
- Yüklenme durumunu yönetmek
- Servis hatasını kullanıcı hatasına dönüştürmek
- Başarılı işlem sonrası doğru sayfaya yönlendirmek
- Liste yenileme akışını yönetmek

### 4.3. Etki alanı katmanı

Uygulamanın değişmemesi gereken temel iş kurallarını içerir.

Örnekler:

- Satın alma hesabında satış fiyatı kullanılması
- Bozdurma hesabında alış fiyatı kullanılması
- Portföy değerinin alış fiyatıyla hesaplanması
- Kâr-zarar formülü
- Kısmi toplam kuralı
- Adetli ürünün tam sayı miktar zorunluluğu
- Gram ürünlerde üç ondalık basamak sınırı
- Eski fiyat belirleme mantığı

Bu katmandaki saf fonksiyonlar mümkün olduğunca React, Expo ve Supabase'e bağımlı olmamalıdır.

### 4.4. Veri katmanı

Dış sistemlerle iletişimi yönetir.

İçerir:

- Supabase istemci kurulumu
- Supabase Auth çağrıları
- PostgreSQL Data API sorguları
- Edge Function çağrıları
- Yanıtların uygulama modellerine dönüştürülmesi
- Supabase hata nesnelerinin ortak hata biçimine çevrilmesi

Ekran dosyaları doğrudan karmaşık Supabase sorguları içermemelidir.

---

## 5. Önerilen proje klasör yapısı

```text
altin-iz/
├── .github/
│   └── copilot-instructions.md
│
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── +not-found.tsx
│   │   │
│   │   ├── (public)/
│   │   │   ├── _layout.tsx
│   │   │   ├── welcome.tsx
│   │   │   ├── sign-in.tsx
│   │   │   ├── sign-up.tsx
│   │   │   ├── verify-email.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   └── reset-password.tsx
│   │   │
│   │   ├── (protected)/
│   │   │   ├── _layout.tsx
│   │   │   │
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── prices.tsx
│   │   │   │   ├── calculator.tsx
│   │   │   │   ├── portfolio.tsx
│   │   │   │   └── settings.tsx
│   │   │   │
│   │   │   ├── gold/
│   │   │   │   └── [productId].tsx
│   │   │   │
│   │   │   ├── portfolio/
│   │   │   │   ├── add.tsx
│   │   │   │   ├── [entryId].tsx
│   │   │   │   └── [entryId]/edit.tsx
│   │   │   │
│   │   │   ├── account/
│   │   │   │   ├── index.tsx
│   │   │   │   └── delete.tsx
│   │   │   │
│   │   │   ├── legal/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [documentType].tsx
│   │   │   │
│   │   │   ├── about.tsx
│   │   │   └── support.tsx
│   │   │
│   │   ├── account-status.tsx
│   │   └── auth-callback.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── feedback/
│   │   ├── forms/
│   │   ├── gold/
│   │   ├── portfolio/
│   │   └── layout/
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── routes.ts
│   │   ├── limits.ts
│   │   └── messages.ts
│   │
│   ├── domain/
│   │   ├── calculations/
│   │   ├── validation/
│   │   └── rules/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   ├── useGoldPrices.ts
│   │   ├── usePortfolio.ts
│   │   └── useNetworkStatus.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── environment.ts
│   │
│   ├── models/
│   │   ├── auth.ts
│   │   ├── gold.ts
│   │   ├── portfolio.ts
│   │   ├── legal.ts
│   │   └── errors.ts
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── AppProviders.tsx
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── profileService.ts
│   │   ├── preferencesService.ts
│   │   ├── goldProductService.ts
│   │   ├── goldPriceService.ts
│   │   ├── portfolioService.ts
│   │   ├── legalService.ts
│   │   └── accountService.ts
│   │
│   ├── theme/
│   │   ├── lightTheme.ts
│   │   ├── darkTheme.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   │
│   └── utils/
│       ├── formatCurrency.ts
│       ├── formatQuantity.ts
│       ├── formatDate.ts
│       ├── normalizeError.ts
│       └── guards.ts
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   ├── seed.sql
│   ├── tests/
│   └── functions/
│       ├── fetch-gold-prices/
│       └── delete-account/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── security/
│   └── fixtures/
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
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.example
├── .gitignore
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
└── README.md
```

Bu yapı başlangıç taslağıdır. Expo projesinin oluşturduğu gerçek dosyalar incelenmeden toplu biçimde uygulanmayacaktır.

---

## 6. Klasörlerin görevleri

### `src/app/`

Expo Router rota dosyalarını içerir. Bu klasördeki her ekran uygulamanın gezinme yapısının bir parçasıdır.

Kurallar:

- Rota dosyaları mümkün olduğunca ince tutulur.
- Karmaşık hesaplama rota dosyasında yapılmaz.
- Supabase sorguları doğrudan rota dosyasına yayılmaz.
- Ortak arayüz parçaları `src/components` içinden kullanılır.

### `src/components/`

Birden fazla ekranda kullanılabilecek görsel bileşenleri içerir.

Örnekler:

```text
PrimaryButton
SecondaryButton
TextField
PasswordField
ScreenContainer
PriceCard
PortfolioEntryCard
EmptyState
ErrorState
LoadingState
```

### `src/constants/`

Uygulama genelinde kullanılan sabitleri içerir.

Örnekler:

- Renk isimleri
- Form sınırları
- Sabit kullanıcı mesajları
- Rota adları
- Varsayılan değerler

Gizli anahtarlar bu klasöre yazılmaz.

### `src/domain/`

Saf iş kurallarını içerir.

```text
calculations/ → Para ve kâr-zarar hesapları
validation/   → Form ve veri doğrulama
rules/        → Fiyat güncelliği ve ürün davranışları
```

### `src/hooks/`

Ekranların tekrar eden durum ve veri davranışlarını kullanmasını sağlar.

Hook'lar servis çağrısını yönetebilir, ancak temel iş formüllerini yeniden yazmamalıdır.

### `src/lib/`

Harici altyapının tek seferlik kurulumunu içerir.

```text
supabase.ts    → Supabase istemcisi
environment.ts → Ortam değişkenlerini güvenli okuma ve doğrulama
```

Eksik ortam değişkenleri güvenli hata davranışı kuralı:
- Zorunlu ortam değişkenleri (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_APP_ENV`) eksik veya boş olduğunda uygulama sessizce tanımsız (`undefined`) değerlerle ağ isteği atmamalıdır.
- `src/lib/environment.ts` modülü başlatma anında bu değerleri doğrulayacak; eksiklik durumunda geliştiriciye açık, anlaşılır bir hata mesajı vererek uygulamanın kararsız duruma geçmesini önleyecektir.
- Örnek dosyalara (`.env.example`) veya istemci koduna asla gizli anahtar (service_role, veritabanı şifresi) yazılmayacaktır.

### `src/models/`

TypeScript veri modellerini içerir.

Modeller veritabanı yapısıyla ilişkili olsa da ekranların doğrudan ham veritabanı nesnelerine bağımlı olması önlenmelidir.

### `src/providers/`

Uygulama çapında kullanılan React bağlamlarını içerir.

V1 için temel sağlayıcılar:

- AuthProvider
- ThemeProvider
- AppProviders

Her küçük durum için yeni global provider oluşturulmaz.

### `src/services/`

Supabase ve güvenli sunucu fonksiyonlarıyla iletişimi yönetir.

Ekranlar şu tür doğrudan kodlara boğulmaz:

```text
supabase.from(...).select(...).eq(...)
```

Bu işlemler ilgili servis içinde tutulur.

### `src/theme/`

Açık ve koyu tema, yazı boyutları ve boşluk sistemini içerir.

### `src/utils/`

Genel ve yan etkisiz yardımcıları içerir.

Bir yardımcı yalnızca belirli bir iş alanına aitse `utils` yerine `domain` altında tutulur.

### `supabase/`

Veritabanı migrasyonları, Edge Function kodları, seed verileri ve veritabanı testlerini içerir.

### `tests/`

Mobil uygulama ve iş kuralları testlerini içerir.

### `docs/`

Projenin kalıcı hafızasıdır. Kod değiştikçe ilgili belgeler güncellenir.

### `assets/`

Uygulama simgesi, açılış görseli ve gerekli statik dosyaları içerir.

---

## 7. Expo Router rota yapısı

### 7.1. Kök rota

```text
src/app/_layout.tsx
```

Görevleri:

- Uygulama sağlayıcılarını bağlamak
- Tema altyapısını başlatmak
- Auth durumunun yüklenmesini yönetmek
- Kök Stack yapısını tanımlamak
- Derin bağlantı akışlarına temel sağlamak

Bu dosyada ekranlara özel iş mantığı bulunmamalıdır.

### 7.2. Başlangıç yönlendirmesi

```text
src/app/index.tsx
```

Görevleri:

```text
Auth yükleniyor → Yüklenme ekranı
Oturum yok → /(public)/welcome
Şifre sıfırlama oturumu (PASSWORD_RECOVERY) → /(public)/reset-password
Oturum var ve e-posta doğrulanmış (active) → /(protected)/(tabs)
Oturum var ancak doğrulanmamış → /(public)/verify-email
Hesap deletion_pending veya disabled → /account-status
```

### 7.3. Public rota grubu

```text
src/app/(public)/
```

Giriş yapmadan erişilebilecek ekranları içerir:

- Karşılama
- Giriş
- Kayıt
- E-posta doğrulama
- Şifre sıfırlama isteği
- Yeni şifre belirleme (reset-password.tsx)

Geçerli ve aktif oturumu bulunan kullanıcı bu ekranlarda kalmamalı, korunan alana yönlendirilmelidir. İstisna: Kullanıcı şifre sıfırlama bağlantısıyla (PASSWORD_RECOVERY) geldiğinde oturumu açık olsa dahi /(public)/reset-password ekranında kalmasına izin verilir; yeni şifre kaydedilene kadar Ana Sayfaya yönlendirilmez.

### 7.4. Protected rota grubu

```text
src/app/(protected)/
```

Yalnızca geçerli oturumu ve erişime uygun hesap durumu olan kullanıcılara açıktır.

Koruma şartları:

1. Oturum mevcut olmalı
2. Oturum geçerli olmalı
3. E-posta doğrulanmış olmalı
4. Profil mevcut olmalı
5. Hesap durumu `active` olmalı

### 7.5. Alt menü rota grubu

```text
src/app/(protected)/(tabs)/
```

Beş ana ekran:

```text
index.tsx      → Ana Sayfa
prices.tsx     → Fiyatlar
calculator.tsx → Hesapla
portfolio.tsx  → Portföyüm
settings.tsx   → Ayarlar
```

Kurallar ve Bileşenler:

- **CustomTabHeader:** Beş tab ekranı için ortak, marka amblemi (44×44 altın külçesi ikonu), ekran başlığı, sayfa alt başlığı ve dinamik piyasa canlılık rozeti (`● Canlı Piyasa` / `● Gecikmeli Veri`) içeren ferah üst bar kullanılır.
- **Dinamik StatusBar:** `ThemeProvider.tsx` içinde `expo-status-bar` ve yerel `RNStatusBar` bağlanarak Açık temada beyaz header zeminine uyumlu koyu ikonlar (`dark-content`), Koyu temada ise koyu zemin ve beyaz ikonlar (`light-content`) uygulanır.
- **Vektörel İkon Standardı:** Tüm alt menü sekmelerinde, arama çubuklarında ve ayarlar ekranında sistem emojileri yerine `@expo/vector-icons` (`Feather`, `MaterialCommunityIcons`) kullanılır.

### 7.6. Dinamik altın detayı

```text
src/app/(protected)/gold/[productId].tsx
```

Kurallar:

- `productId` doğrulanmalıdır.
- Ürün bulunamazsa güvenli bulunamadı durumu gösterilmelidir.
- Teknik UUID hatası kullanıcıya gösterilmemelidir.
- Ekran fiyat ve ürün verisini servis katmanından almalıdır.

### 7.7. Portföy rotaları

```text
src/app/(protected)/portfolio/add.tsx
src/app/(protected)/portfolio/[entryId].tsx
src/app/(protected)/portfolio/[entryId]/edit.tsx
```

Kurallar:

- Her rota geçerli oturum gerektirir.
- `entryId` ile erişilen kayıt kullanıcıya ait olmalıdır.
- RLS ana güvenlik katmanıdır.
- Yetkisiz veya bulunmayan kayıt aynı güvenli kullanıcı mesajına dönüştürülebilir.
- `portfolio/add` rotası opsiyonel olarak `productId`, `quantity` ve `estimatedTotal` parametrelerini kabul eder (hesaplama sayfasından aktarım).
- `portfolio/add` ekranında kullanıcının basamak hatası yapmasını önlemek amacıyla girilen toplam maliyet altında binlik ayracı canlı önizleme rozeti sunulur.
- `portfolio/[entryId]` ve `portfolio.tsx` ekranlarında kayıt silme işlemleri için yerel OS alert yerine Altın İz marka kimliğine uygun özel onay modalı (`Modal`) kullanılır.
- `ModalHeader`: Modal sunulan form sayfaları için 24px geri okuna, merkezlenmiş başlığa ve safe-area uyumlu dikey boşluklara sahip özel başlık bileşeni kullanılır.

### 7.8. Auth callback rotası

```text
src/app/auth-callback.tsx
```

Aşağıdaki bağlantılardan geri dönüşü yönetebilir:

- E-posta doğrulama
- Şifre sıfırlama
- Gelecekte eklenebilecek kimlik doğrulama akışları

Android ve iOS derin bağlantı davranışı ayrı test edilmelidir.

### 7.9. Bulunamadı ekranı

```text
src/app/+not-found.tsx
```

Kullanıcıya teknik rota bilgisi yerine anlaşılır yönlendirme gösterir.

---

## 8. Kullanıcı oturumu mimarisi

### 8.1. AuthProvider

```text
src/providers/AuthProvider.tsx
```

Merkezi olarak şunları yönetir:

- Oturum yükleniyor durumu
- Aktif oturum
- Kullanıcı kimliği
- E-posta doğrulama durumu
- Kullanıcı profil durumu
- Auth olaylarını dinleme
- Güvenli çıkış

Örnek kavramsal durum:

```text
loading
unauthenticated
authenticated_unverified
authenticated_active
deletion_pending
disabled
error
```

### 8.2. Auth servisi

```text
src/services/authService.ts
```

Görevleri:

- Hesap oluşturmak
- Giriş yapmak
- Çıkış yapmak
- E-posta doğrulamasını tekrar göndermek
- Şifre sıfırlama bağlantısı göndermek
- Oturumu okumak
- Auth hatalarını ortak hata modeline çevirmek

### 8.3. Oturum saklama

- Mobil oturum Expo ve Supabase'in güncel desteklediği güvenli saklama yöntemiyle tutulur.
- Saklama adaptörü gerçek proje kurulurken güncel resmi yaklaşım doğrulandıktan sonra uygulanır.
- Secret veya service role anahtarı oturum depolamasında bulunmaz.
- Çıkışta kullanıcıya ait hassas yerel önbellek temizlenir.

### 8.4. Sonsuz yönlendirme engeli

Auth yüklenmeden public veya protected yönlendirmesi yapılmamalıdır.

Yanlış akış:

```text
Oturum henüz okunmadı
→ Oturum yok kabul edildi
→ Giriş ekranına gönderildi
→ Oturum bulundu
→ Ana Sayfaya gönderildi
```

Doğru akış:

```text
Oturum okunana kadar açılış yüklenmesi
→ Kesin auth durumu
→ Tek yönlendirme
```

---

## 9. Provider sıralaması

Önerilen kavramsal sıra:

```text
AppProviders
   ├── ThemeProvider
   └── AuthProvider
          └── Router içeriği
```

İleride sunucu verisi için ek bir sorgu önbellek kütüphanesi kullanılacaksa yeni bağımlılık gerekçelendirilmeden eklenmemelidir.

V1'in başlangıcında yalnızca gerçekten gerekli provider'lar kullanılmalıdır.

---

## 10. Supabase istemci mimarisi

### Dosya

```text
src/lib/supabase.ts
```

Görevleri:

- Supabase URL değerini okumak
- Publishable key değerini okumak
- Mobil oturum saklama adaptörünü bağlamak
- Oturum yenileme ayarlarını yapmak
- Tek Supabase istemci örneği üretmek

Kurallar:

- Dosyada gerçek sabit anahtar bulunmaz.
- Ortam değişkenleri `environment.ts` üzerinden doğrulanabilir.
- Eksik ortam değişkeni sessizce geçilmez.
- Secret veya service role anahtarı istemciye eklenmez.
- Farklı ekranlar ayrı Supabase istemcisi oluşturmaz.

---

## 11. Ortam değişkeni mimarisi

### Mobil istemci değişkenleri

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_APP_ENV
```

### Sunucu gizli değişkenleri

```text
SUPABASE_URL
SUPABASE_SECRET_KEY veya gerekli en düşük yetkili anahtar
GOLD_PRICE_API_BASE_URL
GOLD_PRICE_API_KEY
GOLD_PRICE_PROVIDER_CODE
GOLD_PRICE_REQUEST_TIMEOUT_MS
```

### Ortam doğrulama

```text
src/lib/environment.ts
```

Uygulama başlatılırken zorunlu istemci değişkenlerini doğrular.

Development, Preview ve Production birbirinden ayrılmalıdır.

---

## 12. Servis katmanı

### 12.1. `authService.ts`

- Kayıt
- Giriş
- Çıkış
- E-posta doğrulama
- Şifre sıfırlama
- Oturum okuma

### 12.2. `profileService.ts`

- Kullanıcı profilini getirme
- Görünen adı güncelleme
- Hesap durumunu okuma

Kullanıcı `account_status` değerini doğrudan değiştiremez.

### 12.3. `preferencesService.ts`

- Tema tercihini getirme
- Tema tercihini güncelleme

V1'de dil `tr`, para birimi `TRY` olarak sabittir.

### 12.4. `goldProductService.ts`

- Fiyat listesine açık ürünleri getirme
- Portföye açık ürünleri getirme
- Hesaplamaya açık ürünleri getirme
- Tek ürün detayını getirme

### 12.5. `goldPriceService.ts`

- Güncel fiyat listesini getirme
- Tek ürünün fiyatını getirme
- Fiyat durumunu uygulama modeline dönüştürme
- Eski ve eksik fiyat durumlarını işaretleme

Bu servis dış fiyat sağlayıcısına doğrudan bağlanmaz.

### 12.6. `portfolioService.ts`

- Kullanıcının portföyünü listeleme
- Tek kaydı getirme
- Kayıt oluşturma
- Kayıt güncelleme
- Kayıt silme

Kullanıcı kimliği arayüz formundan alınmamalıdır.

### 12.7. `legalService.ts`

- Aktif yasal belgeleri getirme
- Belge türüne göre belge getirme
- Uygun yasal olay kaydını oluşturma

### 12.8. `accountService.ts`

- Güvenli hesap silme fonksiyonunu çağırma
- İşlem durumunu yönetme
- Güvenli kullanıcı mesajı üretme

Auth hesabını doğrudan istemci yetkisiyle kontrolsüz silmez.

---

## 13. Etki alanı hesaplama yapısı

Önerilen klasör:

```text
src/domain/calculations/
├── money.ts
├── valuation.ts
├── portfolioSummary.ts
└── percentage.ts
```

### `money.ts`

- Para değerlerini güvenli biçimde ele alma
- Kuruş dönüşümü
- Sonuç yuvarlama sınırı

### `valuation.ts`

- Satın alma tahmini
- Bozdurma tahmini
- Kayıt bazında portföy değerlemesi

### `portfolioSummary.ts`

- Toplam maliyet
- Toplam hesaplanabilir değer
- Tam veya kısmi özet
- Toplam kâr-zarar

### `percentage.ts`

- Kâr-zarar yüzdesi
- Sıfıra bölme koruması
- Ekran gösterimine uygun değer

### Temel formüller

```text
Tahmini Bozdurma Değeri = Miktar × Güncel Alış Fiyatı
```

```text
Tahmini Satın Alma Tutarı = Miktar × Güncel Satış Fiyatı
```

```text
Tahmini Kâr/Zarar = Tahmini Bozdurma Değeri - Toplam Maliyet
```

```text
Değişim Yüzdesi = (Tahmini Kâr/Zarar ÷ Toplam Maliyet) × 100
```

---

## 14. Sayısal hassasiyet mimarisi

### Para

- Veritabanında kuruş cinsinden `BIGINT`
- Uygulama modellerinde güvenli tam sayı sınırları kontrol edilmeli
- Büyük değerlerin JavaScript güvenli tam sayı sınırını aşma ihtimali değerlendirilmelidir
- Gerekirse `bigint` veya güvenilir ondalık sayı yaklaşımı kullanılmalıdır

### Miktar

- Veritabanında `NUMERIC(18,3)`
- API ve TypeScript arasında ondalık değer metin olarak taşınabilir
- Doğrudan kayan nokta işlemiyle hassasiyet kaybı oluşturulmamalıdır

### Kural

Finansal hesaplama için yeni bir ondalık sayı kütüphanesi eklenmeden önce:

1. Gerekçe açıklanmalı
2. Güncelliği kontrol edilmeli
3. Android ve iOS uyumluluğu doğrulanmalı
4. Paket güvenliği incelenmeli
5. `DECISIONS.md` güncellenmelidir

---

## 15. Doğrulama mimarisi

Önerilen klasör:

```text
src/domain/validation/
├── authValidation.ts
├── portfolioValidation.ts
├── quantityValidation.ts
└── commonValidation.ts
```

### İstemci doğrulaması

Kullanıcıya hızlı geri bildirim sağlar.

Örnekler:

- Boş e-posta
- Eşleşmeyen şifreler
- Sıfır miktar
- Gelecek alış tarihi
- 500 karakteri aşan not

### Sunucu ve veritabanı doğrulaması

İstemci kontrolü aşılabileceği için aynı kritik kurallar backend veya veritabanında tekrar uygulanır.

Kurallar:

```text
quantity > 0
total_cost_minor > 0
purchase_date <= bugün
Adetli üründe miktar tam sayı
Gramlı üründe azami üç ondalık
Ürün aktif
Ürün portföye açık
```

---

## 16. TypeScript model yapısı

### Altın ürünü

Kavramsal alanlar:

```text
id
code
name
shortName
category
measurementUnit
quantityPrecision
packageWeightGrams
portfolioEnabled
calculatorEnabled
priceDisplayEnabled
```

### Fiyat

```text
productId
buyPriceMinor
sellPriceMinor
currencyCode
priceUnit
dailyChangePercent
dayLowMinor
dayHighMinor
sourcePriceAt
fetchedAt
isStale
sourceName
```

### Portföy kaydı

```text
id
product
quantity
purchaseDate
totalCostMinor
purchasePlace
note
laborIncluded
createdAt
updatedAt
```

### Hesaplanmış değer

```text
status
usedPriceMinor
usedPriceType
priceAt
isStale
estimatedLiquidationValueMinor
profitLossMinor
profitLossPercent
```

### Genel hata

```text
code
userMessage
retryable
requestId
cause
```

`cause` kullanıcıya gösterilmez ve hassas bilgi içermemelidir.

---

## 17. Ham veri ile uygulama modeli ayrımı

Supabase'ten gelen ham satır adları snake_case olabilir:

```text
total_cost_minor
purchase_date
labor_included
```

Uygulama modeli camelCase kullanabilir:

```text
totalCostMinor
purchaseDate
laborIncluded
```

Dönüşüm tek bir mapper katmanında yapılmalıdır.

Önerilen yapı:

```text
src/services/mappers/
├── goldProductMapper.ts
├── goldPriceMapper.ts
├── portfolioMapper.ts
└── legalDocumentMapper.ts
```

Mapper klasörü ancak dönüşümler gerçekten tekrar etmeye başladığında eklenebilir. İlk dosyalarda gereksiz soyutlama yapılmamalıdır.

---

## 18. Veri akışı örnekleri

### 18.1. Fiyat listesini açma

```text
Fiyatlar ekranı açılır
        ↓
useGoldPrices çalışır
        ↓
goldPriceService çağrılır
        ↓
Supabase güncel fiyat görünümü veya sorgusu
        ↓
Ham veri doğrulanır ve modele dönüştürülür
        ↓
Ekran yüklenme, başarı, eski veri veya hata durumunu gösterir
```

### 18.2. Portföye kayıt ekleme

```text
Kullanıcı formu doldurur
        ↓
İstemci doğrulaması
        ↓
portfolioService.create çağrısı
        ↓
Supabase Data API
        ↓
RLS ve veritabanı doğrulaması
        ↓
Kayıt oluşturulur
        ↓
Portföy önbelleği yenilenir
        ↓
Kayıt detay ekranı açılır
```

### 18.3. Portföy özetini hesaplama

```text
Portföy kayıtlarını getir
        +
Ürünlerin geçerli alış fiyatlarını getir
        ↓
Kayıtları ürün kimliğine göre eşleştir
        ↓
Her kayıt için tahmini değer hesapla
        ↓
Hesaplanabilen ve hesaplanamayan kayıtları ayır
        ↓
Tam veya kısmi portföy özeti üret
        ↓
Ekrana göster
```

---

## 19. Fiyat verisi mimarisi

### Mobil uygulama

Mobil uygulama yalnızca Supabase'teki doğrulanmış fiyatları okur.

### Güvenli sunucu fonksiyonu

Önerilen konum:

```text
supabase/functions/fetch-gold-prices/
```

Görevleri:

1. Sunucu gizli değişkenlerini okumak
2. Fiyat sağlayıcısına REST isteği göndermek
3. İstek zaman aşımını yönetmek
4. Yanıt şemasını doğrulamak
5. Dış sembolleri eşleştirme tablosunda bulmak
6. Fiyatları kuruşa dönüştürmek
7. Geçersiz fiyatları reddetmek
8. Geçerli fiyatları kaydetmek
9. `price_fetch_runs` sonucunu güncellemek
10. Gizli bilgileri loglamamak

### Sembol eşleştirme

```text
Dış sembol
    ↓
price_source_product_mappings
    ↓
gold_products
    ↓
gold_prices
```

Bilinmeyen sembol otomatik ürün oluşturmaz.

---

## 20. Edge Function mimarisi

### V1 fonksiyonları

```text
fetch-gold-prices (Edge Function)
delete-account (Edge Function)
record_user_legal_event (PostgreSQL RPC)
```

### `fetch-gold-prices`

- Son kullanıcı tarafından kontrolsüz çağrılamaz; 5 dakikalık sunucu tarafı hız sınırı (cooldown) ile korunur
- `pg_cron` ve `pg_net` zamanlanmış görevi veya yetkili geliştirme çağrısıyla çalışır
- Fiyat API anahtarını secret store üzerinden alır
- Fiyat doğrulama işleminden geçirir ve aykırı değişim filtresi uygular ([-50%, +50%])
- Sonucu `service_role` yetkisiyle veritabanına yazar

### `record_user_legal_event` (PostgreSQL RPC)

Yasal belge görüntüleme, kabul, reddetme veya açık rıza geri çekme olaylarını doğrudan PostgreSQL `SECURITY DEFINER` RPC fonksiyonu üzerinden append-only olarak güvenle oluşturur. Kayıt anında (`handle_new_user`) veya aktif oturumda (`record_user_legal_event`) çalışır.

Akış:

```text
Mobil uygulama
    ↓
Güvenli RPC veya Edge Function
    ↓
Oturum doğrulaması
    ↓
legal_documents kaydının doğrulanması
    ↓
Belge sürümünün sunucudan alınması
    ↓
Olay zamanının sunucu tarafından atanması
    ↓
user_legal_events append-only kaydı
```

### `delete-account`

- Kimliği oturum belirtecinden alır
- Yeniden doğrulama şartını kontrol eder
- Kullanıcıdan serbest `user_id` kabul etmez
- Kişisel verileri belirlenen sırayla siler
- Kısmi başarısızlığı gizlemez
- Secret veya service role yetkisini istemciye döndürmez

---

## 21. Hata yönetimi mimarisi

### Ortak hata modeli

```text
AppError
├── code
├── userMessage
├── retryable
├── requestId
└── cause
```

### Hata akışı

```text
Supabase veya ağ hatası
        ↓
Servis katmanı
        ↓
normalizeError
        ↓
Ortak AppError
        ↓
Ekrandaki güvenli Türkçe mesaj
```

### Kullanıcıya gösterilmeyecekler

- SQL sorgusu
- Stack trace
- API anahtarı
- Oturum belirteci
- Veritabanı şifresi
- Başka kullanıcı kimliği
- Ham sağlayıcı hatasının hassas ayrıntıları

### Beklenen ekran durumları

Her veri ekranı en az şu durumları desteklemelidir:

```text
idle
loading
success
empty
error
stale
partial
```

Her ekranın bütün durumları kullanması gerekmez, ancak ilgili durumlar açıkça tasarlanmalıdır.

---

## 22. Yüklenme, boş ve hata bileşenleri

Önerilen ortak bileşenler:

```text
LoadingState
EmptyState
ErrorState
StaleDataBanner
PartialDataBanner
InlineFieldError
FullScreenError
```

### Kurallar

- Yüklenirken sonsuz boş ekran gösterilmez.
- Hata yalnızca `Bir hata oluştu` şeklinde bırakılmaz.
- Kullanıcıya ne yapabileceği söylenir.
- Yeniden deneme güvenliyse buton gösterilir.
- Fiyat eskiyse son güncelleme zamanı gösterilir.
- Portföy boşsa ilk kayıt eklemeye yönlendirilir.

---

## 23. Tema mimarisi

### Tema seçenekleri

```text
light
dark
system
```

### Tema kaynakları

```text
src/theme/lightTheme.ts
src/theme/darkTheme.ts
src/theme/spacing.ts
src/theme/typography.ts
```

### Temel renk yaklaşımı

Açık tema:

```text
Arka plan: #F7F8FA
Kart: #FFFFFF
Ana lacivert: #14213D
Mat altın: #D4A72C
Ana metin: #1C2434
İkincil metin: #667085
Kâr: #168A5B
Zarar: #C43D4B
```

Koyu tema:

```text
Arka plan: #0B1220
Kart: #111C2F
Yükseltilmiş yüzey: #17243A
Ana metin: #F5F7FA
İkincil metin: #AAB2C0
Altın vurgu: #E0B84F
```

### Kurallar

- Renk değerleri ekran dosyalarına dağılmaz.
- Kâr ve zarar yalnızca renkle anlatılmaz.
- Sistem teması değiştiğinde `system` seçeneği uyum sağlar.
- Kullanıcı tercihi Supabase'te saklanabilir.

---

## 24. Bileşen mimarisi

### Common

```text
PrimaryButton
SecondaryButton
DangerButton
IconButton
ScreenContainer
SectionHeader
Divider
```

### Feedback

```text
LoadingState
EmptyState
ErrorState
StaleDataBanner
PartialDataBanner
SuccessMessage
```

### Forms

```text
TextField
PasswordField
CurrencyField
QuantityField
DateField
SelectField
CheckboxField
FormErrorSummary
```

### Gold

```text
GoldPriceCard
GoldPriceRow
GoldProductSelector
PriceFreshnessLabel
```

### Portfolio

```text
PortfolioSummaryCard
PortfolioEntryCard
ProfitLossLabel
PortfolioEmptyState
```

### Kurallar

- Bileşen yalnızca tek ekranda kullanılıyorsa erken aşamada ortak klasöre taşınmak zorunda değildir.
- Aşırı büyük ekran bileşeni daha küçük anlamlı parçalara ayrılır.
- Her küçük metin için ayrı bileşen oluşturulmaz.
- Buton ve form davranışları iki platformda test edilir.

---

## 25. Form mimarisi

Her formda şu durumlar yönetilmelidir:

```text
initial
editing
submitting
success
failure
```

### Kurallar

- Gönderim sürerken ana buton devre dışı bırakılır.
- Çift dokunmayla iki kayıt oluşturulması engellenir.
- Alan hatası ilgili alanın altında gösterilir.
- Genel sunucu hatası formun üstünde veya altında gösterilir.
- Şifre değerleri loglanmaz.
- Kaydedilmemiş değişiklik varsa geri çıkış uyarısı değerlendirilebilir.
- Klavye açıldığında alan ve buton erişilebilir kalmalıdır.
- Android geri tuşu ve iOS geri hareketi test edilmelidir.

---

## 26. Navigasyon kuralları

1. Başarılı giriş sonrası Ana Sayfa açılır.
2. Başarılı kayıt sonrası e-posta doğrulama ekranı açılır.
3. Başarılı portföy ekleme sonrası kayıt detayı açılır.
4. Başarılı düzenleme sonrası güncel kayıt detayı açılır.
5. Başarılı silme sonrası Portföyüm ekranına dönülür.
6. Çıkış sonrası protected geçmiş temizlenir.
7. Hesap silme sonrası public başlangıç ekranına dönülür.
8. Yetkisiz rota güvenli ekrana yönlendirilir.
9. Geri tuşu kullanıcıyı silinmiş veya artık geçersiz ekrana döndürmemelidir.
10. Şifre sıfırlama ve e-posta doğrulama derin bağlantıları iki platformda test edilmelidir.

---

## 27. Önbellek mimarisi

### Fiyatlar

- Son başarılı fiyatlar sınırlı süreli önbelleğe alınabilir.
- Önbellek fiyatı kullanılırsa eski veri olarak işaretlenir.
- Son fiyat zamanı saklanır.

### Portföy

- Portföy hassas kişisel finans verisidir.
- Tam portföyün düz ve korumasız yerel depolamada tutulması önlenir.
- Yerel önbellek kullanılırsa kullanıcı ve oturum değişiminde temizlenir.
- V1'de çevrimdışı yazma kuyruğu bulunmaz.

### Auth

- Oturum, güncel Supabase ve Expo yaklaşımına uygun güvenli depolama ile yönetilir.
- Başka kullanıcı giriş yaptığında önceki kullanıcının özel verisi görünmez.

---

## 28. Ağ bağlantısı mimarisi

`useNetworkStatus` yalnızca kullanıcı deneyimine yardımcı olabilir. Ağ durumu var görünse bile sunucu erişimi başarısız olabilir.

Kurallar:

- Ağ durumu tek güven kaynağı değildir.
- İstek hataları ayrıca ele alınır.
- İnternet yokken yazma işlemi başarılı gösterilmez.
- Fiyatlarda son bilinen veri varsa açık uyarıyla gösterilebilir.
- Portföy düzenleme için V1'de aktif bağlantı gerekir.

---

## 29. Güvenlik sınırları

### Mobil uygulamanın sorumluluğu

- Form doğrulama
- Güvenli kullanıcı deneyimi
- Publishable key kullanımı
- Hassas verileri loglamama
- Oturum ve yerel önbelleği doğru yönetme

### Veritabanının sorumluluğu

- RLS
- Yabancı anahtarlar
- `CHECK` kısıtları
- Benzersizlik kuralları
- Kullanıcı sahipliği

### Güvenli sunucu fonksiyonlarının sorumluluğu

- Gizli anahtar kullanımı
- Fiyat çekme
- Yetkili veritabanı yazımı
- Auth kullanıcısını silme
- Hassas yönetim işlemleri

Mobil uygulama güvenlik sınırı olarak tek başına kabul edilmez.

---

## 30. RLS mimarisi

RLS uygulanacak temel kullanıcı tabloları:

```text
user_profiles
user_preferences
portfolio_entries
user_legal_events
account_deletion_requests
```

Her tablo için ayrı SELECT, INSERT, UPDATE ve DELETE ihtiyacı değerlendirilmelidir.

### Portföy örneği

```text
SELECT → Yalnızca user_id = auth kullanıcısı
INSERT → Yeni user_id = auth kullanıcısı
UPDATE → Eski ve yeni user_id = auth kullanıcısı
DELETE → Yalnızca user_id = auth kullanıcısı
```

Normal kullanıcıların yazamayacağı tablolar:

```text
gold_products
price_sources
price_source_product_mappings
gold_prices
price_fetch_runs
security_events
legal_documents
```

---

## 31. Veritabanı değişiklik yönetimi

Veritabanı değişiklikleri elle ve kayıtsız biçimde üretim panelinde yapılmamalıdır.

Önerilen yöntem:

```text
supabase/migrations/
```

Her değişiklik:

1. Migration dosyası olarak oluşturulur.
2. Development ortamında uygulanır.
3. Test edilir.
4. `DATABASE.md` ile karşılaştırılır.
5. Güvenlik politikaları test edilir.
6. Preview ortamında doğrulanır.
7. Production ortamına kontrollü uygulanır.

Seed verileri gerçek kullanıcı verisi içermemelidir.

---

## 32. Test mimarisi

### 32.1. Birim testleri

```text
tests/unit/
```

Öncelikli testler:

- Kuruş hesaplamaları
- Bozdurma değeri
- Satın alma değeri
- Kâr-zarar
- Yüzde hesabı
- Kısmi toplam
- Adet doğrulaması
- Gram hassasiyeti
- Tarih doğrulaması
- Hata dönüştürme

### 32.2. Entegrasyon testleri

```text
tests/integration/
```

- Auth servisi ve test Supabase projesi
- Portföy CRUD işlemleri
- Ürün ve fiyat sorguları
- Yasal belge sorguları
- Edge Function çağrıları

### 32.3. Güvenlik testleri

```text
tests/security/
```

- Kullanıcı A, B'nin verisini okuyamaz
- Kullanıcı A, B adına kayıt oluşturamaz
- Kullanıcı A, B'nin kaydını güncelleyemez
- Kullanıcı A, B'nin kaydını silemez
- Normal kullanıcı fiyat yazamaz
- Normal kullanıcı ürün eşleştirmesi değiştiremez
- Hesap silme fonksiyonu kullanıcı kimliğini gövdeden kabul etmez

### 32.4. Manuel cihaz testleri

- Android fiziksel cihaz
- iPhone veya gerçek iOS test süreci
- Küçük ekran
- Büyük ekran
- Açık tema
- Koyu tema
- Büyük yazı boyutu
- Klavye açık form
- İnternet yok
- Yavaş bağlantı
- Oturum süresi dolmuş
- E-posta bağlantısı

---

## 33. Test verisi kuralları

- Gerçek kullanıcı e-postası kullanılmamalıdır.
- Gerçek portföy ve finans bilgisi kullanılmamalıdır.
- Test fiyatları gerçek fiyat gibi yayımlanmamalıdır.
- Sahte fiyat kullanılıyorsa ekranda test verisi olduğu açıkça gösterilmelidir.
- Development ve Production verileri karıştırılmamalıdır.
- Test hesapları yayımlama öncesi temizlenmelidir.

---

## 34. Android ve iOS uyumluluğu

Her özellikte kontrol edilecek alanlar:

- Safe area
- Klavye davranışı
- Tarih seçici
- Geri düğmesi ve geri hareketi
- Derin bağlantılar
- Secure storage
- Sistem teması
- Durum çubuğu
- Alt menü yüksekliği
- Para klavyesi
- Ondalık ayırıcı
- Erişilebilirlik etiketleri
- Dokunma alanı
- Uygulama arka plana gidip geldiğinde oturum

Platforma özel kod gerekirse:

```text
Dosya.platform.ts
```

veya kontrollü `Platform` kullanımı değerlendirilebilir. Aynı kodun gereksiz iki kopyası oluşturulmaz.

---

## 35. Erişilebilirlik mimarisi

- Kâr ve zarar yalnızca renkle anlatılmaz.
- Butonların erişilebilir adları bulunur.
- İkon butonlarda açıklayıcı etiket bulunur.
- Dokunma alanları yeterli büyüklükte olur.
- Metin büyütme ekranı bozmamalıdır.
- Fiyat kartlarında alış ve satış açıkça söylenir.
- Form hata mesajları alanla ilişkilendirilir.
- Yüklenme ve başarı durumları ekran okuyucuya bildirilebilir.

---

## 36. Performans yaklaşımı

V1 için ağır ve erken optimizasyon yapılmayacaktır.

Kurallar:

- Uzun listelerde `FlatList` kullanımı değerlendirilir.
- Aynı fiyat sorgusu gereksiz yere tekrarlanmaz.
- Her kullanıcı için dış fiyat API çağrısı yapılmaz.
- Görseller uygun boyutta tutulur.
- Büyük nesneler gereksiz global state içinde saklanmaz.
- Performans sorunu ölçülmeden karmaşık önbellek sistemi eklenmez.

---

## 37. Bağımlılık ekleme kuralları

Yeni paket eklenmeden önce:

1. Hangi problemi çözdüğü açıklanır.
2. Expo'nun mevcut sürümüyle uyumu kontrol edilir.
3. Android desteği kontrol edilir.
4. iOS desteği kontrol edilir.
5. Güncelliği ve bakım durumu kontrol edilir.
6. Güvenlik riski değerlendirilir.
7. Aynı iş mevcut Expo veya JavaScript özelliğiyle yapılabiliyor mu kontrol edilir.
8. Paket lisansı incelenir.
9. Gerekliyse `DECISIONS.md` güncellenir.

Gereksiz UI, state, form veya tarih kütüphanesi eklenmemelidir.

---

## 38. Kodlama standartları

- TypeScript strict yaklaşımı hedeflenir.
- `any` kullanımından kaçınılır.
- Anlamlı değişken ve fonksiyon adları kullanılır.
- Teknik dosya adları İngilizce olur.
- Kullanıcı metinleri Türkçe olur.
- Büyük fonksiyonlar küçük ve anlamlı parçalara ayrılır.
- İş mantığı JSX içine yazılmaz.
- Aynı hesaplama birden fazla yerde kopyalanmaz.
- Hata sessizce yutulmaz.
- Hassas bilgi `console.log` ile yazılmaz.
- Kullanılmayan kod tutulmaz.
- Büyük refactor ayrı görev olarak ele alınır.

---

## 39. Günlükleme kuralları

Geliştirme sırasında sınırlı teknik log kullanılabilir.

Loglanabilecekler:

- İşlem türü
- Güvenli hata kodu
- İşlem süresi
- Alınan veya reddedilen sembol sayısı
- Hassas olmayan takip kimliği

Loglanmayacaklar:

- Şifre
- Erişim belirteci
- Yenileme belirteci
- API anahtarı
- Veritabanı şifresi
- Tam portföy
- Kullanıcı notunun tamamı
- Gereksiz e-posta bilgisi

Üretim logları daha sınırlı olmalıdır.

---

## 40. Hesap silme mimarisi

```text
Ayarlar
   ↓
Hesabı ve Verileri Sil
   ↓
Silinecek verileri açıkla
   ↓
Kullanıcıyı yeniden doğrula
   ↓
delete-account Edge Function
   ↓
Silme talebi kaydı
   ↓
Hesap durumu deletion_pending
   ↓
Portföy ve tercihler silinir
   ↓
Yasal ve güvenlik kayıtları saklama politikasına göre ele alınır
   ↓
Profil ve Auth hesabı silinir
   ↓
Yerel oturum ve önbellek temizlenir
   ↓
Public başlangıç ekranı
```

Kısmi hata durumunun telafi yöntemi `DATA_RETENTION.md`, `SECURITY.md` ve gerçek Supabase uygulamasıyla birlikte kesinleştirilecektir.

---

## 41. Yasal belge mimarisi

Yasal belgeler uygulama paketine yalnızca sabit metin olarak gömülmeyecektir. Veritabanındaki aktif sürümler kullanılacaktır.

```text
legal_documents
        ↓
legalService
        ↓
Yasal Belge Ekranı
```

Kullanıcı olayları:

```text
user_legal_events
```

Aydınlatma ve açık rıza süreçleri ayrı tutulur.

Yasal belgeler çevrimdışı görüntüleme amacıyla sürüm bilgisi korunarak önbelleğe alınabilir.

---

## 42. Finansal bilgilendirme mimarisi

Finansal uyarı yalnızca tek bir ekranın içine kopyalanmamalıdır.

Önerilen sabit veya yasal belge kaynağı:

```text
financial_disclaimer
```

Gösterim yerleri:

- Altın detay ekranı
- Hesaplama sonucu
- Portföy özeti veya yardım alanı
- Yasal belgeler

Metnin kısa ve uzun sürümü gerekirse ayrı tanımlanmalıdır.

---

## 43. Mimari kapsam dışı alanlar

V1 mimarisine aşağıdaki yapılar eklenmeyecektir:

```text
Redux veya başka ağır global state altyapısı, zorunluluk ortaya çıkmadan
WebSocket fiyat bağlantısı
Favoriler modülü
Fiyat alarmı modülü
Bildirim cihaz kayıtları
Satış geçmişi
Kısmi satış
Portföy grafik altyapısı
Ödeme ve abonelik altyapısı
Reklam SDK'sı
Kamera ve belge yükleme
Konum ve harita
Mesajlaşma
Sosyal özellikler
Web uygulaması
Gelişmiş yönetici paneli
```

---

## 44. Mimari kararlar ve açık konular

### 44.1. Kilitlenen ve uygulanan mimari kararlar

1. **Expo SDK Sürümü:** Expo SDK 58 (`expo@~58.0.19`, React Native 0.88, React 19.3, Expo Router 58) kilitlendi.
2. **Supabase Paketleri:** `@supabase/supabase-js@^2.118.0` ve CLI `supabase@^2.121.0` kilitlendi.
3. **Mobil Oturum Saklama:** `expo-secure-store` ile donanımsal anahtarlık tabanlı şifreli oturum adaptörü uygulandı.
4. **Önbellek & Form Kütüphaneleri:** Sıfır harici bağımlılık prensibi uygulandı; ek React Query/Form kütüphanesi kullanılmadı.
5. **Sayısal Hassasiyet:** Harici kütüphane kullanılmadan kuruş tamsayı modeli (BIGINT) ve gram için NUMERIC(18,3) kilitlendi (ADR-032).
6. **Test Altyapısı:** `npx tsx` ve Node.js yerleşik assert altyapısı ile 20'yi aşkın uçtan uca test paketi oluşturuldu.
7. **Supabase Veri Merkezi:** AB eu-central-1 Frankfurt (Almanya) bölgesi seçildi ve kilitlendi (ADR-002).
8. **Derin Bağlantı (Deep Linking):** `altiniz://` şeması ve `https://altiniz.app` evrensel bağlantıları yapılandırıldı.
9. **Portföy Hesaplama Katmanı:** İstemci saf etki alanı (`portfolioDomain.ts`) katmanı kararlaştırıldı (ADR-010).
10. **Fiyat Okuma ve Güvenlik:** İstemciler doğrudan `gold_prices` tablosunu RLS ile okur; dış API'ye doğrudan istek atamaz.
11. **Bayatlık Eşiği:** 15 dakikalık tazelik eşiği kilitlendi (ADR-014).
12. **Fiyat Zamanlayıcısı:** `pg_cron` ile 24/7 her 15 dakikada bir çalışan zamanlayıcı ve 5 dk sunucu cooldown'ı kilitlendi (ADR-035, ADR-039).
13. **Olağan Dışı Değişim Filtresi:** `[-50%, +50%]` aykırı veri sınırlandırması uygulandı (KI-011).
14. **Hesap Silme Mimarisi:** Model A (Edge Function işlem dışı talep yönetimi + atomik `execute_account_deletion` SQL RPC + `auth.admin.deleteUser`) kilitlendi (ADR-033).
15. **Yasal Olay Saklama:** Append-only yapı ve `user_id = NULL` ile doğrudan kimlik bağlantısının koparılması kilitlendi (ADR-033).
16. **Üçüncü Taraf SDK'lar:** Sentry, Firebase veya reklam SDK'sı kullanılmaz; sıfır izleme kuralı kilitlendi (ADR-026).
17. **Production Loglama:** `logger.ts` ile şifre/token maskelemesi ve canlıda debug loglarının susturulması kilitlendi (Faz 13).

### 44.2. Dış bağımlılığı olan açık konular

1. **Üretim e-posta sağlayıcısı:** Resmî kurumsal SMTP sağlayıcısı entegrasyonu (KI-017).
2. **Fiyat sağlayıcısı ticari lisansı:** Truncgil Finance kamu verisi ticari gösterim ve saklama lisansı / AltinAPI sözleşmesi (KI-003, KI-033).

---

## 45. Kodlamaya başlamadan önce mimari kontrol listesi

- [x] Expo projesinin gerçek varsayılan yapısı incelendi.
- [x] Kullanılacak Expo SDK sürümü doğrulandı (SDK 58).
- [x] TypeScript ayarları doğrulandı.
- [x] Expo Router rota grupları doğrulandı.
- [x] Android ve iOS uygulama kimlikleri belirlendi (com.altiniz.app).
- [x] Development Supabase projesi oluşturuldu.
- [x] Supabase bölgesi kararı kaydedildi (eu-central-1 Frankfurt).
- [x] Auth mobil oturum yaklaşımı doğrulandı (SecureStore).
- [x] Derin bağlantı yaklaşımı doğrulandı.
- [x] `DATABASE.md` ile migration taslağı eşleştirildi (12 migration uygulandı).
- [x] RLS politika taslağı hazırlandı (12 tablo RLS aktif).
- [x] Fiyat sağlayıcı test hesabı oluşturuldu.
- [x] Gerçek sembol listesi doğrulandı (25 aktif ürün).
- [x] Gizli anahtar saklama yöntemi hazırlandı (src/ içinde 0 service_role).
- [x] Test klasörü ve komutları belirlendi.
- [x] `.gitignore` gizli dosyaları kapsıyor.
- [x] `.env.example` yalnızca değişken isimlerini içeriyor.

---

## 46. Her özellik için mimari çalışma sırası

```text
1. PROJECT_CONTEXT.md dosyasını oku
2. ARCHITECTURE.md dosyasını oku
3. İlgili DATABASE.md bölümünü oku
4. İlgili API.md bölümünü oku
5. DECISIONS.md içindeki ilgili kararı kontrol et
6. Mevcut kodu incele
7. Değişecek dosyaları listele
8. Git durumunu kontrol et
9. Küçük değişikliği yap
10. Birim testini çalıştır
11. Entegrasyon davranışını kontrol et
12. Android'de test et
13. iOS uyumluluğunu kontrol et
14. Güvenlik ve gizlilik etkisini kontrol et
15. Belgeleri güncelle
16. Çalışan sürümü Git'e kaydet
17. HANDOFF.md dosyasını güncelle
```

---

## 47. Mimari tamamlanma ölçütleri

Bu mimari ancak aşağıdakiler sağlandığında V1 için uygulanmış kabul edilir:

- Public ve protected rota grupları çalışıyor.
- Oturum yüklenmesi yönlendirme döngüsü oluşturmuyor.
- Supabase istemcisi tek noktadan yönetiliyor.
- Ekranlar doğrudan karmaşık Supabase sorguları içermiyor.
- Portföy hesaplamaları ortak etki alanı fonksiyonlarını kullanıyor.
- Kullanıcı A ve B veri ayrılığı testleri geçiyor.
- Normal kullanıcı fiyat ve eşleştirme tablolarına yazamıyor.
- Fiyat API anahtarı mobil uygulamada bulunmuyor.
- Eski ve eksik fiyat durumları standart gösteriliyor.
- Açık ve koyu tema çalışıyor.
- Temel formlar Android ve iOS'ta kullanılabiliyor.
- Kritik hesaplama fonksiyonlarının birim testleri geçiyor.
- Hesap silme akışı güvenli sunucu fonksiyonuyla çalışıyor.
- Proje klasörleri belgede açıklanan sorumluluklara uyuyor.

---

## 48. İlgili proje belgeleri

```text
docs/PROJECT_CONTEXT.md
docs/DATABASE.md
docs/API.md
docs/DECISIONS.md
docs/SECURITY.md
docs/PRIVACY.md
docs/DATA_RETENTION.md
docs/TODO.md
docs/CHANGELOG.md
docs/KNOWN_ISSUES.md
docs/HANDOFF.md
.github/copilot-instructions.md
```

Mimaride yapılan önemli değişiklik:

- `DECISIONS.md` içinde gerekçelendirilmelidir.
- `PROJECT_CONTEXT.md` içinde güncel duruma yansıtılmalıdır.
- `CHANGELOG.md` içinde kaydedilmelidir.
- Veritabanını etkiliyorsa `DATABASE.md` güncellenmelidir.
- API davranışını etkiliyorsa `API.md` güncellenmelidir.
- Kişisel veri akışını etkiliyorsa `PRIVACY.md` ve `DATA_RETENTION.md` güncellenmelidir.

---

## 49. Sürüm geçmişi

### 0.4 Taslak - 26.10.2026

- `ModalHeader`, `ScreenContainer` padding standartlaştırması (`withPadding={false}`), ve sayfa geçişlerindeki beyaz parlamayı önleyen `sceneStyle` ve `contentStyle: { backgroundColor: theme.colors.background }` mimarisi uygulandı.
- `src/utils/formatters.ts` içerisine `normalizeSearchText` fonksiyonu eklenerek arama katmanında Türkçe karakter duyarsızlığı ve Unicode NFD aksan temizliği sağlandı.
- Migration 012 ile 25 aktif ürünün canlı piyasa eşleştirmesi ve 24/7 her 15 dakikada bir tetiklenen pg_cron/pg_net zamanlayıcı mimarisi sisteme bağlandı.

### 0.2 Taslak - 19.10.2026 

- `record_user_legal_event` güvenli PostgreSQL RPC işlemi mimariye eklendi. 
- Yasal olayların doğrudan mobil istemciden tabloya yazılmaması kararlaştırıldı. 
- Belge sürümü ve olay zamanının sunucudan üretilmesi mimari kurala bağlandı.

### 0.1 Taslak - 03.09.2026

- Üst seviye sistem mimarisi tanımlandı.
- Katmanların görevleri belirlendi.
- Önerilen proje klasör yapısı oluşturuldu.
- Expo Router rota grupları tanımlandı.
- Kullanıcı oturumu ve provider yapısı tanımlandı.
- Supabase istemci ve servis katmanı tanımlandı.
- Hesaplama ve doğrulama yapısı tanımlandı.
- Edge Function sorumlulukları tanımlandı.
- Hata, tema, form ve önbellek yaklaşımı tanımlandı.
- RLS, migration ve test yaklaşımı tanımlandı.
- Android ve iOS uyumluluk kontrolleri eklendi.
- Açık mimari kararlar ve kontrol listeleri eklendi.

---

## 50. Belge güncelleme kuralı

Bu belge aşağıdaki durumlardan birinde güncellenmelidir:

- Proje klasör yapısı değişirse
- Yeni ana katman eklenirse
- Expo Router rota yapısı değişirse
- Auth yönetimi değişirse
- Supabase istemci yapısı değişirse
- Yeni provider eklenirse
- Servis sorumlulukları değişirse
- Portföy hesaplama yeri değişirse
- Edge Function eklenir veya kaldırılırsa
- Yeni platform bağımlılığı oluşursa
- Test altyapısı kesinleşirse
- Yeni kişisel veri akışı oluşursa
- V1 kapsamı değişirse

Eski mimari kararlar sessizce silinmemeli, değişikliğin gerekçesi `DECISIONS.md` içinde kaydedilmelidir.
