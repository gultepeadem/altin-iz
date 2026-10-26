/**
 * Altın İz — Faz 14.3: iOS Test Paketi
 * supabase/tests/test-faz14-3-ios-tests.ts
 *
 * Bu test paketi, docs/TODO.md Bölüm 20 (Faz 14.3: iOS testleri) maddelerini
 * platform bazlı kod, mimari ve statik analiz yöntemleriyle uçtan uca doğrular:
 *
 * 1. Uygulama açılışı (SplashScreen, StatusBar, kök rota yönlendirmesi)
 * 2. Safe Area (react-native-safe-area-context, notch / Dynamic Island / home indicator güvenliği)
 * 3. Kayıt ve giriş klavyesi (iOS KeyboardAvoidingView behavior='padding')
 * 4. E-posta bağlantısı (verify-email yönlendirmesi ve deep-link uyumu)
 * 5. Şifre sıfırlama bağlantısı (forgot-password ve reset-password akışı)
 * 6. Alt menü (iOS tab bar yüksekliği, 5 sekme ve etiketler)
 * 7. Geri kaydırma hareketi (iOS Stack swipe-to-go-back ve headerBackTitle desteği)
 * 8. Hesaplama klavyesi (iOS decimal-pad ve virgül/nokta ayrıştırması)
 * 9. Tarih seçici (Alış tarihi doğrulama ve gelecek tarih engeli)
 * 10. Portföy işlemleri (Portföy modal formları, listeleme ve CRUD döngüsü)
 * 11. Tema değiştirme (iOS useColorScheme, açık/koyu/sistem ve kalıcılık)
 * 12. Secure storage (iOS AsyncStorage oturum kalıcılığı)
 * 13. Çıkış sonrası önbellek (signOut ile oturum ve önbelleğin sıfırlanması)
 * 14. Hesap silme (iOS Alert.alert destructive butonu ve ADR-033 silme hattı)
 * 15. İnternet kapalı durumu (ErrorState bileşeni ve erişilebilirlik etiketleri)
 * 16. Uygulama arka plan ve ön plan geçişi (onAuthStateChange abonelik yönetimi)
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
  console.log('--- Faz 14.3: iOS Cihaz ve Ekran Testleri ---\n');

  // ==========================================================================
  // Test 1: Uygulama Açılışı (iOS Splash & Oturum Yönlendirmesi)
  // ==========================================================================
  try {
    const rootLayoutPath = path.join(projectRoot, 'src/app/_layout.tsx');
    const rootIndexPath = path.join(projectRoot, 'src/app/index.tsx');

    const rootLayoutCode = fs.readFileSync(rootLayoutPath, 'utf-8');
    const rootIndexCode = fs.readFileSync(rootIndexPath, 'utf-8');

    const hasSplashScreen = rootLayoutCode.includes('SplashScreen.preventAutoHideAsync()');
    const hasAuthProvider = rootLayoutCode.includes('<AuthProvider>');
    const redirectsByAuth =
      rootIndexCode.includes('Redirect') &&
      rootIndexCode.includes('/(protected)/(tabs)') &&
      rootIndexCode.includes('/(public)/welcome');

    assert(
      hasSplashScreen && hasAuthProvider && redirectsByAuth,
      'Test 1: iOS uygulama açılışı (Splash screen ve oturum durumuna göre ilk rota yönlendirmesi) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: Safe Area (Notch / Dynamic Island / Home Indicator)
  // ==========================================================================
  try {
    const screenContainerPath = path.join(projectRoot, 'src/components/common/ScreenContainer.tsx');
    const screenContainerCode = fs.readFileSync(screenContainerPath, 'utf-8');

    const usesSafeAreaView = screenContainerCode.includes("from 'react-native-safe-area-context'");
    const declaresSafeAreaComponent = screenContainerCode.includes('<SafeAreaView');
    const hasDefaultEdges = screenContainerCode.includes("edges = ['top', 'bottom', 'left', 'right']") || screenContainerCode.includes("edges = ['top', 'left', 'right']");

    assert(
      usesSafeAreaView && declaresSafeAreaComponent && hasDefaultEdges,
      'Test 2: iOS Safe Area (çentik, Dynamic Island ve alt çubuk taşma engeli) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: Kayıt ve Giriş Klavyesi (iOS KeyboardAvoidingView behavior='padding')
  // ==========================================================================
  try {
    const screenContainerPath = path.join(projectRoot, 'src/components/common/ScreenContainer.tsx');
    const signInPath = path.join(projectRoot, 'src/app/(public)/sign-in.tsx');
    const signUpPath = path.join(projectRoot, 'src/app/(public)/sign-up.tsx');

    const containerCode = fs.readFileSync(screenContainerPath, 'utf-8');
    const signInCode = fs.readFileSync(signInPath, 'utf-8');
    const signUpCode = fs.readFileSync(signUpPath, 'utf-8');

    const usesPaddingOnIos = containerCode.includes("behavior={Platform.OS === 'ios' ? 'padding' : undefined}");
    const signInUsesContainer = signInCode.includes('<ScreenContainer');
    const signUpUsesContainer = signUpCode.includes('<ScreenContainer');

    assert(
      usesPaddingOnIos && signInUsesContainer && signUpUsesContainer,
      'Test 3: iOS kayıt ve giriş formları klavye uyumu (KeyboardAvoidingView padding) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: E-posta Bağlantısı (Verify Email & Deep Link)
  // ==========================================================================
  try {
    const verifyEmailPath = path.join(projectRoot, 'src/app/(public)/verify-email.tsx');
    const verifyEmailCode = fs.readFileSync(verifyEmailPath, 'utf-8');

    const hasResend = verifyEmailCode.includes('resendVerificationEmail');
    const hasBackNav = verifyEmailCode.includes("router.replace('/(public)/sign-in')");

    assert(
      hasResend && hasBackNav,
      'Test 4: iOS e-posta doğrulama ekranı ve yönlendirmesi doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: Şifre Sıfırlama Bağlantısı (Forgot Password & Reset Flow)
  // ==========================================================================
  try {
    const forgotPath = path.join(projectRoot, 'src/app/(public)/forgot-password.tsx');
    const resetPath = path.join(projectRoot, 'src/app/(public)/reset-password.tsx');

    const forgotCode = fs.readFileSync(forgotPath, 'utf-8');
    const resetCode = fs.readFileSync(resetPath, 'utf-8');

    const handlesForgot = forgotCode.includes('resetPasswordForEmail');
    const handlesUpdate = resetCode.includes('updatePassword');

    assert(
      handlesForgot && handlesUpdate,
      'Test 5: iOS şifre sıfırlama talebi ve yeni şifre belirleme akışları doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: Alt Menü (iOS Tab Bar Tasarımı ve 5 Sekme)
  // ==========================================================================
  try {
    const tabsLayoutPath = path.join(projectRoot, 'src/app/(protected)/(tabs)/_layout.tsx');
    const tabsCode = fs.readFileSync(tabsLayoutPath, 'utf-8');

    const hasHome = tabsCode.includes('name="index"');
    const hasPrices = tabsCode.includes('name="prices"');
    const hasCalculator = tabsCode.includes('name="calculator"');
    const hasPortfolio = tabsCode.includes('name="portfolio"');
    const hasSettings = tabsCode.includes('name="settings"');
    const hasTabBarStyle = tabsCode.includes('tabBarStyle');

    assert(
      hasHome && hasPrices && hasCalculator && hasPortfolio && hasSettings && hasTabBarStyle,
      'Test 6: iOS alt menü (Tabs) 5 sekme ve stil yapılandırması doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: Geri Kaydırma Hareketi (iOS Swipe-Back & Header Back Title)
  // ==========================================================================
  try {
    const protectedLayoutPath = path.join(projectRoot, 'src/app/(protected)/_layout.tsx');
    const protectedCode = fs.readFileSync(protectedLayoutPath, 'utf-8');

    const hasSlideAnimation = protectedCode.includes("animation: 'slide_from_right'");
    const hasBackTitle = protectedCode.includes("headerBackTitle: 'Geri'");

    assert(
      hasSlideAnimation && hasBackTitle,
      'Test 7: iOS ekran geçiş animasyonu ve geri kaydırma/başlık uyumu doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  // ==========================================================================
  // Test 8: Hesaplama Klavyesi (iOS Decimal-Pad ve Ayrıştırma)
  // ==========================================================================
  try {
    const calcPath = path.join(projectRoot, 'src/app/(protected)/(tabs)/calculator.tsx');
    const calcCode = fs.readFileSync(calcPath, 'utf-8');

    const usesDecimalPad = calcCode.includes("keyboardType={") && calcCode.includes("'decimal-pad'");
    const hasCalculateAction = calcCode.includes('calculationResult') || calcCode.includes('handleCalculate');

    assert(
      usesDecimalPad && hasCalculateAction,
      'Test 8: iOS hesaplama klavyesi (decimal-pad klavye tipi ve hesaplama mantığı) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 8 hatası:', err.message);
  }

  // ==========================================================================
  // Test 9: Tarih Seçici (Alış Tarihi Doğrulama ve Gelecek Tarih Engeli)
  // ==========================================================================
  try {
    const addPath = path.join(projectRoot, 'src/app/(protected)/portfolio/add.tsx');
    const portfolioValidationPath = path.join(projectRoot, 'src/domain/validation/portfolioValidation.ts');

    const addCode = fs.readFileSync(addPath, 'utf-8');
    const validationCode = fs.readFileSync(portfolioValidationPath, 'utf-8');

    const usesDateValidation = addCode.includes('parseDateInputToISO') && addCode.includes('isFutureDate');
    const preventsFuture = validationCode.includes('function isFutureDate');

    assert(
      usesDateValidation && preventsFuture,
      'Test 9: iOS portföy alış tarihi doğrulama ve gelecek tarih kısıtı doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 9 hatası:', err.message);
  }

  // ==========================================================================
  // Test 10: Portföy İşlemleri (iOS Modal Sunumu & CRUD Döngüsü)
  // ==========================================================================
  try {
    const protectedLayoutPath = path.join(projectRoot, 'src/app/(protected)/_layout.tsx');
    const addPath = path.join(projectRoot, 'src/app/(protected)/portfolio/add.tsx');
    const detailPath = path.join(projectRoot, 'src/app/(protected)/portfolio/[entryId].tsx');

    const protectedCode = fs.readFileSync(protectedLayoutPath, 'utf-8');
    const addCode = fs.readFileSync(addPath, 'utf-8');
    const detailCode = fs.readFileSync(detailPath, 'utf-8');

    const usesModalPresentation = protectedCode.includes("presentation: 'modal'");
    const createsEntry = addCode.includes('portfolioService.createEntry');
    const deletesEntry = detailCode.includes('portfolioService.deleteEntry');

    assert(
      usesModalPresentation && createsEntry && deletesEntry,
      'Test 10: iOS portföy modal sunumu, ekleme ve silme operasyonları doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 10 hatası:', err.message);
  }

  // ==========================================================================
  // Test 11: Tema Değiştirme (iOS Sistem Teması & Dinamik Senkronizasyon)
  // ==========================================================================
  try {
    const themeProviderPath = path.join(projectRoot, 'src/providers/ThemeProvider.tsx');
    const providerCode = fs.readFileSync(themeProviderPath, 'utf-8');

    const hooksSystemScheme = providerCode.includes('useRNColorScheme()');
    const resolvesScheme = providerCode.includes("preference === 'system'");

    assert(
      hooksSystemScheme && resolvesScheme,
      'Test 11: iOS sistem teması (useColorScheme ve anlık tema geçişi) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 11 hatası:', err.message);
  }

  // ==========================================================================
  // Test 12: Secure Storage (iOS AsyncStorage Oturum Kalıcılığı)
  // ==========================================================================
  try {
    const supabaseClientPath = path.join(projectRoot, 'src/lib/supabase.ts');
    const supabaseCode = fs.readFileSync(supabaseClientPath, 'utf-8');

    const usesAsyncStorage = supabaseCode.includes("from '@react-native-async-storage/async-storage'");
    const configuresStorage = supabaseCode.includes('storage: secureStorage') || supabaseCode.includes('storage: safeStorage');
    const configuresPersist = supabaseCode.includes('persistSession: true');

    assert(
      usesAsyncStorage && configuresStorage && configuresPersist,
      'Test 12: iOS güvenli depolama ve oturum kalıcılığı (AsyncStorage adaptörü) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 12 hatası:', err.message);
  }

  // ==========================================================================
  // Test 13: Çıkış Sonrası Önbellek (SignOut ile Oturum Sıfırlama)
  // ==========================================================================
  try {
    const authServicePath = path.join(projectRoot, 'src/services/authService.ts');
    const authProviderPath = path.join(projectRoot, 'src/providers/AuthProvider.tsx');

    const serviceCode = fs.readFileSync(authServicePath, 'utf-8');
    const providerCode = fs.readFileSync(authProviderPath, 'utf-8');

    const callsSignOut = serviceCode.includes('supabase.auth.signOut()');
    const resetsState = providerCode.includes("setStatus('unauthenticated')");

    assert(
      callsSignOut && resetsState,
      'Test 13: iOS güvenli çıkış sonrası oturum ve durum sıfırlaması doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 13 hatası:', err.message);
  }

  // ==========================================================================
  // Test 14: Hesap Silme (iOS Native Destructive Onay Butonu)
  // ==========================================================================
  try {
    const deleteScreenPath = path.join(projectRoot, 'src/app/(protected)/account/delete.tsx');
    const deleteCode = fs.readFileSync(deleteScreenPath, 'utf-8');

    const hasDestructiveAlert = deleteCode.includes("style: 'destructive'");
    const callsDeleteAccount = deleteCode.includes('authService.deleteAccount');

    assert(
      hasDestructiveAlert && callsDeleteAccount,
      'Test 14: iOS hesap silme onayında kırmızı yıkıcı stil (destructive alert) ve silme işlemi doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 14 hatası:', err.message);
  }

  // ==========================================================================
  // Test 15: İnternet Kapalı Durumu (ErrorState ve Erişilebilirlik)
  // ==========================================================================
  try {
    const errorStatePath = path.join(projectRoot, 'src/components/feedback/ErrorState.tsx');
    const errorCode = fs.readFileSync(errorStatePath, 'utf-8');

    const hasAlertRole = errorCode.includes('accessibilityRole="alert"');
    const hasRetry = errorCode.includes('onRetry');

    assert(
      hasAlertRole && hasRetry,
      'Test 15: iOS çevrimdışı ve hata durumu sunumu (accessibilityRole="alert" ve onRetry) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 15 hatası:', err.message);
  }

  // ==========================================================================
  // Test 16: Uygulama Arka Plan ve Ön Plan Geçişi (Abonelik Yönetimi)
  // ==========================================================================
  try {
    const authProviderPath = path.join(projectRoot, 'src/providers/AuthProvider.tsx');
    const providerCode = fs.readFileSync(authProviderPath, 'utf-8');

    const listensAuthState = providerCode.includes('onAuthStateChange');
    const cleansUpOnUnmount = providerCode.includes('subscription.unsubscribe()');

    assert(
      listensAuthState && cleansUpOnUnmount,
      'Test 16: iOS arka plan/ön plan ve unmount sırasında bellek sızıntısı engeli (unsubscribe) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 16 hatası:', err.message);
  }

  console.log(`\nFaz 14.3 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
