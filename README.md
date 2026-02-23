# ApexQuant - Virtual Stock Trading Platform

A professional-grade stock trading simulation web application with real-time market data, portfolio management, and virtual trading capabilities.

![ApexQuant](public/logo.svg)

## Features

- **Virtual Trading**: Start with ₹2,000 virtual money and practice trading without risk
- **Real-time Data**: Live stock prices from NSE, BSE, and US markets
- **Portfolio Management**: Track your holdings, P&L, and performance
- **Watchlist**: Monitor your favorite stocks
- **Transaction History**: Complete record of all your trades
- **User Authentication**: Email/password and Google OAuth login
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL Database)
- **Stock Data**: Yahoo Finance API (Free)
- **Deployment**: Static hosting (Vercel/Netlify compatible)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd apexquant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to the SQL Editor
3. Run the schema from `supabase_schema.sql`
4. Copy your project URL and anon key

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set Up Google OAuth (Optional)

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your Google Client ID and Secret
4. Add redirect URL: `https://your-domain.com/auth/callback`

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 7. Build for Production

```bash
npm run build
```

The `dist` folder will contain the production build.

## Database Schema

The application uses the following tables:

- **profiles**: User profiles with balance and settings
- **portfolio**: User stock holdings
- **transactions**: Buy/sell transaction history
- **watchlist**: User's watched stocks
- **stocks**: Static stock information for search

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Project Structure

```
apexquant/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries (Supabase)
│   ├── pages/           # Page components
│   ├── services/        # Business logic (stocks, trading)
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── supabase_schema.sql  # Database schema
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Authentication
- Email/password signup and login
- Google OAuth integration
- Session persistence
- Protected routes

### Stock Trading
- Search stocks by symbol or company name
- Real-time price updates
- Buy/Sell with quantity validation
- Automatic USD to INR conversion for US stocks
- Balance validation to prevent negative balance

### Portfolio
- Real-time portfolio valuation
- Unrealized P&L calculation
- Average buy price tracking
- Holdings overview

### Watchlist
- Add/remove stocks from watchlist
- Real-time price updates
- Quick access to stock details

### Transactions
- Complete transaction history
- Filter by buy/sell
- Realized P&L tracking

## API Rate Limits

The application uses Yahoo Finance API which has rate limits. For production use with many users, consider:
- Implementing caching
- Using a paid stock data provider
- Adding rate limiting on your backend

## Security

- Row Level Security (RLS) on all database tables
- User authentication required for all trading operations
- Input validation on all forms
- XSS protection through React's built-in protections

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Disclaimer

This is a virtual trading platform for educational purposes only. No real money is involved. Stock prices are for simulation purposes and may have delays.

## Support

For issues or feature requests, please open an issue on GitHub.

---

Built with ❤️ by the ApexQuant Team
