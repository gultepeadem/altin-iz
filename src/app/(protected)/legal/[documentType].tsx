/**
 * Altın İz — Yasal Belge Detay Ekranı (legal/[documentType])
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useTheme } from '@/hooks/useTheme';

const DOC_TITLES: Record<string, string> = {
  'kvkk-aydinlatma': 'KVKK Aydınlatma Metni',
  'acik-riza': 'Açık Rıza Metni',
  'kullanim-kosullari': 'Kullanım Koşulları',
  'gizlilik-politikasi': 'Gizlilik Politikası',
  'sorumluluk-reddi': 'Finansal Bilgilendirme ve Sorumluluk Reddi',
};

export default function LegalDetailScreen() {
  const { documentType } = useLocalSearchParams<{ documentType: string }>();
  const { theme } = useTheme();

  const title = (documentType && DOC_TITLES[documentType]) || 'Yasal Belge';

  return (
    <ScreenContainer scrollable={true}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.versionText, { color: theme.colors.textTertiary }]}>
          Sürüm: 1.0 • Yürürlük Tarihi: 22.10.2026
        </Text>

        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          Bu metin, Altın İz uygulamasını kullanan kişilerin kişisel verilerinin korunması,
          işlenmesi ve haklarına ilişkin esasları belirlemek üzere 6698 sayılı Kişisel Verilerin
          Korunması Kanunu (KVKK) uyarınca hazırlanmıştır.
        </Text>

        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          Altın İz, yalnızca hesap oluşturma, güvenli oturum açma ve kişisel altın portföyünüzü
          takip etme amacıyla gerekli olan sınırlı verileri (e-posta adresi, şifre karması ve portföy
          alış kayıtları) işler. Açık adresiniz, kimlik numaranız veya banka hesap detaylarınız asla
          toplanmaz ve talep edilmez.
        </Text>

        <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
          Uygulamada sunulan altın fiyatları ve portföy kâr-zarar hesaplamaları yalnızca kişisel
          bilgilendirme amaçlıdır; hiçbir şekilde yatırım tavsiyesi niteliği taşımaz.
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
    marginBottom: 6,
  },
  versionText: {
    fontSize: 12,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
});
