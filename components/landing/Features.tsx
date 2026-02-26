"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, Waves, Globe, Zap, Check } from "lucide-react";
import { C, typography } from "./theme";
import { Reveal } from "./UI";

const features = [
    {
        no: "01",
        title: "No mic. No setup.",
        body: "Just paste your script and go. No recording booth, no equipment, no excuses. Your whole studio lives in a browser tab.",
        icon: <Mic className="w-5 h-5" />,
        stat: "0 equipment",
        statLabel: "needed",
        color: "#ec4899",
        tag: "Zero friction",
        visual: <MicVisual />,
    },
    {
        no: "02",
        title: "Natural pacing.",
        body: "AI tuned specifically to Instagram short-form. Breaths, pauses, emphasis — all dialed in so it never sounds robotic.",
        icon: <Waves className="w-5 h-5" />,
        stat: "98%",
        statLabel: "natural rating",
        color: "#8b5cf6",
        tag: "Human-grade",
        visual: <WaveVisual />,
    },
    {
        no: "03",
        title: "Hindi & Hinglish.",
        body: "Native accent that sounds like the creator, not a call center. Natively supports 12 Indian languages with regional nuance.",
        icon: <Globe className="w-5 h-5" />,
        stat: "12",
        statLabel: "languages",
        color: "#f97316",
        tag: "Built for India",
        visual: <LangVisual />,
    },
    {
        no: "04",
        title: "10-second turnaround.",
        body: "Script in. Studio-quality MP3 out. Download and drop it straight into CapCut — done before your chai gets cold.",
        icon: <Zap className="w-5 h-5" />,
        stat: "< 10s",
        statLabel: "per voiceover",
        color: "#22c55e",
        tag: "Instant",
        visual: <SpeedVisual />,
    },
];

/* ── Mini visual components for each feature ── */
function MicVisual() {
    const [pulse, setPulse] = useState(false);
    useEffect(() => {
        const t = setInterval(() => setPulse(p => !p), 1400);
        return () => clearInterval(t);
    }, []);
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {[1, 2, 3].map(r => (
                    <div key={r} style={{
                        position: "absolute",
                        width: r * 52, height: r * 52,
                        borderRadius: "50%",
                        border: "1px solid rgba(236,72,153,0.15)",
                        animation: `ripple 2.2s ease-out ${r * 0.4}s infinite`,
                    }} />
                ))}
                <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "linear-gradient(135deg, #ec4899, #f97316)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                    boxShadow: pulse ? "0 0 32px rgba(236,72,153,0.6)" : "0 0 16px rgba(236,72,153,0.3)",
                    transition: "box-shadow 0.7s ease",
                    position: "relative", zIndex: 1,
                }}>
                    <Mic className="w-7 h-7 text-white" />
                </div>
            </div>
        </div>
    );
}

function WaveVisual() {
    const [t, setT] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setT(prev => prev + 1), 80);
        return () => clearInterval(id);
    }, []);
    const bars = Array.from({ length: 16 });
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: "100%" }}>
            {bars.map((_, i) => {
                const h = 8 + Math.abs(Math.sin((t + i * 3) * 0.18)) * 40;
                return (
                    <div key={i} style={{
                        width: 5, borderRadius: 3,
                        height: h,
                        background: `linear-gradient(180deg, #8b5cf6, #ec4899)`,
                        transition: "height 0.15s ease",
                        opacity: 0.7 + Math.sin((t + i * 3) * 0.18) * 0.3,
                    }} />
                );
            })}
        </div>
    );
}

function LangVisual() {
    const langs = ["हिन्दी", "English", "Hinglish", "தமிழ்", "తెలుగు", "मराठी"];
    const [active, setActive] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setActive(a => (a + 1) % langs.length), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: "100%" }}>
            {langs.map((l, i) => (
                <div key={l} style={{
                    fontSize: i === active ? 18 : 12,
                    fontWeight: i === active ? 700 : 400,
                    color: i === active ? "white" : "rgba(255,255,255,0.2)",
                    transform: `scale(${i === active ? 1.05 : 0.95})`,
                    transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                    letterSpacing: i === active ? "0.02em" : "0",
                    fontFamily: typography.serif,
                }}>
                    {l}
                </div>
            ))}
        </div>
    );
}

function SpeedVisual() {
    const [pct, setPct] = useState(0);
    const [done, setDone] = useState(false);
    useEffect(() => {
        const reset = () => {
            setPct(0); setDone(false);
            let p = 0;
            const id = setInterval(() => {
                p += 12;
                if (p >= 100) { setPct(100); setDone(true); clearInterval(id); }
                else setPct(p);
            }, 80);
        };
        reset();
        const loop = setInterval(reset, 3800);
        return () => clearInterval(loop);
    }, []);
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, height: "100%" }}>
            <div style={{ position: "relative", width: 64, height: 64 }}>
                <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="5" />
                    <circle cx="32" cy="32" r="26" fill="none"
                        stroke="url(#spd)" strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                        style={{ transition: "stroke-dashoffset 0.15s ease" }}
                    />
                    <defs>
                        <linearGradient id="spd" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#86efac" />
                        </linearGradient>
                    </defs>
                </svg>
                <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: done ? 20 : 13, fontWeight: 700,
                    color: done ? "#22c55e" : "white",
                    transition: "all 0.3s ease",
                }}>
                    {done ? <Check className="w-5 h-5" strokeWidth={3} /> : `${pct}%`}
                </div>
            </div>
            <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {done ? "Ready to download" : "Generating..."}
            </span>
        </div>
    );
}

/* ════════════════════════════════════════
   FEATURES SECTION
════════════════════════════════════════ */
export function Features() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);

    /* Auto-cycle active feature */
    useEffect(() => {
        const t = setInterval(() => {
            setActiveIndex(i => (i + 1) % features.length);
        }, 3000);
        return () => clearInterval(t);
    }, []);

    const displayed = hoveredIndex !== null ? hoveredIndex : activeIndex;

    return (
        <section id="features" ref={sectionRef} style={{ padding: "80px 40px 140px", maxWidth: 1200, margin: "0 auto", position: "relative" }}>

            {/* Header */}
            <Reveal>
                <div style={{ marginBottom: 96, maxWidth: 720 }}>
                    <p style={{
                        fontSize: 11, color: "#ec4899", textTransform: "uppercase",
                        letterSpacing: "0.18em", marginBottom: 18, fontWeight: 700,
                    }}>
                        Why creators switch
                    </p>
                    <h2 style={{
                        fontFamily: typography.serif,
                        fontSize: "clamp(36px, 5vw, 60px)",
                        letterSpacing: "-0.025em",
                        fontWeight: 400,
                        lineHeight: 1.08,
                        color: "white",
                        margin: "0 0 20px",
                    }}>
                        The tool that replaces<br />
                        <em style={{
                            fontStyle: "italic",
                            background: "linear-gradient(110deg, #f97316, #fbbf24)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            your entire audio workflow
                        </em>
                    </h2>
                    <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.75, margin: 0, maxWidth: 480 }}>
                        Everything you need to go from script to post in under a minute. No gear. No excuses.
                    </p>
                </div>
            </Reveal>

            {/* Two-panel layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, alignItems: "start" }} className="features-grid">

                {/* Left: feature rows */}
                <div>
                    {features.map((f, i) => {
                        const isActive = displayed === i;
                        return (
                            <Reveal key={i} delay={i * 0.07}>
                                <div
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={() => setActiveIndex(i)}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "56px 1fr",
                                        gap: "0 28px",
                                        padding: "32px 28px",
                                        borderRadius: 20,
                                        cursor: "pointer",
                                        background: isActive
                                            ? "rgba(255,255,255,0.06)"
                                            : "transparent",
                                        border: `1px solid ${isActive ? `${f.color}30` : "transparent"}`,
                                        borderLeft: `3px solid ${isActive ? f.color : "rgba(255,255,255,0.07)"}`,
                                        transition: "all 0.35s cubic-bezier(0.34,1.2,0.64,1)",
                                        position: "relative",
                                        overflow: "hidden",
                                        marginBottom: 8,
                                        boxShadow: isActive ? `0 8px 32px ${f.color}14` : "none",
                                    }}
                                >
                                    {/* Active background glow */}
                                    {isActive && (
                                        <div style={{
                                            position: "absolute", inset: 0,
                                            background: `radial-gradient(ellipse at left center, ${f.color}08 0%, transparent 60%)`,
                                            pointerEvents: "none",
                                        }} />
                                    )}

                                    {/* Icon col */}
                                    <div style={{ paddingTop: 4 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 12,
                                            background: isActive
                                                ? `linear-gradient(135deg, ${f.color}30, ${f.color}10)`
                                                : "rgba(255,255,255,0.05)",
                                            border: `1px solid ${isActive ? f.color + "40" : "rgba(255,255,255,0.08)"}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 20,
                                            transition: "all 0.3s ease",
                                            boxShadow: isActive ? `0 4px 16px ${f.color}30` : "none",
                                        }}>
                                            {f.icon}
                                        </div>
                                    </div>

                                    {/* Content col */}
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                            <span style={{
                                                fontFamily: typography.serif,
                                                fontSize: "clamp(20px, 2.5vw, 26px)",
                                                letterSpacing: "-0.02em",
                                                fontWeight: 400,
                                                color: isActive ? "white" : "rgba(255,255,255,0.65)",
                                                transition: "color 0.25s ease",
                                                lineHeight: 1.2,
                                            }}>
                                                {f.title}
                                            </span>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                                                textTransform: "uppercase",
                                                padding: "3px 9px", borderRadius: 100,
                                                background: isActive ? `${f.color}20` : "rgba(255,255,255,0.05)",
                                                color: isActive ? f.color : "#6b7280",
                                                border: `1px solid ${isActive ? f.color + "35" : "transparent"}`,
                                                transition: "all 0.25s ease",
                                                whiteSpace: "nowrap",
                                            }}>
                                                {f.tag}
                                            </span>
                                        </div>

                                        <p style={{
                                            fontSize: 15,
                                            color: isActive ? "#9ca3af" : "#4b5563",
                                            lineHeight: 1.7,
                                            margin: 0,
                                            maxWidth: 480,
                                            transition: "color 0.25s ease",
                                        }}>
                                            {f.body}
                                        </p>

                                        {/* Inline stat */}
                                        {isActive && (
                                            <div style={{
                                                display: "inline-flex", alignItems: "baseline", gap: 6,
                                                marginTop: 16, padding: "8px 14px",
                                                borderRadius: 10,
                                                background: `${f.color}12`,
                                                border: `1px solid ${f.color}25`,
                                                animation: "fadeUp 0.3s ease forwards",
                                            }}>
                                                <span style={{
                                                    fontFamily: typography.serif,
                                                    fontSize: 22, fontWeight: 400,
                                                    color: f.color, letterSpacing: "-0.02em",
                                                }}>
                                                    {f.stat}
                                                </span>
                                                <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                                    {f.statLabel}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Number */}
                                    <div style={{
                                        position: "absolute", bottom: 18, right: 22,
                                        fontFamily: typography.serif,
                                        fontSize: 11, color: isActive ? `${f.color}60` : "rgba(255,255,255,0.08)",
                                        letterSpacing: "0.1em", fontStyle: "italic",
                                        transition: "color 0.3s ease",
                                    }}>
                                        {f.no}
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>

                {/* Right: visual panel */}
                <div style={{ position: "sticky", top: 100 }}>
                    <Reveal delay={0.2}>
                        <div style={{
                            borderRadius: 28,
                            background: "rgba(255,255,255,0.055)",
                            backdropFilter: "blur(20px)",
                            border: `1px solid ${features[displayed].color}25`,
                            overflow: "hidden",
                            boxShadow: `0 24px 64px ${features[displayed].color}15, 0 0 0 1px ${features[displayed].color}10`,
                            transition: "border-color 0.4s ease, box-shadow 0.4s ease",
                        }}>
                            {/* Panel header */}
                            <div style={{
                                padding: "20px 24px",
                                borderBottom: `1px solid rgba(255,255,255,0.07)`,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {["#ef4444", "#f59e0b", "#22c55e"].map(c => (
                                            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 12, color: "#4b5563", letterSpacing: "0.06em" }}>
                                        voxly.app
                                    </span>
                                </div>
                                <div style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: features[displayed].color,
                                    boxShadow: `0 0 8px ${features[displayed].color}`,
                                    animation: "pulse 2s ease-in-out infinite",
                                }} />
                            </div>

                            {/* Visual area */}
                            <div style={{
                                height: 240,
                                padding: "32px 24px",
                                background: `radial-gradient(ellipse at 50% 50%, ${features[displayed].color}10 0%, transparent 65%)`,
                                transition: "background 0.4s ease",
                                position: "relative",
                            }}>
                                <div key={displayed} style={{ height: "100%", animation: "fadeUp 0.4s ease forwards" }}>
                                    {features[displayed].visual}
                                </div>
                            </div>

                            {/* Feature info footer */}
                            <div style={{
                                padding: "20px 24px",
                                borderTop: "1px solid rgba(255,255,255,0.06)",
                                background: "rgba(0,0,0,0.2)",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>
                                            {features[displayed].title}
                                        </p>
                                        <p style={{ fontSize: 12, color: "#4b5563", margin: "3px 0 0" }}>
                                            {features[displayed].tag}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{
                                            fontFamily: typography.serif,
                                            fontSize: 24, margin: 0,
                                            color: features[displayed].color,
                                            fontWeight: 400, letterSpacing: "-0.02em",
                                        }}>
                                            {features[displayed].stat}
                                        </p>
                                        <p style={{ fontSize: 10, color: "#4b5563", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                            {features[displayed].statLabel}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress dots */}
                                <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
                                    {features.map((_, i) => (
                                        <div key={i}
                                            onClick={() => setActiveIndex(i)}
                                            style={{
                                                flex: displayed === i ? 3 : 1,
                                                height: 3, borderRadius: 2,
                                                background: displayed === i
                                                    ? `linear-gradient(90deg, ${features[i].color}, ${features[i].color}80)`
                                                    : "rgba(255,255,255,0.1)",
                                                transition: "flex 0.4s cubic-bezier(0.34,1.2,0.64,1), background 0.3s ease",
                                                cursor: "pointer",
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes ripple {
                    0%   { transform: scale(0.8); opacity: 0.6; }
                    100% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.5; }
                }
                @media (max-width: 900px) {
                    .features-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}