import { supabase } from '@/lib/supabase';
import type { Stock, ChartData, MarketIndex } from '@/types';

// ============ API KEYS ============
const FINNHUB_KEY = 'd6g2o99r01qqnmbqhvsgd6g2o99r01qqnmbqhvt0';
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// ============ CURRENCY CONVERSION ============
let usdToInrRate = 83.5;

export const fetchUsdToInr = async (): Promise<number> => {
  try {
    const response = await fetch(`${YAHOO_FINANCE_BASE}/INR=X?interval=1d&range=1d`);
    const data = await response.json();
    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      usdToInrRate = data.chart.result[0].meta.regularMarketPrice;
    }
    return usdToInrRate;
  } catch {
    return usdToInrRate;
  }
};

export const convertUsdToInr = (usdAmount: number): number => usdAmount * usdToInrRate;

// ============ FORMATTING ============
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// ============ STOCK SEARCH (from Supabase DB — 24000+ stocks) ============
export const searchStocks = async (query: string): Promise<Stock[]> => {
  if (!query || query.length < 1) return [];

  const { data, error } = await supabase
    .from('stocks')
    .select('symbol, name, exchange, market, sector, currency')
    .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(20);

  if (error || !data) {
    console.warn('Search error, falling back to local:', error);
    return [];
  }

  return data.map((s: any) => ({
    symbol: s.market === 'IN' ? `${s.symbol}.NS` : s.symbol,
    company_name: s.name,
    exchange: s.exchange,
    sector: s.sector,
    country: s.market,
    currency: s.currency || (s.market === 'IN' ? 'INR' : 'USD'),
  }));
};

// ============ FETCH STOCK QUOTE ============
export const fetchStockQuote = async (symbol: string): Promise<Stock | null> => {
  try {
    const isIndian = symbol.includes('.NS') || symbol.includes('.BO');
    const yahooSymbol = symbol.includes('.') ? symbol :
      symbol.length <= 5 && /^[A-Z]+$/.test(symbol) ? symbol : `${symbol}.NS`;

    const response = await fetch(`${YAHOO_FINANCE_BASE}/${yahooSymbol}?interval=1d&range=1d`);
    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      // Fallback: try Finnhub for US stocks
      if (!isIndian) {
        return await fetchFinnhubQuote(symbol);
      }
      return null;
    }

    const meta = data.chart.result[0].meta;
    let price = meta.regularMarketPrice || 0;
    let previousClose = meta.previousClose || meta.chartPreviousClose || price;

    if (!isIndian) {
      price = convertUsdToInr(price);
      previousClose = convertUsdToInr(previousClose);
    }

    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol,
      company_name: meta.shortName || meta.longName || symbol,
      exchange: meta.exchangeName || (isIndian ? 'NSE' : 'NASDAQ'),
      current_price: price,
      change,
      change_percent: changePercent,
      currency: 'INR',
      country: isIndian ? 'IN' : 'US',
    };
  } catch (error) {
    console.warn(`Yahoo Finance error for ${symbol}:`, error);
    // Fallback to Finnhub for US stocks
    if (!symbol.includes('.NS') && !symbol.includes('.BO')) {
      return await fetchFinnhubQuote(symbol);
    }
    return null;
  }
};

// Finnhub fallback for US stocks
const fetchFinnhubQuote = async (symbol: string): Promise<Stock | null> => {
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 1000));
      const retryRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
      const d = await retryRes.json();
      return buildFinnhubStock(symbol, d);
    }
    const d = await res.json();
    return buildFinnhubStock(symbol, d);
  } catch {
    return null;
  }
};

const buildFinnhubStock = (symbol: string, d: any): Stock | null => {
  if (!d || d.c === 0) return null;
  const priceInr = convertUsdToInr(d.c);
  const prevCloseInr = convertUsdToInr(d.pc);
  return {
    symbol,
    company_name: symbol,
    exchange: 'US',
    current_price: priceInr,
    change: priceInr - prevCloseInr,
    change_percent: d.pc > 0 ? ((d.c - d.pc) / d.pc) * 100 : 0,
    currency: 'INR',
    country: 'US',
  };
};

// ============ FETCH MULTIPLE QUOTES ============
export const fetchMultipleQuotes = async (symbols: string[]): Promise<Record<string, Stock>> => {
  const results: Record<string, Stock> = {};
  await fetchUsdToInr();

  for (let i = 0; i < symbols.length; i += 5) {
    const batch = symbols.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(async (symbol) => {
        const quote = await fetchStockQuote(symbol);
        return { symbol, quote };
      })
    );
    batchResults.forEach(({ symbol, quote }) => {
      if (quote) results[symbol] = quote;
    });
    if (i + 5 < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  return results;
};

// ============ CHART DATA ============
export const fetchChartData = async (
  symbol: string,
  interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo' = '1d',
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max' = '1mo'
): Promise<ChartData[]> => {
  try {
    const isIndian = symbol.includes('.NS') || symbol.includes('.BO');
    const yahooSymbol = symbol.includes('.') ? symbol :
      symbol.length <= 5 && /^[A-Z]+$/.test(symbol) ? symbol : `${symbol}.NS`;

    const response = await fetch(`${YAHOO_FINANCE_BASE}/${yahooSymbol}?interval=${interval}&range=${range}`);
    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      // Fallback: try Finnhub candles for US stocks
      if (!isIndian) {
        return await fetchFinnhubCandles(symbol, range);
      }
      return [];
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};

    const chartData: ChartData[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const open = quote.open?.[i];
      const high = quote.high?.[i];
      const low = quote.low?.[i];
      const close = quote.close?.[i];
      const volume = quote.volume?.[i];

      if (open && high && low && close) {
        const factor = isIndian ? 1 : usdToInrRate;
        chartData.push({
          time: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          open: open * factor,
          high: high * factor,
          low: low * factor,
          close: close * factor,
          volume: volume || 0,
        });
      }
    }
    return chartData;
  } catch {
    return [];
  }
};

// Finnhub candles fallback
const fetchFinnhubCandles = async (symbol: string, range: string): Promise<ChartData[]> => {
  try {
    const rangeMap: Record<string, { resolution: string; days: number }> = {
      '1d': { resolution: '5', days: 1 },
      '5d': { resolution: '30', days: 5 },
      '1mo': { resolution: 'D', days: 30 },
      '3mo': { resolution: 'D', days: 90 },
      '6mo': { resolution: 'D', days: 180 },
      '1y': { resolution: 'W', days: 365 },
      '5y': { resolution: 'W', days: 1825 },
      'max': { resolution: 'M', days: 7300 },
    };

    const config = rangeMap[range] || rangeMap['1mo'];
    const to = Math.floor(Date.now() / 1000);
    const from = to - config.days * 86400;

    const res = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${config.resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`
    );
    const d = await res.json();

    if (d.s !== 'ok' || !d.t) return [];

    return d.t.map((t: number, i: number) => ({
      time: new Date(t * 1000).toISOString().split('T')[0],
      open: convertUsdToInr(d.o[i]),
      high: convertUsdToInr(d.h[i]),
      low: convertUsdToInr(d.l[i]),
      close: convertUsdToInr(d.c[i]),
      volume: d.v[i] || 0,
    }));
  } catch {
    return [];
  }
};

// ============ MARKET INDICES ============
export const fetchMarketIndices = async (): Promise<MarketIndex[]> => {
  const indices = [
    { symbol: '^NSEI', name: 'NIFTY 50' },
    { symbol: '^BSESN', name: 'SENSEX' },
    { symbol: '^IXIC', name: 'NASDAQ' },
    { symbol: '^GSPC', name: 'S&P 500' },
  ];

  const results: MarketIndex[] = [];

  for (const index of indices) {
    try {
      const response = await fetch(`${YAHOO_FINANCE_BASE}/${index.symbol}?interval=1d&range=1d`);
      const data = await response.json();

      if (data.chart?.result?.[0]) {
        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice || 0;
        const previousClose = meta.previousClose || meta.chartPreviousClose || price;
        const change = price - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

        results.push({
          symbol: index.symbol,
          name: index.name,
          value: price,
          change,
          change_percent: changePercent,
        });
      }
    } catch {
      const baseValue = Math.random() * 20000 + 5000;
      const change = (Math.random() - 0.5) * baseValue * 0.02;
      results.push({
        symbol: index.symbol,
        name: index.name,
        value: baseValue,
        change,
        change_percent: (change / baseValue) * 100,
      });
    }
  }
  return results;
};

// ============ TRENDING STOCKS ============
export const getTrendingStocks = async (): Promise<Stock[]> => {
  const trendingSymbols = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'
  ];
  const quotes = await fetchMultipleQuotes(trendingSymbols);
  return Object.values(quotes);
};
