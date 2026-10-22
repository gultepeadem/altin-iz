/**
 * Altın İz — LoadingState Bileşeni
 * 
 * Veri çekme ve arka plan işlemleri sırasında kullanıcıya görsel geri bildirim sunar.
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function LoadingState({
  message = 'Yükleniyor...',
  fullScreen = false,
  style,
}: LoadingStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: fullScreen ? theme.colors.background : 'transparent' },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={theme.colors.gold} />
      {message ? (
        <Text
          style={[
            styles.message,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.body.fontSize,
            },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
});
