/**
 * Altın İz — StaleDataBanner Bileşeni
 * 
 * Gösterilen fiyat verisi güncel olmadığında kullanıcıya fiyatın eski olduğunu
 * ve son güncelleme zamanını açıkça bildiren uyarı şerididir.
 */

import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export interface StaleDataBannerProps {
  lastUpdatedAt?: string | Date;
  message?: string;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StaleDataBanner({
  lastUpdatedAt,
  message,
  onRefresh,
  style,
}: StaleDataBannerProps) {
  const { theme, isDark } = useTheme();

  const formattedTime = lastUpdatedAt
    ? typeof lastUpdatedAt === 'string'
      ? lastUpdatedAt
      : lastUpdatedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  const defaultMessage = formattedTime
    ? `Fiyatlar son olarak ${formattedTime} tarihinde güncellendi. Canlı piyasa verisi olmayabilir.`
    : 'Güncel piyasa verisi alınamadı. Son bilinen fiyatlar gösteriliyor.';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.surfaceElevated : theme.colors.warningLight,
          borderColor: theme.colors.warning,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Uyarı: ${message ?? defaultMessage}`}
    >
      <View style={styles.contentRow}>
        <Text style={[styles.icon, { color: theme.colors.warning }]}>⚠</Text>
        <Text
          style={[
            styles.text,
            {
              color: isDark ? theme.colors.textPrimary : theme.colors.textPrimary,
              fontSize: theme.typography.caption.fontSize,
              lineHeight: theme.typography.caption.lineHeight,
            },
          ]}
        >
          {message ?? defaultMessage}
        </Text>
      </View>

      {onRefresh ? (
        <Pressable
          onPress={onRefresh}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Fiyatları yenile"
          style={styles.refreshButton}
        >
          <Text
            style={[
              styles.refreshText,
              {
                color: theme.colors.warning,
                fontSize: theme.typography.caption.fontSize,
                fontWeight: theme.typography.bodyBold.fontWeight,
              },
            ]}
          >
            Yenile
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 14,
    marginRight: 8,
  },
  text: {
    flex: 1,
  },
  refreshButton: {
    minHeight: 32,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  refreshText: {
    textDecorationLine: 'underline',
  },
});
