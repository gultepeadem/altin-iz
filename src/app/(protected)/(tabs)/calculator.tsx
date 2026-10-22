/**
 * Altın İz — Hesapla Ekranı (tabs/calculator)
 * src/app/(protected)/(tabs)/calculator.tsx
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 13 ve Bölüm 18.3
 * Karar Referansları:
 * - ADR-009 (Miktar ve Ölçü Birimi)
 * - ADR-011 (Hesaplama Ekranı: Satın Alma = Satış Fiyatı, Bozdurma = Alış Fiyatı)
 * - ADR-013 (Fiyat Yoksa 0 TL Kullanılmaz, Hesap Yapılmaz)
 * - ADR-014 (Eski Fiyat Uyarısı)
 * - ADR-032 (Sayısal Hassasiyet ve Yuvarlama Modeli)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextField } from '@/components/forms/TextField';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  StaleDataBanner,
} from '@/components/feedback';
import { useTheme } from '@/hooks/useTheme';
import { goldProductService } from '@/services/goldProductService';
import { goldPriceService } from '@/services/goldPriceService';
import type { GoldProduct } from '@/models/goldProduct';
import type { GoldPrice } from '@/models/goldPrice';
import {
  calculatePurchaseEstimate,
  calculateRedemptionEstimate,
  type EstimateResult,
} from '@/domain/calculations/valuation';
import {
  parseQuantity,
  validateQuantity,
} from '@/domain/validation/quantityValidation';
import { formatDateTime, formatMoney } from '@/utils/formatters';

export type CalculationMode = 'buy' | 'sell';

export default function CalculatorScreen() {
  const { productId: initialProductId } = useLocalSearchParams<{ productId?: string }>();
  const { theme, isDark } = useTheme();

  // Veri Durumları
  const [products, setProducts] = useState<GoldProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<GoldProduct | null>(null);
  const [priceMap, setPriceMap] = useState<Map<string, GoldPrice>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Durumları
  const [mode, setMode] = useState<CalculationMode>('buy');
  const [quantityInput, setQuantityInput] = useState('1');
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] = useState<EstimateResult | null>(null);
  const [calculatedQuantity, setCalculatedQuantity] = useState<number | null>(null);

  // Ürün Seçim Modalı
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Sayfa ilk yüklendiğinde verileri Supabase'den çeker
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const [calcProducts, latestPrices] = await Promise.all([
          goldProductService.getCalculatorProducts(),
          goldPriceService.getLatestPrices(),
        ]);

        if (!isMounted) return;

        setProducts(calcProducts);

        const pMap = new Map<string, GoldPrice>();
        for (const p of latestPrices) {
          pMap.set(p.productId, p);
        }
        setPriceMap(pMap);

        // Başlangıçta seçilecek ürün
        if (calcProducts.length > 0) {
          if (initialProductId) {
            const matched = calcProducts.find((p) => p.id === initialProductId);
            setSelectedProduct(matched || calcProducts[0]);
          } else {
            setSelectedProduct((prev) => prev || calcProducts[0]);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Hesaplama verileri yüklenirken bir sorun oluştu.');
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
  }, [initialProductId]);

  // Manuel yenileme veya tekrar deneme
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [calcProducts, latestPrices] = await Promise.all([
        goldProductService.getCalculatorProducts(),
        goldPriceService.getLatestPrices(),
      ]);

      setProducts(calcProducts);

      const pMap = new Map<string, GoldPrice>();
      for (const p of latestPrices) {
        pMap.set(p.productId, p);
      }
      setPriceMap(pMap);

      if (calcProducts.length > 0) {
        if (initialProductId) {
          const matched = calcProducts.find((p) => p.id === initialProductId);
          setSelectedProduct(matched || calcProducts[0]);
        } else {
          setSelectedProduct((prev) => prev || calcProducts[0]);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Hesaplama verileri yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, [initialProductId]);

  // Seçili ürünün en son fiyatı
  const activePrice = useMemo(() => {
    if (!selectedProduct) return null;
    return priceMap.get(selectedProduct.id) ?? null;
  }, [selectedProduct, priceMap]);

  // Aktif fiyata göre birim fiyat (ADR-011)
  const activeUnitPriceMinor = useMemo(() => {
    if (!activePrice) return null;
    return mode === 'buy' ? activePrice.sellPriceMinor : activePrice.buyPriceMinor;
  }, [activePrice, mode]);

  const hasUnitPrice = activeUnitPriceMinor !== null && activeUnitPriceMinor > 0;
  const isStale = activePrice?.status === 'stale';

  // Birim etiketi
  const unitLabel = useMemo(() => {
    if (!selectedProduct) return 'Miktar';
    if (selectedProduct.measurementUnit === 'piece') return 'Adet';
    if (selectedProduct.measurementUnit === 'gram') return 'Gram';
    return 'Ons';
  }, [selectedProduct]);

  // Hesaplama işlemi
  const handleCalculate = () => {
    if (!selectedProduct) return;

    // 1. Miktarı ayrıştır ve doğrula
    const parsed = parseQuantity(quantityInput);
    const validation = validateQuantity(parsed, selectedProduct.measurementUnit);

    if (!validation.isValid) {
      setQuantityError(validation.error || 'Geçersiz miktar.');
      setCalculationResult(null);
      return;
    }

    setQuantityError(null);
    const validQty = validation.normalizedQuantity!;

    // 2. Fiyat yoksa hesaplama engellenir (ADR-013)
    if (!hasUnitPrice) {
      setCalculationResult({
        success: false,
        estimatedTotalMinor: null,
        estimatedTotal: null,
        unitPriceMinor: null,
        error: 'Bu altın türünün güncel fiyatı temin edilemediği için hesaplama yapılamadı.',
      });
      return;
    }

    // 3. Moduna göre etki alanı fonksiyonunu çalıştır (ADR-011)
    let result: EstimateResult;
    if (mode === 'buy') {
      result = calculatePurchaseEstimate(validQty, activeUnitPriceMinor);
    } else {
      result = calculateRedemptionEstimate(validQty, activeUnitPriceMinor);
    }

    setCalculatedQuantity(validQty);
    setCalculationResult(result);
  };

  // Sonucu temizleme
  const handleClear = () => {
    setQuantityInput('1');
    setQuantityError(null);
    setCalculationResult(null);
    setCalculatedQuantity(null);
  };

  // Modal içindeki filtrelenmiş ürün listesi
  const filteredModalProducts = useMemo(() => {
    const q = pickerSearch.trim().toLocaleLowerCase('tr-TR');
    if (!q) return products;
    return products.filter((p) => {
      const name = p.name.toLocaleLowerCase('tr-TR');
      const shortName = (p.shortName ?? '').toLocaleLowerCase('tr-TR');
      return name.includes(q) || shortName.includes(q);
    });
  }, [products, pickerSearch]);

  if (loading && products.length === 0) {
    return (
      <ScreenContainer scrollable={false} withPadding={true} edges={['top', 'left', 'right']}>
        <LoadingState message="Hesaplama sistemi yükleniyor..." />
      </ScreenContainer>
    );
  }

  if (error && products.length === 0) {
    return (
      <ScreenContainer scrollable={false} withPadding={true} edges={['top', 'left', 'right']}>
        <ErrorState
          title="Hesaplama Başlatılamadı"
          message={error}
          onRetry={loadData}
          retryTitle="Yeniden Dene"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={true} withPadding={true} keyboardAvoiding={true} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* İşlem Türü Seçimi (Satın Alacağım / Bozduracağım - ADR-011) */}
        <View
          style={[
            styles.modeToggle,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              setMode('buy');
              setCalculationResult(null);
            }}
            style={[
              styles.toggleOption,
              mode === 'buy' && {
                backgroundColor: isDark ? theme.colors.gold : theme.colors.primary,
              },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'buy' }}
            accessibilityLabel="Satın Alacağım modu"
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    mode === 'buy'
                      ? theme.colors.textInverse
                      : theme.colors.textSecondary,
                  fontWeight: mode === 'buy' ? '700' : '500',
                },
              ]}
            >
              Satın Alacağım
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setMode('sell');
              setCalculationResult(null);
            }}
            style={[
              styles.toggleOption,
              mode === 'sell' && {
                backgroundColor: isDark ? theme.colors.gold : theme.colors.primary,
              },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'sell' }}
            accessibilityLabel="Bozduracağım modu"
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    mode === 'sell'
                      ? theme.colors.textInverse
                      : theme.colors.textSecondary,
                  fontWeight: mode === 'sell' ? '700' : '500',
                },
              ]}
            >
              Bozduracağım
            </Text>
          </Pressable>
        </View>

        {/* Eski Fiyat Uyarısı (ADR-014) */}
        {isStale && (
          <StaleDataBanner
            lastUpdatedAt={
              activePrice?.sourcePriceAt ? formatDateTime(activePrice.sourcePriceAt) : undefined
            }
            onRefresh={loadData}
            style={styles.bannerSpacing}
          />
        )}

        {/* Altın Türü Seçici Kartı */}
        <View style={styles.fieldSection}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Altın Türü Seçiniz
          </Text>

          <Pressable
            onPress={() => setIsPickerOpen(true)}
            style={[
              styles.productSelector,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Seçili altın: ${selectedProduct?.name ?? 'Seçiniz'}`}
          >
            <View style={styles.selectorLeft}>
              <Text style={[styles.selectedProductName, { color: theme.colors.textPrimary }]}>
                {selectedProduct ? selectedProduct.name : 'Altın türü seçin...'}
              </Text>
              <Text style={[styles.selectedProductSub, { color: theme.colors.textSecondary }]}>
                {selectedProduct?.shortName ? `${selectedProduct.shortName} • ` : ''}
                {unitLabel} bazlı hesaplama
              </Text>
            </View>
            <Text style={[styles.selectorArrow, { color: theme.colors.textSecondary }]}>▼</Text>
          </Pressable>
        </View>

        {/* Birim Fiyat Bilgilendirme Kartı */}
        <View
          style={[
            styles.unitPriceInfoCard,
            {
              backgroundColor: isDark ? theme.colors.surfaceElevated : '#f8f9fa',
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.unitPriceRow}>
            <Text style={[styles.unitPriceLabel, { color: theme.colors.textSecondary }]}>
              {mode === 'buy' ? 'Satış Fiyatı (Satın Alma):' : 'Alış Fiyatı (Bozdurma):'}
            </Text>
            <Text
              style={[
                styles.unitPriceValue,
                {
                  color: hasUnitPrice ? theme.colors.textPrimary : theme.colors.textTertiary,
                },
              ]}
            >
              {hasUnitPrice ? formatMoney(activeUnitPriceMinor, activePrice?.currencyCode) : '-'}
            </Text>
          </View>

          <Text style={[styles.unitPriceHint, { color: theme.colors.textTertiary }]}>
            {hasUnitPrice
              ? mode === 'buy'
                ? `Kuyumcudan satın alırken geçerli güncel satış fiyatıdır.`
                : `Kuyumcuya bozdururken geçerli güncel alış fiyatıdır.`
              : 'Bu ürün için şu anda aktif piyasa fiyatı temin edilememektedir.'}
          </Text>
        </View>

        {/* Miktar Giriş Alanı */}
        <TextField
          label={`Miktar (${unitLabel})`}
          placeholder={
            selectedProduct?.measurementUnit === 'piece'
              ? 'Örn: 1, 2, 5'
              : 'Örn: 1.5 veya 0,25'
          }
          value={quantityInput}
          onChangeText={(val) => {
            setQuantityInput(val);
            if (quantityError) setQuantityError(null);
          }}
          keyboardType={
            selectedProduct?.measurementUnit === 'piece' ? 'number-pad' : 'decimal-pad'
          }
          error={quantityError ?? undefined}
          hint={
            selectedProduct?.measurementUnit === 'piece'
              ? 'Yalnızca tam adet girilebilir (1, 2, 3 vb.).'
              : 'Azami 3 ondalık basamak girilebilir (1.250, 0.500 vb.).'
          }
          containerStyle={styles.quantityContainer}
        />

        {/* Butonlar: Hesapla & Temizle */}
        <View style={styles.buttonRow}>
          <PrimaryButton
            title="Hesapla"
            onPress={handleCalculate}
            disabled={!hasUnitPrice}
            style={styles.calcBtn}
          />
          <SecondaryButton
            title="Temizle"
            onPress={handleClear}
            style={styles.clearBtn}
          />
        </View>

        {/* Hesaplama Sonuç Kartı */}
        {calculationResult && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: calculationResult.success ? theme.colors.gold : theme.colors.loss,
              },
            ]}
          >
            {calculationResult.success ? (
              <>
                <Text style={[styles.resultTitle, { color: theme.colors.textSecondary }]}>
                  Tahmini Toplam Tutar
                </Text>

                <Text
                  style={[
                    styles.resultValue,
                    {
                      color: isDark ? theme.colors.gold : theme.colors.primary,
                    },
                  ]}
                >
                  {formatMoney(
                    calculationResult.estimatedTotalMinor,
                    activePrice?.currencyCode
                  )}
                </Text>

                <View style={[styles.resultDivider, { backgroundColor: theme.colors.divider }]} />

                {/* Detay Bilgileri */}
                <View style={styles.resultDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.colors.textSecondary }]}>
                      İşlem Türü
                    </Text>
                    <Text style={[styles.detailVal, { color: theme.colors.textPrimary }]}>
                      {mode === 'buy' ? 'Satın Alma' : 'Bozdurma'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.colors.textSecondary }]}>
                      Hesaplanan Miktar
                    </Text>
                    <Text style={[styles.detailVal, { color: theme.colors.textPrimary }]}>
                      {calculatedQuantity} {unitLabel}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.colors.textSecondary }]}>
                      Kullanılan Birim Fiyat
                    </Text>
                    <Text style={[styles.detailVal, { color: theme.colors.textPrimary }]}>
                      {formatMoney(
                        calculationResult.unitPriceMinor,
                        activePrice?.currencyCode
                      )}
                    </Text>
                  </View>

                  {activePrice?.sourcePriceAt ? (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailKey, { color: theme.colors.textSecondary }]}>
                        Fiyat Zamanı
                      </Text>
                      <Text style={[styles.detailVal, { color: theme.colors.textPrimary }]}>
                        {formatDateTime(activePrice.sourcePriceAt)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Portföye Ekle Butonu (Yalnızca portföye açık ürünler için) */}
                {selectedProduct?.portfolioEnabled && mode === 'buy' && (
                  <View style={styles.portfolioActionBox}>
                    <PrimaryButton
                      title="Bu Alışı Portföye Ekle"
                      onPress={() =>
                        router.push({
                          pathname: '/(protected)/portfolio/add',
                          params: {
                            productId: selectedProduct.id,
                            quantity: calculatedQuantity?.toString(),
                          },
                        } as any)
                      }
                      style={styles.portfolioAddBtn}
                    />
                    <Text style={[styles.portfolioNote, { color: theme.colors.textTertiary }]}>
                      Not: Piyasa tutarı portföye otomatik maliyet olarak kaydedilmez; alırken
                      gerçekten ödediğiniz tutarı sonraki ekranda belirleyebilirsiniz.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.errorResultBox}>
                <Text style={[styles.errorResultTitle, { color: theme.colors.loss }]}>
                  Hesaplama Yapılamadı
                </Text>
                <Text style={[styles.errorResultText, { color: theme.colors.textSecondary }]}>
                  {calculationResult.error}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Yasal / Finansal Bilgilendirme */}
        <View
          style={[
            styles.disclaimerCard,
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
            Hesaplama sonuçları serbest piyasa gösterge fiyatlarına dayanmaktadır. Nihai
            alım ve satım tutarlarınız kuyumcunuzun veya bankanızın komisyon, makas aralığı ve
            işçilik uygulamalarına göre farklılık gösterebilir. Yatırım tavsiyesi niteliği taşımaz.
          </Text>
        </View>
      </View>

      {/* Altın Türü Seçim Modalı */}
      <Modal
        visible={isPickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPickerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Altın Türü Seçin
              </Text>
              <Pressable
                onPress={() => setIsPickerOpen(false)}
                hitSlop={8}
                accessibilityLabel="Kapat"
                accessibilityRole="button"
              >
                <Text style={[styles.modalCloseText, { color: theme.colors.textSecondary }]}>✕</Text>
              </Pressable>
            </View>

            <TextField
              placeholder="Ara (ör. Gram, Çeyrek, Ata)..."
              value={pickerSearch}
              onChangeText={setPickerSearch}
              containerStyle={styles.modalSearch}
            />

            <FlatList
              data={filteredModalProducts}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedProduct?.id === item.id;
                const itemPrice = priceMap.get(item.id);
                const priceToShow = mode === 'buy' ? itemPrice?.sellPriceMinor : itemPrice?.buyPriceMinor;

                return (
                  <Pressable
                    onPress={() => {
                      setSelectedProduct(item);
                      setCalculationResult(null);
                      setIsPickerOpen(false);
                      setPickerSearch('');
                    }}
                    style={[
                      styles.pickerItem,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? theme.colors.surfaceElevated
                            : theme.colors.goldLight
                          : 'transparent',
                        borderColor: theme.colors.divider,
                      },
                    ]}
                  >
                    <View style={styles.pickerItemLeft}>
                      <Text
                        style={[
                          styles.pickerItemName,
                          {
                            color: isSelected ? theme.colors.gold : theme.colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={[styles.pickerItemSub, { color: theme.colors.textSecondary }]}>
                        {item.measurementUnit === 'piece' ? 'Adet' : 'Gram'} bazlı
                      </Text>
                    </View>

                    <Text style={[styles.pickerItemPrice, { color: theme.colors.textPrimary }]}>
                      {priceToShow ? formatMoney(priceToShow) : '-'}
                    </Text>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <EmptyState
                  title="Sonuç Bulunamadı"
                  description="Aramanıza uygun altın türü bulunamadı."
                />
              }
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 14,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 14,
  },
  bannerSpacing: {
    marginBottom: 14,
  },
  fieldSection: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  productSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorLeft: {
    flex: 1,
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  selectedProductSub: {
    fontSize: 11,
  },
  selectorArrow: {
    fontSize: 13,
    paddingHorizontal: 4,
  },
  unitPriceInfoCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  unitPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  unitPriceLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  unitPriceValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  unitPriceHint: {
    fontSize: 10,
    lineHeight: 14,
  },
  quantityContainer: {
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  calcBtn: {
    flex: 2,
  },
  clearBtn: {
    flex: 1,
  },
  resultCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 18,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultDivider: {
    height: 1,
    marginBottom: 12,
  },
  resultDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailKey: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  portfolioActionBox: {
    borderTopWidth: 1,
    borderTopColor: '#33333315',
    paddingTop: 12,
    marginTop: 4,
  },
  portfolioAddBtn: {
    width: '100%',
    marginBottom: 6,
  },
  portfolioNote: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  errorResultBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  errorResultTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorResultText: {
    fontSize: 12,
    textAlign: 'center',
  },
  disclaimerCard: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    padding: 4,
  },
  modalSearch: {
    marginBottom: 12,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderRadius: 8,
  },
  pickerItemLeft: {
    flex: 1,
    marginRight: 10,
  },
  pickerItemName: {
    fontSize: 14,
    marginBottom: 2,
  },
  pickerItemSub: {
    fontSize: 11,
  },
  pickerItemPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
});
