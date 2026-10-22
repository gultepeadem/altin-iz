/**
 * Altın İz — Şifremi Unuttum Ekranı (forgot-password)
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextField } from '@/components/forms/TextField';
import { useTheme } from '@/hooks/useTheme';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    setIsSent(true);
  };

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={true}>
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
          Şifre Sıfırlama
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
          Hesabınıza ait e-posta adresini girin; size şifre sıfırlama bağlantısı gönderelim.
        </Text>
      </View>

      <View style={styles.form}>
        {isSent ? (
          <View style={styles.successBox}>
            <Text
              style={[
                styles.successText,
                { color: theme.colors.profit, fontSize: theme.typography.body.fontSize },
              ]}
            >
              ✓ Sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
            </Text>
            <PrimaryButton
              title="Giriş Ekranına Dön"
              onPress={() => router.replace('/(public)/sign-in')}
              style={styles.submitButton}
            />
          </View>
        ) : (
          <>
            <TextField
              label="E-posta Adresi"
              placeholder="ornek@posta.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PrimaryButton
              title="Sıfırlama Bağlantısı Gönder"
              onPress={handleSend}
              style={styles.submitButton}
            />

            <SecondaryButton
              title="Giriş Ekranına Dön"
              onPress={() => router.back()}
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginBottom: 12,
  },
  successBox: {
    paddingVertical: 16,
  },
  successText: {
    marginBottom: 24,
    lineHeight: 22,
  },
});
