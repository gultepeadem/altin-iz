/**
 * Altın İz - Canlı Fiyatları Supabase'e Senkronize Eden Betik
 * Kullanım: node scripts/sync-live-prices.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hoqujzhcjeaudmkyqgpc.supabase.co',
  'sb_publishable_pzljVglpjdO2f9aK9CTw6w_IYvJZhDA'
);

async function syncPrices() {
  console.log('1. Canlı piyasa fiyatları kaynaktan çekiliyor...');
  const res = await fetch('https://finans.truncgil.com/today.json');
  const d = await res.json();

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

  const gramBuy = parsePrice(d['gram-altin']?.['Alış']) || 636000;
  const gramSell = parsePrice(d['gram-altin']?.['Satış']) || 636100;
  const gramChange = parseChange(d['gram-altin']?.['Değişim']) || 0;

  const mapping = [
    { code: 'GRAM_GOLD', key: 'gram-altin' },
    { code: 'QUARTER_GOLD_NEW', key: 'ceyrek-altin' },
    { code: 'QUARTER_GOLD_OLD', key: 'ceyrek-altin', discount: 0.985 },
    { code: 'HALF_GOLD_NEW', key: 'yarim-altin' },
    { code: 'HALF_GOLD_OLD', key: 'yarim-altin', discount: 0.985 },
    { code: 'FULL_GOLD_NEW', key: 'tam-altin' },
    { code: 'FULL_GOLD_OLD', key: 'tam-altin', discount: 0.985 },
    { code: 'REPUBLIC_GOLD', key: 'cumhuriyet-altini' },
    { code: 'ATA_GOLD_NEW', key: 'ata-altin' },
    { code: 'ATA_GOLD_OLD', key: 'ata-altin', discount: 0.985 },
    { code: 'GREMSE_GOLD_NEW', key: 'gremse-altin' },
    { code: 'GREMSE_GOLD_OLD', key: 'gremse-altin', discount: 0.985 },
    { code: 'RESAT_GOLD', key: 'resat-altin' },
    { code: 'HAMIT_GOLD', key: 'hamit-altin' },
    { code: 'GOLD_22K', key: '22-ayar-bilezik' },
    { code: 'GOLD_14K', key: '14-ayar-altin' },
    { code: 'GOLD_18K', key: '18-ayar-altin' },
    { code: 'PACKAGED_GOLD_1G', calcBuy: gramBuy, calcSell: Math.round(gramSell * 1.015), change: gramChange },
    { code: 'PACKAGED_GOLD_2_5G', calcBuy: Math.round(gramBuy * 2.5), calcSell: Math.round(gramSell * 2.5 * 1.012), change: gramChange },
    { code: 'PACKAGED_GOLD_5G', calcBuy: Math.round(gramBuy * 5), calcSell: Math.round(gramSell * 5 * 1.01), change: gramChange },
    { code: 'PACKAGED_GOLD_10G', calcBuy: Math.round(gramBuy * 10), calcSell: Math.round(gramSell * 10 * 1.008), change: gramChange },
    { code: 'PACKAGED_GOLD_20G', calcBuy: Math.round(gramBuy * 20), calcSell: Math.round(gramSell * 20 * 1.006), change: gramChange },
    { code: 'PACKAGED_GOLD_50G', calcBuy: Math.round(gramBuy * 50), calcSell: Math.round(gramSell * 50 * 1.005), change: gramChange },
    { code: 'PACKAGED_GOLD_100G', calcBuy: Math.round(gramBuy * 100), calcSell: Math.round(gramSell * 100 * 1.004), change: gramChange },
    { code: 'OUNCE_GOLD', calcBuy: 13500000, calcSell: 13520000, change: -1.16 }
  ];

  console.log('2. Supabase sync_gold_price RPC ile fiyatlar işleniyor...');
  let successCount = 0;

  for (const m of mapping) {
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
      const { error } = await supabase.rpc('sync_gold_price', {
        p_product_code: m.code,
        p_buy_price_minor: buy,
        p_sell_price_minor: sell,
        p_daily_change: change
      });

      if (!error) {
        successCount++;
      } else {
        console.error(`Hata [${m.code}]:`, error.message);
      }
    }
  }

  console.log(`Tamamlandı: ${successCount} / ${mapping.length} ürün fiyatı güncellendi.`);
}

syncPrices().catch(console.error);
