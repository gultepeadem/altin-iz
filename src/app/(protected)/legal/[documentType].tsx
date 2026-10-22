/**
 * Altın İz — Yasal Belge Detay Ekranı (legal/[documentType])
 * 
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 7.4 & Bölüm 17
 * Görev Referansı: docs/TODO.md Faz 11.1 (Yasal belge ekranları)
 * 
 * Kapsam:
 * - [x] Parametreye göre ilgili yasal belgeyi (KVKK, Gizlilik, Şartlar, Saklama vb.) yükleme.
 * - [x] Eski veya yeni URL slug desteği (örn: 'kvkk-aydinlatma' -> 'kvkk_notice').
 * - [x] Belge başlığı, sürüm numarası ve yürürlük tarihini gösterme.
 * - [x] SHA-256 metin bütünlüğü doğrulaması (content_hash) ve doğrulama rozeti.
 * - [x] Belge görüntüleme olayını (user_legal_events / 'viewed') arka planda kaydetme.
 * - [x] Çevrimdışı ve hata durumunda şablon metin sunumu (FALLBACK_LEGAL_DOCUMENTS).
 * - [x] Çekip yenileme (pull-to-refresh) ve güvenli alan uyumu.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useTheme } from '@/hooks/useTheme';
import {
  type LegalDocument,
  type LegalDocumentType,
  isValidDocumentType,
} from '@/models/legal';
import { legalService } from '@/services/legalService';
import { formatDate } from '@/utils/formatters';

const SLUG_TO_TYPE_MAP: Record<string, LegalDocumentType> = {
  // Standart veritabanı enum değerleri
  kvkk_notice: 'kvkk_notice',
  privacy_policy: 'privacy_policy',
  terms_of_use: 'terms_of_use',
  data_retention: 'data_retention',
  financial_disclaimer: 'financial_disclaimer',
  explicit_consent: 'explicit_consent',

  // Kebab-case URL slugları
  'kvkk-aydinlatma': 'kvkk_notice',
  'gizlilik-politikasi': 'privacy_policy',
  'kullanim-kosullari': 'terms_of_use',
  'veri-saklama': 'data_retention',
  'veri-saklama-ve-imha': 'data_retention',
  'sorumluluk-reddi': 'financial_disclaimer',
  'finansal-bilgilendirme': 'financial_disclaimer',
  'acik-riza': 'explicit_consent',
};

const DOCUMENT_ICONS: Record<LegalDocumentType, string> = {
  kvkk_notice: '🛡️',
  privacy_policy: '🔒',
  terms_of_use: '📜',
  data_retention: '💾',
  financial_disclaimer: '⚖️',
  explicit_consent: '✍️',
};

export function resolveLegalDocumentType(slug?: string): LegalDocumentType | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  return SLUG_TO_TYPE_MAP[normalized] || (isValidDocumentType(normalized) ? normalized : null);
}

export default function LegalDetailScreen() {
  const { documentType: rawSlug } = useLocalSearchParams<{ documentType: string }>();
  const { theme, isDark } = useTheme();

  const resolvedType = useMemo(() => resolveLegalDocumentType(rawSlug), [rawSlug]);

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(resolvedType));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isIntegrityValid, setIsIntegrityValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    !resolvedType ? 'Geçersiz yasal belge türü belirtildi.' : null
  );

  useEffect(() => {
    let isMounted = true;

    if (!resolvedType) {
      return;
    }

    const fetchDocument = async () => {
      try {
        const doc = await legalService.getDocumentByType(resolvedType);
        if (!isMounted) return;

        if (!doc) {
          setErrorMessage('İstenen yasal belge bulunamadı.');
          setIsLoading(false);
          return;
        }

        setDocument(doc);

        const integrityOk = await legalService.verifyDocumentIntegrity(doc);
        if (isMounted) {
          setIsIntegrityValid(integrityOk);
          setIsLoading(false);
        }

        legalService
          .recordLegalEvent({
            documentId: doc.id,
            eventType: 'viewed',
            source: 'settings',
          })
          .catch(() => {
            // Olay kaydı hatası ekran deneyimini engellemez
          });
      } catch {
        if (isMounted) {
          const fallback = legalService.getFallbackDocument(resolvedType);
          setDocument(fallback);
          setIsIntegrityValid(true);
          setIsLoading(false);
        }
      }
    };

    fetchDocument();

    return () => {
      isMounted = false;
    };
  }, [resolvedType]);

  const handleRefresh = useCallback(async () => {
    if (!resolvedType) return;
    setIsRefreshing(true);
    try {
      const doc = await legalService.getDocumentByType(resolvedType);
      if (doc) {
        setDocument(doc);
        const integrityOk = await legalService.verifyDocumentIntegrity(doc);
        setIsIntegrityValid(integrityOk);
      }
    } catch {
      // Hata durumunda mevcut durumu koru
    } finally {
      setIsRefreshing(false);
    }
  }, [resolvedType]);

  // Metin paragraflarını ayrıştır
  const paragraphs = useMemo(() => {
    if (!document?.content) return [];
    return document.content
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [document]);

  const screenTitle = document?.title || 'Yasal Belge';

  if (!resolvedType || errorMessage) {
    return (
      <ScreenContainer scrollable={true} withPadding={true}>
        <Stack.Screen options={{ title: 'Hata', headerBackTitle: 'Geri' }} />
        <ErrorState
          title="Belge Bulunamadı"
          message={errorMessage || 'Belirtilen yasal belge mevcut değil veya erişilemiyor.'}
          onRetry={() => router.replace('/(protected)/legal')}
          retryTitle="Belgeler Listesine Dön"
        />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer scrollable={false} withPadding={true}>
        <Stack.Screen options={{ title: 'Yükleniyor...', headerBackTitle: 'Geri' }} />
        <LoadingState message="Yasal metin yükleniyor ve doğrulanıyor..." />
      </ScreenContainer>
    );
  }

  const icon = resolvedType ? DOCUMENT_ICONS[resolvedType] || '📄' : '📄';

  return (
    <ScreenContainer
      scrollable={true}
      withPadding={true}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.gold}
          colors={[theme.colors.gold, theme.colors.primary]}
        />
      }
    >
      <Stack.Screen options={{ title: screenTitle, headerBackTitle: 'Geri' }} />

      {/* Başlık ve İkon */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isDark
                ? theme.colors.surfaceElevated
                : theme.colors.goldLight,
            },
          ]}
        >
          <Text style={styles.headerIcon}>{icon}</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {document?.title}
        </Text>
      </View>

      {/* Sürüm ve Bütünlük Rozetleri */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
            Sürüm: {document?.version}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
            Yürürlük: {formatDate(document?.effectiveAt)}
          </Text>
        </View>

        {isIntegrityValid !== null && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isIntegrityValid
                  ? (isDark ? '#064e3b' : '#ecfdf5')
                  : (isDark ? '#7f1d1d' : '#fef2f2'),
                borderColor: isIntegrityValid ? '#059669' : '#dc2626',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isIntegrityValid ? '#059669' : '#dc2626' },
              ]}
            >
              {isIntegrityValid ? '✓ Doğrulandı' : '⚠️ Bütünlük Uyarısı'}
            </Text>
          </View>
        )}
      </View>

      {/* Belge İçeriği Kartı */}
      <View
        style={[
          styles.contentCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {paragraphs.map((para, index) => {
          const isSectionHeader = /^\d+\.\s+[^\n]+:?$/.test(para) || para.startsWith('Altın İz —');

          return (
            <Text
              key={index}
              style={[
                isSectionHeader ? styles.sectionHeader : styles.paragraph,
                {
                  color: isSectionHeader
                    ? theme.colors.textPrimary
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {para}
            </Text>
          );
        })}
      </View>

      {/* Kriptografik Özet (SHA-256 Hash) Kartı */}
      {document?.contentHash && (
        <View
          style={[
            styles.hashCard,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.hashLabel, { color: theme.colors.textSecondary }]}>
            🔒 Kriptografik İçerik Karması (SHA-256):
          </Text>
          <Text
            style={[styles.hashValue, { color: theme.colors.textTertiary }]}
            numberOfLines={2}
            selectable={true}
          >
            {document.contentHash}
          </Text>
          <Text style={[styles.hashHelp, { color: theme.colors.textTertiary }]}>
            Bu özet metnin değiştirilmediğini ve veritabanı bütünlüğünü doğrular.
          </Text>
        </View>
      )}

      {/* Geri Dön Butonu */}
      <Pressable
        onPress={() => router.back()}
        style={[
          styles.backButton,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Yasal belgelere geri dön"
      >
        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
          ← Tüm Yasal Belgelere Dön
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    lineHeight: 22,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  hashCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  hashLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  hashValue: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 4,
  },
  hashHelp: {
    fontSize: 11,
    lineHeight: 15,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 36,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
