"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { C, typography } from "./theme";
import { Reveal } from "./UI";

const plans = [
    {
        name: "Starter",
        price: { monthly: "₹0", yearly: "₹0" },
        period: "forever free",
        desc: "Perfect for testing the waters before you commit.",
        features: [
            { text: "5 voiceovers / month", included: true },
            { text: "Hindi, English, Hinglish", included: true },
            { text: "Standard audio quality", included: true },
            { text: "Watermark on export", included: true },
            { text: "Commercial rights", included: false },
            { text: "Priority rendering", included: false },
        ],
        cta: "Get Started Free",
        ctaHref: "/login",
        dark: false,
        badge: null,
        accent: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.10)",
        highlight: false,
    },
    {
        name: "Creator",
        price: { monthly: "₹299", yearly: "₹199" },
        period: "/ month",
        desc: "For growing pages ready to post consistently.",
        features: [
            { text: "60 voiceovers / month", included: true },
            { text: "All 12 languages", included: true },
            { text: "HD Studio quality", included: true },
            { text: "No watermark", included: true },
            { text: "Commercial rights", included: true },
            { text: "Priority rendering", included: false },
        ],
        cta: "Start Creating",
        ctaHref: "/login",
        dark: false,
        badge: "Best Value",
        accent: "rgba(255,255,255,0.07)",
        borderColor: "rgba(236,72,153,0.25)",
        highlight: false,
    },
    {
        name: "Pro",
        price: { monthly: "₹599", yearly: "₹399" },
        period: "/ month",
        desc: "For serious creators who scale without limits.",
        features: [
            { text: "Unlimited voiceovers", included: true },
            { text: "All 12 languages", included: true },
            { text: "HD Studio quality", included: true },
            { text: "No watermark", included: true },
            { text: "Commercial rights", included: true },
            { text: "Priority rendering", included: true },
        ],
        cta: "Go Pro",
        ctaHref: "/login",
        dark: true,
        badge: "Most Popular",
        accent: "linear-gradient(145deg, rgba(236,72,153,0.18) 0%, rgba(249,115,22,0.10) 100%)",
        borderColor: "rgba(236,72,153,0.45)",
        highlight: true,
    },
];

export function Pricing() {
    const [yearly, setYearly] = useState(false);

    return (
        <section id="pricing" style={{ padding: "120px 40px", maxWidth: 1200, margin: "0 auto" }}>

            {/* Header */}
            <Reveal>
                <div style={{ textAlign: "center", marginBottom: 72 }}>
                    <p style={{
                        fontSize: 11, color: "#ec4899", textTransform: "uppercase",
                        letterSpacing: "0.18em", marginBottom: 16, fontWeight: 700,
                    }}>
                        Pricing
                    </p>
                    <h2 style={{
                        fontFamily: typography.serif,
                        fontSize: "clamp(38px, 5vw, 56px)",
                        letterSpacing: "-0.025em",
                        fontWeight: 400,
                        color: "white",
                        lineHeight: 1.15,
                        margin: "0 0 20px",
                    }}>
                        Simple pricing.<br />
                        <em style={{ color: "#ec4899" }}>No surprises.</em>
                    </h2>
                    <p style={{ fontSize: 15, color: "#6b7280", fontFamily: typography.serif, fontStyle: "italic" }}>
                        Start free. Upgrade when your page takes off.
                    </p>

                    {/* Toggle */}
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 14,
                        marginTop: 36,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 100,
                        padding: "6px 6px 6px 20px",
                    }}>
                        <span style={{ fontSize: 13, color: yearly ? "#6b7280" : "white", fontWeight: 500, transition: "color 0.2s" }}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setYearly(!yearly)}
                            style={{
                                width: 44, height: 26,
                                borderRadius: 13,
                                border: "none",
                                background: yearly ? "linear-gradient(135deg, #ec4899, #f97316)" : "rgba(255,255,255,0.15)",
                                cursor: "pointer",
                                position: "relative",
                                transition: "background 0.3s ease",
                                flexShrink: 0,
                            }}
                        >
                            <span style={{
                                position: "absolute",
                                top: 3, left: yearly ? 21 : 3,
                                width: 20, height: 20,
                                borderRadius: "50%",
                                background: "white",
                                transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                            }} />
                        </button>
                        <span style={{
                            fontSize: 13, color: yearly ? "white" : "#6b7280",
                            fontWeight: 500, transition: "color 0.2s",
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            Yearly
                            <span style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                background: "linear-gradient(135deg, #ec4899, #f97316)",
                                color: "white",
                                padding: "3px 8px",
                                borderRadius: 100,
                                marginRight: 6,
                            }}>
                                Save 33%
                            </span>
                        </span>
                    </div>
                </div>
            </Reveal>

            {/* Cards grid */}
            <div style={{
                display: "grid",
                gap: 20,
                alignItems: "start",
            }} className="pricing-grid">
                {plans.map((plan, i) => (
                    <Reveal key={i} delay={i * 0.1}>
                        <PricingCard plan={plan} yearly={yearly} />
                    </Reveal>
                ))}
            </div>

            {/* Footer note */}
            <Reveal>
                <p style={{
                    textAlign: "center",
                    marginTop: 48,
                    fontSize: 18,
                    color: "#4b5563",
                    fontStyle: "italic",
                    fontFamily: typography.serif,
                }}>
                    All plans include a 7-day money-back guarantee. No questions asked.
                </p>
            </Reveal>

            <style>{`
                .pricing-grid { grid-template-columns: repeat(3, 1fr); }
                @media (max-width: 900px) {
                    .pricing-grid { grid-template-columns: 1fr !important; max-width: 440px; margin: 0 auto; gap: 32px !important; }
                }
            `}</style>
        </section>
    );
}

function PricingCard({ plan, yearly }: { plan: typeof plans[0]; yearly: boolean }) {
    const [hovered, setHovered] = useState(false);

    const priceDisplay = yearly ? plan.price.yearly : plan.price.monthly;
    const isHighlight = plan.highlight;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: plan.accent,
                backdropFilter: "blur(16px)",
                border: `1px solid ${plan.borderColor}`,
                borderRadius: 24,
                padding: isHighlight ? "52px 40px 44px" : "44px 36px",
                position: "relative",
                overflow: "hidden",
                transform: isHighlight
                    ? hovered ? "translateY(-10px) scale(1.01)" : "translateY(-6px) scale(1.0)"
                    : hovered ? "translateY(-6px)" : "translateY(0)",
                boxShadow: isHighlight
                    ? hovered
                        ? "0 40px 80px rgba(236,72,153,0.30), 0 0 0 1px rgba(236,72,153,0.3)"
                        : "0 24px 60px rgba(236,72,153,0.18), 0 0 0 1px rgba(236,72,153,0.2)"
                    : hovered
                        ? "0 20px 48px rgba(0,0,0,0.25)"
                        : "0 4px 16px rgba(0,0,0,0.12)",
                transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
        >
            {/* Glow orb for pro */}
            {isHighlight && (
                <div style={{
                    position: "absolute", top: -80, right: -80,
                    width: 260, height: 260, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
            )}

            {/* Badge */}
            {plan.badge && (
                <div style={{
                    position: "absolute", top: 20, right: 20,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "5px 12px", borderRadius: 100,
                    background: isHighlight
                        ? "linear-gradient(135deg, #ec4899, #f97316)"
                        : "rgba(236,72,153,0.15)",
                    color: isHighlight ? "white" : "#ec4899",
                    border: isHighlight ? "none" : "1px solid rgba(236,72,153,0.3)",
                }}>
                    {plan.badge}
                </div>
            )}

            {/* Plan name */}
            <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: isHighlight ? "#f9a8d4" : "#6b7280",
                marginBottom: 20,
            }}>
                {plan.name}
            </p>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                <span style={{
                    fontFamily: typography.serif,
                    fontSize: "clamp(44px, 4vw, 56px)",
                    letterSpacing: "-0.03em",
                    fontWeight: 400,
                    lineHeight: 1,
                    ...(isHighlight ? {
                        background: "linear-gradient(135deg, #fff 30%, #fda4af)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    } : {
                        color: "white",
                    }),
                }}>
                    {priceDisplay}
                </span>
                {priceDisplay !== "₹0" && (
                    <span style={{ fontSize: 14, color: "#6b7280" }}>{plan.period}</span>
                )}
            </div>

            {/* Yearly savings hint */}
            {yearly && plan.price.yearly !== plan.price.monthly && plan.price.yearly !== "₹0" && (
                <p style={{ fontSize: 12, color: "#22c55e", marginBottom: 4, fontWeight: 500 }}>
                    ↓ Saving vs monthly
                </p>
            )}

            <p style={{
                fontSize: 14, color: "#6b7280", lineHeight: 1.6,
                marginBottom: 36, marginTop: 8,
            }}>
                {plan.desc}
            </p>

            {/* Divider */}
            <div style={{
                height: 1,
                background: isHighlight
                    ? "linear-gradient(90deg, rgba(236,72,153,0.4), transparent)"
                    : "rgba(255,255,255,0.08)",
                marginBottom: 32,
            }} />

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
                {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{
                            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: f.included
                                ? isHighlight ? "rgba(236,72,153,0.2)" : "rgba(34,197,94,0.15)"
                                : "rgba(255,255,255,0.04)",
                            border: f.included
                                ? isHighlight ? "1px solid rgba(236,72,153,0.4)" : "1px solid rgba(34,197,94,0.3)"
                                : "1px solid rgba(255,255,255,0.08)",
                        }}>
                            {f.included ? (
                                <Check size={10} color={isHighlight ? "#ec4899" : "#22c55e"} strokeWidth={3} />
                            ) : (
                                <X size={8} color="rgba(255,255,255,0.2)" strokeWidth={2.5} />
                            )}
                        </span>
                        <span style={{
                            fontSize: 14,
                            color: f.included ? (isHighlight ? "rgba(255,255,255,0.88)" : "#a1a1aa") : "#374151",
                            textDecoration: f.included ? "none" : "none",
                        }}>
                            {f.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <a
                href={plan.ctaHref}
                style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8,
                    padding: "15px 28px",
                    borderRadius: 12,
                    background: isHighlight
                        ? "linear-gradient(135deg, #ec4899, #f97316)"
                        : "rgba(255,255,255,0.07)",
                    border: isHighlight
                        ? "none"
                        : "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: "-0.01em",
                    textDecoration: "none",
                    cursor: "pointer",
                    boxShadow: isHighlight ? "0 8px 24px rgba(236,72,153,0.35)" : "none",
                    transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    if (isHighlight) {
                        el.style.boxShadow = "0 12px 32px rgba(236,72,153,0.5)";
                        el.style.transform = "scale(1.02)";
                    } else {
                        el.style.background = "rgba(255,255,255,0.12)";
                        el.style.transform = "scale(1.02)";
                    }
                }}
                onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.transform = "scale(1)";
                    if (isHighlight) {
                        el.style.boxShadow = "0 8px 24px rgba(236,72,153,0.35)";
                    } else {
                        el.style.background = "rgba(255,255,255,0.07)";
                    }
                }}
            >
                {plan.cta} →
            </a>
        </div>
    );
}