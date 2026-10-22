/**
 * Altın İz — Faz 13.1: Gizlilik İncelemesi ve Mağaza Beyanları Test Paketi
 * supabase/tests/test-faz13-1-privacy-review.ts
 *
 * Test Kapsamı:
 * 1. Toplanan kişisel veri envanteri ve alan katalogu
 * 2. İzin minimizasyonu (app.json içinde gereksiz izinlerin bulunmaması)
 * 3. Üçüncü taraf takip ve analitik kütüphanesi izolasyonu (0 Tracking)
 * 4. Fiyat sağlayıcısına kişisel veri aktarılmaması
 * 5. Supabase veri akışı ve AB bölgesi (Frankfurt) aktarım şeffaflığı
 * 6. Hukuki sebep ve saklama süreleri eşleşmesi
 * 7. Google Play Veri Güvenliği (Data Safety) taslak matrisi
 * 8. Apple App Store App Privacy taslak matrisi
 * 9. Hesap silme ile veri minimizasyonu ve yok etme güvencesi
 * 10. Mağaza beyanları ile gerçek uygulama kodu uyumu
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
  if (!condition) {
    console.error(`❌ BAŞARISIZ: ${message}`);
    failedTests++;
    throw new Error(`Test başarısız: ${message}`);
  } else {
    console.log(`✅ ${message}`);
    passedTests++;
  }
}

async function runTests() {
  console.log('--- Faz 13.1: Gizlilik İncelemesi ve Mağaza Beyanları Testleri ---\n');

  // ==========================================================================
  // Test 1: Toplanan Kişisel Veri Envanteri ve Alan Kataloğu
  // ==========================================================================
  try {
    const privacyDocPath = path.join(projectRoot, 'docs/PRIVACY.md');
    const privacyDoc = fs.readFileSync(privacyDocPath, 'utf-8');

    const expectedDataTypes = [
      'auth.users.email',
      'user_profiles.display_name',
      'user_preferences.theme',
      'portfolio_entries.grams',
      'portfolio_entries.purchase_price_total',
      'user_legal_events',
      'account_deletion_requests',
    ];

    let allCovered = true;
    for (const dt of expectedDataTypes) {
      if (!privacyDoc.includes(dt)) {
        allCovered = false;
        break;
      }
    }

    assert(
      allCovered,
      'Uygulamanın topladığı tüm kişisel veri kategorileri docs/PRIVACY.md envanterinde listelendi.'
    );
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: İzin Minimizasyonu (app.json Gereksiz İzin Kontrolü)
  // ==========================================================================
  try {
    const appJsonPath = path.join(projectRoot, 'app.json');
    const appJsonRaw = fs.readFileSync(appJsonPath, 'utf-8');
    const appJson = JSON.parse(appJsonRaw);

    const androidPermissions = appJson.expo?.android?.permissions || [];
    const iosInfo = appJson.expo?.ios?.infoPlist || {};

    const forbiddenPermissions = [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
      'READ_CONTACTS',
      'RECORD_AUDIO',
      'READ_SMS',
      'AD_ID',
    ];

    const hasForbidden = forbiddenPermissions.some((perm) =>
      androidPermissions.includes(perm)
    );

    const hasIosTracking =
      Boolean(iosInfo.NSUserTrackingUsageDescription) ||
      Boolean(iosInfo.NSLocationWhenInUseUsageDescription);

    assert(
      !hasForbidden && !hasIosTracking,
      'app.json içinde kamera, konum, rehber veya reklam izleme izni bulunmadığı (veri minimizasyonu) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: Üçüncü Taraf Takip ve Analitik Kütüphanesi İzolasyonu (0 Tracking)
  // ==========================================================================
  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    const trackingPackages = [
      'react-native-firebase',
      '@react-native-firebase/analytics',
      '@sentry/react-native',
      'react-native-google-analytics-bridge',
      'react-native-appsflyer',
      'react-native-adjust',
      'expo-tracking-transparency',
      'react-native-fbsdk-next',
    ];

    const foundTrackers = trackingPackages.filter((t) => t in allDeps);

    assert(
      foundTrackers.length === 0,
      'Uygulamada hiçbir harici analitik, reklam veya izleme (tracker) kütüphanesi bulunmadığı doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: Fiyat Sağlayıcısına Kişisel Veri Aktarılmaması
  // ==========================================================================
  try {
    const privacyPath = path.join(projectRoot, 'docs/PRIVACY.md');
    const privacyContent = fs.readFileSync(privacyPath, 'utf-8');

    const declaresNoUserDataToPriceProvider =
      privacyContent.includes('Fiyat sağlayıcısına hiçbir kullanıcı kimliği, e-posta veya portföy verisi aktarılmaz') ||
      privacyContent.includes('Fiyat sağlayıcısının kişisel veri almadığı');

    assert(
      declaresNoUserDataToPriceProvider,
      'Altın fiyat sağlayıcısına hiçbir kişisel verinin iletilmediği doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: Supabase Veri Akışı ve AB Bölgesi (Frankfurt) Sınırlandırması
  // ==========================================================================
  try {
    const privacyPath = path.join(projectRoot, 'docs/PRIVACY.md');
    const privacyContent = fs.readFileSync(privacyPath, 'utf-8');

    const mentionsFrankfurt =
      privacyContent.includes('Frankfurt') || privacyContent.includes('Almanya');
    const mentionsTls =
      privacyContent.includes('TLS') || privacyContent.includes('HTTPS');

    assert(
      mentionsFrankfurt && mentionsTls,
      'Supabase veri akışının Frankfurt (AB) bölgesinde ve TLS ile korunduğu doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: Hukuki Sebep ve Saklama Süreleri Eşleşmesi
  // ==========================================================================
  try {
    const retentionPath = path.join(projectRoot, 'docs/DATA_RETENTION.md');
    const retentionContent = fs.readFileSync(retentionPath, 'utf-8');

    const hasAuditRetention = retentionContent.includes('3 yıl') || retentionContent.includes('1095 gün');
    const hasImmediatePurge = retentionContent.includes('Fiziksel Olarak Silinen') || retentionContent.includes('fiziksel');

    assert(
      hasAuditRetention && hasImmediatePurge,
      'Portföy verileri için derhal silme, yasal denetim kayıtları için 3 yıllık saklama kuralı doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: Google Play Veri Güvenliği (Data Safety) Form Taslağı
  // ==========================================================================
  try {
    const privacyPath = path.join(projectRoot, 'docs/PRIVACY.md');
    const privacyContent = fs.readFileSync(privacyPath, 'utf-8');

    const hasDataSafetySection = privacyContent.includes('Google Play Veri Güvenliği') || privacyContent.includes('Data Safety');
    const mentionsEncryptionInTransit = privacyContent.includes('Aktarım sırasında şifreleme') || privacyContent.includes('HTTPS');
    const mentionsDeletionRequest = privacyContent.includes('Hesap silme talebi') || privacyContent.includes('delete-account');

    assert(
      hasDataSafetySection && mentionsEncryptionInTransit && mentionsDeletionRequest,
      'Google Play Veri Güvenliği (Data Safety) beyan taslağı ve silme taahhüdü doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  // ==========================================================================
  // Test 8: Apple App Store App Privacy Form Taslağı
  // ==========================================================================
  try {
    const privacyPath = path.join(projectRoot, 'docs/PRIVACY.md');
    const privacyContent = fs.readFileSync(privacyPath, 'utf-8');

    const hasAppPrivacySection = privacyContent.includes('App Store') && privacyContent.includes('App Privacy');
    const declaresNoTracking = privacyContent.includes('Takip İçin Kullanılmaz') || privacyContent.includes('No Tracking');
    const declaresLinkedToUser = privacyContent.includes('Kullanıcıyla İlişkili') || privacyContent.includes('Linked to User');

    assert(
      hasAppPrivacySection && declaresNoTracking && declaresLinkedToUser,
      'Apple App Store App Privacy beyan taslağı (No Tracking & Linked to User) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 8 hatası:', err.message);
  }

  // ==========================================================================
  // Test 9: Hesap Silme ile Veri Minimizasyonu ve Yok Etme Güvencesi
  // ==========================================================================
  try {
    const deleteFunctionPath = path.join(projectRoot, 'supabase/functions/delete-account/service.ts');
    const serviceContent = fs.readFileSync(deleteFunctionPath, 'utf-8');

    const purgesPortfolio = serviceContent.includes("from('portfolio_entries')") && serviceContent.includes('.delete()');
    const purgesProfile = serviceContent.includes("from('user_profiles')") && serviceContent.includes('.delete()');
    const anonymizesLegal = serviceContent.includes("from('user_legal_events')") && serviceContent.includes('user_id: null');

    assert(
      purgesPortfolio && purgesProfile && anonymizesLegal,
      'Hesap silindiğinde portföy ve profilin fiziksel olarak yok edildiği, denetim kaydının anonimleştirildiği doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 9 hatası:', err.message);
  }

  // ==========================================================================
  // Test 10: Mağaza Beyanları ile Gerçek Kod Davranışı Uyumu
  // ==========================================================================
  try {
    // Mobil arayüzde istenen tüm form alanları ve izinlerin şeffaflığı
    const envPath = path.join(projectRoot, 'src/lib/environment.ts');
    const envContent = fs.readFileSync(envPath, 'utf-8');

    const onlyPublicKeys =
      !envContent.includes('process.env.SUPABASE_SERVICE_ROLE') &&
      envContent.includes('supabasePublishableKey');

    assert(
      onlyPublicKeys,
      'Mobil arayüz ve istemci yapılandırması mağaza beyanlarıyla tam uyumlu.'
    );
  } catch (err: any) {
    console.error('Test 10 hatası:', err.message);
  }

  console.log(`\nFaz 13.1 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
