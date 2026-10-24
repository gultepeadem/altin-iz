/**
 * Altın İz — Hakkında Ekranı (about)
 *
 * Uygulama vizyonu, sürüm bilgileri, güvenlik mimarisi ve yasal sorumluluk reddi.
 */

import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useTheme } from '@/hooks/useTheme';

export default function AboutScreen() {
  const { theme } = useTheme();

  const handleOpenWebsite = () => {
    Linking.openURL('https://altiniz.app').catch(() => {});
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://altiniz.app/gizlilik').catch(() => {});
  };

  return (
    <ScreenContainer scrollable={true} contentContainerStyle={styles.container}>
      {/* Logo & Sürüm Başlığı */}
      <View style={styles.header}>
        <View
          style={[
            styles.logoBadge,
            {
              backgroundColor: 'rgba(217, 119, 6, 0.12)',
              borderColor: theme.colors.gold,
            },
          ]}
        >
          <MaterialCommunityIcons name="gold" size={44} color={theme.colors.gold} />
        </View>
        <Text
          style={[
            styles.appName,
            { color: theme.colors.textPrimary, fontSize: 24, fontWeight: '800' },
          ]}
        >
          Altın İz
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.gold }]}>
          Akıllı & Güvenli Altın Takip Sistemi
        </Text>
        <View
          style={[
            styles.versionPill,
            { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            Sürüm 1.0.0 (V1) • SDK 52
          </Text>
        </View>
      </View>

      {/* Ana Kart */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        {/* Misyon */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="target" size={18} color={theme.colors.gold} style={styles.sectionIcon} />
            <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
              Misyonumuz
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: theme.colors.textSecondary }]}>
            Altın İz, bireysel altın birikimi yapan kullanıcıların canlı serbest piyasa ve
            Kapalıçarşı fiyatlarını şeffaf şekilde izlemelerini, fiziksel altın alım-satım
            geçmişlerini güvenle kaydedip net kâr-zarar durumlarını anlık analiz etmelerini
            sağlamak amacıyla geliştirilmiştir.
          </Text>
        </View>

        {/* Gizlilik ve Veri Güvenliği */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="shield" size={18} color={theme.colors.gold} style={styles.sectionIcon} />
            <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
              Sıfır Bilgi & Güvenlik
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: theme.colors.textSecondary }]}>
            Portföy kayıtlarınız PostgreSQL Row Level Security (RLS) ile veritabanı seviyesinde
            yalnızca sizin şifrelenmiş kimliğinize kilitlenir. Hiçbir çalışan veya üçüncü taraf
            bireysel birikim verilerinize erişemez.
          </Text>
        </View>

        {/* Bağlantılar */}
        <View style={styles.linksRow}>
          <Pressable
            onPress={handleOpenWebsite}
            style={[
              styles.linkButton,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
            ]}
            accessibilityRole="link"
          >
            <Feather name="globe" size={16} color={theme.colors.gold} />
            <Text style={[styles.linkButtonText, { color: theme.colors.textPrimary }]}>
              altiniz.app
            </Text>
          </Pressable>

          <Pressable
            onPress={handleOpenPrivacy}
            style={[
              styles.linkButton,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
            ]}
            accessibilityRole="link"
          >
            <Feather name="file-text" size={16} color={theme.colors.gold} />
            <Text style={[styles.linkButtonText, { color: theme.colors.textPrimary }]}>
              Gizlilik Politikası
            </Text>
          </Pressable>
        </View>

        {/* Yasal Sorumluluk Reddi (YTD) */}
        <View
          style={[
            styles.disclaimerBox,
            { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
          ]}
        >
          <Feather name="info" size={16} color={theme.colors.warning} style={styles.disclaimerIcon} />
          <Text style={[styles.disclaimerText, { color: theme.colors.textTertiary }]}>
            Altın İz uygulaması SPK mevzuatı uyarınca yatırım danışmanlığı kapsamında değildir.
            Gösterilen piyasa verileri ve kâr-zarar hesaplamaları yalnızca kişisel takip ve
            bilgilendirme amaçlıdır.
          </Text>
        </View>

        {/* Telif Hakkı */}
        <Text style={[styles.copyright, { color: theme.colors.textTertiary }]}>
          © 2026 Altın İz Teknolojileri. Tüm hakları saklıdır.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  versionPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionIcon: {
    marginRight: 8,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  linksRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 18,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimerBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  disclaimerIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 11,
  },
});
