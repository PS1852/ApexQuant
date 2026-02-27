import { Link } from 'react-router-dom';
import { ArrowLeft, Rocket, Target, Users, ShieldCheck, Globe, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
    const coreValues = [
        {
            icon: <Target className="h-6 w-6 text-blue-400" />,
            title: "Zero Risk, Maximum Learning",
            description: "Our philosophy revolves around providing a completely risk-free environment. Learning to trade shouldn't cost you a fortune in market mistakes."
        },
        {
            icon: <Globe className="h-6 w-6 text-purple-400" />,
            title: "Global Market Access",
            description: "We bring the world's major stock exchanges—NSE, BSE, and US Markets—into a single unified platform. True financial literacy is borderless."
        },
        {
            icon: <Code className="h-6 w-6 text-cyan-400" />,
            title: "Cutting-Edge Technology",
            description: "Built on high-performance infrastructure, our platform simulates market conditions with ultra-low latency, offering an authentic trading experience."
        },
        {
            icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
            title: "Absolute Integrity",
            description: "We rely on accurate, real-world data feeds to ensure the environment is as authentic as possible, operating with total transparency."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="ApexQuant" className="h-8 w-8" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                ApexQuant
                            </span>
                        </Link>

                        <Link to="/">
                            <Button variant="ghost" className="text-slate-300 hover:text-white">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Header */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-slate-950">
                    <img
                        src={`${import.meta.env.BASE_URL}about_hero.png`}
                        alt="ApexQuant Hero Background"
                        className="w-full h-full object-cover opacity-20 filter blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                <div className="relative max-w-5xl mx-auto text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <Rocket className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-medium">Our Mission & Vision</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                        Democratizing <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Financial Literacy
                        </span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        ApexQuant was founded with a singular purpose: to bridge the gap between financial novices and professional market participants by providing a highly realistic, risk-free training ground.
                    </p>
                </div>
            </section>

            {/* The Story Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-900 border-y border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <img
                                src={`${import.meta.env.BASE_URL}about_team.png`}
                                alt="Technology and Data Visualization"
                                className="relative rounded-3xl border border-slate-700/50 shadow-2xl w-full h-[500px] object-cover"
                            />
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white">
                                The Problem We're Solving
                            </h2>
                            <div className="space-y-6 text-lg text-slate-300">
                                <p>
                                    Every year, millions of retail investors enter the stock market without adequate preparation. Seduced by stories of massive gains, they often risk their hard-earned capital entirely unprepared for the sheer volatility and complexity of the global financial markets.
                                </p>
                                <p>
                                    Traditional paper trading platforms feel clunky, outdated, and fail to replicate the psychological and technical environment of a modern brokerage.
                                </p>
                                <p className="text-blue-400 font-medium border-l-4 border-blue-500 pl-4 py-1">
                                    We built ApexQuant to simulate the cutting-edge professional environment exactly as it is.
                                </p>
                                <p>
                                    With live data streams, instant execution mimicking real electronic communication networks (ECNs), and a stunning interface, we ensure that when you're ready to trade with real money, you're not just guessing—you're executing a well-tested strategy.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Core Values</h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            The foundational principles that guide every feature we build and every line of code we write.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreValues.map((value, i) => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:bg-slate-800/50 transition-colors duration-300">
                                <div className="h-14 w-14 rounded-full bg-slate-950 flex items-center justify-center mb-6 shadow-inner border border-slate-800">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats/Showcase */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <div>
                            <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">999+</p>
                            <p className="text-slate-400 flex items-center justify-center gap-2">
                                <Users className="w-4 h-4" /> Active Users
                            </p>
                        </div>
                        <div>
                            <p className="text-4xl md:text-5xl font-extrabold text-blue-400 mb-2">₹2K</p>
                            <p className="text-slate-400">Starting Balance</p>
                        </div>
                        <div>
                            <p className="text-4xl md:text-5xl font-extrabold text-purple-400 mb-2">0ms</p>
                            <p className="text-slate-400">Execution Lag</p>
                        </div>
                        <div>
                            <p className="text-4xl md:text-5xl font-extrabold text-cyan-400 mb-2">24/7</p>
                            <p className="text-slate-400">Market Training</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">Ready to master the markets?</h2>
                <Link to="/signup">
                    <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200">
                        Create Your Free Account
                    </Button>
                </Link>
            </section>

        </div>
    );
}
