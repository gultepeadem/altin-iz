/**
 * Altın İz — Public Rota Grubu Düzeni
 *
 * Not: reset-password rotası, kullanıcının oturumu açıkken hesap/profil ekranından
 * şifre sıfırlama linki talep ettiği senaryolarda da (PASSWORD_RECOVERY) erişilebilir olmalıdır.
 * Bu nedenle bu düzenleyici aktif oturumu olan kullanıcıları otomatik yönlendirerek engellemez.
 */

import React from 'react';
import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
