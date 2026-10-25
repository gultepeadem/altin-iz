/**
 * Altın İz — Portföy Kaydı Düzenleme Ekranı (portfolio/[entryId]/edit)
 * src/app/(protected)/portfolio/[entryId]/edit.tsx
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 10 ve Bölüm 18.2
 * API Referansı: docs/API.md Bölüm 16.4 (Portföy kaydını güncelle)
 * Karar Referansları:
 * - ADR-009 (Miktar ve Ölçü Birimi)
 * - ADR-032 (Sayısal Hassasiyet ve Kuruş Dönüşümü)
 *
 * Güvenlik ve Doğruluk Kuralları:
 * 1. 'id', 'user_id' ve 'created_at' asla değiştirilemez.
 * 2. Yalnızca oturumdaki kullanıcının kendi kaydı güncellenebilir (RLS korumalı).
 * 3. Miktar, tarih (bugünden ileri olamaz), toplam tutar ve metin sınırları doğrulanır.
 * 4. Kaydedilmemiş değişiklik varsa sayfadan ayrılırken kullanıcıdan onay alınır.
 * 5. Çift gönderimi önlemek için buton gönderim anında kilitlenir.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { DangerButton } from '@/components/common/DangerButton';
import { TextField } from '@/components/forms/TextField';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/feedback';
import { useTheme } from '@/hooks/useTheme';
import { portfolioService } from '@/services/portfolioService';
import { goldProductService } from '@/services/goldProductService';
import type { PortfolioEntry } from '@/models/portfolio';
import type { GoldProduct } from '@/models/goldProduct';
import {
  parseQuantity,
  validateQuantity,
  parseDateInputToISO,
  isFutureDate,
  parseMoneyInputToMinor,
} from '@/domain/validation';
import { formatDate, applyDateMask, formatMoney, normalizeSearchText } from '@/utils/formatters';

export default function PortfolioEditScreen() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const { theme, isDark } = useTheme();

  // Veri Durumları
  const [initialEntry, setInitialEntry] = useState<PortfolioEntry | null>(null);
  const [products, setProducts] = useState<GoldProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<GoldProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Alanları
  const [quantityInput, setQuantityInput] = useState('');
  const [purchaseDateInput, setPurchaseDateInput] = useState('');
  const [totalCostInput, setTotalCostInput] = useState('');
  const [purchasePlace, setPurchasePlace] = useState('');
  const [note, setNote] = useState('');
  const [laborIncluded, setLaborIncluded] = useState<boolean | null>(null);

  // Hata Durumları
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [costError, setCostError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Gönderim ve Kilit Koruması
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // Modal Durumları
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // İlk yükleme
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!entryId) {
        if (isMounted) {
          setError('Geçersiz portföy kayıt kimliği.');
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const [entryData, productList] = await Promise.all([
          portfolioService.getEntryById(entryId),
          goldProductService.getPortfolioProducts(),
        ]);

        if (!isMounted) return;

        if (!entryData) {
          setError('Portföy kaydı bulunamadı veya bu kayda erişim yetkiniz yok.');
          setLoading(false);
          return;
        }

        setInitialEntry(entryData);
        setProducts(productList);

        // Seçili ürünü belirle
        const matchedProduct = productList.find((p) => p.id === entryData.productId);
        setSelectedProduct(matchedProduct || (entryData.product as GoldProduct) || null);

        // Form alanlarını mevcut verilerle doldur
        setQuantityInput(String(entryData.quantity));
        setPurchaseDateInput(formatDate(entryData.purchaseDate));

        const formattedCost = (entryData.totalCostMinor / 100).toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        setTotalCostInput(formattedCost);

        setPurchasePlace(entryData.purchasePlace || '');
        setNote(entryData.note || '');
        setLaborIncluded(entryData.laborIncluded);
      } catch (err: any) {
        if (isMounted) {
          setError(err.userMessage || 'Portföy kaydı yüklenemedi. Lütfen tekrar deneyin.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [entryId]);

  // Formda kaydedilmemiş değişiklik olup olmadığını denetle (isDirty)
  const isDirty = useMemo(() => {
    if (!initialEntry) return false;

    const initialDate = formatDate(initialEntry.purchaseDate);
    const initialCost = (initialEntry.totalCostMinor / 100).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const isProductChanged = selectedProduct?.id !== initialEntry.productId;
    const isQtyChanged = quantityInput !== String(initialEntry.quantity);
    const isDateChanged = purchaseDateInput !== initialDate;
    const isCostChanged = totalCostInput !== initialCost;
    const isPlaceChanged = purchasePlace !== (initialEntry.purchasePlace || '');
    const isNoteChanged = note !== (initialEntry.note || '');
    const isLaborChanged = laborIncluded !== initialEntry.laborIncluded;

    return (
      isProductChanged ||
      isQtyChanged ||
      isDateChanged ||
      isCostChanged ||
      isPlaceChanged ||
      isNoteChanged ||
      isLaborChanged
    );
  }, [
    initialEntry,
    selectedProduct,
    quantityInput,
    purchaseDateInput,
    totalCostInput,
    purchasePlace,
    note,
    laborIncluded,
  ]);

  // Sayfadan çıkış isteği yönetimi
  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  };

  // Canlı toplam tutar biçimlendirme önizlemesi
  const parsedCostMinor = useMemo(() => {
    if (!totalCostInput || !totalCostInput.trim()) return null;
    const minor = parseMoneyInputToMinor(totalCostInput);
    return minor !== null && minor > 0 ? minor : null;
  }, [totalCostInput]);

  // Ürün seçim modalı arama filtresi (Türkçe karakter duyarsız)
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

  const unitLabel = useMemo(() => {
    return selectedProduct?.measurementUnit === 'piece' ? 'Adet' : 'Gram';
  }, [selectedProduct]);

  // Güncelleme İşlemi
  const handleUpdate = async () => {
    if (submittingRef.current || isSubmitting || !initialEntry) return;

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

    // Güncelleme gönderimi
    try {
      submittingRef.current = true;
      setIsSubmitting(true);

      await portfolioService.updateEntry(initialEntry.id, {
        productId: selectedProduct.id,
        quantity: parsedQty!,
        purchaseDate: isoDate,
        totalCostMinor,
        purchasePlace: cleanPlace || null,
        note: cleanNote || null,
        laborIncluded,
      });

      setSubmitSuccess(true);

      // Başarılı güncelleme sonrası detay ekranına yönlendir
      setTimeout(() => {
        router.replace(`/(protected)/portfolio/${initialEntry.id}`);
      }, 750);
    } catch (err: any) {
      setSubmitError(
        err.userMessage || 'Kayıt güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Yükleme durumu
  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Kayıt verileri yükleniyor..." />
      </ScreenContainer>
    );
  }

  // Hata durumu
  if (error || !initialEntry) {
    return (
      <ScreenContainer>
        <ErrorState
          title="Kayıt Yüklenemedi"
          message={error || 'Düzenlenecek portföy kaydı bulunamadı.'}
          onRetry={() => router.back()}
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
              ✓ Değişiklikler başarıyla kaydedildi! Detay ekranına aktarılıyorsunuz...
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
          hint="Satın aldığınız tarihi giriniz. Bugünden ileri bir tarih olamaz."
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

        {/* 5. Alış Yeri */}
        <TextField
          label={`Alış Yeri (İsteğe bağlı - ${purchasePlace.length}/100)`}
          placeholder="Örn: Kapalıçarşı, Kuyumcukent, Banka..."
          value={purchasePlace}
          onChangeText={setPurchasePlace}
          maxLength={100}
        />

        {/* 6. Not */}
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
          title={isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          onPress={handleUpdate}
          disabled={isSubmitting || submitSuccess}
          style={styles.saveBtn}
        />

        <SecondaryButton
          title="Vazgeç"
          onPress={handleCancel}
          disabled={isSubmitting}
        />
      </View>

      {/* Ürün Seçim Modalı */}
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

            <TextField
              placeholder="Altın türü ara..."
              value={pickerSearch}
              onChangeText={setPickerSearch}
              containerStyle={styles.pickerSearchContainer}
            />

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

      {/* Kaydedilmemiş Değişiklik Onay Modalı */}
      <Modal
        visible={showDiscardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDiscardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Değişiklikler Kaydedilmedi
            </Text>
            <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
              Formda yaptığınız değişiklikler henüz kaydedilmedi. Sayfadan ayrılmak istediğinize emin misiniz?
            </Text>

            <View style={styles.modalActions}>
              <SecondaryButton
                title="Düzenlemeye Devam Et"
                onPress={() => setShowDiscardModal(false)}
                style={styles.modalButton}
              />
              <DangerButton
                title="Ayrıl"
                onPress={() => {
                  setShowDiscardModal(false);
                  router.back();
                }}
                style={styles.modalButton}
              />
            </View>
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
  saveBtn: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
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
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  costPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
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
