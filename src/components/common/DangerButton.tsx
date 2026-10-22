/**
 * Altın İz — DangerButton Bileşeni
 * 
 * Yıkıcı ve geri alınamaz işlemler için kullanılan tehlike butonudur (Kaydı Sil, Hesabı Kapat vb.).
 * Asgari 48dp dokunma alanına ve net görsel ayrıma sahiptir.
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export interface DangerButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function DangerButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
}: DangerButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.loss,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          borderRadius: 12,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color="#FFFFFF"
          accessibilityLabel="İşlem yapılıyor"
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              {
                color: '#FFFFFF',
                fontSize: theme.typography.bodyBold.fontSize,
                fontWeight: theme.typography.bodyBold.fontWeight,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    textAlign: 'center',
  },
});
