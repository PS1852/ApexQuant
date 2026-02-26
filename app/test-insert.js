const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmaznekngvjrukzyvikg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg0MjY2OSwiZXhwIjoyMDg3NDE4NjY5fQ.b-KiPK-RlggU2z7iFFRxCYPnHq0GmVH2Z85h4BCe8lI';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testInsert() {
    console.log('Testing insert into watchlist...');

    // Attempt insert with company_name
    const res1 = await supabase.from('watchlist').insert({ user_id: '123e4567-e89b-12d3-a456-426614174000', symbol: 'TEST', company_name: 'TEST', exchange: 'TEST' });
    console.log('Result 1 (with columns):', res1.error);

    // Attempt insert without extra columns
    const res2 = await supabase.from('watchlist').insert({ user_id: '123e4567-e89b-12d3-a456-426614174000', symbol: 'TEST2' });
    console.log('Result 2 (without columns):', res2.error);
}

testInsert();
