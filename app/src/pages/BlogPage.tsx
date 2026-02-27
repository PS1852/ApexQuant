import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BlogPage() {
    const featuredPost = {
        title: "The Psychology of Virtual Trading vs Real Capital",
        slug: "psychology-of-virtual-trading",
        excerpt: "Discover how risk-free simulation trading patterns differ from real-world execution, and how to bridge the psychological gap to become a more profitable trader.",
        category: "Trading Psychology",
        readTime: "8 min read",
        author: "Elena Rostov",
        date: "February 26, 2025",
        image: `${import.meta.env.BASE_URL}about_team.png`
    };

    const recentPosts = [
        {
            title: "Algorithmic Trading Basics for Retail Investors",
            slug: "algo-trading-basics",
            excerpt: "An introduction to using simple technical parameters to build your first automated trading strategy.",
            category: "Algo Trading",
            readTime: "12 min read",
            date: "February 24, 2025",
            image: "bg-blue-500/10 border-blue-500/20"
        },
        {
            title: "Understanding Market Microstructure",
            slug: "market-microstructure",
            excerpt: "Delve into the order book, bid-ask spreads, and how High Frequency Trading firms execute their strategies.",
            category: "Market Tech",
            readTime: "10 min read",
            date: "February 21, 2025",
            image: "bg-purple-500/10 border-purple-500/20"
        },
        {
            title: "Navigating Volatility: A Beginner's Guide",
            slug: "navigating-volatility",
            excerpt: "When the VIX spikes, how should you adjust your portfolio? Learn how to hedge during uncertain macroeconomic times.",
            category: "Strategy",
            readTime: "7 min read",
            date: "February 18, 2025",
            image: "bg-cyan-500/10 border-cyan-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 animate-fade-in-up">
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
                        src={`${import.meta.env.BASE_URL}blog_hero.png`}
                        alt="ApexQuant Blog Hero"
                        className="w-full h-full object-cover opacity-20 filter blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                <div className="relative max-w-5xl mx-auto text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                        <BookOpen className="h-4 w-4 text-cyan-400" />
                        <span className="text-cyan-400 text-sm font-medium">Market Insights & News</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
                        The ApexQuant <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Journal</span>
                    </h1>

                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Expert analysis, trading strategies, and platform updates. Master the markets with our in-depth editorial content.
                    </p>
                </div>
            </section>

            {/* Featured Post */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-blue-400" /> Featured Post
                </h2>

                <Link to={`/blog/${featuredPost.slug}`} className="block group cursor-pointer relative rounded-3xl p-1 mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="grid lg:grid-cols-2 gap-0 relative z-10 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                        <div className="h-[300px] lg:h-auto w-full overflow-hidden">
                            <img
                                src={featuredPost.image}
                                alt={featuredPost.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="p-8 sm:p-12 flex flex-col justify-center bg-slate-900/90 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
                                    {featuredPost.category}
                                </Badge>
                                <span className="flex items-center text-sm text-slate-500 gap-1.5">
                                    <Clock className="w-4 h-4" /> {featuredPost.readTime}
                                </span>
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                                {featuredPost.title}
                            </h3>
                            <p className="text-slate-400 text-lg mb-8 line-clamp-3">
                                {featuredPost.excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {featuredPost.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{featuredPost.author}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {featuredPost.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-blue-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </section>

            {/* Recent Posts Grid */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8">Recent Articles</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentPosts.map((post, i) => (
                        <div key={i} className="relative group p-1 h-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-15 group-hover:opacity-50 transition duration-700"></div>
                            <Link to={`/blog/${post.slug}`} className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full group-hover:bg-slate-900">
                                <div className={`h-48 w-full ${post.image} border-b border-slate-800 flex items-center justify-center relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-950/80 pointer-events-none z-10" />
                                    <BookOpen className="w-16 h-16 text-slate-700/50 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                                            {post.category}
                                        </Badge>
                                        <span className="text-xs text-slate-500">{post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
                                        <span className="text-xs text-slate-500">{post.date}</span>
                                        <span className="text-sm text-blue-400 font-medium group-hover:text-blue-300 transition-colors">Read Article</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
