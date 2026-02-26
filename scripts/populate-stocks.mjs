/**
 * Populate stocks table with NSE (Indian) and US stocks
 * Run with: node scripts/populate-stocks.mjs
 */

const SUPABASE_URL = 'https://zmaznekngvjrukzyvikg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg0MjY2OSwiZXhwIjoyMDg3NDE4NjY5fQ.b-KiPK-RlggU2z7iFFRxCYPnHq0GmVH2Z85h4BCe8lI';
const FINNHUB_KEY = 'd6g2o99r01qqnmbqhvsgd6g2o99r01qqnmbqhvt0';

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
        const text = await res.text();
        throw new Error(`Supabase error ${res.status}: ${text}`);
    }
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return res.json();
    }
    return null;
}

// ============ INDIAN STOCKS (NSE) ============
async function populateNSEStocks() {
    console.log('\n📊 Fetching COMPLETE NSE equity list...');

    try {
        const response = await fetch('https://archives.nseindia.com/content/equities/EQUITY_L.csv', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch NSE CSV: ${response.status}`);

        const csvText = await response.text();
        const lines = csvText.split('\n');
        const stocksToInsert = [];

        // Skip header line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Proper CSV splitting ignoring commas inside quotes
            const parts = [];
            let current = '';
            let inQuotes = false;

            for (let j = 0; j < line.length; j++) {
                if (line[j] === '"') {
                    inQuotes = !inQuotes;
                } else if (line[j] === ',' && !inQuotes) {
                    parts.push(current);
                    current = '';
                } else {
                    current += line[j];
                }
            }
            parts.push(current);

            // parts[0] is SYMBOL, parts[1] is NAME OF COMPANY, parts[2] is SERIES
            const symbol = parts[0]?.trim();
            const companyName = parts[1]?.trim();
            const series = parts[2]?.trim();

            // We want mainly EQ (Equity) series, but include others if needed
            if (symbol && companyName && (series === 'EQ' || series === 'BE' || series === 'SM')) {
                stocksToInsert.push({
                    symbol: symbol,
                    name: companyName,
                    exchange: 'NSE',
                    market: 'IN',
                    sector: null, // the CSV doesn't cleanly define sector, so we leave it open
                    currency: 'INR',
                    is_active: true,
                });
            }
        }

        // Remove duplicates just in case
        const uniqueStocks = [...new Map(stocksToInsert.map(s => [s.symbol, s])).values()];
        console.log(`  📦 Total unique NSE stocks parsed: ${uniqueStocks.length}`);

        // Upsert in batches of 100
        for (let i = 0; i < uniqueStocks.length; i += 100) {
            const batch = uniqueStocks.slice(i, i + 100);
            await supabaseRequest('stocks', 'POST', batch);
            console.log(`  ✅ Inserted NSE batch ${Math.floor(i / 100) + 1}/${Math.ceil(uniqueStocks.length / 100)} (${batch.length} stocks)`);
        }

        console.log(`📊 Total NSE stocks inserted: ${uniqueStocks.length}`);
        return uniqueStocks.length;

    } catch (error) {
        console.error('❌ Failed to fetch NSE stocks:', error.message);
        return 0;
    }
}

// ============ US STOCKS (via Finnhub) ============
async function populateUSStocks() {
    console.log('\n🇺🇸 Fetching US stock symbols from Finnhub...');

    const res = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_KEY}`);
    if (!res.ok) throw new Error(`Finnhub API error: ${res.status}`);

    const allSymbols = await res.json();
    console.log(`  📦 Total symbols received: ${allSymbols.length}`);

    // Filter for common stocks and ETFs only
    const filtered = allSymbols.filter(s =>
        s.type === 'Common Stock' || s.type === 'ETP'
    );
    console.log(`  🔍 After filtering (Common Stock + ETP): ${filtered.length}`);

    const stocksToInsert = filtered.map(s => ({
        symbol: s.symbol,
        name: s.description || s.displaySymbol || s.symbol,
        exchange: s.mic || 'US',
        market: 'US',
        sector: null,
        currency: s.currency || 'USD',
        is_active: true,
    }));

    // Upsert in batches of 100
    let inserted = 0;
    for (let i = 0; i < stocksToInsert.length; i += 100) {
        const batch = stocksToInsert.slice(i, i + 100);
        try {
            await supabaseRequest('stocks', 'POST', batch);
            inserted += batch.length;
            console.log(`  ✅ Inserted US batch ${Math.floor(i / 100) + 1}/${Math.ceil(stocksToInsert.length / 100)} (${inserted} total)`);
        } catch (err) {
            console.error(`  ⚠️ Batch ${Math.floor(i / 100) + 1} error:`, err.message);
        }
    }

    console.log(`🇺🇸 Total US stocks inserted: ${inserted}`);
    return inserted;
}

// ============ ALSO UPDATE EXISTING stocks TABLE SCHEMA ============
async function ensureStocksTable() {
    console.log('🔧 Ensuring stocks table has correct schema...');
    // The stocks table might already exist with different columns from before.
    // We'll try inserting a test record to check.
    try {
        const test = { symbol: '__TEST__', name: 'Test', exchange: 'TEST', market: 'TEST', currency: 'USD', is_active: false };
        await supabaseRequest('stocks', 'POST', [test]);
        // Clean up
        await fetch(`${SUPABASE_URL}/rest/v1/stocks?symbol=eq.__TEST__`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            }
        });
        console.log('  ✅ stocks table schema is compatible');
    } catch (e) {
        console.error('  ❌ stocks table may need migration:', e.message);
        console.log('  ℹ️  You may need to recreate the stocks table with the new schema.');
    }
}

// ============ MAIN ============
async function main() {
    console.log('🚀 ApexQuant Stock Population Script');
    console.log('====================================\n');

    await ensureStocksTable();

    const nseCount = await populateNSEStocks();
    const usCount = await populateUSStocks();

    console.log('\n====================================');
    console.log(`✅ DONE! Total stocks: ${nseCount + usCount}`);
    console.log(`   🇮🇳 Indian (NSE): ${nseCount}`);
    console.log(`   🇺🇸 US: ${usCount}`);
    console.log('====================================');
}

main().catch(console.error);
