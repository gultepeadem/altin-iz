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

import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

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
  const isNavigatingRef = useRef(false);

  const handleAddGoldPress = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    router.push('/(protected)/portfolio/add');
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  }, []);

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
      <ScreenContainer scrollable={false} edges={['left', 'right']}>
        <LoadingState message="Piyasa ve portföy verileri yükleniyor..." fullScreen />
      </ScreenContainer>
    );
  }

  // Hata durumu ve henüz veri yüklenmemişse
  if (error && !homeData) {
    return (
      <ScreenContainer scrollable={false} edges={['left', 'right']}>
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

  // Portföy kâr/zarar metni ve rengi (Ayrık tutar ve tekil yüzde rozeti: çift artı hatası düzeltildi)
  const getPortfolioPL = () => {
    if (!summary || summary.totalProfitLossMinor === null) {
      return {
        amountText: 'Hesaplanamıyor',
        percentText: null,
        color: theme.colors.warning,
        badgeBg: 'transparent',
      };
    }

    const isProfit = summary.totalProfitLossMinor > 0;
    const isLoss = summary.totalProfitLossMinor < 0;
    const sign = isProfit ? '+' : '';

    return {
      amountText: `${sign}${formatMoney(summary.totalProfitLossMinor)}`,
      percentText: formatPercent(summary.totalProfitLossPercentage),
      color: isProfit
        ? theme.colors.profit
        : isLoss
          ? theme.colors.loss
          : theme.colors.textPrimary,
      badgeBg: isProfit
        ? isDark
          ? '#13281d'
          : '#e8f5e9'
        : isLoss
          ? isDark
            ? '#3b1c1c'
            : '#ffebee'
          : isDark
            ? theme.colors.surfaceElevated
            : '#f0f0f0',
    };
  };

  const plDisplay = getPortfolioPL();

  // Öne Çıkan Fiyat Kartı Bileşeni
  const renderFeaturedCard = (
    featured: HomeFeaturedPrice | null,
    defaultTitle: string,
    badgeText: string,
    subText: string,
    iconName: 'disc' | 'award' | 'globe',
    currency = 'TRY'
  ) => {
    const product = featured?.product;
    const price = featured?.price;
    const hasPrice = featured?.hasPrice ?? false;
    const isStale = featured?.isStale ?? false;
    const effectiveCurrency =
      price?.currencyCode || (product?.code === 'OUNCE_GOLD' ? 'USD' : currency);

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
            borderColor: theme.colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.titleWithBadge}>
            <View
              style={[
                styles.productIconWrap,
                { backgroundColor: isDark ? theme.colors.surfaceElevated : '#F8FAFC' },
              ]}
            >
              <Feather name={iconName} size={18} color={theme.colors.gold} />
            </View>
            <View style={styles.productNameGroup}>
              <View style={styles.productNameBadgeRow}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                  {product?.name ?? defaultTitle}
                </Text>
                <View
                  style={[
                    styles.miniBadge,
                    { backgroundColor: isDark ? theme.colors.surfaceElevated : '#EEF2F6' },
                  ]}
                >
                  <Text style={[styles.miniBadgeText, { color: isDark ? theme.colors.gold : '#1E293B' }]}>
                    {badgeText}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cardSubtitleText, { color: theme.colors.textTertiary }]}>
                {subText}
                {isStale ? ' • Gecikmeli Veri' : ''}
              </Text>
            </View>
          </View>

          {/* Günlük Değişim Rozeti ve Detay Oku */}
          <View style={styles.cardHeaderRight}>
            {hasPrice && changePercent !== null && changePercent !== undefined ? (
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor: isChangePositive
                      ? isDark
                        ? '#13281d'
                        : theme.colors.profitLight
                      : isChangeNegative
                        ? isDark
                          ? '#3b1c1c'
                          : theme.colors.lossLight
                        : theme.colors.divider,
                  },
                ]}
              >
                <Text style={[styles.changeBadgeText, { color: changeColor }]}>
                  {formatPercent(changePercent)}
                </Text>
              </View>
            ) : null}
            <Feather
              name="chevron-right"
              size={16}
              color={theme.colors.textTertiary}
              style={{ marginLeft: 4 }}
            />
          </View>
        </View>

        {/* Alış ve Satış Fiyatları (Aralarında ince dikey ayırıcı) */}
        <View style={[styles.cardPricesRow, { borderTopColor: theme.colors.divider }]}>
          <View style={styles.priceCol}>
            <Text style={[styles.priceColLabel, { color: theme.colors.textSecondary }]}>
              Alış (Bozdurma)
            </Text>
            <Text style={[styles.priceColValue, { color: theme.colors.textPrimary }]}>
              {hasPrice ? formatMoney(price?.buyPriceMinor, effectiveCurrency) : 'Fiyat Yok'}
            </Text>
          </View>

          <View style={[styles.priceColDivider, { backgroundColor: theme.colors.divider }]} />

          <View style={styles.priceColRight}>
            <Text style={[styles.priceColLabel, { color: theme.colors.textSecondary }]}>
              Satış (Satın Alma)
            </Text>
            <Text style={[styles.priceColValueRight, { color: theme.colors.textPrimary }]}>
              {hasPrice ? formatMoney(price?.sellPriceMinor, effectiveCurrency) : 'Fiyat Yok'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer
      scrollable={true}
      edges={['left', 'right']}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchHomeData(true)}
          colors={[theme.colors.gold]}
          tintColor={theme.colors.gold}
        />
      }
    >
      {/* Karşılama ve Başlık Alanı */}
      <View style={styles.greetingSection}>
        <Text style={[styles.greetingText, { color: theme.colors.textPrimary }]}>
          {getGreeting()}
        </Text>
        <Text style={[styles.greetingSubtext, { color: theme.colors.textSecondary }]}>
          Altın İz piyasa ve portföy durumunuz hazır.
        </Text>
      </View>

        {/* Kısmi Veri Uyarısı */}
        {homeData?.priceStatus === 'partial' || homeData?.hasMissingPrice ? (
          <PartialDataBanner
            message="Bazı altın türlerinin güncel piyasa fiyatı alınamadı."
            style={styles.bannerSpacing}
          />
        ) : null}

        {/* Eski Fiyat Uyarısı */}
        {homeData?.isPriceStale || homeData?.priceStatus === 'stale' ? (
          <StaleDataBanner
            lastUpdatedAt={homeData?.lastPriceTime ? formatDateTime(homeData.lastPriceTime) : undefined}
            onRefresh={() => fetchHomeData(true)}
            style={styles.bannerSpacing}
          />
        ) : null}

        {/* Portföy Özet Kartı (Hero Card - Gece Laciverti Vurgulu) */}
        <View style={styles.summaryCardHero}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryCardSubtitleHero}>
              Tahmini Güncel Bozdurma Değeri
            </Text>
            <Pressable
              onPress={() => router.push('/(protected)/(tabs)/portfolio')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.entryCountBadgeHero}
              accessibilityRole="button"
              accessibilityLabel="Portföy detaylarına git"
            >
              <Text style={styles.entryCountTextHero}>
                {summary?.totalEntries ?? 0} Kayıt ›
              </Text>
            </Pressable>
          </View>

          {/* Ana Değer Gösterimi */}
          <Text style={styles.summaryHeadlineHero}>
            {summary && summary.totalCurrentValueMinor > 0
              ? formatMoney(summary.totalCurrentValueMinor)
              : summary && summary.totalEntries === 0
                ? '0,00 TL'
                : 'Hesaplanamıyor'}
          </Text>

          {/* Maliyet ve Kâr/Zarar Gösterimi (Satır kaymasını önleyen yan yana tasarım) */}
          <View style={styles.metricsRowHero}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabelHero}>
                Ödenen Maliyet
              </Text>
              <Text style={styles.metricValueHero}>
                {formatMoney(summary?.totalCostMinor ?? 0)}
              </Text>
            </View>

            <View style={styles.metricItemRight}>
              <Text style={styles.metricLabelHero}>
                Kâr / Zarar
              </Text>
              <View style={styles.plValueRow}>
                <Text
                  style={[
                    styles.metricValueHero,
                    {
                      color:
                        summary && summary.totalProfitLossMinor && summary.totalProfitLossMinor > 0
                          ? '#34D399'
                          : summary && summary.totalProfitLossMinor && summary.totalProfitLossMinor < 0
                          ? '#F87171'
                          : '#F1F5F9',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {plDisplay.amountText}
                </Text>
                {plDisplay.percentText ? (
                  <View
                    style={[
                      styles.plPercentBadge,
                      {
                        backgroundColor:
                          summary && summary.totalProfitLossMinor && summary.totalProfitLossMinor > 0
                            ? 'rgba(52, 211, 153, 0.2)'
                            : summary && summary.totalProfitLossMinor && summary.totalProfitLossMinor < 0
                            ? 'rgba(248, 113, 113, 0.2)'
                            : 'rgba(255, 255, 255, 0.15)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.plPercentBadgeText,
                        {
                          color:
                            summary && summary.totalProfitLossMinor && summary.totalProfitLossMinor > 0
                              ? '#34D399'
                              : summary && summary.totalProfitLossMinor && summary.totalProfitLossMinor < 0
                              ? '#F87171'
                              : '#F1F5F9',
                        },
                      ]}
                    >
                      {plDisplay.percentText}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {homeData?.portfolioStatus === 'partial' ? (
            <Text style={styles.partialWarningTextHero}>
              ℹ Bazı kayıtların fiyatı eksik olduğundan kâr-zarar kısmi hesaplanmıştır.
            </Text>
          ) : null}
        </View>

        {/* Hızlı İşlem Butonları */}
        <View style={styles.actionsRow}>
          <PrimaryButton
            title="Altın Ekle"
            icon={<Feather name="plus-circle" size={17} color="#FFFFFF" />}
            onPress={handleAddGoldPress}
            style={styles.actionButton}
          />
          <SecondaryButton
            title="Hesapla"
            icon={<Feather name="percent" size={16} color={theme.colors.textPrimary} />}
            onPress={() => router.push('/(protected)/(tabs)/calculator')}
            style={styles.actionButton}
          />
        </View>

        {/* Piyasa Özeti Başlığı */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Piyasa Özeti
            </Text>
            {homeData?.lastPriceTime ? (
              <Text style={[styles.lastUpdateSubtitle, { color: theme.colors.textTertiary }]}>
                Son Güncelleme: {formatDateTime(homeData.lastPriceTime)}
              </Text>
            ) : null}
          </View>
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
          '24 Ayar Standart Gram Altın',
          'disc'
        )}

        {/* 2. Çeyrek Altın Kartı (Yeni Tarihli) */}
        {renderFeaturedCard(
          homeData?.quarterGold ?? null,
          'Çeyrek Altın',
          'ÇEYREK',
          'Yeni Tarihli Darphane Sikkesi',
          'award'
        )}

        {/* 3. Ons Altın Kartı (Uluslararası) */}
        {renderFeaturedCard(
          homeData?.ounceGold ?? null,
          'Ons Altın',
          'ONS',
          'Uluslararası Piyasa (USD/oz)',
          'globe',
          'USD'
        )}
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
  summaryCardHero: {
    backgroundColor: '#0F172A',
    borderColor: 'rgba(212, 167, 44, 0.3)',
    borderWidth: 1.2,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  summaryCardSubtitleHero: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  entryCountBadgeHero: {
    backgroundColor: 'rgba(212, 167, 44, 0.15)',
    borderColor: 'rgba(212, 167, 44, 0.4)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  entryCountTextHero: {
    color: '#F1C40F',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryHeadlineHero: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 12,
  },
  metricsRowHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricLabelHero: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 3,
  },
  metricValueHero: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
  },
  partialWarningTextHero: {
    color: '#F59E0B',
    fontSize: 11,
    marginTop: 10,
    fontStyle: 'italic',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  metricItem: {
    minWidth: 100,
  },
  metricItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    height: 46,
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
  lastUpdateSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
    marginBottom: 6,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  productNameGroup: {
    flex: 1,
  },
  productNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
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
    marginBottom: 10,
  },
  cardPricesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  priceCol: {
    flex: 1,
  },
  priceColDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 12,
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
  priceColValueRight: {
    fontSize: 15,
    fontWeight: '800',
  },
});
