import type { Stock, ChartData, MarketIndex } from '@/types';

// Free stock data API using Yahoo Finance proxy
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// USD to INR conversion rate (in production, this should be fetched from an API)
let usdToInrRate = 83.5;

// Fetch USD to INR conversion rate
export const fetchUsdToInr = async (): Promise<number> => {
  try {
    const response = await fetch(`${YAHOO_FINANCE_BASE}/INR=X?interval=1d&range=1d`);
    const data = await response.json();
    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      usdToInrRate = data.chart.result[0].meta.regularMarketPrice;
    }
    return usdToInrRate;
  } catch (error) {
    console.error('Error fetching USD to INR:', error);
    return usdToInrRate;
  }
};

// Convert USD to INR
export const convertUsdToInr = (usdAmount: number): number => {
  return usdAmount * usdToInrRate;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

// Format number with commas
export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Fetch stock quote from Yahoo Finance
export const fetchStockQuote = async (symbol: string): Promise<Stock | null> => {
  try {
    // Handle Indian stocks (.NS for NSE, .BO for BSE)
    const yahooSymbol = symbol.includes('.') ? symbol : 
                       symbol.length <= 5 && /^[A-Z]+$/.test(symbol) ? symbol : `${symbol}.NS`;
    
    const response = await fetch(`${YAHOO_FINANCE_BASE}/${yahooSymbol}?interval=1d&range=1d`);
    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      console.warn(`No data found for symbol: ${symbol}`);
      return null;
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    
    const isUSStock = !symbol.includes('.NS') && !symbol.includes('.BO');
    
    let price = meta.regularMarketPrice || 0;
    let previousClose = meta.previousClose || meta.chartPreviousClose || price;
    
    // Convert US stock prices to INR
    if (isUSStock) {
      price = convertUsdToInr(price);
      previousClose = convertUsdToInr(previousClose);
    }

    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol: symbol,
      company_name: meta.shortName || meta.longName || symbol,
      exchange: meta.exchangeName || (isUSStock ? 'NASDAQ' : 'NSE'),
      current_price: price,
      change: change,
      change_percent: changePercent,
      currency: 'INR', // Always show in INR
      country: isUSStock ? 'US' : 'IN',
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
};

// Fetch multiple stock quotes
export const fetchMultipleQuotes = async (symbols: string[]): Promise<Record<string, Stock>> => {
  const results: Record<string, Stock> = {};
  
  // Update USD to INR rate before fetching
  await fetchUsdToInr();
  
  // Fetch quotes in parallel with delay to avoid rate limiting
  for (let i = 0; i < symbols.length; i += 5) {
    const batch = symbols.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(async (symbol) => {
        const quote = await fetchStockQuote(symbol);
        return { symbol, quote };
      })
    );
    
    batchResults.forEach(({ symbol, quote }) => {
      if (quote) {
        results[symbol] = quote;
      }
    });
    
    // Small delay between batches
    if (i + 5 < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};

// Fetch historical chart data
export const fetchChartData = async (
  symbol: string, 
  interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo' = '1d',
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max' = '1mo'
): Promise<ChartData[]> => {
  try {
    const yahooSymbol = symbol.includes('.') ? symbol : 
                       symbol.length <= 5 && /^[A-Z]+$/.test(symbol) ? symbol : `${symbol}.NS`;
    
    const response = await fetch(
      `${YAHOO_FINANCE_BASE}/${yahooSymbol}?interval=${interval}&range=${range}`
    );
    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      return [];
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const isUSStock = !symbol.includes('.NS') && !symbol.includes('.BO');

    const chartData: ChartData[] = [];
    
    for (let i = 0; i < timestamps.length; i++) {
      const open = quote.open?.[i];
      const high = quote.high?.[i];
      const low = quote.low?.[i];
      const close = quote.close?.[i];
      const volume = quote.volume?.[i];

      if (open && high && low && close) {
        const conversionFactor = isUSStock ? usdToInrRate : 1;
        chartData.push({
          time: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          open: open * conversionFactor,
          high: high * conversionFactor,
          low: low * conversionFactor,
          close: close * conversionFactor,
          volume: volume || 0,
        });
      }
    }

    return chartData;
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol}:`, error);
    return [];
  }
};

// Fetch market indices
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
      const response = await fetch(
        `${YAHOO_FINANCE_BASE}/${index.symbol}?interval=1d&range=1d`
      );
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
          change: change,
          change_percent: changePercent,
        });
      }
    } catch (error) {
      console.error(`Error fetching index ${index.symbol}:`, error);
    }
  }

  return results;
};

// Search stocks (using local data - in production, use a proper search API)
export const searchStocks = async (query: string): Promise<Stock[]> => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toUpperCase();
  
  // Popular Indian stocks
  const indianStocks: Stock[] = [
    { symbol: 'RELIANCE.NS', company_name: 'Reliance Industries Ltd.', exchange: 'NSE', sector: 'Energy', country: 'IN' },
    { symbol: 'TCS.NS', company_name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', sector: 'IT', country: 'IN' },
    { symbol: 'HDFCBANK.NS', company_name: 'HDFC Bank Ltd.', exchange: 'NSE', sector: 'Banking', country: 'IN' },
    { symbol: 'INFY.NS', company_name: 'Infosys Ltd.', exchange: 'NSE', sector: 'IT', country: 'IN' },
    { symbol: 'ICICIBANK.NS', company_name: 'ICICI Bank Ltd.', exchange: 'NSE', sector: 'Banking', country: 'IN' },
    { symbol: 'HINDUNILVR.NS', company_name: 'Hindustan Unilever Ltd.', exchange: 'NSE', sector: 'FMCG', country: 'IN' },
    { symbol: 'SBIN.NS', company_name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', country: 'IN' },
    { symbol: 'BHARTIARTL.NS', company_name: 'Bharti Airtel Ltd.', exchange: 'NSE', sector: 'Telecom', country: 'IN' },
    { symbol: 'ITC.NS', company_name: 'ITC Ltd.', exchange: 'NSE', sector: 'FMCG', country: 'IN' },
    { symbol: 'KOTAKBANK.NS', company_name: 'Kotak Mahindra Bank Ltd.', exchange: 'NSE', sector: 'Banking', country: 'IN' },
    { symbol: 'LT.NS', company_name: 'Larsen & Toubro Ltd.', exchange: 'NSE', sector: 'Construction', country: 'IN' },
    { symbol: 'AXISBANK.NS', company_name: 'Axis Bank Ltd.', exchange: 'NSE', sector: 'Banking', country: 'IN' },
    { symbol: 'ASIANPAINT.NS', company_name: 'Asian Paints Ltd.', exchange: 'NSE', sector: 'Consumer', country: 'IN' },
    { symbol: 'MARUTI.NS', company_name: 'Maruti Suzuki India Ltd.', exchange: 'NSE', sector: 'Auto', country: 'IN' },
    { symbol: 'TITAN.NS', company_name: 'Titan Company Ltd.', exchange: 'NSE', sector: 'Consumer', country: 'IN' },
    { symbol: 'SUNPHARMA.NS', company_name: 'Sun Pharmaceutical Industries Ltd.', exchange: 'NSE', sector: 'Pharma', country: 'IN' },
    { symbol: 'BAJFINANCE.NS', company_name: 'Bajaj Finance Ltd.', exchange: 'NSE', sector: 'Finance', country: 'IN' },
    { symbol: 'WIPRO.NS', company_name: 'Wipro Ltd.', exchange: 'NSE', sector: 'IT', country: 'IN' },
    { symbol: 'NESTLEIND.NS', company_name: 'Nestle India Ltd.', exchange: 'NSE', sector: 'FMCG', country: 'IN' },
    { symbol: 'ULTRACEMCO.NS', company_name: 'UltraTech Cement Ltd.', exchange: 'NSE', sector: 'Cement', country: 'IN' },
    { symbol: 'TATAMOTORS.NS', company_name: 'Tata Motors Ltd.', exchange: 'NSE', sector: 'Auto', country: 'IN' },
    { symbol: 'ADANIENT.NS', company_name: 'Adani Enterprises Ltd.', exchange: 'NSE', sector: 'Conglomerate', country: 'IN' },
    { symbol: 'POWERGRID.NS', company_name: 'Power Grid Corporation of India Ltd.', exchange: 'NSE', sector: 'Power', country: 'IN' },
    { symbol: 'NTPC.NS', company_name: 'NTPC Ltd.', exchange: 'NSE', sector: 'Power', country: 'IN' },
    { symbol: 'COALINDIA.NS', company_name: 'Coal India Ltd.', exchange: 'NSE', sector: 'Mining', country: 'IN' },
  ];

  // US stocks
  const usStocks: Stock[] = [
    { symbol: 'AAPL', company_name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
    { symbol: 'MSFT', company_name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
    { symbol: 'GOOGL', company_name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
    { symbol: 'AMZN', company_name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer', country: 'US' },
    { symbol: 'TSLA', company_name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Auto', country: 'US' },
    { symbol: 'META', company_name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
    { symbol: 'NVDA', company_name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
    { symbol: 'NFLX', company_name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Entertainment', country: 'US' },
    { symbol: 'AMD', company_name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
    { symbol: 'INTC', company_name: 'Intel Corporation', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
    { symbol: 'AMD', company_name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
    { symbol: 'UBER', company_name: 'Uber Technologies Inc.', exchange: 'NYSE', sector: 'Technology', country: 'US' },
    { symbol: 'COIN', company_name: 'Coinbase Global Inc.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
    { symbol: 'PLTR', company_name: 'Palantir Technologies Inc.', exchange: 'NYSE', sector: 'Technology', country: 'US' },
    { symbol: 'RIVN', company_name: 'Rivian Automotive Inc.', exchange: 'NASDAQ', sector: 'Auto', country: 'US' },
  ];

  const allStocks = [...indianStocks, ...usStocks];
  
  return allStocks.filter(stock => 
    stock.symbol.toUpperCase().includes(searchTerm) ||
    stock.company_name.toUpperCase().includes(searchTerm)
  );
};

// Get trending stocks
export const getTrendingStocks = async (): Promise<Stock[]> => {
  const trendingSymbols = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'
  ];

  const quotes = await fetchMultipleQuotes(trendingSymbols);
  return Object.values(quotes);
};
