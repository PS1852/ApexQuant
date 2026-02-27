// Fix RLS policies using Supabase Management API via dashboard cookies
// Alternative: Use supabase-js service role to verify + the browser to run SQL

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zmaznekngvjrukzyvikg.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDI5NjI1OSwiZXhwIjoyMDU1ODcyMjU5fQ.otHCWI3YWLAysv0AqiMjVBMR5Nm_ElKfdfDLJF0MTIE';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testInserts() {
    const testUserId = '00000000-0000-0000-0000-000000000001';

    // Test 1: Can service role insert into transactions?
    console.log('\n=== Testing transactions table ===');
    const { data: txn, error: txnErr } = await supabase
        .from('transactions')
        .insert({ user_id: testUserId, symbol: 'TEST', type: 'BUY', shares: 1, price: 100, amount: 100 })
        .select()
        .single();

    if (txnErr) {
        console.log('❌ Transaction insert failed:', txnErr.message);
        console.log('   Code:', txnErr.code, 'Details:', txnErr.details);
    } else {
        console.log('✅ Transaction insert OK, cleaning up...');
        await supabase.from('transactions').delete().eq('id', txn.id);
    }

    // Test 2: Can service role insert into portfolio?
    console.log('\n=== Testing portfolio table ===');
    const { data: port, error: portErr } = await supabase
        .from('portfolio')
        .insert({ user_id: testUserId, symbol: 'TEST', shares: 1, average_price: 100 })
        .select()
        .single();

    if (portErr) {
        console.log('❌ Portfolio insert failed:', portErr.message);
        console.log('   Code:', portErr.code, 'Details:', portErr.details);
    } else {
        console.log('✅ Portfolio insert OK, cleaning up...');
        await supabase.from('portfolio').delete().eq('id', port.id);
    }

    // Test 3: Can service role read profiles?
    console.log('\n=== Testing profiles table ===');
    const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, email, balance')
        .limit(3);

    if (profErr) {
        console.log('❌ Profile read failed:', profErr.message);
    } else {
        console.log('✅ Profiles readable, count:', profiles?.length);
        profiles?.forEach(p => console.log(`   ${p.email}: ₹${p.balance}`));
    }

    // Check what columns exist on each table
    console.log('\n=== Checking table structures ===');

    const { data: txnCols } = await supabase.from('transactions').select('*').limit(0);
    console.log('transactions columns available (no error = table exists)');

    const { data: portCols } = await supabase.from('portfolio').select('*').limit(0);
    console.log('portfolio columns available (no error = table exists)');

    console.log('\n=== Done ===');
    console.log('If service role inserts work but user inserts fail,');
    console.log('the RLS policies need to be fixed via Supabase SQL Editor.');
    console.log('\nPaste this SQL into the SQL Editor:\n');

    const sql = `-- Fix transactions RLS
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
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);`;

    console.log(sql);
}

testInserts().catch(console.error);
