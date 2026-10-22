/**
 * Altın İz — Faz 15: Uygulama Kimliği ve Sürümleme Test Paketi
 * supabase/tests/test-faz15-identity-and-versioning.ts
 *
 * Bu test paketi, docs/TODO.md Bölüm 21 (Faz 15: Uygulama kimliği ve sürümleme)
 * maddelerini uçtan uca doğrular:
 *
 * 1. Kesin uygulama adı doğrulaması (app.json expo.name: 'Altın İz', slug: 'altin-iz')
 * 2. Android package kimliği doğrulaması (app.json expo.android.package: 'com.altiniz.app')
 * 3. iOS bundle identifier doğrulaması (app.json expo.ios.bundleIdentifier: 'com.altiniz.app')
 * 4. Uygulama sürüm numarası politikası (app.json expo.version: '1.0.0', SemVer)
 * 5. Android versionCode politikası (app.json expo.android.versionCode: 1, pozitif tamsayı)
 * 6. iOS buildNumber politikası (app.json expo.ios.buildNumber: '1', string tamsayı)
 * 7. EAS derleme profilleri (eas.json development, preview ve production profilleri)
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
  console.log('--- Faz 15: Uygulama Kimliği ve Sürümleme Testleri ---\n');

  const appJsonPath = path.join(projectRoot, 'app.json');
  const appJsonRaw = fs.readFileSync(appJsonPath, 'utf-8');
  const appConfig = JSON.parse(appJsonRaw).expo;

  const easJsonPath = path.join(projectRoot, 'eas.json');
  const hasEasJson = fs.existsSync(easJsonPath);
  let easConfig: any = null;
  if (hasEasJson) {
    easConfig = JSON.parse(fs.readFileSync(easJsonPath, 'utf-8'));
  }

  // ==========================================================================
  // Test 1: Kesin Uygulama Adı Doğrulaması
  // ==========================================================================
  try {
    const isNameValid = appConfig.name === 'Altın İz';
    const isSlugValid = appConfig.slug === 'altin-iz';

    assert(
      isNameValid && isSlugValid,
      `Test 1: Kesin uygulama adı ('${appConfig.name}') ve slug ('${appConfig.slug}') doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: Android Package Kimliği Doğrulaması
  // ==========================================================================
  try {
    const androidPackage = appConfig.android?.package;
    const isPackageValid = androidPackage === 'com.altiniz.app';

    assert(
      isPackageValid,
      `Test 2: Android package kimliği ('${androidPackage}') doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: iOS Bundle Identifier Doğrulaması
  // ==========================================================================
  try {
    const iosBundleId = appConfig.ios?.bundleIdentifier;
    const isBundleIdValid = iosBundleId === 'com.altiniz.app';

    assert(
      isBundleIdValid,
      `Test 3: iOS bundle identifier değeri ('${iosBundleId}') doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: Uygulama Sürüm Numarası Politikası (SemVer)
  // ==========================================================================
  try {
    const version = appConfig.version;
    const isSemVer = /^\d+\.\d+\.\d+$/.test(version);
    const isInitialVersion = version === '1.0.0';

    assert(
      isSemVer && isInitialVersion,
      `Test 4: Uygulama sürüm numarası politikası ('${version}' SemVer) doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: Android versionCode Politikası
  // ==========================================================================
  try {
    const versionCode = appConfig.android?.versionCode;
    const isVersionCodeInteger = Number.isInteger(versionCode) && versionCode > 0;

    assert(
      isVersionCodeInteger,
      `Test 5: Android versionCode politikası (${versionCode}, artan pozitif tamsayı) doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: iOS buildNumber Politikası
  // ==========================================================================
  try {
    const buildNumber = appConfig.ios?.buildNumber;
    const isBuildNumberValid = typeof buildNumber === 'string' && /^\d+$/.test(buildNumber);

    assert(
      isBuildNumberValid,
      `Test 6: iOS buildNumber politikası ('${buildNumber}', artan string tamsayı) doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: EAS Derleme Profilleri Doğrulaması
  // ==========================================================================
  try {
    const hasBuildProfiles = Boolean(easConfig?.build);
    const hasDevelopment = Boolean(easConfig?.build?.development?.developmentClient);
    const hasPreview = Boolean(easConfig?.build?.preview);
    const hasProduction = Boolean(easConfig?.build?.production);
    const autoIncrement = easConfig?.build?.production?.autoIncrement === true;

    assert(
      hasBuildProfiles && hasDevelopment && hasPreview && hasProduction && autoIncrement,
      'Test 7: Development, Preview ve Production EAS derleme profilleri doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  console.log(`\nFaz 15 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
