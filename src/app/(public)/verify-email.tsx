/**
 * Altın İz — E-posta Doğrulama Ekranı (verify-email)
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { normalizeError } from '@/utils/normalizeError';

export default function VerifyEmailScreen() {
  const { theme } = useTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      await authService.resendVerificationEmail({ email });
      setResendStatus('Doğrulama bağlantısı e-posta adresinize tekrar gönderildi.');
    } catch (err) {
      const appErr = normalizeError(err);
      setResendStatus(appErr.userMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✉️</Text>
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
          E-postanızı Doğrulayın
        </Text>
        <Text
          style={[
            styles.message,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.body.fontSize,
            },
          ]}
        >
          Kayıt işlemini tamamlamak için{' '}
          {email ? (
            <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>
              {email}{' '}
            </Text>
          ) : (
            'e-posta '
          )}
          adresinize gönderdiğimiz doğrulama bağlantısına tıklayın.
        </Text>

        {resendStatus ? (
          <Text style={[styles.statusMessage, { color: theme.colors.primary }]}>
            {resendStatus}
          </Text>
        ) : null}

        <PrimaryButton
          title="Doğruladım, Giriş Yap"
          onPress={() => router.replace('/(public)/sign-in')}
          style={styles.button}
        />

        {email ? (
          <SecondaryButton
            title={isResending ? 'Gönderiliyor...' : 'Doğrulama E-postasını Tekrar Gönder'}
            onPress={handleResend}
            disabled={isResending}
            style={styles.resendButton}
          />
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
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 320,
    lineHeight: 22,
  },
  statusMessage: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 12,
  },
  resendButton: {
    width: '100%',
    maxWidth: 280,
  },
});
