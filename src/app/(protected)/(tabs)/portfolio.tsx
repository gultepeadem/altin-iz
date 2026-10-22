/**
 * Altın İz — Portföyüm Ekranı (tabs/portfolio)
 * src/app/(protected)/(tabs)/portfolio.tsx
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 14 (Portföy Sistemi)
 * Karar Referansları:
 * - ADR-007 (Minor Para Birimi - Kuruş)
 * - ADR-010 (Portföy Değerleme Yöntemi: Miktar × Güncel Alış Fiyatı)
 * - ADR-013 (Fiyat Bulunamadığında Davranış: Kısmi Toplam İzolasyonu)
 * - ADR-014 (Eski Fiyat Davranışı: Stale Bildirimi)
 * - ADR-032 (Sayısal Hassasiyet)
 */

import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PartialDataBanner,
  StaleDataBanner,
} from '@/components/feedback';
import { useTheme } from '@/hooks/useTheme';
import { portfolioService } from '@/services/portfolioService';
import type { PortfolioEntryWithValuation } from '@/models/portfolio';
import type { PortfolioSummaryResult } from '@/domain/calculations';
import {
  formatDate,
  formatMoney,
  formatPercent,
  formatQuantity,
} from '@/utils/formatters';

export default function PortfolioScreen() {
  const { theme, isDark } = useTheme();

  const [items, setItems] = useState<PortfolioEntryWithValuation[]>([]);
  const [summary, setSummary] = useState<PortfolioSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Portföy verilerini canlı Supabase servisinden çeker
  const fetchPortfolio = useCallback(async (isPull = false) => {
    if (isPull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await portfolioService.getEntriesWithValuation();
      setItems(result.items);
      setSummary(result.summary);
    } catch (err: any) {
      const message =
        err?.userMessage || err?.message || 'Portföy verileri yüklenirken bir sorun oluştu.';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Ekran odağa her geldiğinde (ör. ekleme, düzenleme, silme sonrası dönüşte) güncel verileri yükle
  useFocusEffect(
    useCallback(() => {
      fetchPortfolio(false);
    }, [fetchPortfolio])
  );

  // İlk yükleme esnasında yükleme göstergesi
  if (loading && items.length === 0) {
    return (
      <ScreenContainer scrollable={false} edges={['top', 'left', 'right']}>
        <LoadingState message="Portföyünüz yükleniyor..." fullScreen />
      </ScreenContainer>
    );
  }

  // Hata durumu ve henüz liste yüklenmemişse
  if (error && items.length === 0) {
    return (
      <ScreenContainer scrollable={false} edges={['top', 'left', 'right']}>
        <ErrorState
          title="Portföy Yüklenemedi"
          message={error}
          onRetry={() => fetchPortfolio(false)}
        />
      </ScreenContainer>
    );
  }

  // Portföy tamamen boş ise
  if (!loading && items.length === 0) {
    return (
      <ScreenContainer scrollable={false} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPortfolio(true)}
              colors={[theme.colors.gold]}
              tintColor={theme.colors.gold}
            />
          }
        >
          <EmptyState
            title="Henüz altın kaydınız yok"
            description="Satın aldığınız altınları portföyünüze ekleyerek güncel bozdurma değerlerini ve kâr-zarar durumunuzu anlık takip edin."
            icon={<Text style={styles.emptyIcon}>🪙</Text>}
            actionTitle="+ İlk Altınını Ekle"
            onAction={() => router.push('/(protected)/portfolio/add')}
            style={styles.emptyContainer}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Özet kartındaki kâr/zarar rengi ve metin formatı
  const getSummaryProfitLossDisplay = () => {
    if (!summary || summary.totalProfitLossMinor === null) {
      return {
        text: 'Hesaplanamıyor',
        color: theme.colors.warning,
      };
    }

    const isProfit = summary.totalProfitLossMinor > 0;
    const isLoss = summary.totalProfitLossMinor < 0;

    const sign = isProfit ? '+' : '';
    const formattedAmount = formatMoney(summary.totalProfitLossMinor);
    const formattedRate = formatPercent(summary.totalProfitLossPercentage);

    return {
      text: `${sign}${formattedAmount} (${formattedRate})`,
      color: isProfit
        ? theme.colors.profit
        : isLoss
          ? theme.colors.loss
          : theme.colors.textPrimary,
    };
  };

  // Liste başlığı bileşeni (Özet Kartı, Uyarı Şeritleri ve Liste Başlığı)
  const renderHeader = () => {
    const plDisplay = getSummaryProfitLossDisplay();

    return (
      <View style={styles.headerContainer}>
        {/* Konsolide Portföy Özet Kartı */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.summaryTopRow}>
            <Text style={[styles.summarySubtitle, { color: theme.colors.textSecondary }]}>
              Tahmini Güncel Bozdurma Değeri
            </Text>
            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: isDark ? theme.colors.surfaceElevated : theme.colors.goldLight,
                  borderColor: theme.colors.gold,
                },
              ]}
            >
              <Text style={[styles.countBadgeText, { color: theme.colors.gold }]}>
                {summary?.totalEntries ?? items.length} Kayıt
              </Text>
            </View>
          </View>

          {/* Ana Değer Gösterimi (ADR-010) */}
          <Text
            style={[
              styles.summaryHeadline,
              { color: theme.colors.textPrimary },
            ]}
          >
            {summary && summary.totalCurrentValueMinor > 0
              ? formatMoney(summary.totalCurrentValueMinor)
              : summary && summary.totalEntries === 0
                ? '0,00 TL'
                : 'Hesaplanamıyor'}
          </Text>

          {/* Maliyet ve Kâr/Zarar İstatistikleri */}
          <View style={[styles.summaryDetailsRow, { borderTopColor: theme.colors.divider }]}>
            <View style={styles.statColumn}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Ödenen Maliyet
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {formatMoney(summary?.totalCostMinor ?? 0)}
              </Text>
            </View>

            <View style={styles.statColumnRight}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Kâr / Zarar
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: plDisplay.color, fontWeight: '700' },
                ]}
              >
                {plDisplay.text}
              </Text>
            </View>
          </View>

          {/* Hızlı Ekleme Butonu */}
          <PrimaryButton
            title="+ Yeni Altın Ekle"
            onPress={() => router.push('/(protected)/portfolio/add')}
            style={styles.cardAddButton}
          />
        </View>

        {/* Kısmi Portföy Uyarısı (ADR-013) */}
        {summary?.hasMissingPrice || summary?.isPartial ? (
          <PartialDataBanner
            message={`Kısmi Toplam: ${summary.unpricedEntries} adet kaydınızın güncel fiyatı temin edilemediği için kâr-zarar yalnızca fiyatı bulunan kayıtlar üzerinden hesaplanmıştır (ADR-013).`}
            style={styles.bannerSpacing}
          />
        ) : null}

        {/* Eski Fiyat Uyarısı (ADR-014) */}
        {summary?.isStale ? (
          <StaleDataBanner
            message={`Eski Fiyat Uyarısı: ${summary.staleEntries} adet kayıt 15 dakikadan eski piyasa verileriyle hesaplanmıştır (ADR-014).`}
            onRefresh={() => fetchPortfolio(true)}
            style={styles.bannerSpacing}
          />
        ) : null}

        {/* Kayıtlar Liste Başlığı */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeaderTitle, { color: theme.colors.textPrimary }]}>
            Altın Kayıtlarım
          </Text>
          <Text style={[styles.listHeaderSubtitle, { color: theme.colors.textSecondary }]}>
            En yeni alıştan eskiye
          </Text>
        </View>
      </View>
    );
  };

  // Liste Elemanı (Tekil Portföy Kaydı Kartı)
  const renderItem = ({ item }: { item: PortfolioEntryWithValuation }) => {
    const { entry, valuation, latestPrice } = item;
    const isStale = latestPrice ? latestPrice.status === 'stale' || latestPrice.isProviderStale : false;
    const unitLabel = entry.product?.measurementUnit === 'gram' ? 'Gram' : 'Adet';

    // Kayıt bazında kâr/zarar rengi ve gösterimi
    let profitLossText = 'Hesaplanamıyor';
    let profitLossColor = theme.colors.warning;

    if (valuation.status === 'profit') {
      profitLossText = `+${formatMoney(valuation.profitLossMinor)} (${formatPercent(valuation.profitLossPercentage)})`;
      profitLossColor = theme.colors.profit;
    } else if (valuation.status === 'loss') {
      profitLossText = `${formatMoney(valuation.profitLossMinor)} (${formatPercent(valuation.profitLossPercentage)})`;
      profitLossColor = theme.colors.loss;
    } else if (valuation.status === 'even') {
      profitLossText = '0,00 TL (%0,00)';
      profitLossColor = theme.colors.textPrimary;
    }

    return (
      <Pressable
        onPress={() => router.push(`/(protected)/portfolio/${entry.id}`)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${entry.product?.name ?? 'Altın'}, ${formatQuantity(entry.quantity)} ${unitLabel}, Detayları görmek için dokunun`}
        style={({ pressed }) => [
          styles.entryCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.cardBorder,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        {/* Kart Üst Başlık Satırı */}
        <View style={styles.entryHeaderRow}>
          <View style={styles.entryTitleGroup}>
            <Text style={[styles.entryTitle, { color: theme.colors.textPrimary }]}>
              {entry.product?.name ?? 'Altın'}
            </Text>
            {entry.product?.shortName ? (
              <View
                style={[
                  styles.shortNameBadge,
                  { backgroundColor: isDark ? theme.colors.surfaceElevated : theme.colors.primaryLight },
                ]}
              >
                <Text style={styles.shortNameText}>{entry.product.shortName}</Text>
              </View>
            ) : null}
          </View>

          {/* Miktar Rozeti */}
          <View
            style={[
              styles.quantityBadge,
              {
                backgroundColor: isDark ? theme.colors.surfaceElevated : theme.colors.goldLight,
                borderColor: theme.colors.gold,
              },
            ]}
          >
            <Text style={[styles.quantityBadgeText, { color: theme.colors.gold }]}>
              {formatQuantity(entry.quantity)} {unitLabel}
            </Text>
          </View>
        </View>

        {/* Alış Tarihi ve Varsa Alış Yeri */}
        <View style={styles.entryMetaRow}>
          <Text style={[styles.entryDate, { color: theme.colors.textTertiary }]}>
            Alış: {formatDate(entry.purchaseDate)}
          </Text>
          {entry.purchasePlace ? (
            <Text style={[styles.entryPlace, { color: theme.colors.textTertiary }]}>
              {' • '}{entry.purchasePlace}
            </Text>
          ) : null}
          {isStale ? (
            <View
              style={[
                styles.staleChip,
                { backgroundColor: theme.colors.warningLight },
              ]}
            >
              <Text style={[styles.staleChipText, { color: theme.colors.warning }]}>
                🕒 Eski Fiyat
              </Text>
            </View>
          ) : null}
        </View>

        {/* Değerleme ve Maliyet Tablosu */}
        <View style={[styles.entryMetricsGrid, { borderTopColor: theme.colors.divider }]}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              Ödenen Maliyet
            </Text>
            <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
              {formatMoney(entry.totalCostMinor)}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              Tahmini Değer
            </Text>
            <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
              {valuation.currentValueMinor !== null
                ? formatMoney(valuation.currentValueMinor)
                : 'Fiyat Yok'}
            </Text>
          </View>

          <View style={styles.metricItemRight}>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              Kâr / Zarar
            </Text>
            <Text
              style={[
                styles.metricValue,
                { color: profitLossColor, fontWeight: '700' },
              ]}
            >
              {profitLossText}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer scrollable={false} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.entry.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPortfolio(true)}
            colors={[theme.colors.gold]}
            tintColor={theme.colors.gold}
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    paddingTop: 8,
    marginBottom: 8,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summarySubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  countBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  summaryHeadline: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  summaryDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  statColumn: {
    flex: 1,
  },
  statColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardAddButton: {
    marginTop: 4,
  },
  bannerSpacing: {
    marginBottom: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listHeaderSubtitle: {
    fontSize: 12,
  },
  entryCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  shortNameBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shortNameText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  quantityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  entryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  entryDate: {
    fontSize: 12,
  },
  entryPlace: {
    fontSize: 12,
  },
  staleChip: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  staleChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  entryMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  metricItem: {
    flex: 1,
  },
  metricItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyScroll: {
    flexGrow: 1,
  },
  emptyContainer: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 56,
  },
});
