/**
 * Altın İz — PartialDataBanner Bileşeni
 * 
 * Portföydeki bir veya daha fazla kaydın güncel fiyatı alınamadığında
 * toplam tutarın "Kısmi Toplam" olduğunu açıkça belirten uyarı şerididir.
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

export interface PartialDataBannerProps {
  message?: string;
  onDetails?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PartialDataBanner({
  message = 'Bazı altınların güncel fiyatı alınamadığı için toplam tutar kısmi olarak hesaplanmıştır.',
  onDetails,
  style,
}: PartialDataBannerProps) {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.surfaceElevated : theme.colors.goldLight,
          borderColor: theme.colors.gold,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Kısmi portföy uyarısı: ${message}`}
    >
      <View style={styles.contentRow}>
        <Text style={[styles.icon, { color: theme.colors.gold }]}>ℹ</Text>
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
          {message}
        </Text>
      </View>

      {onDetails ? (
        <Pressable
          onPress={onDetails}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ayrıntıları gör"
          style={styles.detailButton}
        >
          <Text
            style={[
              styles.detailText,
              {
                color: theme.colors.gold,
                fontSize: theme.typography.caption.fontSize,
                fontWeight: theme.typography.bodyBold.fontWeight,
              },
            ]}
          >
            Detay
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
    fontWeight: '700',
  },
  text: {
    flex: 1,
  },
  detailButton: {
    minHeight: 32,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  detailText: {
    textDecorationLine: 'underline',
  },
});
