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

      // Insert conflict — profile was created concurrently, re-fetch
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

    // ABSOLUTE safety net — loading can NEVER stay true beyond 5 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn('[Auth] Safety timeout hit');
        setLoading(false);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log('[Auth] Event:', event);

        // -- Handle logout or no session --
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // -- No user in session --
        if (!currentSession?.user) {
          if (event === 'INITIAL_SESSION') {
            // Not logged in at all
            setLoading(false);
          }
          return;
        }

        // -- We have a session with a user --
        const u = currentSession.user;

        if (event === 'INITIAL_SESSION') {
          // Session from cache. Token might be expired.
          // Try fetching profile — this tests if the JWT works.
          setSession(currentSession);
          const p = await fetchProfile(u.id, u);

          if (mounted && p) {
            // JWT was valid! Set user, profile is already set, done.
            setUser(u);
            setLoading(false);
          }
          // If profile fetch failed (JWT expired), DON'T set user yet.
          // DON'T set loading=false. Wait for TOKEN_REFRESHED.
          // The safety timer at 5s is our fallback.
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          // Token has been refreshed — JWT is now valid!
          setSession(currentSession);
          setUser(u);
          await fetchProfile(u.id, u);
          if (mounted) setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Fresh login (OAuth callback, email login, etc.)
          setSession(currentSession);
          setUser(u);
          await fetchProfile(u.id, u);
          if (mounted) setLoading(false);
          return;
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
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
