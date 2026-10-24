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

import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

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

function getGoldIcon(code: string): 'disc' | 'award' | 'shield' | 'globe' | 'layers' {
  const c = code.toUpperCase();
  if (c.includes('ONS') || c.includes('OUNCE')) return 'globe';
  if (c.includes('ATA') || c.includes('CUMHURIYET') || c.includes('RESAT') || c.includes('HAMIT')) return 'shield';
  if (c.includes('CEYREK') || c.includes('YARIM') || c.includes('TAM')) return 'award';
  if (c.includes('KULCE') || c.includes('GREMSE') || c.includes('BESLI')) return 'layers';
  return 'disc';
}

export default function PortfolioScreen() {
  const { theme, isDark } = useTheme();

  const [items, setItems] = useState<PortfolioEntryWithValuation[]>([]);
  const [summary, setSummary] = useState<PortfolioSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Silme Onay Modalı Durumu
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

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

  // Sıralanmış portföy listesi
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.entry.purchaseDate).getTime();
      const dateB = new Date(b.entry.purchaseDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [items, sortOrder]);

  // Varlık dağılımı (Portföy payları yüzdesi)
  const assetDistribution = useMemo(() => {
    if (items.length === 0) return [];
    const groupMap = new Map<string, { name: string; shortName?: string; totalValue: number }>();
    let grandTotal = 0;

    for (const item of items) {
      const val = item.valuation.currentValueMinor ?? item.entry.totalCostMinor ?? 0;
      grandTotal += val;
      const key = item.entry.productId;
      const existing = groupMap.get(key);
      if (existing) {
        existing.totalValue += val;
      } else {
        groupMap.set(key, {
          name: item.entry.product?.name ?? 'Altın',
          shortName: item.entry.product?.shortName ?? undefined,
          totalValue: val,
        });
      }
    }

    if (grandTotal === 0) return [];

    const palette = ['#D4A72C', '#38BDF8', '#A78BFA', '#34D399', '#FB923C', '#F472B6'];
    const list = Array.from(groupMap.values()).map((g, idx) => ({
      ...g,
      color: palette[idx % palette.length],
      percentage: (g.totalValue / grandTotal) * 100,
    }));

    return list.sort((a, b) => b.percentage - a.percentage);
  }, [items]);

  // Özel modal ile kayıt silme işlemi
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await portfolioService.deleteEntry(deleteConfirmTarget.id);
      setDeleteConfirmTarget(null);
      fetchPortfolio(false);
    } catch {
      setDeleteConfirmTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirmTarget, isDeleting, fetchPortfolio]);

  // İlk yükleme esnasında yükleme göstergesi
  if (loading && items.length === 0) {
    return (
      <ScreenContainer scrollable={false} edges={['left', 'right']}>
        <LoadingState message="Portföyünüz yükleniyor..." fullScreen />
      </ScreenContainer>
    );
  }

  // Hata durumu ve henüz liste yüklenmemişse
  if (error && items.length === 0) {
    return (
      <ScreenContainer scrollable={false} edges={['left', 'right']}>
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
      <ScreenContainer scrollable={false} edges={['left', 'right']}>
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
            icon={<Feather name="briefcase" size={48} color={theme.colors.gold} />}
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
        amountText: 'Hesaplanamıyor',
        percentText: null,
        color: '#94A3B8',
        badgeBg: 'transparent',
      };
    }

    const isProfit = summary.totalProfitLossMinor > 0;
    const isLoss = summary.totalProfitLossMinor < 0;

    const formattedAmount = formatMoney(summary.totalProfitLossMinor);
    const formattedRate = formatPercent(summary.totalProfitLossPercentage);

    return {
      amountText: isProfit ? `+${formattedAmount}` : formattedAmount,
      percentText: formattedRate,
      color: isProfit
        ? '#4ADE80'
        : isLoss
          ? '#F87171'
          : '#FFFFFF',
      badgeBg: isProfit
        ? 'rgba(74, 222, 128, 0.15)'
        : isLoss
          ? 'rgba(248, 113, 113, 0.15)'
          : 'rgba(255, 255, 255, 0.1)',
    };
  };

  // Liste başlığı bileşeni (Özet Kartı, Varlık Dağılımı, Uyarı Şeritleri ve Liste Başlığı)
  const renderHeader = () => {
    const plDisplay = getSummaryProfitLossDisplay();

    return (
      <View style={styles.headerContainer}>
        {/* Konsolide Portföy Hero Kartı (#0F172A) */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: '#0F172A',
              borderColor: '#1E293B',
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleGroup}>
              <Feather name="shield" size={14} color="#D4A72C" style={{ marginRight: 6 }} />
              <Text style={styles.heroSubtitle}>
                Tahmini Güncel Bozdurma Değeri
              </Text>
            </View>
            <View style={styles.heroCountBadge}>
              <Text style={styles.heroCountBadgeText}>
                {summary?.totalEntries ?? items.length} Kayıt ›
              </Text>
            </View>
          </View>

          {/* Ana Değer Gösterimi (ADR-010) */}
          <Text style={styles.heroHeadline}>
            {summary && summary.totalCurrentValueMinor > 0
              ? formatMoney(summary.totalCurrentValueMinor)
              : summary && summary.totalEntries === 0
                ? '0,00 TL'
                : 'Hesaplanamıyor'}
          </Text>

          {/* Maliyet ve Kâr/Zarar İstatistikleri */}
          <View style={styles.heroDetailsRow}>
            <View style={styles.heroStatColumn}>
              <Text style={styles.heroStatLabel}>Ödenen Maliyet</Text>
              <Text style={styles.heroStatValue}>
                {formatMoney(summary?.totalCostMinor ?? 0)}
              </Text>
            </View>

            <View style={styles.heroStatDivider} />

            <View style={styles.heroStatColumnRight}>
              <Text style={styles.heroStatLabel}>Net Kâr / Zarar</Text>
              <View style={styles.heroPlValueRow}>
                <Text
                  style={[
                    styles.heroStatValue,
                    { color: plDisplay.color, fontWeight: '800' },
                  ]}
                  numberOfLines={1}
                >
                  {plDisplay.amountText}
                </Text>
                {plDisplay.percentText ? (
                  <View style={[styles.heroPlPercentBadge, { backgroundColor: plDisplay.badgeBg }]}>
                    <Text style={[styles.heroPlPercentBadgeText, { color: plDisplay.color }]}>
                      {plDisplay.percentText}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Hızlı Ekleme Butonu */}
          <PrimaryButton
            title="+ Yeni Altın Ekle"
            onPress={() => router.push('/(protected)/portfolio/add')}
            style={styles.heroAddBtn}
          />
        </View>

        {/* Varlık Dağılımı (Segmented Bar Chart) */}
        {assetDistribution.length > 0 && (
          <View
            style={[
              styles.distributionCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.distributionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="pie-chart" size={14} color={theme.colors.gold} style={{ marginRight: 6 }} />
                <Text style={[styles.distributionTitle, { color: theme.colors.textPrimary }]}>
                  Varlık Dağılımı
                </Text>
              </View>
              <Text style={[styles.distributionSubtitle, { color: theme.colors.textSecondary }]}>
                Portföy Payları
              </Text>
            </View>

            {/* Yatay Segmentli Dağılım Çubuğu */}
            <View style={styles.distributionBar}>
              {assetDistribution.map((dist, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.distributionSegment,
                    {
                      flex: dist.percentage,
                      backgroundColor: dist.color,
                      borderTopLeftRadius: idx === 0 ? 4 : 0,
                      borderBottomLeftRadius: idx === 0 ? 4 : 0,
                      borderTopRightRadius: idx === assetDistribution.length - 1 ? 4 : 0,
                      borderBottomRightRadius: idx === assetDistribution.length - 1 ? 4 : 0,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Dağılım Lejantı */}
            <View style={styles.distributionLegend}>
              {assetDistribution.map((dist, idx) => (
                <View key={idx} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: dist.color }]} />
                  <Text style={[styles.legendName, { color: theme.colors.textSecondary }]}>
                    {dist.shortName || dist.name}
                  </Text>
                  <Text style={[styles.legendPercent, { color: theme.colors.textPrimary }]}>
                    %{dist.percentage.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Kısmi Portföy Uyarısı (ADR-013 teknik kodu gizlendi) */}
        {summary?.hasMissingPrice || summary?.isPartial ? (
          <PartialDataBanner
            message={`Kısmi Toplam: ${summary.unpricedEntries} adet kaydınızın güncel fiyatı temin edilemediği için kâr-zarar yalnızca fiyatı bulunan kayıtlar üzerinden hesaplanmıştır.`}
            style={styles.bannerSpacing}
          />
        ) : null}

        {/* Eski Fiyat Uyarısı (ADR-014 teknik kodu gizlendi) */}
        {summary?.isStale ? (
          <StaleDataBanner
            message={`Eski Fiyat Uyarısı: ${summary.staleEntries} adet kayıt 15 dakikadan eski piyasa verileriyle hesaplanmıştır.`}
            onRefresh={() => fetchPortfolio(true)}
            style={styles.bannerSpacing}
          />
        ) : null}

        {/* Kayıtlar Liste Başlığı ve Sıralama Filtresi Hap Butonu */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeaderTitle, { color: theme.colors.textPrimary }]}>
            Altın Kayıtlarım
          </Text>
          <Pressable
            onPress={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
            style={[
              styles.sortPillButton,
              {
                backgroundColor: isDark ? theme.colors.surfaceElevated : '#F1F5F9',
                borderColor: theme.colors.border,
              },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Sıralama: ${sortOrder === 'newest' ? 'En yeni alıştan eskiye' : 'En eski alıştan yeniye'}`}
          >
            <Text style={[styles.sortPillText, { color: theme.colors.textSecondary }]}>
              {sortOrder === 'newest' ? 'En yeni alıştan eskiye' : 'En eski alıştan yeniye'}
            </Text>
            <Feather name="chevron-down" size={13} color={theme.colors.textSecondary} style={{ marginLeft: 4 }} />
          </Pressable>
        </View>
      </View>
    );
  };

  // Liste Elemanı (Tekil Portföy Kaydı Kartı)
  const renderItem = ({ item }: { item: PortfolioEntryWithValuation }) => {
    const { entry, valuation, latestPrice } = item;
    const isStale = latestPrice ? latestPrice.status === 'stale' || latestPrice.isProviderStale : false;
    const unitLabel = entry.product?.measurementUnit === 'gram' ? 'Gram' : 'Adet';
    const unitCostMinor = entry.quantity > 0 ? Math.round(entry.totalCostMinor / entry.quantity) : entry.totalCostMinor;

    // Kayıt bazında kâr/zarar rengi ve gösterimi
    let profitLossAmountText = 'Hesaplanamıyor';
    let profitLossPercentText: string | null = null;
    let profitLossColor = theme.colors.warning;
    let profitLossBadgeBg = 'transparent';

    if (valuation.status === 'profit') {
      profitLossAmountText = `+${formatMoney(valuation.profitLossMinor)}`;
      profitLossPercentText = formatPercent(valuation.profitLossPercentage);
      profitLossColor = theme.colors.profit;
      profitLossBadgeBg = isDark ? '#13281d' : '#e8f5e9';
    } else if (valuation.status === 'loss') {
      profitLossAmountText = `${formatMoney(valuation.profitLossMinor)}`;
      profitLossPercentText = formatPercent(valuation.profitLossPercentage);
      profitLossColor = theme.colors.loss;
      profitLossBadgeBg = isDark ? '#3b1c1c' : '#ffebee';
    } else if (valuation.status === 'even') {
      profitLossAmountText = '0,00 TL';
      profitLossPercentText = '%0,00';
      profitLossColor = theme.colors.textPrimary;
      profitLossBadgeBg = isDark ? theme.colors.surfaceElevated : '#f0f0f0';
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
            <View
              style={[
                styles.productIconWrap,
                { backgroundColor: isDark ? theme.colors.surfaceElevated : '#F8FAFC' },
              ]}
            >
              <Feather name={getGoldIcon(entry.product?.code ?? '')} size={18} color={theme.colors.gold} />
            </View>
            <View style={styles.entryNameContainer}>
              <Text style={[styles.entryTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {entry.product?.name ?? 'Altın'}
              </Text>
            </View>
          </View>

          {/* Miktar Rozeti ve Aksiyon Butonları (Düzenle & Sil) */}
          <View style={styles.entryHeaderRight}>
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

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/(protected)/portfolio/${entry.id}/edit` as any);
              }}
              hitSlop={8}
              style={styles.cardActionIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Kaydı düzenle"
            >
              <Feather name="edit-2" size={15} color={theme.colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                setDeleteConfirmTarget({ id: entry.id, name: entry.product?.name ?? 'Altın' });
              }}
              hitSlop={8}
              style={styles.cardActionIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Kaydı sil"
            >
              <Feather name="trash-2" size={15} color={theme.colors.loss} />
            </Pressable>
          </View>
        </View>

        {/* Alış Tarihi, Alış Yeri ve Ortalama Alış Maliyeti */}
        <View style={styles.entryMetaRow}>
          <Text style={[styles.entryDate, { color: theme.colors.textTertiary }]}>
            Alış: {formatDate(entry.purchaseDate)}
          </Text>
          {entry.purchasePlace ? (
            <Text style={[styles.entryPlace, { color: theme.colors.textTertiary }]}>
              {' • '}{entry.purchasePlace}
            </Text>
          ) : null}
          <Text style={[styles.entryUnitCost, { color: theme.colors.textTertiary }]}>
            {' • '}Ort. Alış: {formatMoney(unitCostMinor)}/{unitLabel}
          </Text>
          {isStale ? (
            <View
              style={[
                styles.staleChip,
                { backgroundColor: theme.colors.warningLight },
              ]}
            >
              <Feather name="clock" size={10} color={theme.colors.warning} style={{ marginRight: 3 }} />
              <Text style={[styles.staleChipText, { color: theme.colors.warning }]}>
                Gecikmeli Veri
              </Text>
            </View>
          ) : null}
        </View>

        {/* Değerleme ve Maliyet Tablosu */}
        <View style={[styles.entryMetricsGrid, { borderTopColor: theme.colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
          <View style={styles.entryMetricsTopRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Ödenen Maliyet
              </Text>
              <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
                {formatMoney(entry.totalCostMinor)}
              </Text>
            </View>

            <View style={styles.metricItemRight}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Tahmini Değer
              </Text>
              <Text style={[styles.metricValue, { color: theme.colors.textPrimary, fontWeight: '700' }]}>
                {valuation.currentValueMinor !== null
                  ? formatMoney(valuation.currentValueMinor)
                  : 'Fiyat Yok'}
              </Text>
            </View>
          </View>

          <View style={[styles.entryMetricsBottomRow, { borderTopColor: theme.colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              Net Kâr / Zarar
            </Text>
            <View style={styles.plValueRow}>
              <Text
                style={[
                  styles.metricValue,
                  { color: profitLossColor, fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {profitLossAmountText}
              </Text>
              {profitLossPercentText ? (
                <View
                  style={[
                    styles.plPercentBadge,
                    { backgroundColor: profitLossBadgeBg },
                  ]}
                >
                  <Text style={[styles.plPercentBadgeText, { color: profitLossColor }]}>
                    {profitLossPercentText}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer scrollable={false} edges={['left', 'right']}>
      <FlatList
        data={sortedItems}
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

      {/* Özel Altın İz Silme Onay Modalı */}
      <Modal
        visible={Boolean(deleteConfirmTarget)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setDeleteConfirmTarget(null);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.deleteModalCard,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? 'rgba(212, 167, 44, 0.4)' : '#E2E8F0',
              },
            ]}
          >
            <View style={styles.deleteModalIconWrap}>
              <Feather name="trash-2" size={26} color={theme.colors.loss} />
            </View>

            <Text style={[styles.deleteModalTitle, { color: theme.colors.textPrimary }]}>
              Kaydı Silmek İstiyor musunuz?
            </Text>

            <Text style={[styles.deleteModalDesc, { color: theme.colors.textSecondary }]}>
              {`"${deleteConfirmTarget?.name ?? ''}" portföy kaydınız kalıcı olarak silinecektir. Bu işlem geri alınamaz.`}
            </Text>

            <View style={styles.deleteModalBtnRow}>
              <Pressable
                onPress={() => setDeleteConfirmTarget(null)}
                disabled={isDeleting}
                style={[
                  styles.deleteModalBtnCancel,
                  {
                    backgroundColor: isDark ? theme.colors.surfaceElevated : '#F1F5F9',
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.deleteModalBtnCancelText, { color: theme.colors.textPrimary }]}>
                  Vazgeç
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmDelete}
                disabled={isDeleting}
                style={({ pressed }) => [
                  styles.deleteModalConfirmBtn,
                  {
                    backgroundColor: theme.colors.loss,
                    opacity: pressed || isDeleting ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={styles.deleteModalConfirmText}>
                  {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  heroCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  heroCountBadge: {
    backgroundColor: 'rgba(212, 167, 44, 0.15)',
    borderWidth: 1,
    borderColor: '#D4A72C',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heroCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4A72C',
  },
  heroHeadline: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  heroDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  heroStatColumn: {
    flex: 1,
  },
  heroStatColumnRight: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  heroStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 10,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 3,
  },
  heroStatValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroPlValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  heroPlPercentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlPercentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroAddBtn: {
    marginTop: 2,
  },
  distributionCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  distributionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  distributionSubtitle: {
    fontSize: 11,
  },
  distributionBar: {
    height: 8,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  distributionSegment: {
    height: '100%',
  },
  distributionLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendName: {
    fontSize: 11,
    marginRight: 4,
  },
  legendPercent: {
    fontSize: 11,
    fontWeight: '700',
  },
  bannerSpacing: {
    marginBottom: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sortPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '600',
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
  productIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  entryNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  entryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  cardActionIconBtn: {
    padding: 4,
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
  entryUnitCost: {
    fontSize: 12,
  },
  staleChip: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingTop: 10,
  },
  entryMetricsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryMetricsBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
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
  plValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'nowrap',
    gap: 6,
  },
  plPercentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plPercentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
  },
  deleteModalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteModalDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteModalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
