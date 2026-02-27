import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  loading: boolean;
  /** True once we have a validated session + profile */
  ready: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProfile = useCallback(async (userId: string, userMeta: any): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
        return data as Profile;
      }

      if (error) {
        console.error('[Auth] Profile fetch err:', error.message);
        return null;
      }

      // No row — create new profile
      const newProfile = {
        id: userId,
        email: userMeta?.email || '',
        full_name: userMeta?.user_metadata?.full_name ||
          userMeta?.user_metadata?.name ||
          userMeta?.email?.split('@')[0] || 'Trader',
        avatar_url: userMeta?.user_metadata?.avatar_url ||
          userMeta?.user_metadata?.picture || null,
        balance: 2000.00,
        currency: 'INR'
      };

      const { data: created, error: createErr } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .maybeSingle();

      if (created) {
        setProfile(created as Profile);
        return created as Profile;
      }

      if (createErr?.code === '23505') {
        const { data: refetch } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (refetch) {
          setProfile(refetch as Profile);
          return refetch as Profile;
        }
      }

      return null;
    } catch (err) {
      console.error('[Auth] fetchProfile error:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // SAFETY: loading NEVER stays true for more than 4 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Safety timeout — forcing loading=false');
        setLoading(false);
      }
    }, 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log('[Auth] Event:', event);

        // No session (signed out or not logged in)
        if (!currentSession?.user) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setReady(false);
          setLoading(false);
          return;
        }

        // We have a session
        const u = currentSession.user;
        setSession(currentSession);
        setUser(u);

        // Try to fetch profile
        const p = await fetchProfile(u.id, u);

        if (mounted) {
          if (p) {
            setReady(true);
          } else if (event === 'INITIAL_SESSION') {
            // Profile failed on initial load — expired JWT.
            // Schedule a retry in 2 seconds (token should be refreshed by then)
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            retryTimerRef.current = setTimeout(async () => {
              if (!mounted) return;
              console.log('[Auth] Retrying profile fetch...');
              const retry = await fetchProfile(u.id, u);
              if (retry && mounted) {
                setReady(true);
              }
            }, 2000);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, ready, refreshProfile }}>
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
