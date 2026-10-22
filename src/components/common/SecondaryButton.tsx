/**
 * Altın İz — SecondaryButton Bileşeni
 * 
 * İkincil işlem butonudur (Vazgeç, Filtrele, Detayları Gör vb.).
 * Çerçeveli (outlined) bir görünüme ve asgari 48dp dokunma alanına sahiptir.
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

export interface SecondaryButtonProps {
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

export function SecondaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
}: SecondaryButtonProps) {
  const { theme, isDark } = useTheme();
  const isDisabled = disabled || loading;

  const textColor = isDark ? theme.colors.textPrimary : theme.colors.primary;

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
          backgroundColor: isDark ? theme.colors.surfaceElevated : 'transparent',
          borderColor: theme.colors.border,
          borderWidth: 1.5,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
          borderRadius: 12,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
          accessibilityLabel="İşlem yapılıyor"
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
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
