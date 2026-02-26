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
    console.log('\n📊 Fetching NSE equity list...');

    // NSE top stocks - comprehensive list of ~200+ actively traded stocks
    // The official NSE CSV endpoint often blocks automated requests,
    // so we use a curated comprehensive list of NSE-listed equities
    const nseStocks = [
        // NIFTY 50
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy' },
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking' },
        { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking' },
        { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG' },
        { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking' },
        { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom' },
        { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG' },
        { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking' },
        { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Construction' },
        { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking' },
        { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Consumer' },
        { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Auto' },
        { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer' },
        { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma' },
        { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Finance' },
        { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT' },
        { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG' },
        { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement' },
        { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Auto' },
        { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Conglomerate' },
        { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', sector: 'Power' },
        { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Power' },
        { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Mining' },
        { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'Finance' },
        { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT' },
        { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Ltd', sector: 'Energy' },
        { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Metals' },
        { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Metals' },
        { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT' },
        { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', sector: 'Banking' },
        { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd', sector: 'Infrastructure' },
        { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Auto' },
        { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories Ltd", sector: 'Pharma' },
        { symbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharma' },
        { symbol: 'DIVISLAB', name: "Divi's Laboratories Ltd", sector: 'Pharma' },
        { symbol: 'GRASIM', name: 'Grasim Industries Ltd', sector: 'Cement' },
        { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Auto' },
        { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd', sector: 'Energy' },
        { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd', sector: 'Healthcare' },
        { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Auto' },
        { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', sector: 'FMCG' },
        { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd', sector: 'Insurance' },
        { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd', sector: 'Insurance' },
        { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', sector: 'Metals' },
        { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd', sector: 'FMCG' },
        { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', sector: 'Auto' },
        { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT' },
        { symbol: 'UPL', name: 'UPL Ltd', sector: 'Chemicals' },
        // NIFTY NEXT 50
        { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd', sector: 'Energy' },
        { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd', sector: 'Cement' },
        { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Banking' },
        { symbol: 'BERGEPAINT', name: 'Berger Paints India Ltd', sector: 'Consumer' },
        { symbol: 'BIOCON', name: 'Biocon Ltd', sector: 'Pharma' },
        { symbol: 'BOSCHLTD', name: 'Bosch Ltd', sector: 'Auto' },
        { symbol: 'CANBK', name: 'Canara Bank', sector: 'Banking' },
        { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment and Finance Company Ltd', sector: 'Finance' },
        { symbol: 'COLPAL', name: 'Colgate-Palmolive (India) Ltd', sector: 'FMCG' },
        { symbol: 'DLF', name: 'DLF Ltd', sector: 'Real Estate' },
        { symbol: 'DABUR', name: 'Dabur India Ltd', sector: 'FMCG' },
        { symbol: 'GAIL', name: 'GAIL (India) Ltd', sector: 'Energy' },
        { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd', sector: 'FMCG' },
        { symbol: 'HAVELLS', name: 'Havells India Ltd', sector: 'Consumer Durables' },
        { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life Insurance Company Ltd', sector: 'Insurance' },
        { symbol: 'ICICIGI', name: 'ICICI Lombard General Insurance Company Ltd', sector: 'Insurance' },
        { symbol: 'IOC', name: 'Indian Oil Corporation Ltd', sector: 'Energy' },
        { symbol: 'IRCTC', name: 'Indian Railway Catering and Tourism Corporation Ltd', sector: 'Tourism' },
        { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd', sector: 'Aviation' },
        { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power Ltd', sector: 'Metals' },
        { symbol: 'JUBLFOOD', name: 'Jubilant FoodWorks Ltd', sector: 'Consumer' },
        { symbol: 'LUPIN', name: 'Lupin Ltd', sector: 'Pharma' },
        { symbol: 'MARICO', name: 'Marico Ltd', sector: 'FMCG' },
        { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd', sector: 'Finance' },
        { symbol: 'NAUKRI', name: 'Info Edge (India) Ltd', sector: 'IT' },
        { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd', sector: 'Chemicals' },
        { symbol: 'PEL', name: 'Piramal Enterprises Ltd', sector: 'Finance' },
        { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Banking' },
        { symbol: 'SAIL', name: 'Steel Authority of India Ltd', sector: 'Metals' },
        { symbol: 'SHREECEM', name: 'Shree Cement Ltd', sector: 'Cement' },
        { symbol: 'SIEMENS', name: 'Siemens Ltd', sector: 'Industrial' },
        { symbol: 'SRF', name: 'SRF Ltd', sector: 'Chemicals' },
        { symbol: 'TATAPOWER', name: 'Tata Power Company Ltd', sector: 'Power' },
        { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals Ltd', sector: 'Pharma' },
        { symbol: 'TRENT', name: 'Trent Ltd', sector: 'Retail' },
        { symbol: 'VEDL', name: 'Vedanta Ltd', sector: 'Mining' },
        { symbol: 'VOLTAS', name: 'Voltas Ltd', sector: 'Consumer Durables' },
        { symbol: 'ZOMATO', name: 'Zomato Ltd', sector: 'Consumer' },
        { symbol: 'PAYTM', name: 'One97 Communications Ltd (Paytm)', sector: 'Fintech' },
        { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Ltd (Nykaa)', sector: 'E-Commerce' },
        { symbol: 'POLICYBZR', name: 'PB Fintech Ltd (PolicyBazaar)', sector: 'Fintech' },
        { symbol: 'DELHIVERY', name: 'Delhivery Ltd', sector: 'Logistics' },
        { symbol: 'LTIM', name: 'LTIMindtree Ltd', sector: 'IT' },
        { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd', sector: 'IT' },
        { symbol: 'COFORGE', name: 'Coforge Ltd', sector: 'IT' },
        { symbol: 'MPHASIS', name: 'Mphasis Ltd', sector: 'IT' },
        // Mid-cap popular
        { symbol: 'IRFC', name: 'Indian Railway Finance Corporation Ltd', sector: 'Finance' },
        { symbol: 'IDEA', name: 'Vodafone Idea Ltd', sector: 'Telecom' },
        { symbol: 'YESBANK', name: 'Yes Bank Ltd', sector: 'Banking' },
        { symbol: 'SUZLON', name: 'Suzlon Energy Ltd', sector: 'Energy' },
        { symbol: 'NHPC', name: 'NHPC Ltd', sector: 'Power' },
        { symbol: 'PFC', name: 'Power Finance Corporation Ltd', sector: 'Finance' },
        { symbol: 'RECLTD', name: 'REC Ltd', sector: 'Finance' },
        { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd', sector: 'Defence' },
        { symbol: 'BEL', name: 'Bharat Electronics Ltd', sector: 'Defence' },
        { symbol: 'BHEL', name: 'Bharat Heavy Electricals Ltd', sector: 'Industrial' },
        { symbol: 'LICI', name: 'Life Insurance Corporation of India', sector: 'Insurance' },
        { symbol: 'ADANIPOWER', name: 'Adani Power Ltd', sector: 'Power' },
        { symbol: 'TVSMOTOR', name: 'TVS Motor Company Ltd', sector: 'Auto' },
        { symbol: 'MOTHERSON', name: 'Samvardhana Motherson International Ltd', sector: 'Auto' },
        { symbol: 'MAXHEALTH', name: 'Max Healthcare Institute Ltd', sector: 'Healthcare' },
        { symbol: 'MANKIND', name: 'Mankind Pharma Ltd', sector: 'Pharma' },
        { symbol: 'JSWENERGY', name: 'JSW Energy Ltd', sector: 'Power' },
        { symbol: 'PAGEIND', name: 'Page Industries Ltd', sector: 'Textiles' },
        { symbol: 'DIXON', name: 'Dixon Technologies (India) Ltd', sector: 'Electronics' },
        { symbol: 'ABCAPITAL', name: 'Aditya Birla Capital Ltd', sector: 'Finance' },
        { symbol: 'FEDERALBNK', name: 'Federal Bank Ltd', sector: 'Banking' },
        { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd', sector: 'Banking' },
        { symbol: 'BANDHANBNK', name: 'Bandhan Bank Ltd', sector: 'Banking' },
        { symbol: 'AUBANK', name: 'AU Small Finance Bank Ltd', sector: 'Banking' },
        { symbol: 'CROMPTON', name: 'Crompton Greaves Consumer Electricals Ltd', sector: 'Consumer Durables' },
        { symbol: 'ASTRAL', name: 'Astral Ltd', sector: 'Industrial' },
        { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Ltd', sector: 'Chemicals' },
        { symbol: 'ATUL', name: 'Atul Ltd', sector: 'Chemicals' },
        { symbol: 'PIIND', name: 'PI Industries Ltd', sector: 'Chemicals' },
        { symbol: 'LTTS', name: 'L&T Technology Services Ltd', sector: 'IT' },
        { symbol: 'MFSL', name: 'Max Financial Services Ltd', sector: 'Finance' },
        { symbol: 'POLYCAB', name: 'Polycab India Ltd', sector: 'Industrial' },
        { symbol: 'ABB', name: 'ABB India Ltd', sector: 'Industrial' },
        { symbol: 'CUMMINSIND', name: 'Cummins India Ltd', sector: 'Industrial' },
        { symbol: 'HONAUT', name: 'Honeywell Automation India Ltd', sector: 'Industrial' },
        { symbol: 'CONCOR', name: 'Container Corporation of India Ltd', sector: 'Logistics' },
        { symbol: 'ESCORT', name: 'Escorts Kubota Ltd', sector: 'Auto' },
        { symbol: 'INDHOTEL', name: 'Indian Hotels Company Ltd', sector: 'Hotels' },
    ];

    const stocksToInsert = nseStocks.map(s => ({
        symbol: s.symbol,
        name: s.name,
        exchange: 'NSE',
        market: 'IN',
        sector: s.sector || null,
        currency: 'INR',
        is_active: true,
    }));

    // Remove duplicates by symbol
    const uniqueStocks = [...new Map(stocksToInsert.map(s => [s.symbol, s])).values()];

    // Upsert in batches of 50
    for (let i = 0; i < uniqueStocks.length; i += 50) {
        const batch = uniqueStocks.slice(i, i + 50);
        await supabaseRequest('stocks', 'POST', batch);
        console.log(`  ✅ Inserted NSE batch ${Math.floor(i / 50) + 1}/${Math.ceil(uniqueStocks.length / 50)} (${batch.length} stocks)`);
    }

    console.log(`📊 Total NSE stocks inserted: ${uniqueStocks.length}`);
    return uniqueStocks.length;
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
