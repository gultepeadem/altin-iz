/**
 * Altın İz — Ayarlar Ekranı (tabs/settings)
 * 
 * Faz 5.7 Kapsamı:
 * - Çıkış onay penceresi (Alert / Modal)
 * - Supabase oturumu sonlandırma (authService.signOut)
 * - Yerel kullanıcı oturum verilerini ve önbelleğini temizleme
 * - Kök rotaya (welcome) yönlendirme ve geçmişi temizleme
 */

import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { DangerButton } from '@/components/common/DangerButton';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { ThemePreference } from '@/theme/types';

export default function SettingsScreen() {
  const { theme, preference, setPreference } = useTheme();
  const { signOut } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const themeOptions: { label: string; value: ThemePreference }[] = [
    { label: 'Sistem', value: 'system' },
    { label: 'Açık', value: 'light' },
    { label: 'Koyu', value: 'dark' },
  ];

  /**
   * Çıkış işlemini gerçekleştirir
   */
  const executeSignOut = async () => {
    setIsSigningOut(true);
    setShowConfirmModal(false);

    try {
      await signOut();
      // Protected navigasyon geçmişini temizleyerek welcome ekranına yönlendir
      router.replace('/(public)/welcome');
    } finally {
      setIsSigningOut(false);
    }
  };

  /**
   * Çıkış butonuna basıldığında onay penceresini açar
   */
  const handleSignOutPress = () => {
    if (Platform.OS === 'web') {
      setShowConfirmModal(true);
    } else {
      Alert.alert(
        'Güvenli Çıkış',
        'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Çıkış Yap',
            style: 'destructive',
            onPress: executeSignOut,
          },
        ]
      );
    }
  };

  return (
    <ScreenContainer scrollable={true}>
      {/* Tema Ayarları */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          GÖRÜNÜM VE TEMA
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Tema Tercihi
          </Text>
          <View style={styles.themeSelector}>
            {themeOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setPreference(opt.value)}
                style={[
                  styles.themeButton,
                  preference === opt.value && { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    {
                      color:
                        preference === opt.value
                          ? theme.colors.textInverse
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Hesap & Profil */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          HESAP
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Pressable
            onPress={() => router.push('/(protected)/account')}
            style={styles.menuRow}
          >
            <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
              Hesap Bilgileri & Profil
            </Text>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Yasal & Destek */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          BİLGİLENDİRME
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Pressable
            onPress={() => router.push('/(protected)/legal')}
            style={[styles.menuRow, styles.divider, { borderBottomColor: theme.colors.border }]}
          >
            <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
              Yasal Belgeler ve KVKK
            </Text>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(protected)/about')}
            style={[styles.menuRow, styles.divider, { borderBottomColor: theme.colors.border }]}
          >
            <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
              Uygulama Hakkında
            </Text>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(protected)/support')}
            style={styles.menuRow}
          >
            <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
              Yardım ve Destek
            </Text>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Çıkış Butonu */}
      <DangerButton
        title={isSigningOut ? 'Çıkış Yapılıyor...' : 'Güvenli Çıkış Yap'}
        onPress={handleSignOutPress}
        loading={isSigningOut}
        disabled={isSigningOut}
        style={styles.signOutButton}
        accessibilityLabel="Güvenli Çıkış Yap"
      />

      {/* Web & Yedek Çıkış Onay Modalı */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Güvenli Çıkış
            </Text>
            <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
              Hesabınızdan çıkış yapmak istediğinize emin misiniz? Cihazdaki yerel oturum bilgileriniz temizlenecektir.
            </Text>
            <View style={styles.modalButtons}>
              <SecondaryButton
                title="Vazgeç"
                onPress={() => setShowConfirmModal(false)}
                style={styles.modalBtn}
              />
              <DangerButton
                title={isSigningOut ? 'Çıkılıyor...' : 'Çıkış Yap'}
                onPress={executeSignOut}
                loading={isSigningOut}
                disabled={isSigningOut}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    padding: 16,
    paddingBottom: 8,
  },
  themeSelector: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 0,
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '300',
  },
  signOutButton: {
    marginTop: 28,
    marginBottom: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    width: '100%',
    gap: 10,
  },
  modalBtn: {
    width: '100%',
  },
});
