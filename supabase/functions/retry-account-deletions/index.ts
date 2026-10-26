import { createClient } from '@supabase/supabase-js';

// Deno çalışma ortamı için tip bildirimleri
declare const Deno: {
  serve(handler: (req: Request) => Promise<Response> | Response): void;
  env: { get(key: string): string | undefined };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing environment configuration' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const maxRetries = 5;
    const batchLimit = 10;

    // 1. Eşzamanlılık kilidi (FOR UPDATE SKIP LOCKED) ile işlenecek kayıtları rezerve et
    const { data: claimedRows, error: claimErr } = await adminClient.rpc(
      'claim_pending_auth_deletions',
      { p_limit: batchLimit, p_max_retries: maxRetries }
    );

    if (claimErr) {
      console.error('Kayıtlar rezerve edilemedi:', claimErr);
      return new Response(JSON.stringify({ error: claimErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const items = (claimedRows || []) as Array<{
      request_id: string;
      user_id: string;
      retry_count: number;
    }>;

    let processedCount = 0;
    let failedCount = 0;
    let exhaustedCount = 0;

    for (const item of items) {
      try {
        // 2. RESMİ SUPABASE ADMIN API İLE KULLANICIYI SİL (GoTrue Admin API)
        const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
          item.user_id
        );

        const authErrObj = authDeleteError as unknown as { status?: number; message?: string };
        const is404 =
          authDeleteError?.message?.toLowerCase().includes('not found') ||
          authErrObj?.status === 404;

        if (authDeleteError && !is404) {
          // Geçici hata durumu
          failedCount++;
          const newRetryCount = item.retry_count + 1;
          const isExhausted = newRetryCount >= maxRetries;

          if (isExhausted) {
            exhaustedCount++;
          }

          const rawMsg = authDeleteError.message || 'Auth delete error';
          const sanitizedMsg = rawMsg.slice(0, 450);

          await adminClient
            .from('account_deletion_requests')
            .update({
              retry_count: newRetryCount,
              status: isExhausted ? 'failed' : 'auth_deletion_pending',
              failure_code: isExhausted
                ? 'RETRY_LIMIT_EXCEEDED'
                : 'AUTH_DELETE_RETRY_PENDING',
              failure_message: isExhausted
                ? `Azami deneme sınırına (${maxRetries}) ulaşıldı: ${sanitizedMsg}`
                : `Deneme (${newRetryCount}/${maxRetries}) başarısız: ${sanitizedMsg}`,
            })
            .eq('id', item.request_id);
        } else {
          // Başarılı (veya kullanıcı zaten 404 ile silinmiş - idempotency)
          processedCount++;
          await adminClient
            .from('account_deletion_requests')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              user_id: null,
              failure_code: null,
              failure_message: null,
            })
            .eq('id', item.request_id);
        }
      } catch (rowErr: unknown) {
        failedCount++;
        const msg = rowErr instanceof Error ? rowErr.message : String(rowErr);
        await adminClient
          .from('account_deletion_requests')
          .update({
            retry_count: item.retry_count + 1,
            failure_message: `İstisna oluştu: ${msg.slice(0, 400)}`,
          })
          .eq('id', item.request_id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        claimed: items.length,
        processed: processedCount,
        failed: failedCount,
        exhausted: exhaustedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (globalErr: unknown) {
    const msg = globalErr instanceof Error ? globalErr.message : String(globalErr);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
