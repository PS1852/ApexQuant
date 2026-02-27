import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { WatchlistItem } from '@/types';

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    if (!user?.id) {
      setWatchlist([]);
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const addToWatchlist = async (symbol: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .insert([{
          user_id: user.id,
          symbol,
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Stock already in watchlist');
        }
        throw error;
      }

      setWatchlist(prev => [data as WatchlistItem, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error adding to watchlist:', err);
      throw err;
    }
  };

  const removeFromWatchlist = async (watchlistId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setWatchlist(prev => prev.filter(item => item.id !== watchlistId));
    } catch (err: any) {
      console.error('Error removing from watchlist:', err);
      throw err;
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user?.id) return;

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
  }, [user?.id, fetchWatchlist]);

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
