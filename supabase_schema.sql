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

-- Function to update portfolio after transaction
CREATE OR REPLACE FUNCTION public.handle_transaction()
RETURNS TRIGGER AS $$
DECLARE
    existing_portfolio RECORD;
    new_avg_price DECIMAL(15, 4);
    new_quantity INTEGER;
    new_total_investment DECIMAL(15, 4);
BEGIN
    -- Get existing portfolio entry
    SELECT * INTO existing_portfolio 
    FROM public.portfolio 
    WHERE user_id = NEW.user_id AND symbol = NEW.symbol;
    
    IF NEW.transaction_type = 'BUY' THEN
        IF existing_portfolio IS NOT NULL THEN
            -- Update existing position
            new_quantity := existing_portfolio.quantity + NEW.quantity;
            new_total_investment := existing_portfolio.total_investment + NEW.total_amount;
            new_avg_price := new_total_investment / new_quantity;
            
            UPDATE public.portfolio SET
                quantity = new_quantity,
                avg_buy_price = new_avg_price,
                total_investment = new_total_investment,
                last_updated = NOW()
            WHERE id = existing_portfolio.id;
        ELSE
            -- Create new position
            INSERT INTO public.portfolio (
                user_id, symbol, company_name, exchange, 
                quantity, avg_buy_price, total_investment,
                current_price, current_value
            ) VALUES (
                NEW.user_id, NEW.symbol, NEW.company_name, NEW.exchange,
                NEW.quantity, NEW.price, NEW.total_amount,
                NEW.price, NEW.total_amount
            );
        END IF;
        
        -- Deduct from balance
        UPDATE public.profiles 
        SET balance = balance - NEW.total_amount,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
    ELSIF NEW.transaction_type = 'SELL' THEN
        IF existing_portfolio IS NOT NULL AND existing_portfolio.quantity >= NEW.quantity THEN
            -- Calculate realized P&L
            NEW.realized_pnl := (NEW.price - existing_portfolio.avg_buy_price) * NEW.quantity;
            
            -- Update portfolio
            new_quantity := existing_portfolio.quantity - NEW.quantity;
            
            IF new_quantity > 0 THEN
                UPDATE public.portfolio SET
                    quantity = new_quantity,
                    total_investment = existing_portfolio.avg_buy_price * new_quantity,
                    last_updated = NOW()
                WHERE id = existing_portfolio.id;
            ELSE
                DELETE FROM public.portfolio 
                WHERE id = existing_portfolio.id;
            END IF;
            
            -- Add to balance
            UPDATE public.profiles 
            SET balance = balance + NEW.total_amount,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        ELSE
            RAISE EXCEPTION 'Insufficient shares to sell';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON public.portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_symbol ON public.portfolio(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);

-- =====================================================
-- INITIAL DATA (Optional - Sample stocks for reference)
-- =====================================================
-- This table stores static stock information for search
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
('ULTRACEMCO.NS', 'UltraTech Cement Ltd.', 'NSE', 'Cement', 'IN')
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
('INTC', 'Intel Corporation', 'NASDAQ', 'Technology', 'US')
ON CONFLICT (symbol) DO NOTHING;
