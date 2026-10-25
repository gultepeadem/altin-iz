/**
 * Altın İz — Fiyatlar Ekranı (tabs/prices)
 * src/app/(protected)/(tabs)/prices.tsx
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 12.5 ve Bölüm 18.1
 * Karar Referansları: ADR-007 (Minor birim), ADR-013 (Fiyat yoksa null, asla 0 TL değil), ADR-014 (Eski veri bildirimi)
 *
 * Fonksiyonlar:
 * - Canlı Supabase altın fiyatlarını listeleme
 * - Türkçe karakter duyarlı anlık arama
 * - 4 yönlü sıralama (Varsayılan, İsim A-Z, Satış Artan, Satış Azalan)
 * - Fiyatı olmayan ürünlerde kesinlikle '0 TL' göstermeme (ADR-013)
 * - Günlük değişimi yalnızca geçerli olduğunda renklendirilmiş rozetle sunma
 * - Eski (stale) ve kısmi (partial) veri durumlarında açıklayıcı uyarı şeritleri
 * - Sayfayı aşağı çekerek yenileme (Pull-to-refresh) ve hata durumunda Yeniden Dene butonu
 * - Altın detay ekranına dinamik yönlendirme
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TextField } from '@/components/forms/TextField';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PartialDataBanner,
  StaleDataBanner,
} from '@/components/feedback';
import { useTheme } from '@/hooks/useTheme';
import { useMarketStatus } from '@/hooks/useMarketStatus';
import { goldPriceService } from '@/services/goldPriceService';
import type { ProductWithPrice } from '@/models/goldPrice';
import type { GoldProduct } from '@/models/goldProduct';
import { formatDateTime, formatMoney, formatPercent, normalizeSearchText } from '@/utils/formatters';

export type SortMode = 'default' | 'name' | 'price_asc' | 'price_desc';

interface SortChipItem {
  id: SortMode;
  label: string;
}

const SORT_OPTIONS: SortChipItem[] = [
  { id: 'default', label: 'Varsayılan' },
  { id: 'name', label: 'İsim (A-Z)' },
  { id: 'price_asc', label: 'Fiyat (Artan)' },
  { id: 'price_desc', label: 'Fiyat (Azalan)' },
];

function getGoldIcon(code: string): 'disc' | 'award' | 'shield' | 'globe' | 'layers' {
  const c = code.toUpperCase();
  if (c.includes('ONS') || c.includes('OUNCE')) return 'globe';
  if (c.includes('ATA') || c.includes('CUMHURIYET') || c.includes('RESAT') || c.includes('HAMIT')) return 'shield';
  if (c.includes('CEYREK') || c.includes('YARIM') || c.includes('TAM')) return 'award';
  if (c.includes('KULCE') || c.includes('GREMSE') || c.includes('BESLI')) return 'layers';
  return 'disc';
}

function getProductBadgeText(product: GoldProduct): string {
  const c = product.code.toUpperCase();
  if (c === 'GRAM_GOLD') return 'GRAM';
  if (c.includes('QUARTER')) return 'ÇEYREK';
  if (c.includes('HALF')) return 'YARIM';
  if (c.includes('FULL')) return 'TAM';
  if (c.includes('ATA')) return 'ATA';
  if (c.includes('GREMSE')) return 'GREMSE';
  if (c.includes('RESAT')) return 'REŞAT';
  if (c.includes('HAMIT')) return 'HAMİT';
  if (c.includes('REPUBLIC')) return 'CUMHURİYET';
  if (c === 'GOLD_22K') return '22 AYAR';
  if (c === 'GOLD_18K') return '18 AYAR';
  if (c === 'GOLD_14K') return '14 AYAR';
  if (c === 'OUNCE_GOLD') return 'ONS';
  if (c.startsWith('PACKAGED_GOLD_')) {
    const g = c.replace('PACKAGED_GOLD_', '').replace('G', '').replace('_', ',');
    return `${g}G KÜLÇE`;
  }
  return (product.shortName || product.category || 'ALTIN').toUpperCase();
}

function getProductSubtitle(product: GoldProduct): string {
  const c = product.code.toUpperCase();
  if (c === 'GRAM_GOLD') return '24 Ayar Standart Gram Altın';
  if (c.includes('QUARTER_GOLD_NEW')) return 'Yeni Tarihli Darphane Sikkesi (1,75g)';
  if (c.includes('QUARTER_GOLD_OLD')) return 'Eski Tarihli Darphane Sikkesi (1,75g)';
  if (c.includes('QUARTER')) return '22 Ayar 1,75 Gram';
  if (c.includes('HALF_GOLD_NEW')) return 'Yeni Tarihli Darphane Sikkesi (3,50g)';
  if (c.includes('HALF_GOLD_OLD')) return 'Eski Tarihli Darphane Sikkesi (3,50g)';
  if (c.includes('HALF')) return '22 Ayar 3,50 Gram';
  if (c.includes('FULL_GOLD_NEW')) return 'Yeni Tarihli Darphane Sikkesi (7,01g)';
  if (c.includes('FULL_GOLD_OLD')) return 'Eski Tarihli Darphane Sikkesi (7,01g)';
  if (c.includes('FULL')) return '22 Ayar 7,01 Gram';
  if (c.includes('ATA_GOLD_NEW')) return 'Yeni Tarihli Darphane Lirası (7,21g)';
  if (c.includes('ATA_GOLD_OLD')) return 'Eski Tarihli Darphane Lirası (7,21g)';
  if (c.includes('ATA')) return '22 Ayar 7,21 Gram';
  if (c.includes('GREMSE')) return '22 Ayar Darphane Sikkesi (17,53g)';
  if (c.includes('RESAT')) return '22 Ayar 7,21 Gram Tarihi Sikke';
  if (c.includes('HAMIT')) return '22 Ayar 7,21 Gram Tarihi Sikke';
  if (c.includes('REPUBLIC')) return '22 Ayar 7,21 Gram Cumhuriyet';
  if (c === 'GOLD_22K') return '22 Ayar İşlenmiş / Bilezik';
  if (c === 'GOLD_18K') return '18 Ayar Standart Altın';
  if (c === 'GOLD_14K') return '14 Ayar Standart Altın';
  if (c === 'OUNCE_GOLD') return 'Uluslararası Spot Piyasa (USD/oz)';
  if (c.startsWith('PACKAGED_GOLD_')) {
    const g = c.replace('PACKAGED_GOLD_', '').replace('G', '').replace('_', ',');
    return `995.0 Sertifikalı Külçe (${g} Gram)`;
  }
  return 'Kapalıçarşı Serbest Piyasa';
}

interface PricesHeaderProps {
  latestUpdatedTime: string | null;
  hasStale: boolean;
  hasPartial: boolean;
  onRefresh: () => void;
  search: string;
  onSearchChange: (text: string) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  theme: any;
  isDark: boolean;
}

// Liste ile birlikte akıcı kayan ve klavye odağını kaybetmeyen bağımsız başlık bileşeni
const PricesListHeader = React.memo(function PricesListHeader({
  latestUpdatedTime,
  hasStale,
  hasPartial,
  onRefresh,
  search,
  onSearchChange,
  sortMode,
  onSortModeChange,
  theme,
  isDark,
}: PricesHeaderProps) {
  return (
    <View style={styles.fixedTopSection}>
      {latestUpdatedTime ? (
        <View style={styles.timeInfoRow}>
          <Feather name="clock" size={12} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
          <Text style={[styles.timeInfoText, { color: theme.colors.textTertiary }]}>
            Son Fiyat Güncellemesi: {formatDateTime(latestUpdatedTime)}
          </Text>
        </View>
      ) : null}

      {/* Eski Veri Şeridi */}
      {hasStale && (
        <StaleDataBanner
          lastUpdatedAt={latestUpdatedTime ? formatDateTime(latestUpdatedTime) : undefined}
          onRefresh={onRefresh}
          style={styles.bannerSpacing}
        />
      )}

      {/* Kısmi Veri Şeridi */}
      {!hasStale && hasPartial && (
        <PartialDataBanner
          message="Bazı altın türlerinin güncel piyasa fiyatı henüz temin edilemedi veya kısmi olarak yayınlandı."
          style={styles.bannerSpacing}
        />
      )}

      {/* Arama Alanı (Vektörel ikonlarla) */}
      <TextField
        placeholder="Altın türü ara (ör. Gram, Çeyrek, Ata)..."
        value={search}
        onChangeText={onSearchChange}
        leftIcon={<Feather name="search" size={16} color={theme.colors.textSecondary} />}
        rightIcon={
          search.length > 0 ? (
            <Pressable
              onPress={() => onSearchChange('')}
              hitSlop={8}
              accessibilityLabel="Aramayı temizle"
              accessibilityRole="button"
            >
              <Feather name="x" size={16} color={theme.colors.textSecondary} />
            </Pressable>
          ) : undefined
        }
        containerStyle={styles.searchContainer}
      />

      {/* Sıralama Kontrolleri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortChipsContainer}
      >
        {SORT_OPTIONS.map((opt) => {
          const isSelected = sortMode === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onSortModeChange(opt.id)}
              style={[
                styles.sortChip,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? theme.colors.surfaceElevated
                      : theme.colors.goldLight
                    : theme.colors.card,
                  borderColor: isSelected ? theme.colors.gold : theme.colors.border,
                },
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Sıralama seçeneği: ${opt.label}`}
            >
              <Text
                style={[
                  styles.sortChipText,
                  {
                    color: isSelected ? theme.colors.gold : theme.colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tablo Sütun Başlıkları */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCol, { color: theme.colors.textSecondary }]}>
          Altın Türü & Ayar
        </Text>
        <Text style={[styles.headerColRight, { color: theme.colors.textSecondary }]}>
          Alış / Satış Fiyatı
        </Text>
      </View>
    </View>
  );
});

export default function PricesScreen() {
  const { theme, isDark } = useTheme();
  const marketStatus = useMarketStatus();

  const [items, setItems] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  // Sayfa ilk yüklendiğinde verileri çeker
  useEffect(() => {
    let isMounted = true;

    const fetchInitialPrices = async () => {
      try {
        const data = await goldPriceService.getProductsWithPrices();
        if (isMounted) {
          setItems(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Altın fiyatları yüklenirken bir sorun oluştu.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialPrices();

    return () => {
      isMounted = false;
    };
  }, []);

  // Manuel yenileme veya çek-yenile (pull-to-refresh) fonksiyonu
  const handleRefresh = useCallback(async (isPull = false) => {
    if (isPull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await goldPriceService.getProductsWithPrices(15, true);
      setItems(data);
    } catch (err: any) {
      setError(err?.message || 'Altın fiyatları yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // En son güncellenme zamanını tespit eder
  const latestUpdatedTime = useMemo(() => {
    let latest: string | null = null;
    for (const item of items) {
      const time = item.price?.sourcePriceAt || item.price?.fetchedAt;
      if (time) {
        if (!latest || new Date(time).getTime() > new Date(latest).getTime()) {
          latest = time;
        }
      }
    }
    return latest;
  }, [items]);

  // Kısmi (partial) veri durumunu analiz eder
  const hasPartial = useMemo(() => {
    let partialCount = 0;

    for (const item of items) {
      if (item.price === null || item.price.status === 'partial' || item.price.status === 'unavailable') {
        partialCount++;
      }
    }

    return partialCount > 0;
  }, [items]);

  // Arama ve sıralama filtresini uygular
  const filteredAndSortedItems = useMemo(() => {
    const query = normalizeSearchText(search);

    // 1. Arama Filtresi (Türkçe karakter ve aksan duyarsız normalizasyon)
    const filtered = items.filter((item) => {
      if (!query) return true;
      const name = normalizeSearchText(item.product.name);
      const shortName = normalizeSearchText(item.product.shortName);
      const code = normalizeSearchText(item.product.code);
      return name.includes(query) || shortName.includes(query) || code.includes(query);
    });

    // 2. Sıralama
    return [...filtered].sort((a, b) => {
      if (sortMode === 'name') {
        return a.product.name.localeCompare(b.product.name, 'tr-TR');
      }

      if (sortMode === 'price_asc') {
        const priceA = a.price?.sellPriceMinor ?? a.price?.buyPriceMinor ?? null;
        const priceB = b.price?.sellPriceMinor ?? b.price?.buyPriceMinor ?? null;

        // Fiyatı olmayanları sona atar
        if (priceA === null && priceB === null) return a.product.sortOrder - b.product.sortOrder;
        if (priceA === null) return 1;
        if (priceB === null) return -1;
        return priceA - priceB;
      }

      if (sortMode === 'price_desc') {
        const priceA = a.price?.sellPriceMinor ?? a.price?.buyPriceMinor ?? null;
        const priceB = b.price?.sellPriceMinor ?? b.price?.buyPriceMinor ?? null;

        // Fiyatı olmayanları sona atar
        if (priceA === null && priceB === null) return a.product.sortOrder - b.product.sortOrder;
        if (priceA === null) return 1;
        if (priceB === null) return -1;
        return priceB - priceA;
      }

      // Varsayılan: sortOrder
      return a.product.sortOrder - b.product.sortOrder;
    });
  }, [items, search, sortMode]);



  // Tekil Ürün Kartı Bileşeni
  const renderItem = useCallback(
    ({ item }: { item: ProductWithPrice }) => {
      const { product, price } = item;
      const dailyChange = price?.dailyChangePercent;

      // Fiyat mevcut mu kontrolü (ADR-013)
      const hasBuyPrice = price?.buyPriceMinor !== null && price?.buyPriceMinor !== undefined;
      const hasSellPrice = price?.sellPriceMinor !== null && price?.sellPriceMinor !== undefined;
      const isPriceUnavailable = !hasBuyPrice && !hasSellPrice;
      const itemCurrency = price?.currencyCode || (product.code === 'OUNCE_GOLD' ? 'USD' : 'TRY');

      return (
        <Pressable
          onPress={() => router.push(`/(protected)/gold/${product.id}` as any)}
          style={({ pressed }) => [
            styles.productCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${product.name}, Alış: ${
            hasBuyPrice ? formatMoney(price?.buyPriceMinor, itemCurrency) : 'Fiyat yok'
          }, Satış: ${
            hasSellPrice ? formatMoney(price?.sellPriceMinor, itemCurrency) : 'Fiyat yok'
          }`}
        >
          {/* Üst Kısım: Ürün Adı, İkon, Kategori Rozeti ve Günlük Değişim */}
          <View style={styles.cardTopRow}>
            <View style={styles.productTitleArea}>
              <View
                style={[
                  styles.productIconWrap,
                  { backgroundColor: isDark ? theme.colors.surfaceElevated : '#F8FAFC' },
                ]}
              >
                <Feather name={getGoldIcon(product.code)} size={18} color={theme.colors.gold} />
              </View>
              <View style={styles.productTextGroup}>
                <View style={styles.productNameBadgeRow}>
                  <Text
                    style={[styles.productName, { color: theme.colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {product.name}
                  </Text>
                  <View
                    style={[
                      styles.miniBadge,
                      {
                        backgroundColor: isDark
                          ? theme.colors.surfaceElevated
                          : '#EEF2F6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniBadgeText,
                        { color: isDark ? theme.colors.gold : '#1E293B' },
                      ]}
                    >
                      {getProductBadgeText(product)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardSubtitleText, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                  {getProductSubtitle(product)}
                </Text>
              </View>
            </View>

            {/* Günlük Değişim Rozeti (Tüm kartlarda tutarlı gösterim) */}
            {dailyChange !== null && dailyChange !== undefined ? (
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      dailyChange > 0
                        ? isDark
                          ? '#13281d'
                          : theme.colors.profitLight
                        : dailyChange < 0
                        ? isDark
                          ? '#3b1c1c'
                          : theme.colors.lossLight
                        : isDark
                        ? theme.colors.surfaceElevated
                        : theme.colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.changeText,
                    {
                      color:
                        dailyChange > 0
                          ? theme.colors.profit
                          : dailyChange < 0
                          ? theme.colors.loss
                          : theme.colors.textTertiary,
                    },
                  ]}
                >
                  {formatPercent(dailyChange)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Alt Kısım: Alış ve Satış Fiyatları (Dikey ayırıcı ve yüksek kontrast) */}
          <View
            style={[
              styles.cardBottomRow,
              {
                borderTopColor: theme.colors.divider,
              },
            ]}
          >
            {/* Alış Fiyatı Kutusu */}
            <View style={styles.priceColumn}>
              <Text style={[styles.priceTypeLabel, { color: theme.colors.textSecondary }]}>
                Alış (Bozdurma)
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
            </View>

            {/* Dikey Ayırıcı */}
            <View style={[styles.priceDivider, { backgroundColor: theme.colors.divider }]} />

            {/* Satış Fiyatı Kutusu (Yüksek kontrastlı koyu/okunabilir renk) */}
            <View style={[styles.priceColumn, styles.priceColumnRight]}>
              <Text style={[styles.priceTypeLabel, { color: theme.colors.textSecondary }]}>
                Satış (Satın Alma)
              </Text>
              <Text
                style={[
                  styles.priceValueBold,
                  {
                    color: hasSellPrice ? theme.colors.textPrimary : theme.colors.textTertiary,
                  },
                ]}
              >
                {hasSellPrice ? formatMoney(price?.sellPriceMinor, itemCurrency) : '-'}
              </Text>
            </View>
          </View>

          {/* Fiyat Yoksa Özel Açıklayıcı Uyarı (ADR-013: Asla 0 TL gösterilmez) */}
          {isPriceUnavailable && (
            <View style={styles.unavailableWarningRow}>
              <Text style={[styles.unavailableWarningText, { color: theme.colors.textTertiary }]}>
                Bu ürün için henüz güncel piyasa fiyatı oluşmadı.
              </Text>
            </View>
          )}
        </Pressable>
      );
    },
    [isDark, theme]
  );

  const listHeader = useMemo(
    () => (
      <PricesListHeader
        latestUpdatedTime={latestUpdatedTime}
        hasStale={marketStatus.isStale}
        hasPartial={hasPartial}
        onRefresh={() => handleRefresh(true)}
        search={search}
        onSearchChange={setSearch}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        theme={theme}
        isDark={isDark}
      />
    ),
    [latestUpdatedTime, marketStatus.isStale, hasPartial, handleRefresh, search, sortMode, theme, isDark]
  );

  return (
    <ScreenContainer scrollable={false} withPadding={true} edges={['left', 'right']}>
      {loading && !refreshing && items.length === 0 ? (
        <LoadingState message="Canlı altın fiyatları yükleniyor..." fullScreen={false} />
      ) : error && items.length === 0 ? (
        <ErrorState
          title="Fiyatlar Alınamadı"
          message={error}
          onRetry={() => handleRefresh(false)}
          retryTitle="Yeniden Dene"
          retryLoading={loading}
          style={styles.centerContainer}
        />
      ) : (
        <FlatList
          data={filteredAndSortedItems}
          keyExtractor={(item) => item.product.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <EmptyState
              title={search ? 'Sonuç Bulunamadı' : 'Altın Fiyatı Bulunamadı'}
              description={
                search
                  ? `"${search}" aramasıyla eşleşen altın türü bulunamadı.`
                  : 'Şu anda listelenecek aktif altın fiyatı bulunmuyor.'
              }
              actionTitle={search ? 'Aramayı Temizle' : 'Yeniden Dene'}
              onAction={search ? () => setSearch('') : () => handleRefresh(false)}
              actionLoading={loading}
              style={styles.emptyContainer}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => handleRefresh(true)}
              tintColor={theme.colors.gold}
              colors={[theme.colors.gold]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fixedTopSection: {
    paddingTop: 8,
    marginBottom: 4,
  },
  timeInfoRow: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  timeInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    paddingTop: 8,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleColumn: {
    flex: 1,
    marginRight: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bannerSpacing: {
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 15,
  },
  clearIcon: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  sortChipsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
    marginBottom: 12,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  headerCol: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headerColRight: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'right',
  },
  productCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  productIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  productTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  productNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  cardSubtitleText: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  priceColumn: {
    flex: 1,
  },
  priceColumnRight: {
    alignItems: 'flex-end',
  },
  priceTypeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceValueBold: {
    fontSize: 16,
    fontWeight: '800',
  },
  priceDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 12,
  },
  unavailableWarningRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#33333320',
  },
  unavailableWarningText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  centerContainer: {
    marginTop: 40,
  },
  emptyContainer: {
    marginTop: 30,
  },
});
