-- Fix transactions RLS
DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
DROP POLICY IF EXISTS "transactions_delete" ON transactions;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Fix portfolio RLS
DROP POLICY IF EXISTS "portfolio_select" ON portfolio;
DROP POLICY IF EXISTS "portfolio_insert" ON portfolio;
DROP POLICY IF EXISTS "portfolio_update" ON portfolio;
DROP POLICY IF EXISTS "portfolio_delete" ON portfolio;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio_select" ON portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "portfolio_insert" ON portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolio_update" ON portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "portfolio_delete" ON portfolio FOR DELETE USING (auth.uid() = user_id);

-- Fix profiles RLS
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
