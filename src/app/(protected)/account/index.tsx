/**
 * Altın İz — Hesap Bilgileri Ekranı (account/index)
 * 
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 7.4 ve Bölüm 12
 * Görev Referansı: docs/TODO.md Faz 10.2 (Hesap bilgileri)
 * Veritabanı: public.user_profiles & auth.users
 * 
 * Ekran Kapsamı:
 * - [x] E-posta adresini göster (salt okunur / kilitli).
 * - [x] E-posta doğrulama durumunu göster (onay rozeti).
 * - [x] Görünen adı varsa göster ve düzenle (azami 50 karakter).
 * - [x] Şifre değiştirme veya sıfırlama bağlantısını ekle (e-posta ile sıfırlama).
 * - [x] Kullanıcının değiştiremeyeceği sistem alanlarını gizle (user_id, created_at vb.).
 * - [x] Hesap Silme sayfasına yönlendirme bağlantısı.
 * - [x] iOS Safe Area ve klavye kaydırma optimizasyonu.
 */

import React, { useState } from 'react';
import {
  Alert,
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
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { MAX_DISPLAY_NAME_LENGTH, validateDisplayName } from '@/models/profile';

export default function AccountScreen() {
  const { theme } = useTheme();
  const { user, profile, refreshProfile } = useAuth();

  const initialName =
    profile?.displayName ??
    (user?.user_metadata?.full_name as string | undefined) ??
    '';

  const [displayName, setDisplayName] = useState(initialName);
  const [prevInitialName, setPrevInitialName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const email = user?.email || 'Oturum bilgisi yüklenemedi';
  const isEmailVerified = Boolean(user?.email_confirmed_at);

  // Profil yüklendiğinde veya değiştiğinde formu senkronize et (React pattern)
  if (initialName !== prevInitialName) {
    setPrevInitialName(initialName);
    setDisplayName(initialName);
  }

  // Avatar için baş harfleri türet
  const resolvedName =
    displayName.trim() ||
    profile?.displayName ||
    (user?.user_metadata?.full_name as string | undefined) ||
    email.split('@')[0] ||
    'Aİ';

  const userInitials =
    resolvedName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n: string) => n[0].toUpperCase())
      .join('') || 'Aİ';

  /**
   * Görünen adı günceller
   */
  const handleSaveProfile = async () => {
    setErrorMessage(undefined);
    setSuccessMessage(null);

    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      return;
    }

    setIsSaving(true);
    try {
      await profileService.updateDisplayName(displayName);
      await refreshProfile();
      setSuccessMessage('Profiliniz başarıyla güncellendi.');

      if (Platform.OS !== 'web') {
        Alert.alert('Başarılı', 'Profil bilgileriniz başarıyla kaydedildi.');
      }
    } catch (err: any) {
      const msg = err?.userMessage || err?.message || 'Profil güncellenirken bir hata oluştu.';
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Hata', msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Şifre sıfırlama e-postası tetikler
   */
  const handleResetPasswordPress = () => {
    if (!user?.email) {
      Alert.alert('Uyarı', 'Kayıtlı e-posta adresi bulunamadı.');
      return;
    }

    const triggerReset = async () => {
      setIsSendingReset(true);
      try {
        await authService.resetPasswordForEmail({
          email: user.email!,
          redirectTo: 'altiniz://reset-password',
        });
        const infoMsg = `${user.email} adresinize şifre sıfırlama bağlantısı gönderildi. Lütfen e-postanızı kontrol edin.`;
        setSuccessMessage(infoMsg);
        Alert.alert('E-posta Gönderildi', infoMsg);
      } catch (err: any) {
        const errorMsg = err?.userMessage || err?.message || 'Şifre sıfırlama talebi gönderilemedi.';
        Alert.alert('Hata', errorMsg);
      } finally {
        setIsSendingReset(false);
      }
    };

    if (Platform.OS === 'web') {
      triggerReset();
    } else {
      Alert.alert(
        'Şifre Sıfırlama',
        `${user.email} adresinize şifre sıfırlama bağlantısı gönderilsin mi?`,
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Gönder', onPress: triggerReset },
        ]
      );
    }
  };

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={true} withPadding={true}>
      {/* Profil Başlığı ve Avatar */}
      <View
        style={[
          styles.profileHeader,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
            {userInitials}
          </Text>
        </View>
        <Text
          style={[styles.displayNameTitle, { color: theme.colors.textPrimary }]}
          numberOfLines={1}
        >
          {resolvedName}
        </Text>
        <Text style={[styles.emailText, { color: theme.colors.textSecondary }]}>
          {email}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isEmailVerified
                ? theme.colors.profitLight
                : theme.colors.warningLight,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: isEmailVerified
                  ? theme.colors.profit
                  : theme.colors.warning,
              },
            ]}
          >
            {isEmailVerified
              ? '✓ E-posta Doğrulandı (Aktif)'
              : '⚠️ E-posta Henüz Doğrulanmadı'}
          </Text>
        </View>
      </View>

      {/* Başarı / Bilgi Bildirimi */}
      {successMessage && (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme.colors.profitLight,
              borderColor: theme.colors.profit,
            },
          ]}
        >
          <Text style={[styles.bannerText, { color: theme.colors.profit }]}>
            {successMessage}
          </Text>
        </View>
      )}

      {/* Profil Düzenleme Formu */}
      <View style={styles.form}>
        <TextField
          label="Görünen Ad"
          value={displayName}
          onChangeText={(val) => {
            setDisplayName(val);
            if (errorMessage) setErrorMessage(undefined);
          }}
          placeholder="Örn. Ahmet Yılmaz"
          maxLength={MAX_DISPLAY_NAME_LENGTH}
          hint={`Uygulamada ve karşılamalarda görünecek isteğe bağlı adınız (Azami ${MAX_DISPLAY_NAME_LENGTH} karakter).`}
          error={errorMessage}
        />

        <TextField
          label="Kayıtlı E-posta Adresi"
          value={email}
          editable={false}
          hint="E-posta adresiniz hesap güvenliğiniz için kilitlidir. Değişiklik için destekle iletişime geçin."
        />

        {/* Profili Güncelle Butonu */}
        <PrimaryButton
          title={isSaving ? 'Kaydediliyor...' : 'Profili Güncelle'}
          onPress={handleSaveProfile}
          loading={isSaving}
          disabled={isSaving}
          style={styles.saveBtn}
          accessibilityLabel="Profili Güncelle"
        />

        {/* Şifre Sıfırlama Bağlantısı */}
        <SecondaryButton
          title={isSendingReset ? 'Gönderiliyor...' : 'Şifremi Sıfırla / Değiştir'}
          onPress={handleResetPasswordPress}
          loading={isSendingReset}
          disabled={isSendingReset}
          style={styles.resetBtn}
          accessibilityLabel="Şifremi Sıfırla"
        />

        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />

        {/* Tehlikeli Alan: Hesap Silme */}
        <Text style={[styles.dangerSectionTitle, { color: theme.colors.loss }]}>
          TEHLİKELİ ALAN
        </Text>
        <SecondaryButton
          title="Hesabımı ve Verilerimi Sil"
          onPress={() => router.push('/(protected)/account/delete')}
          style={[styles.deleteBtn, { borderColor: theme.colors.loss }]}
          accessibilityLabel="Hesabımı ve Verilerimi Sil"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  displayNameTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  banner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    paddingBottom: 32,
  },
  saveBtn: {
    marginTop: 8,
    marginBottom: 12,
  },
  resetBtn: {
    marginBottom: 20,
  },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  dangerSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  deleteBtn: {
    borderWidth: 1,
  },
});
