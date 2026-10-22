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
import { goldPriceService } from '@/services/goldPriceService';
import type { ProductWithPrice } from '@/models/goldPrice';
import { formatDateTime, formatMoney, formatPercent } from '@/utils/formatters';

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

export default function PricesScreen() {
  const { theme, isDark } = useTheme();

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
      const data = await goldPriceService.getProductsWithPrices();
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

  // Eski (stale) ve kısmi (partial) veri durumunu analiz eder
  const { hasStale, hasPartial } = useMemo(() => {
    let staleCount = 0;
    let partialCount = 0;

    for (const item of items) {
      if (item.price?.status === 'stale') {
        staleCount++;
      } else if (item.price === null || item.price.status === 'partial' || item.price.status === 'unavailable') {
        partialCount++;
      }
    }

    return {
      hasStale: staleCount > 0,
      hasPartial: partialCount > 0,
    };
  }, [items]);

  // Arama ve sıralama filtresini uygular
  const filteredAndSortedItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');

    // 1. Arama Filtresi (Türkçe küçük harf duyarlı)
    const filtered = items.filter((item) => {
      if (!query) return true;
      const name = item.product.name.toLocaleLowerCase('tr-TR');
      const shortName = (item.product.shortName ?? '').toLocaleLowerCase('tr-TR');
      const code = item.product.code.toLocaleLowerCase('tr-TR');
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

  // Liste başlığı bileşeni (Header)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Ekran Başlığı ve Durum Göstergesi */}
      <View style={styles.titleRow}>
        <View style={styles.titleColumn}>
          <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>
            Canlı Altın Fiyatları
          </Text>
          <Text style={[styles.screenSubtitle, { color: theme.colors.textSecondary }]}>
            {latestUpdatedTime
              ? `Son Güncelleme: ${formatDateTime(latestUpdatedTime)}`
              : 'Piyasa verileri güncelleniyor...'}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: hasStale
                ? theme.colors.warningLight
                : isDark
                ? '#1e382b'
                : '#e8f5e9',
              borderColor: hasStale ? theme.colors.warning : theme.colors.profit,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: hasStale ? theme.colors.warning : theme.colors.profit,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: hasStale ? theme.colors.warning : theme.colors.profit,
              },
            ]}
          >
            {hasStale ? 'Gecikmeli' : 'Canlı Piyasa'}
          </Text>
        </View>
      </View>

      {/* Eski Veri Şeridi (ADR-014) */}
      {hasStale && (
        <StaleDataBanner
          lastUpdatedAt={latestUpdatedTime ? formatDateTime(latestUpdatedTime) : undefined}
          onRefresh={() => handleRefresh(true)}
          style={styles.bannerSpacing}
        />
      )}

      {/* Kısmi Veri Şeridi (ADR-013) */}
      {!hasStale && hasPartial && (
        <PartialDataBanner
          message="Bazı altın türlerinin güncel piyasa fiyatı henüz temin edilemedi veya kısmi olarak yayınlandı."
          style={styles.bannerSpacing}
        />
      )}

      {/* Arama Alanı */}
      <TextField
        placeholder="Altın türü ara (ör. Gram, Çeyrek, Ata)..."
        value={search}
        onChangeText={setSearch}
        leftIcon={<Text style={styles.searchIcon}>🔍</Text>}
        rightIcon={
          search.length > 0 ? (
            <Pressable
              onPress={() => setSearch('')}
              hitSlop={8}
              accessibilityLabel="Aramayı temizle"
              accessibilityRole="button"
            >
              <Text style={[styles.clearIcon, { color: theme.colors.textSecondary }]}>✕</Text>
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
              onPress={() => setSortMode(opt.id)}
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

  // Tekil Ürün Kartı Bileşeni
  const renderItem = ({ item }: { item: ProductWithPrice }) => {
    const { product, price } = item;
    const dailyChange = price?.dailyChangePercent;

    // Fiyat mevcut mu kontrolü (ADR-013)
    const hasBuyPrice = price?.buyPriceMinor !== null && price?.buyPriceMinor !== undefined;
    const hasSellPrice = price?.sellPriceMinor !== null && price?.sellPriceMinor !== undefined;
    const isPriceUnavailable = !hasBuyPrice && !hasSellPrice;

    return (
      <Pressable
        onPress={() => router.push(`/(protected)/gold/${product.id}` as any)}
        style={({ pressed }) => [
          styles.productCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, Alış: ${
          hasBuyPrice ? formatMoney(price?.buyPriceMinor, price?.currencyCode) : 'Fiyat yok'
        }, Satış: ${
          hasSellPrice ? formatMoney(price?.sellPriceMinor, price?.currencyCode) : 'Fiyat yok'
        }`}
      >
        {/* Üst Kısım: Ürün Adı, Kategori Rozeti ve Günlük Değişim */}
        <View style={styles.cardTopRow}>
          <View style={styles.productTitleArea}>
            <Text
              style={[styles.productName, { color: theme.colors.textPrimary }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {product.name}
            </Text>

            <View style={styles.badgeRow}>
              {product.shortName ? (
                <View
                  style={[
                    styles.miniBadge,
                    {
                      backgroundColor: isDark
                        ? theme.colors.surfaceElevated
                        : theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.miniBadgeText, { color: theme.colors.textSecondary }]}>
                    {product.shortName}
                  </Text>
                </View>
              ) : null}

              {price?.status === 'stale' && (
                <View
                  style={[
                    styles.miniBadge,
                    {
                      backgroundColor: theme.colors.warningLight,
                      borderColor: theme.colors.warning,
                    },
                  ]}
                >
                  <Text style={[styles.miniBadgeText, { color: theme.colors.warning }]}>
                    Eski Veri
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Günlük Değişim Rozeti (Yalnızca değer varsa gösterilir) */}
          {dailyChange !== null && dailyChange !== undefined ? (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor:
                    dailyChange > 0
                      ? isDark
                        ? '#143825'
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
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                {dailyChange > 0 ? '▲ ' : dailyChange < 0 ? '▼ ' : ''}
                {formatPercent(dailyChange)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Alt Kısım: Alış ve Satış Fiyatları (Açık ve Karışıklığa Yer Vermeyecek Şekilde) */}
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
              {hasBuyPrice ? formatMoney(price?.buyPriceMinor, price?.currencyCode) : '-'}
            </Text>
          </View>

          {/* Dikey Ayırıcı */}
          <View style={[styles.priceDivider, { backgroundColor: theme.colors.divider }]} />

          {/* Satış Fiyatı Kutusu */}
          <View style={[styles.priceColumn, styles.priceColumnRight]}>
            <Text style={[styles.priceTypeLabel, { color: theme.colors.textSecondary }]}>
              Satış (Satın Alma)
            </Text>
            <Text
              style={[
                styles.priceValue,
                {
                  color: hasSellPrice ? theme.colors.gold : theme.colors.textTertiary,
                },
              ]}
            >
              {hasSellPrice ? formatMoney(price?.sellPriceMinor, price?.currencyCode) : '-'}
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
  };

  return (
    <ScreenContainer scrollable={false} withPadding={true} edges={['top', 'left', 'right']}>
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
          ListHeaderComponent={renderHeader}
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
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
    marginRight: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
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
    borderRadius: 4,
    borderWidth: 1,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '600',
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
