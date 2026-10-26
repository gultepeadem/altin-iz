/**
 * Altın İz — Faz 15.3: Google Play Hazırlığı Test Paketi
 * supabase/tests/test-faz15-3-google-play-readiness.ts
 *
 * Bu test paketi, docs/TODO.md Bölüm 21 (Faz 15.3: Google Play hazırlığı)
 * maddelerini uçtan uca doğrular:
 *
 * 1. Google Play geliştirici hesabı gereksinimleri (25$, bireysel/kurumsal, D-U-N-S)
 * 2. Uygulama kaydı oluşturma (com.altiniz.app, tr-TR, ücretsiz uygulama)
 * 3. Kapalı test gereksinimleri (20 tester / 14 gün kuralı)
 * 4. Data Safety formu (TLS 1.3 şifreleme, toplanan veriler, 0 paylaşılan veri)
 * 5. Hesap silme bilgisi (web URL ve uygulama içi silme)
 * 6. Gizlilik politikası bağlantısı (https://altiniz.app/gizlilik)
 * 7. Uygulama erişim talimatları (App Access / Denetçi erişim talimatları)
 * 8. Güvenli test hesabı (reviewer-play@altiniz.app ve şifre)
 * 9. İç test sürümü yükleme (EAS build AAB ve dahili test adımları)
 * 10. Kapalı test sürümü yükleme (20 tester davet bağlantısı)
 * 11. Mağaza uyarılarını çözme (Mali hizmetler beyanı, 18+ hedef kitle, reklam kimliği yok)
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
  console.log('--- Faz 15.3: Google Play Hazırlığı Testleri ---\n');

  const setupDocPath = path.join(projectRoot, 'docs/GOOGLE_PLAY_SETUP.md');
  const hasSetupDoc = fs.existsSync(setupDocPath);
  const setupContent = hasSetupDoc ? fs.readFileSync(setupDocPath, 'utf-8') : '';

  const appJsonPath = path.join(projectRoot, 'app.json');
  const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8')).expo;

  const easJsonPath = path.join(projectRoot, 'eas.json');
  const easConfig = fs.existsSync(easJsonPath)
    ? JSON.parse(fs.readFileSync(easJsonPath, 'utf-8'))
    : null;

  // ==========================================================================
  // Test 1: Google Play Geliştirici Hesabı Gereksinimleri
  // ==========================================================================
  try {
    const hasAccountReqs =
      setupContent.includes('25$') &&
      setupContent.includes('Bireysel (Personal)') &&
      setupContent.includes('D-U-N-S');

    assert(
      hasSetupDoc && hasAccountReqs,
      'Test 1: Google Play geliştirici hesabı gereksinimleri (bireysel/kurumsal, 25$, D-U-N-S) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: Uygulama Kaydı Oluşturma
  // ==========================================================================
  try {
    const isPackageMatch = appConfig.android?.package === 'com.altiniz.app';
    const isNameMatch = appConfig.name === 'Altın İz';
    const hasDocRegistration = setupContent.includes('Türkçe - tr-TR') && setupContent.includes('Ücretsiz');

    assert(
      isPackageMatch && isNameMatch && hasDocRegistration,
      'Test 2: Uygulama kaydı oluşturma parametreleri (com.altiniz.app, Altın İz, tr-TR, ücretsiz) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: Kapalı Test Gereksinimleri (20 Tester / 14 Gün Kuralı)
  // ==========================================================================
  try {
    const has20TesterRule =
      setupContent.includes('20 test kullanıcısı') &&
      setupContent.includes('14 gün');

    assert(
      has20TesterRule,
      'Test 3: Kapalı test gereksinimleri (en az 20 test kullanıcısı ile 14 gün kuralı) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: Data Safety Formu
  // ==========================================================================
  try {
    const hasDataSafety =
      setupContent.includes('Data Safety (Veri Güvenliği) Formu Yanıtları') &&
      setupContent.includes('TLS 1.3 / HTTPS') &&
      setupContent.includes('E-posta Adresi') &&
      setupContent.includes('Satın Alma Geçmişi (Portföy)');

    assert(
      hasDataSafety,
      'Test 4: Google Play Data Safety formu (TLS şifreleme, toplanan veriler, 0 paylaşılan veri) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: Hesap Silme Bilgisi
  // ==========================================================================
  try {
    const hasDeleteUrl = setupContent.includes('https://altiniz.app/hesap-silme');
    const hasDeleteFlow = setupContent.includes('account/delete.tsx') || setupContent.includes('delete-account');

    assert(
      hasDeleteUrl && hasDeleteFlow,
      'Test 5: Google Play zorunlu hesap silme web URL bağlantısı ve uygulama içi silme akışı doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: Gizlilik Politikası Bağlantısı
  // ==========================================================================
  try {
    const hasPrivacyUrl = setupContent.includes('https://altiniz.app/gizlilik');

    assert(
      hasPrivacyUrl,
      'Test 6: Gizlilik politikası bağlantısı (https://altiniz.app/gizlilik) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: Uygulama Erişim Talimatları (App Access)
  // ==========================================================================
  try {
    const hasAppAccess =
      setupContent.includes('Uygulama Erişimi (App Access') &&
      setupContent.includes('Bazı işlevler kısıtlanmıştır');

    assert(
      hasAppAccess,
      'Test 7: Google Play denetçisi için uygulama erişim talimatları (App Access) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  // ==========================================================================
  // Test 8: Güvenli Test Hesabı (Açık Parola İçermez)
  // ==========================================================================
  try {
    const hasTestCredentials =
      setupContent.includes('reviewer-play@altiniz.app') &&
      setupContent.includes('Güvenli parola yöneticisinde saklanmaktadır') &&
      !setupContent.includes('TestReviewer2026!');

    assert(
      hasTestCredentials,
      'Test 8: Google Play denetçileri için güvenli test hesabı kimlik bilgileri ve açık parola içermeme güvencesi doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 8 hatası:', err.message);
  }

  // ==========================================================================
  // Test 9: İç Test Sürümünü Yükleme
  // ==========================================================================
  try {
    const hasAabBuildCommand = setupContent.includes('buildType": "app-bundle"') || setupContent.includes('--platform android --profile production');
    const hasInternalTrackSteps = setupContent.includes('Dahili test') && setupContent.includes('AAB');
    const hasEasProductionAab = easConfig?.build?.production?.android?.buildType === 'app-bundle';

    assert(
      hasAabBuildCommand && hasInternalTrackSteps && hasEasProductionAab,
      'Test 9: İç test (Internal Testing) sürümü derleme ve AAB yükleme adımları doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 9 hatası:', err.message);
  }

  // ==========================================================================
  // Test 10: Kapalı Test Sürümünü Yükleme
  // ==========================================================================
  try {
    const hasClosedTrackSteps =
      setupContent.includes('Kapalı test') &&
      setupContent.includes('https://play.google.com/apps/testing/com.altiniz.app');

    assert(
      hasClosedTrackSteps,
      'Test 10: Kapalı test (Closed Testing) parça oluşturma ve test davet bağlantısı adımları doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 10 hatası:', err.message);
  }

  // ==========================================================================
  // Test 11: Mağaza Uyarılarını Çözme
  // ==========================================================================
  try {
    const hasFinancialFeatures = setupContent.includes('Mali Özellikler Beyanı') && setupContent.includes('Kişisel finans yönetimi');
    const hasAudience = setupContent.includes('18 yaş ve üzeri');
    const hasNoAds = setupContent.includes('uygulamam reklam içermiyor');

    assert(
      hasFinancialFeatures && hasAudience && hasNoAds,
      'Test 11: Google Play mağaza politika uyarıları (Mali özellikler, 18+ kitle, sıfır reklam) çözümü doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 11 hatası:', err.message);
  }

  console.log(`\nFaz 15.3 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
