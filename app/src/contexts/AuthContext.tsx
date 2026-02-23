import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

  const fetchOrCreateProfile = async (currentUser: any) => {
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
          avatar_url: currentUser.user_metadata?.avatar_url || null,
          balance: 2000.00,
          currency: 'INR',
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Profile);
        } else if (created) {
          setProfile(created as Profile);
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    } catch (error) {
      console.error('Error in fetchOrCreateProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchOrCreateProfile(user);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout to never get stuck loading forever
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth loading safety timeout reached, forcing load complete');
        setLoading(false);
      }
    }, 5000);

    const initAuth = async () => {
      // Prevent double init
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

    // Listen for auth changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);

        if (currentSession?.user) {
          setUser(currentSession.user);
          // Only fetch profile on sign-in events, not on token refreshes
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            await fetchOrCreateProfile(currentSession.user);
          }
        } else {
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
  }, []);

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
