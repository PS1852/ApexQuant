import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/hooks/usePortfolio';
import { fetchMultipleQuotes, formatCurrency, formatPercentage } from '@/services/stockService';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  ArrowRight,
  Wallet,
  Package
} from 'lucide-react';
import type { Stock } from '@/types';

export default function Portfolio() {
  const { profile } = useAuth();
  const { portfolio, stats, loading, updatePrices } = usePortfolio();
  const [, setPrices] = useState<Record<string, Stock>>({});

  useEffect(() => {
    const loadPrices = async () => {
      if (portfolio.length > 0) {
        const symbols = portfolio.map(item => item.symbol);
        const quotes = await fetchMultipleQuotes(symbols);
        setPrices(quotes);
        
        // Update portfolio with latest prices
        const priceMap: Record<string, number> = {};
        Object.entries(quotes).forEach(([symbol, quote]) => {
          priceMap[symbol] = quote.current_price || 0;
        });
        updatePrices(priceMap);
      }
    };

    loadPrices();
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, [portfolio.length]);

  const totalValue = stats.currentValue + (profile?.balance || 0);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Portfolio</h1>
              <p className="text-slate-400 mt-1">Track your investments and performance</p>
            </div>
            <Link to="/market">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                Trade Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Value</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatCurrency(totalValue)}
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
                    <p className="text-slate-400 text-sm">Invested</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatCurrency(stats.totalInvestment)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total P&L</p>
                    <p className={`text-2xl font-bold mt-1 ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats.totalPnl >= 0 ? '+' : ''}{formatCurrency(stats.totalPnl)}
                    </p>
                    <p className={`text-sm ${stats.totalPnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPercentage(stats.totalPnlPercent)}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.totalPnl >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {stats.totalPnl >= 0 ? (
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
                      {stats.totalHoldings}
                    </p>
                    <p className="text-sm text-slate-500">
                      {stats.totalQuantity} shares
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Holdings Table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Your Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading portfolio...</div>
              ) : portfolio.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <PieChart className="h-8 w-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No holdings yet</h3>
                  <p className="text-slate-400 mb-6">Start building your portfolio by trading stocks</p>
                  <Link to="/market">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Explore Market
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Stock</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Qty</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Avg Price</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Current</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Value</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((item) => (
                        <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-4 px-4">
                            <Link to={`/stock/${item.symbol}`} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-400">
                                  {item.symbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-white">{item.symbol}</p>
                                <p className="text-sm text-slate-400">{item.company_name}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="text-right py-4 px-4 text-white">{item.quantity}</td>
                          <td className="text-right py-4 px-4 text-slate-400">
                            {formatCurrency(item.avg_buy_price)}
                          </td>
                          <td className="text-right py-4 px-4 text-white">
                            {formatCurrency(item.current_price || item.avg_buy_price)}
                          </td>
                          <td className="text-right py-4 px-4 text-white">
                            {formatCurrency(item.current_value || item.total_investment)}
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className={`${(item.unrealized_pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              <p>{(item.unrealized_pnl || 0) >= 0 ? '+' : ''}{formatCurrency(item.unrealized_pnl || 0)}</p>
                              <p className="text-sm">{formatPercentage(item.unrealized_pnl_percent || 0)}</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
