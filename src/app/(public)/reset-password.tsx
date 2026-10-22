/**
 * Altın İz — Yeni Şifre Belirleme Ekranı (reset-password)
 * 
 * Şifre sıfırlama bağlantısıyla gelen kullanıcının yeni şifre oluşturmasını sağlar.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { PasswordField } from '@/components/forms/PasswordField';
import { useTheme } from '@/hooks/useTheme';

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = () => {
    // Şifre güncellendikten sonra giriş ekranına veya ana sayfaya yönlendirilir
    router.replace('/(public)/sign-in');
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
          Yeni Şifre Belirleyin
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
          Hesabınız için güçlü ve yeni bir şifre girin.
        </Text>
      </View>

      <View style={styles.form}>
        <PasswordField
          label="Yeni Şifre"
          placeholder="En az 8 karakter"
          value={newPassword}
          onChangeText={setNewPassword}
          hint="En az bir büyük harf ve bir rakam içermelidir."
        />

        <PasswordField
          label="Yeni Şifre Tekrarı"
          placeholder="Şifrenizi tekrar girin"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <PrimaryButton
          title="Şifreyi Güncelle"
          onPress={handleResetPassword}
          style={styles.submitButton}
        />
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
  },
});
