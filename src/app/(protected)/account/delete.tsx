/**
 * Altın İz — Hesap Silme Onay Ekranı (account/delete)
 * 
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 7.4 & docs/DECISIONS.md ADR-025 & ADR-033
 * Görev Referansı: docs/TODO.md Faz 12.2 (Hesap silme ekranı)
 * 
 * Ekran Kapsamı:
 * - [x] Silinecek verileri liste halinde kullanıcıya açıkça gösterme.
 * - [x] İşlemin geri alınamaz (irreversible) olduğunu kırmızı uyarı kutusuyla belirtme.
 * - [x] Parola ile yeniden kimlik doğrulama zorunluluğu (PasswordField).
 * - [x] İki aşamalı son onay mekanizması (Alert.alert ile destructive onay).
 * - [x] İşlem sürerken ekranı güvenli şekilde kilitleme (loading & disabled).
 * - [x] Başarıdan sonra yerel oturumu temizleme ve welcome ekranına yönlendirme.
 * - [x] Başarısızlıkta hesabı silinmiş gibi göstermeme ve tekrar deneme desteği.
 * - [x] iOS Safe Area ve Android klavye kaydırma optimizasyonu.
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
import { DangerButton } from '@/components/common/DangerButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { PasswordField } from '@/components/forms/PasswordField';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { normalizeError } from '@/utils/normalizeError';

export default function AccountDeleteScreen() {
  const { theme, isDark } = useTheme();

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Hesap silme işlemini başlatan iki aşamalı onay akışı
   */
  const handleInitiateDelete = () => {
    // 1. Şifre kontrolü
    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setPasswordError('Lütfen hesabınızı silmek için mevcut şifrenizi girin.');
      return;
    }
    setPasswordError(null);
    setGeneralError(null);

    // 2. İkinci onay adımı (Platform native Alert)
    Alert.alert(
      'Hesabınızı Kalıcı Olarak Silmek İstiyor musunuz?',
      'Bu işlem kesinlikle geri alınamaz. Portföyünüzdeki tüm altın kayıtları, tercihleriniz ve hesap bilgileriniz hemen yok edilecektir.',
      [
        {
          text: 'Vazgeç',
          style: 'cancel',
        },
        {
          text: 'Evet, Kalıcı Olarak Sil',
          style: 'destructive',
          onPress: executeDeletion,
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Sunucu tarafı silme işlemini yürüten fonksiyon
   */
  const executeDeletion = async () => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      // Edge Function üzerinden ADR-033 silme boru hattını çalıştır ve yerel oturumu kapat
      await authService.deleteAccount({
        password: password.trim(),
      });

      // Başarılı silme bildirimi ve karşılama ekranına yönlendirme
      Alert.alert(
        'Hesabınız Silindi',
        'Hesabınız ve tüm ilişkili verileriniz başarıyla silindi. Bizi tercih ettiğiniz için teşekkür ederiz.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              router.replace('/(public)/welcome');
            },
          },
        ]
      );
    } catch (err) {
      const appErr = normalizeError(err);
      setGeneralError(appErr.userMessage);
      setIsSubmitting(false);

      Alert.alert(
        'Hesap Silinemedi',
        appErr.userMessage || 'Hesabınız silinirken bir sorun oluştu. Lütfen şifrenizi kontrol edip tekrar deneyin.'
      );
    }
  };

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={Platform.OS === 'ios'}>
      {/* 1. Kırmızı Geri Alınamaz Uyarısı Panosu */}
      <View
        style={[
          styles.warningBox,
          {
            backgroundColor: isDark ? '#450a0a' : theme.colors.lossLight,
            borderColor: theme.colors.loss,
          },
        ]}
      >
        <Text style={[styles.warningTitle, { color: theme.colors.loss }]}>
          ⚠️ Bu İşlem Geri Alınamaz!
        </Text>
        <Text style={[styles.warningText, { color: theme.colors.textPrimary }]}>
          Hesabınızı sildiğinizde Altın İz üzerindeki tüm kayıtlarınız ve kişisel verileriniz kalıcı olarak silinir. Bu verileri daha sonra geri getirmek kesinlikle mümkün olmayacaktır.
        </Text>
      </View>

      {/* 2. Silinecek Verilerin Listesi */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          Silinecek Verileriniz:
        </Text>

        <View style={styles.itemRow}>
          <Text style={styles.itemIcon}>🪙</Text>
          <View style={styles.itemContent}>
            <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
              Altın Portföyü
            </Text>
            <Text style={[styles.itemSub, { color: theme.colors.textSecondary }]}>
              Eklediğiniz tüm altın alım kayıtları, maliyetler ve notlar fiziksel olarak yok edilir.
            </Text>
          </View>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemIcon}>👤</Text>
          <View style={styles.itemContent}>
            <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
              Profil Bilgileri
            </Text>
            <Text style={[styles.itemSub, { color: theme.colors.textSecondary }]}>
              Görünen adınız ve kullanıcı kimliğiniz veritabanımızdan kalıcı olarak silinir.
            </Text>
          </View>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemIcon}>⚙️</Text>
          <View style={styles.itemContent}>
            <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
              Uygulama Tercihleri
            </Text>
            <Text style={[styles.itemSub, { color: theme.colors.textSecondary }]}>
              Tema seçiminiz ve kişisel ayarlarınız silinir.
            </Text>
          </View>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemIcon}>🔒</Text>
          <View style={styles.itemContent}>
            <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
              Oturum ve Giriş Bilgileri
            </Text>
            <Text style={[styles.itemSub, { color: theme.colors.textSecondary }]}>
              Kayıtlı e-posta adresiniz, şifre karması ve aktif oturum belirteçleri sonlandırılır.
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Anonimleştirme Bilgilendirme Notu */}
      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: isDark ? theme.colors.surfaceElevated : theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.infoText, { color: theme.colors.textTertiary }]}>
          ℹ️ Yasal mevzuat gereğince (KVKK md. 11), yalnızca kimliğinizden tamamen koparılmış (anonim) yasal işlem ve denetim kayıtları saklanır; şahsınıza ait hiçbir kişisel veri tutulmaz.
        </Text>
      </View>

      {/* 4. Şifre ile Yeniden Kimlik Doğrulama Formu */}
      <View style={styles.form}>
        <PasswordField
          label="Onaylamak İçin Mevcut Şifrenizi Girin"
          placeholder="Mevcut şifreniz"
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (passwordError) setPasswordError(null);
          }}
          error={passwordError || undefined}
          editable={!isSubmitting}
          hint="Güvenliğiniz için bu işlemi yalnızca geçerli şifrenizle onaylayabilirsiniz."
        />

        {generalError && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: isDark ? '#450a0a' : theme.colors.lossLight,
                borderColor: theme.colors.loss,
              },
            ]}
          >
            <Text style={[styles.errorText, { color: theme.colors.loss }]}>
              {generalError}
            </Text>
          </View>
        )}

        {/* 5. Eylem Butonları */}
        <DangerButton
          title={isSubmitting ? 'Hesap Siliniyor...' : 'Hesabımı ve Verilerimi Kalıcı Olarak Sil'}
          onPress={handleInitiateDelete}
          loading={isSubmitting}
          disabled={isSubmitting || !password.trim()}
          style={styles.deleteBtn}
          accessibilityLabel="Hesabımı ve tüm verilerimi kalıcı olarak sil"
        />

        <SecondaryButton
          title="Vazgeç ve Geri Dön"
          onPress={() => router.back()}
          disabled={isSubmitting}
          accessibilityLabel="Hesap silme işleminden vazgeç ve geri dön"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  warningBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 12,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  itemIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  infoBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
  },
  form: {
    paddingBottom: 36,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: -8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteBtn: {
    marginTop: 8,
    marginBottom: 12,
  },
});
