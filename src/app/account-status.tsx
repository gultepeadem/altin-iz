/**
 * Altın İz — Hesap Durumu Ekranı (account-status)
 * 
 * Hesap 'deletion_pending' veya 'disabled' durumundayken kullanıcıyı karşılar.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useTheme } from '@/hooks/useTheme';

export default function AccountStatusScreen() {
  const { theme } = useTheme();

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>⏳</Text>
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
          Hesap Durumu
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
          Hesabınız silinme sürecindedir veya geçici olarak askıya alınmıştır.
        </Text>
        <PrimaryButton
          title="Giriş Ekranına Dön"
          onPress={() => router.replace('/(public)/welcome')}
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  button: {
    width: 220,
  },
});
