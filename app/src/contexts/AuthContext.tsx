import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  const profileFetched = useRef(false);

  const fetchOrCreateProfile = useCallback(async (currentUser: any) => {
    try {
      console.log('[Auth] Fetching profile for user', currentUser.id);

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
        profileFetched.current = true;
        return;
      }

      console.log('[Auth] Profile not found, creating with ₹2000...');
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
        console.log('[Auth] Profile created, balance:', created.balance);
        setProfile(created as Profile);
      } else {
        setProfile({ ...newProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Profile);
      }
      profileFetched.current = true;
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

    // Listen for auth changes FIRST so we don't miss events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log('[Auth] onAuthStateChange:', event);

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Always fetch profile on these events
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            // Only fetch if we haven't already
            if (!profileFetched.current) {
              await fetchOrCreateProfile(currentSession.user);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          profileFetched.current = false;
        }

        if (mounted) setLoading(false);
      }
    );

    // Then get the initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] getSession error:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (!mounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          if (!profileFetched.current) {
            await fetchOrCreateProfile(initialSession.user);
          }
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
