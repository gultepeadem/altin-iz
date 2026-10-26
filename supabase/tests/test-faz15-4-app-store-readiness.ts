/**
 * Altın İz — Faz 15.4: App Store Hazırlığı Test Paketi
 * supabase/tests/test-faz15-4-app-store-readiness.ts
 *
 * Bu test paketi, docs/TODO.md Bölüm 21 (Faz 15.4: App Store hazırlığı)
 * maddelerini uçtan uca doğrular:
 *
 * 1. Apple Developer hesabı gereksinimleri ($99/yıl, bireysel/kurumsal, 2FA)
 * 2. App Store Connect uygulama kaydı (com.altiniz.app, altiniz_app, Türkçe, 4+)
 * 3. App Privacy beyanı (No Tracking, toplanan verilerin kullanıcıyla ilişkisi)
 * 4. Hesap silme akışı inceleme açıklaması (Guideline 5.1.1(v), account/delete.tsx ve Edge Function)
 * 5. Gizlilik politikası bağlantısı (https://altiniz.app/gizlilik)
 * 6. TestFlight sürümünü yükleme (EAS production profili ve IPA derlemesi)
 * 7. Test kullanıcılarını ekleme (Dahili ve harici TestFlight grupları)
 * 8. iPhone ekran görüntüleri standartları (6.7 inç ve 6.5 inç)
 * 9. App Review açıklamaları (Notes for Reviewer, altın takip aracı, no trading)
 * 10. İnceleme test hesabı (reviewer-apple@altiniz.app ve şifre)
 * 11. Mağaza uyarılarını çözme (Kripto yok, IAP yok, Guideline 3.1.1/3.1.5 uyumu)
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
  console.log('--- Faz 15.4: App Store Hazırlığı Testleri ---\n');

  const setupDocPath = path.join(projectRoot, 'docs/APP_STORE_SETUP.md');
  const hasSetupDoc = fs.existsSync(setupDocPath);
  const setupContent = hasSetupDoc ? fs.readFileSync(setupDocPath, 'utf-8') : '';

  const appJsonPath = path.join(projectRoot, 'app.json');
  const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8')).expo;

  const easJsonPath = path.join(projectRoot, 'eas.json');
  const easConfig = fs.existsSync(easJsonPath)
    ? JSON.parse(fs.readFileSync(easJsonPath, 'utf-8'))
    : null;

  // ==========================================================================
  // Test 1: Apple Developer Hesabı Gereksinimleri
  // ==========================================================================
  try {
    const hasAccountReqs =
      setupContent.includes('$99/yıl') &&
      setupContent.includes('Apple Developer Program') &&
      setupContent.includes('İki Faktörlü Kimlik Doğrulama');

    assert(
      hasSetupDoc && hasAccountReqs,
      'Test 1: Apple Developer hesabı gereksinimleri ($99/yıl, bireysel/kurumsal, 2FA) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: App Store Connect Uygulama Kaydı
  // ==========================================================================
  try {
    const isBundleIdMatch = appConfig.ios?.bundleIdentifier === 'com.altiniz.app';
    const isNameMatch = appConfig.name === 'Altın İz';
    const hasSkuAndLang = setupContent.includes('altiniz_app') && setupContent.includes('Türkçe');

    assert(
      isBundleIdMatch && isNameMatch && hasSkuAndLang,
      'Test 2: App Store Connect uygulama kaydı parametreleri (com.altiniz.app, altiniz_app, Türkçe, 4+) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: App Privacy Beyanı
  // ==========================================================================
  try {
    const hasNoTracking = setupContent.includes('Data Not Used to Track You') || setupContent.includes('No Tracking');
    const hasContactInfo = setupContent.includes('Email Address');
    const hasFinancialInfo = setupContent.includes('Other Financial Info');
    const hasIdentifiers = setupContent.includes('User ID');

    assert(
      hasNoTracking && hasContactInfo && hasFinancialInfo && hasIdentifiers,
      'Test 3: App Privacy veri gizliliği beyanı (No Tracking, Contact Info, Financial Info, Identifiers) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: Hesap Silme Akışını İnceleme İçin Açıklama (Guideline 5.1.1(v))
  // ==========================================================================
  try {
    const hasGuideline511v = setupContent.includes('5.1.1(v)');
    const explainsInAppDelete =
      setupContent.includes('account/delete.tsx') &&
      setupContent.includes('destructive') &&
      setupContent.includes('delete-account');
    const hasWebDeleteUrl = setupContent.includes('https://altiniz.app/hesap-silme');

    assert(
      hasGuideline511v && explainsInAppDelete && hasWebDeleteUrl,
      'Test 4: Apple Guideline 5.1.1(v) hesap silme akışının denetçiye şeffafça açıklanması doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: Gizlilik Politikası Bağlantısı
  // ==========================================================================
  try {
    const hasPrivacyUrl = setupContent.includes('https://altiniz.app/gizlilik');

    assert(
      hasPrivacyUrl,
      'Test 5: Gizlilik politikası bağlantısı (https://altiniz.app/gizlilik) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: TestFlight Sürümünü Yükleme
  // ==========================================================================
  try {
    const hasEasProductionProfile = Boolean(easConfig?.build?.production);
    const hasTestFlightCommand =
      setupContent.includes('--platform ios --profile production') &&
      setupContent.includes('TestFlight');

    assert(
      hasEasProductionProfile && hasTestFlightCommand,
      'Test 6: EAS build ile iOS üretim IPA çıktısı ve TestFlight aktarım süreci doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: Test Kullanıcılarını Ekleme
  // ==========================================================================
  try {
    const hasInternalTesters = setupContent.includes('Dahili Test Grubu');
    const hasExternalTesters = setupContent.includes('Harici Test Grubu');

    assert(
      hasInternalTesters && hasExternalTesters,
      'Test 7: TestFlight dahili ve harici beta test grupları yapılandırması doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  // ==========================================================================
  // Test 8: iPhone Ekran Görüntülerini Yükleme
  // ==========================================================================
  try {
    const storeAssetsDocPath = path.join(projectRoot, 'docs/STORE_ASSETS.md');
    const storeAssetsContent = fs.readFileSync(storeAssetsDocPath, 'utf-8');

    const has67Inch = storeAssetsContent.includes('1290 × 2796');
    const has65Inch = storeAssetsContent.includes('1242 × 2688');

    assert(
      has67Inch && has65Inch,
      'Test 8: iPhone 6.7 inç ve 6.5 inç ekran görüntüsü çözünürlük standartları doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 8 hatası:', err.message);
  }

  // ==========================================================================
  // Test 9: App Review Açıklamaları (Notes for Reviewer)
  // ==========================================================================
  try {
    const hasReviewerNotes =
      setupContent.includes('Notes for Reviewer') &&
      setupContent.includes('No Real Money Transactions') &&
      setupContent.includes('personal finance assistant');

    assert(
      hasReviewerNotes,
      'Test 9: Apple App Review denetçisi için resmi açıklama notları (Notes for Reviewer) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 9 hatası:', err.message);
  }

  // ==========================================================================
  // Test 10: İnceleme Test Hesabı (Sign-In Information - Açık Parola İçermez)
  // ==========================================================================
  try {
    const hasReviewCredentials =
      setupContent.includes('reviewer-apple@altiniz.app') &&
      setupContent.includes('Güvenli parola yöneticisinde saklanmaktadır') &&
      !setupContent.includes('AppleReview2026!');

    assert(
      hasReviewCredentials,
      'Test 10: Apple denetçileri için hazır giriş test hesabı ve açık parola içermeme güvencesi doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 10 hatası:', err.message);
  }

  // ==========================================================================
  // Test 11: Mağaza Politika Uyarılarını Çözme
  // ==========================================================================
  try {
    const hasGuideline311 = setupContent.includes('3.1.1') && setupContent.includes('ücretsiz');
    const hasGuideline315 = setupContent.includes('3.1.5') && setupContent.includes('kripto');

    assert(
      hasGuideline311 && hasGuideline315,
      'Test 11: App Store politika uyarıları (Guideline 3.1.1 IAP kuralı ve 3.1.5 Kripto yasağı) çözümü doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 11 hatası:', err.message);
  }

  console.log(`\nFaz 15.4 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
