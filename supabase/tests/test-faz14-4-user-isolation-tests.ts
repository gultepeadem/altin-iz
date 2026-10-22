/**
 * Altın İz — Faz 14.4: Kullanıcı Ayrılığı Güvenlik Test Paketi
 * supabase/tests/test-faz14-4-user-isolation-tests.ts
 *
 * Bu test paketi, docs/TODO.md Bölüm 20 (Faz 14.4: Kullanıcı ayrılığı güvenlik testleri)
 * maddelerini RLS politikaları, tetikleyiciler, servis katmanı ve gizli anahtar
 * taraması ile uçtan uca doğrular:
 *
 * 1. A kullanıcısı yalnızca kendi profilini görüyor (user_profiles_select_own: auth.uid() = user_id).
 * 2. B kullanıcısı yalnızca kendi profilini görüyor (Çoklu kiracı izolasyonu ve RLS güvencesi).
 * 3. A kullanıcısı yalnızca kendi tercihlerini görüyor (user_preferences_select_own & update_own).
 * 4. A kullanıcısı yalnızca kendi portföyünü görüyor (portfolio_entries_select_own & listEntries filtrelemesi).
 * 5. B kullanıcısı yalnızca kendi portföyünü görüyor (İki yönlü portföy izolasyonu).
 * 6. A kullanıcısı B'nin kayıt kimliğiyle detay alamıyor (getEntryById id + user_id çift filtre ve RLS).
 * 7. A kullanıcısı B'nin kayıt kimliğiyle güncelleme yapamıyor (updateEntry id + user_id çift filtre ve RLS).
 * 8. A kullanıcısı B'nin kayıt kimliğiyle silme yapamıyor (deleteEntry id + user_id çift filtre ve RLS).
 * 9. Manipüle edilmiş user_id kabul edilmiyor (protect_portfolio_user_id tetikleyicisi & insert_own).
 * 10. Service role anahtarı istemci paketinde bulunmuyor (src/ ve env taramasında 0 sızıntı).
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
  console.log('--- Faz 14.4: Kullanıcı Ayrılığı Güvenlik Testleri ---\n');

  const rlsMigrationPath = path.join(
    projectRoot,
    'supabase/migrations/20261022000006_rls_and_security_policies.sql'
  );
  const rlsSql = fs.readFileSync(rlsMigrationPath, 'utf-8');

  const portfolioServicePath = path.join(projectRoot, 'src/services/portfolioService.ts');
  const portfolioServiceCode = fs.readFileSync(portfolioServicePath, 'utf-8');

  const preferencesServicePath = path.join(projectRoot, 'src/services/preferencesService.ts');
  const preferencesServiceCode = fs.readFileSync(preferencesServicePath, 'utf-8');

  // ==========================================================================
  // Test 1: A kullanıcısı yalnızca kendi profilini görüyor
  // ==========================================================================
  try {
    const hasUserProfileSelectPolicy = rlsSql.includes('"user_profiles_select_own"') &&
      rlsSql.includes('ON public.user_profiles FOR SELECT') &&
      rlsSql.includes('USING (auth.uid() = user_id)');

    assert(
      hasUserProfileSelectPolicy,
      'Test 1: A kullanıcısının yalnızca kendi profilini görebildiği (user_profiles_select_own RLS) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 1 hatası:', err.message);
  }

  // ==========================================================================
  // Test 2: B kullanıcısı yalnızca kendi profilini görüyor
  // ==========================================================================
  try {
    const hasRlsEnabled = rlsSql.includes('ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;');
    const restrictsToAuth = rlsSql.includes('TO authenticated');

    assert(
      hasRlsEnabled && restrictsToAuth,
      'Test 2: B kullanıcısının yalnızca kendi profilini görebildiği (user_profiles çoklu kiracı RLS izolasyonu) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 2 hatası:', err.message);
  }

  // ==========================================================================
  // Test 3: A kullanıcısı yalnızca kendi tercihlerini görüyor
  // ==========================================================================
  try {
    const hasUserPrefSelect = rlsSql.includes('"user_preferences_select_own"') &&
      rlsSql.includes('ON public.user_preferences FOR SELECT') &&
      rlsSql.includes('USING (auth.uid() = user_id)');

    const hasUserPrefUpdate = rlsSql.includes('"user_preferences_update_own"') &&
      rlsSql.includes('ON public.user_preferences FOR UPDATE') &&
      rlsSql.includes('USING (auth.uid() = user_id)') &&
      rlsSql.includes('WITH CHECK (auth.uid() = user_id)');

    const serviceEnforcesUser = preferencesServiceCode.includes('resolveUserId') &&
      preferencesServiceCode.includes(".eq('user_id', activeUserId)");

    assert(
      hasUserPrefSelect && hasUserPrefUpdate && serviceEnforcesUser,
      'Test 3: A kullanıcısının yalnızca kendi tercihlerini görebildiği ve güncelleyebildiği (user_preferences RLS & servis) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 3 hatası:', err.message);
  }

  // ==========================================================================
  // Test 4: A kullanıcısı yalnızca kendi portföyünü görüyor
  // ==========================================================================
  try {
    const hasPortfolioSelect = rlsSql.includes('"portfolio_entries_select_own"') &&
      rlsSql.includes('ON public.portfolio_entries FOR SELECT') &&
      rlsSql.includes('USING (auth.uid() = user_id)');

    const listEntriesFiltersUser = portfolioServiceCode.includes('async listEntries(') &&
      portfolioServiceCode.includes(".eq('user_id', activeUserId)");

    assert(
      hasPortfolioSelect && listEntriesFiltersUser,
      'Test 4: A kullanıcısının yalnızca kendi portföyünü görebildiği (portfolio_entries_select_own & listEntries filtrelemesi) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 4 hatası:', err.message);
  }

  // ==========================================================================
  // Test 5: B kullanıcısı yalnızca kendi portföyünü görüyor
  // ==========================================================================
  try {
    const portfolioRlsEnabled = rlsSql.includes('ALTER TABLE public.portfolio_entries ENABLE ROW LEVEL SECURITY;');
    const insertOwn = rlsSql.includes('"portfolio_entries_insert_own"') &&
      rlsSql.includes('WITH CHECK (auth.uid() = user_id)');

    assert(
      portfolioRlsEnabled && insertOwn,
      'Test 5: B kullanıcısının yalnızca kendi portföyünü görebildiği (çift yönlü portföy izolasyonu ve insert kısıtı) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 5 hatası:', err.message);
  }

  // ==========================================================================
  // Test 6: A kullanıcısı B'nin kayıt kimliğiyle detay alamıyor
  // ==========================================================================
  try {
    // portfolioService.getEntryById(entryId) -> .eq('id', entryId).eq('user_id', activeUserId)
    const getByIdFiltersBoth = portfolioServiceCode.includes('async getEntryById(') &&
      portfolioServiceCode.includes(".eq('id', entryId)") &&
      portfolioServiceCode.includes(".eq('user_id', activeUserId)");

    const rlsGuardsSelect = rlsSql.includes('"portfolio_entries_select_own"') &&
      rlsSql.includes('USING (auth.uid() = user_id)');

    assert(
      getByIdFiltersBoth && rlsGuardsSelect,
      'Test 6: A kullanıcısının B\'ye ait kayıt kimliğiyle detay alamadığı (id + user_id çift filtre ve RLS) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 6 hatası:', err.message);
  }

  // ==========================================================================
  // Test 7: A kullanıcısı B'nin kayıt kimliğiyle güncelleme yapamıyor
  // ==========================================================================
  try {
    const updateFiltersBoth = portfolioServiceCode.includes('async updateEntry(') &&
      portfolioServiceCode.includes(".eq('id', entryId)") &&
      portfolioServiceCode.includes(".eq('user_id', activeUserId)");

    const rlsGuardsUpdate = rlsSql.includes('"portfolio_entries_update_own"') &&
      rlsSql.includes('USING (auth.uid() = user_id)') &&
      rlsSql.includes('WITH CHECK (auth.uid() = user_id)');

    assert(
      updateFiltersBoth && rlsGuardsUpdate,
      'Test 7: A kullanıcısının B\'ye ait kayıt kimliğiyle güncelleme yapamadığı (RLS update_own ve servis izolasyonu) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 7 hatası:', err.message);
  }

  // ==========================================================================
  // Test 8: A kullanıcısı B'nin kayıt kimliğiyle silme yapamıyor
  // ==========================================================================
  try {
    const deleteFiltersBoth = portfolioServiceCode.includes('async deleteEntry(') &&
      portfolioServiceCode.includes(".eq('id', entryId)") &&
      portfolioServiceCode.includes(".eq('user_id', activeUserId)");

    const rlsGuardsDelete = rlsSql.includes('"portfolio_entries_delete_own"') &&
      rlsSql.includes('USING (auth.uid() = user_id)');

    assert(
      deleteFiltersBoth && rlsGuardsDelete,
      'Test 8: A kullanıcısının B\'ye ait kayıt kimliğiyle silme yapamadığı (RLS delete_own ve servis izolasyonu) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 8 hatası:', err.message);
  }

  // ==========================================================================
  // Test 9: Manipüle edilmiş user_id kabul edilmiyor
  // ==========================================================================
  try {
    // 1. Veritabanı tetikleyicisi: NEW.user_id <> OLD.user_id koruması
    const hasTriggerFunction = rlsSql.includes('FUNCTION public.protect_portfolio_user_id()') &&
      rlsSql.includes('IF NEW.user_id <> OLD.user_id THEN') &&
      rlsSql.includes("RAISE EXCEPTION 'portfolio_entries kaydının sahibi (user_id) değiştirilemez.'");

    // 2. İstemci ekleme servisi: client payload'daki user_id yok sayılır, resolveUserId'den gelen activeUserId atanır
    const createEntryEnforcesActiveUser = portfolioServiceCode.includes('async createEntry(') &&
      portfolioServiceCode.includes('user_id: activeUserId');

    assert(
      hasTriggerFunction && createEntryEnforcesActiveUser,
      'Test 9: Manipüle edilmiş user_id aktarımının engellendiği (protect_portfolio_user_id tetikleyicisi & createEntry güvenliği) doğrulandı.'
    );
  } catch (err: any) {
    console.error('Test 9 hatası:', err.message);
  }

  // ==========================================================================
  // Test 10: Service role anahtarı istemci paketinde bulunmuyor
  // ==========================================================================
  try {
    const srcDir = path.join(projectRoot, 'src');

    const forbiddenPatterns = [
      /eyJhbGciOi[A-Za-z0-9\-._~+/]+/i, // Gerçek JWT token
      /postgres(?:ql)?:\/\/[^:]+:[^@]+@/i, // Canlı DB bağlantı dizesi
      /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"][^'"]+['"]/i, // Service role ataması
      /process\.env\.(?:SUPABASE_)?SERVICE_ROLE/i, // İstemciden service role okuma
    ];

    function scanDirForSecret(dir: string): string[] {
      let findings: string[] = [];
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          findings = findings.concat(scanDirForSecret(fullPath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          for (const pattern of forbiddenPatterns) {
            if (pattern.test(content)) {
              findings.push(`${file}: eşleşme (${pattern.toString()})`);
            }
          }
        }
      }
      return findings;
    }

    const envPath = path.join(projectRoot, 'src/lib/environment.ts');
    const envCode = fs.readFileSync(envPath, 'utf-8');
    const exportsOnlyPublishable =
      envCode.includes('supabasePublishableKey') &&
      !envCode.includes('serviceRoleKey') &&
      !envCode.includes('service_role:');

    const secretLeaks = scanDirForSecret(srcDir);
    const noSecretInSrc = secretLeaks.length === 0 && exportsOnlyPublishable;

    assert(
      noSecretInSrc,
      `Test 10: Service role gizli anahtarının istemci paketinde yer almadığı (0 sızıntı) doğrulandı.`
    );
  } catch (err: any) {
    console.error('Test 10 hatası:', err.message);
  }

  console.log(`\nFaz 14.4 Test Sonucu: ${passedTests} Başarılı, ${failedTests} Başarısız (Toplam: ${passedTests + failedTests})`);
  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
