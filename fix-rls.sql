-- ============================================
-- APEXQUANT COMPLETE DATABASE FIX
-- Run this entire SQL in Supabase SQL Editor
-- ============================================

-- ============ WATCHLIST TABLE ============
DROP POLICY IF EXISTS "Users can view own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can insert own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can delete own watchlist" ON watchlist;
DROP POLICY IF EXISTS "watchlist_select" ON watchlist;
DROP POLICY IF EXISTS "watchlist_insert" ON watchlist;
DROP POLICY IF EXISTS "watchlist_delete" ON watchlist;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlist_select" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_insert" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_delete" ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- ============ TRANSACTIONS TABLE ============
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
DROP POLICY IF EXISTS "transactions_delete" ON transactions;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- ============ PORTFOLIO TABLE ============
DROP POLICY IF EXISTS "Users can view own portfolio" ON portfolio;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON portfolio;
DROP POLICY IF EXISTS "Users can update own portfolio" ON portfolio;
DROP POLICY IF EXISTS "Users can delete own portfolio" ON portfolio;
DROP POLICY IF EXISTS "portfolio_select" ON portfolio;
DROP POLICY IF EXISTS "portfolio_insert" ON portfolio;
DROP POLICY IF EXISTS "portfolio_update" ON portfolio;
DROP POLICY IF EXISTS "portfolio_delete" ON portfolio;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio_select" ON portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "portfolio_insert" ON portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolio_update" ON portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "portfolio_delete" ON portfolio FOR DELETE USING (auth.uid() = user_id);

-- ============ PROFILES TABLE ============
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
