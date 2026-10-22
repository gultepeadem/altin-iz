/**
 * Altın İz — Giriş Yap Ekranı (app/(public)/sign-in.tsx)
 * 
 * Faz 5.5 Kapsamı:
 * - E-posta ve şifre giriş alanları
 * - Şifreyi göster veya gizle seçeneği (PasswordField)
 * - Giriş butonu (çift tıklama ve yüklenme durum korumalı)
 * - Şifremi Unuttum ve Hesap Oluştur bağlantıları
 * - Genel hatalı giriş mesajı (güvenlik kuralı: e-posta varlığını ifşa etmez)
 * - Doğrulanmamış kullanıcı için verify-email yönlendirmesi
 * - Hesap durumu kontrolü (disabled veya deletion_pending için account-status)
 * - Başarılı giriş sonrası Ana Sayfaya (tabs) yönlendirme
 */

import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { PasswordField } from '@/components/forms/PasswordField';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { normalizeError } from '@/utils/normalizeError';

export default function SignInScreen() {
  const { theme } = useTheme();
  const { refreshProfile } = useAuth();

  // Form alanları
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Hata durumları
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Gönderim durumu
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * İstemci tarafı form doğrulama kontrolleri
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // 1. E-posta kontrolü
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Lütfen e-posta adresinizi girin.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Lütfen geçerli bir e-posta adresi girin.');
      isValid = false;
    } else {
      setEmailError(null);
    }

    // 2. Şifre kontrolü
    if (!password) {
      setPasswordError('Lütfen şifrenizi girin.');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  /**
   * Giriş yapma işlemi
   */
  const handleSignIn = async () => {
    // Çift tıklamayı engelle
    if (isSubmitting) return;

    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim();
      const { user } = await authService.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (!user) {
        throw new Error('Kullanıcı oturumu başlatılamadı.');
      }

      // 1. E-posta doğrulanmış mı kontrol et
      if (!user.email_confirmed_at) {
        setIsSubmitting(false);
        router.replace({
          pathname: '/(public)/verify-email',
          params: { email: trimmedEmail },
        });
        return;
      }

      // 2. Hesap durumunu kontrol et (disabled veya deletion_pending)
      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('account_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (
          profileData &&
          (profileData.account_status === 'disabled' ||
            profileData.account_status === 'deletion_pending')
        ) {
          await refreshProfile();
          setIsSubmitting(false);
          router.replace('/account-status');
          return;
        }
      } catch {
        // Profil okuma hatası durumunda akışa devam et
      }

      // 3. Başarılı ve aktif hesap: Ana sayfaya yönlendir
      await refreshProfile();
      router.replace('/(protected)/(tabs)');
    } catch (err) {
      const appErr = normalizeError(err);
      // Güvenlik Kuralı: E-posta varlığını ifşa etmeyen genel mesaj (AppError AUTH_INVALID_CREDENTIALS)
      setGeneralError(appErr.userMessage);
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
          Giriş Yap
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
          Portföyünüze erişmek için bilgilerinizi girin.
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
        {/* E-posta Alanı */}
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

        {/* Şifre Alanı */}
        <PasswordField
          label="Şifre"
          placeholder="Şifrenizi girin"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(null);
          }}
          error={passwordError ?? undefined}
          showToggle={true}
          autoComplete="password"
          textContentType="password"
          editable={!isSubmitting}
        />

        {/* Şifremi Unuttum Bağlantısı */}
        <Pressable
          onPress={() => !isSubmitting && router.push('/(public)/forgot-password')}
          style={styles.forgotPasswordButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="link"
          accessibilityLabel="Şifremi unuttum sayfasına git"
        >
          <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
            Şifremi Unuttum
          </Text>
        </Pressable>

        {/* Giriş Butonu */}
        <PrimaryButton
          title={isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          onPress={handleSignIn}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          accessibilityLabel="Giriş Yap"
        />

        {/* Hesap Oluştur Bağlantısı */}
        <View style={styles.footerRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Hesabınız yok mu?</Text>
          <Pressable
            onPress={() => !isSubmitting && router.push('/(public)/sign-up')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="link"
            accessibilityLabel="Hesap oluştur sayfasına git"
          >
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              {' '}Kayıt Ol
            </Text>
          </Pressable>
        </View>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontWeight: '600',
  },
});
