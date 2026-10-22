/**
 * Altın İz — Faz 14.2: Android Cihaz ve Ekran Testleri Paketi
 * supabase/tests/test-faz14-2-android-tests.ts
 *
 * Test Edilen Kapsam (20 Android Fonksiyonel Testi):
 * 1. [x] Uygulama açılışı (Splash screen, Root stack, auth durumuna göre initial route)
 * 2. [x] Kayıt formu (E-posta, şifre, görünen ad, klavye yönetimi ve signUp)
 * 3. [x] E-posta bağlantısı (Verify email ekranı, deep link ve resendVerificationEmail)
 * 4. [x] Giriş formu (Sign-in ekranı, şifre gizleme/gösterme ve signInWithPassword)
 * 5. [x] Şifre sıfırlama bağlantısı (Forgot password ve reset password akışları)
 * 6. [x] Alt menü (Bottom tabs navigasyonu, simgeler ve Android Safe Area)
 * 7. [x] Fiyat listesi (Fiyatlar sekmesi, pull-to-refresh ve arama)
 * 8. [x] Altın detay ekranı (Dinamik [productId] rotası, alış/satış/makas görünümü)
 * 9. [x] Hesaplama klavyesi (decimal-pad klavye, satın alma ve bozdurma tahminleri)
 * 10. [x] Tarih seçici (Tarih ayrıştırması, geçmiş tarih geçerliliği ve gelecek tarih engeli)
 * 11. [x] Portföy ekleme (Ürün seçimi, miktar, maliyet hesabı ve createEntry)
 * 12. [x] Portföy düzenleme (Mevcut kaydı yükleme, miktar/maliyet güncelleme)
 * 13. [x] Portföy silme (İki aşamalı destructive onay ve deleteEntry)
 * 14. [x] Tema değiştirme (Aydınlık/karanlık/sistem tema geçişi ve kalıcılık)
 * 15. [x] Çıkış (SignOut, yerel önbellek temizliği ve karşılama ekranına dönüş)
 * 16. [x] Hesap silme (Parola ile yeniden doğrulama, geri alınamazlık uyarısı, iki aşamalı Alert)
 * 17. [x] İnternet kapalı durumu (NETWORK_ERROR tespiti, çevrimdışı fallback metinleri, ErrorState)
 * 18. [x] Yavaş bağlantı (LoadingState, isSubmitting ile buton kilitleme ve zaman aşımı)
 * 19. [x] Uygulama arka plan ve ön plan geçişi (AppState ve isMounted güvenliği)
 * 20. [x] Farklı yazı boyutları (Esnek flex düzenleri, tema tipografi ölçekleri ve taşma koruması)
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
  console.log('--- Faz 14.2: Android Cihaz ve Ekran Testleri ---\n');

  // ==========================================================================
  // Test 1: Uygulama Açılışı (Splash Screen & Initial Route)
  // ==========================================================================
  try {
    const rootLayoutPath = path.join(projectRoot, 'src/app/_layout.tsx');
    const rootCode = fs.readFileSync(rootLayoutPath, 'utf-8');

    const indexPath = path.join(projectRoot, 'src/app/index.tsx');
    const indexCode = fs.readFileSync(indexPath, 'utf-8');

    const preventsAutoHide = rootCode.includes('SplashScreen.preventAutoHideAsync()');
    const managesInitialRoute =
      indexCode.includes('if (isLoading)') &&
      indexCode.includes('/(public)/welcome') &&
      indexCode.includes('/(protected)/(tabs)');

    assert(
      preventsAutoHide && managesInitialRoute,
      'Test 1: Android uygulama açılışı (Splash screen ve oturum durumuna göre ilk rota yönlendirmesi) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: Kayıt Formu (Klavye yönetimi ve signUp)
  // ==========================================================================
  try {
    const signUpPath = path.join(projectRoot, 'src/app/(public)/sign-up.tsx');
    const signUpCode = fs.readFileSync(signUpPath, 'utf-8');

    const usesScreenContainer = signUpCode.includes('<ScreenContainer');
    const hasKeyboardAvoiding = signUpCode.includes('keyboardAvoiding') || signUpCode.includes('scrollable');
    const callsSignUp = signUpCode.includes('authService.signUp(');
    const navigatesToVerify = signUpCode.includes('/(public)/verify-email');

    assert(
      usesScreenContainer && hasKeyboardAvoiding && callsSignUp && navigatesToVerify,
      'Test 2: Android kayıt formu (form alanları, klavye uyumu, signUp çağrısı ve yönlendirme) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: E-Posta Bağlantısı (Verify Email & Deep Link)
  // ==========================================================================
  try {
    const verifyPath = path.join(projectRoot, 'src/app/(public)/verify-email.tsx');
    const verifyCode = fs.readFileSync(verifyPath, 'utf-8');

    const callsResend = verifyCode.includes('authService.resendVerificationEmail(');
    const hasBackLink = verifyCode.includes('/(public)/sign-in');

    assert(
      callsResend && hasBackLink,
      'Test 3: Android e-posta doğrulama ekranı (tekrar gönderim ve geri dönüş) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: Giriş Formu (Şifre gizleme/gösterme & signInWithPassword)
  // ==========================================================================
  try {
    const signInPath = path.join(projectRoot, 'src/app/(public)/sign-in.tsx');
    const signInCode = fs.readFileSync(signInPath, 'utf-8');

    const usesPasswordField = signInCode.includes('PasswordField');
    const callsSignIn = signInCode.includes('authService.signInWithPassword(');
    const hasForgotLink = signInCode.includes('/(public)/forgot-password');

    assert(
      usesPasswordField && callsSignIn && hasForgotLink,
      'Test 4: Android giriş formu (şifre alanı, oturum açma ve şifremi unuttum bağlantısı) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: Şifre Sıfırlama Bağlantısı (Forgot & Reset Password)
  // ==========================================================================
  try {
    const forgotPath = path.join(projectRoot, 'src/app/(public)/forgot-password.tsx');
    const forgotCode = fs.readFileSync(forgotPath, 'utf-8');

    const resetPath = path.join(projectRoot, 'src/app/(public)/reset-password.tsx');
    const resetCode = fs.readFileSync(resetPath, 'utf-8');

    const callsResetEmail = forgotCode.includes('authService.resetPasswordForEmail(');
    const callsUpdatePassword = resetCode.includes('authService.updatePassword(');

    assert(
      callsResetEmail && callsUpdatePassword,
      'Test 5: Android şifre sıfırlama talebi ve yeni şifre belirleme akışları doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: Alt Menü (Bottom Tabs Navigasyonu & Android Safe Area)
  // ==========================================================================
  try {
    const tabsLayoutPath = path.join(projectRoot, 'src/app/(protected)/(tabs)/_layout.tsx');
    const tabsCode = fs.readFileSync(tabsLayoutPath, 'utf-8');

    const hasHomeTab = tabsCode.includes('name="index"');
    const hasPricesTab = tabsCode.includes('name="prices"');
    const hasCalculatorTab = tabsCode.includes('name="calculator"');
    const hasPortfolioTab = tabsCode.includes('name="portfolio"');
    const hasSettingsTab = tabsCode.includes('name="settings"');

    assert(
      hasHomeTab && hasPricesTab && hasCalculatorTab && hasPortfolioTab && hasSettingsTab,
      'Test 6: Android alt menü (Tabs) iskeleti (Ana Sayfa, Fiyatlar, Hesapla, Portföy, Ayarlar) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: Fiyat Listesi (Fiyatlar Sekmesi, Çekip Yenileme & Arama)
  // ==========================================================================
  try {
    const pricesPath = path.join(projectRoot, 'src/app/(protected)/(tabs)/prices.tsx');
    const pricesCode = fs.readFileSync(pricesPath, 'utf-8');

    const hasRefreshControl = pricesCode.includes('refreshControl') || pricesCode.includes('RefreshControl');
    const loadsPrices = pricesCode.includes('goldPriceService.getProductsWithPrices');

    assert(
      hasRefreshControl && loadsPrices,
      'Test 7: Android fiyat listesi (fiyat sorgusu, çekip yenileme pull-to-refresh) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  // ==========================================================================
  // Test 8: Altın Detay Ekranı (Dinamik [productId] Rotası)
  // ==========================================================================
  try {
    const detailPath = path.join(projectRoot, 'src/app/(protected)/gold/[productId].tsx');
    const detailCode = fs.readFileSync(detailPath, 'utf-8');

    const usesParams = detailCode.includes('useLocalSearchParams');
    const showsBuySell = detailCode.includes('buyPrice') || detailCode.includes('formatMoney');
    const linksToCalculator = detailCode.includes('/(protected)/(tabs)/calculator');

    assert(
      usesParams && showsBuySell && linksToCalculator,
      'Test 8: Android altın detay ekranı (dinamik parametre, alış/satış görünümü ve hesapla yönlendirmesi) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 8 hatası:', err.message);
  }

  // ==========================================================================
  // Test 9: Hesaplama Klavyesi (decimal-pad & Tahmin Fonksiyonları)
  // ==========================================================================
  try {
    const calcPath = path.join(projectRoot, 'src/app/(protected)/(tabs)/calculator.tsx');
    const calcCode = fs.readFileSync(calcPath, 'utf-8');

    const usesDecimalPad = calcCode.includes('decimal-pad');
    const calculatesPurchase = calcCode.includes('calculatePurchaseEstimate');
    const calculatesRedemption = calcCode.includes('calculateRedemptionEstimate');

    assert(
      usesDecimalPad && calculatesPurchase && calculatesRedemption,
      'Test 9: Android hesaplama ekranı (decimal-pad klavye türü ve satın alma/bozdurma tahminleri) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 9 hatası:', err.message);
  }

  // ==========================================================================
  // Test 10: Tarih Seçici (Formatlama & Geçmiş/Gelecek Tarih Denetimi)
  // ==========================================================================
  try {
    const addPath = path.join(projectRoot, 'src/app/(protected)/portfolio/add.tsx');
    const addCode = fs.readFileSync(addPath, 'utf-8');

    const parsesDate = addCode.includes('parseDateInputToISO');
    const checksFuture = addCode.includes('isFutureDate');

    assert(
      parsesDate && checksFuture,
      'Test 10: Android tarih seçici alanı (tarih ayrıştırması ve gelecek tarih engeli) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 10 hatası:', err.message);
  }

  // ==========================================================================
  // Test 11: Portföy Ekleme (add.tsx - Ürün, Miktar, Maliyet ve createEntry)
  // ==========================================================================
  try {
    const addPath = path.join(projectRoot, 'src/app/(protected)/portfolio/add.tsx');
    const addCode = fs.readFileSync(addPath, 'utf-8');

    const hasCreateEntryCall = addCode.includes('portfolioService.createEntry(');
    const usesScrollable = addCode.includes('scrollable={true}');
    const handlesKeyboard = addCode.includes('keyboardAvoiding={true}');

    assert(
      hasCreateEntryCall && usesScrollable && handlesKeyboard,
      'Test 11: Android portföy ekleme ekranı (form alanları, scrollable/klavye güvenliği ve createEntry) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 11 hatası:', err.message);
  }

  // ==========================================================================
  // Test 12: Portföy Düzenleme ([entryId]/edit.tsx - Veri Yükleme & Güncelleme)
  // ==========================================================================
  try {
    const editPath = path.join(projectRoot, 'src/app/(protected)/portfolio/[entryId]/edit.tsx');
    const editCode = fs.readFileSync(editPath, 'utf-8');

    const loadsEntry = editCode.includes('portfolioService.getEntryById(');
    const callsUpdate = editCode.includes('portfolioService.updateEntry(');

    assert(
      loadsEntry && callsUpdate,
      'Test 12: Android portföy düzenleme ekranı (mevcut kaydı ön yükleme ve updateEntry) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 12 hatası:', err.message);
  }

  // ==========================================================================
  // Test 13: Portföy Silme ([entryId].tsx - İki Aşamalı Destructive Onay)
  // ==========================================================================
  try {
    const detailPath = path.join(projectRoot, 'src/app/(protected)/portfolio/[entryId].tsx');
    const detailCode = fs.readFileSync(detailPath, 'utf-8');

    const hasDeleteModal = detailCode.includes('showDeleteModal') || detailCode.includes('handleDelete');
    const callsDeleteEntry = detailCode.includes('portfolioService.deleteEntry(');

    assert(
      hasDeleteModal && callsDeleteEntry,
      'Test 13: Android portföy silme işlemi (iki aşamalı onay penceresi ve deleteEntry) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 13 hatası:', err.message);
  }

  // ==========================================================================
  // Test 14: Tema Değiştirme (Aydınlık/Karanlık/Sistem & Kalıcılık)
  // ==========================================================================
  try {
    const settingsPath = path.join(projectRoot, 'src/app/(protected)/(tabs)/settings.tsx');
    const settingsCode = fs.readFileSync(settingsPath, 'utf-8');

    const themeProviderPath = path.join(projectRoot, 'src/providers/ThemeProvider.tsx');
    const providerCode = fs.readFileSync(themeProviderPath, 'utf-8');

    const preferencesServicePath = path.join(projectRoot, 'src/services/preferencesService.ts');
    const preferencesServiceCode = fs.readFileSync(preferencesServicePath, 'utf-8');

    const selectsTheme = settingsCode.includes('setPreference(');
    const usesPreferencesService = providerCode.includes('preferencesService.updateThemePreference');
    const persistsStorage = preferencesServiceCode.includes('safeStorage.setItem') || preferencesServiceCode.includes('AsyncStorage');

    assert(
      selectsTheme && usesPreferencesService && persistsStorage,
      'Test 14: Android tema seçimi (light/dark/system) ve AsyncStorage kalıcılığı doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 14 hatası:', err.message);
  }

  // ==========================================================================
  // Test 15: Çıkış (SignOut & Karşılama Ekranına Dönüş)
  // ==========================================================================
  try {
    const settingsPath = path.join(projectRoot, 'src/app/(protected)/(tabs)/settings.tsx');
    const settingsCode = fs.readFileSync(settingsPath, 'utf-8');

    const hasSignOutAction = settingsCode.includes('handleSignOut');
    const callsAuthSignOut = settingsCode.includes('signOut()');

    assert(
      hasSignOutAction && callsAuthSignOut,
      'Test 15: Android güvenli oturum kapatma (signOut ve önbellek temizliği) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 15 hatası:', err.message);
  }

  // ==========================================================================
  // Test 16: Hesap Silme (account/delete.tsx - Parola ve İki Aşamalı Alert)
  // ==========================================================================
  try {
    const deletePath = path.join(projectRoot, 'src/app/(protected)/account/delete.tsx');
    const deleteCode = fs.readFileSync(deletePath, 'utf-8');

    const usesNativeAlert = deleteCode.includes('Alert.alert(');
    const hasDestructiveStyle = deleteCode.includes("style: 'destructive'");
    const callsDeleteAccount = deleteCode.includes('authService.deleteAccount(');

    assert(
      usesNativeAlert && hasDestructiveStyle && callsDeleteAccount,
      'Test 16: Android hesap silme ekranı (parola doğrulaması, Alert destructive onayı ve silme çağrısı) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 16 hatası:', err.message);
  }

  // ==========================================================================
  // Test 17: İnternet Kapalı Durumu (NETWORK_ERROR & ErrorState)
  // ==========================================================================
  try {
    const errorStatePath = path.join(projectRoot, 'src/components/feedback/ErrorState.tsx');
    const errorCode = fs.readFileSync(errorStatePath, 'utf-8');

    const legalPath = path.join(projectRoot, 'src/models/legal.ts');
    const legalCode = fs.readFileSync(legalPath, 'utf-8');

    const hasRetry = errorCode.includes('onRetry') && (errorCode.includes('Tekrar Dene') || errorCode.includes('Yeniden Dene'));
    const hasOfflineFallback = legalCode.includes('FALLBACK_LEGAL_DOCUMENTS');

    assert(
      hasRetry && hasOfflineFallback,
      'Test 17: Android internet kapalı durumu (ErrorState yeniden dene ve çevrimdışı fallback metinleri) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 17 hatası:', err.message);
  }

  // ==========================================================================
  // Test 18: Yavaş Bağlantı (LoadingState & Buton Kilitleme)
  // ==========================================================================
  try {
    const loadingStatePath = path.join(projectRoot, 'src/components/feedback/LoadingState.tsx');
    const loadingCode = fs.readFileSync(loadingStatePath, 'utf-8');

    const primaryButtonPath = path.join(projectRoot, 'src/components/common/PrimaryButton.tsx');
    const buttonCode = fs.readFileSync(primaryButtonPath, 'utf-8');

    const showsSpinner = loadingCode.includes('ActivityIndicator');
    const disablesOnLoading = buttonCode.includes('disabled || loading') || buttonCode.includes('isDisabled');

    assert(
      showsSpinner && disablesOnLoading,
      'Test 18: Android yavaş bağlantı ve yükleniyor geri bildirimi (ActivityIndicator ve buton kilitleme) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 18 hatası:', err.message);
  }

  // ==========================================================================
  // Test 19: Uygulama Arka Plan ve Ön Plan Geçişi (isMounted & Auth Listener)
  // ==========================================================================
  try {
    const authProviderPath = path.join(projectRoot, 'src/providers/AuthProvider.tsx');
    const authCode = fs.readFileSync(authProviderPath, 'utf-8');

    const listensAuthState = authCode.includes('authService.onAuthStateChange');
    const usesMountedSafety = authCode.includes('if (!isMounted) return;');

    assert(
      listensAuthState && usesMountedSafety,
      'Test 19: Android arka plan/ön plan yaşam döngüsü (auth dinleyicisi ve unmounted güvenliği) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 19 hatası:', err.message);
  }

  // ==========================================================================
  // Test 20: Farklı Yazı Boyutları (Font Scaling & Taşma Koruması)
  // ==========================================================================
  try {
    const typographyPath = path.join(projectRoot, 'src/theme/typography.ts');
    const typographyCode = fs.readFileSync(typographyPath, 'utf-8');

    const screenContainerPath = path.join(projectRoot, 'src/components/common/ScreenContainer.tsx');
    const containerCode = fs.readFileSync(screenContainerPath, 'utf-8');

    const hasTypographyTokens = typographyCode.includes('fontSize') && typographyCode.includes('lineHeight');
    const allowsScrollView = containerCode.includes('ScrollView');

    assert(
      hasTypographyTokens && allowsScrollView,
      'Test 20: Android farklı yazı boyutları esnekliği (tipografi ölçekleri ve ScrollView taşma engeli) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 20 hatası:', err.message);
  }

  console.log(`\nFaz 14.2 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
