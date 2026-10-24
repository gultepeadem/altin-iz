/**
 * Altın İz — Yeni Şifre Belirleme Ekranı (app/(public)/reset-password.tsx)
 * 
 * Faz 5.6 Kapsamı:
 * - Yeni şifre ve şifre tekrarı alanları
 * - Şifre politikasının gösterilmesi (en az 6 karakter)
 * - Süresi dolmuş / geçersiz oturum bağlantılarının yönetimi
 * - Şifre güncelleme (authService.updatePassword)
 * - Başarı sonrası güvenli biçimde giriş ekranına yönlendirme
 */

import React, { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { PasswordField } from '@/components/forms/PasswordField';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { normalizeError } from '@/utils/normalizeError';

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const { setPasswordRecovery } = useAuth();

  // Oturum kontrolü durumu
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Form alanları
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Hata durumları
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Gönderim ve başarı durumları
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Ekran açıldığında geçerli bir kurtarma oturumu var mı kontrol et
  useEffect(() => {
    let isMounted = true;

    const checkRecoverySession = async () => {
      try {
        const session = await authService.getSession();
        if (!isMounted) return;

        if (!session) {
          setIsSessionExpired(true);
        }
      } catch {
        if (isMounted) {
          setIsSessionExpired(true);
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * İstemci form doğrulaması
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // 1. Yeni şifre kontrolü
    if (!newPassword) {
      setPasswordError('Lütfen yeni bir şifre girin.');
      isValid = false;
    } else if (newPassword.length < 6) {
      setPasswordError('Şifreniz en az 6 karakter uzunluğunda olmalıdır.');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    // 2. Şifre tekrar kontrolü
    if (!confirmPassword) {
      setConfirmError('Lütfen yeni şifrenizi tekrar girin.');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('Girdiğiniz yeni şifreler eşleşmiyor.');
      isValid = false;
    } else {
      setConfirmError(null);
    }

    return isValid;
  };

  /**
   * Şifreyi güncelleme işlemi
   */
  const handleUpdatePassword = async () => {
    if (isSubmitting) return;

    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.updatePassword(newPassword);
      setPasswordRecovery(false);

      // Başarılı güncelleme: Eski oturumu temizle ve kullanıcıyı bilgilendir
      await authService.signOut();
      setIsSuccess(true);
    } catch (err) {
      const appErr = normalizeError(err);
      if (appErr.code === 'AUTH_EXPIRED_ACTION') {
        setIsSessionExpired(true);
      } else {
        setGeneralError(appErr.userMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <ScreenContainer style={styles.centerContainer}>
        <LoadingState message="Oturum doğrulanıyor, lütfen bekleyin..." />
      </ScreenContainer>
    );
  }

  // Süresi dolmuş veya geçersiz bağlantı durumu
  if (isSessionExpired) {
    return (
      <ScreenContainer style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <ErrorState
            title="Bağlantı Süresi Dolmuş"
            message="Şifre sıfırlama bağlantısının süresi dolmuş veya bağlantı daha önce kullanılmış. Lütfen yeni bir şifre sıfırlama bağlantısı talep edin."
          />
          <PrimaryButton
            title="Yeni Sıfırlama Bağlantısı İste"
            onPress={() => {
              setPasswordRecovery(false);
              router.replace('/(public)/forgot-password');
            }}
            style={styles.actionButton}
          />
          <SecondaryButton
            title="Giriş Ekranına Dön"
            onPress={() => {
              setPasswordRecovery(false);
              router.replace('/(public)/sign-in');
            }}
            style={styles.actionButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={Platform.OS === 'ios'}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.headline.fontSize,
              fontWeight: theme.typography.headline.fontWeight,
            },
          ]}
        >
          Yeni Şifre Belirleyin
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.body.fontSize,
            },
          ]}
        >
          Hesabınız için güçlü ve yeni bir şifre oluşturun.
        </Text>
      </View>

      {/* Genel Hata Mesajı Bandı */}
      {generalError ? (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.loss,
            },
          ]}
          accessible={true}
          accessibilityRole="alert"
        >
          <Text style={[styles.errorBannerText, { color: theme.colors.loss }]}>
            ⚠️ {generalError}
          </Text>
        </View>
      ) : null}

      <View style={styles.form}>
        {isSuccess ? (
          <View style={styles.successContainer}>
            <View
              style={[
                styles.successBox,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.profit,
                },
              ]}
              accessible={true}
              accessibilityRole="alert"
            >
              <Text style={styles.successEmoji}>🎉</Text>
              <Text
                style={[
                  styles.successTitle,
                  {
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.title.fontSize,
                    fontWeight: theme.typography.title.fontWeight,
                  },
                ]}
              >
                Şifreniz Güncellendi
              </Text>
              <Text
                style={[
                  styles.successText,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.body.fontSize,
                  },
                ]}
              >
                Yeni şifreniz başarıyla kaydedildi. Artık yeni şifreniz ile güvenle giriş yapabilirsiniz.
              </Text>
            </View>

            <PrimaryButton
              title="Giriş Yap"
              onPress={() => {
                setPasswordRecovery(false);
                router.replace('/(public)/sign-in');
              }}
              style={styles.submitButton}
            />
          </View>
        ) : (
          <>
            {/* Yeni Şifre */}
            <PasswordField
              label="Yeni Şifre"
              placeholder="En az 6 karakter"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              error={passwordError ?? undefined}
              hint="Şifreniz en az 6 karakter uzunluğunda olmalıdır."
              showToggle={true}
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!isSubmitting}
            />

            {/* Yeni Şifre Tekrarı */}
            <PasswordField
              label="Yeni Şifre Tekrarı"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmError) setConfirmError(null);
              }}
              error={confirmError ?? undefined}
              showToggle={true}
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!isSubmitting}
            />

            {/* Güncelle Butonu */}
            <PrimaryButton
              title={isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              onPress={handleUpdatePassword}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}
              accessibilityLabel="Şifreyi Güncelle"
            />

            <SecondaryButton
              title="Giriş Ekranına Dön"
              onPress={() => router.replace('/(public)/sign-in')}
              disabled={isSubmitting}
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  errorCard: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    padding: 20,
  },
  actionButton: {
    width: '100%',
    marginTop: 12,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginBottom: 12,
  },
  successContainer: {
    alignItems: 'center',
  },
  successBox: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
