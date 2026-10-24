import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { env } from './environment.ts';

/**
 * Güvenli Depolama Adaptörü (Secure Storage Adapter with Chunking)
 * Referans: docs/SECURITY.md Bölüm 7.1 & ADR-014
 *
 * Android KeyStore ve SharedPreferences üzerindeki 2048 byte sınırına takılmamak
 * için 1800 karakterden uzun Supabase oturum verileri (JWT access/refresh token)
 * otomatik olarak parçalanarak (chunking) saklanır ve birleştirilir.
 * Web ortamında AsyncStorage (localStorage), SSR / Node ortamında bellek adaptörü kullanılır.
 */
const CHUNK_SIZE = 1800;

export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return null;
      return AsyncStorage.getItem(key);
    }
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;

      // Parçalanmış (chunked) veri kontrolü
      if (value.startsWith('__CHUNKED__:')) {
        const totalChunks = parseInt(value.replace('__CHUNKED__:', ''), 10);
        let fullValue = '';
        for (let i = 0; i < totalChunks; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}__chunk_${i}`);
          if (chunk === null) {
            console.warn(`SecureStore bozuk chunk tespit edildi: ${key}__chunk_${i}`);
            return null;
          }
          fullValue += chunk;
        }
        return fullValue;
      }
      return value;
    } catch (error) {
      console.warn('SecureStore okuma hatası:', error);
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
      // 2048 byte sınırından güvenli kalmak için 1800 karakterden uzunsa parçala
      if (value.length <= CHUNK_SIZE) {
        await secureStorage.cleanupOldChunks(key);
        await SecureStore.setItemAsync(key, value);
        return;
      }

      const totalChunks = Math.ceil(value.length / CHUNK_SIZE);
      await secureStorage.cleanupOldChunks(key);

      // Ana anahtara manifest yaz
      await SecureStore.setItemAsync(key, `__CHUNKED__:${totalChunks}`);

      // Parçaları ayrı ayrı güvenli depoya yaz
      for (let i = 0; i < totalChunks; i++) {
        const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await SecureStore.setItemAsync(`${key}__chunk_${i}`, chunk);
      }
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
      await secureStorage.cleanupOldChunks(key);
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore silme hatası:', error);
    }
  },

  cleanupOldChunks: async (key: string): Promise<void> => {
    try {
      const existing = await SecureStore.getItemAsync(key);
      if (existing && existing.startsWith('__CHUNKED__:')) {
        const count = parseInt(existing.replace('__CHUNKED__:', ''), 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}__chunk_${i}`).catch(() => {});
        }
      }
    } catch {
      // Temizleme hataları akışı engellemez
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
