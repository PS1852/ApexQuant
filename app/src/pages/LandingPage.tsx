import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Globe, 
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchMarketIndices } from '@/services/stockService';
import type { MarketIndex } from '@/types';

export default function LandingPage() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);

  useEffect(() => {
    const loadIndices = async () => {
      const data = await fetchMarketIndices();
      setIndices(data);
    };
    loadIndices();
    const interval = setInterval(loadIndices, 30000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Data',
      description: 'Get live stock prices and market data from NSE, BSE, and US markets.',
    },
    {
      icon: Shield,
      title: 'Secure Trading',
      description: 'Bank-grade security with encrypted transactions and data protection.',
    },
    {
      icon: Zap,
      title: 'Instant Execution',
      description: 'Execute trades instantly with our high-performance trading engine.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Charts',
      description: 'Professional-grade charts with technical indicators and analysis tools.',
    },
    {
      icon: Globe,
      title: 'Global Markets',
      description: 'Trade Indian and US stocks from a single unified platform.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Trade on the go with our responsive mobile-first design.',
    },
  ];

  const stats = [
    { value: '₹2000', label: 'Virtual Starting Balance' },
    { value: '50+', label: 'Stocks Available' },
    { value: '0%', label: 'Commission Fees' },
    { value: '24/7', label: 'Market Access' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="ApexQuant" className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                ApexQuant
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Market Ticker */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-slate-900/90 border-b border-slate-800 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2">
          {[...indices, ...indices].map((index, i) => (
            <div key={i} className="flex items-center gap-2 px-6">
              <span className="text-slate-400 text-sm">{index.name}</span>
              <span className="text-white font-medium">{index.value.toLocaleString()}</span>
              <span className={`text-sm ${index.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {index.change >= 0 ? '+' : ''}{index.change_percent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Star className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Free Virtual Trading Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Master Trading with{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Zero Risk
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 max-w-xl">
                Start your trading journey with ₹2,000 virtual money. Practice trading in real market conditions 
                with live data from NSE, BSE, and US markets.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2">
                    Start Trading Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2">
                  <Play className="h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Free forever</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl">
                <img 
                  src="/logo.svg" 
                  alt="Trading Dashboard" 
                  className="w-full h-auto rounded-xl"
                />
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs">Portfolio Value</p>
                    <p className="text-emerald-400 font-bold text-lg">₹2,450.00</p>
                    <p className="text-emerald-400 text-xs">+22.5%</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs">Day P&L</p>
                    <p className="text-emerald-400 font-bold text-lg">+₹125.50</p>
                    <p className="text-emerald-400 text-xs">+5.2%</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs">Trades Today</p>
                    <p className="text-blue-400 font-bold text-lg">12</p>
                    <p className="text-slate-500 text-xs">8 buys, 4 sells</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Trade Smarter
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to practice trading 
              and improve your skills without risking real money.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Start Trading in{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up for free and get ₹2,000 virtual money to start trading.',
              },
              {
                step: '02',
                title: 'Explore Markets',
                description: 'Browse stocks from NSE, BSE, and US markets with real-time data.',
              },
              {
                step: '03',
                title: 'Start Trading',
                description: 'Buy and sell stocks, track your portfolio, and improve your skills.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-slate-800 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 w-full h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rahul Sharma',
                role: 'Software Engineer',
                content: 'ApexQuant helped me learn trading without risking my savings. The platform is intuitive and the real-time data is amazing.',
                rating: 5,
              },
              {
                name: 'Priya Patel',
                role: 'Marketing Manager',
                content: 'I started with zero knowledge about stocks. Now I can confidently analyze markets thanks to this platform.',
                rating: 5,
              },
              {
                name: 'Arun Kumar',
                role: 'Student',
                content: 'The virtual money feature is perfect for students like me. I can practice trading without any financial risk.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-slate-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 border border-blue-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-slate-950/50" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start Your Trading Journey?
              </h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                Join thousands of traders who are already practicing and improving their skills on ApexQuant.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 gap-2">
                    Create Free Account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10,000+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>100% Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="ApexQuant" className="h-8 w-8" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ApexQuant
                </span>
              </Link>
              <p className="text-slate-400 text-sm">
                The ultimate virtual trading platform for learning and practicing stock trading.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Markets</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>© 2024 ApexQuant. All rights reserved. Virtual trading platform for educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
