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
import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { useTheme } from '@/hooks/useTheme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { theme } = useTheme();

  return (
    <>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(protected)" />
        <Stack.Screen name="account-status" />
        <Stack.Screen name="auth-callback" />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  React.useEffect(() => {
    // Kök düzen yüklendiğinde açılış (splash) ekranını kapat
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
