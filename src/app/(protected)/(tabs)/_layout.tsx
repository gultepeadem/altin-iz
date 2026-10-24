/**
 * Altın İz — Alt Menü (Tabs) Düzeni
 * 
 * Beş ana ekran: Ana Sayfa, Fiyatlar, Hesapla, Portföyüm, Ayarlar.
 * Üst çubukta marka kimliği, ekran başlığı ve canlı piyasa durum göstergesi yer alır.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

interface CustomTabHeaderProps {
  title: string;
  routeName: string;
}

function CustomTabHeader({ title, routeName }: CustomTabHeaderProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const getSubtitle = () => {
    switch (routeName) {
      case 'index':
        return 'Piyasa & Portföy';
      case 'prices':
        return 'Serbest Piyasa';
      case 'calculator':
        return 'Hızlı Hesaplama';
      case 'portfolio':
        return 'Varlıklarım';
      case 'settings':
        return 'Hesap & Tercihler';
      default:
        return 'Canlı Takip';
    }
  };

  const getBadgeInfo = () => {
    switch (routeName) {
      case 'index':
      case 'prices':
        return {
          text: 'Canlı Piyasa',
          isLive: true,
        };
      case 'portfolio':
        return {
          text: 'Portföyüm',
          isLive: true,
        };
      case 'calculator':
        return {
          text: '24/7 Hesap',
          isLive: false,
        };
      case 'settings':
        return {
          text: 'v1.0.0',
          isLive: false,
        };
      default:
        return {
          text: 'Aktif',
          isLive: true,
        };
    }
  };

  const badge = getBadgeInfo();

  return (
    <View
      style={[
        styles.customHeader,
        {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
          paddingTop: Math.max(insets.top, 10) + 6,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <View
          style={[
            styles.headerEmblem,
            {
              backgroundColor: isDark ? theme.colors.surfaceElevated : '#FBF7EE',
              borderColor: theme.colors.gold,
            },
          ]}
        >
          <Text style={styles.headerEmblemEmoji}>🪙</Text>
        </View>

        <View style={styles.headerTitleGroup}>
          <View style={styles.headerBrandRow}>
            <Text style={[styles.headerBrandText, { color: theme.colors.gold }]}>
              ALTIN İZ
            </Text>
            <Text style={[styles.headerBrandDot, { color: theme.colors.textTertiary }]}>•</Text>
            <Text style={[styles.headerSubtitleText, { color: theme.colors.textSecondary }]}>
              {getSubtitle()}
            </Text>
          </View>
          <Text
            style={[styles.headerScreenTitle, { color: theme.colors.textPrimary }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <View
          style={[
            styles.headerStatusBadge,
            {
              backgroundColor: badge.isLive
                ? isDark
                  ? '#13281d'
                  : '#e8f5e9'
                : isDark
                ? theme.colors.surfaceElevated
                : '#f1f5f9',
              borderColor: badge.isLive ? theme.colors.profit : theme.colors.border,
            },
          ]}
        >
          {badge.isLive ? (
            <View style={[styles.headerLiveDot, { backgroundColor: theme.colors.profit }]} />
          ) : null}
          <Text
            style={[
              styles.headerStatusText,
              {
                color: badge.isLive ? theme.colors.profit : theme.colors.textSecondary,
              },
            ]}
          >
            {badge.text}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: ({ route, options }) => (
          <CustomTabHeader
            title={(options.title as string) || route.name}
            routeName={route.name}
          />
        ),
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  headerEmblem: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerEmblemEmoji: {
    fontSize: 20,
  },
  headerTitleGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerBrandText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerBrandDot: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  headerSubtitleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerScreenTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  headerStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
