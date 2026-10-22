/**
 * Altın İz — PasswordField Bileşeni
 * 
 * Şifre gizleme / gösterme düğmesine sahip güvenli şifre giriş alanıdır.
 * Asgari 44x44dp dokunma alanı ve ekran okuyucu desteği sunar.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { TextField, TextFieldProps } from './TextField';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'secureTextEntry' | 'rightIcon'> {
  showToggle?: boolean;
}

export function PasswordField({
  showToggle = true,
  autoCapitalize = 'none',
  autoCorrect = false,
  ...rest
}: PasswordFieldProps) {
  const { theme } = useTheme();
  const [isSecure, setIsSecure] = useState(true);

  const toggleSecure = () => {
    setIsSecure((prev) => !prev);
  };

  const rightIcon = showToggle ? (
    <Pressable
      onPress={toggleSecure}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={isSecure ? 'Şifreyi göster' : 'Şifreyi gizle'}
      style={styles.toggleButton}
    >
      <Text
        style={[
          styles.toggleText,
          {
            color: theme.colors.primary,
            fontSize: theme.typography.caption.fontSize,
            fontWeight: theme.typography.bodyBold.fontWeight,
          },
        ]}
      >
        {isSecure ? 'Göster' : 'Gizle'}
      </Text>
    </Pressable>
  ) : undefined;

  return (
    <TextField
      secureTextEntry={isSecure}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      rightIcon={rightIcon}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  toggleText: {
    textTransform: 'uppercase',
  },
});
