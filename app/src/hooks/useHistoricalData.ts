import { useState, useEffect } from 'react';
import { fetchChartData } from '@/services/stockService';
import type { ChartData } from '@/types';

type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' | 'max';

const RANGE_CONFIG: Record<TimeRange, { interval: string; range: string }> = {
    '1d': { interval: '5m', range: '1d' },
    '5d': { interval: '30m', range: '5d' },
    '1mo': { interval: '1d', range: '1mo' },
    '3mo': { interval: '1d', range: '3mo' },
    '6mo': { interval: '1d', range: '6mo' },
    '1y': { interval: '1wk', range: '1y' },
    '5y': { interval: '1wk', range: '5y' },
    'max': { interval: '1mo', range: 'max' },
};

export function useHistoricalData(symbol: string | undefined, range: TimeRange = '1mo') {
    const [candles, setCandles] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!symbol || !range) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const config = RANGE_CONFIG[range];

        fetchChartData(symbol, config.interval as any, config.range as any)
            .then((data) => {
                setCandles(data);
            })
            .catch(() => {
                setCandles([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [symbol, range]);

    return { candles, loading };
}
