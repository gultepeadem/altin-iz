/**
 * Altın İz — Portföyüm Ekranı (tabs/portfolio)
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useTheme } from '@/hooks/useTheme';

export default function PortfolioScreen() {
  const { theme } = useTheme();
  // Boş durum veya dolu durum testi için durum
  const [hasEntries, setHasEntries] = useState(false);

  return (
    <ScreenContainer scrollable={true}>
      {!hasEntries ? (
        <EmptyState
          title="Henüz altın kaydınız yok"
          description="Satın aldığınız altınları kaydederek güncel değerlerini ve kâr-zarar durumunuzu kolayca takip edin."
          icon={<Text style={styles.emptyIcon}>🪙</Text>}
          actionTitle="+ İlk Altınını Ekle"
          onAction={() => router.push('/(protected)/portfolio/add')}
          style={styles.emptyContainer}
        />
      ) : (
        <View>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.summaryTitle, { color: theme.colors.textSecondary }]}>
              Portföy Toplamı
            </Text>
            <Text
              style={[
                styles.totalValue,
                { color: theme.colors.textPrimary, fontSize: theme.typography.headline.fontSize },
              ]}
            >
              31.205,00 TL
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/(protected)/portfolio/123')}
            style={[
              styles.entryCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View>
              <Text style={[styles.entryTitle, { color: theme.colors.textPrimary }]}>
                Gram Altın (10 gr)
              </Text>
              <Text style={[styles.entryDate, { color: theme.colors.textTertiary }]}>
                Alış: 15.09.2026
              </Text>
            </View>
            <Text style={[styles.entryValue, { color: theme.colors.profit }]}>
              +1.200 TL (%4)
            </Text>
          </Pressable>
        </View>
      )}

      {/* Geliştirme testi için geçiş düğmesi */}
      <Pressable
        onPress={() => setHasEntries((prev) => !prev)}
        style={styles.devToggle}
      >
        <Text style={[styles.devToggleText, { color: theme.colors.textTertiary }]}>
          [Geliştirme: {hasEntries ? 'Dolu' : 'Boş'} Durumunu Değiştir]
        </Text>
      </Pressable>

      {hasEntries ? (
        <PrimaryButton
          title="+ Yeni Altın Ekle"
          onPress={() => router.push('/(protected)/portfolio/add')}
          style={styles.addButton}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 56,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  totalValue: {
    fontWeight: '700',
  },
  entryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
  },
  entryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  devToggle: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  devToggleText: {
    fontSize: 11,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
