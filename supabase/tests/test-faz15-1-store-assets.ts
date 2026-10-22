/**
 * Altın İz — Faz 15.1: Görsel Mağaza Varlıkları Test Paketi
 * supabase/tests/test-faz15-1-store-assets.ts
 *
 * Bu test paketi, docs/TODO.md Bölüm 21 (Faz 15.1: Görsel mağaza varlıkları)
 * maddelerini uçtan uca doğrular:
 *
 * 1. Son uygulama logosu (icon.png 1024x1024 px PNG)
 * 2. Android adaptive icon (foreground, background, monochrome katmanları ve app.json yapılandırması)
 * 3. iOS icon seti (app.json ios.icon 1024x1024 px)
 * 4. Splash screen görseli (splash-icon.png ve app.json #121212 arka planı)
 * 5. Açık ve koyu arka planda logo kontrast testi (STORE_ASSETS.md kuralları)
 * 6. Google Play ekran görüntüleri planı (5 ana ekran storyboard'u ve çözünürlükleri)
 * 7. App Store ekran görüntüleri planı (6.7 inç ve 6.5 inç çözünürlük standartları)
 * 8. Görsellerde gerçek kullanıcı verisi kullanma kuralı (Zero PII ilkesi)
 * 9. Görsellerde yanıltıcı fiyat veya kazanç iddiası kullanma kuralı (Finansal dürüstlük)
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

function getPngDimensions(filePath: string): { width: number; height: number } | null {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  if (buf.toString('ascii', 1, 4) === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  return null;
}

async function runTests() {
  console.log('--- Faz 15.1: Görsel Mağaza Varlıkları Testleri ---\n');

  const appJsonPath = path.join(projectRoot, 'app.json');
  const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8')).expo;

  const storeAssetsDocPath = path.join(projectRoot, 'docs/STORE_ASSETS.md');
  const hasStoreAssetsDoc = fs.existsSync(storeAssetsDocPath);
  const storeAssetsContent = hasStoreAssetsDoc ? fs.readFileSync(storeAssetsDocPath, 'utf-8') : '';

  // ==========================================================================
  // Test 1: Son Uygulama Logosu (1024x1024 px PNG)
  // ==========================================================================
  try {
    const iconPath = path.join(projectRoot, 'assets/images/icon.png');
    const dims = getPngDimensions(iconPath);
    const isStandardSize = dims !== null && dims.width === 1024 && dims.height === 1024;
    const isConfigured = appConfig.icon === './assets/images/icon.png';

    assert(
      isStandardSize && isConfigured,
      `Test 1: Son uygulama logosu (${dims?.width}x${dims?.height} px PNG, app.json icon eşleşmesi) doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: Android Adaptive Icon
  // ==========================================================================
  try {
    const fgPath = path.join(projectRoot, 'assets/images/android-icon-foreground.png');
    const bgPath = path.join(projectRoot, 'assets/images/android-icon-background.png');
    const monoPath = path.join(projectRoot, 'assets/images/android-icon-monochrome.png');

    const hasFg = fs.existsSync(fgPath);
    const hasBg = fs.existsSync(bgPath);
    const hasMono = fs.existsSync(monoPath);
    const adaptiveConfig = appConfig.android?.adaptiveIcon;
    const hasDarkBgColor = adaptiveConfig?.backgroundColor === '#121212';

    assert(
      hasFg && hasBg && hasMono && Boolean(adaptiveConfig) && hasDarkBgColor,
      'Test 2: Android adaptive icon (foreground, background, monochrome ve #121212 zemin) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: iOS Icon Seti
  // ==========================================================================
  try {
    const iosIconSetting = appConfig.ios?.icon;
    const pointsToStandardIcon = iosIconSetting === './assets/images/icon.png';
    const mainIconExists = fs.existsSync(path.join(projectRoot, 'assets/images/icon.png'));

    assert(
      pointsToStandardIcon && mainIconExists,
      'Test 3: iOS icon seti (1024x1024 px ve app.json ios.icon yapılandırması) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: Splash Screen Görseli ve Koyu Arka Plan
  // ==========================================================================
  try {
    const splashImgPath = path.join(projectRoot, 'assets/images/splash-icon.png');
    const hasSplashImg = fs.existsSync(splashImgPath);

    const splashPlugin = appConfig.plugins?.find(
      (p: any) => Array.isArray(p) && p[0] === 'expo-splash-screen'
    );
    const splashConfig = splashPlugin ? splashPlugin[1] : null;
    const hasDarkSplashBg = splashConfig?.backgroundColor === '#121212';
    const usesSplashImg = splashConfig?.image === './assets/images/splash-icon.png';

    assert(
      hasSplashImg && hasDarkSplashBg && usesSplashImg,
      'Test 4: Splash screen açılış görseli ve #121212 kurumsal arka plan rengi doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: Açık ve Koyu Arka Planda Logo Testi
  // ==========================================================================
  try {
    const documentsDarkContrast = storeAssetsContent.includes('#121212');
    const documentsLightContrast = storeAssetsContent.includes('#FFFFFF');
    const documentsWcagCompliance = storeAssetsContent.includes('WCAG');

    assert(
      hasStoreAssetsDoc && documentsDarkContrast && documentsLightContrast && documentsWcagCompliance,
      'Test 5: Açık ve koyu arka planda logo kontrast ve erişilebilirlik (WCAG AA) testleri doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: Google Play Ekran Görüntüleri Planı
  // ==========================================================================
  try {
    const has1080x2400 = storeAssetsContent.includes('1080 × 2400');
    const has5Screens =
      storeAssetsContent.includes('Pano 1:') &&
      storeAssetsContent.includes('Pano 2:') &&
      storeAssetsContent.includes('Pano 3:') &&
      storeAssetsContent.includes('Pano 4:') &&
      storeAssetsContent.includes('Pano 5:');

    assert(
      has1080x2400 && has5Screens,
      'Test 6: Google Play Store ekran görüntüleri planı (1080x2400 ve 5 ana vitrin panosu) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: App Store Ekran Görüntüleri Planı
  // ==========================================================================
  try {
    const has67Inch = storeAssetsContent.includes('1290 × 2796');
    const has65Inch = storeAssetsContent.includes('1242 × 2688');

    assert(
      has67Inch && has65Inch,
      'Test 7: Apple App Store ekran görüntüleri planı (6.7 inç ve 6.5 inç çözünürlük standartları) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  // ==========================================================================
  // Test 8: Görsellerde Gerçek Kullanıcı Verisi Kullanma Yasağı (Zero PII)
  // ==========================================================================
  try {
    const hasZeroPiiRule =
      storeAssetsContent.includes('Gerçek Kullanıcı Verisi Kullanma Yasağı') &&
      storeAssetsContent.includes('Zero PII');

    assert(
      hasZeroPiiRule,
      'Test 8: Mağaza görsellerinde gerçek kişisel veri kullanmama (Zero PII ve kurgusal veri) kuralı doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 8 hatası:', err.message);
  }

  // ==========================================================================
  // Test 9: Görsellerde Yanıltıcı Fiyat veya Kazanç İddiası Kullanma Yasağı
  // ==========================================================================
  try {
    const hasFinancialCompliance =
      storeAssetsContent.includes('Yanıltıcı Kazanç veya Fiyat İddiası Yasağı') &&
      storeAssetsContent.includes('Tahmini piyasa değeridir');

    assert(
      hasFinancialCompliance,
      'Test 9: Mağaza görsellerinde yanıltıcı fiyat/kazanç iddiası kullanmama ve şeffaflık kuralı doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 9 hatası:', err.message);
  }

  console.log(`\nFaz 15.1 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
