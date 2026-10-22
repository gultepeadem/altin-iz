/**
 * Altın İz — Bulunamadı Ekranı (+not-found)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useTheme } from '@/hooks/useTheme';

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Sayfa Bulunamadı' }} />
      <ScreenContainer style={styles.container}>
        <View style={styles.content}>
          <Text
            style={[
              styles.emoji,
              { color: theme.colors.gold },
            ]}
          >
            🔍
          </Text>
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
            Sayfa Bulunamadı
          </Text>
          <Text
            style={[
              styles.message,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.body.fontSize,
              },
            ]}
          >
            Aradığınız ekran mevcut değil veya taşınmış olabilir.
          </Text>
          <Link
            href="/(protected)/(tabs)"
            style={[
              styles.link,
              {
                color: theme.colors.primary,
                fontSize: theme.typography.bodyBold.fontSize,
              },
            ]}
          >
            Ana Sayfaya Dön
          </Link>
        </View>
      </ScreenContainer>
    </>
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
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    textDecorationLine: 'underline',
  },
});
