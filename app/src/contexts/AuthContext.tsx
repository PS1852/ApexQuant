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
      // First try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        return;
      }

      // If profile doesn't exist (PGRST116 = not found), create one
      if (error && (error.code === 'PGRST116' || error.message?.includes('not found'))) {
        console.log('Profile not found, creating one with ₹2000 balance...');
        const newProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split('@')[0] || 'Trader',
          avatar_url: currentUser.user_metadata?.avatar_url ||
            currentUser.user_metadata?.picture || null,
          balance: 2000.00,
        };

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .upsert([newProfile], { onConflict: 'id' })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // Still set a local profile so the UI works
          setProfile({
            ...newProfile,
            currency: 'INR',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Profile);
        } else if (created) {
          setProfile(created as Profile);
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
        // Set a fallback profile from user metadata so UI doesn't break
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name || 'Trader',
          avatar_url: currentUser.user_metadata?.avatar_url || null,
          balance: 2000.00,
          currency: 'INR',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Profile);
      }
    } catch (error) {
      console.error('Error in fetchOrCreateProfile:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchOrCreateProfile(user);
    }
  }, [user, fetchOrCreateProfile]);

  useEffect(() => {
    let mounted = true;

    // Safety timeout to never get stuck loading forever
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth loading safety timeout reached, forcing load complete');
        setLoading(false);
      }
    }, 6000);

    const initAuth = async () => {
      // Prevent double init in StrictMode
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
        console.error('Auth initialization error:', error);
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
      clearTimeout(safetyTimer);
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
