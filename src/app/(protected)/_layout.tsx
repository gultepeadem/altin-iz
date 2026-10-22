/**
 * Altın İz — Protected Rota Grubu Düzeni
 */

import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';

export default function ProtectedLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="gold/[productId]"
        options={{ title: 'Altın Detayı', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="portfolio/add"
        options={{ title: 'Altın Ekle', presentation: 'modal' }}
      />
      <Stack.Screen
        name="portfolio/[entryId]"
        options={{ title: 'Kayıt Detayı', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="portfolio/[entryId]/edit"
        options={{ title: 'Kaydı Düzenle', presentation: 'modal' }}
      />
      <Stack.Screen
        name="account/index"
        options={{ title: 'Hesap Ayarları', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="account/delete"
        options={{ title: 'Hesabı Sil', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="legal/index"
        options={{ title: 'Yasal Belgeler', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="legal/[documentType]"
        options={{ title: 'Yasal Belge', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="about"
        options={{ title: 'Hakkında', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="support"
        options={{ title: 'Destek', headerBackTitle: 'Geri' }}
      />
    </Stack>
  );
}
