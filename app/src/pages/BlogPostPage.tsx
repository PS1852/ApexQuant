import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, CheckCircle2, ChevronRight, Share2, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();

    // A generic fallback for demonstration, in a real app this would be fetched from an API/CMS
    const postInfo = {
        title: slug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "The Psychology of Virtual Trading vs Real Capital",
        category: "Trading Psychology",
        readTime: "8 min read",
        author: "Elena Rostov",
        date: "February 12, 2025",
        image: `${import.meta.env.BASE_URL}blog_hero.png`
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 selection:bg-cyan-500/30 font-sans">
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

                        <Link to="/blog">
                            <Button variant="ghost" className="text-slate-300 hover:text-white">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Journal
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-24">
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Info */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 text-sm">
                                {postInfo.category}
                            </Badge>
                            <span className="flex items-center text-sm text-slate-500 gap-1.5">
                                <Clock className="w-4 h-4" /> {postInfo.readTime}
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                            {postInfo.title}
                        </h1>

                        <div className="flex items-center justify-center gap-4 text-left">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                {postInfo.author.charAt(0)}
                            </div>
                            <div>
                                <p className="text-base font-medium text-white">{postInfo.author}</p>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {postInfo.date}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="w-full h-auto aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 mb-16 relative">
                        <img
                            src={postInfo.image}
                            alt="Article Hero"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:rounded-xl">
                        <p className="text-xl text-slate-300 leading-relaxed">
                            When retail investors transition from simulator platforms to deploying their first real dollar in the market, an invisible but violently powerful shift occurs in their decision-making circuitry. The strategies that yielded a perfect 60% win-rate in paper trading suddenly crumble under the weight of real capital. Why does this happen, and how can we engineer a solution?
                        </p>

                        <h2 className="text-3xl font-bold mt-12 mb-6">The Physiological Impact of Real Risk</h2>
                        <p>
                            Neurological studies of professional traders show that managing real risk active the amygdala—the brain's fear center. When trading on a standard simulator, the prefrontal cortex remains in firm control, allowing for calculated, logical execution of entry and exit criteria.
                        </p>
                        <p>
                            When real money is injected, the stakes change. A drawdown of 10% is no longer a 'number on a screen'—it subconsciously translates to a threat to one's livelihood.
                        </p>

                        <blockquote className="border-l-4 border-cyan-400 bg-slate-900/50 p-6 rounded-r-2xl my-10 italic text-xl">
                            "The market doesn't defeat traders. Traders defeat themselves because they lack the psychological calluses required to endure volatility."
                        </blockquote>

                        <h2 className="text-3xl font-bold mt-12 mb-6">How ApexQuant Bridges the Gap</h2>
                        <p>
                            This is precisely why ApexQuant was built. A standard simulator fails because it feels sterile. Our engine utilizes:
                        </p>
                        <ul className="space-y-4 my-8 list-none pl-0">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <span><strong>Real-time Slippage Simulation:</strong> If you buy 10,000 shares of a low-volume penny stock, you will not get filled at a single perfect price. The simulator works through the virtual order book, giving you realistic average pricing.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                                <span><strong>Institutional Latency Spikes:</strong> During high-impact news releases, we simulate algorithmic trading delays, teaching you how to avoid panic-selling into a liquidity vacuum.</span>
                            </li>
                        </ul>

                        <h2 className="text-3xl font-bold mt-12 mb-6">The Path to Dominance</h2>
                        <p>
                            To become a consistently profitable trader, you must treat your virtual balance exactly as you would treat your real net worth. When you master your emotions in a highly realistic virtual environment, transitioning to real capital becomes a matter of applying a known variable, rather than facing the unknown.
                        </p>
                    </div>

                    {/* Footer of the article */}
                    <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <span className="font-medium text-white">Share this article:</span>
                            <Button variant="outline" size="icon" className="rounded-full bg-slate-900 border-slate-700 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500">
                                <Twitter className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full bg-slate-900 border-slate-700 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500">
                                <Linkedin className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full bg-slate-900 border-slate-700 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <div>
                            <Link to="/blog">
                                <Button className="bg-slate-800 hover:bg-slate-700 text-white rounded-full">
                                    Read More Articles <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
