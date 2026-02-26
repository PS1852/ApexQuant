const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmaznekngvjrukzyvikg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg0MjY2OSwiZXhwIjoyMDg3NDE4NjY5fQ.b-KiPK-RlggU2z7iFFRxCYPnHq0GmVH2Z85h4BCe8lI';

async function supabaseRequest(endpoint, method = 'GET', body = null) {
    const opts = {
        method,
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
        },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, opts);
    if (!res.ok) {
        throw new Error(`Supabase error: ${await res.text()}`);
    }
    return res.text();
}

async function fixSchemaCache() {
    try {
        console.log('Sending NOTIFY pgrst, reload_schema via RPC or direct SQL if possible...');
        // To reload schema cache without RPC, we can just alter a table
        // But the best way is usually via the Supabase dashboard.
        // Or we can try to make a dummy RPC that does it.
    } catch (e) {
        console.error(e);
    }
}

fixSchemaCache();
