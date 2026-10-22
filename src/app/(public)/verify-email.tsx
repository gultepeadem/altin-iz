/**
 * Altın İz — E-posta Doğrulama Ekranı (app/(public)/verify-email.tsx)
 * 
 * Faz 5.4 Kapsamı:
 * - E-posta doğrulama bilgilendirme arayüzü
 * - Tekrar gönderme butonu ve 60 saniyelik hız sınırı (cooldown / rate limit) koruması
 * - Doğrulama durumunu kontrol etme / yenileme butonu
 * - Süresi dolmuş veya hatalı durumlarda bilgilendirme
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { normalizeError } from '@/utils/normalizeError';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const { theme } = useTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { refreshProfile } = useAuth();

  const [isResending, setIsResending] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  // Geri sayım (cooldown) sayacı
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /**
   * Doğrulama e-postasını tekrar gönderme işlemi (Hız sınırı korumalı)
   */
  const handleResend = async () => {
    if (!email || isResending || cooldown > 0) return;

    setIsResending(true);
    setStatusMessage(null);

    try {
      await authService.resendVerificationEmail({ email });
      setCooldown(COOLDOWN_SECONDS);
      setStatusMessage({
        type: 'success',
        text: 'Doğrulama bağlantısı e-posta adresinize tekrar gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.',
      });
    } catch (err) {
      const appErr = normalizeError(err);
      setStatusMessage({
        type: 'error',
        text: appErr.userMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  /**
   * Kullanıcının doğrulama durumunu sunucudan sorgular
   */
  const handleCheckStatus = async () => {
    if (isCheckingStatus) return;

    setIsCheckingStatus(true);
    setStatusMessage(null);

    try {
      const user = await authService.getUser();
      if (user && user.email_confirmed_at) {
        setStatusMessage({
          type: 'success',
          text: 'E-posta adresiniz başarıyla doğrulandı! Yönlendiriliyorsunuz...',
        });
        await refreshProfile();
        setTimeout(() => {
          router.replace('/(protected)/(tabs)');
        }, 1200);
      } else {
        setStatusMessage({
          type: 'info',
          text: 'E-posta adresiniz henüz doğrulanmamış görünüyor. Lütfen gelen kutunuzdaki bağlantıya tıkladıktan sonra tekrar kontrol edin.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'info',
        text: 'Bağlantı henüz algılanmadı. Lütfen e-postanızı onaylayıp tekrar deneyin veya giriş yapın.',
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getStatusColor = () => {
    if (!statusMessage) return theme.colors.textSecondary;
    if (statusMessage.type === 'success') return theme.colors.profit;
    if (statusMessage.type === 'error') return theme.colors.loss;
    return theme.colors.primary;
  };

  return (
    <ScreenContainer scrollable={true} contentContainerStyle={styles.container}>
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

        {statusMessage ? (
          <View
            style={[
              styles.statusBanner,
              {
                backgroundColor: theme.colors.card,
                borderColor: getStatusColor(),
              },
            ]}
            accessible={true}
            accessibilityRole="alert"
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {statusMessage.text}
            </Text>
          </View>
        ) : null}

        {/* 1. Doğrulama Durumunu Kontrol Et / Yenile */}
        <PrimaryButton
          title={isCheckingStatus ? 'Kontrol Ediliyor...' : 'Doğrulama Durumunu Kontrol Et'}
          onPress={handleCheckStatus}
          loading={isCheckingStatus}
          disabled={isCheckingStatus}
          style={styles.actionButton}
          accessibilityLabel="Doğrulama Durumunu Kontrol Et"
        />

        {/* 2. Tekrar Gönderme Butonu (Hız Sınırı Korumalı) */}
        {email ? (
          <SecondaryButton
            title={
              cooldown > 0
                ? `Tekrar göndermek için bekleyin (${cooldown}s)`
                : isResending
                ? 'Gönderiliyor...'
                : 'Doğrulama E-postasını Tekrar Gönder'
            }
            onPress={handleResend}
            disabled={isResending || cooldown > 0}
            style={styles.actionButton}
            accessibilityLabel="Doğrulama E-postasını Tekrar Gönder"
          />
        ) : null}

        {/* 3. Giriş Ekranına Git */}
        <SecondaryButton
          title="Giriş Ekranına Dön"
          onPress={() => router.replace('/(public)/sign-in')}
          style={styles.backButton}
          accessibilityLabel="Giriş Ekranına Dön"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    paddingHorizontal: 16,
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
    lineHeight: 22,
  },
  statusBanner: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButton: {
    width: '100%',
    marginBottom: 12,
  },
  backButton: {
    width: '100%',
    marginTop: 4,
  },
});
