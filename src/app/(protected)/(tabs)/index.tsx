/**
 * Altın İz — Ana Sayfa Ekranı (tabs/index)
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useTheme } from '@/hooks/useTheme';

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable={true}>
      {/* Portföy Özet Kartı */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.cardBorder,
          },
        ]}
      >
        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
          Toplam Portföy Değeri
        </Text>
        <Text
          style={[
            styles.cardValue,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.display.fontSize,
              fontWeight: theme.typography.display.fontWeight,
            },
          ]}
        >
          0,00 TL
        </Text>

        <View style={styles.metricsRow}>
          <View>
            <Text style={[styles.metricLabel, { color: theme.colors.textTertiary }]}>
              Ödenen Tutar
            </Text>
            <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
              0,00 TL
            </Text>
          </View>

          <View style={styles.metricRight}>
            <Text style={[styles.metricLabel, { color: theme.colors.textTertiary }]}>
              Kâr / Zarar
            </Text>
            <Text style={[styles.metricValue, { color: theme.colors.textSecondary }]}>
              0,00 TL (%0)
            </Text>
          </View>
        </View>
      </View>

      {/* Hızlı İşlem Butonları */}
      <View style={styles.actionsRow}>
        <PrimaryButton
          title="+ Altın Ekle"
          onPress={() => router.push('/(protected)/portfolio/add')}
          style={styles.actionButton}
        />
        <SecondaryButton
          title="Hesapla"
          onPress={() => router.push('/(protected)/(tabs)/calculator')}
          style={styles.actionButton}
        />
      </View>

      {/* Piyasa Özeti Başlığı */}
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.title.fontSize,
              fontWeight: theme.typography.title.fontWeight,
            },
          ]}
        >
          Piyasa Özeti
        </Text>
        <Pressable onPress={() => router.push('/(protected)/(tabs)/prices')}>
          <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
            Tümünü Gör →
          </Text>
        </Pressable>
      </View>

      {/* Örnek Fiyat Kartları */}
      <Pressable
        onPress={() => router.push('/(protected)/gold/gram-altin')}
        style={[
          styles.priceRow,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.productName, { color: theme.colors.textPrimary }]}>
            Gram Altın
          </Text>
          <Text style={[styles.productUnit, { color: theme.colors.textTertiary }]}>
            Canlı Takip
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text style={[styles.priceValue, { color: theme.colors.textPrimary }]}>
            Alış: 3.120 TL
          </Text>
          <Text style={[styles.priceSubValue, { color: theme.colors.textSecondary }]}>
            Satış: 3.140 TL
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push('/(protected)/gold/ceyrek-altin')}
        style={[
          styles.priceRow,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.productName, { color: theme.colors.textPrimary }]}>
            Çeyrek Altın
          </Text>
          <Text style={[styles.productUnit, { color: theme.colors.textTertiary }]}>
            Yeni Tarihli
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text style={[styles.priceValue, { color: theme.colors.textPrimary }]}>
            Alış: 5.090 TL
          </Text>
          <Text style={[styles.priceSubValue, { color: theme.colors.textSecondary }]}>
            Satış: 5.145 TL
          </Text>
        </View>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  cardValue: {
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  metricRight: {
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {},
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  productUnit: {
    fontSize: 12,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  priceSubValue: {
    fontSize: 13,
  },
});
