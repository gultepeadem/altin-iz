/**
 * Altın İz — Altın Detay Ekranı (gold/[productId])
 * src/app/(protected)/gold/[productId].tsx
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 12.5 ve Bölüm 18.2
 * Karar Referansları: ADR-007 (Minor birim), ADR-013 (Fiyat yoksa null, asla 0 TL değil), ADR-014 (Eski veri bildirimi)
 *
 * Fonksiyonlar:
 * - Dinamik `productId` doğrulama ve veritabanı sorgusu
 * - Ürün adı, ölçü birimi, paket ağırlığı ve ayar bilgileri
 * - Güncel Alış (Bozdurma) ve Satış (Satın Alma) fiyatları (0 TL engellemeli)
 * - Varsa günlük değişim oranı, günün en düşük ve en yüksek fiyatları
 * - Son güncelleme zamanı, veri sağlayıcısı ve tazelik rozeti (live, stale, partial, unavailable)
 * - Eski veya kısmi veri durumlarında StaleDataBanner ve PartialDataBanner
 * - "Portföye Ekle" butonu (ürün portföye kapalıysa açıklayıcı devre dışı durumu)
 * - "Hesapla" butonu ile hesaplama sekmesine yönlendirme
 * - Zorunlu finansal bilgilendirme metni
 * - Sayfayı aşağı çekerek yenileme (pull-to-refresh) ve hata durumunda Yeniden Dene butonu
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

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
import { goldProductService } from '@/services/goldProductService';
import { goldPriceService } from '@/services/goldPriceService';
import type { GoldProduct } from '@/models/goldProduct';
import type { GoldPrice } from '@/models/goldPrice';
import { formatDateTime, formatMoney, formatPercent } from '@/utils/formatters';

export default function GoldDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { theme, isDark } = useTheme();

  const [product, setProduct] = useState<GoldProduct | null>(null);
  const [price, setPrice] = useState<GoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // Veritabanından ürün ve en son fiyatını çeker
  const loadProductData = useCallback(
    async (isPull = false) => {
      if (!productId || typeof productId !== 'string' || productId.trim() === '') {
        setIsNotFound(true);
        setLoading(false);
        return;
      }

      if (isPull) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const productData = await goldProductService.getProductById(productId);

        if (!productData) {
          setIsNotFound(true);
          setProduct(null);
          setPrice(null);
        } else {
          setIsNotFound(false);
          setProduct(productData);

          // İlgili ürünün en son geçerli fiyatını oku (başka ürün fiyatı asla bağlanmaz)
          const priceData = await goldPriceService.getLatestPriceForProduct(productData.id);
          setPrice(priceData);
        }
      } catch (err: any) {
        setError(err?.message || 'Altın detay bilgileri yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      if (!productId || typeof productId !== 'string' || productId.trim() === '') {
        if (isMounted) {
          setIsNotFound(true);
          setLoading(false);
        }
        return;
      }

      try {
        const productData = await goldProductService.getProductById(productId);

        if (!isMounted) return;

        if (!productData) {
          setIsNotFound(true);
          setProduct(null);
          setPrice(null);
        } else {
          setIsNotFound(false);
          setProduct(productData);

          const priceData = await goldPriceService.getLatestPriceForProduct(productData.id);
          if (isMounted) {
            setPrice(priceData);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Altın detay bilgileri yüklenirken bir sorun oluştu.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Fiyat tazelik durumu ve kontrolleri (ADR-013 ve ADR-014)
  const hasBuyPrice = price?.buyPriceMinor !== null && price?.buyPriceMinor !== undefined;
  const hasSellPrice = price?.sellPriceMinor !== null && price?.sellPriceMinor !== undefined;
  const itemCurrency = price?.currencyCode || (product?.code === 'OUNCE_GOLD' ? 'USD' : 'TRY');
  const isPriceUnavailable = !hasBuyPrice && !hasSellPrice;
  const isStale = price?.status === 'stale';
  const isPartial = price?.status === 'partial';
  const dailyChange = price?.dailyChangePercent;

  // Ölçü birimi Türkçe metni
  const getUnitText = (unit?: string) => {
    switch (unit) {
      case 'gram':
        return 'Gram';
      case 'piece':
        return 'Adet';
      case 'ounce':
        return 'Ons';
      default:
        return 'Birim';
    }
  };

  // Kategori Türkçe metni
  const getCategoryText = (category?: string) => {
    switch (category) {
      case 'gram':
        return 'Külçe / Gram Altın';
      case 'coin':
        return 'Cumhuriyet / Ziynet Sikke';
      case 'karat':
        return 'Bilezik / Takı';
      case 'international':
        return 'Uluslararası Piyasa';
      case 'packaged':
        return 'Sertifikalı Paket Altın';
      default:
        return 'Genel Altın';
    }
  };

  // Yükleme durumu
  if (loading && !refreshing) {
    return (
      <ScreenContainer scrollable={false} withPadding={true}>
        <LoadingState message="Altın detayları yükleniyor..." fullScreen={false} />
      </ScreenContainer>
    );
  }

  // Geçersiz veya bulunamayan ürün durumu
  if (isNotFound || !product) {
    return (
      <ScreenContainer scrollable={false} withPadding={true}>
        <ErrorState
          title="Altın Türü Bulunamadı"
          message="Görüntülemek istediğiniz altın türü sistemde kayıtlı değil veya yayından kaldırılmış."
          onRetry={() => router.replace('/(protected)/(tabs)/prices')}
          retryTitle="Fiyatlar Listesine Dön"
          style={styles.centerContainer}
        />
      </ScreenContainer>
    );
  }

  // Genel bağlantı veya yükleme hatası durumu
  if (error && !product) {
    return (
      <ScreenContainer scrollable={false} withPadding={true}>
        <ErrorState
          title="Bilgiler Alınamadı"
          message={error}
          onRetry={() => loadProductData(false)}
          retryTitle="Yeniden Dene"
          retryLoading={loading}
          style={styles.centerContainer}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} withPadding={true}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProductData(true)}
            tintColor={theme.colors.gold}
            colors={[theme.colors.gold]}
          />
        }
      >
        {/* Eski Veri Uyarı Şeridi (ADR-014) */}
        {isStale && (
          <StaleDataBanner
            lastUpdatedAt={
              price?.sourcePriceAt ? formatDateTime(price.sourcePriceAt) : undefined
            }
            onRefresh={() => loadProductData(true)}
            style={styles.bannerSpacing}
          />
        )}

        {/* Kısmi Veri Uyarı Şeridi (ADR-013) */}
        {!isStale && isPartial && (
          <PartialDataBanner
            message="Bu altın için yalnızca tek yönlü fiyat (yalnızca alış veya yalnızca satış) yayınlanmıştır."
            style={styles.bannerSpacing}
          />
        )}

        {/* Fiyat Yok Uyarısı (ADR-013) */}
        {isPriceUnavailable && (
          <View
            style={[
              styles.unavailableCard,
              {
                backgroundColor: isDark ? theme.colors.surfaceElevated : '#f5f5f5',
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.unavailableTitle, { color: theme.colors.textPrimary }]}>
              ℹ Fiyat Bilgisi Alınamadı
            </Text>
            <Text style={[styles.unavailableText, { color: theme.colors.textSecondary }]}>
              Bu ürün için şu anda aktif serbest piyasa fiyatı temin edilememektedir. Fiyatlar
              piyasa açılışında otomatik olarak güncellenecektir.
            </Text>
          </View>
        )}

        {/* Ana Ürün Kartı */}
        <View
          style={[
            styles.mainCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Üst Başlık ve Rozetler */}
          <View style={styles.headerRow}>
            <View style={styles.titleArea}>
              <Text style={[styles.productName, { color: theme.colors.textPrimary }]}>
                {product.name}
              </Text>

              <View style={styles.tagRow}>
                {product.shortName ? (
                  <View
                    style={[
                      styles.tagBadge,
                      {
                        backgroundColor: isDark
                          ? theme.colors.surfaceElevated
                          : theme.colors.goldLight,
                        borderColor: theme.colors.gold,
                      },
                    ]}
                  >
                    <Text style={[styles.tagBadgeText, { color: theme.colors.gold }]}>
                      {product.shortName}
                    </Text>
                  </View>
                ) : null}

                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: isDark
                        ? theme.colors.surfaceElevated
                        : theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.tagBadgeText, { color: theme.colors.textSecondary }]}>
                    {getCategoryText(product.category)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tazelik Durumu Rozeti */}
            <View
              style={[
                styles.freshnessPill,
                {
                  backgroundColor: isStale
                    ? theme.colors.warningLight
                    : isPriceUnavailable
                    ? isDark
                      ? theme.colors.surfaceElevated
                      : '#eee'
                    : isDark
                    ? '#1e382b'
                    : '#e8f5e9',
                  borderColor: isStale
                    ? theme.colors.warning
                    : isPriceUnavailable
                    ? theme.colors.border
                    : theme.colors.profit,
                },
              ]}
            >
              <View
                style={[
                  styles.freshnessDot,
                  {
                    backgroundColor: isStale
                      ? theme.colors.warning
                      : isPriceUnavailable
                      ? theme.colors.textTertiary
                      : theme.colors.profit,
                  },
                ]}
              />
              <Text
                style={[
                  styles.freshnessText,
                  {
                    color: isStale
                      ? theme.colors.warning
                      : isPriceUnavailable
                      ? theme.colors.textSecondary
                      : theme.colors.profit,
                  },
                ]}
              >
                {isStale
                  ? 'Gecikmeli'
                  : isPriceUnavailable
                  ? 'Piyasa Kapalı'
                  : 'Canlı Veri'}
              </Text>
            </View>
          </View>

          {/* Fiyat Bilgileri (Alış / Satış) */}
          <View style={styles.pricesSection}>
            <View style={styles.priceCol}>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                Alış Fiyatı (Bozdurma)
              </Text>
              <Text
                style={[
                  styles.priceValue,
                  {
                    color: hasBuyPrice ? theme.colors.textPrimary : theme.colors.textTertiary,
                  },
                ]}
              >
                {hasBuyPrice ? formatMoney(price?.buyPriceMinor, itemCurrency) : '-'}
              </Text>
              <Text style={[styles.priceSubHint, { color: theme.colors.textTertiary }]}>
                Kuyumcuya bozdururken geçerli gösterge fiyat
              </Text>
            </View>

            <View style={[styles.priceDivider, { backgroundColor: theme.colors.divider }]} />

            <View style={[styles.priceCol, styles.priceColRight]}>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                Satış Fiyatı (Satın Alma)
              </Text>
              <Text
                style={[
                  styles.priceValue,
                  {
                    color: hasSellPrice ? theme.colors.gold : theme.colors.textTertiary,
                  },
                ]}
              >
                {hasSellPrice ? formatMoney(price?.sellPriceMinor, itemCurrency) : '-'}
              </Text>
              <Text style={[styles.priceSubHint, { color: theme.colors.textTertiary }]}>
                Kuyumcudan satın alırken geçerli gösterge fiyat
              </Text>
            </View>
          </View>

          {/* Günlük Değişim ve Zaman Satırı */}
          <View
            style={[
              styles.metaRow,
              {
                borderTopColor: theme.colors.divider,
              },
            ]}
          >
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: theme.colors.textTertiary }]}>
                Günlük Değişim
              </Text>
              {dailyChange !== null && dailyChange !== undefined ? (
                <Text
                  style={[
                    styles.metaValueBold,
                    {
                      color:
                        dailyChange > 0
                          ? theme.colors.profit
                          : dailyChange < 0
                          ? theme.colors.loss
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {dailyChange > 0 ? '▲ ' : dailyChange < 0 ? '▼ ' : ''}
                  {formatPercent(dailyChange)}
                </Text>
              ) : (
                <Text style={[styles.metaValue, { color: theme.colors.textTertiary }]}>-</Text>
              )}
            </View>

            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: theme.colors.textTertiary }]}>
                Son Fiyat Zamanı
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>
                {price?.sourcePriceAt
                  ? formatDateTime(price.sourcePriceAt)
                  : price?.fetchedAt
                  ? formatDateTime(price.fetchedAt)
                  : '-'}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: theme.colors.textTertiary }]}>
                Fiyat Kaynağı
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>
                {price?.sourceId ? 'Kapalıçarşı (Truncgil)' : 'Piyasa Verisi'}
              </Text>
            </View>
          </View>
        </View>

        {/* Günün Düşük ve Yüksek Değerleri (Varsa) */}
        {(price?.dayLowMinor !== null && price?.dayLowMinor !== undefined) ||
        (price?.dayHighMinor !== null && price?.dayHighMinor !== undefined) ? (
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.statsCardTitle, { color: theme.colors.textPrimary }]}>
              Günün Fiyat Aralığı
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  En Düşük Değer
                </Text>
                <Text style={[styles.statVal, { color: theme.colors.textPrimary }]}>
                  {formatMoney(price?.dayLowMinor, itemCurrency)}
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: theme.colors.divider }]} />

              <View style={[styles.statBox, styles.statBoxRight]}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  En Yüksek Değer
                </Text>
                <Text style={[styles.statVal, { color: theme.colors.textPrimary }]}>
                  {formatMoney(price?.dayHighMinor, itemCurrency)}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Ürün Teknik Özellikleri */}
        <View
          style={[
            styles.specsCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.specsTitle, { color: theme.colors.textPrimary }]}>
            Ürün Özellikleri
          </Text>

          <View style={styles.specRow}>
            <Text style={[styles.specKey, { color: theme.colors.textSecondary }]}>Ölçü Birimi</Text>
            <Text style={[styles.specValue, { color: theme.colors.textPrimary }]}>
              {getUnitText(product.measurementUnit)}
            </Text>
          </View>

          {product.packageWeightGrams ? (
            <View style={[styles.specRow, { borderTopColor: theme.colors.divider, borderTopWidth: 1 }]}>
              <Text style={[styles.specKey, { color: theme.colors.textSecondary }]}>
                Paket Ağırlığı
              </Text>
              <Text style={[styles.specValue, { color: theme.colors.textPrimary }]}>
                {product.packageWeightGrams} gram
              </Text>
            </View>
          ) : null}

          <View style={[styles.specRow, { borderTopColor: theme.colors.divider, borderTopWidth: 1 }]}>
            <Text style={[styles.specKey, { color: theme.colors.textSecondary }]}>
              Portföy Durumu
            </Text>
            <Text
              style={[
                styles.specValue,
                { color: product.portfolioEnabled ? theme.colors.profit : theme.colors.textTertiary },
              ]}
            >
              {product.portfolioEnabled ? 'Portföye Eklenebilir' : 'Portföye Kapalı'}
            </Text>
          </View>

          <View style={[styles.specRow, { borderTopColor: theme.colors.divider, borderTopWidth: 1 }]}>
            <Text style={[styles.specKey, { color: theme.colors.textSecondary }]}>
              Hesaplama Durumu
            </Text>
            <Text
              style={[
                styles.specValue,
                { color: product.calculatorEnabled ? theme.colors.profit : theme.colors.textTertiary },
              ]}
            >
              {product.calculatorEnabled ? 'Hesaplamada Kullanılabilir' : 'Hesaplamaya Kapalı'}
            </Text>
          </View>
        </View>

        {/* Aksiyon Butonları (Portföye Ekle & Hesapla) */}
        <View style={styles.actionButtonsContainer}>
          {product.portfolioEnabled ? (
            <PrimaryButton
              title="Portföye Ekle"
              onPress={() =>
                router.push({
                  pathname: '/(protected)/portfolio/add',
                  params: { productId: product.id },
                } as any)
              }
              style={styles.mainActionBtn}
            />
          ) : (
            <View style={styles.disabledActionContainer}>
              <PrimaryButton
                title="Portföye Eklenemez"
                disabled={true}
                onPress={() => {}}
                style={styles.mainActionBtn}
              />
              <Text style={[styles.disabledHint, { color: theme.colors.textTertiary }]}>
                Bu ürün türü portföy kaydına açık değildir.
              </Text>
            </View>
          )}

          {product.calculatorEnabled ? (
            <SecondaryButton
              title="Hesapla"
              onPress={() =>
                router.push({
                  pathname: '/(protected)/(tabs)/calculator',
                  params: { productId: product.id },
                } as any)
              }
              style={styles.secondaryActionBtn}
            />
          ) : null}
        </View>

        {/* Yasal / Finansal Bilgilendirme Metni */}
        <View
          style={[
            styles.disclaimerContainer,
            {
              backgroundColor: isDark ? theme.colors.surfaceElevated : '#f8f9fa',
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.disclaimerTitle, { color: theme.colors.textSecondary }]}>
            ⚖ Finansal Bilgilendirme
          </Text>
          <Text style={[styles.disclaimerText, { color: theme.colors.textTertiary }]}>
            Altın İz uygulamasında sunulan altın fiyatları, serbest piyasa gösterge değerleridir ve
            yalnızca bilgilendirme amaçlıdır. Veriler hiçbir şekilde yatırım danışmanlığı, yönlendirmesi
            veya garanti kazanç niteliği taşımaz. Gerçek alım-satım işlemlerinizde bankanızın veya
            yetkili kuyumcunuzun anlık işlem fiyatlarını esas alınız.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    paddingTop: 8,
  },
  bannerSpacing: {
    marginBottom: 12,
  },
  centerContainer: {
    marginTop: 40,
  },
  unavailableCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  unavailableTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  unavailableText: {
    fontSize: 12,
    lineHeight: 18,
  },
  mainCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleArea: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  freshnessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  freshnessDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  freshnessText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pricesSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  priceCol: {
    flex: 1,
  },
  priceColRight: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  priceSubHint: {
    fontSize: 10,
    lineHeight: 14,
  },
  priceDivider: {
    width: 1,
    height: 50,
    marginHorizontal: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 6,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaValueBold: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  statsCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
  },
  statBoxRight: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 12,
  },
  specsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  specsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  specKey: {
    fontSize: 12,
    fontWeight: '500',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    gap: 10,
    marginBottom: 18,
  },
  mainActionBtn: {
    width: '100%',
  },
  secondaryActionBtn: {
    width: '100%',
  },
  disabledActionContainer: {
    width: '100%',
  },
  disabledHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  disclaimerContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  disclaimerTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  disclaimerText: {
    fontSize: 10,
    lineHeight: 15,
  },
});
