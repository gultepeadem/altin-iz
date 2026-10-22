/**
 * Altın İz — Şifremi Unuttum Ekranı (app/(public)/forgot-password.tsx)
 * 
 * Faz 5.6 Kapsamı:
 * - E-posta giriş alanı ve doğrulama
 * - Şifre sıfırlama e-postası tetikleme (deep link: altiniz://auth-callback?type=recovery)
 * - Güvenlik Kuralı: E-posta hesabının varlığını ifşa etmeyen genel güvenli başarı mesajı
 * - Çift gönderimi engelleyen yüklenme durumu
 */

import React, { useState } from 'react';
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
import { TextField } from '@/components/forms/TextField';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { normalizeError } from '@/utils/normalizeError';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  /**
   * İstemci tarafı form doğrulaması
   */
  const validateForm = (): boolean => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Lütfen e-posta adresinizi girin.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Lütfen geçerli bir e-posta adresi girin.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  /**
   * Şifre sıfırlama bağlantısı gönderme işlemi
   */
  const handleSend = async () => {
    if (isSubmitting) return;

    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPasswordForEmail({
        email: email.trim(),
        redirectTo: 'altiniz://auth-callback?type=recovery',
      });

      // Güvenlik Kuralı: E-posta kayıtlı olsun veya olmasın genel başarı mesajı sunulur
      setIsSent(true);
    } catch (err) {
      const appErr = normalizeError(err);
      // Ağ veya rate-limit gibi teknik hatalar haricinde kullanıcı varlığını ifşa etme
      if (appErr.code === 'NETWORK_ERROR' || appErr.code === 'AUTH_RATE_LIMITED') {
        setGeneralError(appErr.userMessage);
      } else {
        setIsSent(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Şifre Sıfırlama
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
          Hesabınıza ait e-posta adresini girin; size şifre sıfırlama bağlantısı gönderelim.
        </Text>
      </View>

      {/* Teknik Hata Bildirimi (Ağ vb.) */}
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
        {isSent ? (
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
              <Text style={styles.successEmoji}>📬</Text>
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
                Talebiniz Alındı
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
                Eğer girdiğiniz e-posta adresi sistemimizde kayıtlı ise, şifre sıfırlama talimatları gönderilmiştir.
                Lütfen gelen kutunuzu (ve spam klasörünüzü) kontrol edin.
              </Text>
            </View>

            <PrimaryButton
              title="Giriş Ekranına Dön"
              onPress={() => router.replace('/(public)/sign-in')}
              style={styles.submitButton}
            />
          </View>
        ) : (
          <>
            <TextField
              label="E-posta Adresi"
              placeholder="ornek@posta.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              error={emailError ?? undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isSubmitting}
            />

            <PrimaryButton
              title={isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              onPress={handleSend}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}
              accessibilityLabel="Sıfırlama Bağlantısı Gönder"
            />

            <SecondaryButton
              title="Giriş Ekranına Dön"
              onPress={() => router.back()}
              disabled={isSubmitting}
              accessibilityLabel="Geri dön"
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
