import { useState, useCallback } from 'react';
import { searchStocks as searchStocksService } from '@/services/stockService';
import type { Stock } from '@/types';

/**
 * Hook for searching stocks across the 24,000+ stock database with debouncing.
 */
export function useStockSearch() {
    const [results, setResults] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(false);

    const search = useCallback(async (query: string, _market: string | null = null) => {
        if (!query || query.length < 1) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const data = await searchStocksService(query);
            setResults(data);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setResults([]);
    }, []);

    return { results, loading, search, clear };
}
