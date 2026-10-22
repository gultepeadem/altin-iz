/**
 * Altın İz — Hakkında Ekranı (about)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useTheme } from '@/hooks/useTheme';

export default function AboutScreen() {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🪙</Text>
        <Text
          style={[
            styles.appName,
            { color: theme.colors.primary, fontSize: theme.typography.headline.fontSize },
          ]}
        >
          Altın İz
        </Text>
        <Text style={[styles.version, { color: theme.colors.textTertiary }]}>
          Sürüm 1.0.0 (V1)
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
          Misyonumuz
        </Text>
        <Text style={[styles.bodyText, { color: theme.colors.textSecondary }]}>
          Altın İz, bireysel altın birikimi yapan kullanıcıların güncel piyasa fiyatlarını
          kolayca izlemelerini, geçmiş alışlarını tek bir yerde güvenle kaydedip tahmini
          kâr-zarar durumlarını zahmetsizce takip etmelerini sağlar.
        </Text>

        <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
          Gizlilik ve Güvenlik
        </Text>
        <Text style={[styles.bodyText, { color: theme.colors.textSecondary }]}>
          Verileriniz PostgreSQL Row Level Security (RLS) teknolojisiyle yalnızca sizin
          erişiminize açık olarak saklanır. Başka hiçbir kullanıcı sizin portföyünüze
          ulaşamaz.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  appName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  version: {
    fontSize: 13,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
});
