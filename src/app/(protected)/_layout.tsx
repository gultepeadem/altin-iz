/**
 * Altın İz — Protected Rota Grubu Düzeni
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';

interface ModalHeaderProps {
  title: string;
  navigation: any;
}

function ModalHeader({ title, navigation }: ModalHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingTop: Math.max(insets.top, 12) + 8,
        paddingBottom: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 6 }}
        accessibilityRole="button"
        accessibilityLabel="Geri dön"
      >
        <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
      </Pressable>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

export default function ProtectedLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="gold/[productId]"
        options={{ title: 'Altın Detayı', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="portfolio/add"
        options={{
          header: ({ navigation }) => <ModalHeader title="Altın Ekle" navigation={navigation} />,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="portfolio/[entryId]"
        options={{ title: 'Kayıt Detayı', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="portfolio/[entryId]/edit"
        options={{
          header: ({ navigation }) => <ModalHeader title="Kaydı Düzenle" navigation={navigation} />,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="account/index"
        options={{ title: 'Hesap Ayarları', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="account/delete"
        options={{ title: 'Hesabı Sil', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="legal/index"
        options={{ title: 'Yasal Belgeler', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="legal/[documentType]"
        options={{ title: 'Yasal Belge', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="about"
        options={{ title: 'Hakkında', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="support"
        options={{ title: 'Destek', headerBackTitle: 'Geri' }}
      />
    </Stack>
  );
}
