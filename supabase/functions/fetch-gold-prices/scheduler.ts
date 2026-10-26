/**
 * Altın İz - Fiyat Zamanlayıcısı, Kilit ve Kota Yönetimi
 * supabase/functions/fetch-gold-prices/scheduler.ts
 */

import type {
  ConcurrencyCheckResult,
  DuplicateCheckResult,
  ManualTriggerOptions,
  ProductMappingInfo,
  QuotaCheckResult,
  ValidatedPriceRecord,
} from './types.ts';
import { getFetchPricesConfig, getSchedulerConfig } from './config.ts';
import { fetchGoldPricesFromProvider } from './fetcher.ts';
import { validateAndTransformPrices } from './validator.ts';
import { safeError, safeLog, safeWarn, sanitizeLog } from './sanitizer.ts';

import type { SupabaseClient } from '@supabase/supabase-js';

// Supabase istemcisi için genel arayüz
export type DatabaseClient = SupabaseClient;

/**
 * 1. Eşzamanlı Çalışma Koruması (Concurrency Lock)
 * Eğer aynı kaynak için devam eden ('running') bir çalıştırma varsa ve
 * zaman aşımı süresini (timeoutMinutes) aşmamışsa yeni işlemi engeller.
 * Aşmışsa eski işlemi 'stale' olarak işaretleyip kilidi çözer.
 */
export async function checkConcurrencyLock(
  client: DatabaseClient,
  sourceId: string,
  timeoutMinutes = 5
): Promise<ConcurrencyCheckResult> {
  try {
    const { data, error } = await client
      .from('price_fetch_runs')
      .select('id, started_at, status')
      .eq('source_id', sourceId)
      .eq('status', 'running')
      .order('started_at', { ascending: false })
      .limit(1);

    if (error) {
      safeWarn('Çakışma denetimi sorgusunda hata oluştu:', { error: String(error) });
      return { canRun: true, reason: 'NO_CONFLICT' };
    }

    if (!data || data.length === 0) {
      return { canRun: true, reason: 'NO_CONFLICT' };
    }

    const activeRun = data[0];
    const startedTime = new Date(activeRun.started_at).getTime();
    const elapsedMinutes = (Date.now() - startedTime) / (60 * 1000);

    if (elapsedMinutes < timeoutMinutes) {
      safeWarn(`Eşzamanlı fiyat çekme işlemi engellendi. Aktif Run ID: ${activeRun.id} (${elapsedMinutes.toFixed(1)} dk önce başladı).`);
      return {
        canRun: false,
        activeRunId: activeRun.id,
        reason: 'CONCURRENT_RUN_IN_PROGRESS',
      };
    }

    // Bayat kilit (Stale lock) temizleme
    safeWarn(`Önceki çalıştırma zaman aşımına uğramış (${elapsedMinutes.toFixed(1)} dk). Kilit temizleniyor. Run ID: ${activeRun.id}`);
    await client
      .from('price_fetch_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_code: 'STALE_LOCK_CLEARED',
        error_message: 'İşlem zaman aşımı eşiğini aştığı için sistem tarafından sonlandırıldı.',
      })
      .eq('id', activeRun.id);

    return {
      canRun: true,
      reason: 'STALE_LOCK_CLEARED',
    };
  } catch (err) {
    safeError('Kilit denetiminde beklenmeyen hata:', { error: String(err) });
    return { canRun: true, reason: 'NO_CONFLICT' };
  }
}

/**
 * 2. Ücretsiz Kota İzleme (Quota Tracking)
 * İçinde bulunulan ayın başından bu yana yapılan toplam istek sayısını kontrol eder.
 */
export async function checkQuotaUsage(
  client: DatabaseClient,
  sourceId: string,
  monthlyLimit = 500
): Promise<QuotaCheckResult> {
  try {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

    const { count, error } = await client
      .from('price_fetch_runs')
      .select('*', { count: 'exact', head: true })
      .eq('source_id', sourceId)
      .gte('started_at', monthStart);

    if (error) {
      safeWarn('Kota denetimi sorgusunda hata oluştu:', { error: String(error) });
      return {
        allowed: true,
        currentUsage: 0,
        limit: monthlyLimit,
        remaining: monthlyLimit,
      };
    }

    const currentUsage = count ?? 0;
    const remaining = Math.max(0, monthlyLimit - currentUsage);

    if (currentUsage >= monthlyLimit) {
      safeWarn(`Aylık fiyat API kotası (${monthlyLimit}) tükendi! Mevcut kullanım: ${currentUsage}`);
      return {
        allowed: false,
        currentUsage,
        limit: monthlyLimit,
        remaining: 0,
        warning: 'Aylık fiyat API kotası aşıldı. Dış istekler engellendi.',
      };
    }

    let warning: string | undefined;
    if (currentUsage >= monthlyLimit * 0.8) {
      warning = `Aylık fiyat API kotasının %80'inden fazlası kullanıldı (${currentUsage}/${monthlyLimit}).`;
      safeWarn(warning);
    }

    return {
      allowed: true,
      currentUsage,
      limit: monthlyLimit,
      remaining,
      warning,
    };
  } catch (err) {
    safeError('Kota denetiminde beklenmeyen hata:', { error: String(err) });
    return {
      allowed: true,
      currentUsage: 0,
      limit: monthlyLimit,
      remaining: monthlyLimit,
    };
  }
}

/**
 * 2.5. Sunucu Tarafı Fiyat Çekme Hız Sınırı (Cooldown Check)
 * Eğer veritabanındaki son başarılı fiyat çekme işlemi cooldownMinutes (varsayılan 5 dk)
 * içindeyse, dış API'ye gereksiz istek atılmasını engeller.
 */
export async function checkFetchCooldown(
  client: DatabaseClient,
  sourceId: string,
  cooldownMinutes = 5
): Promise<{ canRun: boolean; lastCompletedAt?: string; reason?: string }> {
  try {
    const { data, error } = await client
      .from('price_fetch_runs')
      .select('id, completed_at, status')
      .eq('source_id', sourceId)
      .eq('status', 'success')
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return { canRun: true };
    }

    const lastRun = data[0];
    if (!lastRun.completed_at) return { canRun: true };

    const lastCompleted = new Date(lastRun.completed_at).getTime();
    const elapsedMinutes = (Date.now() - lastCompleted) / (60 * 1000);

    if (elapsedMinutes < cooldownMinutes) {
      return {
        canRun: false,
        lastCompletedAt: lastRun.completed_at,
        reason: `Fiyatlar son ${cooldownMinutes} dakika içinde zaten güncellendi (${elapsedMinutes.toFixed(1)} dk önce). Sunucu tarafı hız sınırı (cooldown) nedeniyle yeni dış API isteği engellendi.`,
      };
    }

    return { canRun: true };
  } catch (err) {
    safeWarn('Cooldown denetiminde hata:', { error: String(err) });
    return { canRun: true };
  }
}

/**
 * 3. Değişmeyen Veri İçin Yinelenen Kayıt Önleme
 * Yeni gelen geçerli fiyatlar veritabanındaki en son fiyatlarla birebir aynı ise
 * gereksiz satır basımını önler.
 */
export async function isDuplicatePriceData(
  client: DatabaseClient,
  sourceId: string,
  newRecords: ValidatedPriceRecord[]
): Promise<DuplicateCheckResult> {
  if (newRecords.length === 0) {
    return { isDuplicate: false };
  }

  try {
    // Son kaydedilmiş geçerli fiyatları çek
    const { data: latestPrices, error } = await client
      .from('gold_prices')
      .select('product_id, buy_price_minor, sell_price_minor, source_price_at')
      .eq('source_id', sourceId)
      .eq('is_valid', true)
      .order('fetched_at', { ascending: false })
      .limit(newRecords.length * 2);

    if (error || !latestPrices || latestPrices.length === 0) {
      return { isDuplicate: false };
    }

    const latestMap = new Map<string, { product_id: string; buy_price_minor: number | null; sell_price_minor: number | null }>();
    for (const p of latestPrices) {
      if (!latestMap.has(p.product_id)) {
        latestMap.set(p.product_id, p);
      }
    }

    // Her yeni ürünün son kayıtla eşleşip eşleşmediğini kontrol et
    let allIdentical = true;
    for (const n of newRecords) {
      const prev = latestMap.get(n.product_id);
      if (!prev) {
        allIdentical = false;
        break;
      }
      if (
        prev.buy_price_minor !== n.buy_price_minor ||
        prev.sell_price_minor !== n.sell_price_minor
      ) {
        allIdentical = false;
        break;
      }
    }

    if (allIdentical) {
      return {
        isDuplicate: true,
        reason: 'Gelen fiyatlar veritabanındaki son geçerli fiyatlarla birebir aynı; gereksiz satır oluşturulmadı.',
      };
    }

    return { isDuplicate: false };
  } catch (err) {
    safeWarn('Yinelenen kayıt denetiminde hata:', { error: String(err) });
    return { isDuplicate: false };
  }
}

/**
 * 4. Yetkili Fiyat Çekme ve Zamanlayıcı Yürütücüsü (Orchestrator)
 * Manuel veya zamanlanmış tetiklemeyi yönetir; kilit, kota, çekim, doğrulama
 * ve veri tabanı kayıt adımlarını güvenle icra eder.
 */
export async function executePriceFetchRun(
  client: DatabaseClient,
  options: ManualTriggerOptions = {}
): Promise<{
  success: boolean;
  runId?: string;
  status: string;
  message: string;
  data?: unknown;
}> {
  const triggerType = options.triggerType ?? 'manual';
  const force = options.force ?? false;
  const fetchConfig = getFetchPricesConfig();
  const schedulerConfig = getSchedulerConfig();

  safeLog(`Fiyat çekme işlemi başlatılıyor [Tetikleyici: ${triggerType}, Force: ${force}]...`, {
    source: fetchConfig.sourceCode,
  }, fetchConfig.apiKey);

  // Kural: Zamanlanmış tetikleme isteniyorsa ve zamanlayıcı kapalıysa çalıştırma
  if (triggerType === 'scheduled' && !schedulerConfig.enabled && !force) {
    const msg = 'Otomatik zamanlayıcı development ortamında kapalıdır (ENABLE_PRICE_SCHEDULER=false).';
    safeLog(msg);
    return {
      success: false,
      status: 'disabled',
      message: msg,
    };
  }

  // Kaynak ID tespiti
  const { data: sourceData, error: sourceErr } = await client
    .from('price_sources')
    .select('id, code, is_active')
    .eq('code', fetchConfig.sourceCode)
    .single();

  if (sourceErr || !sourceData) {
    const msg = `Fiyat sağlayıcı tanımı bulunamadı (${fetchConfig.sourceCode}).`;
    safeError(msg, { error: String(sourceErr) });
    return { success: false, status: 'failed', message: msg };
  }

  const sourceId = sourceData.id;

  // 1. Çakışma denetimi (Concurrency check)
  if (!force) {
    const lockCheck = await checkConcurrencyLock(
      client,
      sourceId,
      schedulerConfig.concurrencyTimeoutMinutes
    );
    if (!lockCheck.canRun) {
      return {
        success: false,
        status: 'skipped',
        message: 'Devam eden başka bir fiyat çekme işlemi bulunuyor (Çakışma engellendi).',
      };
    }
  }

  // 2. Kota denetimi (Quota check)
  if (!force) {
    const quotaCheck = await checkQuotaUsage(
      client,
      sourceId,
      schedulerConfig.quotaMonthlyLimit
    );
    if (!quotaCheck.allowed) {
      return {
        success: false,
        status: 'quota_exceeded',
        message: quotaCheck.warning ?? 'Aylık API kotası aşıldı.',
      };
    }
  }

  // 2.5. Hız sınırı (Cooldown denetimi)
  if (!force) {
    const cooldownCheck = await checkFetchCooldown(
      client,
      sourceId,
      schedulerConfig.cooldownMinutes ?? 5
    );
    if (!cooldownCheck.canRun) {
      safeLog(cooldownCheck.reason ?? 'Cooldown aktif, dış istek engellendi.');
      return {
        success: true,
        status: 'cooldown_active',
        message: cooldownCheck.reason ?? 'Fiyatlar yakın zamanda güncellendi.',
        data: {
          cooldownActive: true,
          lastCompletedAt: cooldownCheck.lastCompletedAt,
        },
      };
    }
  }

  // 3. Çalıştırma kaydı oluştur (price_fetch_runs: running)
  const startedAt = new Date().toISOString();
  const { data: runData, error: runErr } = await client
    .from('price_fetch_runs')
    .insert({
      source_id: sourceId,
      started_at: startedAt,
      status: 'running',
      products_received: 0,
      products_saved: 0,
      products_rejected: 0,
    })
    .select('id')
    .single();

  if (runErr || !runData) {
    const msg = 'price_fetch_runs kaydı başlatılamadı.';
    safeError(msg, { message: runErr?.message, code: runErr?.code });
    return { success: false, status: 'failed', message: msg };
  }

  const runId = runData.id;

  try {
    // 4. Sağlayıcıdan veri çek
    const fetchResult = await fetchGoldPricesFromProvider(fetchConfig);

    // 5. Aktif eşleştirmeleri çek
    const { data: mappingsData, error: mappingsErr } = await client
      .from('price_source_product_mappings')
      .select('id, source_id, product_id, external_symbol, external_name, is_active, product:gold_products(id, code, name, measurement_unit, is_active)')
      .eq('source_id', sourceId);

    if (mappingsErr || !mappingsData) {
      throw new Error(`Eşleştirme listesi veritabanından çekilemedi: ${mappingsErr?.message}`);
    }

    // 6. Fiyatları doğrula ve dönüştür
    const validation = validateAndTransformPrices(
      fetchResult.rawData,
      sourceId,
      mappingsData as unknown as ProductMappingInfo[],
      fetchResult.fetchedAt,
      runId
    );

    // 7. Yinelenen kayıt denetimi (Duplicate check)
    if (
      schedulerConfig.skipIdenticalPrices &&
      !force &&
      validation.validRecords.length > 0
    ) {
      const dupCheck = await isDuplicatePriceData(client, sourceId, validation.validRecords);
      if (dupCheck.isDuplicate) {
        safeLog(dupCheck.reason ?? 'Yinelenen fiyatlar atlandı.');
        const nowIso = new Date().toISOString();
        try {
          const productIds = validation.validRecords.map((r) => r.product_id);
          await client
            .from('gold_prices')
            .update({ fetched_at: nowIso })
            .in('product_id', productIds)
            .eq('source_id', sourceId)
            .eq('is_valid', true);
        } catch {
          // Güncelleme başarısız olsa da çalıştırma başarılı sayılır
        }

        await client
          .from('price_fetch_runs')
          .update({
            status: 'success',
            completed_at: nowIso,
            products_received: validation.productsReceived,
            products_saved: 0,
            products_rejected: 0,
            error_message: dupCheck.reason,
          })
          .eq('id', runId);

        return {
          success: true,
          runId,
          status: 'success',
          message: dupCheck.reason ?? 'Fiyatlar değişmediği için yeni satır eklenmedi.',
          data: { skippedDuplicate: true, validation },
        };
      }
    }

    // 8. Fiyatları veritabanına ekle (gold_prices - chk_at_least_one_price kısıtına uygun kayıtlar)
    const recordsToInsert = validation.allRecords.filter(
      (r) => r.buy_price_minor !== null || r.sell_price_minor !== null
    );

    if (recordsToInsert.length > 0) {
      const { error: insertErr } = await client
        .from('gold_prices')
        .insert(recordsToInsert);

      if (insertErr) {
        throw new Error(`gold_prices tablosuna ekleme başarısız oldu: ${insertErr.message}`);
      }
    }

    // 9. price_fetch_runs kaydını tamamla
    const completedAt = new Date().toISOString();
    await client
      .from('price_fetch_runs')
      .update({
        status: validation.status,
        completed_at: completedAt,
        products_received: validation.productsReceived,
        products_saved: validation.productsSaved,
        products_rejected: validation.productsRejected,
        error_code: validation.errorCode,
        error_message: validation.errorMessage,
      })
      .eq('id', runId);

    safeLog(`Fiyat çekme işlemi tamamlandı [Durum: ${validation.status}, Kaydedilen: ${validation.productsSaved}, Reddedilen: ${validation.productsRejected}].`);

    return {
      success: validation.status !== 'failed',
      runId,
      status: validation.status,
      message: `Fiyat işlemi tamamlandı (${validation.status}).`,
      data: validation,
    };
  } catch (err: unknown) {
    const errObj = err as { message?: string; code?: string };
    const rawMsg = errObj?.message || 'Bilinmeyen sistem hatası';
    const sanitizedMsg = sanitizeLog(rawMsg, fetchConfig.apiKey);

    safeError('Fiyat çalıştırma sürecinde hata oluştu:', { message: sanitizedMsg });

    // Hata kaydını güvenli teknik log olarak price_fetch_runs içine yaz
    await client
      .from('price_fetch_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_code: errObj?.code || 'EXECUTION_FAILED',
        error_message: sanitizedMsg,
      })
      .eq('id', runId);

    return {
      success: false,
      runId,
      status: 'failed',
      message: sanitizedMsg,
    };
  }
}
