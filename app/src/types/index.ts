// APEXQUANT Type Definitions

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  balance: number;
  currency?: string;
  created_at: string;
  updated_at: string;
}

export interface Stock {
  symbol: string;
  company_name: string;
  exchange: string;
  sector?: string;
  country: string;
  current_price?: number;
  change?: number;
  change_percent?: number;
  currency?: string;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  exchange: string;
  quantity: number;
  avg_buy_price: number;
  total_investment: number;
  current_price: number | null;
  current_value: number | null;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  last_updated: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  exchange: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  realized_pnl: number | null;
  currency: string;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  exchange: string;
  added_at: string;
  current_price?: number;
  change?: number;
  change_percent?: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  change_percent: number;
}

export interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradeOrder {
  symbol: string;
  company_name: string;
  exchange: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface DashboardStats {
  totalInvestment: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  availableBalance: number;
  totalPortfolioValue: number;
}
