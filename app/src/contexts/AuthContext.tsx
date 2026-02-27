import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  const fetchOrCreateProfile = useCallback(async (currentUser: any): Promise<Profile | null> => {
    try {
      console.log('[Auth] Fetching profile for', currentUser.id);

      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (fetchErr) {
        console.error('[Auth] Profile fetch error:', fetchErr);
      }

      if (data) {
        console.log('[Auth] Profile found, balance:', data.balance);
        setProfile(data as Profile);
        return data as Profile;
      }

      // Profile doesn't exist — create one with ₹2000
      console.log('[Auth] Creating profile with ₹2000...');
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
        console.error('[Auth] Profile create error:', createError);
        const fallback = { ...newProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Profile;
        setProfile(fallback);
        return fallback;
      }

      if (created) {
        console.log('[Auth] Profile created, balance:', created.balance);
        setProfile(created as Profile);
        return created as Profile;
      }

      return null;
    } catch (error) {
      console.error('[Auth] fetchOrCreateProfile error:', error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchOrCreateProfile(user);
    }
  }, [user, fetchOrCreateProfile]);

  useEffect(() => {
    let mounted = true;
    let initDone = false;

    // Step 1: Get current session (synchronous-like, from local storage)
    const initAuth = async () => {
      try {
        const { data: { session: s }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] getSession error:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (!mounted) return;

        if (s?.user) {
          setSession(s);
          setUser(s.user);
          await fetchOrCreateProfile(s.user);
        }

        initDone = true;
      } catch (error) {
        console.error('[Auth] init error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Step 2: Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log('[Auth] Event:', event);

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // On INITIAL_SESSION, only fetch if initAuth hasn't done it yet
          // On SIGNED_IN or TOKEN_REFRESHED, always re-fetch
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            await fetchOrCreateProfile(currentSession.user);
          } else if (event === 'INITIAL_SESSION' && !initDone) {
            await fetchOrCreateProfile(currentSession.user);
          }
        }

        if (mounted) setLoading(false);
      }
    );

    // Safety net: never stay loading for more than 8 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Safety timeout — forcing loading=false');
        setLoading(false);
      }
    }, 8000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchOrCreateProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, refreshProfile }}>
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
