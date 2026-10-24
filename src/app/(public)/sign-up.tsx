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

import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { legalService } from '@/services/legalService';
import type { LegalDocument, LegalDocumentType } from '@/models/legal';
import { normalizeError } from '@/utils/normalizeError';

type LegalModalKey = 'kullanim-kosullari' | 'gizlilik-politikasi' | 'kvkk-aydinlatma';

const MODAL_TO_DOC_TYPE: Record<LegalModalKey, LegalDocumentType> = {
  'kullanim-kosullari': 'terms_of_use',
  'gizlilik-politikasi': 'privacy_policy',
  'kvkk-aydinlatma': 'kvkk_notice',
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
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalKey | null>(null);
  const [modalDocument, setModalDocument] = useState<LegalDocument | null>(null);

  const currentDocType = activeLegalModal ? MODAL_TO_DOC_TYPE[activeLegalModal] : null;
  const currentDoc = currentDocType
    ? (modalDocument ?? legalService.getFallbackDocument(currentDocType))
    : null;

  // Modal açıldığında belgeyi legalService üzerinden canlı çek ve sunum olayını kaydet
  useEffect(() => {
    if (!activeLegalModal) return;
    const docType = MODAL_TO_DOC_TYPE[activeLegalModal];

    legalService.getDocumentByType(docType).then((liveDoc) => {
      if (liveDoc) {
        setModalDocument(liveDoc);
        legalService.recordDocumentViewed({
          documentId: liveDoc.id,
          source: 'registration',
          documentType: docType,
        });
      }
    });
  }, [activeLegalModal]);

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
        metadata: {
          terms_accepted: true,
          terms_version: '1.0.0',
          kvkk_presented: true,
          kvkk_version: '1.0.0',
          signup_app_version: '1.0.0',
        },
      });

      // Yasal Olay Kaydı (Hukuki dayanak: KVKK md. 5/2-c ve md. 10)
      // Kullanım koşulları kabulü ve aydınlatma sunumu arka planda güvenle kaydedilir
      try {
        const termsDoc = await legalService.getDocumentByType('terms_of_use');
        if (termsDoc) {
          await legalService.recordTermsAccepted({
            documentId: termsDoc.id,
            source: 'registration',
            appVersion: '1.0.0',
          });
        }
        const kvkkDoc = await legalService.getDocumentByType('kvkk_notice');
        if (kvkkDoc) {
          await legalService.recordDocumentPresented({
            documentId: kvkkDoc.id,
            source: 'registration',
            documentType: 'kvkk_notice',
            appVersion: '1.0.0',
          });
        }
      } catch {
        // Yasal kayıt hatası kullanıcı akışını engellememelidir
      }

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
            {', '}
            <Text
              style={[styles.legalLink, { color: theme.colors.primary }]}
              onPress={() => setActiveLegalModal('gizlilik-politikasi')}
              accessibilityRole="link"
            >
              Gizlilik Politikası
            </Text>
            {' ve '}
            <Text
              style={[styles.legalLink, { color: theme.colors.primary }]}
              onPress={() => setActiveLegalModal('kvkk-aydinlatma')}
              accessibilityRole="link"
            >
              KVKK Aydınlatma Metni
            </Text>
            {"'ni okuduğunuzu ve şartları kabul ettiğinizi beyan edersiniz."}
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
        onRequestClose={() => {
          setActiveLegalModal(null);
          setModalDocument(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {currentDoc ? (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                    {currentDoc.title}
                  </Text>
                  <View
                    style={[
                      styles.versionPill,
                      {
                        backgroundColor: theme.colors.surfaceElevated,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.versionPillText, { color: theme.colors.gold }]}>
                      v{currentDoc.version}
                    </Text>
                  </View>
                </View>
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={true}>
                  <Text style={[styles.modalContent, { color: theme.colors.textSecondary }]}>
                    {currentDoc.content}
                  </Text>
                </ScrollView>
                <PrimaryButton
                  title="Anladım ve Kapat"
                  onPress={() => {
                    setActiveLegalModal(null);
                    setModalDocument(null);
                  }}
                  style={styles.modalCloseButton}
                />
              </>
            ) : (
              <ActivityIndicator size="small" color={theme.colors.gold} style={{ marginVertical: 32 }} />
            )}
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
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  versionPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  versionPillText: {
    fontSize: 11,
    fontWeight: '700',
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
