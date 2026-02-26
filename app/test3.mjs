import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmaznekngvjrukzyvikg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg0MjY2OSwiZXhwIjoyMDg3NDE4NjY5fQ.b-KiPK-RlggU2z7iFFRxCYPnHq0GmVH2Z85h4BCe8lI';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testTradeFlow() {
    const userId = '112abdc3-3116-43dd-adcf-8d1cead214f4'; // let's get a random real user id
    const { data: user } = await supabase.from('profiles').select('*').limit(1).single();

    if (!user) {
        console.log('No user found');
        return;
    }

    console.log('Using test user:', user.id);

    // Try adding to watchlist
    const wd = await supabase.from('watchlist').insert({ user_id: user.id, symbol: 'AAPL' }).select();
    console.log('Watchlist insert:', wd);

    // Try creating a transaction
    const td = await supabase.from('transactions').insert({
        user_id: user.id,
        symbol: 'AAPL',
        type: 'BUY',
        shares: 10,
        price: 150.0,
        amount: 1500.0,
    }).select();
    console.log('Transaction insert:', td);

    // Try creating a portfolio
    const pd = await supabase.from('portfolio').insert({
        user_id: user.id,
        symbol: 'AAPL',
        shares: 10,
        average_price: 150.0,
    }).select();
    console.log('Portfolio insert:', pd);

    // Cleanup
    if (wd.data) await supabase.from('watchlist').delete().eq('id', wd.data[0].id);
    if (td.data) await supabase.from('transactions').delete().eq('id', td.data[0].id);
    if (pd.data) await supabase.from('portfolio').delete().eq('id', pd.data[0].id);
}

testTradeFlow();
