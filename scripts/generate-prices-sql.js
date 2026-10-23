const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hoqujzhcjeaudmkyqgpc.supabase.co',
  'sb_publishable_pzljVglpjdO2f9aK9CTw6w_IYvJZhDA'
);

async function generateSeed() {
  const r = await fetch('https://finans.truncgil.com/today.json');
  const d = await r.json();

  function parsePrice(str) {
    if (!str) return null;
    const clean = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? null : Math.round(num * 100);
  }

  function parseChange(str) {
    if (!str) return null;
    const clean = str.replace('%', '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }

  const { data: products } = await supabase.from('gold_products').select('id, code, name');
  const { data: sources } = await supabase.from('price_sources').select('id, code');
  const sourceId = sources[0].id;

  const productMap = new Map();
  products.forEach((p) => productMap.set(p.code, p.id));

  const gramBuy = parsePrice(d['gram-altin']?.['Alış']) || 636000;
  const gramSell = parsePrice(d['gram-altin']?.['Satış']) || 636100;
  const gramChange = parseChange(d['gram-altin']?.['Değişim']) || 0;

  const mapping = [
    { code: 'GRAM_GOLD', key: 'gram-altin', unit: 'gram' },
    { code: 'QUARTER_GOLD_NEW', key: 'ceyrek-altin', unit: 'piece' },
    { code: 'QUARTER_GOLD_OLD', key: 'ceyrek-altin', unit: 'piece', discount: 0.985 },
    { code: 'HALF_GOLD_NEW', key: 'yarim-altin', unit: 'piece' },
    { code: 'HALF_GOLD_OLD', key: 'yarim-altin', unit: 'piece', discount: 0.985 },
    { code: 'FULL_GOLD_NEW', key: 'tam-altin', unit: 'piece' },
    { code: 'FULL_GOLD_OLD', key: 'tam-altin', unit: 'piece', discount: 0.985 },
    { code: 'REPUBLIC_GOLD', key: 'cumhuriyet-altini', unit: 'piece' },
    { code: 'ATA_GOLD_NEW', key: 'ata-altin', unit: 'piece' },
    { code: 'ATA_GOLD_OLD', key: 'ata-altin', unit: 'piece', discount: 0.985 },
    { code: 'GREMSE_GOLD_NEW', key: 'gremse-altin', unit: 'piece' },
    { code: 'GREMSE_GOLD_OLD', key: 'gremse-altin', unit: 'piece', discount: 0.985 },
    { code: 'RESAT_GOLD', key: 'resat-altin', unit: 'piece' },
    { code: 'HAMIT_GOLD', key: 'hamit-altin', unit: 'piece' },
    { code: 'GOLD_22K', key: '22-ayar-bilezik', unit: 'gram' },
    { code: 'GOLD_14K', key: '14-ayar-altin', unit: 'gram' },
    { code: 'GOLD_18K', key: '18-ayar-altin', unit: 'gram' },
    // Paketli külçeler
    { code: 'PACKAGED_GOLD_1G', calcBuy: gramBuy, calcSell: Math.round(gramSell * 1.015), unit: 'gram', change: gramChange },
    { code: 'PACKAGED_GOLD_2_5G', calcBuy: Math.round(gramBuy * 2.5), calcSell: Math.round(gramSell * 2.5 * 1.012), unit: 'gram', change: gramChange },
    { code: 'PACKAGED_GOLD_5G', calcBuy: Math.round(gramBuy * 5), calcSell: Math.round(gramSell * 5 * 1.01), unit: 'gram', change: gramChange },
    { code: 'PACKAGED_GOLD_10G', calcBuy: Math.round(gramBuy * 10), calcSell: Math.round(gramSell * 10 * 1.008), unit: 'gram', change: gramChange },
    { code: 'PACKAGED_GOLD_20G', calcBuy: Math.round(gramBuy * 20), calcSell: Math.round(gramSell * 20 * 1.006), unit: 'gram', change: gramChange },
    { code: 'PACKAGED_GOLD_50G', calcBuy: Math.round(gramBuy * 50), calcSell: Math.round(gramSell * 50 * 1.005), unit: 'gram', change: gramChange },
    { code: 'PACKAGED_GOLD_100G', calcBuy: Math.round(gramBuy * 100), calcSell: Math.round(gramSell * 100 * 1.004), unit: 'gram', change: gramChange },
    { code: 'OUNCE_GOLD', calcBuy: 13500000, calcSell: 13520000, unit: 'ounce', change: -1.16 }
  ];

  let sql = '-- Altın İz Canlı Fiyat Tohumlama Scripti\n-- Oluşturulma: ' + new Date().toISOString() + '\n\n';
  sql += 'INSERT INTO public.gold_prices (\n';
  sql += '  product_id, source_id, buy_price_minor, sell_price_minor,\n';
  sql += '  currency_code, price_unit, daily_change_percent,\n';
  sql += '  source_price_at, fetched_at, is_valid\n';
  sql += ') VALUES\n';

  const rows = [];
  for (const m of mapping) {
    const prodId = productMap.get(m.code);
    if (!prodId) continue;

    let buy, sell, change;
    if (m.key) {
      const raw = d[m.key];
      buy = parsePrice(raw?.['Alış']);
      sell = parsePrice(raw?.['Satış']);
      change = parseChange(raw?.['Değişim']) ?? 0;
      if (m.discount) {
        buy = Math.round(buy * m.discount);
        sell = Math.round(sell * m.discount);
      }
    } else {
      buy = m.calcBuy;
      sell = m.calcSell;
      change = m.change;
    }

    if (buy && sell) {
      rows.push(`  ('${prodId}', '${sourceId}', ${buy}, ${sell}, 'TRY', '${m.unit}', ${change}, NOW(), NOW(), true)`);
    }
  }

  sql += rows.join(',\n') + ';\n';
  fs.writeFileSync('supabase/seed_live_prices.sql', sql, 'utf-8');
  console.log('Successfully generated supabase/seed_live_prices.sql with', rows.length, 'prices');
}

generateSeed().catch(console.error);
