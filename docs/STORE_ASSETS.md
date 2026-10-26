# Altın İz — Mağaza Görsel Varlıkları ve Ekran Görüntüleri Kılavuzu

**Belge adı:** `STORE_ASSETS.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.1 Taslak  
**Son güncelleme:** 26.10.2026  
**Proje aşaması:** Bölüm 21: Mağaza hazırlığı (Faz 15.1: Görsel mağaza varlıkları)  
**İlgili kararlar:** ADR-001 (Marka ve Tasarım), ADR-004 (Tema), ADR-013 (Portföy Hesaplama)

---

## 1. Belgenin Amacı ve Kapsamı

Bu belge; Google Play Store ve Apple App Store mağazalarında yayınlanacak olan **Altın İz** mobil uygulamasının logo, ikon, açılış ekranı (splash screen) ve vitrin tanıtım ekran görüntülerine (screenshots) ilişkin tasarım standartlarını, teknik ölçülerini ve yasal uyumluluk kurallarını belirler.

---

## 2. Kurumsal Renk ve Kontrast Standartları

Altın İz görsel dili; altının zenginliğini ve modern finansal arayüzün sadeliğini birleştiren yüksek kontrastlı bir palete dayanır.

| Öğe | Renk Adı | Hex Kodu | Kullanım Amacı | Kontrast Oranı (WCAG) |
|---|---|---|---|---|
| **Ana Vurgu (Gold)** | Mat Altın | `#E0B84F` / `#D4A72C` | Logo, külçe motifleri, birincil aksiyonlar | `#0B1220` zemin üzerinde > 8.5:1 (AAA) |
| **Koyu Zemin (Dark)** | Gece Laciverti | `#0B1220` / `#111C2F` | Koyu tema arka planı, adaptive icon zemini | Temel arka plan |
| **Açık Zemin (Light)** | Saf Beyaz | `#FFFFFF` / `#F8F9FA` | Açık tema arka planı, açık logo testi | Temel arka plan |
| **Kazanç (Profit)** | Zümrüt Yeşili | `#22C55E` | Kâr göstergeleri, olumlu piyasa hareketleri | Zeminle uyumlu kontrast |
| **Kayıp (Loss)** | Yakut Kırmızısı | `#EF4444` | Zarar göstergeleri, negatif makas/fiyat | Zeminle uyumlu kontrast |

---

## 3. Uygulama İkonu ve Açılış Varlıkları Matrisi

| Varlık | Dosya Yolu | Çözünürlük | Biçim | Açıklama |
|---|---|---|---|---|
| **Ana İkon (Evrensel)** | `assets/images/icon.png` | 1024 × 1024 px | PNG (No Alpha) | Apple App Store ve mağaza ana görseli. Şeffaflık içermez. |
| **Android Adaptive Foreground** | `assets/images/android-icon-foreground.png` | 512 × 512 px | PNG | Katmanlı logonun ön plan külçe/iz motifi. |
| **Android Adaptive Background** | `assets/images/android-icon-background.png` | 512 × 512 px | PNG | Katmanlı logonun arka plan dokusu (#0B1220 tabanlı). |
| **Android Adaptive Monochrome** | `assets/images/android-icon-monochrome.png` | 512 × 512 px | PNG | Android 13+ Material You temalı dinamik simge desteği. |
| **Açılış Ekranı (Splash)** | `assets/images/splash-icon.png` | 512 × 512 px | PNG | `#0B1220` koyu zemin üzerinde ortalanmış açılış ikonu. |
| **Google Play Tanıtım Afişi** | `assets/images/feature-graphic.png` | 1024 × 500 px | PNG | Google Play Store vitrin tanıtım afişi (Feature Graphic). |
| **Web Favicon** | `assets/images/favicon.png` | 48 × 48 px | PNG | Web ve dokümantasyon önizleme ikonu. |

---

## 4. Açık ve Koyu Arka Planda Logo Uyumluluğu

1. **Koyu Arka Plan (#0B1220):**
   - Altın motif (`#E0B84F`) koyu zemin üzerinde doğal parlaklık kazanır.
   - Metinler beyaz (`#FFFFFF`) ve açık gri (`#E0E0E0`) olarak yüksek okunurluk sağlar.
2. **Açık Arka Plan (#FFFFFF):**
   - Altın külçe çizgileri koyu altın ve kontur hatlarıyla desteklenir; beyaz zemin üzerinde silikleşmez.
   - WCAG 2.1 AA erişilebilirlik kontrast eşiği (en az 4.5:1) tüm varyasyonlarda korunur.

---

## 5. Mağaza Ekran Görüntüleri Kılavuzu (Screenshots Storyboard)

Mağaza vitrininde kullanıcıyı karşılayacak 5 ana tanıtım panosu:

### Pano 1: Canlı Altın Piyasası (Ana Sayfa & Fiyatlar)
- **Başlık:** "Kapalıçarşı ve Serbest Piyasa Fiyatları Cebinizde"
- **Alt Başlık:** "Gram, Çeyrek, Yarım, Tam, Ata ile 14, 18 ve 22 Ayar altın fiyatları."
- **Gösterilen Ekran:** `(protected)/(tabs)/prices` listesi.
- **Vurgu:** Serbest piyasa ve Kapalıçarşı canlı kurları ve çekip-yenileme (pull-to-refresh).

### Pano 2: Fiyat Detayı ve Makas Analizi
- **Başlık:** "Alış-Satış Makas Farkını Şeffafça Görün"
- **Alt Başlık:** "Kuyumcu kurları arasındaki farkı net analiz edin."
- **Gösterilen Ekran:** `(protected)/gold/[productId]` detay görünümü.
- **Vurgu:** Gün içi en yüksek/en düşük değerler ve kurumsal makas analizi.

### Pano 3: Akıllı Altın Hesaplama Aracı
- **Başlık:** "Anında Alım ve Satım Tutarı Hesaplayın"
- **Alt Başlık:** "Gram veya adet girin; ödeyeceğiniz veya elinize geçecek tutarı görün."
- **Gösterilen Ekran:** `(protected)/(tabs)/calculator` ekranı.
- **Vurgu:** Ondalıklı klavye ile hızlı tahmin ve tek tıkla portföye aktarım.

### Pano 4: Kişisel Portföy ve Kâr/Zarar Takibi
- **Başlık:** "Altın Varlıklarınızı Güvenle Takip Edin"
- **Alt Başlık:** "Toplam değerinizi, toplam maliyetinizi ve tahmini kâr/zarar durumunuzu izleyin."
- **Gösterilen Ekran:** `(protected)/(tabs)/portfolio` konsolidasyon kartı.
- **Vurgu:** ADR-013 kısmi değerleme koruması, eksik fiyatlı kayıtlarda maliyet izolasyonu.

### Pano 5: Gizlilik ve Çift Tema Konforu
- **Başlık:** "Verileriniz Sadece Sizin; Tam Gizlilik ve Çift Tema"
- **Alt Başlık:** "Reklamsız, izleyicisiz, veri minimizasyonu odaklı güvenli altyapı."
- **Gösterilen Ekran:** `(protected)/(tabs)/settings` (Aydınlık & Karanlık mod yan yana karşılaştırması).
- **Vurgu:** Sıfır takipçi (0 Tracking), GDPR & KVKK standartlarında Avrupa Birliği veri merkezi.

---

## 6. Mağaza Ekran Çözünürlük Standartları

### Google Play Store
- **Telefon Ekranları (En az 4 adet):**
  - Önerilen Çözünürlük: `1080 × 2400 px` (20:9 oran) veya `1080 × 1920 px` (16:9 oran).
  - Dosya Formatı: JPEG veya 24-bit PNG (Alfa kanalsız).
  - Azami Boyut: Dosya başına 8 MB.

### Apple App Store
- **6.7 inç Ekran (iPhone 16 Pro Max / 15 Pro Max):**
  - Çözünürlük: `1290 × 2796 px` (Dikey)
- **6.5 inç Ekran (iPhone 11 Pro Max / XS Max):**
  - Çözünürlük: `1242 × 2688 px` (Dikey)

---

## 7. Yasal ve Mağaza Uyumluluk Kuralları

### Kural 1: Gerçek Kullanıcı Verisi Kullanma Yasağı (Zero PII)
- Tanıtım görsellerinde hiçbir gerçek kullanıcının adı, soyadı, e-posta adresi veya gerçek kişisel finansal bakiyesi gösterilemez.
- Tüm ekranlarda kurgusal örnek veriler (`ahmet@example.com`, `Örnek Portföyüm`, `10.000 TL`) kullanılır.

### Kural 2: Yanıltıcı Kazanç veya Fiyat İddiası Yasağı
- Google Play Mali Hizmetler Politikası ve App Store Kural 2.3 uyarınca:
  - *"Ayda %50 kazanç garantisi"*, *"Asla kaybetmeyin"*, *"Zengin olun"* gibi spekülatif veya gerçek dışı vaatler kesinlikle YASAKTIR.
  - Varlık ekranlarında her zaman *"Tahmini piyasa değeridir, yatırım tavsiyesi içermez"* dipnotu yer alır.
- Fiyatlar piyasa gerçekliğine uygun örnek değerlerle gösterilir (örneğin Gram Altın için afaki uçuk rakamlar verilmez).
