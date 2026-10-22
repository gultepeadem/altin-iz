/**
 * Altın İz — EmptyState Bileşeni
 * 
 * Veri bulunmadığında (ör. boş portföy, arama sonucu yok) kullanıcıya
 * rehberlik eden ve bir sonraki adımı öneren boş durum ekranıdır.
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
import { PrimaryButton } from '@/components/common/PrimaryButton';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  actionLoading = false,
  style,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}

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

      {description ? (
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
            },
          ]}
        >
          {description}
        </Text>
      ) : null}

      {actionTitle && onAction ? (
        <View style={styles.actionContainer}>
          <PrimaryButton
            title={actionTitle}
            onPress={onAction}
            loading={actionLoading}
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
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 320,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 260,
  },
});
