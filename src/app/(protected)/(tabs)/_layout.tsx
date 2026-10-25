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
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useMarketStatus } from '@/hooks/useMarketStatus';

interface CustomTabHeaderProps {
  title: string;
  routeName: string;
}

function CustomTabHeader({ title, routeName }: CustomTabHeaderProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const marketStatus = useMarketStatus();

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
        if (marketStatus.isStale) {
          return {
            text: 'Gecikmeli Veri',
            isLive: false,
            isStale: true,
          };
        }
        return {
          text: 'Canlı Piyasa',
          isLive: true,
          isStale: false,
        };
      case 'portfolio':
        // Portföy sayfasında sayfa başlığı zaten Portföyüm olduğu için mükerrer rozet kaldırıldı
        return null;
      case 'calculator':
        return {
          text: '7/24 Hesap',
          isLive: false,
          isStale: false,
        };
      case 'settings':
        return {
          text: 'v1.0.0',
          isLive: false,
          isStale: false,
        };
      default:
        return null;
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
          paddingTop: Math.max(insets.top, 12) + 10,
          paddingBottom: 14,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <View
          style={[
            styles.headerEmblem,
            {
              backgroundColor: isDark ? theme.colors.surfaceElevated : '#FDF8EA',
              borderColor: theme.colors.gold,
            },
          ]}
        >
          <MaterialCommunityIcons name="gold" size={24} color={theme.colors.gold} />
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

      {badge ? (
        <View style={styles.headerRight}>
          <View
            style={[
              styles.headerStatusBadge,
              {
                backgroundColor: badge.isLive
                  ? isDark
                    ? '#13281d'
                    : '#e8f5e9'
                  : badge.isStale
                  ? isDark
                    ? '#382b13'
                    : '#fef3c7'
                  : isDark
                  ? theme.colors.surfaceElevated
                  : '#f1f5f9',
                borderColor: badge.isLive
                  ? theme.colors.profit
                  : badge.isStale
                  ? '#F59E0B'
                  : theme.colors.border,
              },
            ]}
          >
            {badge.isLive ? (
              <View style={[styles.headerLiveDot, { backgroundColor: theme.colors.profit }]} />
            ) : badge.isStale ? (
              <View style={[styles.headerLiveDot, { backgroundColor: '#F59E0B' }]} />
            ) : null}
            <Text
              style={[
                styles.headerStatusText,
                {
                  color: badge.isLive
                    ? theme.colors.profit
                    : badge.isStale
                    ? '#D97706'
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {badge.text}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const activeColor = isDark ? theme.colors.gold : '#0F172A';
  const inactiveColor = '#94A3B8';

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: theme.colors.background },
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
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size || 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="prices"
        options={{
          title: 'Fiyatlar',
          tabBarIcon: ({ color, size }) => (
            <Feather name="trending-up" size={size || 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Hesapla',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator-outline" size={(size || 22) + 2} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portföyüm',
          tabBarIcon: ({ color, size }) => (
            <Feather name="briefcase" size={size || 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size || 22} color={color as string} />
          ),
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
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontSize: 12,
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
    fontSize: 20,
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
});
