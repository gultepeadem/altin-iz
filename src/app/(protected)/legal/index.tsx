/**
 * Altın İz — Yasal Belgeler Dizini (legal/index)
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useTheme } from '@/hooks/useTheme';

const LEGAL_DOCS = [
  { id: 'kvkk-aydinlatma', title: 'KVKK Aydınlatma Metni' },
  { id: 'acik-riza', title: 'Açık Rıza Metni' },
  { id: 'kullanim-kosullari', title: 'Kullanım Koşulları' },
  { id: 'gizlilik-politikasi', title: 'Gizlilik Politikası' },
  { id: 'sorumluluk-reddi', title: 'Finansal Bilgilendirme ve Sorumluluk Reddi' },
];

export default function LegalIndexScreen() {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable={true}>
      <Text style={[styles.heading, { color: theme.colors.textSecondary }]}>
        YASAL BİLGİLENDİRME VE METİNLER
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        {LEGAL_DOCS.map((doc, idx) => (
          <Pressable
            key={doc.id}
            onPress={() => router.push(`/(protected)/legal/${doc.id}`)}
            style={[
              styles.row,
              idx < LEGAL_DOCS.length - 1 && [styles.divider, { borderBottomColor: theme.colors.border }],
            ]}
          >
            <Text style={[styles.docTitle, { color: theme.colors.textPrimary }]}>
              {doc.title}
            </Text>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>›</Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    paddingRight: 8,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '300',
  },
});
