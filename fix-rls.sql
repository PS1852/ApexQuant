-- ============================================
-- APEXQUANT FULL DATABASE REPAIR
-- Paste ALL of this into Supabase SQL Editor
-- ============================================

-- ========== STEP 1: ENSURE TABLES EXIST ==========
-- (Skip if tables already exist — these are CREATE IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL DEFAULT '',
  full_name TEXT DEFAULT 'Trader',
  avatar_url TEXT,
  balance NUMERIC(12,2) NOT NULL DEFAULT 2000.00,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  shares INTEGER NOT NULL DEFAULT 0,
  average_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_price NUMERIC(12,2),
  current_value NUMERIC(12,2),
  unrealized_pnl NUMERIC(12,2),
  unrealized_pnl_percent NUMERIC(8,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
  shares INTEGER NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);


-- ========== STEP 2: ENABLE RLS ON ALL TABLES ==========
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;


-- ========== STEP 3: DROP ALL EXISTING POLICIES ==========
-- (Prevents "policy already exists" errors)

-- Profiles
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_select" ON profiles;
  DROP POLICY IF EXISTS "profiles_insert" ON profiles;
  DROP POLICY IF EXISTS "profiles_update" ON profiles;
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
  DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;
  DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
END $$;

-- Portfolio
DO $$ BEGIN
  DROP POLICY IF EXISTS "portfolio_select" ON portfolio;
  DROP POLICY IF EXISTS "portfolio_insert" ON portfolio;
  DROP POLICY IF EXISTS "portfolio_update" ON portfolio;
  DROP POLICY IF EXISTS "portfolio_delete" ON portfolio;
  DROP POLICY IF EXISTS "Users can view own portfolio" ON portfolio;
  DROP POLICY IF EXISTS "Users can insert own portfolio" ON portfolio;
  DROP POLICY IF EXISTS "Users can update own portfolio" ON portfolio;
  DROP POLICY IF EXISTS "Users can delete own portfolio" ON portfolio;
END $$;

-- Transactions
DO $$ BEGIN
  DROP POLICY IF EXISTS "transactions_select" ON transactions;
  DROP POLICY IF EXISTS "transactions_insert" ON transactions;
  DROP POLICY IF EXISTS "transactions_delete" ON transactions;
  DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
  DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
END $$;

-- Watchlist
DO $$ BEGIN
  DROP POLICY IF EXISTS "watchlist_select" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_insert" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_delete" ON watchlist;
  DROP POLICY IF EXISTS "Users can view own watchlist" ON watchlist;
  DROP POLICY IF EXISTS "Users can insert own watchlist" ON watchlist;
  DROP POLICY IF EXISTS "Users can delete own watchlist" ON watchlist;
END $$;


-- ========== STEP 4: CREATE CORRECT POLICIES ==========

-- Profiles: user can read/insert/update their OWN profile (id = auth.uid())
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Portfolio: user can CRUD their OWN portfolio items
CREATE POLICY "portfolio_select" ON portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "portfolio_insert" ON portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolio_update" ON portfolio FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolio_delete" ON portfolio FOR DELETE USING (auth.uid() = user_id);

-- Transactions: user can read/create their OWN transactions
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Watchlist: user can CRUD their OWN watchlist
CREATE POLICY "watchlist_select" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_insert" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_delete" ON watchlist FOR DELETE USING (auth.uid() = user_id);


-- ========== STEP 5: CREATE USEFUL INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_symbol ON portfolio(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_symbol ON watchlist(user_id, symbol);


-- ========== STEP 6: AUTO-UPDATE TIMESTAMPS ==========
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_portfolio_updated_at ON portfolio;
CREATE TRIGGER set_portfolio_updated_at
  BEFORE UPDATE ON portfolio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ========== DONE ==========
-- Expected result: "Success. No rows returned"
