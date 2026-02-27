import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  History,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/services/stockService';
import { Link } from 'react-router-dom';

export default function Transactions() {
  const { transactions, loading, stats } = useTransactions(100);
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const filteredTransactions = transactions.filter(t =>
    filter === 'ALL' || t.type === filter
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <History className="h-8 w-8 text-blue-400" />
                Transactions
              </h1>
              <p className="text-slate-400 mt-1">View your complete trading history</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Buy Value</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">
                      {formatCurrency(stats.totalBuyValue)}
                    </p>
                    <p className="text-sm text-slate-500">{stats.buyCount} orders</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Sell Value</p>
                    <p className="text-xl font-bold text-red-400 mt-1">
                      {formatCurrency(stats.totalSellValue)}
                    </p>
                    <p className="text-sm text-slate-500">{stats.sellCount} orders</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Realized P&L</p>
                    <p className={`text-xl font-bold mt-1 ${stats.totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats.totalRealizedPnl >= 0 ? '+' : ''}{formatCurrency(stats.totalRealizedPnl)}
                    </p>
                    <p className="text-sm text-slate-500">From sell orders</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.totalRealizedPnl >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <History className={`h-6 w-6 ${stats.totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Transaction History</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('ALL')}
                  className={filter === 'ALL' ? 'bg-blue-600' : 'border-slate-700'}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'BUY' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('BUY')}
                  className={filter === 'BUY' ? 'bg-emerald-600' : 'border-slate-700'}
                >
                  Buy
                </Button>
                <Button
                  variant={filter === 'SELL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('SELL')}
                  className={filter === 'SELL' ? 'bg-red-600' : 'border-slate-700'}
                >
                  Sell
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <History className="h-8 w-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No transactions yet</h3>
                  <p className="text-slate-400 mb-6">Start trading to see your transaction history</p>
                  <Link to="/market">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Start Trading
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Stock</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Quantity</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Price</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Total</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-4 px-4 text-slate-400">
                            {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            <br />
                            <span className="text-xs">
                              {new Date(transaction.created_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                              }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-white">{transaction.symbol}</p>
                          </td>
                          <td className="text-right py-4 px-4 text-white">{transaction.shares}</td>
                          <td className="text-right py-4 px-4 text-slate-400">
                            {formatCurrency(transaction.price)}
                          </td>
                          <td className="text-right py-4 px-4 text-white font-medium">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="text-right py-4 px-4">
                            <span className="text-slate-500">-</span>
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
