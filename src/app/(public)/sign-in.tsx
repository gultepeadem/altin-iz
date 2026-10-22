/**
 * Altın İz — Giriş Yap Ekranı (sign-in)
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { PasswordField } from '@/components/forms/PasswordField';
import { useTheme } from '@/hooks/useTheme';

export default function SignInScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // Auth entegrasyonu Faz 5'te bağlanacak, şimdilik yönlendirir
    router.replace('/(protected)/(tabs)');
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
          Giriş Yap
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
          Portföyünüze erişmek için bilgilerinizi girin.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="E-posta Adresi"
          placeholder="ornek@posta.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <PasswordField
          label="Şifre"
          placeholder="Şifrenizi girin"
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          onPress={() => router.push('/(public)/forgot-password')}
          style={styles.forgotPasswordButton}
        >
          <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
            Şifremi Unuttum
          </Text>
        </Pressable>

        <PrimaryButton
          title="Giriş Yap"
          onPress={handleSignIn}
          style={styles.submitButton}
        />

        <View style={styles.footerRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Hesabınız yok mu?</Text>
          <Pressable onPress={() => router.push('/(public)/sign-up')}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              {' '}Kayıt Ol
            </Text>
          </Pressable>
        </View>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginBottom: 20,
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
});
