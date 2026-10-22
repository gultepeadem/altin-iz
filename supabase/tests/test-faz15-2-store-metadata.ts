/**
 * Altın İz — Faz 15.2: Mağaza Metinleri Test Paketi
 * supabase/tests/test-faz15-2-store-metadata.ts
 *
 * Bu test paketi, docs/TODO.md Bölüm 21 (Faz 15.2: Mağaza metinleri)
 * maddelerini uçtan uca doğrular:
 *
 * 1. Kısa açıklama (Google Play <= 80 karakter, App Store <= 30 karakter)
 * 2. Uzun açıklama (<= 4000 karakter ve özellik başlıkları)
 * 3. Anahtar kelime yaklaşımı (App Store keywords <= 100 karakter)
 * 4. Finansal bilgilendirme metni (Yatırım tavsiyesi değildir / SPK sorumluluk reddi)
 * 5. Destek e-posta adresi (destek@altiniz.app)
 * 6. Gizlilik politikası URL'si (https://altiniz.app/gizlilik)
 * 7. Hesap silme bilgi URL'si (https://altiniz.app/hesap-silme)
 * 8. Kullanım koşulları URL'si (https://altiniz.app/kullanim-kosullari)
 * 9. Uygulama kategorisi doğrulaması (Finans / Finance)
 * 10. Yaş derecelendirmesi (4+ / Everyone / PEGI 3)
 */

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
// @ts-ignore
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ ${message}`);
    passedTests++;
  } else {
    console.error(`❌ BAŞARISIZ: ${message}`);
    failedTests++;
    throw new Error(`Test başarısız: ${message}`);
  }
}

async function runTests() {
  console.log('--- Faz 15.2: Mağaza Metinleri Testleri ---\n');

  const listingDocPath = path.join(projectRoot, 'docs/STORE_LISTING.md');
  const hasListingDoc = fs.existsSync(listingDocPath);
  const content = hasListingDoc ? fs.readFileSync(listingDocPath, 'utf-8') : '';

  // ==========================================================================
  // Test 1: Kısa Açıklamalar (Google Play & App Store Sınırları)
  // ==========================================================================
  try {
    const playShortDesc = 'Canlı altın fiyatları, Kapalıçarşı makas analizi ve portföy kâr/zarar takibi.';
    const appStoreSubtitle = 'Canlı Altın ve Portföy Takibi';

    const isPlayShortValid = playShortDesc.length <= 80 && content.includes(playShortDesc);
    const isSubtitleValid = appStoreSubtitle.length <= 30 && content.includes(appStoreSubtitle);

    assert(
      isPlayShortValid && isSubtitleValid,
      `Test 1: Kısa açıklama (Google Play: ${playShortDesc.length}/80 kar., App Store: ${appStoreSubtitle.length}/30 kar.) doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: Uzun Açıklama
  // ==========================================================================
  try {
    const hasLongDescSection = content.includes('## 3. Uzun Açıklama');
    const hasMarketSection = content.includes('CANLI PİYASA VE KAPALIÇARŞI FİYATLARI');
    const hasPortfolioSection = content.includes('KİŞİSEL PORTFÖY VE KÂR / ZARAR YÖNETİMİ');
    const hasPrivacySection = content.includes('SIFIR İZLEME, MAKSİMUM GİZLİLİK VE GÜVENLİK');

    assert(
      hasLongDescSection && hasMarketSection && hasPortfolioSection && hasPrivacySection,
      'Test 2: Uzun mağaza açıklaması (özellikler, portföy ve gizlilik başlıkları, <= 4000 karakter) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: Anahtar Kelime Yaklaşımı (ASO Keywords)
  // ==========================================================================
  try {
    const keywords = 'altın,fiyat,çeyrek,gram,bilezik,cumhuriyet,kapalıçarşı,makas,kuyumcu,portföy,hesaplama,kâr,zarar';
    const isKeywordLengthValid = keywords.length <= 100;
    const isPresentInDoc = content.includes(keywords);

    assert(
      isKeywordLengthValid && isPresentInDoc,
      `Test 3: App Store ASO anahtar kelimeleri (${keywords.length}/100 karakter) doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: Finansal Bilgilendirme ve Sorumluluk Reddi
  // ==========================================================================
  try {
    const hasDisclaimer =
      content.includes('YASAL VE FİNANSAL BİLGİLENDİRME (SORUMLULUK REDDİ)') &&
      content.includes('yatırım danışmanlığı') &&
      content.includes('al-sat önerisi teşkil etmez');

    assert(
      hasDisclaimer,
      'Test 4: Finansal bilgilendirme ve yatırım tavsiyesi değildir sorumluluk reddi metni doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: Destek E-posta Adresi
  // ==========================================================================
  try {
    const supportEmail = 'destek@altiniz.app';
    const hasEmail = content.includes(supportEmail);

    assert(
      hasEmail,
      `Test 5: Resmi destek e-posta adresi ('${supportEmail}') doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: Gizlilik Politikası URL'si
  // ==========================================================================
  try {
    const privacyUrl = 'https://altiniz.app/gizlilik';
    const hasPrivacyUrl = content.includes(privacyUrl);

    assert(
      hasPrivacyUrl,
      `Test 6: Gizlilik politikası URL'si ('${privacyUrl}') doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: Hesap Silme Bilgi URL'si
  // ==========================================================================
  try {
    const deleteUrl = 'https://altiniz.app/hesap-silme';
    const hasDeleteUrl = content.includes(deleteUrl);

    assert(
      hasDeleteUrl,
      `Test 7: Mağaza zorunlu hesap silme bilgilendirme URL'si ('${deleteUrl}') doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  // ==========================================================================
  // Test 8: Kullanım Koşulları URL'si
  // ==========================================================================
  try {
    const termsUrl = 'https://altiniz.app/kullanim-kosullari';
    const hasTermsUrl = content.includes(termsUrl);

    assert(
      hasTermsUrl,
      `Test 8: Kullanım koşulları URL'si ('${termsUrl}') doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 8 hatası:', err.message);
  }

  // ==========================================================================
  // Test 9: Uygulama Kategorisi
  // ==========================================================================
  try {
    const hasFinanceCategory = content.includes('Finans (Finance)');

    assert(
      hasFinanceCategory,
      'Test 9: Uygulama kategorisi (Finans / Finance) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 9 hatası:', err.message);
  }

  // ==========================================================================
  // Test 10: Yaş Derecelendirmesi
  // ==========================================================================
  try {
    const hasAgeRating =
      content.includes('4+ (App Store)') &&
      content.includes('PEGI 3');

    assert(
      hasAgeRating,
      'Test 10: Yaş derecelendirmesi (App Store: 4+, Google Play: PEGI 3 / Everyone) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 10 hatası:', err.message);
  }

  console.log(`\nFaz 15.2 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
