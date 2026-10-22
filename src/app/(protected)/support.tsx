/**
 * Altın İz — Yardım ve Destek Ekranı (support)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useTheme } from '@/hooks/useTheme';

export default function SupportScreen() {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable={true}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Bize Ulaşın
        </Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Uygulamayla ilgili soru, öneri veya teknik sorunlarınız için aşağıdaki kanaldan
          bize ulaşabilirsiniz:
        </Text>

        <View style={[styles.contactBox, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Text style={[styles.contactLabel, { color: theme.colors.textTertiary }]}>
            Destek E-posta Adresi
          </Text>
          <Text style={[styles.contactValue, { color: theme.colors.primary }]}>
            destek@altiniz.app
          </Text>
        </View>

        <Text style={[styles.faqTitle, { color: theme.colors.textPrimary }]}>
          Sıkça Sorulan Sorular
        </Text>

        <Text style={[styles.qText, { color: theme.colors.textPrimary }]}>
          Fiyatlar ne sıklıkla güncellenir?
        </Text>
        <Text style={[styles.aText, { color: theme.colors.textSecondary }]}>
          Piyasa açık olduğu saatlerde fiyatlar düzenli aralıklarla harici sağlayıcıdan
          güncellenir.
        </Text>

        <Text style={[styles.qText, { color: theme.colors.textPrimary }]}>
          Altın İz yatırım tavsiyesi verir mi?
        </Text>
        <Text style={[styles.aText, { color: theme.colors.textSecondary }]}>
          Hayır. Uygulamadaki veriler yalnızca kişisel takip ve bilgilendirme amaçlıdır.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  contactBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  contactLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  faqTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  qText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  aText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
});
