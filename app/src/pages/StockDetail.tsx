import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useStockPrice } from '@/hooks/useStockPrice';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import { formatCurrency, formatPercentage } from '@/services/stockService';
import { isMarketOpen } from '@/utils/marketHours';
import { executeBuy, executeSell } from '@/services/tradeService';
import Sidebar from '@/components/Sidebar';
import StockChart from '@/components/StockChart';
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
  Loader2,
  Zap,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' | 'max';

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const { portfolio, refresh: refreshPortfolio } = usePortfolio();
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  const isIndian = symbol?.includes('.NS') || symbol?.includes('.BO');
  const market: 'IN' | 'US' = isIndian ? 'IN' : 'US';

  const { data: stock, loading: priceLoading } = useStockPrice(symbol, market);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1d');
  const { candles, loading: chartLoading } = useHistoricalData(symbol, selectedRange);

  const [quantity, setQuantity] = useState(1);
  const [trading, setTrading] = useState(false);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const holding = portfolio.find((p) => p.symbol === symbol);
  const maxBuyQuantity =
    profile?.balance && stock?.current_price
      ? Math.floor(profile.balance / stock.current_price)
      : 0;
  const maxSellQuantity = holding?.shares || 0;

  const marketOpen = isMarketOpen(market);

  const handleTrade = async () => {
    if (!user?.id || !stock || quantity <= 0) return;
    setTrading(true);
    try {
      const result =
        tradeType === 'BUY'
          ? await executeBuy(
            user.id,
            stock.symbol,
            stock.company_name,
            stock.exchange,
            quantity,
            stock.current_price || 0
          )
          : await executeSell(
            user.id,
            stock.symbol,
            stock.company_name,
            stock.exchange,
            quantity,
            stock.current_price || 0
          );

      if (result.success) {
        toast.success(result.message);
        setTradeDialogOpen(false);
        setQuantity(1);
        refreshPortfolio();
        refreshProfile();
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
        await addToWatchlist(stock.symbol);
        toast.success('Added to watchlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update watchlist');
    }
  };

  if (priceLoading && !stock) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <Sidebar />
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
            <p className="text-slate-500 mt-4">Loading stock data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex animate-fade-in-up">
      <Sidebar />

      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Back Button */}
          <Link to="/market">
            <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Market
            </Button>
          </Link>

          {/* Stock Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-slate-800">
                <span className="text-xl font-bold text-blue-400">
                  {(symbol || '').replace('.NS', '').replace('.BO', '').slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {(symbol || '').replace('.NS', '').replace('.BO', '')}
                  </h1>
                  {/* Market Status Indicator */}
                  <div className="flex items-center gap-1.5">
                    {marketOpen ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Zap className="h-3 w-3 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium">Live</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/50 border border-slate-700">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium">Closed</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-slate-400 mt-0.5">{stock?.company_name || symbol}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 rounded-md bg-slate-800/80 text-slate-400 text-xs flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {stock?.exchange || (isIndian ? 'NSE' : 'US')}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-800/80 text-slate-400 text-xs flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {isIndian ? '🇮🇳 India' : '🇺🇸 US'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="border-slate-700 hover:border-yellow-500/50"
                onClick={handleWatchlistToggle}
              >
                <Star
                  className={`h-5 w-5 ${isInWatchlist(stock?.symbol || '')
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-400'
                    }`}
                />
              </Button>
            </div>
          </div>

          {/* Chart & Actions Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart (spans 2 columns) */}
            <div className="lg:col-span-2">
              <StockChart
                candles={candles}
                loading={chartLoading}
                currentPrice={stock?.current_price}
                prevClose={stock?.current_price && stock?.change
                  ? stock.current_price - stock.change
                  : undefined
                }
                selectedRange={selectedRange}
                onRangeChange={setSelectedRange}
                currency={stock?.currency || (isIndian ? 'INR' : 'USD')}
              />
            </div>

            {/* Trade Panel */}
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Trade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Price */}
                  {stock && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Current Price</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {formatCurrency(stock.current_price || 0, stock.currency || (isIndian ? 'INR' : 'USD'))}
                      </p>
                      <p
                        className={`text-sm mt-0.5 ${(stock.change_percent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                      >
                        {(stock.change || 0) >= 0 ? '+' : ''}
                        {formatCurrency(Math.abs(stock.change || 0), stock.currency || (isIndian ? 'INR' : 'USD'))} ({formatPercentage(stock.change_percent || 0)})
                      </p>
                    </div>
                  )}

                  {/* Holdings */}
                  {holding && (
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Your Holdings</p>
                      <p className="text-lg font-bold text-white mt-1">{holding.shares} shares</p>
                      <p className="text-sm text-slate-400">
                        Avg: {formatCurrency(holding.average_price, stock?.currency || 'INR')}
                      </p>
                    </div>
                  )}

                  {/* Balance */}
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Balance</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">
                      {formatCurrency(profile?.balance || 0, 'INR')}
                    </p>
                  </div>

                  {/* Buy / Sell Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Dialog
                      open={tradeDialogOpen && tradeType === 'BUY'}
                      onOpenChange={(open) => {
                        setTradeDialogOpen(open);
                        if (open) setTradeType('BUY');
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={!marketOpen}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          {marketOpen ? 'Buy' : 'Market Closed'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Buy {symbol}</DialogTitle>
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
                            <p className="text-sm text-slate-500 mt-1">Max: {maxBuyQuantity} shares</p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-800/50">
                            <p className="text-slate-400">Total Amount</p>
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(quantity * (stock?.current_price || 0), stock?.currency || 'INR')}
                            </p>
                          </div>
                          <Button
                            onClick={handleTrade}
                            disabled={trading || quantity <= 0 || quantity > maxBuyQuantity || !marketOpen}
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

                    <Dialog
                      open={tradeDialogOpen && tradeType === 'SELL'}
                      onOpenChange={(open) => {
                        setTradeDialogOpen(open);
                        if (open) setTradeType('SELL');
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={!holding || holding.shares === 0 || !marketOpen}
                        >
                          <TrendingDown className="h-4 w-4 mr-2" />
                          {marketOpen ? 'Sell' : 'Market Closed'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Sell {symbol}</DialogTitle>
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
                            <p className="text-sm text-slate-500 mt-1">Max: {maxSellQuantity} shares</p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-800/50">
                            <p className="text-slate-400">Total Amount</p>
                            <p className="text-2xl font-bold text-white">
                              {formatCurrency(quantity * (stock?.current_price || 0), stock?.currency || 'INR')}
                            </p>
                          </div>
                          <Button
                            onClick={handleTrade}
                            disabled={trading || quantity <= 0 || quantity > maxSellQuantity || !marketOpen}
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
