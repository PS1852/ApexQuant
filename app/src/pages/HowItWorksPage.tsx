import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Rocket, Award, Monitor, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function HowItWorksPage() {
    const [activeStep, setActiveStep] = useState(0);

    // Scroll spy for progress indicator
    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY;
            const height = window.innerHeight;
            const index = Math.min(
                Math.max(0, Math.floor((scrollPos - height * 0.5) / height)),
                3
            );
            setActiveStep(index);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const steps = [
        {
            id: "01",
            title: "Initiate Your Account",
            desc: "Sign up instantly and receive a virtual credit of ₹2,000. No credit cards, no KYC, no delays. Just pure, immediate access to the markets.",
            icon: <Target className="w-12 h-12 text-blue-400" />,
            color: "from-blue-600 to-blue-400"
        },
        {
            id: "02",
            title: "Scout the Dashboard",
            desc: "Analyze real-time market movers, top gainers, and losers. Use professional-grade technical charts to identify your entry points before the crowd.",
            icon: <Monitor className="w-12 h-12 text-purple-400" />,
            color: "from-purple-600 to-purple-400"
        },
        {
            id: "03",
            title: "Execute the Strategy",
            desc: "Lock in your positions using instantaneous order execution. Whether it's a market buy or limit sell, your strategy hits the tape at zero latency.",
            icon: <Rocket className="w-12 h-12 text-cyan-400" />,
            color: "from-cyan-600 to-cyan-400"
        },
        {
            id: "04",
            title: "Dominance & Adaptation",
            desc: "Track your portfolio's performance. Adapt to volatility spikes, study your transaction history, and refine your edge to conquer the simulated market.",
            icon: <Award className="w-12 h-12 text-emerald-400" />,
            color: "from-emerald-600 to-emerald-400"
        }
    ];

    const scrollToFirst = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    return (
        <div className="bg-slate-950 min-h-screen text-white selection:bg-purple-500/30 font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/30 backdrop-blur-2xl border-b border-white/5 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="flex items-center gap-3">
                            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="ApexQuant" className="h-10 w-10" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Workflow
                            </span>
                        </Link>

                        <Link to="/">
                            <Button variant="outline" className="text-slate-300 border-white/10 hover:bg-white/10 hover:text-white rounded-full">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Return
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={`${import.meta.env.BASE_URL}how_works_hero.png`}
                        alt="Circuit Blueprint"
                        className="w-full h-full object-cover opacity-40 mix-blend-screen animate-slow-pan"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950" />
                </div>

                <div className="relative z-10 text-center space-y-8 max-w-4xl px-4 mt-20">
                    <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter mix-blend-overlay opacity-90">
                        The Process
                    </h1>
                    <p className="text-2xl text-slate-300 font-light max-w-2xl mx-auto">
                        From the moment you create your account to mastering the institutional order flow, discover the seamless journey of an ApexQuant trader.
                    </p>
                </div>

                <button onClick={scrollToFirst} className="absolute bottom-12 z-20 animate-bounce p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 transition-colors backdrop-blur-lg">
                    <ChevronDown className="h-8 w-8 text-white" />
                </button>
            </section>

            {/* Dynamic Scrolling Steps */}
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-800 -translate-x-1/2 z-0 hidden md:block" />
                <div
                    className="absolute left-6 md:left-1/2 top-0 w-[4px] bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 -translate-x-1/2 z-10 hidden md:block transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                    style={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isEven = index % 2 === 0;
                    const isActive = index <= activeStep;

                    return (
                        <section key={index} className="min-h-screen flex items-center relative z-20 py-20 overflow-hidden">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

                                <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>

                                    {/* Left Side Content/Image */}
                                    <div className={`w-full md:w-1/2 ${isEven ? 'md:text-right md:order-1 order-2' : 'md:order-2 order-2'}`}>
                                        <div className="p-10 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl relative group">
                                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.color} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000`} />
                                            <div className="relative bg-slate-950 p-8 rounded-2xl h-full border border-slate-800 flex items-center justify-center min-h-[300px]">
                                                <div className="animate-float">
                                                    {step.icon}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Marker Circle */}
                                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-950 border-4 border-slate-800 z-30 items-center justify-center font-bold text-slate-500 shadow-2xl transition-all duration-500">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${isActive ? 'bg-slate-900 border-white text-white shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'border-slate-800 text-slate-700'}`}>
                                            {step.id}
                                        </div>
                                    </div>

                                    {/* Right Side Text */}
                                    <div className={`w-full md:w-1/2 space-y-6 ${isEven ? 'md:order-2 order-1' : 'md:text-right md:order-1 order-1'}`}>
                                        <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-gradient-to-r ${step.color} text-transparent bg-clip-text border border-white/10`}>
                                            Phase {step.id}
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                                            {step.title}
                                        </h2>
                                        <p className={`text-xl text-slate-400 leading-relaxed font-light ${isEven ? '' : 'md:ml-auto'} max-w-lg`}>
                                            {step.desc}
                                        </p>
                                    </div>

                                </div>

                            </div>
                        </section>
                    )
                })}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes slow-pan {
          from { transform: scale(1.1) translate(0,0); }
          to { transform: scale(1.1) translate(-2%, 2%); }
        }
        .animate-slow-pan {
          animation: slow-pan 30s alternate infinite linear;
        }
      `}} />
        </div >
    );
}
