import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LegalPage() {
    const { document } = useParams<{ document: string }>();

    let title = 'Legal Document';
    let icon = <FileText className="w-8 h-8 text-blue-400 mb-4" />;
    let content = <></>;

    switch (document) {
        case 'privacy':
            title = 'Privacy Policy';
            icon = <Shield className="w-8 h-8 text-emerald-400 mb-4" />;
            content = (
                <div className="space-y-6 text-slate-300">
                    <p>Last updated: October 2024</p>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">1. Information We Collect</h3>
                        <p>We collect information you provide directly to us when you create an account, use the platform, or communicate with us. This includes your name, email address, profile picture (if linked via Google), and virtual trading activity.</p>
                    </section>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">2. How We Use Information</h3>
                        <p>We use the information we collect to provide, maintain, and improve our services, including operating the virtual trading platform and simulating market conditions.</p>
                    </section>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">3. Information Sharing</h3>
                        <p>ApexQuant is a simulated trading environment. We do not sell your personal information. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</p>
                    </section>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">4. Data Security</h3>
                        <p>We use appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, or alteration.</p>
                    </section>
                </div>
            );
            break;
        case 'terms':
            title = 'Terms of Service';
            icon = <FileText className="w-8 h-8 text-blue-400 mb-4" />;
            content = (
                <div className="space-y-6 text-slate-300">
                    <p>Last updated: October 2024</p>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">1. Acceptance of Terms</h3>
                        <p>By accessing or using ApexQuant, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
                    </section>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">2. Virtual Nature of the Service</h3>
                        <p>ApexQuant is strictly a virtual trading simulator for educational purposes. <strong>NO REAL MONEY</strong> is involved. Virtual balances, simulated portfolios, and any other figures have no real-world financial value.</p>
                    </section>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">3. User Accounts</h3>
                        <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</p>
                    </section>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">4. Market Data</h3>
                        <p>Market data provided on the platform is for informational and educational purposes only. We do not guarantee the absolute real-time accuracy of stock prices.</p>
                    </section>
                </div>
            );
            break;
        case 'disclaimer':
            title = 'Disclaimer';
            icon = <AlertTriangle className="w-8 h-8 text-amber-400 mb-4" />;
            content = (
                <div className="space-y-6 text-slate-300">
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">Educational Purposes Only</h3>
                        <p>ApexQuant is an educational tool designed to simulate stock market trading. The platform does not offer real trading, real money accounts, or actual brokerage services.</p>
                    </section>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">No Financial Advice</h3>
                        <p>Nothing on this platform should be construed as financial, investment, or trading advice. Past performance in this simulator does not guarantee future results in real-world trading.</p>
                    </section>
                    <section className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">Market Data Accuracy</h3>
                        <p>While we strive to provide accurate simulated market data by pulling from real-world APIs, data may be delayed, interrupted, or occasionally inaccurate. We are not liable for any discrepancies in the data provided.</p>
                    </section>
                </div>
            );
            break;
        default:
            title = 'Legal Document Not Found';
            content = <p className="text-slate-400">The requested document could not be found.</p>;
    }

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link to="/">
                    <Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-xl backdrop-blur-sm">
                    <div className="flex flex-col items-center text-center mb-10 pb-10 border-b border-slate-800">
                        {icon}
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
                    </div>
                    <div className="prose prose-invert max-w-none">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
}
