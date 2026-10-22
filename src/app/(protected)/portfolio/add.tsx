/**
 * Altın İz — Portföye Altın Ekle Ekranı (portfolio/add)
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { TextField } from '@/components/forms/TextField';

export default function PortfolioAddScreen() {
  const [productName, setProductName] = useState('Gram Altın');
  const [quantity, setQuantity] = useState('1');
  const [purchaseDate, setPurchaseDate] = useState('22.10.2026');
  const [totalCost, setTotalCost] = useState('3140,00');

  const handleSave = () => {
    // Veritabanı entegrasyonu Faz 8'de bağlanacak
    router.back();
  };

  return (
    <ScreenContainer scrollable={true} keyboardAvoiding={true}>
      <View style={styles.form}>
        <TextField
          label="Altın Türü"
          placeholder="Örn: Gram Altın"
          value={productName}
          onChangeText={setProductName}
        />

        <TextField
          label="Miktar"
          placeholder="Örn: 1 veya 2,5"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
        />

        <TextField
          label="Alış Tarihi"
          placeholder="GG.AA.YYYY"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
        />

        <TextField
          label="Ödenen Toplam Tutar (TL)"
          placeholder="Örn: 3140,00"
          value={totalCost}
          onChangeText={setTotalCost}
          keyboardType="decimal-pad"
          hint="Satın alırken ödediğiniz net tutarı girin (isteğe bağlı işçilik dâhil)."
        />

        <PrimaryButton
          title="Portföye Kaydet"
          onPress={handleSave}
          style={styles.saveButton}
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
  saveButton: {
    marginTop: 8,
    marginBottom: 12,
  },
});
