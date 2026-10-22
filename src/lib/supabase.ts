import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { env } from './environment.ts';

/**
 * Sunucu (Node SSR / Prerender) ortamında window olmadığı için no-op bellek depolayıcı.
 * Tarayıcı ve mobil native (iOS/Android) ortamında standart AsyncStorage kullanılır.
 */
export const safeStorage =
  Platform.OS === 'web' && typeof window === 'undefined'
    ? {
        getItem: () => Promise.resolve(null),
        setItem: () => Promise.resolve(),
        removeItem: () => Promise.resolve(),
      }
    : AsyncStorage;

/**
 * Altın İz - Supabase İstemcisi (Singleton)
 * Referans: docs/ARCHITECTURE.md Bölüm 6 & docs/SECURITY.md Bölüm 4 & Bölüm 12
 *
 * Mobil oturum, AsyncStorage adaptörüyle cihazda güvenle saklanır ve otomatik yenilenir.
 * detectSessionInUrl: false -> Mobil deep link akışları Expo Linking ile yönetilir.
 */
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: Platform.OS !== 'web' || typeof window !== 'undefined',
    persistSession: true,
    detectSessionInUrl: false,
  },
});
