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

  const fetchProfile = useCallback(async (userId: string, userMeta: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
        return;
      }

      if (error) {
        console.error('[Auth] Profile fetch err:', error.message);
        return;
      }

      // No row — create profile with ₹2000
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
      } else if (createErr?.code === '23505') {
        // Already exists (race condition), re-fetch
        const { data: refetch } = await supabase
          .from('profiles').select('*').eq('id', userId).maybeSingle();
        if (refetch) setProfile(refetch as Profile);
      }
    } catch (err) {
      console.error('[Auth] fetchProfile error:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  }, [user, fetchProfile]);

  // Effect 1: Listen for auth state changes
  // CRITICAL: This callback must NOT be async to avoid deadlock with Supabase's _initialize()
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;

        console.log('[Auth] Event:', event);

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
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
  }, []);

  // Effect 2: Fetch profile whenever user changes (separate from auth listener)
  // This runs AFTER onAuthStateChange returns, so the internal lock is released
  // and Supabase queries can proceed without deadlock.
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id, user);
    }
  }, [user?.id, fetchProfile]);

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
