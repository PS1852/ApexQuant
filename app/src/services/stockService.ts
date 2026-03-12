// stockService.ts — Real-time stock data for ApexQuant
import type { Stock, ChartData, MarketIndex } from '@/types';

// ============ API KEYS ============
const FINNHUB_KEY = 'd6g2o99r01qqnmbqhvsgd6g2o99r01qqnmbqhvt0';

// Use Vite proxy in dev to avoid CORS, corsproxy.io in production for Yahoo
const isDev = import.meta.env.DEV;
const YAHOO_BASE = isDev
  ? '/yahoo-api/v8/finance/chart'
  : 'https://cors.eu.org/https://query1.finance.yahoo.com/v8/finance/chart';
const FINNHUB_BASE = 'https://finnhub.io/api/v1'; // Finnhub supports CORS natively

// ============ HELPERS ============
const finnhubFetch = async (endpoint: string): Promise<any> => {
  const res = await fetch(`${FINNHUB_BASE}${endpoint}&token=${FINNHUB_KEY}`);
  if (res.status === 429) {
    // Rate limited — wait and retry once
    await new Promise(r => setTimeout(r, 1200));
    const retry = await fetch(`${FINNHUB_BASE}${endpoint}&token=${FINNHUB_KEY}`);
    return retry.json();
  }
  return res.json();
};

const yahooFetch = async (path: string): Promise<any> => {
  const url = `${YAHOO_BASE}/${path}`;
  const res = await fetch(url);
  return res.json();
};

// ============ FORMATTING ============
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const url = `${supabaseUrl}/rest/v1/stocks?select=symbol,name,exchange,market,sector,currency&or=(symbol.ilike.*${query}*,name.ilike.*${query}*)&is_active=eq.true&limit=20`;

    const res = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) return [];

    const data = await res.json();

    return data.map((s: any) => ({
      symbol: s.market === 'IN' ? `${s.symbol}.NS` : s.symbol,
      company_name: s.name,
      exchange: s.exchange,
      sector: s.sector,
      country: s.market,
      currency: s.market === 'IN' ? 'INR' : 'USD',
    }));
  } catch {
    return [];
  }
};

// ============ FETCH STOCK QUOTE ============
// Strategy:
//   - Indian stocks (.NS/.BO) → Yahoo Finance (has INR prices natively)
//   - US stocks → Finnhub FIRST (supports CORS, returns USD prices)
//   - Fallback: Yahoo Finance for US if Finnhub fails

export const fetchStockQuote = async (symbol: string): Promise<Stock | null> => {
  const isIndian = symbol.includes('.NS') || symbol.includes('.BO');

  if (isIndian) {
    return fetchYahooQuote(symbol);
  } else {
    // US stock — use Finnhub first (native CORS support)
    const finnhubResult = await fetchFinnhubQuote(symbol);
    if (finnhubResult) return finnhubResult;
    // Fallback to Yahoo
    return fetchYahooQuote(symbol);
  }
};

// Yahoo Finance quote — returns price in native currency
const fetchYahooQuote = async (symbol: string): Promise<Stock | null> => {
  try {
    const isIndian = symbol.includes('.NS') || symbol.includes('.BO');
    const data = await yahooFetch(`${symbol}?interval=1d&range=1d`);

    if (!data.chart?.result?.[0]) return null;

    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice || 0;
    const previousClose = meta.previousClose || meta.chartPreviousClose || price;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
    const currency = isIndian ? 'INR' : (meta.currency || 'USD');

    return {
      symbol,
      company_name: meta.shortName || meta.longName || symbol,
      exchange: meta.exchangeName || (isIndian ? 'NSE' : 'NASDAQ'),
      current_price: price,
      change,
      change_percent: changePercent,
      currency,
      country: isIndian ? 'IN' : 'US',
    };
  } catch {
    return null;
  }
};

// Finnhub quote — returns price in USD (native currency, no conversion!)
const fetchFinnhubQuote = async (symbol: string): Promise<Stock | null> => {
  try {
    const [quoteData, profileData] = await Promise.all([
      finnhubFetch(`/quote?symbol=${symbol}`),
      finnhubFetch(`/stock/profile2?symbol=${symbol}`).catch(() => null),
    ]);

    if (!quoteData || quoteData.c === 0 || quoteData.c === undefined) return null;

    const price = quoteData.c;
    const previousClose = quoteData.pc || price;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol,
      company_name: profileData?.name || symbol,
      exchange: profileData?.exchange || 'US',
      current_price: price,        // USD — no conversion!
      change,                       // USD
      change_percent: changePercent,
      currency: profileData?.currency || 'USD',
      country: profileData?.country || 'US',
    };
  } catch {
    return null;
  }
};

// ============ FETCH MULTIPLE QUOTES ============
export const fetchMultipleQuotes = async (symbols: string[]): Promise<Record<string, Stock>> => {
  const results: Record<string, Stock> = {};

  // Process in batches of 5 to avoid rate limits
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
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  return results;
};

// ============ CHART DATA ============
// Strategy:
//   - Indian stocks → Yahoo Finance (INR prices)
//   - US stocks → Finnhub FIRST (CORS, USD), fallback Yahoo

export const fetchChartData = async (
  symbol: string,
  interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo' = '1d',
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max' = '1mo'
): Promise<ChartData[]> => {
  const isIndian = symbol.includes('.NS') || symbol.includes('.BO');

  if (isIndian) {
    // Indian stocks: Yahoo first, no fallback needed
    const yahooData = await fetchYahooChartData(symbol, interval, range);
    return yahooData;
  } else {
    // US stocks: Finnhub first (reliable CORS), Yahoo fallback
    const finnhubData = await fetchFinnhubCandles(symbol, range);
    if (finnhubData.length > 0) return finnhubData;
    return fetchYahooChartData(symbol, interval, range);
  }
};

// Yahoo Finance chart data — returns prices in native currency
const fetchYahooChartData = async (
  symbol: string,
  interval: string,
  range: string
): Promise<ChartData[]> => {
  try {
    const data = await yahooFetch(`${symbol}?interval=${interval}&range=${range}`);
    if (!data.chart?.result?.[0]) return [];

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
        chartData.push({
          time: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          open,   // native currency — no conversion
          high,
          low,
          close,
          volume: volume || 0,
        });
      }
    }
    return chartData;
  } catch {
    return [];
  }
};

// Finnhub candles — returns prices in USD (native, no conversion)
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

    const d = await finnhubFetch(
      `/stock/candle?symbol=${symbol}&resolution=${config.resolution}&from=${from}&to=${to}`
    );

    if (d.s !== 'ok' || !d.t) return [];

    return d.t.map((t: number, i: number) => ({
      time: new Date(t * 1000).toISOString().split('T')[0],
      open: d.o[i],      // USD — no conversion!
      high: d.h[i],
      low: d.l[i],
      close: d.c[i],
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
      const data = await yahooFetch(`${index.symbol}?interval=1d&range=1d`);
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
      // Skip failed indices
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
