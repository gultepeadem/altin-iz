/**
 * Altın İz — ErrorState Bileşeni
 * 
 * Veri alma veya işlem hatalarında kullanıcıya anlaşılır hata mesajı
 * ve tekrar deneme imkânı sunar.
 */

import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { SecondaryButton } from '@/components/common/SecondaryButton';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryTitle?: string;
  retryLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = 'Bir sorun oluştu',
  message,
  onRetry,
  retryTitle = 'Tekrar Dene',
  retryLoading = false,
  style,
}: ErrorStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="alert"
    >
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.colors.lossLight },
        ]}
      >
        <Text style={[styles.badgeText, { color: theme.colors.loss }]}>!</Text>
      </View>

      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.subtitle.fontSize,
            fontWeight: theme.typography.subtitle.fontWeight,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.bodySmall.fontSize,
            lineHeight: theme.typography.bodySmall.lineHeight,
          },
        ]}
      >
        {message}
      </Text>

      {onRetry ? (
        <View style={styles.actionContainer}>
          <SecondaryButton
            title={retryTitle}
            onPress={onRetry}
            loading={retryLoading}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 320,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 240,
  },
});
