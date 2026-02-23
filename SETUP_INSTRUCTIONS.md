# ApexQuant - Complete Setup Instructions

## 🚀 Live Demo
**Your application is deployed at:** https://ialvfxwgywrl6.ok.kimi.link

---

## 📋 Pre-Configured Settings

Your Supabase project is already configured with:
- **Project URL**: https://zmaznekngvjrkzyvikg.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDI2NjksImV4cCI6MjA4NzQxODY2OX0.wO2NdOyH2K9eMEwRX4qwlmy8Ucf3QZszEHAelaxukuc

---

## 🗄️ Step 1: Set Up Database Schema

1. Go to your Supabase Dashboard: https://app.supabase.com/project/zmaznekngvjrkzyvikg
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase_schema.sql` (provided below)
5. Click **Run** to execute the schema

### Database Schema (supabase_schema.sql)

```sql
-- APEXQUANT Supabase Database Schema
-- Complete schema with Row Level Security policies

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    balance DECIMAL(15, 2) DEFAULT 2000.00,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- PORTFOLIO TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    exchange TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    avg_buy_price DECIMAL(15, 4) NOT NULL,
    total_investment DECIMAL(15, 4) NOT NULL,
    current_price DECIMAL(15, 4),
    current_value DECIMAL(15, 4),
    unrealized_pnl DECIMAL(15, 4) DEFAULT 0,
    unrealized_pnl_percent DECIMAL(8, 4) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Enable RLS on portfolio
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Portfolio RLS Policies
CREATE POLICY "Users can view own portfolio" 
    ON public.portfolio FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio" 
    ON public.portfolio FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio" 
    ON public.portfolio FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio" 
    ON public.portfolio FOR DELETE 
    USING (auth.uid() = user_id);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    exchange TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL,
    price DECIMAL(15, 4) NOT NULL,
    total_amount DECIMAL(15, 4) NOT NULL,
    realized_pnl DECIMAL(15, 4) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions RLS Policies
CREATE POLICY "Users can view own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- WATCHLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    exchange TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Enable RLS on watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Watchlist RLS Policies
CREATE POLICY "Users can view own watchlist" 
    ON public.watchlist FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist" 
    ON public.watchlist FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" 
    ON public.watchlist FOR DELETE 
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, balance, currency)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        2000.00,
        'INR'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON public.portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_symbol ON public.portfolio(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);

-- =====================================================
-- INITIAL DATA (Sample stocks for reference)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.stocks (
    symbol TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    exchange TEXT NOT NULL,
    sector TEXT,
    country TEXT DEFAULT 'IN',
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on stocks (read-only for users)
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stocks" 
    ON public.stocks FOR SELECT 
    TO authenticated, anon
    USING (true);

-- Insert sample Indian stocks
INSERT INTO public.stocks (symbol, company_name, exchange, sector, country) VALUES
('RELIANCE.NS', 'Reliance Industries Ltd.', 'NSE', 'Energy', 'IN'),
('TCS.NS', 'Tata Consultancy Services Ltd.', 'NSE', 'IT', 'IN'),
('HDFCBANK.NS', 'HDFC Bank Ltd.', 'NSE', 'Banking', 'IN'),
('INFY.NS', 'Infosys Ltd.', 'NSE', 'IT', 'IN'),
('ICICIBANK.NS', 'ICICI Bank Ltd.', 'NSE', 'Banking', 'IN'),
('HINDUNILVR.NS', 'Hindustan Unilever Ltd.', 'NSE', 'FMCG', 'IN'),
('SBIN.NS', 'State Bank of India', 'NSE', 'Banking', 'IN'),
('BHARTIARTL.NS', 'Bharti Airtel Ltd.', 'NSE', 'Telecom', 'IN'),
('ITC.NS', 'ITC Ltd.', 'NSE', 'FMCG', 'IN'),
('KOTAKBANK.NS', 'Kotak Mahindra Bank Ltd.', 'NSE', 'Banking', 'IN'),
('LT.NS', 'Larsen & Toubro Ltd.', 'NSE', 'Construction', 'IN'),
('AXISBANK.NS', 'Axis Bank Ltd.', 'NSE', 'Banking', 'IN'),
('ASIANPAINT.NS', 'Asian Paints Ltd.', 'NSE', 'Consumer', 'IN'),
('MARUTI.NS', 'Maruti Suzuki India Ltd.', 'NSE', 'Auto', 'IN'),
('TITAN.NS', 'Titan Company Ltd.', 'NSE', 'Consumer', 'IN'),
('SUNPHARMA.NS', 'Sun Pharmaceutical Industries Ltd.', 'NSE', 'Pharma', 'IN'),
('BAJFINANCE.NS', 'Bajaj Finance Ltd.', 'NSE', 'Finance', 'IN'),
('WIPRO.NS', 'Wipro Ltd.', 'NSE', 'IT', 'IN'),
('NESTLEIND.NS', 'Nestle India Ltd.', 'NSE', 'FMCG', 'IN'),
('ULTRACEMCO.NS', 'UltraTech Cement Ltd.', 'NSE', 'Cement', 'IN'),
('TATAMOTORS.NS', 'Tata Motors Ltd.', 'NSE', 'Auto', 'IN'),
('ADANIENT.NS', 'Adani Enterprises Ltd.', 'NSE', 'Conglomerate', 'IN'),
('POWERGRID.NS', 'Power Grid Corporation of India Ltd.', 'NSE', 'Power', 'IN'),
('NTPC.NS', 'NTPC Ltd.', 'NSE', 'Power', 'IN'),
('COALINDIA.NS', 'Coal India Ltd.', 'NSE', 'Mining', 'IN')
ON CONFLICT (symbol) DO NOTHING;

-- Insert sample US stocks
INSERT INTO public.stocks (symbol, company_name, exchange, sector, country) VALUES
('AAPL', 'Apple Inc.', 'NASDAQ', 'Technology', 'US'),
('MSFT', 'Microsoft Corporation', 'NASDAQ', 'Technology', 'US'),
('GOOGL', 'Alphabet Inc.', 'NASDAQ', 'Technology', 'US'),
('AMZN', 'Amazon.com Inc.', 'NASDAQ', 'Consumer', 'US'),
('TSLA', 'Tesla Inc.', 'NASDAQ', 'Auto', 'US'),
('META', 'Meta Platforms Inc.', 'NASDAQ', 'Technology', 'US'),
('NVDA', 'NVIDIA Corporation', 'NASDAQ', 'Technology', 'US'),
('NFLX', 'Netflix Inc.', 'NASDAQ', 'Entertainment', 'US'),
('AMD', 'Advanced Micro Devices Inc.', 'NASDAQ', 'Technology', 'US'),
('INTC', 'Intel Corporation', 'NASDAQ', 'Technology', 'US'),
('UBER', 'Uber Technologies Inc.', 'NYSE', 'Technology', 'US'),
('COIN', 'Coinbase Global Inc.', 'NASDAQ', 'Technology', 'US'),
('PLTR', 'Palantir Technologies Inc.', 'NYSE', 'Technology', 'US'),
('RIVN', 'Rivian Automotive Inc.', 'NASDAQ', 'Auto', 'US')
ON CONFLICT (symbol) DO NOTHING;
```

---

## 🔐 Step 2: Configure Google OAuth (Optional)

To enable "Sign in with Google":

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure consent screen if needed
6. Application type: **Web application**
7. Add authorized redirect URIs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:5173/auth/callback` (for local dev)
8. Copy Client ID and Client Secret

### Configure in Supabase:

1. Go to Supabase Dashboard > Authentication > Providers
2. Find **Google** and click **Enable**
3. Paste your Client ID and Client Secret
4. Save changes

---

## 🖥️ Step 3: Run Locally

```bash
# Navigate to project directory
cd /mnt/okcomputer/output/app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 🚀 Step 4: Deploy to Production

### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

1. Push code to GitHub
2. Go to Repository Settings > Pages
3. Select source as GitHub Actions
4. Use the provided Vite workflow

---

## 📁 Project Structure

```
apexquant/
├── public/                  # Static assets
│   ├── logo.svg            # App logo
│   ├── favicon.svg         # Favicon
│   ├── icons/              # App icons
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Reusable components
│   │   ├── Sidebar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom hooks
│   │   ├── usePortfolio.ts
│   │   ├── useTransactions.ts
│   │   └── useWatchlist.ts
│   ├── lib/                # Utilities
│   │   └── supabase.ts
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Market.tsx
│   │   ├── Watchlist.tsx
│   │   ├── Transactions.tsx
│   │   ├── Profile.tsx
│   │   ├── StockDetail.tsx
│   │   └── AuthCallback.tsx
│   ├── services/           # Business logic
│   │   ├── stockService.ts
│   │   └── tradeService.ts
│   ├── types/              # TypeScript types
│   │   ├── index.ts
│   │   └── database.ts
│   ├── App.tsx             # Main app
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables
├── index.html              # HTML template
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind config
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── supabase_schema.sql     # Database schema
```

---

## ✨ Features Implemented

### Authentication
- ✅ Email/password signup and login
- ✅ Google OAuth integration
- ✅ Session persistence
- ✅ Protected routes
- ✅ Auto profile creation on signup

### Stock Trading
- ✅ Real-time stock price fetching
- ✅ NSE, BSE, and US stock support
- ✅ Auto USD to INR conversion
- ✅ Buy/Sell with validation
- ✅ Balance validation
- ✅ Whole shares only

### Portfolio
- ✅ Real-time portfolio valuation
- ✅ Unrealized P&L tracking
- ✅ Average buy price calculation
- ✅ Holdings overview

### Watchlist
- ✅ Add/remove stocks
- ✅ Real-time price updates
- ✅ Quick trade access

### Transactions
- ✅ Complete transaction history
- ✅ Realized P&L tracking
- ✅ Filter by type

### UI/UX
- ✅ Dark theme (trading terminal style)
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

---

## 🔧 Environment Variables

Create a `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://zmaznekngvjrkzyvikg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXpuZWtuZ3ZqcnVrenl2aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDI2NjksImV4cCI6MjA4NzQxODY2OX0.wO2NdOyH2K9eMEwRX4qwlmy8Ucf3QZszEHAelaxukuc
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" errors
- Check internet connection
- Verify Supabase URL is correct
- Check browser console for CORS errors

### Issue: Google OAuth not working
- Verify redirect URLs are configured correctly
- Check Client ID and Secret are correct
- Ensure Google+ API is enabled

### Issue: Stock prices not loading
- Yahoo Finance API may be rate-limited
- Wait a few minutes and try again
- Check browser console for errors

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase logs in dashboard
3. Check browser console for errors

---

## 📄 License

MIT License - Free to use for personal and commercial projects.

---

**Happy Trading! 📈**
