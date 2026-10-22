/**
 * Altın İz — Kök Düzen (app/_layout.tsx)
 * 
 * ARCHITECTURE.md Section 7.1 ve Section 9 uyarınca ThemeProvider ve AuthProvider'ı bağlar
 * ve kök Stack navigasyon yapısını tanımlar.
 */

import React from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  React.useEffect(() => {
    // Kök düzen yüklendiğinde açılış (splash) ekranını kapat
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(protected)" />
          <Stack.Screen name="account-status" />
          <Stack.Screen name="auth-callback" />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
