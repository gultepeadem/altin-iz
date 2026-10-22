/**
 * Altın İz — Hesap Bilgileri Ekranı (account/index)
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextField } from '@/components/forms/TextField';
import { useTheme } from '@/hooks/useTheme';

export default function AccountScreen() {
  const { theme } = useTheme();
  const [displayName, setDisplayName] = useState('Adem Gültepe');
  const [email] = useState('gultepeeadem02@gmail.com');

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={true}>
      <View style={[styles.profileHeader, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>AG</Text>
        </View>
        <Text style={[styles.emailText, { color: theme.colors.textSecondary }]}>
          {email}
        </Text>
        <Text style={[styles.statusBadge, { color: theme.colors.profit }]}>
          ✓ E-posta Doğrulandı (Aktif)
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Görünen Ad"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <TextField
          label="E-posta Adresi"
          value={email}
          editable={false}
          hint="E-posta adresinizi değiştirmek için destekle iletişime geçin."
        />

        <PrimaryButton
          title="Profili Güncelle"
          onPress={() => {}}
          style={styles.saveBtn}
        />

        <SecondaryButton
          title="Hesabımı Silmek İstiyorum"
          onPress={() => router.push('/(protected)/account/delete')}
          style={styles.deleteBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  emailText: {
    fontSize: 14,
    marginBottom: 6,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    paddingBottom: 24,
  },
  saveBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  deleteBtn: {
    borderColor: '#C43D4B',
  },
});
