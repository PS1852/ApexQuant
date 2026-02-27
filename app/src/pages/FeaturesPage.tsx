import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Shield, Globe, Cpu, LineChart, Activity } from 'lucide-react';

export default function FeaturesPage() {
    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const hero = document.getElementById('hero-bg');
            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.4}px)`;
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Cpu className="w-8 h-8 text-blue-400" />,
            title: "Algorithmic Precision Engine",
            description: "Our proprietary execution matching engine operates with nano-second precision, guaranteeing that your virtual trades slip exactly as they would in real ECN books.",
            delay: "delay-100"
        },
        {
            icon: <Globe className="w-8 h-8 text-purple-400" />,
            title: "Global Interconnectivity",
            description: "Simultaneously stream live Level-1 and Level-2 data from NYSE, NASDAQ, NSE, and BSE. Experience seamless latency-free aggregation.",
            delay: "delay-200"
        },
        {
            icon: <Activity className="w-8 h-8 text-cyan-400" />,
            title: "Dynamic Market Simulation",
            description: "We don't just copy prices. Our engine simulates market depth, liquidity pooling, and institutional volume spikes to train you for black-swan events.",
            delay: "delay-300"
        },
        {
            icon: <Shield className="w-8 h-8 text-emerald-400" />,
            title: "Bank-Grade Encryption",
            description: "Even though this is a simulator, your personal data and strategic algorithms are protected with AES-256 encryption. We treat your virtual strategies like real IP.",
            delay: "delay-400"
        },
        {
            icon: <LineChart className="w-8 h-8 text-pink-400" />,
            title: "Pro-Tier Charting & Analytics",
            description: "Leverage over 150+ technical indicators, drawing tools, and fibonacci integrations built directly into your responsive web dashboard.",
            delay: "delay-500"
        },
        {
            icon: <Zap className="w-8 h-8 text-amber-400" />,
            title: "Flash Trade Execution",
            description: "One-click trading, hotkey binding, and macro building. Execute complex multi-leg options or bulk equity orders in a fraction of a second.",
            delay: "delay-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 overflow-hidden relative selection:bg-blue-500/30">
            {/* Decorative animated background elements */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="ApexQuant" className="h-10 w-10 relative z-10 transform group-hover:rotate-12 transition-transform duration-500" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                ApexQuant
                            </span>
                        </Link>

                        <Link to="/">
                            <Button variant="outline" className="text-slate-300 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-md rounded-full px-6">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Return Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div id="hero-bg" className="absolute inset-0 z-0">
                    <img
                        src={`${import.meta.env.BASE_URL}feature_hero.png`}
                        alt="Advanced Features"
                        className="w-full h-[120%] object-cover opacity-30 transform scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up">
                        <SparklesIcon className="h-4 w-4 text-blue-400 animate-pulse" />
                        <span className="text-slate-200 font-medium tracking-wide">Next-Generation Capabilities</span>
                    </div>

                    <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white mb-8 tracking-tighter leading-tight animate-fade-in-up delay-100">
                        Engineered for <br />
                        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent opacity-90 drop-shadow-2xl">
                            Absolute Dominance
                        </span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up delay-200">
                        A symphony of complex algorithms, real-time data streaming, and elegant UI design. Discover the features that make ApexQuant the world's most luxurious trading simulator.
                    </p>

                    <div className="mt-16 animate-bounce">
                        <div className="w-[1px] h-24 bg-gradient-to-b from-blue-500 to-transparent mx-auto" />
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className={`group relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 ${feature.delay}`}
                            >
                                {/* Hover gradient effect */}
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />

                                <div className="relative z-10">
                                    <div className="h-16 w-16 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed text-lg">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Decorative glowing bottom line */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cinematic Showcase */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 relative z-10 bg-black/40 border-y border-white/5 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                                Data visualized like <br /> never before.
                            </h2>
                            <p className="text-xl text-slate-400 font-light leading-relaxed">
                                We've stripped away the noise and clutter of traditional finance software. What remains is a pure, unadulterated interface that puts the data you need exactly where you expect to find it.
                            </p>
                            <ul className="space-y-4 pt-4 text-slate-300 text-lg">
                                <li className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" /> Native Dark Mode Excellence
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" /> Fluid 60fps Animations
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" /> Multi-Monitor Workspace Support
                                </li>
                            </ul>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-3xl rounded-full" />
                            <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 transform hover:rotate-2 hover:scale-105 transition-all duration-700">
                                <div className="flex items-center gap-2 mb-4 px-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                </div>
                                <img
                                    src={`${import.meta.env.BASE_URL}about_team.png`}
                                    className="rounded-xl w-full object-cover h-[300px] border border-white/5 opacity-80"
                                    alt="Terminal Mockup"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-40 px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-5xl font-extrabold text-white mb-10 tracking-tight">Experience the Future of Finance</h2>
                <Link to="/signup">
                    <Button size="lg" className="bg-white text-black hover:bg-slate-200 hover:scale-105 transition-all duration-300 text-lg px-12 py-8 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                        Begin Your Journey Today
                    </Button>
                </Link>
            </section>

            {/* CSS Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
      `}} />
        </div>
    );
}

// Just a quick inline Sparkles component since it wasn't imported
function SparklesIcon(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}
