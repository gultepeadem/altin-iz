/**
 * Altın İz — Portföy Kayıt Detay Ekranı (portfolio/[entryId])
 * src/app/(protected)/portfolio/[entryId].tsx
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 10 ve Bölüm 18.2
 * API Referansı: docs/API.md Bölüm 16.3 ve Bölüm 16.5
 * Karar Referansları:
 * - ADR-010 (Portföy Değerleme Yöntemi: Miktar × Güncel Alış Fiyatı)
 * - ADR-013 (Fiyat Yoksa 0 TL Kullanılmaz, 'Hesaplanamıyor' Durumu)
 * - ADR-014 (Eski Fiyat Uyarısı)
 * - ADR-032 (Kuruş Seviyesi Hesaplama ve Yuvarlama)
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { DangerButton } from '@/components/common/DangerButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import {
  ErrorState,
  LoadingState,
  StaleDataBanner,
} from '@/components/feedback';
import { useTheme } from '@/hooks/useTheme';
import { portfolioService } from '@/services/portfolioService';
import { goldPriceService } from '@/services/goldPriceService';
import type { PortfolioEntry } from '@/models/portfolio';
import type { GoldPrice } from '@/models/goldPrice';
import {
  calculateEntryValuation,
  type EntryValuationResult,
} from '@/domain/calculations/valuation';
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatPercent,
  formatQuantity,
} from '@/utils/formatters';
import { logger } from '@/utils/logger';

export default function PortfolioEntryDetailScreen() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const { theme, isDark } = useTheme();

  // Veri Durumları
  const [entry, setEntry] = useState<PortfolioEntry | null>(null);
  const [latestPrice, setLatestPrice] = useState<GoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Silme Onay Modalı ve İşlem Durumları
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Veri yükleme
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

        // 1. Portföy kaydını getir
        const entryData = await portfolioService.getEntryById(entryId);
        if (!isMounted) return;

        if (!entryData) {
          setError('Portföy kaydı bulunamadı veya bu kayda erişim yetkiniz yok.');
          setLoading(false);
          return;
        }

        setEntry(entryData);

        // 2. Ürünün en güncel fiyatını getir
        try {
          const priceData = await goldPriceService.getLatestPriceForProduct(entryData.productId);
          if (isMounted) {
            setLatestPrice(priceData);
          }
        } catch (priceErr) {
          // Fiyat bulunamazsa kayıt yine de görüntülenir (ADR-013)
          logger.warn('PortfolioDetail', 'Güncel fiyat okunamadı:', priceErr);
          if (isMounted) {
            setLatestPrice(null);
          }
        }
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
  }, [entryId, refreshTrigger]);

  // Kayıt bazlı değerleme hesabı (ADR-010: Miktar × Güncel Alış Fiyatı)
  const valuation: EntryValuationResult = useMemo(() => {
    if (!entry) {
      return {
        currentValueMinor: null,
        currentValue: null,
        profitLossMinor: null,
        profitLoss: null,
        profitLossPercentage: null,
        status: 'unavailable',
      };
    }
    return calculateEntryValuation(
      entry.quantity,
      latestPrice?.buyPriceMinor,
      entry.totalCostMinor
    );
  }, [entry, latestPrice]);

  // Birim etiketi
  const unitLabel = useMemo(() => {
    return entry?.product?.measurementUnit === 'piece' ? 'Adet' : 'Gram';
  }, [entry?.product?.measurementUnit]);

  // Kâr/Zarar Gösterimi ve Rengi
  const profitLossInfo = useMemo(() => {
    if (valuation.status === 'unavailable' || valuation.profitLossMinor === null) {
      return {
        text: 'Hesaplanamıyor',
        color: theme.colors.textSecondary,
        badgeBg: isDark ? '#222' : '#F2F4F7',
      };
    }

    const formattedAmount = formatMoney(Math.abs(valuation.profitLossMinor));
    const percentText = formatPercent(valuation.profitLossPercentage);

    if (valuation.status === 'profit') {
      return {
        text: `+${formattedAmount} (${percentText})`,
        color: theme.colors.profit,
        badgeBg: isDark ? '#143823' : '#D1FADF',
      };
    } else if (valuation.status === 'loss') {
      return {
        text: `-${formattedAmount} (${percentText})`,
        color: theme.colors.loss,
        badgeBg: isDark ? '#3D1414' : '#FEE4E2',
      };
    }

    return {
      text: `0,00 TL (%0,00)`,
      color: theme.colors.textPrimary,
      badgeBg: isDark ? '#222' : '#F2F4F7',
    };
  }, [valuation, theme, isDark]);

  // Kaydı silme işlemi
  const handleConfirmDelete = async () => {
    if (!entry || isDeleting) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await portfolioService.deleteEntry(entry.id);

      setShowDeleteModal(false);
      // Başarıyla silindiğinde portföy sekmesine geri dön
      router.replace('/(protected)/(tabs)/portfolio');
    } catch (err: any) {
      setDeleteError(err.userMessage || 'Kayıt silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Yükleme durumu
  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Portföy kaydı yükleniyor..." />
      </ScreenContainer>
    );
  }

  // Hata durumu
  if (error || !entry) {
    return (
      <ScreenContainer>
        <ErrorState
          title="Kayıt Bulunamadı"
          message={error || 'Aradığınız portföy kaydına ulaşılamadı.'}
          onRetry={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </ScreenContainer>
    );
  }

  const isStale = latestPrice?.status === 'stale' || latestPrice?.isProviderStale;
  const isPriceMissing = !latestPrice || latestPrice.buyPriceMinor === null;

  return (
    <ScreenContainer scrollable={true}>
      {/* 1. Eski Fiyat veya Eksik Fiyat Uyarıları */}
      {isStale && (
        <View style={styles.bannerContainer}>
          <StaleDataBanner lastUpdatedAt={latestPrice?.fetchedAt} />
        </View>
      )}

      {isPriceMissing && (
        <View style={[styles.warningBanner, { backgroundColor: isDark ? '#3D2F14' : '#FEF0C7', borderColor: theme.colors.warning }]}>
          <Text style={[styles.warningBannerText, { color: isDark ? '#FDB022' : '#B54708' }]}>
            ⚠️ Bu altın türü için güncel alış fiyatı bulunamadığı için tahmini değer hesaplanamamaktadır (ADR-013).
          </Text>
        </View>
      )}

      {/* 2. Ana Değer Kartı */}
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.productTitle, { color: theme.colors.textPrimary }]}>
              {entry.product?.name || 'Altın Kaydı'}
            </Text>
            {entry.product?.shortName && (
              <View style={[styles.shortNameBadge, { backgroundColor: isDark ? '#1E3A5F' : '#E6F4FE' }]}>
                <Text style={[styles.shortNameText, { color: theme.colors.primary }]}>
                  {entry.product.shortName}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.dateSub, { color: theme.colors.textTertiary }]}>
            {formatDate(entry.purchaseDate)}
          </Text>
        </View>

        {/* Tahmini Değer Vurgu Alanı */}
        <View style={[styles.valuationBox, { backgroundColor: isDark ? '#1A1A1A' : '#F9FAFB' }]}>
          <Text style={[styles.valuationLabel, { color: theme.colors.textSecondary }]}>
            Tahmini Güncel Bozdurma Değeri
          </Text>
          <Text style={[styles.valuationValue, { color: theme.colors.textPrimary }]}>
            {valuation.currentValueMinor !== null
              ? formatMoney(valuation.currentValueMinor)
              : 'Hesaplanamıyor'}
          </Text>

          <View style={[styles.profitBadge, { backgroundColor: profitLossInfo.badgeBg }]}>
            <Text style={[styles.profitText, { color: profitLossInfo.color }]}>
              Tahmini Kâr/Zarar: {profitLossInfo.text}
            </Text>
          </View>
        </View>

        {/* 3. Ayrıntılı Detay Tablosu */}
        <View style={styles.detailsList}>
          {/* Miktar */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Miktar:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
              {formatQuantity(entry.quantity)} {unitLabel}
            </Text>
          </View>

          {/* Alış Tarihi */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Alış Tarihi:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
              {formatDate(entry.purchaseDate)}
            </Text>
          </View>

          {/* Ödenen Toplam Tutar */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Ödenen Toplam Tutar:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
              {formatMoney(entry.totalCostMinor)}
            </Text>
          </View>

          {/* Kullanılan Güncel Alış Fiyatı */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Kullanılan Alış Fiyatı:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
              {latestPrice?.buyPriceMinor != null ? formatMoney(latestPrice.buyPriceMinor) : '-'}
            </Text>
          </View>

          {/* Son Fiyat Güncelleme Zamanı */}
          {latestPrice?.fetchedAt && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Fiyat Zamanı:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.textTertiary }]}>
                {formatDateTime(latestPrice.fetchedAt)}
              </Text>
            </View>
          )}

          {/* Alış Yeri */}
          {entry.purchasePlace && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Alış Yeri:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                {entry.purchasePlace}
              </Text>
            </View>
          )}

          {/* İşçilik Bilgisi */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>İşçilik:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
              {entry.laborIncluded === true
                ? 'Dâhil'
                : entry.laborIncluded === false
                ? 'Hariç'
                : 'Belirtilmedi'}
            </Text>
          </View>

          {/* Not */}
          {entry.note && (
            <View style={[styles.detailRow, styles.noteRow]}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Not:</Text>
              <Text style={[styles.noteValue, { color: theme.colors.textPrimary }]}>
                {entry.note}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 4. Aksiyon Butonları */}
      <PrimaryButton
        title="Kaydı Düzenle"
        onPress={() => router.push(`/(protected)/portfolio/${entry.id}/edit`)}
        style={styles.editButton}
      />

      <DangerButton
        title="Kaydı Sil"
        onPress={() => setShowDeleteModal(true)}
      />

      {/* 5. Silme Onay Modalı (Faz 8.4) */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setShowDeleteModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.loss }]}>
              Altın Kaydını Sil
            </Text>

            {/* Silinecek Kaydın Kısa Özeti */}
            <View style={[styles.deleteSummaryBox, { backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB', borderColor: theme.colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Altın Türü:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
                  {entry.product?.name || 'Altın Kaydı'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Miktar:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
                  {formatQuantity(entry.quantity)} {unitLabel}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Alış Tarihi:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
                  {formatDate(entry.purchaseDate)}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.lastSummaryRow]}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Ödenen Tutar:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
                  {formatMoney(entry.totalCostMinor)}
                </Text>
              </View>
            </View>

            {/* Geri Alınamazlık ve V1 Kapsam Uyarısı */}
            <View style={[styles.irreversibleWarningBox, { backgroundColor: isDark ? '#3D1414' : '#FEE4E2', borderColor: theme.colors.loss }]}>
              <Text style={[styles.warningTitle, { color: theme.colors.loss }]}>
                ⚠️ Bu işlem geri alınamaz!
              </Text>
              <Text style={[styles.warningSubText, { color: isDark ? '#FCA5A5' : '#B42318' }]}>
                Altın İz V1 sürümünde silme işlemi satış kaydı veya kâr-zarar geçmişi oluşturmaz; kayıt portföyünüzden tamamen kaldırılır.
              </Text>
            </View>

            {/* Hata Durumu (Başarısızlıkta kayıt görünür kalır) */}
            {deleteError && (
              <View style={[styles.deleteErrorBanner, { backgroundColor: isDark ? '#3D1414' : '#FEE4E2' }]}>
                <Text style={[styles.deleteErrorText, { color: theme.colors.loss }]}>
                  {deleteError}
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <SecondaryButton
                title="Vazgeç"
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                style={styles.modalButton}
              />
              <DangerButton
                title={isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
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
  bannerContainer: {
    marginBottom: 12,
  },
  warningBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  warningBannerText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  shortNameBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shortNameText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateSub: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  valuationBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  valuationLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  valuationValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  profitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  profitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailsList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  noteRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderBottomWidth: 0,
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  editButton: {
    marginBottom: 12,
  },
  // Onay Modalı Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  deleteSummaryBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  lastSummaryRow: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  irreversibleWarningBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  warningSubText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  deleteErrorBanner: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  deleteErrorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
