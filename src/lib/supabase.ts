import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { env } from './environment';

/**
 * Altın İz - Supabase İstemcisi (Singleton)
 * Referans: docs/ARCHITECTURE.md Bölüm 6 & docs/SECURITY.md Bölüm 4 & Bölüm 12
 *
 * Mobil oturum, AsyncStorage adaptörüyle cihazda güvenle saklanır ve otomatik yenilenir.
 * detectSessionInUrl: false -> Mobil deep link akışları Expo Linking ile yönetilir.
 */
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
