/**
 * Faz 7.1: Hesaplama Ekranı Mantığı ve Entegrasyon Testleri
 * supabase/tests/test-faz7-1-calculator-screen.ts
 */

// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

import {
  calculatePurchaseEstimate,
  calculateRedemptionEstimate,
} from '../../src/domain/calculations/valuation.ts';
import {
  parseQuantity,
  validateQuantity,
} from '../../src/domain/validation/quantityValidation.ts';
import { type GoldProduct, mapRowToGoldProduct } from '../../src/models/goldProduct.ts';
import { formatMoney } from '../../src/utils/formatters.ts';

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
  console.log('--- Faz 7.1: Hesaplama Ekranı Mantığı ve Entegrasyon Testleri ---\n');
  let passed = 0;
  const total = 9;

  // Mock Ürünler
  const gramProduct: GoldProduct = {
    id: 'p-gram',
    code: 'GRAM_GOLD',
    name: 'Gram Altın',
    shortName: 'Gram',
    category: 'gram',
    measurementUnit: 'gram',
    quantityPrecision: 2,
    packageWeightGrams: 1,
    portfolioEnabled: true,
    calculatorEnabled: true,
    priceDisplayEnabled: true,
    isActive: true,
    sortOrder: 10,
  };

  const quarterProduct: GoldProduct = {
    id: 'p-quarter',
    code: 'QUARTER_GOLD_NEW',
    name: 'Çeyrek Altın (Yeni)',
    shortName: 'Çeyrek',
    category: 'coin',
    measurementUnit: 'piece',
    quantityPrecision: 0,
    packageWeightGrams: null,
    portfolioEnabled: true,
    calculatorEnabled: true,
    priceDisplayEnabled: true,
    isActive: true,
    sortOrder: 20,
  };

  // Test 1: Miktar Ayrıştırma (Virgül ve Nokta Desteği)
  try {
    const val1 = parseQuantity('1,5');
    const val2 = parseQuantity('2.75');
    const val3 = parseQuantity(' 10 ');
    const valInvalid = parseQuantity('abc');

    if (val1 === 1.5 && val2 === 2.75 && val3 === 10 && valInvalid === null) {
      console.log('✓ Test 1 Passed: Türkçe virgül, nokta ve boşluk içeren miktarlar doğru ayrıştırıldı.');
      passed++;
    } else {
      console.error('✗ Test 1 Failed: parseQuantity hatalı:', { val1, val2, val3 });
    }
  } catch (err) {
    console.error('✗ Test 1 Error:', err);
  }

  // Test 2: Adetli Üründe Tam Sayı Doğrulaması (Kesirli Giriş Engeli)
  try {
    const validPiece = validateQuantity(2, quarterProduct.measurementUnit);
    const invalidPiece = validateQuantity(1.5, quarterProduct.measurementUnit);

    if (validPiece.isValid && !invalidPiece.isValid && invalidPiece.error) {
      console.log('✓ Test 2 Passed: Adetli üründe kesirli giriş başarıyla engellendi (tam sayı zorunlu).');
      passed++;
    } else {
      console.error('✗ Test 2 Failed: Adet doğrulaması hatalı.');
    }
  } catch (err) {
    console.error('✗ Test 2 Error:', err);
  }

  // Test 3: Gramlı Üründe Azami 3 Ondalık Doğrulaması
  try {
    const validGram = validateQuantity(1.375, gramProduct.measurementUnit);
    const invalidGram = validateQuantity(1.3755, gramProduct.measurementUnit);

    if (validGram.isValid && !invalidGram.isValid && invalidGram.error) {
      console.log('✓ Test 3 Passed: Gramlı üründe 3 basamaktan fazla ondalık giriş engellendi.');
      passed++;
    } else {
      console.error('✗ Test 3 Failed: Gram doğrulaması hatalı.');
    }
  } catch (err) {
    console.error('✗ Test 3 Error:', err);
  }

  // Test 4: Satın Alacağım Modunda Satış Fiyatı Kullanımı (ADR-011)
  try {
    const sellPriceMinor = 314000; // 3.140,00 TL
    const res = calculatePurchaseEstimate(2.5, sellPriceMinor);

    if (
      res.success &&
      res.estimatedTotalMinor === 785000 &&
      res.estimatedTotal === 7850 &&
      res.unitPriceMinor === sellPriceMinor
    ) {
      console.log('✓ Test 4 Passed: "Satın Alacağım" modu güncel satış fiyatını kullandı (2.5 gr × 3.140 TL = 7.850 TL).');
      passed++;
    } else {
      console.error('✗ Test 4 Failed: Satın alma hesabı hatalı:', res);
    }
  } catch (err) {
    console.error('✗ Test 4 Error:', err);
  }

  // Test 5: Bozduracağım Modunda Alış Fiyatı Kullanımı (ADR-011)
  try {
    const buyPriceMinor = 312050; // 3.120,50 TL
    const res = calculateRedemptionEstimate(2.5, buyPriceMinor);

    if (
      res.success &&
      res.estimatedTotalMinor === 780125 &&
      res.estimatedTotal === 7801.25 &&
      res.unitPriceMinor === buyPriceMinor
    ) {
      console.log('✓ Test 5 Passed: "Bozduracağım" modu güncel alış fiyatını kullandı (2.5 gr × 3.120,50 TL = 7.801,25 TL).');
      passed++;
    } else {
      console.error('✗ Test 5 Failed: Bozdurma hesabı hatalı:', res);
    }
  } catch (err) {
    console.error('✗ Test 5 Error:', err);
  }

  // Test 6: Fiyat Olmadığında Hesaplamayı Engelleme (ADR-013)
  try {
    const resNullBuy = calculatePurchaseEstimate(1, null);
    const resNullSell = calculateRedemptionEstimate(1, undefined);
    const resZero = calculatePurchaseEstimate(1, 0);

    if (
      !resNullBuy.success &&
      resNullBuy.estimatedTotalMinor === null &&
      !resNullSell.success &&
      !resZero.success
    ) {
      console.log('✓ Test 6 Passed: ADR-013 kuralı doğrulandı (Fiyat yokken hesaplama engellenir, asla 0 TL üretilmez).');
      passed++;
    } else {
      console.error('✗ Test 6 Failed: Fiyat yokken hesap engeli hatalı.');
    }
  } catch (err) {
    console.error('✗ Test 6 Error:', err);
  }

  // Test 7: Tahmini Toplam Para Formatlaması
  try {
    const formatted = formatMoney(785000, 'TRY');
    if (formatted === '7.850,00 TL') {
      console.log('✓ Test 7 Passed: Hesaplama sonucu para formatlayıcı ile doğru sunuldu (7.850,00 TL).');
      passed++;
    } else {
      console.error('✗ Test 7 Failed: Para formatı hatalı:', formatted);
    }
  } catch (err) {
    console.error('✗ Test 7 Error:', err);
  }

  // Test 8: Sıfır ve Negatif Miktar Kontrolü
  try {
    const zeroTest = validateQuantity(0, 'gram');
    const negTest = validateQuantity(-5, 'piece');

    if (!zeroTest.isValid && !negTest.isValid) {
      console.log('✓ Test 8 Passed: Sıfır ve negatif miktar girişleri başarıyla engellendi.');
      passed++;
    } else {
      console.error('✗ Test 8 Failed: Sıfır/negatif kontrolü hatalı.');
    }
  } catch (err) {
    console.error('✗ Test 8 Error:', err);
  }

  // Test 9: Canlı Supabase Veritabanından calculator_enabled Ürünlerinin Çekilmesi
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);

    const { data: dbProducts, error: prodErr } = await client
      .from('gold_products')
      .select('*')
      .eq('is_active', true)
      .eq('calculator_enabled', true)
      .order('sort_order', { ascending: true });

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      throw new Error(`Hesaplama ürünleri çekilemedi: ${prodErr?.message}`);
    }

    const calcProducts = dbProducts.map(mapRowToGoldProduct);
    const hasGram = calcProducts.some((p) => p.code === 'GRAM_GOLD');
    const hasQuarter = calcProducts.some((p) => p.code === 'QUARTER_GOLD_NEW');

    if (calcProducts.length >= 10 && hasGram && hasQuarter) {
      console.log(`✓ Test 9 Passed: Canlı veritabanından ${calcProducts.length} adet hesaplamaya açık ürün başarıyla çekildi ve doğrulandı.`);
      passed++;
    } else {
      console.error('✗ Test 9 Failed: Canlı ürün sayısı beklenenden az:', calcProducts.length);
    }
  } catch (err) {
    console.error('✗ Test 9 Error:', err);
  }

  console.log(`\n--- Test Sonucu: ${passed}/${total} Başarılı ---`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
