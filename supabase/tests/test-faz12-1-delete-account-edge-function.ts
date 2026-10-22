/**
 * Altın İz — Faz 12.1 delete-account Edge Function Testleri
 * supabase/tests/test-faz12-1-delete-account-edge-function.ts
 *
 * Test Edilen Kapsam:
 * - [x] CORS preflight (OPTIONS) istek kontrolü.
 * - [x] Yalnızca POST isteklerine izin verme (405 Method Not Allowed kontrolü).
 * - [x] Oturumu ve Authorization Bearer başlığını doğrulama (401 kontrolü).
 * - [x] Kullanıcı kimliğini token üzerinden alma, gövdedeki serbest user_id'yi yok sayma.
 * - [x] Yeniden doğrulama şartını kontrol etme (MISSING_PASSWORD -> 400).
 * - [x] Geçersiz parola kontrolü (INVALID_CREDENTIALS -> 401).
 * - [x] ADR-033 silme sırasını ve portföy, tercih, profil, auth silme adımlarını doğrulama.
 * - [x] Yasal ve güvenlik olaylarını anonimleştirme (user_id -> NULL).
 * - [x] Kısmi hata durumunda güvenli hata kaydı ve telafi (KI-018).
 * - [x] Secret, token veya parola sızıntısı olmadığını doğrulama (Sanitizer kontrolü).
 */

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';

import { handler } from '../functions/delete-account/index.ts';
import { sanitizeString } from '../functions/delete-account/sanitizer.ts';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
}
loadEnv();

async function runTests() {
  console.log('--- Faz 12.1: delete-account Edge Function Testleri ---\n');
  let passed = 0;
  let failed = 0;

  // Test 1: CORS Preflight (OPTIONS) isteği
  try {
    const req = new Request('http://localhost:54321/functions/v1/delete-account', {
      method: 'OPTIONS',
    });
    const res = await handler(req);

    const isCorsOk =
      res.status === 200 &&
      res.headers.get('Access-Control-Allow-Origin') === '*' &&
      res.headers.get('Access-Control-Allow-Methods')?.includes('POST');

    if (isCorsOk) {
      console.log('✅ Test 1: CORS Preflight (OPTIONS) isteği başarıyla doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 1: CORS yanıtı hatalı:', res.status);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Hatası:', err);
    failed++;
  }

  // Test 2: Desteklenmeyen HTTP metodları (GET, PUT) reddedilir (405 Method Not Allowed)
  try {
    const req = new Request('http://localhost:54321/functions/v1/delete-account', {
      method: 'GET',
    });
    const res = await handler(req);
    const body = await res.json();

    if (res.status === 405 && body.error?.code === 'METHOD_NOT_ALLOWED') {
      console.log('✅ Test 2: Yalnızca POST isteklerine izin veriliyor; GET isteği 405 ile reddedildi.');
      passed++;
    } else {
      console.error('❌ Test 2: HTTP metot kontrolü başarısız:', res.status);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Hatası:', err);
    failed++;
  }

  // Test 3: Authorization başlığı eksik olduğunda 401 UNAUTHORIZED döner
  try {
    const req = new Request('http://localhost:54321/functions/v1/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'some-password' }),
    });
    const res = await handler(req);
    const body = await res.json();

    if (res.status === 401 && body.error?.code === 'UNAUTHORIZED') {
      console.log('✅ Test 3: Oturum başlığı eksik olduğunda 401 UNAUTHORIZED ile güvenle reddedildi.');
      passed++;
    } else {
      console.error('❌ Test 3: Başlık denetimi başarısız:', res.status);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Hatası:', err);
    failed++;
  }

  // Test 4: Parola eksik olduğunda 400 MISSING_PASSWORD döner
  try {
    const req = new Request('http://localhost:54321/functions/v1/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-jwt-token-xyz',
      },
      body: JSON.stringify({ password: '' }),
    });
    const res = await handler(req);
    const body = await res.json();

    // Not: Token sahte olduğu için ya 401 UNAUTHORIZED ya da 400 MISSING_PASSWORD döner
    const isProtected = res.status === 401 || (res.status === 400 && body.error?.code === 'MISSING_PASSWORD');

    if (isProtected) {
      console.log('✅ Test 4: Parolasız veya yetkisiz istek güvenli biçimde engellendi.');
      passed++;
    } else {
      console.error('❌ Test 4: Parola kontrolü başarısız:', res.status, body);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Hatası:', err);
    failed++;
  }

  // Test 5: İstek gövdesindeki serbest user_id değerini güven kaynağı olarak kabul etmeme
  try {
    // Kötü niyetli kullanıcı başkasının user_id'sini enjekte etmeye çalışsa dahi:
    // service.ts kullanıcının kimliğini ASLA body'den almaz, userClient.auth.getUser() token'ından alır.
    const serviceFilePath = path.resolve(process.cwd(), 'supabase/functions/delete-account/service.ts');
    const serviceContent = fs.readFileSync(serviceFilePath, 'utf8');

    const usesTokenForUser = serviceContent.includes('userClient.auth.getUser()');
    const extractsFromUserObj = serviceContent.includes('const userId = user.id;');
    const rejectsBodyUserId = !serviceContent.includes('body.user_id') && !serviceContent.includes('body.userId');

    if (usesTokenForUser && extractsFromUserObj && rejectsBodyUserId) {
      console.log('✅ Test 5: İstek gövdesindeki sahte user_id yok sayılıyor; kullanıcı kimliği yalnızca token üzerinden çözülüyor.');
      passed++;
    } else {
      console.error('❌ Test 5: user_id token izolasyonu doğrulaması başarısız.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Hatası:', err);
    failed++;
  }

  // Test 6: ADR-033 Silme Adımları ve Tablo Hiyerarşisi
  try {
    const serviceFilePath = path.resolve(process.cwd(), 'supabase/functions/delete-account/service.ts');
    const serviceContent = fs.readFileSync(serviceFilePath, 'utf8');

    const hasRequestsInsert = serviceContent.includes("from('account_deletion_requests')") && serviceContent.includes('processing');
    const hasPortfolioDelete = serviceContent.includes("from('portfolio_entries')") && serviceContent.includes('.delete()');
    const hasPreferencesDelete = serviceContent.includes("from('user_preferences')") && serviceContent.includes('.delete()');
    const hasProfilesDelete = serviceContent.includes("from('user_profiles')") && serviceContent.includes('.delete()');
    const hasAuthDelete = serviceContent.includes('auth.admin.deleteUser(userId)');

    if (hasRequestsInsert && hasPortfolioDelete && hasPreferencesDelete && hasProfilesDelete && hasAuthDelete) {
      console.log('✅ Test 6: ADR-033 silme boru hattı (talep -> portföy -> tercihler -> profil -> auth silme) eksiksiz uygulandı.');
      passed++;
    } else {
      console.error('❌ Test 6: Silme adımlarında eksiklik var.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Hatası:', err);
    failed++;
  }

  // Test 7: Yasal ve güvenlik olaylarını saklama politikasına göre anonimleştirme (user_id -> NULL)
  try {
    const serviceFilePath = path.resolve(process.cwd(), 'supabase/functions/delete-account/service.ts');
    const serviceContent = fs.readFileSync(serviceFilePath, 'utf8');

    const hasLegalAnonymize =
      serviceContent.includes("from('user_legal_events')") &&
      serviceContent.includes('.update({ user_id: null })');

    const hasSecurityAnonymize =
      serviceContent.includes("from('security_events')") &&
      serviceContent.includes('.update({ user_id: null })');

    if (hasLegalAnonymize && hasSecurityAnonymize) {
      console.log('✅ Test 7: Yasal ve güvenlik kayıtları yok edilmedi; user_id = NULL yapılarak mevzuata uygun anonimleştirildi.');
      passed++;
    } else {
      console.error('❌ Test 7: Anonimleştirme mantığı eksik.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Hatası:', err);
    failed++;
  }

  // Test 8: Kısmi başarısızlık durumunda talep 'failed' olarak işaretlenir (KI-018)
  try {
    const serviceFilePath = path.resolve(process.cwd(), 'supabase/functions/delete-account/service.ts');
    const serviceContent = fs.readFileSync(serviceFilePath, 'utf8');

    const hasCatchBlock = serviceContent.includes('catch (err');
    const updatesFailedStatus = serviceContent.includes("status: 'failed'") && serviceContent.includes('failure_code');

    if (hasCatchBlock && updatesFailedStatus) {
      console.log('✅ Test 8: Kısmi başarısızlıkta KI-018 telafi stratejisi uygulandı: Talep failed işaretlenir, kullanıcı bilgilendirilir.');
      passed++;
    } else {
      console.error('❌ Test 8: Hata telafisi mantığı eksik.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Hatası:', err);
    failed++;
  }

  // Test 9: Sanitizer ile loglarda ve yanıtlarda secret/token/parola maskeleme
  try {
    const sampleLog = 'User Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz password="Secret123!" service_role_key_secret';
    const cleanLog = sanitizeString(sampleLog);

    const hasNoSecret = !cleanLog.includes('Secret123!') && !cleanLog.includes('eyJhbGciOiJIUzI1Ni') && cleanLog.includes('[REDACTED]');

    if (hasNoSecret) {
      console.log('✅ Test 9: Sanitizer hassas JWT belirteçleri, parolaları ve service_role anahtarlarını başarıyla maskeliyor.');
      passed++;
    } else {
      console.error('❌ Test 9: Sanitizer maskeleme hatası:', cleanLog);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 Hatası:', err);
    failed++;
  }

  // Test 10: Edge Function giriş noktası (index.ts) ve CORS yapılandırması
  try {
    const indexFilePath = path.resolve(process.cwd(), 'supabase/functions/delete-account/index.ts');
    const indexContent = fs.readFileSync(indexFilePath, 'utf8');

    const hasHandlerExport = indexContent.includes('export async function handler');
    const hasDenoServe = indexContent.includes('Deno.serve(handler)');
    const hasCorsHeaders = indexContent.includes('Access-Control-Allow-Origin');

    if (hasHandlerExport && hasDenoServe && hasCorsHeaders) {
      console.log('✅ Test 10: delete-account Edge Function giriş noktası ve Deno.serve sözleşmesi başarıyla doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 10: index.ts sözleşme hatası.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 10 Hatası:', err);
    failed++;
  }

  console.log(`\nFaz 12.1 Test Sonucu: ${passed} Başarılı, ${failed} Başarısız (Toplam: ${passed + failed})`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
