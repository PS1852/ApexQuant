import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { PortfolioItem } from '@/types';

export function usePortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!user?.id) {
      setPortfolio([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPortfolio(data || []);
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError(err.message || 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updatePortfolioPrices = useCallback(async (prices: Record<string, number>) => {
    if (!portfolio.length) return;

    const updatedPortfolio = portfolio.map(item => {
      const currentPrice = prices[item.symbol] || item.current_price || item.avg_buy_price;
      const currentValue = currentPrice * item.quantity;
      const unrealizedPnl = currentValue - item.total_investment;
      const unrealizedPnlPercent = item.total_investment > 0 
        ? (unrealizedPnl / item.total_investment) * 100 
        : 0;

      return {
        ...item,
        current_price: currentPrice,
        current_value: currentValue,
        unrealized_pnl: unrealizedPnl,
        unrealized_pnl_percent: unrealizedPnlPercent,
      };
    });

    setPortfolio(updatedPortfolio);
  }, [portfolio]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('portfolio_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPortfolio();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, fetchPortfolio]);

  const stats = {
    totalInvestment: portfolio.reduce((sum, item) => sum + item.total_investment, 0),
    currentValue: portfolio.reduce((sum, item) => sum + (item.current_value || item.total_investment), 0),
    totalPnl: portfolio.reduce((sum, item) => sum + (item.unrealized_pnl || 0), 0),
    totalHoldings: portfolio.length,
    totalQuantity: portfolio.reduce((sum, item) => sum + item.quantity, 0),
  };

  stats.totalPnl = stats.currentValue - stats.totalInvestment;
  const totalPnlPercent = stats.totalInvestment > 0 
    ? (stats.totalPnl / stats.totalInvestment) * 100 
    : 0;

  return {
    portfolio,
    loading,
    error,
    refresh: fetchPortfolio,
    updatePrices: updatePortfolioPrices,
    stats: {
      ...stats,
      totalPnlPercent,
    },
  };
}
