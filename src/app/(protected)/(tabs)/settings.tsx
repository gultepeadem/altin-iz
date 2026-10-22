/**
 * Altın İz — Ayarlar Ekranı (tabs/settings)
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useTheme } from '@/hooks/useTheme';
import { ThemePreference } from '@/theme/types';

export default function SettingsScreen() {
  const { theme, preference, setPreference } = useTheme();

  const themeOptions: { label: string; value: ThemePreference }[] = [
    { label: 'Sistem', value: 'system' },
    { label: 'Açık', value: 'light' },
    { label: 'Koyu', value: 'dark' },
  ];

  const handleSignOut = () => {
    // Çıkış yapıldığında karşılama ekranına yönlendirilir
    router.replace('/(public)/welcome');
  };

  return (
    <ScreenContainer scrollable={true}>
      {/* Tema Ayarları */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          GÖRÜNÜM VE TEMA
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
            Tema Tercihi
          </Text>
          <View style={styles.themeSelector}>
            {themeOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setPreference(opt.value)}
                style={[
                  styles.themeButton,
                  preference === opt.value && { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    {
                      color:
                        preference === opt.value
                          ? theme.colors.textInverse
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Hesap & Güvenlik */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          HESAP
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Pressable
            onPress={() => router.push('/(protected)/account')}
            style={styles.menuRow}
          >
            <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
              Hesap Bilgileri & Profil
            </Text>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Yasal & Destek */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          BİLGİLENDİRME
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Pressable
            onPress={() => router.push('/(protected)/legal')}
            style={[styles.menuRow, styles.divider, { borderBottomColor: theme.colors.border }]}
          >
            <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
              Yasal Belgeler ve KVKK
            </Text>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(protected)/about')}
            style={[styles.menuRow, styles.divider, { borderBottomColor: theme.colors.border }]}
          >
            <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
              Uygulama Hakkında
            </Text>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(protected)/support')}
            style={styles.menuRow}
          >
            <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
              Yardım ve Destek
            </Text>
            <Text style={[styles.arrow, { color: theme.colors.textTertiary }]}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Çıkış Butonu */}
      <SecondaryButton
        title="Güvenli Çıkış Yap"
        onPress={handleSignOut}
        style={styles.signOutButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
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
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    padding: 16,
    paddingBottom: 8,
  },
  themeSelector: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 0,
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '300',
  },
  signOutButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});
