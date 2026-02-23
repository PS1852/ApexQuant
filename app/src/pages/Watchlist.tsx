import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '@/hooks/useWatchlist';
import { fetchMultipleQuotes, formatCurrency, formatPercentage } from '@/services/stockService';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  TrendingUp, 
  ArrowRight,
  Trash2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Stock } from '@/types';

export default function Watchlist() {
  const { watchlist, loading: watchlistLoading, removeFromWatchlist } = useWatchlist();
  const [quotes, setQuotes] = useState<Record<string, Stock>>({});
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadPrices = async () => {
      if (watchlist.length > 0) {
        const symbols = watchlist.map(item => item.symbol);
        const data = await fetchMultipleQuotes(symbols);
        setQuotes(data);
      }
    };

    loadPrices();
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const handleRemove = async (id: string, symbol: string) => {
    try {
      setRemovingId(id);
      await removeFromWatchlist(id);
      toast.success(`${symbol} removed from watchlist`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove from watchlist');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <Star className="h-8 w-8 text-yellow-400" />
                Watchlist
              </h1>
              <p className="text-slate-400 mt-1">Track your favorite stocks</p>
            </div>
            <Link to="/market">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Add Stocks
              </Button>
            </Link>
          </div>

          {/* Watchlist Grid */}
          {watchlistLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-500" />
              <p className="text-slate-500 mt-4">Loading watchlist...</p>
            </div>
          ) : watchlist.length === 0 ? (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Your watchlist is empty</h3>
                <p className="text-slate-400 mb-6">Add stocks to track their performance</p>
                <Link to="/market">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Explore Market
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {watchlist.map((item) => {
                const quote = quotes[item.symbol];
                return (
                  <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <Link to={`/stock/${item.symbol}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-400">
                                {item.symbol.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{item.symbol}</p>
                              <p className="text-xs text-slate-400">{item.exchange}</p>
                            </div>
                          </div>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-400"
                          onClick={() => handleRemove(item.id, item.symbol)}
                          disabled={removingId === item.id}
                        >
                          {removingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          {quote ? (
                            <>
                              <p className="text-2xl font-bold text-white">
                                {formatCurrency(quote.current_price || 0)}
                              </p>
                              <p className={`text-sm ${(quote.change_percent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {(quote.change_percent || 0) >= 0 ? '+' : ''}
                                {formatPercentage(quote.change_percent || 0)}
                              </p>
                            </>
                          ) : (
                            <p className="text-slate-500">Loading...</p>
                          )}
                        </div>
                        <Link to={`/stock/${item.symbol}`}>
                          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            Trade
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
