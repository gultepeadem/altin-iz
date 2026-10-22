/**
 * Altın İz — Portföy Kayıt Detay Ekranı (portfolio/[entryId])
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { DangerButton } from '@/components/common/DangerButton';
import { useTheme } from '@/hooks/useTheme';

export default function PortfolioEntryDetailScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const { theme } = useTheme();

  const handleDelete = () => {
    // Silme işlemi
    router.back();
  };

  return (
    <ScreenContainer scrollable={true}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.productTitle, { color: theme.colors.textPrimary }]}>
          Gram Altın
        </Text>
        <Text style={[styles.entryIdText, { color: theme.colors.textTertiary }]}>
          Kayıt No: #{entryId}
        </Text>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Miktar:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>10 Gram</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Alış Tarihi:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>15.09.2026</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Ödenen Tutar:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>30.000,00 TL</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Güncel Değer:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>31.205,00 TL</Text>
        </View>

        <View style={[styles.detailRow, styles.lastRow]}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Tahmini Kâr/Zarar:</Text>
          <Text style={[styles.profitValue, { color: theme.colors.profit }]}>+1.205,00 TL (%4,02)</Text>
        </View>
      </View>

      <PrimaryButton
        title="Kaydı Düzenle"
        onPress={() => router.push(`/(protected)/portfolio/${entryId}/edit`)}
        style={styles.editButton}
      />

      <DangerButton
        title="Kaydı Sil"
        onPress={handleDelete}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 20,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  entryIdText: {
    fontSize: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  profitValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  editButton: {
    marginBottom: 12,
  },
});
