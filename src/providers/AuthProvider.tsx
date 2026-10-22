/**
 * Altın İz — AuthProvider (Kimlik Doğrulama ve Oturum Sağlayıcısı)
 *
 * Mimari Referansı: docs/ARCHITECTURE.md Bölüm 8.1 (AuthProvider) ve Bölüm 8.4 (Sonsuz Yönlendirme Engeli)
 * Güvenlik Referansı: docs/SECURITY.md Bölüm 6 ve 7 (Kimlik Doğrulama ve Oturum Güvenliği)
 *
 * Yönetilen Oturum Durumları:
 * - 'loading': Oturum okunuyor, yönlendirme yapılmaz.
 * - 'unauthenticated': Aktif oturum yok.
 * - 'unverified': E-posta adresi henüz doğrulanmamış kullanıcı.
 * - 'active': E-postası doğrulanmış ve hesabı aktif kullanıcı.
 * - 'deletion_pending': Hesap silme işlemi beklemede olan kullanıcı.
 * - 'disabled': Hesabı askıya alınmış veya devre dışı bırakılmış kullanıcı.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { AccountStatus, UserProfile } from '@/models/profile';
import { authService } from '@/services/authService';

export type AuthStatus =
  | 'loading'
  | 'unauthenticated'
  | 'unverified'
  | 'active'
  | 'deletion_pending'
  | 'disabled';

export interface AuthContextValue {
  /** Mevcut oturum ve hesap durumu */
  status: AuthStatus;
  /** Supabase oturum nesnesi */
  session: Session | null;
  /** Supabase kullanıcı nesnesi */
  user: User | null;
  /** Kullanıcı profil bilgileri */
  profile: UserProfile | null;
  /** Oturum durumu yükleniyor mu */
  isLoading: boolean;
  /** Geçerli bir oturum açılmış mı */
  isAuthenticated: boolean;
  /** E-posta adresi doğrulanmış mı */
  isEmailVerified: boolean;
  /** Kullanıcı profilini sunucudan yeniden çeker */
  refreshProfile: () => Promise<void>;
  /** Oturumu sonlandırır */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  /**
   * Belirtilen kullanıcı için veritabanından güncel profil bilgilerini çeker
   * ve profil durumuna göre auth durumunu hesaplar.
   */
  const resolveUserAndProfile = useCallback(
    async (currentUser: User | null, currentSession: Session | null) => {
      if (!currentUser || !currentSession) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setStatus('unauthenticated');
        return;
      }

      setSession(currentSession);
      setUser(currentUser);

      // 1. E-posta doğrulaması kontrolü
      const emailConfirmed = Boolean(currentUser.email_confirmed_at);
      if (!emailConfirmed) {
        setProfile(null);
        setStatus('unverified');
        return;
      }

      // 2. user_profiles tablosundan hesap durumunu çek
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, account_status, created_at, updated_at')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (error || !data) {
          // Profil henüz oluşturulma aşamasında veya okuma hatası olduysa güvenli varsayılan
          setStatus('active');
          return;
        }

        const loadedProfile: UserProfile = {
          userId: data.user_id,
          displayName: data.display_name,
          accountStatus: data.account_status as AccountStatus,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setProfile(loadedProfile);

        // 3. Hesap durumuna göre AuthStatus belirle
        if (loadedProfile.accountStatus === 'disabled') {
          setStatus('disabled');
        } else if (loadedProfile.accountStatus === 'deletion_pending') {
          setStatus('deletion_pending');
        } else {
          setStatus('active');
        }
      } catch {
        // Beklenmeyen hatada güvenli aktif durum
        setStatus('active');
      }
    },
    []
  );

  /**
   * Profil bilgilerini manuel olarak yenileme fonksiyonu
   */
  const refreshProfile = useCallback(async () => {
    if (!user || !session) return;
    await resolveUserAndProfile(user, session);
  }, [user, session, resolveUserAndProfile]);

  /**
   * Güvenli çıkış fonksiyonu
   */
  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. İlk oturum yükleme kontrolü
    const initAuth = async () => {
      try {
        const initialSession = await authService.getSession();
        if (!isMounted) return;

        if (initialSession && initialSession.user) {
          await resolveUserAndProfile(initialSession.user, initialSession);
        } else {
          setStatus('unauthenticated');
        }
      } catch {
        if (isMounted) {
          setStatus('unauthenticated');
        }
      }
    };

    initAuth();

    // 2. Supabase Auth durum değişikliklerini dinle
    const { data: authListener } = authService.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !currentSession) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setStatus('unauthenticated');
        } else if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED' ||
          event === 'INITIAL_SESSION'
        ) {
          await resolveUserAndProfile(currentSession.user, currentSession);
        }
      }
    );

    // 3. Temizleme (Provider unmount olduğunda dinleyiciyi iptal et)
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [resolveUserAndProfile]);

  // Türetilmiş durumlar
  const isLoading = status === 'loading';
  const isAuthenticated = status !== 'loading' && status !== 'unauthenticated';
  const isEmailVerified = Boolean(user?.email_confirmed_at);

  const value: AuthContextValue = useMemo(
    () => ({
      status,
      session,
      user,
      profile,
      isLoading,
      isAuthenticated,
      isEmailVerified,
      refreshProfile,
      signOut,
    }),
    [
      status,
      session,
      user,
      profile,
      isLoading,
      isAuthenticated,
      isEmailVerified,
      refreshProfile,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * AuthProvider bağlamına erişim sağlayan özel hook
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
