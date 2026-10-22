/**
 * Altın İz — ScreenContainer Bileşeni
 * 
 * Tüm ekranlar için tutarlı arka plan, güvenli alan (notch/ada/navigasyon çubuğu)
 * ve isteğe bağlı kaydırma (scroll) desteği sağlayan temel kapsayıcıdır.
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  /** Sayfa içeriğinin dikey kaydırılabilir olup olmadığı */
  scrollable?: boolean;
  /** Standart ekran kenar boşluğunun (horizontal padding) uygulanıp uygulanmayacağı */
  withPadding?: boolean;
  /** Klavye açıldığında içeriği yukarı kaydırma desteği */
  keyboardAvoiding?: boolean;
  /** Dış SafeAreaView stili */
  style?: StyleProp<ViewStyle>;
  /** Kaydırılabilir içerik kutusu stili */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Hangi kenarların güvenli alan olarak korunacağı */
  edges?: Edge[];
}

export function ScreenContainer({
  children,
  scrollable = false,
  withPadding = true,
  keyboardAvoiding = Platform.OS === 'ios',
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right'],
}: ScreenContainerProps) {
  const { theme } = useTheme();

  const containerPadding = withPadding ? theme.spacing.screenPadding : 0;

  const innerContent = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingHorizontal: containerPadding },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.staticContent,
        { paddingHorizontal: containerPadding },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      {innerContent}
    </KeyboardAvoidingView>
  ) : (
    innerContent
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {wrappedContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
});
