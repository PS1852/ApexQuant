import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  loading: boolean;
  /** Increments every time the session is validated/refreshed.
   *  Hooks should use this as a dependency to re-fetch data. */
  sessionVersion: number;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  // This counter increments every time we get a VALID session.
  // Hooks depend on this to know when to re-fetch.
  const [sessionVersion, setSessionVersion] = useState(0);

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
        // If it's a JWT error, don't create a fallback profile
        if (fetchErr.message?.includes('JWT') || fetchErr.code === 'PGRST301') {
          return null;
        }
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

    // Use onAuthStateChange as the SINGLE source of truth.
    // It fires INITIAL_SESSION immediately with a refreshed token.
    // We do NOT use getSession() to set user — only onAuthStateChange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log('[Auth] Event:', event, currentSession ? 'has session' : 'no session');

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setSessionVersion(0);
          setLoading(false);
          return;
        }

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Fetch profile for any session event
          const p = await fetchOrCreateProfile(currentSession.user);
          if (p) {
            // Bump session version so all hooks know to re-fetch
            setSessionVersion(v => v + 1);
          }
        }

        if (mounted) setLoading(false);
      }
    );

    // Fallback: if onAuthStateChange never fires (edge case), check getSession
    const fallbackTimer = setTimeout(async () => {
      if (!mounted || !loading) return;

      console.log('[Auth] Fallback: checking getSession...');
      const { data: { session: s } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (s?.user) {
        setSession(s);
        setUser(s.user);
        const p = await fetchOrCreateProfile(s.user);
        if (p) setSessionVersion(v => v + 1);
      }

      setLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [fetchOrCreateProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, sessionVersion, refreshProfile }}>
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
