/**
 * Altın İz — ThemeProvider (Tema Sağlayıcısı)
 * 
 * Uygulama genelinde 'light', 'dark' ve 'system' tema seçeneklerini yönetir.
 * Sistem teması değiştiğinde otomatik olarak arayüzü günceller.
 * React Navigation / Expo Router temasıyla entegre çalışır.
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router';

import { darkTheme } from '@/theme/darkTheme';
import { lightTheme } from '@/theme/lightTheme';
import { ResolvedColorScheme, Theme, ThemeContextValue, ThemePreference } from '@/theme/types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialPreference?: ThemePreference;
}

export function ThemeProvider({
  children,
  initialPreference = 'system',
}: ThemeProviderProps) {
  const systemScheme = useRNColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);

  // Tercihe veya cihaz sistem temasına göre etkin temayı çözümler
  const resolvedScheme: ResolvedColorScheme = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return preference;
  }, [preference, systemScheme]);

  const activeTheme: Theme = useMemo(() => {
    return resolvedScheme === 'dark' ? darkTheme : lightTheme;
  }, [resolvedScheme]);

  // React Navigation için renkleri kendi paletimizle eşler
  const navigationTheme = useMemo(() => {
    const base = resolvedScheme === 'dark' ? NavDarkTheme : NavDefaultTheme;
    return {
      ...base,
      dark: resolvedScheme === 'dark',
      colors: {
        ...base.colors,
        primary: activeTheme.colors.gold,
        background: activeTheme.colors.background,
        card: activeTheme.colors.card,
        text: activeTheme.colors.textPrimary,
        border: activeTheme.colors.border,
        notification: activeTheme.colors.warning,
      },
    };
  }, [resolvedScheme, activeTheme]);

  const contextValue: ThemeContextValue = useMemo(() => {
    return {
      theme: activeTheme,
      colors: activeTheme.colors,
      isDark: activeTheme.isDark,
      preference,
      resolvedScheme,
      setPreference,
    };
  }, [activeTheme, preference, resolvedScheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <NavigationThemeProvider value={navigationTheme}>
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Uygulama genelinde tema nesnesine ve tema değiştirme fonksiyonuna erişim sağlar.
 */
export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme bir ThemeProvider sarmalayıcısı içinde kullanılmalıdır.');
  }
  return context;
}
