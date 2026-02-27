import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { WatchlistItem } from '@/types';

export function useWatchlist() {
  const { user, ready } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    if (!user?.id || !ready) {
      if (!user?.id) {
        setWatchlist([]);
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setWatchlist(data || []);
    } catch (err: any) {
      console.error('Error fetching watchlist:', err);
      setError(err.message || 'Failed to fetch watchlist');
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, ready]);

  const addToWatchlist = async (symbol: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('watchlist')
      .insert([{ user_id: user.id, symbol }]);

    if (error) {
      if (error.code === '23505') {
        throw new Error('Already in watchlist');
      }
      throw error;
    }

    await fetchWatchlist();
  };

  const removeFromWatchlist = async (id: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    setWatchlist(prev => prev.filter(item => item.id !== id));
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Loading timeout
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user?.id || !ready) return;

    const subscription = supabase
      .channel('watchlist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watchlist',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchWatchlist();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, ready, fetchWatchlist]);

  return {
    watchlist,
    loading,
    error,
    refresh: fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
}
