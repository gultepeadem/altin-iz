/**
 * Altın İz — Başlangıç Yönlendirmesi (app/index.tsx)
 * 
 * ARCHITECTURE.md Section 7.2 ve Section 8.4 kurallarına göre oturum durumuna göre yönlendirir:
 * - loading: Açılış yüklenme göstergesi (sonsuz döngüyü engeller)
 * - unauthenticated: /(public)/welcome
 * - unverified: /(public)/verify-email
 * - disabled veya deletion_pending: /account-status
 * - active: /(protected)/(tabs)
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export default function Index() {
  const { status, isLoading } = useAuth();
  const { theme } = useTheme();

  React.useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  // Oturum durumu henüz netleşmeden yönlendirme yapılmaz (Sonsuz yönlendirme engeli)
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </View>
    );
  }

  if (status === 'unverified') {
    return <Redirect href="/(public)/verify-email" />;
  }

  if (status === 'disabled' || status === 'deletion_pending') {
    return <Redirect href="/account-status" />;
  }

  if (status === 'active') {
    return <Redirect href="/(protected)/(tabs)" />;
  }

  // Varsayılan: unauthenticated
  return <Redirect href="/(public)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
