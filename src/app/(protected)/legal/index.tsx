/**
 * Altın İz — Yasal Belgeler Dizini Ekranı (legal/index)
 * 
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 7.4 & Bölüm 17
 * Görev Referansı: docs/TODO.md Faz 11.1 (Yasal belge ekranları)
 * 
 * Ekran Kapsamı:
 * - [x] Aktif yasal belgeleri canlı legalService üzerinden listeleme.
 * - [x] KVKK Aydınlatma Metni (kvkk_notice).
 * - [x] Gizlilik Politikası (privacy_policy).
 * - [x] Kullanım Koşulları (terms_of_use).
 * - [x] Veri Saklama ve İmha Politikası (data_retention).
 * - [x] Finansal Bilgilendirme ve Sorumluluk Reddi (financial_disclaimer).
 * - [x] Dokunulduğunda ilgili belge detayına (legal/[documentType]) yönlendirme.
 * - [x] Çekip yenileme (pull-to-refresh) ve iOS Safe Area uyumu.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useTheme } from '@/hooks/useTheme';
import {
  type LegalDocument,
  type LegalDocumentType,
} from '@/models/legal';
import { legalService } from '@/services/legalService';

const DOCUMENT_ICONS: Record<LegalDocumentType, string> = {
  kvkk_notice: '🛡️',
  privacy_policy: '🔒',
  terms_of_use: '📜',
  data_retention: '💾',
  financial_disclaimer: '⚖️',
  explicit_consent: '✍️',
};

export default function LegalIndexScreen() {
  const { theme, isDark } = useTheme();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDocuments = async () => {
      try {
        const docs = await legalService.getActiveDocuments();
        if (isMounted) {
          setDocuments(docs);
        }
      } catch {
        if (isMounted) {
          setDocuments(legalService.generateFallbackDocuments());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    fetchDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const docs = await legalService.getActiveDocuments();
      setDocuments(docs);
    } catch {
      setDocuments(legalService.generateFallbackDocuments());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

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
      {/* Bilgilendirme Kutusu */}
      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: isDark
              ? theme.colors.surfaceElevated
              : theme.colors.goldLight,
            borderColor: theme.colors.gold,
          },
        ]}
      >
        <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>
          ⚖️ Yasal Haklarınız ve Güvenlik İlkelerimiz
        </Text>
        <Text
          style={[styles.infoText, { color: theme.colors.textSecondary }]}
        >
          Altın İz, kişisel verilerinizi 6698 sayılı KVKK ilkelerine ve mağaza gizlilik kurallarına uygun olarak korur. Yürürlükteki metinleri aşağıdan inceleyebilirsiniz.
        </Text>
      </View>

      <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
        YÜRÜRLÜKTEKİ YASAL METİNLER
      </Text>

      {/* Yüklenme Durumu */}
      {isLoading ? (
        <LoadingState message="Yasal belgeler yükleniyor..." />
      ) : (
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {documents.map((doc, idx) => {
            const icon = DOCUMENT_ICONS[doc.documentType] || '📄';
            const isLast = idx === documents.length - 1;

            return (
              <Pressable
                key={doc.id || doc.documentType}
                onPress={() => router.push(`/(protected)/legal/${doc.documentType}`)}
                style={[
                  styles.row,
                  !isLast && [styles.divider, { borderBottomColor: theme.colors.border }],
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${doc.title} detayını görüntüle`}
              >
                <View style={styles.leftCol}>
                  <Text style={styles.icon}>{icon}</Text>
                  <View style={styles.textContainer}>
                    <Text
                      style={[styles.docTitle, { color: theme.colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {doc.title}
                    </Text>
                    <Text
                      style={[styles.versionText, { color: theme.colors.textTertiary }]}
                    >
                      Sürüm: {doc.version}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>
                  ›
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Alt Bilgi */}
      <View style={styles.footerContainer}>
        <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
          Yasal metinler KVKK ve yürürlükteki mevzuat uyarınca güncellenir.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    gap: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  versionText: {
    fontSize: 12,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '300',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
