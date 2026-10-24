import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { env } from './environment.ts';

/**
 * Güvenli Depolama Adaptörü (Secure Storage Adapter)
 * Referans: docs/SECURITY.md Bölüm 7.1 & ADR-014
 *
 * Mobil native ortamda (iOS Keychain / Android EncryptedSharedPreferences) expo-secure-store kullanılır.
 * Web ortamında AsyncStorage (localStorage), SSR / Node ortamında bellek adaptörü kullanılır.
 */
export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return null;
      return AsyncStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      await AsyncStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('SecureStore kaydetme hatası:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      await AsyncStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore silme hatası:', error);
    }
  },
};

/**
 * Geriye dönük uyumluluk takma adı (Alias)
 */
export const safeStorage = secureStorage;

/**
 * Altın İz - Supabase İstemcisi (Singleton)
 * Referans: docs/ARCHITECTURE.md Bölüm 6 & docs/SECURITY.md Bölüm 4 & Bölüm 7.1
 *
 * Mobil oturum belirteçleri (JWT access/refresh token), SecureStore adaptörüyle cihazda donanımsal/şifreli saklanır.
 * detectSessionInUrl: false -> Mobil deep link akışları Expo Linking ile yönetilir.
 */
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: Platform.OS !== 'web' || typeof window !== 'undefined',
    persistSession: true,
    detectSessionInUrl: false,
  },
});
