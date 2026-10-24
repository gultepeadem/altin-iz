/**
 * Altın İz — Piyasa Canlılık Durumu Kancası (useMarketStatus)
 * 
 * Veritabanındaki en son altın fiyatının tazeliğini (15 dakika eşiği) izler.
 * Fiyat gecikmeliyse 'stale' (Gecikmeli Veri), güncelse 'fresh' (Canlı Piyasa) döner.
 */

import { useEffect, useState } from 'react';
import { goldPriceService } from '@/services/goldPriceService';

export interface MarketStatus {
  isLive: boolean;
  isStale: boolean;
  statusLabel: string;
  lastUpdated: string | null;
  loading: boolean;
}

export function useMarketStatus(): MarketStatus {
  const [status, setStatus] = useState<MarketStatus>({
    isLive: true,
    isStale: false,
    statusLabel: 'Canlı Piyasa',
    lastUpdated: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const prices = await goldPriceService.getLatestPrices(15);
        if (!isMounted) return;

        let hasStale = false;
        let latestTime: string | null = null;

        for (const p of prices) {
          if (p.status === 'stale' || p.isProviderStale) {
            hasStale = true;
          }
          const time = p.sourcePriceAt || p.fetchedAt;
          if (time && (!latestTime || new Date(time).getTime() > new Date(latestTime).getTime())) {
            latestTime = time;
          }
        }

        // Eğer son güncelleme 15 dakikadan eskiyse de gecikmeli say
        if (latestTime) {
          const ageMinutes = (Date.now() - new Date(latestTime).getTime()) / (60 * 1000);
          if (ageMinutes > 15) {
            hasStale = true;
          }
        }

        setStatus({
          isLive: !hasStale,
          isStale: hasStale,
          statusLabel: hasStale ? 'Gecikmeli Veri' : 'Canlı Piyasa',
          lastUpdated: latestTime,
          loading: false,
        });
      } catch {
        if (isMounted) {
          setStatus((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // 1 dakikada bir kontrol

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}
