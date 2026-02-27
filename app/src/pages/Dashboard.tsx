import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useTransactions } from '@/hooks/useTransactions';
import { fetchMultipleQuotes, formatCurrency, formatPercentage } from '@/services/stockService';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Activity,
  ArrowRight,
  Star
} from 'lucide-react';
import type { Stock } from '@/types';

export default function Dashboard() {
  const { profile } = useAuth();
  const { portfolio, stats: portfolioStats, loading: portfolioLoading, updatePrices } = usePortfolio();
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const { transactions, loading: transactionsLoading } = useTransactions(5);

  const [watchlistQuotes, setWatchlistQuotes] = useState<Record<string, Stock>>({});

  // Fetch live prices for portfolio holdings so Total Portfolio reflects real market value
  useEffect(() => {
    const loadPortfolioPrices = async () => {
      if (portfolio.length > 0) {
        const symbols = portfolio.map(item => item.symbol);
        const quotes = await fetchMultipleQuotes(symbols);
        const priceMap: Record<string, number> = {};
        Object.entries(quotes).forEach(([symbol, quote]) => {
          priceMap[symbol] = quote.current_price || 0;
        });
        updatePrices(priceMap);
      }
    };

    loadPortfolioPrices();
    const interval = setInterval(loadPortfolioPrices, 30000);
    return () => clearInterval(interval);
  }, [portfolio.length]);

  useEffect(() => {
    const loadWatchlistPrices = async () => {
      if (watchlist.length > 0) {
        const symbols = watchlist.map(item => item.symbol);
        const quotes = await fetchMultipleQuotes(symbols);
        setWatchlistQuotes(quotes);
      }
    };

    loadWatchlistPrices();
    const interval = setInterval(loadWatchlistPrices, 30000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const totalPortfolioValue = portfolioStats.currentValue + (profile?.balance || 0);
  const totalPnl = portfolioStats.totalPnl;
  const totalPnlPercent = portfolioStats.totalInvestment > 0
    ? (totalPnl / portfolioStats.totalInvestment) * 100
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Trader'}!
            </h1>
            <p className="text-slate-400 mt-1">
              Here's what's happening with your portfolio today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Portfolio</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatCurrency(totalPortfolioValue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Available Balance</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                      {formatCurrency(profile?.balance || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total P&L</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
                      </p>
                    </div>
                    <p className={`text-sm ${totalPnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPercentage(totalPnlPercent)}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${totalPnl >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {totalPnl >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Holdings</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {portfolioStats.totalHoldings}
                    </p>
                    <p className="text-sm text-slate-500">
                      {portfolioStats.totalQuantity} shares
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Portfolio Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Portfolio Overview</CardTitle>
                  <Link to="/portfolio">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {portfolioLoading ? (
                    <div className="text-center py-8 text-slate-500">Loading portfolio...</div>
                  ) : portfolio.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">Your portfolio is empty</p>
                      <Link to="/market">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                          Start Trading
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {portfolio.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-400">
                                {item.symbol.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{item.symbol}</p>
                              <p className="text-sm text-slate-400">{item.shares} shares</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {formatCurrency(item.current_value || (item.shares * item.average_price))}
                            </p>
                            <p className={`text-sm ${(item.unrealized_pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {(item.unrealized_pnl || 0) >= 0 ? '+' : ''}
                              {formatCurrency(item.unrealized_pnl || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Recent Transactions</CardTitle>
                  <Link to="/transactions">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="text-center py-8 text-slate-500">Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No transactions yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'BUY'
                              ? 'bg-emerald-500/10'
                              : 'bg-red-500/10'
                              }`}>
                              <span className={`text-sm font-bold ${transaction.type === 'BUY'
                                ? 'text-emerald-400'
                                : 'text-red-400'
                                }`}>
                                {transaction.type === 'BUY' ? 'B' : 'S'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{transaction.symbol}</p>
                              <p className="text-sm text-slate-400">
                                {transaction.shares} shares @ {formatCurrency(transaction.price)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-sm text-slate-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Watchlist */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Watchlist
                  </CardTitle>
                  <Link to="/watchlist">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {watchlistLoading ? (
                    <div className="text-center py-8 text-slate-500">Loading watchlist...</div>
                  ) : watchlist.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">Your watchlist is empty</p>
                      <Link to="/market">
                        <Button variant="outline" size="sm" className="border-slate-700">
                          Add Stocks
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {watchlist.slice(0, 5).map((item) => {
                        const quote = watchlistQuotes[item.symbol];
                        return (
                          <Link
                            key={item.id}
                            to={`/stock/${item.symbol}`}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-white">{item.symbol}</p>
                              <p className="text-xs text-slate-400">{item.exchange}</p>
                            </div>
                            <div className="text-right">
                              {quote ? (
                                <>
                                  <p className="font-medium text-white">
                                    {formatCurrency(quote.current_price || 0)}
                                  </p>
                                  <p className={`text-xs ${(quote.change_percent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {formatPercentage(quote.change_percent || 0)}
                                  </p>
                                </>
                              ) : (
                                <p className="text-slate-500 text-sm">Loading...</p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/market">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Explore Market
                    </Button>
                  </Link>
                  <Link to="/portfolio">
                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                      <PieChart className="h-4 w-4 mr-2" />
                      View Portfolio
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
