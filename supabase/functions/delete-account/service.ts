/**
 * Altın İz — delete-account Edge Function İş Mantığı Servisi
 * supabase/functions/delete-account/service.ts
 *
 * Referans: docs/DECISIONS.md ADR-033 & docs/DATA_RETENTION.md
 * Görev: docs/TODO.md Faz 12.1
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  type DeleteAccountRequestBody,
  type DeletionExecutionResult,
} from './types.ts';
import { safeLog, safeError } from './sanitizer.ts';

/**
 * Hesap silme boru hattını ADR-033 katı hiyerarşisine göre çalıştırır.
 */
export async function processAccountDeletion(params: {
  userClient: SupabaseClient;
  adminClient: SupabaseClient;
  userToken: string;
  body: DeleteAccountRequestBody;
}): Promise<DeletionExecutionResult> {
  const { userClient, adminClient, body } = params;

  // 1. Kullanıcıyı token üzerinden güvenle doğrula (Body içindeki serbest user_id ASLA güven kaynağı değildir)
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user || !user.email) {
    safeError('Kullanıcı token doğrulaması başarısız oldu.', userError);
    return {
      success: false,
      errorCode: 'UNAUTHORIZED',
      errorMessage: 'Geçersiz veya süresi dolmuş oturum. Lütfen yeniden giriş yapın.',
    };
  }

  const userId = user.id;
  const userEmail = user.email;

  safeLog('Hesap silme işlemi başlatıldı.', { userId });

  // 2. Yeniden kimlik doğrulama kontrolü (Şifre zorunludur)
  const password = body.password?.trim();
  if (!password) {
    return {
      success: false,
      errorCode: 'MISSING_PASSWORD',
      errorMessage: 'Hesabınızı silmek için mevcut parolanızı girmelisiniz.',
    };
  }

  // Parolayı Supabase Auth ile doğrula
  const { error: signInError } = await userClient.auth.signInWithPassword({
    email: userEmail,
    password,
  });

  if (signInError) {
    safeError('Yeniden kimlik doğrulama başarısız oldu.', signInError);
    return {
      success: false,
      errorCode: 'INVALID_CREDENTIALS',
      errorMessage: 'Girdiğiniz parola hatalı. Kimlik doğrulanamadığı için hesap silinemedi.',
    };
  }

  // 3. Silme talebi kaydı oluştur (Durum: 'processing')
  let deletionRequestId: string | undefined;
  const nowIso = new Date().toISOString();

  try {
    const { data: requestData, error: reqError } = await adminClient
      .from('account_deletion_requests')
      .insert({
        user_id: userId,
        status: 'processing',
        requested_at: nowIso,
        identity_verified_at: nowIso,
        processing_started_at: nowIso,
      })
      .select('id')
      .single();

    if (reqError) {
      safeError('Silme talebi kaydı oluşturulamadı.', reqError);
      return {
        success: false,
        errorCode: 'DELETION_FAILED',
        errorMessage: 'Silme talebi kaydı başlatılamadı. Lütfen tekrar deneyin.',
      };
    }

    deletionRequestId = requestData?.id;
  } catch (err) {
    safeError('Silme talebi tablosuna erişilemedi.', err);
    return {
      success: false,
      errorCode: 'DELETION_FAILED',
      errorMessage: 'Veritabanı silme talebi oluşturulamadı.',
    };
  }

  // 4. ADR-033 Silme Adımları (Tek bir atomik PostgreSQL Transaction RPC ile)
  try {
    const { data: deletionResult, error: rpcError } = await adminClient.rpc(
      'execute_account_deletion',
      {
        p_user_id: userId,
        p_request_id: deletionRequestId,
      }
    );

    if (rpcError) {
      throw new Error(`ATOMIC_DELETION_FAILED: ${rpcError.message}`);
    }

    safeLog('Veritabanı ilişkisel verileri atomik olarak silindi ve anonimleştirildi.', {
      userId,
      result: deletionResult,
    });

    // Adım G: Supabase Auth hesabını sil ve oturumları sonlandır (Model A)
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      const authErr = authDeleteError as { status?: number; message?: string };
      const isAlreadyDeleted =
        authDeleteError.message?.toLowerCase().includes('not found') ||
        authErr.status === 404;

      if (!isAlreadyDeleted) {
        safeError('Auth kullanıcısı silinirken hata oluştu; talep auth_deletion_pending durumuna alınıyor (Model A).', authDeleteError);

        if (deletionRequestId) {
          try {
            await adminClient
              .from('account_deletion_requests')
              .update({
                status: 'auth_deletion_pending',
                failure_code: 'AUTH_DELETE_RETRY_PENDING',
                failure_message: 'Auth silme işlemi telafi kuyruğuna devredildi.',
              })
              .eq('id', deletionRequestId);
          } catch (updateErr) {
            safeError('auth_deletion_pending durumu güncellenemedi.', updateErr);
          }
        }

        return {
          success: false,
          deletionRequestId,
          errorCode: 'AUTH_DELETION_PENDING',
          errorMessage: 'Verileriniz temizlendi, hesap kapatma işleminiz telafi kuyruğunda tamamlanıyor.',
        };
      } else {
        safeLog('Auth kullanıcısı zaten mevcut değil (önceden silinmiş).', { userId });
      }
    } else {
      safeLog('Supabase Auth hesabı başarıyla silindi.', { userId });
    }

    // Model A: Auth silme işlemi başarılı olduktan sonra talep 'completed' yapılır ve user_id sıfırlanır
    if (deletionRequestId) {
      try {
        await adminClient
          .from('account_deletion_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            user_id: null,
          })
          .eq('id', deletionRequestId);
      } catch (completeErr) {
        safeError('account_deletion_requests tamamlandı durumu kaydedilemedi.', completeErr);
      }
    }

    return {
      success: true,
      deletionRequestId,
    };
  } catch (err: unknown) {
    safeError('Hesap silme işlemi sırasında kısmi hata oluştu (KI-018 Telafi Stratejisi).', err);

    // Kısmi hata durumunda talebi 'failed' olarak işaretle
    if (deletionRequestId) {
      try {
        await adminClient
          .from('account_deletion_requests')
          .update({
            status: 'failed',
            failure_code: 'DELETION_EXECUTION_ERROR',
            failure_message: 'Hesap silme adımlarından birinde hata oluştu.',
          })
          .eq('id', deletionRequestId);
      } catch {
        // Hata kaydı güncellenemezse akışı engelleme
      }
    }

    return {
      success: false,
      deletionRequestId,
      errorCode: 'DELETION_FAILED',
      errorMessage: 'Hesabınız ve verileriniz silinirken teknik bir sorun oluştu. Lütfen tekrar deneyin.',
    };
  }
}
