/**
 * Altın İz — Altın Detay Ekranı (gold/[productId])
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useTheme } from '@/hooks/useTheme';

export default function GoldDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { theme } = useTheme();

  const formattedTitle = (productId ?? 'Altın')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <ScreenContainer scrollable={true}>
      <View style={[styles.mainCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.productName, { color: theme.colors.textPrimary }]}>
          {formattedTitle}
        </Text>
        <Text style={[styles.sourceText, { color: theme.colors.textTertiary }]}>
          Veri Kaynağı: AltinAPI • Canlı
        </Text>

        <View style={styles.pricesRow}>
          <View style={styles.priceBox}>
            <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
              Alış Fiyatı (Bozdurma)
            </Text>
            <Text style={[styles.priceVal, { color: theme.colors.textPrimary }]}>
              3.120,50 TL
            </Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
              Satış Fiyatı (Satın Alma)
            </Text>
            <Text style={[styles.priceVal, { color: theme.colors.textPrimary }]}>
              3.140,00 TL
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <PrimaryButton
          title="Portföye Ekle"
          onPress={() => router.push('/(protected)/portfolio/add')}
          style={styles.actionBtn}
        />
        <SecondaryButton
          title="Hesapla"
          onPress={() => router.push('/(protected)/(tabs)/calculator')}
          style={styles.actionBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 12,
    marginBottom: 20,
  },
  pricesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  priceBox: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceVal: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
});
