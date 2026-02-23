import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Partial<{ full_name: string; avatar_url: string }>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Portfolio helpers
export const getPortfolio = async (userId: string) => {
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

// Transactions helpers
export const getTransactions = async (userId: string, limit: number = 100) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const createTransaction = async (transaction: {
  user_id: string;
  symbol: string;
  company_name: string;
  exchange: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  currency?: string;
}) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();
  return { data, error };
};

// Watchlist helpers
export const getWatchlist = async (userId: string) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  return { data, error };
};

export const addToWatchlist = async (item: {
  user_id: string;
  symbol: string;
  company_name: string;
  exchange: string;
}) => {
  const { data, error } = await supabase
    .from('watchlist')
    .insert([item])
    .select()
    .single();
  return { data, error };
};

export const removeFromWatchlist = async (watchlistId: string) => {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('id', watchlistId);
  return { error };
};

// Stocks search
export const searchStocks = async (query: string) => {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
    .limit(20);
  return { data, error };
};

export const getAllStocks = async () => {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('is_active', true)
    .order('symbol');
  return { data, error };
};
