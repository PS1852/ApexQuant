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
        return created as Profile;
      }

      if (createErr?.code === '23505') {
        const { data: refetch } = await supabase
          .from('profiles').select('*').eq('id', userId).maybeSingle();
        if (refetch) { setProfile(refetch as Profile); return refetch as Profile; }
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

    const init = async () => {
      try {
        // Step 1: Check if there's any stored session at all
        const { data: { session: cached } } = await supabase.auth.getSession();

        if (!cached) {
          // Not logged in — nothing to do
          if (mounted) setLoading(false);
          return;
        }

        // Step 2: FORCE refresh the JWT token.
        // This is the KEY fix — getSession() returns from CACHE (expired token).
        // refreshSession() makes a NETWORK CALL to get a brand new valid JWT.
        const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession({
          refresh_token: cached.refresh_token,
        });

        if (refreshErr || !refreshed.session) {
          // Refresh token expired — user must re-login
          console.error('[Auth] Session refresh failed:', refreshErr?.message);
          if (mounted) setLoading(false);
          return;
        }

        // Step 3: We now have a GUARANTEED valid JWT.
        // Set the user and fetch profile.
        if (mounted) {
          const s = refreshed.session;
          setSession(s);
          setUser(s.user);
          await fetchProfile(s.user.id, s.user);
          setLoading(false);
        }
      } catch (err) {
        console.error('[Auth] Init error:', err);
        if (mounted) setLoading(false);
      }
    };

    init();

    // Listen for future auth events (login, logout, OAuth callback)
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
        // INITIAL_SESSION and TOKEN_REFRESHED are handled by init() above
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
