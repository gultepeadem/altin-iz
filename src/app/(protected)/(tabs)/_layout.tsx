/**
 * Altın İz — Alt Menü (Tabs) Düzeni
 * 
 * Beş ana ekran: Ana Sayfa, Fiyatlar, Hesapla, Portföyüm, Ayarlar.
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';

interface TabIconProps {
  symbol: string;
  focused: boolean;
}

function TabIcon({ symbol, focused }: TabIconProps) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {symbol}
    </Text>
  );
}

export default function TabsLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: isDark ? theme.colors.gold : theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ focused }) => <TabIcon symbol="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="prices"
        options={{
          title: 'Fiyatlar',
          tabBarIcon: ({ focused }) => <TabIcon symbol="📈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Hesapla',
          tabBarIcon: ({ focused }) => <TabIcon symbol="🧮" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portföyüm',
          tabBarIcon: ({ focused }) => <TabIcon symbol="💼" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
