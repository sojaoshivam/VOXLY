"use client";
import { useEffect, useRef, useState } from "react";
import { typography } from "./theme";
import { Reveal } from "./UI";

const STATS = [
    {
        value: 10000,
        suffix: "+",
        label: "Reels Generated",
        sublabel: "and counting every hour",
        icon: "🎬",
        color: "#ec4899",
        colorB: "#f97316",
        detail: "From motivation to facts to storytelling — creators are shipping daily.",
    },
    {
        value: 4200,
        suffix: "+",
        label: "Active Creators",
        sublabel: "across India",
        icon: "🧑‍🎤",
        color: "#8b5cf6",
        colorB: "#ec4899",
        detail: "Pages of every niche — faceless, regional, educational, entertainment.",
    },
    {
        value: 98,
        suffix: "%",
        label: "Satisfaction Rate",
        sublabel: "from verified users",
        icon: "⭐",
        color: "#f97316",
        colorB: "#fbbf24",
        detail: "Rated across naturalness, speed, and language accuracy.",
    },
];

/* ── Animated count-up hook ── */
function useCountUp(target: number, duration = 1800, started: boolean) {
    const [val, setVal] = useState(0);
    const raf = useRef<number>(0);

    useEffect(() => {
        if (!started) return;
        const start = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(ease * target));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [started, target, duration]);

    return val;
}

/* ── Individual stat card ── */
function StatCard({ stat, i }: { stat: typeof STATS[0]; i: number }) {
    const [hovered, setHovered] = useState(false);
    const [started, setStarted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const count = useCountUp(stat.value, 1600 + i * 200, started);

    /* Trigger count on scroll-into-view */
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStarted(true); },
            { threshold: 0.4 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const fmtValue = stat.value >= 1000
        ? (count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : count.toString())
        : count.toString();

    return (
        <Reveal delay={i * 0.12}>
            <div
                ref={ref}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    position: "relative",
                    borderRadius: 28,
                    padding: "52px 40px 44px",
                    background: hovered
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${hovered ? stat.color + "40" : "rgba(255,255,255,0.08)"}`,
                    overflow: "hidden",
                    cursor: "default",
                    transform: hovered ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(1)",
                    boxShadow: hovered
                        ? `0 32px 72px ${stat.color}20, 0 0 0 1px ${stat.color}15`
                        : "0 4px 24px rgba(0,0,0,0.15)",
                    transition: "all 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)",
                }}
            >
                {/* Background glow blob */}
                <div style={{
                    position: "absolute", top: -60, right: -60,
                    width: 200, height: 200, borderRadius: "50%",
                    background: `radial-gradient(circle, ${stat.color}18 0%, transparent 65%)`,
                    transition: "opacity 0.4s ease",
                    opacity: hovered ? 1 : 0.4,
                    pointerEvents: "none",
                }} />

                {/* Subtle grid texture */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.025, pointerEvents: "none" }}>
                    <defs>
                        <pattern id={`g${i}`} width="28" height="28" patternUnits="userSpaceOnUse">
                            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth="0.6" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#g${i})`} />
                </svg>

                {/* Top row: icon + tag */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, position: "relative" }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: `linear-gradient(135deg, ${stat.color}28, ${stat.colorB}14)`,
                        border: `1px solid ${stat.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22,
                        boxShadow: hovered ? `0 4px 20px ${stat.color}35` : "none",
                        transition: "box-shadow 0.35s ease",
                        transform: hovered ? "scale(1.1) rotate(-4deg)" : "scale(1) rotate(0deg)",
                        transition2: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    } as React.CSSProperties}>
                        {stat.icon}
                    </div>

                    <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        padding: "5px 11px", borderRadius: 100,
                        background: hovered ? `${stat.color}18` : "rgba(255,255,255,0.05)",
                        color: hovered ? stat.color : "#4b5563",
                        border: `1px solid ${hovered ? stat.color + "30" : "transparent"}`,
                        transition: "all 0.3s ease",
                    }}>
                        Live stat
                    </span>
                </div>

                {/* Count */}
                <div style={{ position: "relative", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                        <span style={{
                            fontFamily: typography.serif,
                            fontSize: "clamp(52px, 5vw, 72px)",
                            fontWeight: 400,
                            letterSpacing: "-0.04em",
                            lineHeight: 1,
                            background: `linear-gradient(135deg, white 30%, ${stat.color}90)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            transition: "opacity 0.2s ease",
                        }}>
                            {fmtValue}
                        </span>
                        <span style={{
                            fontFamily: typography.serif,
                            fontSize: "clamp(28px, 3vw, 38px)",
                            fontWeight: 400,
                            color: stat.color,
                            letterSpacing: "-0.02em",
                            lineHeight: 1,
                        }}>
                            {stat.suffix}
                        </span>
                    </div>
                </div>

                {/* Label */}
                <p style={{
                    fontSize: 17, fontWeight: 600,
                    color: "white",
                    margin: "0 0 4px",
                    letterSpacing: "-0.01em",
                }}>
                    {stat.label}
                </p>
                <p style={{
                    fontSize: 12,
                    color: "#4b5563",
                    margin: "0 0 28px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                }}>
                    {stat.sublabel}
                </p>

                {/* Divider */}
                <div style={{
                    height: 1,
                    background: `linear-gradient(90deg, ${stat.color}30, transparent)`,
                    marginBottom: 20,
                }} />

                {/* Detail text */}
                <p style={{
                    fontSize: 13,
                    color: hovered ? "#9ca3af" : "#374151",
                    lineHeight: 1.65,
                    margin: 0,
                    transition: "color 0.3s ease",
                }}>
                    {stat.detail}
                </p>

                {/* Bottom left number watermark */}
                <div style={{
                    position: "absolute", bottom: 20, right: 24,
                    fontFamily: typography.serif,
                    fontSize: 11, fontStyle: "italic",
                    color: hovered ? `${stat.color}50` : "rgba(255,255,255,0.06)",
                    letterSpacing: "0.08em",
                    transition: "color 0.3s ease",
                }}>
                    0{i + 1}
                </div>
            </div>
        </Reveal>
    );
}

/* ════════════════════════════════════════
   STATS SECTION
════════════════════════════════════════ */
export function Stats() {
    return (
        <section style={{ padding: "100px 40px", maxWidth: 1200, margin: "0 auto" }}>

            {/* Section header */}
            <Reveal>
                <div style={{ textAlign: "center", marginBottom: 72 }}>
                    <p style={{
                        fontSize: 11, color: "#ec4899",
                        textTransform: "uppercase", letterSpacing: "0.18em",
                        fontWeight: 700, marginBottom: 14,
                    }}>
                        By the numbers
                    </p>
                    <h2 style={{
                        fontFamily: typography.serif,
                        fontSize: "clamp(32px, 4vw, 48px)",
                        fontWeight: 400,
                        letterSpacing: "-0.025em",
                        color: "white",
                        margin: 0,
                        lineHeight: 1.2,
                    }}>
                        Built for creators.{" "}
                        <em style={{
                            fontStyle: "italic",
                            background: "linear-gradient(110deg, #ec4899, #f97316)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            Proven by results.
                        </em>
                    </h2>
                </div>
            </Reveal>

            {/* Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
            }} className="stats-grid">
                {STATS.map((stat, i) => (
                    <StatCard key={i} stat={stat} i={i} />
                ))}
            </div>

            {/* Bottom trust bar */}
            <Reveal>
                <div style={{
                    marginTop: 56,
                    padding: "24px 36px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 48,
                    flexWrap: "wrap",
                }}>
                    {[
                        { icon: "🔄", text: "Updated in real-time" },
                        { icon: "✅", text: "Verified by users" },
                        { icon: "🇮🇳", text: "India-first platform" },
                        { icon: "🚀", text: "Growing every day" },
                    ].map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <span style={{ fontSize: 16 }}>{item.icon}</span>
                            <span style={{ fontSize: 13, color: "#4b5563", fontWeight: 500, letterSpacing: "0.02em" }}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </Reveal>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: 1fr !important; }
                }
                @media (min-width: 769px) and (max-width: 1024px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </section>
    );
}