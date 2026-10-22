/**
 * Altın İz — Kayıt Ol Ekranı (sign-up)
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { PasswordField } from '@/components/forms/PasswordField';
import { useTheme } from '@/hooks/useTheme';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    // Kayıt sonrası e-posta doğrulama ekranına yönlendirilir
    router.push('/(public)/verify-email');
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
          placeholder="En az 8 karakter"
          value={password}
          onChangeText={setPassword}
          hint="Şifreniz en az bir büyük harf ve bir rakam içermelidir."
        />

        <PasswordField
          label="Şifre Tekrarı"
          placeholder="Şifrenizi tekrar girin"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <PrimaryButton
          title="Kayıt Ol"
          onPress={handleSignUp}
          style={styles.submitButton}
        />

        <View style={styles.footerRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Zaten hesabınız var mı?</Text>
          <Pressable onPress={() => router.push('/(public)/sign-in')}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              {' '}Giriş Yap
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
  submitButton: {
    marginTop: 8,
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
