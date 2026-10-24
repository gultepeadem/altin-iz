/**
 * Altın İz — Kimlik Doğrulama Geri Dönüş Rotası (app/auth-callback.tsx)
 * 
 * Faz 5.4 Kapsamı:
 * - E-posta doğrulama ve şifre sıfırlama derin bağlantılarını (deep links) karşılar.
 * - PKCE (code) ve token parametrelerini çözümler.
 * - Süresi dolmuş (otp_expired) veya geçersiz bağlantılarda anlaşılır Türkçe hata sunar.
 * - Başarılı doğrulamada türüne göre tabs veya reset-password rotasına yönlendirir.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { legalService } from '@/services/legalService';
import { normalizeError } from '@/utils/normalizeError';

type CallbackStatus = 'processing' | 'success' | 'expired' | 'error';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{
    code?: string;
    access_token?: string;
    refresh_token?: string;
    type?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
  }>();

  const url = Linking.useURL();
  const { refreshProfile, setPasswordRecovery } = useAuth();

  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;

    const handleCallback = async () => {
      // 1. URL veya Parametrelerde Hata Kontrolü
      const errorCode = params.error_code || '';
      const errorDesc = params.error_description || params.error || '';

      if (errorCode || errorDesc) {
        if (
          errorCode === 'otp_expired' ||
          errorDesc.toLowerCase().includes('expired') ||
          errorDesc.toLowerCase().includes('invalid')
        ) {
          if (!isCancelled) {
            setStatus('expired');
            setErrorMessage(
              'Doğrulama bağlantısının süresi dolmuş veya bağlantı daha önce kullanılmış. Lütfen yeni bir bağlantı talep edin.'
            );
          }
          return;
        }

        if (!isCancelled) {
          setStatus('error');
          setErrorMessage('Kimlik doğrulama işlemi tamamlanamadı. Lütfen tekrar deneyin.');
        }
        return;
      }

      // 2. PKCE Kodu Varsa Çözümle
      let authCode = params.code;

      // URL hash içinde token kontrolü (Implicit flow fallback)
      let accessToken = params.access_token;
      let refreshToken = params.refresh_token;
      let callbackType = params.type;

      if (!authCode && !accessToken && url) {
        const parsed = Linking.parse(url);
        if (parsed.queryParams?.code) {
          authCode = String(parsed.queryParams.code);
        }
        if (parsed.queryParams?.type) {
          callbackType = String(parsed.queryParams.type);
        }

        // Hash parçası kontrolü (#access_token=...&refresh_token=...)
        if (url.includes('#')) {
          const hashString = url.split('#')[1] || '';
          const hashParams = new URLSearchParams(hashString);
          accessToken = hashParams.get('access_token') || undefined;
          refreshToken = hashParams.get('refresh_token') || undefined;
          if (hashParams.get('type')) {
            callbackType = hashParams.get('type') || undefined;
          }
          const hashErrorCode = hashParams.get('error_code');
          if (hashErrorCode === 'otp_expired') {
            if (!isCancelled) {
              setStatus('expired');
              setErrorMessage('Doğrulama bağlantısının süresi dolmuş. Lütfen yeni bir bağlantı talep edin.');
            }
            return;
          }
        }
      }

      try {
        if (authCode) {
          await authService.exchangeCodeForSession(authCode);
        } else if (accessToken && refreshToken) {
          await authService.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else {
          // Kod veya token yoksa mevcut oturumu kontrol et
          const currentSession = await authService.getSession();
          if (!currentSession) {
            // Kısa bir bekleme süresinden sonra oturum yoksa hata göster
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const recheck = await authService.getSession();
            if (!recheck && !isCancelled) {
              setStatus('error');
              setErrorMessage('Bağlantı doğrulanamadı veya süresi dolmuş.');
              return;
            }
          }
        }

        if (isCancelled) return;

        // Oturumu ve profili güncelle
        await refreshProfile();
        setStatus('success');

        // İlk doğrulanmış oturum açılışında kullanım koşulları kabulünü garanti altına al (KVKK md. 5/2-c)
        if (callbackType !== 'recovery') {
          try {
            const termsDoc = await legalService.getDocumentByType('terms_of_use');
            if (termsDoc) {
              await legalService.recordTermsAccepted({
                documentId: termsDoc.id,
                source: 'registration',
                appVersion: '1.0.0',
              });
            }
          } catch {
            // Sessizce geç; trigger ile yazıldıysa veya hata verirse akış kesilmez
          }
        }

        // Şifre sıfırlama (recovery) mi yoksa kayıt doğrulaması mı?
        if (callbackType === 'recovery') {
          setPasswordRecovery(true);
          router.replace('/(public)/reset-password');
        } else {
          router.replace('/(protected)/(tabs)');
        }
      } catch (err) {
        if (isCancelled) return;

        const appErr = normalizeError(err);
        if (appErr.code === 'AUTH_EXPIRED_ACTION') {
          setStatus('expired');
          setErrorMessage(appErr.userMessage);
        } else {
          setStatus('error');
          setErrorMessage(appErr.userMessage);
        }
      }
    };

    handleCallback();

    return () => {
      isCancelled = true;
    };
  }, [params, url, refreshProfile, setPasswordRecovery]);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        {status === 'processing' || status === 'success' ? (
          <LoadingState
            message={
              status === 'success'
                ? 'Doğrulama başarılı! Yönlendiriliyorsunuz...'
                : 'Oturum doğrulanıyor, lütfen bekleyin...'
            }
          />
        ) : null}

        {status === 'expired' ? (
          <View style={styles.resultContainer}>
            <ErrorState
              title="Bağlantı Süresi Dolmuş"
              message={errorMessage}
            />
            <PrimaryButton
              title="Yeni Doğrulama İste"
              onPress={() => router.replace('/(public)/verify-email')}
              style={styles.actionBtn}
            />
            <SecondaryButton
              title="Giriş Yap"
              onPress={() => router.replace('/(public)/sign-in')}
              style={styles.actionBtn}
            />
          </View>
        ) : null}

        {status === 'error' ? (
          <View style={styles.resultContainer}>
            <ErrorState
              title="Doğrulama Başarısız"
              message={errorMessage || 'İşlem gerçekleştirilemedi.'}
            />
            <PrimaryButton
              title="Giriş Ekranına Dön"
              onPress={() => router.replace('/(public)/sign-in')}
              style={styles.actionBtn}
            />
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    padding: 24,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
  },
  actionBtn: {
    width: '100%',
    marginTop: 12,
  },
});
