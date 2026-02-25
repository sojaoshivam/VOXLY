'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const PLANS = [
    {
        id: 'free',
        name: 'Starter',
        price: 0,
        priceLabel: '₹0',
        period: '',
        tagline: 'Perfect for testing the waters before you commit.',
        badge: null,
        color: '#8b8680',
        gradient: 'from-[#1f1f1f] to-[#1a1a1a]',
        border: 'border-[#2e2e2e]',
        cta: 'Get Started Free →',
        ctaStyle: 'bg-[#242424] text-[#f0eeea] hover:bg-[#2e2e2e]',
        features: [
            { text: '5 voiceovers / month', included: true },
            { text: 'Hindi, English, Hinglish', included: true },
            { text: 'Standard audio quality', included: true },
            { text: 'Watermark on export', included: false },
            { text: 'Commercial rights', included: true },
            { text: 'Priority rendering', included: false },
        ],
    },
    {
        id: 'creator',
        name: 'Creator',
        price: 299,
        priceLabel: '₹299',
        period: '/ month',
        tagline: 'For growing pages ready to post consistently.',
        badge: 'Best Value',
        color: '#f472b6',
        gradient: 'from-[#1f1414] to-[#1a1118]',
        border: 'border-[#f472b6]/30',
        cta: 'Start Creating →',
        ctaStyle: 'bg-gradient-to-r from-[#f472b6] to-[#fb923c] text-white hover:shadow-lg hover:shadow-pink-500/30',
        features: [
            { text: '60 voiceovers / month', included: true },
            { text: 'All 12 languages', included: true },
            { text: 'HD Studio quality', included: true },
            { text: 'No watermark', included: true },
            { text: 'Commercial rights', included: true },
            { text: 'Priority rendering', included: true },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 599,
        priceLabel: '₹599',
        period: '/ month',
        tagline: 'For serious creators who scale without limits.',
        badge: 'Most Popular',
        color: '#a855f7',
        gradient: 'from-[#14121f] to-[#11101a]',
        border: 'border-[#a855f7]/30',
        cta: 'Go Pro →',
        ctaStyle: 'bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white hover:shadow-lg hover:shadow-purple-500/30',
        features: [
            { text: 'Unlimited voiceovers', included: true },
            { text: 'All 12 languages', included: true },
            { text: 'HD Studio quality', included: true },
            { text: 'No watermark', included: true },
            { text: 'Commercial rights', included: true },
            { text: 'Priority rendering', included: true },
        ],
    },
];

function CheckIcon({ color }: { color: string }) {
    return (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function CrossIcon() {
    return (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

export default function PricingClient() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [currentTier, setCurrentTier] = useState('free');

    // Fetch current subscription tier from database via API
    useEffect(() => {
        const fetchTier = async () => {
            if (!session?.user) {
                setCurrentTier('free');
                return;
            }
            try {
                const res = await fetch('/api/usage');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentTier(data.subscriptionTier || 'free');
                }
            } catch (err) {
                console.error('Failed to fetch subscription tier:', err);
            }
        };
        fetchTier();
    }, [session]);

    const handleCheckout = async (plan: string) => {
        if (plan === 'free') {
            router.push(session ? '/dashboard' : '/login');
            return;
        }
        if (!session) {
            router.push('/login?next=/pricing');
            return;
        }

        setLoading(plan);
        setError('');
        try {
            const res = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Checkout failed');
            window.location.href = data.checkoutUrl;
        } catch (err: any) {
            setError(err.message);
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-[#f0eeea] font-[DM_Sans,sans-serif]">
            {/* Nav */}
            <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
                <Link href="/" className="font-[Instrument_Serif,serif] italic text-xl text-[#f0eeea] no-underline">
                    VOXLY
                </Link>
                <div className="flex items-center gap-4">
                    {session ? (
                        <Link href="/dashboard" className="text-sm text-[#8b8680] hover:text-[#f0eeea] transition-colors no-underline">
                            Dashboard →
                        </Link>
                    ) : (
                        <Link href="/login" className="text-sm text-[#8b8680] hover:text-[#f0eeea] transition-colors no-underline">
                            Sign in
                        </Link>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <div className="text-center pt-12 pb-16 px-6">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#f472b6] bg-[#f472b6]/10 border border-[#f472b6]/20 px-4 py-1.5 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6] animate-pulse inline-block" />
                    Simple, transparent pricing
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold font-[Instrument_Serif,serif] italic text-[#f0eeea] mb-4">
                    Choose your plan
                </h1>
                <p className="text-[#5a5652] max-w-md mx-auto text-base">
                    Start free, scale as you grow. Cancel anytime.
                </p>
            </div>

            {/* Cards */}
            <div className="max-w-5xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {PLANS.map((plan) => {
                        const isCurrent = currentTier === plan.id;
                        const isLoading = loading === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl border p-7 flex flex-col bg-gradient-to-b ${plan.gradient} ${plan.border} transition-transform duration-300 hover:-translate-y-1`}
                                style={plan.badge ? { boxShadow: `0 0 40px ${plan.color}15` } : {}}
                            >
                                {/* Badge */}
                                {plan.badge && (
                                    <div
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap"
                                        style={{ background: plan.color, color: '#fff' }}
                                    >
                                        {plan.badge}
                                    </div>
                                )}

                                {/* Plan header */}
                                <div className="mb-6">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: plan.color }}>
                                        {plan.name}
                                    </p>
                                    <div className="flex items-end gap-1 mb-2">
                                        <span className="text-4xl font-bold text-[#f0eeea]">{plan.priceLabel}</span>
                                        {plan.period && <span className="text-sm text-[#5a5652] mb-1.5">{plan.period}</span>}
                                    </div>
                                    <p className="text-sm text-[#5a5652] leading-snug">{plan.tagline}</p>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 flex-1 mb-8">
                                    {plan.features.map((f) => (
                                        <li key={f.text} className="flex items-center gap-2.5">
                                            {f.included ? <CheckIcon color={plan.color} /> : <CrossIcon />}
                                            <span className={`text-sm ${f.included ? 'text-[#c8c4c0]' : 'text-[#4a4642] line-through'}`}>
                                                {f.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    onClick={() => handleCheckout(plan.id)}
                                    disabled={isCurrent || isLoading}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${plan.ctaStyle} ${isCurrent ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0" strokeLinecap="round" />
                                            </svg>
                                            Redirecting…
                                        </span>
                                    ) : isCurrent ? '✓ Current plan' : plan.cta}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 text-center text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl px-4 py-3 max-w-md mx-auto">
                        {error}
                    </div>
                )}

                {/* Footer note */}
                <p className="text-center text-xs text-[#3a3a3a] mt-10">
                    Payments processed securely via Dodo Payments. All prices in INR. Cancel anytime.
                </p>

                {/* FAQ strip */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { q: 'Does unused quota roll over?', a: 'No. Voiceover quota resets on the 1st of each month.' },
                        { q: 'Can I switch plans?', a: 'Yes. Upgrade anytime and it takes effect immediately.' },
                        { q: 'What counts toward my limit?', a: 'Every successfully generated voiceover counts, even if deleted later.' },
                    ].map(({ q, a }) => (
                        <div key={q} className="bg-[#141414] border border-[#2e2e2e] rounded-xl p-5">
                            <p className="text-sm font-semibold text-[#e8e4e0] mb-2">{q}</p>
                            <p className="text-xs text-[#5a5652] leading-relaxed">{a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
