/**
 * Altın İz — TextField Bileşeni
 * 
 * Etiket, ipucu metni, hata mesajı ve odaklanma durumunu yöneten form metin giriş alanıdır.
 * Asgari 48dp dokunma alanına ve tam ekran okuyucu uyumuna sahiptir.
 */

import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
}

export function TextField({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  inputContainerStyle,
  onFocus,
  onBlur,
  editable = true,
  ...rest
}: TextFieldProps) {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  const getBorderColor = () => {
    if (hasError) return theme.colors.loss;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: hasError ? theme.colors.loss : theme.colors.textPrimary,
              fontSize: theme.typography.bodySmall.fontSize,
              fontWeight: theme.typography.bodySmall.fontWeight,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? theme.colors.surfaceElevated : theme.colors.card,
            borderColor: getBorderColor(),
            borderWidth: isFocused || hasError ? 1.5 : 1,
            opacity: editable ? 1 : 0.6,
          },
          inputContainerStyle,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

        <TextInput
          editable={editable}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.body.fontSize,
            },
            inputStyle,
          ]}
          accessibilityLabel={label ?? rest.placeholder}
          accessibilityHint={hint}
          accessibilityState={{ disabled: !editable }}
          {...rest}
        />

        {rightIcon ? <View style={styles.rightIconContainer}>{rightIcon}</View> : null}
      </View>

      {hasError ? (
        <Text
          accessibilityRole="alert"
          style={[
            styles.feedbackText,
            { color: theme.colors.loss, fontSize: theme.typography.caption.fontSize },
          ]}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          style={[
            styles.feedbackText,
            { color: theme.colors.textSecondary, fontSize: theme.typography.caption.fontSize },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  inputContainer: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
  },
  feedbackText: {
    marginTop: 4,
    marginLeft: 2,
  },
});
