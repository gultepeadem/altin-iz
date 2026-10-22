# Altın İz Web Sitesi Yasal ve Mağaza Sayfaları

Bu klasör, `https://altiniz.app` alan adı ve GitHub Pages üzerinde barınan `altiniz-site` deposu için hazırlanmış zorunlu yasal ve mağaza onay sayfalarını içerir.

## Dosya Yapısı

```
altiniz-site/
├── index.html                  (Mevcut tanıtım ana sayfanız)
├── CNAME                       (altiniz.app)
├── gizlilik/
│   └── index.html              -> https://altiniz.app/gizlilik
├── kullanim-kosullari/
│   └── index.html              -> https://altiniz.app/kullanim-kosullari
├── kvkk/
│   └── index.html              -> https://altiniz.app/kvkk
└── hesap-silme/
    └── index.html              -> https://altiniz.app/hesap-silme
```

## Neden `klasor/index.html` Yapısı?

GitHub Pages, `gizlilik/index.html` dosyasını doğrudan `https://altiniz.app/gizlilik` URL'sinde temiz şekilde sunar (sonda `.html` uzantısı olmadan). Google Play ve App Store denetçileri ile kullanıcılar bu temiz bağlantıları görür.

## Kurulum Adımları (`altiniz-site` Deposuna Ekleme)

1. `altiniz-site` deponuzu bilgisayarınızda açın veya GitHub web arayüzüne gidin.
2. Bu klasördeki 4 klasörü (`gizlilik`, `kullanim-kosullari`, `kvkk`, `hesap-silme`) içlerindeki `index.html` dosyalarıyla birlikte `altiniz-site` deposunun ana dizinine ekleyin.
3. Mevcut ana sayfanızın (`index.html`) en altına aşağıdaki alt bilgi (footer) bağlantılarını ekleyin:

```html
<footer style="text-align: center; padding: 2rem; border-top: 1px solid #232D4B; margin-top: 3rem; color: #9CA3AF; font-size: 0.9rem;">
  <div style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
    <a href="/gizlilik" style="color: #9CA3AF; text-decoration: none;">Gizlilik Politikası</a>
    <a href="/kullanim-kosullari" style="color: #9CA3AF; text-decoration: none;">Kullanım Koşulları</a>
    <a href="/kvkk" style="color: #9CA3AF; text-decoration: none;">KVKK Metni</a>
    <a href="/hesap-silme" style="color: #9CA3AF; text-decoration: none;">Hesap Silme Talebi</a>
  </div>
  <p>&copy; 2026 Altın İz. Tüm hakları saklıdır. İletişim: destek@altiniz.app</p>
</footer>
```

4. Değişiklikleri commit edip GitHub'a push edin. 1-2 dakika içinde GitHub Pages sayfalarınız aktif olacaktır.
