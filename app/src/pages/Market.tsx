import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingStocks, formatCurrency, formatPercentage } from '@/services/stockService';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useStockSearch } from '@/hooks/useStockSearch';
import { isMarketOpen } from '@/utils/marketHours';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  TrendingUp,
  Star,
  ArrowRight,
  Loader2,

  Zap,
  Clock,
  Database,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Stock } from '@/types';

export default function Market() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const { results: searchResults, loading: searchLoading, search } = useStockSearch();
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 1) {
        search(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, search]);

  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      const stocks = await getTrendingStocks();
      setTrendingStocks(stocks);
      setLoading(false);
    };
    loadTrending();
  }, []);

  const handleAddToWatchlist = async (stock: Stock) => {
    try {
      await addToWatchlist(stock.symbol);
      toast.success(`${stock.symbol} added to watchlist`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to watchlist');
    }
  };

  const nseOpen = isMarketOpen('IN');
  const nyseOpen = isMarketOpen('US');

  const StockCard = ({ stock }: { stock: Stock }) => {
    const isIndian = stock.country === 'IN' || stock.symbol.includes('.NS');
    return (
      <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-blue-500/5 group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <Link to={`/stock/${stock.symbol}`} className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                  <span className="text-sm font-bold text-blue-400">
                    {stock.symbol.replace('.NS', '').replace('.BO', '').slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">
                    {stock.symbol.replace('.NS', '').replace('.BO', '')}
                  </p>
                  <p className="text-sm text-slate-400 line-clamp-1">{stock.company_name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {stock.exchange}
                    </span>
                    <span className="text-xs">{isIndian ? '🇮🇳' : '🇺🇸'}</span>
                  </div>
                </div>
              </div>
            </Link>
            <div className="text-right ml-3">
              {stock.current_price ? (
                <>
                  <p className="font-medium text-white text-sm">
                    {formatCurrency(stock.current_price, stock.currency || (isIndian ? 'INR' : 'USD'))}
                  </p>
                  <p
                    className={`text-xs ${(stock.change_percent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                  >
                    {formatPercentage(stock.change_percent || 0)}
                  </p>
                </>
              ) : (
                <p className="text-slate-500 text-xs">—</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Link to={`/stock/${stock.symbol}`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-blue-500/50 text-xs"
              >
                View Chart
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => handleAddToWatchlist(stock)}
              disabled={isInWatchlist(stock.symbol)}
            >
              <Star
                className={`h-3 w-3 ${isInWatchlist(stock.symbol) ? 'fill-yellow-400 text-yellow-400' : ''
                  }`}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex animate-fade-in-up">
      <Sidebar />

      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Market</h1>
                <p className="text-slate-400 mt-1 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Search across 24,000+ stocks from NSE, BSE, NYSE & NASDAQ
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
                  {nseOpen ? (
                    <Zap className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Clock className="h-3 w-3 text-slate-400" />
                  )}
                  <span className={`text-xs font-medium ${nseOpen ? 'text-emerald-400' : 'text-slate-400'}`}>
                    NSE {nseOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
                  {nyseOpen ? (
                    <Zap className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Clock className="h-3 w-3 text-slate-400" />
                  )}
                  <span className={`text-xs font-medium ${nyseOpen ? 'text-emerald-400' : 'text-slate-400'}`}>
                    NYSE {nyseOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Search any stock... (TCS, AAPL, Reliance, Apple, TSLA)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-slate-900/80 border-slate-800 text-white text-lg placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
            {searchLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-blue-500" />
            )}
          </div>

          {/* Search Results */}
          {searchQuery.length >= 1 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                {searchResults.length > 0
                  ? `Found ${searchResults.length} stocks`
                  : searchLoading
                    ? 'Searching...'
                    : `No stocks found for "${searchQuery}"`}
              </h2>
              {searchResults.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((stock) => (
                    <StockCard key={`${stock.symbol}-${stock.exchange}`} stock={stock} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Market Tabs (show when not searching) */}
          {searchQuery.length < 1 && (
            <Tabs defaultValue="trending" className="space-y-6">
              <TabsList className="bg-slate-900 border border-slate-800">
                <TabsTrigger value="trending" className="data-[state=active]:bg-slate-800">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="indian" className="data-[state=active]:bg-slate-800">
                  🇮🇳
                  <span className="ml-1.5">Indian</span>
                </TabsTrigger>
                <TabsTrigger value="us" className="data-[state=active]:bg-slate-800">
                  🇺🇸
                  <span className="ml-1.5">US</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    <div className="col-span-full text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                      <p className="text-slate-500 mt-4">Loading trending stocks...</p>
                    </div>
                  ) : (
                    trendingStocks.map((stock) => (
                      <StockCard key={stock.symbol} stock={stock} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="indian">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingStocks
                    .filter((s) => s.country === 'IN')
                    .map((stock) => (
                      <StockCard key={stock.symbol} stock={stock} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="us">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingStocks
                    .filter((s) => s.country === 'US')
                    .map((stock) => (
                      <StockCard key={stock.symbol} stock={stock} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
