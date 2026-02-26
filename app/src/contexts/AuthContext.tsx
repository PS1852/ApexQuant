import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const initDone = useRef(false);

  const fetchOrCreateProfile = useCallback(async (currentUser: any) => {
    try {
      console.log('[Auth] Fetching profile for user', currentUser.id);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle(); // Better than single() which throws PGRST116 on 0 rows

      if (data) {
        console.log('[Auth] Profile found:', data.balance);
        setProfile(data as Profile);
        return;
      }

      console.log('[Auth] Profile not found, creating one with ₹2000 balance...');
      const newProfile = {
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          currentUser.email?.split('@')[0] || 'Trader',
        avatar_url: currentUser.user_metadata?.avatar_url ||
          currentUser.user_metadata?.picture || null,
        balance: 2000.00,
        currency: 'INR'
      };

      const { data: created, error: createError } = await supabase
        .from('profiles')
        .upsert([newProfile], { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('[Auth] Error creating profile:', createError);
        setProfile({ ...newProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Profile);
      } else if (created) {
        console.log('[Auth] Profile created successfully:', created.balance);
        setProfile(created as Profile);
      } else {
        // Fallback
        setProfile({ ...newProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Profile);
      }
    } catch (error) {
      console.error('[Auth] Error in fetchOrCreateProfile:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchOrCreateProfile(user);
    }
  }, [user, fetchOrCreateProfile]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (initDone.current) return;
      initDone.current = true;

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchOrCreateProfile(initialSession.user);
        }
      } catch (error) {
        console.error('[Auth] init error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes (login/logout/token refresh/OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log('Auth state change:', event);

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Fetch profile on sign-in events and initial session (OAuth callback)
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
            await fetchOrCreateProfile(currentSession.user);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchOrCreateProfile]);

  const value = {
    user,
    profile,
    session,
    loading,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
