/**
 * Altın İz — Portföye Altın Ekle Ekranı (portfolio/add)
 * src/app/(protected)/portfolio/add.tsx
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 10 ve Bölüm 18.2
 * API Referansı: docs/API.md Bölüm 16.2 (Portföy kaydı oluştur)
 * Karar Referansları:
 * - ADR-009 (Miktar ve Ölçü Birimi)
 * - ADR-010 (Portföy Değerleme Yöntemi)
 * - ADR-032 (Sayısal Hassasiyet)
 *
 * Form Doğrulama Kuralları:
 * 1. Yalnızca portfolio_enabled = true olan aktif ürünler seçilebilir.
 * 2. Miktar > 0 olmalı; adetli üründe tam sayı, gramlı üründe en fazla 3 ondalık.
 * 3. Alış tarihi bugünden sonraki bir tarih olamaz.
 * 4. Ödenen toplam tutar > 0 olmalı; kuruş cinsinden saklanır.
 * 5. Alış yeri en fazla 100 karakter, not en fazla 500 karakter.
 * 6. Çift gönderimi önlemek için buton gönderim anında devre dışı bırakılır.
 * 7. user_id asla formdan alınmaz; oturumdan atanır.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextField } from '@/components/forms/TextField';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/feedback';
import { useTheme } from '@/hooks/useTheme';
import { goldProductService } from '@/services/goldProductService';
import { portfolioService } from '@/services/portfolioService';
import { logger } from '@/utils/logger';
import { applyDateMask, formatMoney, normalizeSearchText } from '@/utils/formatters';
import type { GoldProduct } from '@/models/goldProduct';
import {
  parseQuantity,
  validateQuantity,
  parseDateInputToISO,
  isFutureDate,
  parseMoneyInputToMinor,
} from '@/domain/validation';

/**
 * Günün tarihini varsayılan GG.AA.YYYY formatında döner.
 */
function getTodayFormatted(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function PortfolioAddScreen() {
  const {
    productId: initialProductId,
    quantity: initialQuantity,
    estimatedTotal: initialEstimatedTotal,
  } = useLocalSearchParams<{
    productId?: string;
    quantity?: string;
    estimatedTotal?: string;
  }>();
  const { theme, isDark } = useTheme();

  // Veri Durumları
  const [products, setProducts] = useState<GoldProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<GoldProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Alanları
  const [quantityInput, setQuantityInput] = useState(initialQuantity || '1');
  const [purchaseDateInput, setPurchaseDateInput] = useState(getTodayFormatted());
  const [totalCostInput, setTotalCostInput] = useState(() => {
    if (initialEstimatedTotal) {
      const num = parseFloat(initialEstimatedTotal);
      if (Number.isFinite(num) && num > 0) {
        return num.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
    }
    return '';
  });
  const [purchasePlace, setPurchasePlace] = useState('');
  const [note, setNote] = useState('');
  const [laborIncluded, setLaborIncluded] = useState<boolean | null>(null);

  // Canlı toplam tutar biçimlendirme önizlemesi
  const parsedCostMinor = useMemo(() => {
    if (!totalCostInput || !totalCostInput.trim()) return null;
    const minor = parseMoneyInputToMinor(totalCostInput);
    return minor !== null && minor > 0 ? minor : null;
  }, [totalCostInput]);

  // Hata Durumları
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [costError, setCostError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Gönderim ve Çift Tıklama Koruması
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // Ürün Seçici Modalı
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Sayfa açıldığında portföye eklenebilir ürünleri çek
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await goldProductService.getPortfolioProducts();
        if (!isMounted) return;

        setProducts(data);

        // Başlangıç ürünü belirle
        if (data.length > 0) {
          if (initialProductId) {
            const matched = data.find((p) => p.id === initialProductId);
            setSelectedProduct(matched || data[0]);
          } else {
            setSelectedProduct(data[0]);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.userMessage || 'Altın ürünleri yüklenemedi. Lütfen tekrar deneyin.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [initialProductId]);

  // Modal içindeki filtrelenmiş ürünler
  const filteredProducts = useMemo(() => {
    const query = normalizeSearchText(pickerSearch);
    if (!query) return products;
    return products.filter((p) => {
      const name = normalizeSearchText(p.name);
      const short = normalizeSearchText(p.shortName);
      const code = normalizeSearchText(p.code);
      return name.includes(query) || short.includes(query) || code.includes(query);
    });
  }, [products, pickerSearch]);

  // Miktar birim etiketi
  const unitLabel = useMemo(() => {
    if (!selectedProduct) return '';
    return selectedProduct.measurementUnit === 'piece' ? 'Adet' : 'Gram';
  }, [selectedProduct]);

  // Form Doğrulama ve Kaydetme
  const handleSave = useCallback(async () => {
    if (submittingRef.current || isSubmitting) return;

    // Hataları sıfırla
    setQuantityError(null);
    setDateError(null);
    setCostError(null);
    setSubmitError(null);

    if (!selectedProduct) {
      setSubmitError('Lütfen bir altın ürünü seçiniz.');
      return;
    }

    // 1. Miktar doğrulaması
    const parsedQty = parseQuantity(quantityInput);
    const qtyValidation = validateQuantity(parsedQty, selectedProduct.measurementUnit);
    if (!qtyValidation.isValid) {
      setQuantityError(qtyValidation.error || 'Geçerli bir miktar giriniz.');
      return;
    }

    // 2. Alış tarihi doğrulaması
    const isoDate = parseDateInputToISO(purchaseDateInput);
    if (!isoDate) {
      setDateError('Lütfen geçerli bir tarih giriniz (Örn: 22.10.2026).');
      return;
    }
    if (isFutureDate(isoDate)) {
      setDateError('Alış tarihi bugünden sonraki bir tarih olamaz.');
      return;
    }

    // 3. Ödenen toplam tutar doğrulaması
    const totalCostMinor = parseMoneyInputToMinor(totalCostInput);
    if (!totalCostMinor || totalCostMinor <= 0) {
      setCostError('Ödenen toplam tutar sıfırdan büyük geçerli bir tutar olmalıdır.');
      return;
    }

    // 4. Metin sınır kontrolleri
    const cleanPlace = purchasePlace.trim();
    if (cleanPlace.length > 100) {
      setSubmitError('Alış yeri en fazla 100 karakter olabilir.');
      return;
    }

    const cleanNote = note.trim();
    if (cleanNote.length > 500) {
      setSubmitError('Not alanı en fazla 500 karakter olabilir.');
      return;
    }

    // Kayıt oluştur
    try {
      submittingRef.current = true;
      setIsSubmitting(true);

      const newEntry = await portfolioService.createEntry({
        productId: selectedProduct.id,
        quantity: parsedQty!,
        purchaseDate: isoDate,
        totalCostMinor,
        purchasePlace: cleanPlace || null,
        note: cleanNote || null,
        laborIncluded,
      });

      setSubmitSuccess(true);

      // Başarılı işlem sonrası eklenen kaydın detay ekranına yönlendir (ARCHITECTURE.md Bölüm 18.2)
      setTimeout(() => {
        if (newEntry?.id) {
          router.replace(`/(protected)/portfolio/${newEntry.id}`);
        } else {
          router.replace('/(protected)/(tabs)/portfolio');
        }
      }, 750);
    } catch (err: any) {
      setSubmitError(
        err.userMessage || 'Kayıt eklenirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    selectedProduct,
    quantityInput,
    purchaseDateInput,
    totalCostInput,
    purchasePlace,
    note,
    laborIncluded,
  ]);

  // Yükleme durumu
  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Altın ürünleri hazırlanıyor..." />
      </ScreenContainer>
    );
  }

  // Hata durumu
  if (error || products.length === 0) {
    return (
      <ScreenContainer>
        <ErrorState
          title="Ürünler Yüklenemedi"
          message={error || 'Portföye eklenebilecek aktif altın ürünü bulunamadı.'}
          onRetry={() => {
            setLoading(true);
            goldProductService.getPortfolioProducts().then(setProducts).catch((err) => logger.error('PortfolioAdd', 'Ürünler yüklenemedi', err)).finally(() => setLoading(false));
          }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={true} edges={['left', 'right', 'bottom']}>
      <View style={styles.form}>
        {/* Başarı Bildirimi */}
        {submitSuccess && (
          <View style={[styles.successBanner, { backgroundColor: isDark ? '#143823' : '#D1FADF', borderColor: theme.colors.profit }]}>
            <Text style={[styles.successText, { color: theme.colors.profit }]}>
              ✓ Altın kaydınız başarıyla portföyünüze eklendi! Yönlendiriliyorsunuz...
            </Text>
          </View>
        )}

        {/* Genel Hata Bildirimi */}
        {submitError && (
          <View style={[styles.errorBanner, { backgroundColor: isDark ? '#3D1414' : '#FEE4E2', borderColor: theme.colors.loss }]}>
            <Text style={[styles.errorBannerText, { color: theme.colors.loss }]}>
              {submitError}
            </Text>
          </View>
        )}

        {/* 1. Altın Türü Seçimi */}
        <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
          Altın Türü
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.pickerTrigger,
            {
              backgroundColor: theme.colors.card,
              borderColor: isPickerOpen ? theme.colors.primary : theme.colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => setIsPickerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Altın türü seçiniz"
        >
          <View style={styles.pickerTriggerContent}>
            <Text style={[styles.pickerTriggerTitle, { color: theme.colors.textPrimary }]}>
              {selectedProduct ? selectedProduct.name : 'Altın türü seçiniz'}
            </Text>
            {selectedProduct && (
              <View
                style={[
                  styles.unitBadge,
                  {
                    backgroundColor: isDark ? 'rgba(212, 167, 44, 0.15)' : theme.colors.goldLight,
                    borderColor: theme.colors.gold,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.unitBadgeText, { color: theme.colors.gold, fontWeight: '700' }]}>
                  {unitLabel}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>▼</Text>
        </Pressable>

        {/* 2. Miktar Alanı */}
        <TextField
          label={`Miktar (${unitLabel})`}
          placeholder={selectedProduct?.measurementUnit === 'piece' ? 'Örn: 2' : 'Örn: 1.50'}
          value={quantityInput}
          onChangeText={(val) => {
            setQuantityInput(val);
            if (quantityError) setQuantityError(null);
          }}
          keyboardType={selectedProduct?.measurementUnit === 'piece' ? 'number-pad' : 'decimal-pad'}
          error={quantityError ?? undefined}
          hint={
            selectedProduct?.measurementUnit === 'piece'
              ? 'Adetli ürünlerde yalnızca pozitif tam sayı giriniz (Örn: 1, 2, 5).'
              : 'Gramlı ürünlerde en fazla 3 ondalık basamak kullanabilirsiniz (Örn: 1.250).'
          }
        />

        {/* 3. Alış Tarihi */}
        <TextField
          label="Alış Tarihi"
          placeholder="GG.AA.YYYY (Örn: 22.10.2026)"
          value={purchaseDateInput}
          onChangeText={(val) => {
            const masked = applyDateMask(val, purchaseDateInput);
            setPurchaseDateInput(masked);
            if (dateError) setDateError(null);
          }}
          keyboardType="numeric"
          maxLength={10}
          error={dateError ?? undefined}
          hint="Altını satın aldığınız gerçek tarihi giriniz. Bugünden ileri bir tarih olamaz."
        />

        {/* 4. Ödenen Toplam Tutar */}
        <TextField
          label="Ödenen Toplam Tutar (TL)"
          placeholder="Örn: 6.280,00"
          value={totalCostInput}
          onChangeText={(val) => {
            setTotalCostInput(val);
            if (costError) setCostError(null);
          }}
          keyboardType="decimal-pad"
          error={costError ?? undefined}
          hint="Satın alırken ödediğiniz net tutarı giriniz (İşçilik veya komisyon dâhil toplam ödeme)."
        />

        {/* Canlı Binlik Ayracı Önizleme Rozeti */}
        {parsedCostMinor ? (
          <View
            style={[
              styles.costPreviewRow,
              {
                backgroundColor: isDark ? theme.colors.surfaceElevated : '#F0FDF4',
                borderColor: theme.colors.profit,
              },
            ]}
          >
            <Feather name="check-circle" size={14} color={theme.colors.profit} />
            <Text style={[styles.costPreviewLabel, { color: theme.colors.textSecondary }]}>
              Önizleme:
            </Text>
            <Text style={[styles.costPreviewValue, { color: theme.colors.profit }]}>
              {formatMoney(parsedCostMinor)}
            </Text>
          </View>
        ) : null}

        {/* 5. Alış Yeri (İsteğe bağlı) */}
        <TextField
          label={`Alış Yeri (İsteğe bağlı - ${purchasePlace.length}/100)`}
          placeholder="Örn: Kapalıçarşı, Kuyumcukent, Banka..."
          value={purchasePlace}
          onChangeText={setPurchasePlace}
          maxLength={100}
        />

        {/* 6. Not (İsteğe bağlı) */}
        <TextField
          label={`Not (İsteğe bağlı - ${note.length}/500)`}
          placeholder="Örn: Düğün hediyesi birikimi, çocukların geleceği için..."
          value={note}
          onChangeText={setNote}
          maxLength={500}
          multiline={true}
          numberOfLines={3}
          inputStyle={styles.multilineInput}
        />

        {/* 7. İşçilik Dâhil Seçeneği */}
        <View style={styles.laborContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>
            Ödenen Tutara İşçilik Dâhil mi?
          </Text>
          <View style={styles.laborButtonGroup}>
            <Pressable
              style={[
                styles.laborButton,
                {
                  backgroundColor:
                    laborIncluded === true
                      ? theme.colors.primary
                      : isDark
                      ? '#222'
                      : '#F2F4F7',
                },
              ]}
              onPress={() => setLaborIncluded(true)}
            >
              <Text
                style={[
                  styles.laborButtonText,
                  { color: laborIncluded === true ? theme.colors.textInverse : theme.colors.textPrimary },
                ]}
              >
                Dâhil
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.laborButton,
                {
                  backgroundColor:
                    laborIncluded === false
                      ? theme.colors.primary
                      : isDark
                      ? '#222'
                      : '#F2F4F7',
                },
              ]}
              onPress={() => setLaborIncluded(false)}
            >
              <Text
                style={[
                  styles.laborButtonText,
                  { color: laborIncluded === false ? theme.colors.textInverse : theme.colors.textPrimary },
                ]}
              >
                Hariç
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.laborButton,
                {
                  backgroundColor:
                    laborIncluded === null
                      ? theme.colors.primary
                      : isDark
                      ? '#222'
                      : '#F2F4F7',
                },
              ]}
              onPress={() => setLaborIncluded(null)}
            >
              <Text
                style={[
                  styles.laborButtonText,
                  { color: laborIncluded === null ? theme.colors.textInverse : theme.colors.textPrimary },
                ]}
              >
                Belirtilmedi
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 8. Aksiyon Butonları */}
        <PrimaryButton
          title={isSubmitting ? 'Kaydediliyor...' : 'Portföye Kaydet'}
          onPress={handleSave}
          disabled={isSubmitting || submitSuccess}
          style={styles.saveButton}
        />

        <SecondaryButton
          title="Vazgeç"
          onPress={() => router.back()}
          disabled={isSubmitting}
        />
      </View>

      {/* Altın Türü Seçim Modalı */}
      <Modal
        visible={isPickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPickerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Altın Türü Seçin
              </Text>
              <Pressable
                onPress={() => setIsPickerOpen(false)}
                hitSlop={12}
                accessibilityLabel="Kapat"
              >
                <Text style={[styles.modalCloseText, { color: theme.colors.textSecondary }]}>✕</Text>
              </Pressable>
            </View>

            {/* Modal Arama Çubuğu */}
            <TextField
              placeholder="Altın türü ara..."
              value={pickerSearch}
              onChangeText={setPickerSearch}
              containerStyle={styles.pickerSearchContainer}
            />

            {/* Ürün Listesi */}
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <EmptyState
                  title="Ürün Bulunamadı"
                  description="Arama kriterinize uygun aktif altın türü bulunamadı."
                />
              }
              renderItem={({ item }) => {
                const isSelected = selectedProduct?.id === item.id;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalItem,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? '#1E3A5F'
                            : '#EBF5FF'
                          : pressed
                          ? isDark
                            ? '#2A2A2A'
                            : '#F5F5F5'
                          : 'transparent',
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedProduct(item);
                      setIsPickerOpen(false);
                      setPickerSearch('');
                      setQuantityError(null);
                    }}
                  >
                    <View style={styles.modalItemInfo}>
                      <Text
                        style={[
                          styles.modalItemTitle,
                          {
                            color: isSelected
                              ? theme.colors.primary
                              : theme.colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.shortName ? (
                        <Text style={[styles.modalItemSub, { color: theme.colors.textTertiary }]}>
                          {item.shortName} • {item.measurementUnit === 'piece' ? 'Adet' : 'Gram'}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected && (
                      <Text style={[styles.modalCheckmark, { color: theme.colors.primary }]}>
                        ✓
                      </Text>
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  pickerTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  pickerTriggerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 12,
    marginLeft: 8,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  laborContainer: {
    marginVertical: 12,
  },
  laborButtonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  laborButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laborButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 12,
  },
  successBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: '600',
    padding: 4,
  },
  pickerSearchContainer: {
    marginBottom: 12,
  },
  modalList: {
    paddingBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  modalItemSub: {
    fontSize: 12,
  },
  modalCheckmark: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  costPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: -8,
    marginBottom: 16,
    gap: 6,
  },
  costPreviewLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  costPreviewValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
