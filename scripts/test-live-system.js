/**
 * Altın İz — Canlı Sistem ve Backend Uçtan Uca Doğrulama Betiği
 * 
 * Bu script statik metin araması yapmaz; uzak Supabase projesi (altin-iz-dev)
 * ve canlı Edge Function'lar ile gerçek ağ istekleri (HTTP/REST) üzerinden konuşarak
 * tüm V1 iş, portföy, yasal ve güvenlik kurallarını doğrular.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hoqujzhcjeaudmkyqgpc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pzljVglpjdO2f9aK9CTw6w_IYvJZhDA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runLiveSystemTest() {
  console.log('====================================================');
  console.log('🚀 ALTIN İZ — CANLI SİSTEM UÇTAN UCA DOĞRULAMA TESTİ');
  console.log('Uzak Sunucu:', SUPABASE_URL);
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [BAŞARILI] ${testName}`);
      if (details) console.log(`   ℹ️ ${details}`);
    } else {
      console.error(`❌ [BAŞARISIZ] ${testName}`);
      if (details) console.error(`   ⚠️ Hata: ${details}`);
    }
  }

  // 1. TEST: Fiyat Yazma Güvenliği (İstemciden sync_gold_price RPC engeli)
  console.log('--- 1. Güvenlik ve RLS Testleri ---');
  const rpcAttempt = await supabase.rpc('sync_gold_price', {
    p_product_code: 'GRAM_GOLD',
    p_buy_price_minor: 100,
    p_sell_price_minor: 200,
  });
  assert(
    rpcAttempt.error && (rpcAttempt.error.code === '42501' || rpcAttempt.status === 401),
    'İstemciden doğrudan sync_gold_price RPC çağrısı engellendi (SECURITY.md 8.6)',
    rpcAttempt.error?.message || 'Yetki kontrolü başarılı'
  );

  // 2. TEST: Canlı Edge Function ile Fiyat Çekme ve Veritabanı Kaydı
  console.log('\n--- 2. Edge Function (fetch-gold-prices) Testi ---');
  const fetchRes = await supabase.functions.invoke('fetch-gold-prices', {
    body: { force: true },
  });
  const fetchSuccess = fetchRes.data && fetchRes.data.success === true;
  assert(
    fetchSuccess,
    'fetch-gold-prices Edge Function canlı piyasa verilerini çekip kaydetti',
    `Kaydedilen ürün sayısı: ${fetchRes.data?.data?.productsSaved ?? 0}, Run ID: ${fetchRes.data?.runId ?? 'yok'}`
  );

  // 3. TEST: Veritabanında Geçerli Fiyatların Okunması (RLS: is_valid = true)
  console.log('\n--- 3. Veritabanı Fiyat Okuma Testi ---');
  const { data: prices, error: pricesErr } = await supabase
    .from('gold_prices')
    .select('product_id, buy_price_minor, sell_price_minor, is_valid, fetched_at')
    .eq('is_valid', true)
    .order('fetched_at', { ascending: false })
    .limit(25);

  assert(
    !pricesErr && prices && prices.length >= 20,
    'Tüm altın ürünleri için geçerli canlı fiyatlar veritabanından okundu',
    `Okunan güncel fiyat kaydı sayısı: ${prices?.length ?? 0}`
  );

  if (prices && prices.length > 0) {
    const sample = prices[0];
    const buyTL = (sample.buy_price_minor / 100).toFixed(2);
    const sellTL = (sample.sell_price_minor / 100).toFixed(2);
    console.log(`   📊 Örnek Canlı Fiyat -> Alış: ${buyTL} TL | Satış: ${sellTL} TL | Zaman: ${sample.fetched_at}`);
  }

  // 4. TEST: Auth & Oturum Akışı (Gerçek Test Kullanıcısı user_a@test.com)
  console.log('\n--- 4. Auth & Oturum Akışı Testi ---');
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'user_a@test.com',
    password: 'TestPassword123!',
  });

  const userId = signInData?.user?.id;
  const userToken = signInData?.session?.access_token;

  assert(
    !signInErr && userId && userToken,
    'Kullanıcı oturumu başarıyla açıldı ve JWT access_token alındı',
    `User ID: ${userId}, Token boyutu: ${userToken?.length} karakter`
  );

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${userToken}` } },
  });

  // 5. TEST: Portföy CRUD ve Sayısal Doğruluk
  console.log('\n--- 5. Portföy CRUD ve Değerleme Testi ---');
  const { data: prodData } = await supabase
    .from('gold_products')
    .select('id, code, name')
    .eq('code', 'GRAM_GOLD')
    .single();

  const gramProductId = prodData?.id;

  // Önceki test kalıntılarını temizle
  await authClient.from('portfolio_entries').delete().eq('user_id', userId);

  // 1 Gram Altın alış kaydı ekle (Ödenen: 5.500,00 TL = 550000 kuruş)
  const { data: entryData, error: entryErr } = await authClient
    .from('portfolio_entries')
    .insert({
      user_id: userId,
      product_id: gramProductId,
      quantity: 1.0,
      total_cost_minor: 550000,
      purchase_date: '2026-10-24',
    })
    .select('id, quantity, total_cost_minor, purchase_date')
    .single();

  assert(
    !entryErr && entryData?.id,
    'Kullanıcı kendi portföyüne altın alış kaydı ekledi',
    `Entry ID: ${entryData?.id}, Alış Tutarı: ${(entryData?.total_cost_minor / 100).toFixed(2)} TL`
  );

  // Portföy listeleme ve kâr/zarar doğrulaması
  const { data: userEntries, error: listErr } = await authClient
    .from('portfolio_entries')
    .select('id, quantity, total_cost_minor, product_id')
    .eq('user_id', userId);

  assert(
    !listErr && userEntries && userEntries.length === 1,
    'Kullanıcı portföy listesini başarıyla çekti',
    `Listelenen varlık adedi: ${userEntries?.length}`
  );

  // Kayıt düzenleme (Alış tutarını 5.600,00 TL olarak güncelle)
  if (entryData?.id) {
    const { data: updateData, error: updateErr } = await authClient
      .from('portfolio_entries')
      .update({ total_cost_minor: 560000 })
      .eq('id', entryData.id)
      .select('total_cost_minor')
      .single();

    assert(
      !updateErr && updateData?.total_cost_minor === 560000,
      'Portföy kaydı düzenlendi ve doğrulandı',
      `Yeni maliyet: ${(updateData?.total_cost_minor / 100).toFixed(2)} TL`
    );

    // Kayıt silme
    const { error: delErr } = await authClient
      .from('portfolio_entries')
      .delete()
      .eq('id', entryData.id);

    assert(!delErr, 'Portföy kaydı başarıyla silindi');
  }

  // 6. TEST: Çok Kullanıcılı RLS İzolasyonu (User A ve User B)
  console.log('\n--- 6. Çok Kullanıcılı RLS İzolasyon Testi ---');
  const { data: signInB } = await supabase.auth.signInWithPassword({
    email: 'user_b@test.com',
    password: 'TestPassword123!',
  });

  const authClientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${signInB?.session?.access_token}` } },
  });

  // User B kendi portföyüne kayıt eklesin
  const { data: entryB } = await authClientB
    .from('portfolio_entries')
    .insert({
      user_id: signInB.user.id,
      product_id: gramProductId,
      quantity: 2.0,
      total_cost_minor: 1100000,
      purchase_date: '2026-10-24',
    })
    .select('id')
    .single();

  // User A, User B'nin kaydını okumayı denesin
  const { data: crossRead } = await authClient
    .from('portfolio_entries')
    .select('id')
    .eq('id', entryB.id);

  assert(
    !crossRead || crossRead.length === 0,
    'RLS İzolasyonu: User A, User B\'nin portföy kaydına ERİŞEMEZ (Salt-okuma koruması)',
    'Çapraz okuma engellendi'
  );

  // User A, User B'nin kaydını silmeyi denesin
  const { data: crossDel } = await authClient
    .from('portfolio_entries')
    .delete()
    .eq('id', entryB.id)
    .select();

  assert(
    !crossDel || crossDel.length === 0,
    'RLS İzolasyonu: User A, User B\'nin portföy kaydını SİLEMEZ (Yazma koruması)',
    'Çapraz silme engellendi'
  );

  // User B temizliği
  await authClientB.from('portfolio_entries').delete().eq('user_id', signInB.user.id);

  // 7. TEST: Yasal Olay Kaydı (record_user_legal_event RPC)
  console.log('\n--- 7. Yasal Olay (Audit Log) Testi ---');
  const { data: legalDoc } = await supabase
    .from('legal_documents')
    .select('id, document_type, version')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (legalDoc?.id) {
    const { data: eventId, error: eventErr } = await authClient.rpc('record_user_legal_event', {
      p_document_id: legalDoc.id,
      p_event_type: 'accepted',
      p_source: 'settings',
    });

    assert(
      !eventErr && eventId,
      'Kullanıcı yasal olay kaydı (KVKK/Kullanım Koşulları onayı) başarıyla işlendi',
      `Event ID: ${eventId}, Belge: ${legalDoc.document_type} (v${legalDoc.version})`
    );
  }

  // 8. TEST: delete-account Edge Function Yanıt Doğrulaması
  console.log('\n--- 8. Hesap Silme Edge Function (delete-account) Testi ---');
  // Hatalı şifre denemesi (ADR-033: Parola yanlışsa silme engellenmeli)
  const wrongPassRes = await supabase.functions.invoke('delete-account', {
    headers: { Authorization: `Bearer ${userToken}` },
    body: { password: 'WrongPassword999!' },
  });

  const isRejected =
    (wrongPassRes.error && wrongPassRes.error.context?.status === 401) ||
    (wrongPassRes.data && wrongPassRes.data.success === false);

  assert(
    isRejected,
    'delete-account Edge Function hatalı parola denemesini başarıyla reddetti (HTTP 401 INVALID_CREDENTIALS - ADR-033)',
    'Hatalı parola koruması aktif'
  );

  console.log('\n====================================================');
  console.log(`🏁 CANLI SİSTEM TEST SONUCU: ${passedTests} / ${totalTests} TEST BAŞARIYLA GEÇTİ!`);
  console.log('====================================================\n');
}

runLiveSystemTest().catch((err) => {
  console.error('Kritik test çalıştırma hatası:', err);
  process.exit(1);
});
