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

  const fetchProfile = useCallback(async (userId: string, userMeta: any): Promise<Profile | null> => {
    try {
      // Try to get existing profile
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
        console.error('[Auth] Profile fetch error:', error.message);
        return null;
      }

      // No profile found — create one
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

      if (createErr) {
        // Profile might already exist (race condition) — try fetching again
        if (createErr.code === '23505') {
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
        console.error('[Auth] Profile create error:', createErr.message);
      }

      return null;
    } catch (err) {
      console.error('[Auth] fetchProfile exception:', err);
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

    const initialize = async () => {
      try {
        // getUser() makes a NETWORK CALL to Supabase Auth server.
        // This validates the JWT and refreshes it if expired.
        // Unlike getSession() which just reads from local storage cache.
        const { data: { user: validUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !validUser) {
          // No valid user — not logged in or token fully expired
          if (mounted) setLoading(false);
          return;
        }

        // Now we have a validated user with a fresh JWT.
        // Get the session (which now has the refreshed token).
        const { data: { session: freshSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (freshSession) {
          setSession(freshSession);
          setUser(validUser);
          await fetchProfile(validUser.id, validUser);
        }
      } catch (err) {
        console.error('[Auth] Initialize error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    // Listen for future auth events (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          await fetchProfile(newSession.user.id, newSession.user);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        // We intentionally IGNORE 'INITIAL_SESSION' and 'TOKEN_REFRESHED'
        // because initialize() above already handles those cases with getUser().
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

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
