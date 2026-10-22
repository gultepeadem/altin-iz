/**
 * Altın İz — Hesap Silme Onay Ekranı (account/delete)
 * 
 * KVKK ve mağaza ilkelerine uygun kalıcı hesap ve veri silme akışıdır.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { DangerButton } from '@/components/common/DangerButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { PasswordField } from '@/components/forms/PasswordField';
import { useTheme } from '@/hooks/useTheme';

export default function AccountDeleteScreen() {
  const { theme } = useTheme();
  const [password, setPassword] = useState('');

  const handleConfirmDelete = () => {
    // Hesap silme isteği Supabase Edge Function üzerinden yürütülecek (Faz 13)
    router.replace('/(public)/welcome');
  };

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={true}>
      <View style={[styles.warningBox, { backgroundColor: theme.colors.lossLight, borderColor: theme.colors.loss }]}>
        <Text style={[styles.warningTitle, { color: theme.colors.loss }]}>
          ⚠️ Bu işlem geri alınamaz!
        </Text>
        <Text style={[styles.warningText, { color: theme.colors.textPrimary }]}>
          Hesabınızı sildiğinizde portföyünüze eklediğiniz bütün altın kayıtları, tercihleriniz ve kimlik bilgileriniz kalıcı olarak silinecektir.
        </Text>
      </View>

      <View style={styles.form}>
        <PasswordField
          label="Onaylamak için şifrenizi girin"
          placeholder="Mevcut şifreniz"
          value={password}
          onChangeText={setPassword}
          hint="Güvenliğiniz için bu işlemi yalnızca geçerli şifrenizle onaylayabilirsiniz."
        />

        <DangerButton
          title="Hesabımı ve Verilerimi Kalıcı Olarak Sil"
          onPress={handleConfirmDelete}
          style={styles.deleteBtn}
        />

        <SecondaryButton
          title="Vazgeç ve Geri Dön"
          onPress={() => router.back()}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  warningBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    paddingBottom: 24,
  },
  deleteBtn: {
    marginTop: 8,
    marginBottom: 12,
  },
});
