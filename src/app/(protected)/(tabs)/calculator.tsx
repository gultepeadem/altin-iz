/**
 * Altın İz — Hesapla Ekranı (tabs/calculator)
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { TextField } from '@/components/forms/TextField';
import { useTheme } from '@/hooks/useTheme';

type Mode = 'buy' | 'sell';

export default function CalculatorScreen() {
  const { theme } = useTheme();
  const [mode, setMode] = useState<Mode>('buy');
  const [amount, setAmount] = useState('1');

  // Örnek gram altın fiyatları
  const gramBuyPrice = 3120.5; // Bozdururken alış fiyatı
  const gramSellPrice = 3140.0; // Satın alırken satış fiyatı

  const numAmount = parseFloat(amount.replace(',', '.')) || 0;
  const unitPrice = mode === 'buy' ? gramSellPrice : gramBuyPrice;
  const total = numAmount * unitPrice;

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={true}>
      {/* İşlem Türü Seçimi (Satın Al / Bozdur) */}
      <View style={[styles.modeToggle, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Pressable
          onPress={() => setMode('buy')}
          style={[
            styles.toggleOption,
            mode === 'buy' && { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              { color: mode === 'buy' ? theme.colors.textInverse : theme.colors.textSecondary },
            ]}
          >
            Satın Alacağım
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode('sell')}
          style={[
            styles.toggleOption,
            mode === 'sell' && { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              { color: mode === 'sell' ? theme.colors.textInverse : theme.colors.textSecondary },
            ]}
          >
            Bozduracağım
          </Text>
        </Pressable>
      </View>

      {/* Miktar Girişi */}
      <TextField
        label="Miktar (Gram)"
        placeholder="Örn: 5 veya 1,5"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        hint={
          mode === 'buy'
            ? 'Hesaplamada güncel satış fiyatı (3.140,00 TL) kullanılır.'
            : 'Hesaplamada güncel alış fiyatı (3.120,50 TL) kullanılır.'
        }
      />

      {/* Sonuç Kartı */}
      <View
        style={[
          styles.resultCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.gold,
          },
        ]}
      >
        <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
          Tahmini Toplam Tutar
        </Text>
        <Text
          style={[
            styles.resultValue,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.headline.fontSize,
              fontWeight: theme.typography.headline.fontWeight,
            },
          ]}
        >
          {total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
        </Text>
        <Text style={[styles.disclaimer, { color: theme.colors.textTertiary }]}>
          Fiyatlar bilgilendirme amaçlıdır; kuyumcu ve bankalarda farklılık gösterebilir.
        </Text>
      </View>

      <PrimaryButton
        title="Bu Alışı Portföye Ekle"
        onPress={() => router.push('/(protected)/portfolio/add')}
        style={styles.addButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginTop: 8,
    marginBottom: 20,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    marginVertical: 16,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  resultValue: {
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 8,
  },
});
