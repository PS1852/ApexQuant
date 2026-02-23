import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWatchlist } from '@/hooks/useWatchlist';
import { 
  fetchStockQuote, 
  fetchChartData, 
  formatCurrency, 
  formatPercentage
} from '@/services/stockService';
import { executeBuy, executeSell } from '@/services/tradeService';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Star,
  ArrowLeft,
  Building2,
  Globe,
  BarChart3,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Stock, ChartData } from '@/types';

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const { user, profile } = useAuth();
  const { portfolio, refresh: refreshPortfolio } = usePortfolio();
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  const [stock, setStock] = useState<Stock | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [trading, setTrading] = useState(false);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const holding = portfolio.find(p => p.symbol === symbol);
  const maxBuyQuantity = profile?.balance && stock?.current_price 
    ? Math.floor(profile.balance / stock.current_price) 
    : 0;
  const maxSellQuantity = holding?.quantity || 0;

  useEffect(() => {
    const loadData = async () => {
      if (!symbol) return;

      setLoading(true);
      const [quote, chart] = await Promise.all([
        fetchStockQuote(symbol),
        fetchChartData(symbol, '1d', '1mo')
      ]);

      setStock(quote);
      setChartData(chart);
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [symbol]);

  const handleTrade = async () => {
    if (!user?.id || !stock || quantity <= 0) return;

    setTrading(true);
    try {
      const result = tradeType === 'BUY'
        ? await executeBuy(user.id, stock.symbol, stock.company_name, stock.exchange, quantity, stock.current_price || 0)
        : await executeSell(user.id, stock.symbol, stock.company_name, stock.exchange, quantity, stock.current_price || 0);

      if (result.success) {
        toast.success(result.message);
        setTradeDialogOpen(false);
        setQuantity(1);
        refreshPortfolio();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Trade failed');
    } finally {
      setTrading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!stock) return;

    try {
      if (isInWatchlist(stock.symbol)) {
        toast.success('Already in watchlist');
      } else {
        await addToWatchlist(stock.symbol, stock.company_name, stock.exchange);
        toast.success('Added to watchlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update watchlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <Sidebar />
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-slate-500" />
            <p className="text-slate-500 mt-4">Loading stock data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <Sidebar />
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 text-lg">Stock not found</p>
            <Link to="/market">
              <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
                Back to Market
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Back Button */}
          <Link to="/market">
            <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Market
            </Button>
          </Link>

          {/* Stock Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-400">
                  {stock.symbol.slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{stock.symbol}</h1>
                <p className="text-slate-400">{stock.company_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-sm flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {stock.exchange}
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-sm flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {stock.country}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(stock.current_price || 0)}
                </p>
                <p className={`text-lg ${(stock.change_percent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(stock.change || 0) >= 0 ? '+' : ''}{formatCurrency(stock.change || 0)}
                  {' '}({formatPercentage(stock.change_percent || 0)})
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-slate-700"
                onClick={handleWatchlistToggle}
              >
                <Star className={`h-5 w-5 ${isInWatchlist(stock.symbol) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`} />
              </Button>
            </div>
          </div>

          {/* Chart & Actions */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Price Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <div className="h-80 flex items-end justify-between gap-1">
                      {chartData.map((data, index) => {
                        const maxPrice = Math.max(...chartData.map(d => d.high));
                        const minPrice = Math.min(...chartData.map(d => d.low));
                        const range = maxPrice - minPrice || 1;
                        const height = ((data.close - minPrice) / range) * 100;
                        const isUp = data.close >= data.open;

                        return (
                          <div
                            key={index}
                            className="flex-1 flex flex-col items-center"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          >
                            <div 
                              className={`w-full max-w-4 rounded-t ${isUp ? 'bg-emerald-500' : 'bg-red-500'}`}
                              style={{ height: '100%' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-slate-500">
                      No chart data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Trade Panel */}
            <div>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Trade {stock.symbol}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {holding && (
                    <div className="p-4 rounded-xl bg-slate-800/50">
                      <p className="text-slate-400 text-sm">Your Holdings</p>
                      <p className="text-xl font-bold text-white">{holding.quantity} shares</p>
                      <p className="text-sm text-slate-400">
                        Avg: {formatCurrency(holding.avg_buy_price)}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-slate-800/50">
                    <p className="text-slate-400 text-sm">Available Balance</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {formatCurrency(profile?.balance || 0)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Dialog open={tradeDialogOpen && tradeType === 'BUY'} onOpenChange={(open) => {
                      setTradeDialogOpen(open);
                      if (open) setTradeType('BUY');
                    }}>
                      <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Buy
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Buy {stock.symbol}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-300">Quantity</Label>
                            <Input
                              type="number"
                              min={1}
                              max={maxBuyQuantity}
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                            <p className="text-sm text-slate-500 mt-1">
                              Max: {maxBuyQuantity} shares
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-800/50">
                            <p className="text-slate-400">Total Amount</p>
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(quantity * (stock.current_price || 0))}
                            </p>
                          </div>
                          <Button
                            onClick={handleTrade}
                            disabled={trading || quantity <= 0 || quantity > maxBuyQuantity}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                          >
                            {trading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : (
                              'Confirm Buy'
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={tradeDialogOpen && tradeType === 'SELL'} onOpenChange={(open) => {
                      setTradeDialogOpen(open);
                      if (open) setTradeType('SELL');
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive"
                          disabled={!holding || holding.quantity === 0}
                        >
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Sell
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Sell {stock.symbol}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-300">Quantity</Label>
                            <Input
                              type="number"
                              min={1}
                              max={maxSellQuantity}
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                            <p className="text-sm text-slate-500 mt-1">
                              Max: {maxSellQuantity} shares
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-800/50">
                            <p className="text-slate-400">Total Amount</p>
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(quantity * (stock.current_price || 0))}
                            </p>
                          </div>
                          <Button
                            onClick={handleTrade}
                            disabled={trading || quantity <= 0 || quantity > maxSellQuantity}
                            variant="destructive"
                            className="w-full"
                          >
                            {trading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : (
                              'Confirm Sell'
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
