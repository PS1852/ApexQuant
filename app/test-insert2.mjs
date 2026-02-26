import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmaznekngvjrukzyvikg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg0MjY2OSwiZXhwIjoyMDg3NDE4NjY5fQ.b-KiPK-RlggU2z7iFFRxCYPnHq0GmVH2Z85h4BCe8lI';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testInsert() {
    console.log('Testing portfolio & transactions...');

    const r1 = await supabase.from('portfolio').insert({ user_id: '123e4567-e89b-12d3-a456-426614174000', symbol: 'T', company_name: 'T', exchange: 'T', quantity: 1, avg_buy_price: 1, total_investment: 1 });
    console.log('Portfolio with company_name:', r1.error?.message);

    const r2 = await supabase.from('portfolio').insert({ user_id: '123e4567-e89b-12d3-a456-426614174000', symbol: 'T', quantity: 1, avg_buy_price: 1, total_investment: 1 });
    console.log('Portfolio without company_name:', r2.error?.message);

    const r3 = await supabase.from('transactions').insert({ user_id: '123e4567-e89b-12d3-a456-426614174000', symbol: 'T', company_name: 'T', exchange: 'T', transaction_type: 'BUY', quantity: 1, price: 1, total_amount: 1, currency: 'USD' });
    console.log('Transactions with company_name/currency:', r3.error?.message);

    const r4 = await supabase.from('transactions').insert({ user_id: '123e4567-e89b-12d3-a456-426614174000', symbol: 'T', transaction_type: 'BUY', quantity: 1, price: 1, total_amount: 1 });
    console.log('Transactions stripped:', r4.error?.message);
}

testInsert();
