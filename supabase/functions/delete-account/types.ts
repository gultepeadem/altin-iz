/**
 * Altın İz — delete-account Edge Function Tür Tanımları
 * supabase/functions/delete-account/types.ts
 */

export type DeleteAccountErrorCode =
  | 'UNAUTHORIZED'
  | 'MISSING_PASSWORD'
  | 'INVALID_CREDENTIALS'
  | 'DELETION_FAILED'
  | 'CONFIG_ERROR'
  | 'AUTH_DELETION_PENDING';

export interface DeleteAccountRequestBody {
  /** Kullanıcının yeniden kimlik doğrulama parolası */
  password?: string;
  /** İsteğe bağlı hesap silme gerekçesi */
  reason?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deletionRequestId?: string;
  error?: {
    code: DeleteAccountErrorCode;
    message: string;
  };
}

export interface DeletionExecutionResult {
  success: boolean;
  deletionRequestId?: string;
  errorCode?: DeleteAccountErrorCode;
  errorMessage?: string;
}
