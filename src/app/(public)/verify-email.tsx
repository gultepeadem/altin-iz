/**
 * Altın İz — E-posta Doğrulama Ekranı (verify-email)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useTheme } from '@/hooks/useTheme';

export default function VerifyEmailScreen() {
  const { theme } = useTheme();

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✉️</Text>
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
          E-postanızı Doğrulayın
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
          Kayıt işlemini tamamlamak için e-posta adresinize gönderdiğimiz doğrulama bağlantısına tıklayın.
        </Text>

        <PrimaryButton
          title="Doğruladım, Giriş Yap"
          onPress={() => router.replace('/(public)/sign-in')}
          style={styles.button}
        />

        <SecondaryButton
          title="Doğrulama E-postasını Tekrar Gönder"
          onPress={() => {}}
          style={styles.resendButton}
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
    fontSize: 56,
    marginBottom: 20,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 28,
    maxWidth: 320,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 12,
  },
  resendButton: {
    width: '100%',
    maxWidth: 280,
  },
});
