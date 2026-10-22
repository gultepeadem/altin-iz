/**
 * Altın İz — Başlangıç Yönlendirmesi (app/index.tsx)
 * 
 * ARCHITECTURE.md Section 7.2 kurallarına göre oturum durumuna göre yönlendirir:
 * - Oturum yokken: /(public)/welcome
 * - Oturum açıkken: /(protected)/(tabs)
 */

import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Auth entegrasyonu tamamlandığında AuthProvider durumu dinlenecektir.
  // Varsayılan karşılama ekranına yönlendirilir:
  return <Redirect href="/(public)/welcome" />;
}
