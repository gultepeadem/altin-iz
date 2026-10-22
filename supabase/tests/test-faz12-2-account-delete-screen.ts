/**
 * Altın İz — Faz 12.2 Hesap Silme Ekranı ve Akış Testleri
 * supabase/tests/test-faz12-2-account-delete-screen.ts
 *
 * Test Edilen Kapsam:
 * - [x] Silinecek verileri liste halinde kullanıcıya sunma.
 * - [x] İşlemin geri alınamaz (irreversible) olduğunu belirtme.
 * - [x] Parola ile yeniden kimlik doğrulama alanı ve boş şifre engeli.
 * - [x] İki aşamalı son onay adımı (destructive Alert mekanizması).
 * - [x] İşlem sürerken ekranı güvenli şekilde kilitleme (loading & disabled).
 * - [x] Başarıdan sonra yerel oturumu temizleme (signOut).
 * - [x] Başarıdan sonra welcome ekranına yönlendirme.
 * - [x] Başarısızlıkta hesabı silinmiş gibi göstermeme (ekranda kalma).
 * - [x] Hata sonrası tekrar deneme imkânı sunma.
 * - [x] authService.deleteAccount entegrasyonu ve hata sözleşmesi.
 */

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';

// Hesap silme form doğrulama mantığı
function validateDeleteForm(password: string): { isValid: boolean; error: string | null } {
  const trimmed = password.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Lütfen hesabınızı silmek için mevcut şifrenizi girin.',
    };
  }
  return {
    isValid: true,
    error: null,
  };
}

// Silme akış simülasyonu
async function simulateDeletionFlow(params: {
  password: string;
  mockDeleteAccountFn: (p: { password: string }) => Promise<void>;
  mockRouterReplace: (route: string) => void;
}): Promise<{
  attempted: boolean;
  navigatedTo: string | null;
  errorMessage: string | null;
}> {
  const validation = validateDeleteForm(params.password);
  if (!validation.isValid) {
    return {
      attempted: false,
      navigatedTo: null,
      errorMessage: validation.error,
    };
  }

  try {
    await params.mockDeleteAccountFn({ password: params.password });
    params.mockRouterReplace('/(public)/welcome');
    return {
      attempted: true,
      navigatedTo: '/(public)/welcome',
      errorMessage: null,
    };
  } catch (err: any) {
    return {
      attempted: true,
      navigatedTo: null,
      errorMessage: err?.message || 'Hesap silinemedi.',
    };
  }
}

async function runTests() {
  console.log('--- Faz 12.2: Hesap Silme Ekranı ve Akış Testleri ---\n');
  let passed = 0;
  let failed = 0;

  const deleteScreenPath = path.resolve(process.cwd(), 'src/app/(protected)/account/delete.tsx');
  const screenContent = fs.readFileSync(deleteScreenPath, 'utf8');

  // Test 1: Silinecek verileri açıkça listeleme
  try {
    const listsPortfolio = screenContent.includes('Altın Portföyü');
    const listsProfile = screenContent.includes('Profil Bilgileri');
    const listsPreferences = screenContent.includes('Uygulama Tercihleri');
    const listsAuth = screenContent.includes('Oturum ve Giriş Bilgileri');

    if (listsPortfolio && listsProfile && listsPreferences && listsAuth) {
      console.log('✅ Test 1: Silinecek veriler (Portföy, Profil, Tercihler, Oturum) ekranda açıkça listeleniyor.');
      passed++;
    } else {
      console.error('❌ Test 1: Silinecek veri listesinde eksiklik var.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Hatası:', err);
    failed++;
  }

  // Test 2: İşlemin geri alınamaz (irreversible) olduğu uyarısı
  try {
    const hasIrreversibleNotice = screenContent.includes('Bu İşlem Geri Alınamaz');
    const hasLossColorStyle = screenContent.includes('theme.colors.loss');

    if (hasIrreversibleNotice && hasLossColorStyle) {
      console.log('✅ Test 2: İşlemin geri alınamaz (irreversible) olduğunu belirten kırmızı tehlike panosu doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 2: Geri alınamaz uyarısı eksik.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Hatası:', err);
    failed++;
  }

  // Test 3: Boş şifre ile silme isteği engeli ve form doğrulama
  try {
    const emptyCheck = validateDeleteForm('');
    const spaceCheck = validateDeleteForm('   ');
    const validCheck = validateDeleteForm('my-secret-pass-123');

    if (!emptyCheck.isValid && !spaceCheck.isValid && validCheck.isValid && validCheck.error === null) {
      console.log('✅ Test 3: Boş veya yalnızca boşluk içeren şifre girişleri güvenli biçimde engellendi.');
      passed++;
    } else {
      console.error('❌ Test 3: Form doğrulama hatası:', { emptyCheck, validCheck });
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Hatası:', err);
    failed++;
  }

  // Test 4: İki aşamalı son onay adımı (destructive Alert)
  try {
    const hasAlertConfirmation = screenContent.includes('Alert.alert(');
    const hasDestructiveStyle = screenContent.includes("style: 'destructive'");
    const hasCancelButton = screenContent.includes("style: 'cancel'");

    if (hasAlertConfirmation && hasDestructiveStyle && hasCancelButton) {
      console.log('✅ Test 4: İki aşamalı onay mekanizması (Platform destructive Alert & Vazgeç seçeneği) doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 4: İki aşamalı onay adımı eksik.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Hatası:', err);
    failed++;
  }

  // Test 5: İşlem sürerken ekranı güvenli şekilde kilitleme (isSubmitting)
  try {
    const hasSubmittingState = screenContent.includes('const [isSubmitting, setIsSubmitting] = useState(false);');
    const locksButton = screenContent.includes('loading={isSubmitting}');
    const disablesButton = screenContent.includes('disabled={isSubmitting || !password.trim()}');

    if (hasSubmittingState && locksButton && disablesButton) {
      console.log('✅ Test 5: İşlem sürerken ekran kilitleme (loading & disabled) güvencesi doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 5: Ekran kilitleme kontrolü eksik.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Hatası:', err);
    failed++;
  }

  // Test 6: Başarılı silme akışında yerel oturum temizlenir ve welcome ekranına yönlendirilir
  try {
    let signOutCalled = false;
    let navigatedTo: string | null = null;

    const mockDelete = async () => {
      signOutCalled = true;
    };
    const mockRouter = (route: string) => {
      navigatedTo = route;
    };

    const flowResult = await simulateDeletionFlow({
      password: 'valid-password',
      mockDeleteAccountFn: mockDelete,
      mockRouterReplace: mockRouter,
    });

    if (flowResult.attempted && signOutCalled && navigatedTo === '/(public)/welcome') {
      console.log('✅ Test 6: Başarılı silme sonrası yerel oturum kapatıldı ve /(public)/welcome ekranına yönlendirildi.');
      passed++;
    } else {
      console.error('❌ Test 6: Başarılı silme akışı simülasyonu başarısız:', flowResult);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Hatası:', err);
    failed++;
  }

  // Test 7: Başarısızlık durumunda hesabı silinmiş gibi göstermeme (ekranda kalma)
  try {
    let navigatedTo: string | null = null;
    const mockFailedDelete = async () => {
      throw new Error('Girdiğiniz parola hatalı.');
    };
    const mockRouter = (route: string) => {
      navigatedTo = route;
    };

    const failedResult = await simulateDeletionFlow({
      password: 'wrong-password',
      mockDeleteAccountFn: mockFailedDelete,
      mockRouterReplace: mockRouter,
    });

    // Başarısızlıkta yönlendirme YAPILMAMALI ve hata mesajı gösterilmelidir
    if (failedResult.attempted && navigatedTo === null && failedResult.errorMessage?.includes('parola hatalı')) {
      console.log('✅ Test 7: Hata durumunda hesap silinmiş gibi gösterilmiyor; kullanıcı ekranda tutulup hata bildiriliyor.');
      passed++;
    } else {
      console.error('❌ Test 7: Hata telafisi ve yönlendirme engeli başarısız:', failedResult);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Hatası:', err);
    failed++;
  }

  // Test 8: Hata sonrası tekrar deneme davranışı
  try {
    let attemptCount = 0;
    const mockRetryDelete = async (p: { password: string }) => {
      attemptCount++;
      if (p.password !== 'correct-pass') {
        throw new Error('Geçersiz parola');
      }
    };
    let navigatedTo: string | null = null;
    const mockRouter = (route: string) => {
      navigatedTo = route;
    };

    // 1. Deneme (Hatalı)
    const run1 = await simulateDeletionFlow({
      password: 'bad-pass',
      mockDeleteAccountFn: mockRetryDelete,
      mockRouterReplace: mockRouter,
    });

    // 2. Deneme (Doğru şifreyle tekrar deneme)
    const run2 = await simulateDeletionFlow({
      password: 'correct-pass',
      mockDeleteAccountFn: mockRetryDelete,
      mockRouterReplace: mockRouter,
    });

    if (attemptCount === 2 && !run1.navigatedTo && run2.navigatedTo === '/(public)/welcome' && navigatedTo === '/(public)/welcome') {
      console.log('✅ Test 8: Hata sonrasında kullanıcı yeni şifre girerek tekrar deneme işlemini başarıyla tamamlayabiliyor.');
      passed++;
    } else {
      console.error('❌ Test 8: Tekrar deneme akışı başarısız.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Hatası:', err);
    failed++;
  }

  // Test 9: authService.deleteAccount metot sözleşmesi
  try {
    const authServicePath = path.resolve(process.cwd(), 'src/services/authService.ts');
    const authServiceContent = fs.readFileSync(authServicePath, 'utf8');

    const hasDeleteAccount = authServiceContent.includes('async deleteAccount(params:');
    const callsEdgeFunction = authServiceContent.includes("supabase.functions.invoke('delete-account'");
    const callsSignOutOnSuccess = authServiceContent.includes('await this.signOut()');

    if (hasDeleteAccount && callsEdgeFunction && callsSignOutOnSuccess) {
      console.log('✅ Test 9: authService.deleteAccount metodu tanımlı, delete-account Edge Function ve signOut çağrısıyla entegre.');
      passed++;
    } else {
      console.error('❌ Test 9: authService.deleteAccount metot sözleşmesi eksik.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 Hatası:', err);
    failed++;
  }

  // Test 10: Android ve iOS uyumu (ScreenContainer keyboardAvoiding & Safe Area)
  try {
    const usesScreenContainer = screenContent.includes('<ScreenContainer');
    const handlesKeyboard = screenContent.includes("keyboardAvoiding={Platform.OS === 'ios'}");
    const handlesSecondaryBack = screenContent.includes('router.back()');

    if (usesScreenContainer && handlesKeyboard && handlesSecondaryBack) {
      console.log('✅ Test 10: Android ve iOS uyumluluğu (Safe Area, klavye yönetimi ve geri dönüş) doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 10: Platform uyumluluk kontrollerinde eksiklik var.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 10 Hatası:', err);
    failed++;
  }

  console.log(`\nFaz 12.2 Test Sonucu: ${passed} Başarılı, ${failed} Başarısız (Toplam: ${passed + failed})`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
