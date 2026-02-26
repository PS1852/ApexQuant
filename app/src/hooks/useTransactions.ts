import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction } from '@/types';

export function useTransactions(limit: number = 100) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      setTransactions(data || []);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [user?.id, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setTransactions(prev => [payload.new as Transaction, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const stats = {
    totalBuyValue: transactions
      .filter(t => t.type === 'BUY')
      .reduce((sum, t) => sum + t.amount, 0),
    totalSellValue: transactions
      .filter(t => t.type === 'SELL')
      .reduce((sum, t) => sum + t.amount, 0),
    totalRealizedPnl: 0, // Not stored in DB
    buyCount: transactions.filter(t => t.type === 'BUY').length,
    sellCount: transactions.filter(t => t.type === 'SELL').length,
  };

  return {
    transactions,
    loading,
    error,
    refresh: fetchTransactions,
    stats,
  };
}
