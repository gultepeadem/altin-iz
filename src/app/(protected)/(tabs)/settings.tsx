/**
 * Altın İz — Ayarlar Ekranı (tabs/settings)
 * 
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 7.5 ve Bölüm 16
 * Görev Referansı: docs/TODO.md Faz 10.1 (Ayarlar ekranı)
 * Karar Referansı: ADR-004 (Tema Yönetimi ve Tercih Saklama)
 * 
 * Ekran Kapsamı:
 * - [x] Kullanıcı profil özeti (Avatar, Ad/Soyad, E-posta, Aktif durum rozeti)
 * - [x] Görünüm ve Tema bölümü (Sistem, Açık, Koyu seçenekleri, ADR-004)
 * - [x] Hesap Yönetimi bölümü (Hesap Bilgileri ve Profil bağlantısı)
 * - [x] Hesap Silme bağlantısı (KVKK ve mağaza ilkelerine uygun yönlendirme)
 * - [x] Bilgilendirme ve Yasal bölümü (Yasal Belgeler & KVKK, Uygulama Hakkında, Yardım & Destek)
 * - [x] Çıkış Yap butonu ve onay mekanizması (iOS/Android yerel Alert, Web Modal)
 * - [x] Güvenli oturum kapatma ve /(public)/welcome rotasına yönlendirme
 * - [x] Uygulama sürüm bilgisi ve alt bilgi alanı
 * - [x] iOS Safe Area ve kaydırma optimizasyonu
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
  const { user, profile, signOut } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const themeOptions: { label: string; value: ThemePreference; icon: string }[] = [
    { label: 'Sistem', value: 'system', icon: '📱' },
    { label: 'Açık', value: 'light', icon: '☀️' },
    { label: 'Koyu', value: 'dark', icon: '🌙' },
  ];

  // Kullanıcı adı ve e-posta çözümlemesi
  const userDisplayName =
    profile?.displayName ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Değerli Kullanıcı';

  const userEmail = user?.email || 'Oturum bilgisi yüklenemedi';

  const userInitials =
    userDisplayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n: string) => n[0].toUpperCase())
      .join('') || 'Aİ';

  /**
   * Çıkış işlemini gerçekleştirir
   */
  const executeSignOut = async () => {
    setIsSigningOut(true);
    setShowConfirmModal(false);

    try {
      await signOut();
      router.replace('/(public)/welcome');
    } catch {
      // Çıkış hatası olsa dahi yerel rotayı welcome'a yönlendir
      router.replace('/(public)/welcome');
    } finally {
      setIsSigningOut(false);
    }
  };

  /**
   * Çıkış butonuna basıldığında platforma uygun onay penceresini açar
   */
  const handleSignOutPress = () => {
    if (Platform.OS === 'web') {
      setShowConfirmModal(true);
    } else {
      Alert.alert(
        'Güvenli Çıkış',
        'Hesabınızdan çıkış yapmak istediğinize emin misiniz? Cihazdaki yerel oturum bilgileriniz temizlenecektir.',
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
    <ScreenContainer scrollable={true} withPadding={true}>
      {/* Kullanıcı Profil Kartı */}
      <View
        style={[
          styles.profileCard,
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
        <View style={styles.profileInfo}>
          <Text
            style={[styles.profileName, { color: theme.colors.textPrimary }]}
            numberOfLines={1}
          >
            {userDisplayName}
          </Text>
          <Text
            style={[styles.profileEmail, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {userEmail}
          </Text>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: theme.colors.profitLight },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.colors.profit }]}>
                ✓ Doğrulanmış Hesap
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Görünüm ve Tema Bölümü */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          GÖRÜNÜM VE TEMA
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Uygulama Teması
          </Text>
          <Text style={[styles.settingSubLabel, { color: theme.colors.textSecondary }]}>
            Arayüzün cihaz sistemiyle veya tercihinizle nasıl görüntüleneceğini belirleyin.
          </Text>
          <View style={styles.themeSelector}>
            {themeOptions.map((opt) => {
              const isSelected = preference === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setPreference(opt.value)}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.background,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${opt.label} tema seçeneği`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={styles.themeIcon}>{opt.icon}</Text>
                  <Text
                    style={[
                      styles.themeButtonText,
                      {
                        color: isSelected
                          ? '#FFFFFF'
                          : theme.colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Hesap Bölümü */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          HESAP YÖNETİMİ
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Hesap Bilgileri Bağlantısı */}
          <Pressable
            onPress={() => router.push('/(protected)/account')}
            style={[
              styles.menuRow,
              styles.divider,
              { borderBottomColor: theme.colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Hesap Bilgileri ve Profil"
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
                Hesap Bilgileri & Profil
              </Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>
              ›
            </Text>
          </Pressable>

          {/* Hesap Silme Bağlantısı */}
          <Pressable
            onPress={() => router.push('/(protected)/account/delete')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Hesabımı Sil"
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🗑️</Text>
              <Text style={[styles.menuText, { color: theme.colors.loss }]}>
                Hesabımı Sil
              </Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.loss }]}>
              ›
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Yasal ve Gizlilik Bölümü */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          BİLGİLENDİRME VE YASAL
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Yasal ve Gizlilik Bağlantısı */}
          <Pressable
            onPress={() => router.push('/(protected)/legal')}
            style={[
              styles.menuRow,
              styles.divider,
              { borderBottomColor: theme.colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Yasal Belgeler ve Gizlilik"
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📜</Text>
              <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
                Yasal Belgeler ve Gizlilik
              </Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>
              ›
            </Text>
          </Pressable>

          {/* Uygulama Hakkında Bağlantısı */}
          <Pressable
            onPress={() => router.push('/(protected)/about')}
            style={[
              styles.menuRow,
              styles.divider,
              { borderBottomColor: theme.colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Uygulama Hakkında"
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>ℹ️</Text>
              <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
                Uygulama Hakkında
              </Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>
              ›
            </Text>
          </Pressable>

          {/* Yardım ve Destek Bağlantısı */}
          <Pressable
            onPress={() => router.push('/(protected)/support')}
            style={[
              styles.menuRow,
              styles.divider,
              { borderBottomColor: theme.colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Yardım ve Destek"
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>💬</Text>
              <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
                Yardım ve Destek
              </Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>
              ›
            </Text>
          </Pressable>

          {/* Fiyat Veri Kaynağı Bilgisi (ADR-003) */}
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
                Fiyat Kaynağı
              </Text>
            </View>
            <Text style={[styles.menuValue, { color: theme.colors.textSecondary }]}>
              Kapalıçarşı Serbest Piyasa
            </Text>
          </View>
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

      {/* Sürüm Bilgisi ve Alt Bilgi */}
      <View style={styles.footerContainer}>
        <Text style={[styles.footerTitle, { color: theme.colors.textTertiary }]}>
          Altın İz v1.0.0
        </Text>
        <Text style={[styles.footerSubtitle, { color: theme.colors.textTertiary }]}>
          Kişisel Altın ve Portföy Takip Uygulaması
        </Text>
      </View>

      {/* Web & Yedek Çıkış Onay Modalı */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Güvenli Çıkış
            </Text>
            <Text
              style={[
                styles.modalMessage,
                { color: theme.colors.textSecondary },
              ]}
            >
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 18,
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
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 2,
  },
  settingSubLabel: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  themeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  themeButtonText: {
    fontSize: 13,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    fontSize: 16,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 18,
    fontWeight: '300',
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  signOutButton: {
    marginTop: 16,
    marginBottom: 12,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  footerSubtitle: {
    fontSize: 11,
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
