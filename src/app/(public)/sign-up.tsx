/**
 * Altın İz — Kayıt Ekranı (app/(public)/sign-up.tsx)
 * 
 * Faz 5.3 Kapsamı:
 * - E-posta, şifre ve şifre tekrarı alanları
 * - Şifre gizleme / gösterme düğmesi (PasswordField)
 * - İstemci tarafı doğrulama (e-posta formatı, min 6 karakter şifre, eşleşme)
 * - Çift gönderimi engelleyen yüklenme (loading) durumu
 * - Yasal belge bağlantıları (Kullanım Koşulları ve Gizlilik Politikası)
 * - Başarı durumunda verify-email ekranına güvenli yönlendirme
 * - Güvenlik: Asla şifre loglamaz, hassas hataları normalizeError ile Türkçe verir
 */

import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { PasswordField } from '@/components/forms/PasswordField';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { normalizeError } from '@/utils/normalizeError';

// Yasal belge önizleme metinleri (Modal için)
const LEGAL_DOCS: Record<string, { title: string; content: string }> = {
  'kullanim-kosullari': {
    title: 'Kullanım Koşulları',
    content:
      'Altın İz uygulamasına hoş geldiniz.\n\n' +
      '1. Altın İz, altın varlıklarınızı ve portföy kâr-zarar durumunuzu takip etmeniz amacıyla sunulan kişisel bir takip uygulamasıdır.\n\n' +
      '2. Uygulama içerisinde sunulan altın fiyatları ve portföy değerlemeleri yalnızca bilgilendirme amaçlıdır. Hiçbir şekilde yatırım tavsiyesi, alım-satım önerisi veya finansal taahhüt içermez.\n\n' +
      '3. Kullanıcı, hesap güvenliğinden ve oturum bilgilerinin korunmasından bizzat sorumludur.\n\n' +
      '4. Hesap silme talebinde bulunulduğunda tüm kişisel veriler yasal saklama süreleri haricinde kalıcı olarak silinir.',
  },
  'gizlilik-politikasi': {
    title: 'Gizlilik Politikası ve KVKK',
    content:
      'Kişisel Verilerin Korunması Hakkında Bilgilendirme:\n\n' +
      '1. Altın İz, veri minimizasyonu ilkesi gereğince yalnızca hesap oluşturma (e-posta, şifre karması) ve portföy kayıtlarınızı işler.\n\n' +
      '2. T.C. kimlik numarası, açık ev adresi, banka veya kredi kartı bilgileri kesinlikle talep edilmez ve toplanmaz.\n\n' +
      '3. Şifreler sunucularımızda asla düz metin olarak saklanmaz, yüksek güvenlikli şifreleme algoritmaları ile korunur.\n\n' +
      '4. Dilediğiniz zaman hesap ayarlarından hesabınızı ve tüm portföy verilerinizi kalıcı olarak silebilirsiniz.',
  },
};

export default function SignUpScreen() {
  const { theme } = useTheme();

  // Form alanları
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Hata durumları
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Gönderim ve yasal belge modal durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'kullanim-kosullari' | 'gizlilik-politikasi' | null>(null);

  /**
   * İstemci tarafı doğrulama kontrolleri
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

    // 2. Şifre kontrolü (en az 6 karakter)
    if (!password) {
      setPasswordError('Lütfen bir şifre belirleyin.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifreniz en az 6 karakter olmalıdır.');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    // 3. Şifre tekrar kontrolü
    if (!confirmPassword) {
      setConfirmError('Lütfen şifrenizi tekrar girin.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Girdiğiniz şifreler eşleşmiyor.');
      isValid = false;
    } else {
      setConfirmError(null);
    }

    return isValid;
  };

  /**
   * Kayıt gönderme işlemi
   */
  const handleSignUp = async () => {
    // Çift tıklamayı engelle
    if (isSubmitting) return;

    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.signUp({
        email: email.trim(),
        password,
      });

      // Başarılı kayıt sonrası e-posta doğrulama ekranına yönlendir
      router.replace({
        pathname: '/(public)/verify-email',
        params: { email: email.trim() },
      });
    } catch (err) {
      const appErr = normalizeError(err);
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
          Hesap Oluştur
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
          Altın birikimlerinizi güvenle izlemek için kaydolun.
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
          placeholder="En az 6 karakter"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(null);
          }}
          error={passwordError ?? undefined}
          hint="Şifreniz en az 6 karakter uzunluğunda olmalıdır."
          showToggle={true}
          autoComplete="password-new"
          textContentType="newPassword"
          editable={!isSubmitting}
        />

        {/* Şifre Tekrar Alanı */}
        <PasswordField
          label="Şifre Tekrarı"
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

        {/* Yasal Belge Onay Bağlantıları */}
        <View style={styles.legalNotice}>
          <Text style={[styles.legalText, { color: theme.colors.textSecondary }]}>
            Hesap oluşturarak{' '}
            <Text
              style={[styles.legalLink, { color: theme.colors.primary }]}
              onPress={() => setActiveLegalModal('kullanim-kosullari')}
              accessibilityRole="link"
            >
              Kullanım Koşulları
            </Text>
            {' '}ve{' '}
            <Text
              style={[styles.legalLink, { color: theme.colors.primary }]}
              onPress={() => setActiveLegalModal('gizlilik-politikasi')}
              accessibilityRole="link"
            >
              Gizlilik Politikası
            </Text>
            {"'nı kabul etmiş sayılırsınız."}
          </Text>
        </View>

        {/* Kayıt Ol Butonu (Çift gönderim korumalı) */}
        <PrimaryButton
          title={isSubmitting ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
          onPress={handleSignUp}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          accessibilityLabel="Hesap Oluştur"
        />

        {/* Giriş Yap Bağlantısı */}
        <View style={styles.footerRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Zaten hesabınız var mı?</Text>
          <Pressable
            onPress={() => !isSubmitting && router.push('/(public)/sign-in')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="link"
            accessibilityLabel="Giriş yap sayfasına git"
          >
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              {' '}Giriş Yap
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Yasal Belge Önizleme Modalı */}
      <Modal
        visible={activeLegalModal !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveLegalModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {activeLegalModal ? (
              <>
                <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                  {LEGAL_DOCS[activeLegalModal].title}
                </Text>
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={true}>
                  <Text style={[styles.modalContent, { color: theme.colors.textSecondary }]}>
                    {LEGAL_DOCS[activeLegalModal].content}
                  </Text>
                </ScrollView>
                <PrimaryButton
                  title="Kapat"
                  onPress={() => setActiveLegalModal(null)}
                  style={styles.modalCloseButton}
                />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 24,
    marginBottom: 20,
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
  legalNotice: {
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  legalText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  legalLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  submitButton: {
    marginTop: 12,
    marginBottom: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  modalCloseButton: {
    marginTop: 4,
  },
});
