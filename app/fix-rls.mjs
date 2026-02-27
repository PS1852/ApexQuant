import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://zmaznekngvjrukzyvikg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDI5NjI1OSwiZXhwIjoyMDU1ODcyMjU5fQ.otHCWI3YWLAysv0AqiMjVBMR5Nm_ElKfdfDLJF0MTIE'
);

async function fixRLS() {
    console.log('=== Fixing RLS policies for watchlist and transactions ===');

    // 1. Drop existing policies and recreate correct ones for watchlist
    const queries = [
        // ---- WATCHLIST ----
        `DROP POLICY IF EXISTS "Users can view own watchlist" ON watchlist;`,
        `DROP POLICY IF EXISTS "Users can insert own watchlist" ON watchlist;`,
        `DROP POLICY IF EXISTS "Users can delete own watchlist" ON watchlist;`,
        `DROP POLICY IF EXISTS "watchlist_select" ON watchlist;`,
        `DROP POLICY IF EXISTS "watchlist_insert" ON watchlist;`,
        `DROP POLICY IF EXISTS "watchlist_delete" ON watchlist;`,
        // Enable RLS
        `ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;`,
        // Create correct policies
        `CREATE POLICY "watchlist_select" ON watchlist FOR SELECT USING (auth.uid() = user_id);`,
        `CREATE POLICY "watchlist_insert" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);`,
        `CREATE POLICY "watchlist_delete" ON watchlist FOR DELETE USING (auth.uid() = user_id);`,

        // ---- TRANSACTIONS ----
        `DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;`,
        `DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;`,
        `DROP POLICY IF EXISTS "transactions_select" ON transactions;`,
        `DROP POLICY IF EXISTS "transactions_insert" ON transactions;`,
        // Enable RLS
        `ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;`,
        // Create correct policies
        `CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id);`,
        `CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);`,

        // ---- PORTFOLIO ----
        `DROP POLICY IF EXISTS "Users can view own portfolio" ON portfolio;`,
        `DROP POLICY IF EXISTS "Users can insert own portfolio" ON portfolio;`,
        `DROP POLICY IF EXISTS "Users can update own portfolio" ON portfolio;`,
        `DROP POLICY IF EXISTS "Users can delete own portfolio" ON portfolio;`,
        `DROP POLICY IF EXISTS "portfolio_select" ON portfolio;`,
        `DROP POLICY IF EXISTS "portfolio_insert" ON portfolio;`,
        `DROP POLICY IF EXISTS "portfolio_update" ON portfolio;`,
        `DROP POLICY IF EXISTS "portfolio_delete" ON portfolio;`,
        // Enable RLS
        `ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;`,
        // Create correct policies
        `CREATE POLICY "portfolio_select" ON portfolio FOR SELECT USING (auth.uid() = user_id);`,
        `CREATE POLICY "portfolio_insert" ON portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);`,
        `CREATE POLICY "portfolio_update" ON portfolio FOR UPDATE USING (auth.uid() = user_id);`,
        `CREATE POLICY "portfolio_delete" ON portfolio FOR DELETE USING (auth.uid() = user_id);`,

        // ---- PROFILES ----
        `DROP POLICY IF EXISTS "Users can view own profile" ON profiles;`,
        `DROP POLICY IF EXISTS "Users can update own profile" ON profiles;`,
        `DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;`,
        `DROP POLICY IF EXISTS "profiles_select" ON profiles;`,
        `DROP POLICY IF EXISTS "profiles_insert" ON profiles;`,
        `DROP POLICY IF EXISTS "profiles_update" ON profiles;`,
        // Enable RLS
        `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
        // Create correct policies
        `CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);`,
        `CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`,
        `CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);`,
    ];

    for (const sql of queries) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).maybeSingle();
        if (error) {
            // Fallback: try raw SQL via postgrest
            console.log(`  Trying via direct query: ${sql.slice(0, 60)}...`);
        }
    }

    // Combine all into one big query
    const megaSQL = queries.join('\n');
    console.log('\nRunning combined SQL via rest...');

    const res = await fetch('https://zmaznekngvjrukzyvikg.supabase.co/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDI5NjI1OSwiZXhwIjoyMDU1ODcyMjU5fQ.otHCWI3YWLAysv0AqiMjVBMR5Nm_ElKfdfDLJF0MTIE',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDI5NjI1OSwiZXhwIjoyMDU1ODcyMjU5fQ.otHCWI3YWLAysv0AqiMjVBMR5Nm_ElKfdfDLJF0MTIE',
        },
        body: JSON.stringify({ sql_query: megaSQL }),
    });

    if (!res.ok) {
        console.log('RPC not available, will use Supabase Dashboard SQL Editor.');
        console.log('\n=== COPY THIS SQL INTO SUPABASE SQL EDITOR ===\n');
        console.log(megaSQL);
        console.log('\n=== END SQL ===');
    } else {
        console.log('RLS policies fixed successfully!');
    }
}

fixRLS().catch(console.error);
