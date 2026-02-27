-- =============================================
-- DIAGNOSTIC: Shows current RLS policies
-- Run this FIRST and tell me the output
-- =============================================
SELECT 
  tablename AS "Table",
  policyname AS "Policy Name",
  permissive AS "Type",
  cmd AS "Command",
  qual AS "USING Condition",
  with_check AS "WITH CHECK"
FROM pg_policies 
WHERE tablename IN ('profiles', 'portfolio', 'transactions', 'watchlist')
ORDER BY tablename, cmd;
