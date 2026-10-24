/**
 * Altın İz — Çevrimdışı Bilgi Şeridi (OfflineBanner)
 *
 * Cihazın internet bağlantısı kesildiğinde veya Supabase sunucusuna ulaşılamadığında
 * kullanıcıya durumu bildiren ve yeniden bağlanma denemesi sağlayan uyarı bileşeni.
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/useTheme';

export function OfflineBanner() {
  const { isConnected, isChecking, checkConnection } = useNetworkStatus();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // İnternet bağlıysa veya henüz tespit edilmediyse şeridi gösterme
  if (isConnected !== false) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 8),
          backgroundColor: theme.colors.loss,
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel="İnternet bağlantısı kesildi. Çevrimdışı moddasınız."
    >
      <View style={styles.content}>
        <Text style={styles.icon}>⚡</Text>
        <Text style={styles.message}>
          İnternet bağlantısı yok. Çevrimdışı moddasınız.
        </Text>
        <Pressable
          onPress={() => void checkConnection()}
          disabled={isChecking}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Bağlantıyı tekrar dene"
        >
          {isChecking ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.retryText}>Tekrar Dene</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  retryButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  retryButtonPressed: {
    opacity: 0.7,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
