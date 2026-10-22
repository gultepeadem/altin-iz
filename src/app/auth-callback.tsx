/**
 * Altın İz — Kimlik Doğrulama Geri Dönüş Rotası (auth-callback)
 * 
 * E-posta doğrulama ve şifre sıfırlama derin bağlantılarını (deep links) karşılar.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { LoadingState } from '@/components/feedback/LoadingState';

export default function AuthCallbackScreen() {
  useEffect(() => {
    // Kimlik doğrulama işlemi tamamlandığında yönlendirir
    const timer = setTimeout(() => {
      router.replace('/(protected)/(tabs)');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <LoadingState message="Oturum doğrulanıyor, lütfen bekleyin..." />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
});
