import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zmaznekngvjrukzyvikg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg0MjY2OSwiZXhwIjoyMDg3NDE4NjY5fQ.b-KiPK-RlggU2z7iFFRxCYPnHq0GmVH2Z85h4BCe8lI';

async function inspectSchema() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers: { 'apikey': SUPABASE_SERVICE_KEY } });
    const specs = await res.json();
    for (const table of ['profiles', 'watchlist', 'portfolio', 'transactions']) {
        const def = specs.definitions[table];
        if (def) console.log(table + ': ' + Object.keys(def.properties || {}).join(', '));
    }
}
inspectSchema();
