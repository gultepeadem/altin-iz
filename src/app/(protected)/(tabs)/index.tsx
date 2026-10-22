/**
 * Altın İz — Ana Sayfa Ekranı (tabs/index)
 * src/app/(protected)/(tabs)/index.tsx
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 15 (Ana Sayfa)
 * Karar Referansları:
 * - ADR-007 (Minor birim - Kuruş)
 * - ADR-010 (Portföy Değerleme Yöntemi: Miktar × Güncel Alış Fiyatı)
 * - ADR-013 (Fiyat yoksa null, asla 0 TL kabul edilmez)
 * - ADR-014 (Eski fiyat bildirimi)
 * - ADR-017 (Fiyat Kaynakları ve Ürün Eşleştirmesi)
 */

import React, { useCallback, useState } from 'react';
import {
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
import { SecondaryButton } from '@/components/common/SecondaryButton';
import {
  ErrorState,
  LoadingState,
  PartialDataBanner,
  StaleDataBanner,
} from '@/components/feedback';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { homeService } from '@/services/homeService';
import type { HomeData, HomeFeaturedPrice } from '@/models/home';
import { formatDateTime, formatMoney, formatPercent } from '@/utils/formatters';

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { user, profile } = useAuth();

  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  // Ana sayfa verilerini canlı servis üzerinden çeker
  const fetchHomeData = useCallback(async (isPull = false) => {
    if (isPull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await homeService.getHomeData(userId);
      setHomeData(data);
    } catch (err: any) {
      const msg = err?.userMessage || err?.message || 'Ana sayfa verileri yüklenirken bir sorun oluştu.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Ekran odağa geldiğinde verileri yenile (ör. sekme değişiminde)
  useFocusEffect(
    useCallback(() => {
      fetchHomeData(false);
    }, [fetchHomeData])
  );

  // İlk yükleme esnasında gösterge
  if (loading && !homeData) {
    return (
      <ScreenContainer scrollable={false} edges={['top', 'left', 'right']}>
        <LoadingState message="Piyasa ve portföy verileri yükleniyor..." fullScreen />
      </ScreenContainer>
    );
  }

  // Hata durumu ve henüz veri yüklenmemişse
  if (error && !homeData) {
    return (
      <ScreenContainer scrollable={false} edges={['top', 'left', 'right']}>
        <ErrorState
          title="Veriler Alınamadı"
          message={error}
          onRetry={() => fetchHomeData(false)}
        />
      </ScreenContainer>
    );
  }

  // Karşılama metni ve kullanıcı adı
  const getGreeting = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
    const displayName =
      profile?.displayName ||
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      'Kullanıcı';
    return `${greeting}, ${displayName}`;
  };

  const summary = homeData?.portfolioSummary;

  // Portföy kâr/zarar metni ve rengi
  const getPortfolioPL = () => {
    if (!summary || summary.totalProfitLossMinor === null) {
      return {
        text: 'Hesaplanamıyor',
        color: theme.colors.warning,
      };
    }

    const isProfit = summary.totalProfitLossMinor > 0;
    const isLoss = summary.totalProfitLossMinor < 0;
    const sign = isProfit ? '+' : '';

    return {
      text: `${sign}${formatMoney(summary.totalProfitLossMinor)} (${formatPercent(summary.totalProfitLossPercentage)})`,
      color: isProfit
        ? theme.colors.profit
        : isLoss
          ? theme.colors.loss
          : theme.colors.textPrimary,
    };
  };

  const plDisplay = getPortfolioPL();

  // Öne Çıkan Fiyat Kartı Bileşeni
  const renderFeaturedCard = (
    featured: HomeFeaturedPrice | null,
    defaultTitle: string,
    badgeText: string,
    subText: string,
    currency = 'TRY'
  ) => {
    const product = featured?.product;
    const price = featured?.price;
    const hasPrice = featured?.hasPrice ?? false;
    const isStale = featured?.isStale ?? false;

    const changePercent = price?.dailyChangePercent;
    const isChangePositive = changePercent !== null && changePercent !== undefined && changePercent > 0;
    const isChangeNegative = changePercent !== null && changePercent !== undefined && changePercent < 0;

    const changeColor = isChangePositive
      ? theme.colors.profit
      : isChangeNegative
        ? theme.colors.loss
        : theme.colors.textTertiary;

    return (
      <Pressable
        onPress={() => {
          if (product?.id) {
            router.push(`/(protected)/gold/${product.id}`);
          }
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${product?.name ?? defaultTitle}, Detayları görmek için dokunun`}
        style={({ pressed }) => [
          styles.priceCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.cardBorder,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.titleWithBadge}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
              {product?.name ?? defaultTitle}
            </Text>
            <View
              style={[
                styles.miniBadge,
                { backgroundColor: isDark ? theme.colors.surfaceElevated : theme.colors.primaryLight },
              ]}
            >
              <Text style={styles.miniBadgeText}>{badgeText}</Text>
            </View>
          </View>

          {/* Günlük Değişim Rozeti */}
          {hasPrice && changePercent !== null && changePercent !== undefined ? (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: isChangePositive
                    ? theme.colors.profitLight
                    : isChangeNegative
                      ? theme.colors.lossLight
                      : theme.colors.divider,
                },
              ]}
            >
              <Text style={[styles.changeBadgeText, { color: changeColor }]}>
                {formatPercent(changePercent)}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={[styles.cardSubtitleText, { color: theme.colors.textTertiary }]}>
          {subText}
          {isStale ? ' • 🕒 Eski Fiyat' : ''}
        </Text>

        {/* Alış ve Satış Fiyatları (0 TL engelli - ADR-013) */}
        <View style={[styles.cardPricesRow, { borderTopColor: theme.colors.divider }]}>
          <View style={styles.priceCol}>
            <Text style={[styles.priceColLabel, { color: theme.colors.textSecondary }]}>
              Alış (Bozdurma)
            </Text>
            <Text style={[styles.priceColValue, { color: theme.colors.textPrimary }]}>
              {hasPrice ? formatMoney(price?.buyPriceMinor, currency) : 'Fiyat Yok'}
            </Text>
          </View>

          <View style={styles.priceColRight}>
            <Text style={[styles.priceColLabel, { color: theme.colors.textSecondary }]}>
              Satış (Satın Alma)
            </Text>
            <Text style={[styles.priceColValue, { color: theme.colors.textPrimary }]}>
              {hasPrice ? formatMoney(price?.sellPriceMinor, currency) : 'Fiyat Yok'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer scrollable={false} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHomeData(true)}
            colors={[theme.colors.gold]}
            tintColor={theme.colors.gold}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Karşılama ve Başlık Alanı */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingText, { color: theme.colors.textPrimary }]}>
            {getGreeting()} 👋
          </Text>
          <Text style={[styles.greetingSubtext, { color: theme.colors.textSecondary }]}>
            Altın İz piyasa ve portföy durumunuz hazır.
          </Text>
        </View>

        {/* Son Fiyat Güncelleme Bilgisi */}
        {homeData?.lastPriceTime ? (
          <View style={styles.lastUpdateRow}>
            <Text style={[styles.lastUpdateText, { color: theme.colors.textTertiary }]}>
              🕒 Son Fiyat Güncellemesi: {formatDateTime(homeData.lastPriceTime)}
            </Text>
          </View>
        ) : null}

        {/* Kısmi Veri Uyarısı (ADR-013) */}
        {homeData?.priceStatus === 'partial' || homeData?.hasMissingPrice ? (
          <PartialDataBanner
            message="Bazı altın türlerinin güncel piyasa fiyatı alınamadı (ADR-013)."
            style={styles.bannerSpacing}
          />
        ) : null}

        {/* Eski Fiyat Uyarısı (ADR-014) */}
        {homeData?.isPriceStale || homeData?.priceStatus === 'stale' ? (
          <StaleDataBanner
            lastUpdatedAt={homeData?.lastPriceTime ? formatDateTime(homeData.lastPriceTime) : undefined}
            onRefresh={() => fetchHomeData(true)}
            style={styles.bannerSpacing}
          />
        ) : null}

        {/* Portföy Özet Kartı */}
        <Pressable
          onPress={() => router.push('/(protected)/(tabs)/portfolio')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Portföy özeti, detayları görmek için dokunun"
          style={({ pressed }) => [
            styles.summaryCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={styles.summaryTopRow}>
            <Text style={[styles.summaryCardSubtitle, { color: theme.colors.textSecondary }]}>
              Tahmini Güncel Bozdurma Değeri
            </Text>
            <View style={styles.portfolioLinkGroup}>
              <View
                style={[
                  styles.entryCountBadge,
                  {
                    backgroundColor: isDark ? theme.colors.surfaceElevated : theme.colors.goldLight,
                    borderColor: theme.colors.gold,
                  },
                ]}
              >
                <Text style={[styles.entryCountText, { color: theme.colors.gold }]}>
                  {summary?.totalEntries ?? 0} Kayıt
                </Text>
              </View>
              <Text style={[styles.linkArrowText, { color: theme.colors.gold }]}>→</Text>
            </View>
          </View>

          {/* Ana Değer Gösterimi (ADR-010) */}
          <Text style={[styles.summaryHeadline, { color: theme.colors.textPrimary }]}>
            {summary && summary.totalCurrentValueMinor > 0
              ? formatMoney(summary.totalCurrentValueMinor)
              : summary && summary.totalEntries === 0
                ? '0,00 TL'
                : 'Hesaplanamıyor'}
          </Text>

          {/* Maliyet ve Kâr/Zarar Gösterimi */}
          <View style={[styles.metricsRow, { borderTopColor: theme.colors.divider }]}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Ödenen Maliyet
              </Text>
              <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
                {formatMoney(summary?.totalCostMinor ?? 0)}
              </Text>
            </View>

            <View style={styles.metricItemRight}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Kâr / Zarar
              </Text>
              <Text style={[styles.metricValue, { color: plDisplay.color, fontWeight: '700' }]}>
                {plDisplay.text}
              </Text>
            </View>
          </View>

          {homeData?.portfolioStatus === 'partial' ? (
            <Text style={[styles.partialWarningText, { color: theme.colors.warning }]}>
              ℹ Bazı kayıtların fiyatı eksik olduğundan kâr-zarar kısmi hesaplanmıştır (ADR-013).
            </Text>
          ) : null}
        </Pressable>

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
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Piyasa Özeti
          </Text>
          <Pressable
            onPress={() => router.push('/(protected)/(tabs)/prices')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.viewAllText, { color: theme.colors.gold }]}>
              Tümünü Gör →
            </Text>
          </Pressable>
        </View>

        {/* 1. Gram Altın Kartı */}
        {renderFeaturedCard(
          homeData?.gramGold ?? null,
          'Gram Altın',
          'GRAM',
          '24 Ayar Standart Gram Altın'
        )}

        {/* 2. Çeyrek Altın Kartı (Yeni Tarihli) */}
        {renderFeaturedCard(
          homeData?.quarterGold ?? null,
          'Çeyrek Altın',
          'ÇEYREK',
          'Yeni Tarihli Darphane Sikkesi'
        )}

        {/* 3. Ons Altın Kartı (Uluslararası) */}
        {renderFeaturedCard(
          homeData?.ounceGold ?? null,
          'Ons Altın',
          'ONS',
          'Uluslararası Piyasa (USD/oz)',
          'USD'
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  greetingSection: {
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 13,
  },
  lastUpdateRow: {
    marginBottom: 12,
  },
  lastUpdateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  bannerSpacing: {
    marginBottom: 12,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryCardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  portfolioLinkGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  entryCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  linkArrowText: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryHeadline: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
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
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  partialWarningText: {
    fontSize: 11,
    marginTop: 10,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  priceCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  changeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardSubtitleText: {
    fontSize: 12,
    marginBottom: 12,
  },
  cardPricesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  priceCol: {
    flex: 1,
  },
  priceColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  priceColLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  priceColValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
