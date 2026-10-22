/**
 * Altın İz — Fiyatlar Ekranı (tabs/prices)
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TextField } from '@/components/forms/TextField';
import { useTheme } from '@/hooks/useTheme';

const SAMPLE_PRODUCTS = [
  { id: 'gram-altin', name: 'Gram Altın', buy: '3.120,50', sell: '3.140,00', change: '+%0,45' },
  { id: 'ceyrek-yeni', name: 'Çeyrek Altın (Yeni)', buy: '5.090,00', sell: '5.145,00', change: '+%0,38' },
  { id: 'ceyrek-eski', name: 'Çeyrek Altın (Eski)', buy: '5.060,00', sell: '5.120,00', change: '+%0,30' },
  { id: 'yarim-altin', name: 'Yarım Altın', buy: '10.180,00', sell: '10.290,00', change: '+%0,41' },
  { id: 'tam-altin', name: 'Tam Altın', buy: '20.360,00', sell: '20.580,00', change: '+%0,40' },
  { id: 'ata-altin', name: 'Ata Altın', buy: '20.950,00', sell: '21.150,00', change: '+%0,35' },
  { id: 'ons-altin', name: 'Ons Altın (USD)', buy: '2.748,20', sell: '2.749,10', change: '-%0,12' },
];

export default function PricesScreen() {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');

  const filteredProducts = SAMPLE_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenContainer scrollable={true}>
      <TextField
        placeholder="Altın türü ara..."
        value={search}
        onChangeText={setSearch}
        containerStyle={styles.searchContainer}
      />

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCol, { color: theme.colors.textSecondary }]}>Altın Türü</Text>
        <Text style={[styles.headerColRight, { color: theme.colors.textSecondary }]}>Alış / Satış</Text>
      </View>

      {filteredProducts.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => router.push(`/(protected)/gold/${item.id}`)}
          style={[
            styles.productCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View>
            <Text style={[styles.productName, { color: theme.colors.textPrimary }]}>
              {item.name}
            </Text>
            <Text
              style={[
                styles.changeText,
                { color: item.change.startsWith('+') ? theme.colors.profit : theme.colors.loss },
              ]}
            >
              {item.change}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.buyPrice, { color: theme.colors.textPrimary }]}>
              Alış: {item.buy} TL
            </Text>
            <Text style={[styles.sellPrice, { color: theme.colors.textSecondary }]}>
              Satış: {item.sell} TL
            </Text>
          </View>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  headerCol: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerColRight: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  buyPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  sellPrice: {
    fontSize: 13,
  },
});
