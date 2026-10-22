/**
 * Altın İz — Faz 11 Yasal Belge Altyapısı ve Servis Testleri
 * supabase/tests/test-faz11-legal-service.ts
 *
 * Test Edilen Kapsam:
 * - [x] KVKK aydınlatma metnini hazırla (kvkk_notice).
 * - [x] Gizlilik politikasını hazırla (privacy_policy).
 * - [x] Kullanım koşullarını hazırla (terms_of_use).
 * - [x] Veri saklama ve silme metnini hazırla (data_retention).
 * - [x] Finansal bilgilendirme metnini hazırla (financial_disclaimer).
 * - [x] Ayrı açık rıza metnini hazırla (explicit_consent).
 * - [x] Belgeleri legal_documents tablosuna sürümlü ekle (Canlı veritabanı doğrulaması).
 * - [x] Her belge türünde tek aktif sürüm kuralını test et.
 * - [x] content_hash üretimini uygula (SHA-256 bütünlük kontrolü).
 * - [x] Aktif ve yürürlükteki belge sorgusunu oluştur.
 */

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

import {
  LEGAL_DOCUMENT_TYPES,
  LEGAL_DOCUMENT_TITLES,
  type LegalDocument,
  mapRowToLegalDocument,
  computeContentHash,
  isValidDocumentType,
  FALLBACK_LEGAL_DOCUMENTS,
} from '../../src/models/legal.ts';

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

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

async function runTests() {
  console.log('--- Faz 11: Yasal Belge Altyapısı ve Servis Testleri ---\n');
  let passed = 0;
  let failed = 0;

  // Test 1: 6 yasal belge türünün tanımları ve isValidDocumentType doğrulaması
  try {
    const isTypesValid =
      LEGAL_DOCUMENT_TYPES.length === 6 &&
      LEGAL_DOCUMENT_TYPES.includes('kvkk_notice') &&
      LEGAL_DOCUMENT_TYPES.includes('privacy_policy') &&
      LEGAL_DOCUMENT_TYPES.includes('terms_of_use') &&
      LEGAL_DOCUMENT_TYPES.includes('data_retention') &&
      LEGAL_DOCUMENT_TYPES.includes('financial_disclaimer') &&
      LEGAL_DOCUMENT_TYPES.includes('explicit_consent');

    const checkValid = isValidDocumentType('kvkk_notice');
    const checkInvalid = isValidDocumentType('invalid_legal_type');

    if (isTypesValid && checkValid && !checkInvalid) {
      console.log('✅ Test 1: Desteklenen 6 yasal belge türü ve doğrulayıcısı (isValidDocumentType) eksiksiz tanımlandı.');
      passed++;
    } else {
      console.error('❌ Test 1: Belge türleri doğrulaması hatalı:', LEGAL_DOCUMENT_TYPES);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Hatası:', err);
    failed++;
  }

  // Test 2: LEGAL_DOCUMENT_TITLES başlık eşlemesi
  try {
    const isTitlesValid =
      LEGAL_DOCUMENT_TITLES.kvkk_notice === 'KVKK Aydınlatma Metni' &&
      LEGAL_DOCUMENT_TITLES.privacy_policy === 'Gizlilik Politikası' &&
      LEGAL_DOCUMENT_TITLES.terms_of_use === 'Kullanım Koşulları' &&
      LEGAL_DOCUMENT_TITLES.data_retention === 'Veri Saklama ve İmha Politikası' &&
      LEGAL_DOCUMENT_TITLES.financial_disclaimer === 'Finansal Bilgilendirme ve Sorumluluk Reddi' &&
      LEGAL_DOCUMENT_TITLES.explicit_consent === 'Açık Rıza Metni';

    if (isTitlesValid) {
      console.log('✅ Test 2: Yasal belge Türkçe başlıkları (LEGAL_DOCUMENT_TITLES) eksiksiz doğrulandı.');
      passed++;
    } else {
      console.error('❌ Test 2: Başlık eşleme hatası:', LEGAL_DOCUMENT_TITLES);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Hatası:', err);
    failed++;
  }

  // Test 3: mapRowToLegalDocument satır eşleyicisi
  try {
    const mockRow = {
      id: 'doc-uuid-1234',
      document_type: 'kvkk_notice',
      version: '1.0',
      title: 'KVKK Aydınlatma Metni',
      content: 'Örnek KVKK metni içeriği...',
      content_hash: 'abc123hash',
      is_active: true,
      requires_action: false,
      published_at: '2026-10-22T10:00:00Z',
      effective_at: '2026-10-22T10:00:00Z',
      created_at: '2026-10-22T10:00:00Z',
      updated_at: '2026-10-22T10:00:00Z',
    };

    const mapped: LegalDocument = mapRowToLegalDocument(mockRow);

    if (
      mapped.id === 'doc-uuid-1234' &&
      mapped.documentType === 'kvkk_notice' &&
      mapped.version === '1.0' &&
      mapped.title === 'KVKK Aydınlatma Metni' &&
      mapped.content === 'Örnek KVKK metni içeriği...' &&
      mapped.contentHash === 'abc123hash' &&
      mapped.isActive === true &&
      mapped.requiresAction === false
    ) {
      console.log('✅ Test 3: mapRowToLegalDocument veritabanı satırını LegalDocument modeline hatasız dönüştürdü.');
      passed++;
    } else {
      console.error('❌ Test 3: Model eşleme hatası:', mapped);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Hatası:', err);
    failed++;
  }

  // Test 4: computeContentHash içerik özeti (SHA-256) üretimi
  try {
    const textA = 'Altın İz yasal metin içerik testi.';
    const textB = 'Altın İz yasal metin içerik testi.';
    const textC = 'Farklı bir metin içeriği.';

    const hashA = await computeContentHash(textA);
    const hashB = await computeContentHash(textB);
    const hashC = await computeContentHash(textC);

    const isDeterministic = hashA === hashB;
    const isDistinct = hashA !== hashC;
    const isValidLength = hashA.length === 64;

    if (isDeterministic && isDistinct && isValidLength) {
      console.log('✅ Test 4: computeContentHash deterministik ve 64 karakterli SHA-256 hash üretiyor.');
      passed++;
    } else {
      console.error('❌ Test 4: Hash üretimi hatası:', { hashA, hashB, hashC });
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Hatası:', err);
    failed++;
  }

  // Test 5: Belge bütünlüğü doğrulama mantığı
  try {
    const originalContent = 'Kullanım Koşulları asıl içerik metnidir.';
    const correctHash = await computeContentHash(originalContent);

    const verifiedOriginal = (await computeContentHash(originalContent)) === correctHash;
    const verifiedTampered = (await computeContentHash(originalContent + ' manipülasyon')) === correctHash;

    if (verifiedOriginal && !verifiedTampered) {
      console.log('✅ Test 5: Belge metin bütünlüğü (content_hash) başarıyla doğrulandı; manipülasyon tespit ediliyor.');
      passed++;
    } else {
      console.error('❌ Test 5: Bütünlük kontrolü hatası.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Hatası:', err);
    failed++;
  }

  // Test 6: Şablon yasal metinlerin eksiksizliği (FALLBACK_LEGAL_DOCUMENTS)
  try {
    const hasKvkk = Boolean(FALLBACK_LEGAL_DOCUMENTS.kvkk_notice?.content);
    const hasPrivacy = Boolean(FALLBACK_LEGAL_DOCUMENTS.privacy_policy?.content);
    const hasTerms = Boolean(FALLBACK_LEGAL_DOCUMENTS.terms_of_use?.content);
    const hasRetention = Boolean(FALLBACK_LEGAL_DOCUMENTS.data_retention?.content);
    const hasDisclaimer = Boolean(FALLBACK_LEGAL_DOCUMENTS.financial_disclaimer?.content);
    const hasConsent = Boolean(FALLBACK_LEGAL_DOCUMENTS.explicit_consent?.content);

    if (hasKvkk && hasPrivacy && hasTerms && hasRetention && hasDisclaimer && hasConsent) {
      console.log('✅ Test 6: 6 şablon yasal metin (KVKK, Gizlilik, Şartlar, Saklama/Silme, Finansal Uyarı, Açık Rıza) eksiksiz hazırlandı.');
      passed++;
    } else {
      console.error('❌ Test 6: Şablon metinlerde eksiklik var.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Hatası:', err);
    failed++;
  }

  // Test 7: Canlı Supabase legal_documents tablosundan aktif belgeleri okuma
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client
      .from('legal_documents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (!error && data && data.length >= 5) {
      console.log(`✅ Test 7: Canlı veritabanından ${data.length} adet aktif yasal belge başarıyla okundu.`);
      passed++;
    } else {
      console.error('❌ Test 7: Veritabanından belge okunamadı:', error, data?.length);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Hatası:', err);
    failed++;
  }

  // Test 8: Her belge türünde tek aktif sürüm kuralı
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client
      .from('legal_documents')
      .select('document_type, is_active')
      .eq('is_active', true);

    if (!error && data) {
      const typeCounts = new Map<string, number>();
      for (const row of data) {
        typeCounts.set(row.document_type, (typeCounts.get(row.document_type) || 0) + 1);
      }

      const allUnique = Array.from(typeCounts.values()).every((count) => count === 1);

      if (allUnique) {
        console.log('✅ Test 8: Her belge türü için aynı anda yalnızca TEK BİR aktif sürüm kuralı (docs/DATABASE.md Bölüm 10) doğrulandı.');
        passed++;
      } else {
        console.error('❌ Test 8: Aynı türde birden fazla aktif belge bulundu:', Array.from(typeCounts.entries()));
        failed++;
      }
    } else {
      console.error('❌ Test 8: Sorgu hatası:', error);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Hatası:', err);
    failed++;
  }

  // Test 9: İstemciden legal_documents değiştirilemezlik (Salt-Okunur RLS Kuralı)
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);

    // Anonim kullanıcı doğrudan yasal belge eklemeyi veya değiştirmeyi denerse RLS engellemeli
    const { error: insertError } = await client
      .from('legal_documents')
      .insert({
        document_type: 'terms_of_use',
        version: '99.9-hacker',
        title: 'Hileli Koşullar',
        content: 'Kötü amaçlı metin...',
        content_hash: 'invalid_hash',
        is_active: false,
        effective_at: new Date().toISOString(),
      });

    if (insertError) {
      console.log('✅ Test 9: legal_documents tablosuna istemciden doğrudan INSERT işlemi RLS tarafından engellendi (Salt-Okunur Güvenlik).');
      passed++;
    } else {
      console.error('❌ Test 9: Güvenlik açığı! İstemciden legal_documents tablosuna kayıt eklenebildi.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 Hatası:', err);
    failed++;
  }

  // Test 10: Kullanıcı yasal olay kayıt RPC fonksiyonu (record_user_legal_event) şeması
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);

    // Anonim kullanıcı doğrudan RPC çağırırsa 'Yetkisiz erişim: Oturum açmış kullanıcı bulunamadı' fırlatmalı
    const { error: rpcError } = await client.rpc('record_user_legal_event', {
      p_document_id: '00000000-0000-0000-0000-000000000000',
      p_event_type: 'viewed',
      p_source: 'settings',
      p_app_version: '1.0.0',
    });

    if (rpcError && rpcError.message.includes('Yetkisiz erişim')) {
      console.log('✅ Test 10: record_user_legal_event RPC fonksiyonu yetkisiz oturumsuz çağrıyı doğru şekilde engelledi.');
      passed++;
    } else {
      console.error('❌ Test 10: RPC yetkilendirme hatası beklenirken farklı sonuç alındı:', rpcError);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 10 Hatası:', err);
    failed++;
  }

  console.log('\n========================================');
  console.log(`Faz 11 Test Sonucu: ${passed}/${passed + failed} test geçti.`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
