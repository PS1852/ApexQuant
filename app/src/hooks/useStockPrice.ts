import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchStockQuote } from '@/services/stockService';
import { getPollingInterval } from '@/utils/marketHours';
import type { Stock } from '@/types';

/**
 * Hook for real-time stock price with automatic polling.
 * Polls every 10s when market is open, every 60s when closed.
 */
export function useStockPrice(symbol: string | undefined, market: 'IN' | 'US' = 'IN') {
    const [data, setData] = useState<Stock | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchPrice = useCallback(async () => {
        if (!symbol) return;
        try {
            const result = await fetchStockQuote(symbol);
            if (result) {
                setData(result);
                setError(null);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to fetch price');
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        if (!symbol) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchPrice();

        const pollInterval = getPollingInterval(market);
        intervalRef.current = setInterval(fetchPrice, pollInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [symbol, market, fetchPrice]);

    return { data, loading, error, refresh: fetchPrice };
}
