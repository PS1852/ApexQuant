import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchStocks, fetchMultipleQuotes, getTrendingStocks, formatCurrency, formatPercentage } from '@/services/stockService';
import { useWatchlist } from '@/hooks/useWatchlist';
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
  Globe,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Stock } from '@/types';

export default function Market() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      const stocks = await getTrendingStocks();
      setTrendingStocks(stocks);
      setLoading(false);
    };
    loadTrending();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setSearchLoading(true);
        const results = await searchStocks(searchQuery);
        
        // Fetch prices for search results
        const symbols = results.map(s => s.symbol);
        const quotes = await fetchMultipleQuotes(symbols);
        
        const stocksWithPrices = results.map(stock => ({
          ...stock,
          ...quotes[stock.symbol],
        }));
        
        setSearchResults(stocksWithPrices);
        setSearchLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleAddToWatchlist = async (stock: Stock) => {
    try {
      await addToWatchlist(stock.symbol, stock.company_name, stock.exchange);
      toast.success(`${stock.symbol} added to watchlist`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to watchlist');
    }
  };

  const StockCard = ({ stock }: { stock: Stock }) => (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Link to={`/stock/${stock.symbol}`} className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-400">
                  {stock.symbol.slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-medium text-white">{stock.symbol}</p>
                <p className="text-sm text-slate-400 line-clamp-1">{stock.company_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {stock.exchange}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {stock.country}
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <div className="text-right ml-4">
            {stock.current_price ? (
              <>
                <p className="font-medium text-white">
                  {formatCurrency(stock.current_price)}
                </p>
                <p className={`text-sm ${(stock.change_percent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercentage(stock.change_percent || 0)}
                </p>
              </>
            ) : (
              <p className="text-slate-500 text-sm">Loading...</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Link to={`/stock/${stock.symbol}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
              View
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => handleAddToWatchlist(stock)}
            disabled={isInWatchlist(stock.symbol)}
          >
            <Star className={`h-4 w-4 ${isInWatchlist(stock.symbol) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Market</h1>
            <p className="text-slate-400 mt-1">Explore stocks from NSE, BSE, and US markets</p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Search stocks (e.g., RELIANCE, AAPL, TCS...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-slate-900 border-slate-800 text-white text-lg placeholder:text-slate-500"
            />
            {searchLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-slate-500" />
            )}
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Search Results</h2>
              {searchResults.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((stock) => (
                    <StockCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No stocks found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Market Tabs */}
          {searchQuery.length < 2 && (
            <Tabs defaultValue="trending" className="space-y-6">
              <TabsList className="bg-slate-900 border border-slate-800">
                <TabsTrigger value="trending" className="data-[state=active]:bg-slate-800">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="indian" className="data-[state=active]:bg-slate-800">
                  <Building2 className="h-4 w-4 mr-2" />
                  Indian Stocks
                </TabsTrigger>
                <TabsTrigger value="us" className="data-[state=active]:bg-slate-800">
                  <Globe className="h-4 w-4 mr-2" />
                  US Stocks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    <div className="col-span-full text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-500" />
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
                    .filter(s => s.country === 'IN')
                    .map((stock) => (
                      <StockCard key={stock.symbol} stock={stock} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="us">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingStocks
                    .filter(s => s.country === 'US')
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
