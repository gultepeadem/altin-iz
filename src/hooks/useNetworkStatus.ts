/**
 * Altın İz — Ağ Bağlantı Durumu Kancası (useNetworkStatus)
 * src/hooks/useNetworkStatus.ts
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 10 ve Bölüm 28
 *
 * Kurallar:
 * 1. Ağ durumu var görünse bile sunucu seviyesinde kesinti olabilir;
 *    bu kanca yalnızca kullanıcı arayüzü geri bildirimi (banner/uyarı) için yardımcıdır.
 * 2. Web ortamında navigator.onLine ve online/offline olayları dinlenir.
 * 3. Mobil ortamda uygulama ön plana her geldiğinde (AppState) ve periyodik olarak
 *    hafif bir HEAD/ping isteğiyle gerçek internet erişilebilirliği test edilir.
 */

import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { env } from '@/lib/environment';

export interface NetworkStatus {
  isConnected: boolean;
  isChecking: boolean;
  checkConnection: () => Promise<boolean>;
}

export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    // Web ortamında önce navigator.onLine kontrolü
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsConnected(false);
      return false;
    }

    try {
      setIsChecking(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Supabase uç noktasına hafif bir ping / head isteği
      const response = await fetch(`${env.supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: { apikey: env.supabasePublishableKey },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const online = response.status >= 200 && response.status < 500;
      setIsConnected(online);
      return online;
    } catch {
      setIsConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // 1. İlk açılışta bağlantıyı asenkron kontrol et
    const timer = setTimeout(() => {
      void checkConnection();
    }, 0);

    // 2. Web online/offline olay dinleyicileri
    let cleanupWeb: (() => void) | undefined;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => {
        setIsConnected(true);
        void checkConnection();
      };
      const handleOffline = () => setIsConnected(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      cleanupWeb = () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // 3. Mobil ortamda AppState (ön plana dönme) dinleyicisi
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        void checkConnection();
      }
    });

    return () => {
      clearTimeout(timer);
      if (cleanupWeb) cleanupWeb();
      subscription.remove();
    };
  }, [checkConnection]);

  return {
    isConnected,
    isChecking,
    checkConnection,
  };
}
