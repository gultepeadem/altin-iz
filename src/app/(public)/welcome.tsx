/**
 * Altın İz — Karşılama Ekranı (welcome)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useTheme } from '@/hooks/useTheme';

export default function WelcomeScreen() {
  const { theme } = useTheme();

  return (
    <ScreenContainer style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.heroSection}>
        <Text style={styles.logoEmoji}>🪙</Text>
        <Text
          style={[
            styles.appName,
            {
              color: theme.colors.primary,
              fontSize: theme.typography.display.fontSize,
              fontWeight: theme.typography.display.fontWeight,
            },
          ]}
        >
          Altın İz
        </Text>
        <Text
          style={[
            styles.tagline,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.subtitle.fontSize,
            },
          ]}
        >
          Altınlarını Kaydet, Değerini İzle
        </Text>
      </View>

      <View style={styles.actionSection}>
        <PrimaryButton
          title="Giriş Yap"
          onPress={() => router.push('/(public)/sign-in')}
          style={styles.button}
        />
        <SecondaryButton
          title="Yeni Hesap Oluştur"
          onPress={() => router.push('/(public)/sign-up')}
          style={styles.button}
        />
        <SecondaryButton
          title="Uygulamayı İncele (Demo)"
          onPress={() => router.replace('/(protected)/(tabs)')}
          style={styles.demoButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 16,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    marginBottom: 8,
  },
  tagline: {
    textAlign: 'center',
  },
  actionSection: {
    width: '100%',
    paddingBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  demoButton: {
    marginTop: 4,
  },
});
