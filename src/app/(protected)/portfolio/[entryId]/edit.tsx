/**
 * Altın İz — Portföy Kaydı Düzenleme Ekranı (portfolio/[entryId]/edit)
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextField } from '@/components/forms/TextField';

export default function PortfolioEditScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();

  const [quantity, setQuantity] = useState('10');
  const [purchaseDate, setPurchaseDate] = useState('15.09.2026');
  const [totalCost, setTotalCost] = useState('30000,00');

  const handleUpdate = () => {
    // Güncelleme işlemi
    router.back();
  };

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={true}>
      <View style={styles.form}>
        <TextField
          label="Kayıt Numarası"
          value={`#${entryId}`}
          editable={false}
        />

        <TextField
          label="Miktar (Gram)"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
        />

        <TextField
          label="Alış Tarihi"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
        />

        <TextField
          label="Ödenen Toplam Tutar (TL)"
          value={totalCost}
          onChangeText={setTotalCost}
          keyboardType="decimal-pad"
        />

        <PrimaryButton
          title="Değişiklikleri Kaydet"
          onPress={handleUpdate}
          style={styles.saveBtn}
        />

        <SecondaryButton
          title="Vazgeç"
          onPress={() => router.back()}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingVertical: 16,
  },
  saveBtn: {
    marginTop: 8,
    marginBottom: 12,
  },
});
