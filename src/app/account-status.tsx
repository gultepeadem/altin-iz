/**
 * Altın İz — Hesap Durumu Ekranı (account-status)
 *
 * Hesap 'deletion_pending' veya 'disabled' durumundayken kullanıcıyı karşılar.
 * Kullanıcının oturumu güvenle kapatmasını ve destek ekibiyle iletişime geçmesini sağlar.
 */

import React, { useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export default function AccountStatusScreen() {
  const { theme } = useTheme();
  const { status, profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isDeletionPending = status === 'deletion_pending' || profile?.accountStatus === 'deletion_pending';

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace('/(public)/welcome');
    } catch {
      router.replace('/(public)/welcome');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:destek@altiniz.app?subject=Altın İz Hesap Durumu İtirazı').catch(() => {});
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: isDeletionPending
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(245, 158, 11, 0.12)',
            },
          ]}
        >
          <Feather
            name={isDeletionPending ? 'trash-2' : 'alert-octagon'}
            size={40}
            color={isDeletionPending ? theme.colors.loss : theme.colors.warning}
          />
        </View>

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
          {isDeletionPending ? 'Hesap Silme Sürecinde' : 'Hesabınız Askıya Alındı'}
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
          {isDeletionPending
            ? 'Hesabınız ve ilişkili tüm portföy verileriniz için silme talebi alınmıştır. Veritabanı temizleme ve anonimleştirme işlemi devam ederken uygulamaya erişiminiz kısıtlanmıştır.'
            : 'Hesabınız güvenlik veya kullanım koşulları ihlali gerekçesiyle geçici olarak devre dışı bırakılmıştır. Yeni portföy kaydı oluşturulamaz veya veriler görüntülenemez.'}
        </Text>

        {/* Destek İletişim Kutusu */}
        <View
          style={[
            styles.supportBox,
            { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
          ]}
        >
          <Feather name="mail" size={16} color={theme.colors.gold} style={styles.supportIcon} />
          <View style={styles.supportTextWrap}>
            <Text style={[styles.supportLabel, { color: theme.colors.textTertiary }]}>
              Destek ve İtiraz Kanalı
            </Text>
            <Text
              onPress={handleEmailSupport}
              style={[styles.supportEmail, { color: theme.colors.gold }]}
              accessibilityRole="link"
            >
              destek@altiniz.app
            </Text>
          </View>
        </View>

        {/* Aksiyon Butonları */}
        <View style={styles.buttonGroup}>
          <PrimaryButton
            title={isSigningOut ? 'Çıkış Yapılıyor...' : 'Oturumu Kapat'}
            onPress={handleSignOut}
            disabled={isSigningOut}
            style={styles.actionButton}
          />

          <SecondaryButton
            title="Destek Ekibine Yaz"
            onPress={handleEmailSupport}
            style={styles.actionButton}
          />
        </View>

        {isSigningOut ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.gold}
            style={styles.loadingIndicator}
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  supportIcon: {
    marginRight: 12,
  },
  supportTextWrap: {
    flex: 1,
  },
  supportLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  supportEmail: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  loadingIndicator: {
    marginTop: 12,
  },
});
