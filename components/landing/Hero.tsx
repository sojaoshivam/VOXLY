"use client";
import { useEffect, useRef, useState } from "react";
import { C, typography } from "./theme";
import { Waveform } from "./UI";

/* ─── Animated waveform bars shown in the audio card ─── */
function LiveBars({ active }: { active: boolean }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32 }}>
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        width: 3,
                        borderRadius: 2,
                        background: `linear-gradient(180deg, #ec4899, #f97316)`,
                        height: active ? `${18 + Math.sin(i * 0.8) * 14}px` : "4px",
                        animation: active
                            ? `barDance ${0.5 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite alternate`
                            : "none",
                        transition: "height 0.4s ease",
                        opacity: active ? 1 : 0.3,
                    }}
                />
            ))}
        </div>
    );
}

/* ─── Rotating ring of language tags ─── */
const LANGS = ["Hindi", "English", "Hinglish", "Tamil", "Telugu", "Marathi", "Bengali", "Kannada"];

function LanguageOrbit() {
    const [angle, setAngle] = useState(0);
    const rafRef = useRef<number>(0);
    const lastRef = useRef<number>(0);

    useEffect(() => {
        const tick = (ts: number) => {
            const dt = ts - (lastRef.current || ts);
            lastRef.current = ts;
            setAngle(a => (a + dt * 0.018) % 360);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    const rx = 210, ry = 70;

    return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {LANGS.map((lang, i) => {
                const a = ((i / LANGS.length) * 360 + angle) * (Math.PI / 180);
                const x = 50 + (Math.cos(a) * rx) / 7;
                const y = 50 + (Math.sin(a) * ry) / 3.5;
                const scale = 0.7 + (Math.sin(a) + 1) * 0.18;
                const opacity = 0.18 + (Math.sin(a) + 1) * 0.22;
                return (
                    <span key={lang} style={{
                        position: "absolute",
                        left: `${x}%`, top: `${y}%`,
                        transform: `translate(-50%, -50%) scale(${scale})`,
                        opacity,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: i % 2 === 0 ? "#ec4899" : "white",
                        transition: "opacity 0.1s",
                        whiteSpace: "nowrap",
                    }}>
                        {lang}
                    </span>
                );
            })}
        </div>
    );
}

/* ─── Mesh grid background ─── */
function MeshGrid() {
    return (
        <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035, pointerEvents: "none" }}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.8" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
    );
}

/* ─── Floating stat cards ─── */
function StatCard({ style, icon, value, label, delay }: {
    style?: React.CSSProperties;
    icon: string; value: string; label: string; delay: number;
}) {
    return (
        <div style={{
            position: "absolute",
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 12,
            whiteSpace: "nowrap",
            opacity: 0,
            animation: `fadeUp 0.7s ease ${delay}s forwards`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            ...style,
        }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.2 }}>{value}</p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════
   HERO
════════════════════════════════════════ */
export function Hero() {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            // reset to start if finished
            if (audioRef.current.currentTime >= audioRef.current.duration) {
                audioRef.current.currentTime = 0;
            }
            audioRef.current.play();
            setPlaying(true);
        }
    };

    useEffect(() => {
        const mv = (e: MouseEvent) => {
            setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
            setCursorPos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", mv);
        return () => window.removeEventListener("mousemove", mv);
    }, []);

    const px = (mousePos.x - 0.5) * 30;
    const py = (mousePos.y - 0.5) * 18;

    return (
        <>
            {/* ── Hidden Audio Element ── */}
            <audio
                ref={audioRef}
                src="/hero-demo.mp3"
                onEnded={() => setPlaying(false)}
                controlsList="nodownload"
            />

            {/* ── Custom cursor glow ── */}
            <div style={{
                position: "fixed",
                left: cursorPos.x, top: cursorPos.y,
                width: 400, height: 400,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 65%)",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: 0,
                transition: "left 0.08s ease, top 0.08s ease",
            }} />

            <section style={{
                paddingTop: 140, paddingBottom: 120,
                paddingLeft: 40, paddingRight: 40,
                maxWidth: 1200, margin: "0 auto",
                position: "relative", overflow: "visible",
            }}>

                {/* ── Background mesh ── */}
                <div style={{ position: "absolute", inset: 0, borderRadius: 32, overflow: "hidden", pointerEvents: "none" }}>
                    <MeshGrid />

                    {/* Main glow blobs */}
                    <div style={{
                        position: "absolute", width: 800, height: 800, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 60%)",
                        left: `calc(50% - 400px + ${px * 1.5}px)`,
                        top: `calc(30% - 400px + ${py}px)`,
                        transition: "left 0.15s ease, top 0.15s ease",
                    }} />
                    <div style={{
                        position: "absolute", width: 500, height: 500, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 60%)",
                        right: `calc(10% + ${-px * 0.8}px)`,
                        top: `calc(20% + ${py * 0.5}px)`,
                        transition: "right 0.2s ease, top 0.2s ease",
                    }} />

                    {/* Horizontal light streak */}
                    <div style={{
                        position: "absolute",
                        left: 0, right: 0,
                        top: "45%",
                        height: 1,
                        background: "linear-gradient(90deg, transparent 0%, rgba(236,72,153,0.15) 30%, rgba(249,115,22,0.15) 70%, transparent 100%)",
                    }} />
                </div>

                {/* ── Language orbit ── */}
                <LanguageOrbit />

                {/* ── Floating stat cards ── */}
                <StatCard
                    icon="🎙️" value="10,000+" label="reels this month"
                    delay={1.0}
                    style={{ top: "8%", right: "2%", animation: `fadeUp 0.7s ease 1s forwards, floatCard 5s ease-in-out 1.7s infinite alternate` }}
                />
                <StatCard
                    icon="⚡" value="< 10s" label="generation time"
                    delay={1.15}
                    style={{ bottom: "22%", right: "0%", animation: `fadeUp 0.7s ease 1.15s forwards, floatCard 6s ease-in-out 1.85s infinite alternate` }}
                />
                <StatCard
                    icon="🌐" value="12 langs" label="supported"
                    delay={1.3}
                    style={{ top: "28%", left: "-2%", animation: `fadeUp 0.7s ease 1.3s forwards, floatCard 4.5s ease-in-out 2s infinite alternate` }}
                />

                {/* ── Main hero content ── */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 0, position: "relative", zIndex: 2 }}>

                    {/* Live badge */}
                    <div style={{ opacity: 0, animation: "fadeUp 0.7s ease 0.1s forwards", marginBottom: 40 }}>
                        <div className="pill" style={{ animation: "pulse 2.5s ease-in-out infinite", display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
                            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}>10,000+ reels generated this month</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div style={{ maxWidth: 760, marginBottom: 28 }}>
                        <h1 style={{
                            fontFamily: typography.serif,
                            fontSize: "clamp(52px, 8.5vw, 96px)",
                            lineHeight: 1.02,
                            letterSpacing: "-0.03em",
                            fontWeight: 400,
                            color: "white",
                            margin: 0,
                            opacity: 0,
                            animation: "fadeUp 0.8s ease 0.2s forwards",
                            transform: `translate(${px * 0.3}px, ${py * 0.2}px)`,
                            transition: "transform 0.15s ease",
                        }}>
                            Viral-ready<br />
                            <span style={{
                                fontStyle: "italic",
                                background: "linear-gradient(110deg, #ec4899 10%, #f97316 55%, #fbbf24 90%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                display: "inline-block",
                                animation: "shimmer 4s ease-in-out infinite",
                                backgroundSize: "200% 100%",
                            }}>
                                voiceovers.
                            </span>
                            <br />
                            <span style={{
                                fontFamily: typography.sans,
                                fontWeight: 300,
                                fontSize: "0.72em",
                                letterSpacing: "-0.01em",
                                color: "rgba(255,255,255,0.45)",
                                fontStyle: "italic",
                            }}>
                                No mic. No retakes.
                            </span>
                        </h1>
                    </div>

                    {/* Sub */}
                    <p style={{
                        fontSize: 18,
                        color: "#9ca3af",
                        lineHeight: 1.75,
                        maxWidth: 520,
                        margin: "0 0 52px",
                        fontWeight: 400,
                        opacity: 0,
                        animation: "fadeUp 0.8s ease 0.35s forwards",
                    }}>
                        Paste your script. Get a human-sounding, Instagram-ready voice in under 10 seconds.
                        Built natively for{" "}
                        <span style={{ color: "white", fontWeight: 500 }}>Hindi & Hinglish</span> creators.
                    </p>

                    {/* CTA buttons */}
                    <div style={{
                        display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center",
                        opacity: 0, animation: "fadeUp 0.8s ease 0.5s forwards",
                        marginBottom: 72,
                    }}>
                        <a href="/login"
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 10,
                                padding: "16px 36px", borderRadius: 100,
                                background: "linear-gradient(135deg, #ec4899, #f97316)",
                                color: "white", fontWeight: 700, fontSize: 15,
                                letterSpacing: "-0.01em", textDecoration: "none",
                                boxShadow: "0 12px 40px rgba(236,72,153,0.4), 0 0 0 1px rgba(236,72,153,0.3)",
                                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px) scale(1.04)";
                                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 20px 56px rgba(236,72,153,0.55), 0 0 0 1px rgba(236,72,153,0.4)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0) scale(1)";
                                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 40px rgba(236,72,153,0.4), 0 0 0 1px rgba(236,72,153,0.3)";
                            }}
                        >
                            Generate Voiceover
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </a>

                        <button
                            onClick={togglePlay}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 12,
                                padding: "16px 28px", borderRadius: 100,
                                background: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                backdropFilter: "blur(12px)",
                                color: "white", fontWeight: 600, fontSize: 15,
                                cursor: "pointer",
                                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(236,72,153,0.4)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
                            }}
                        >
                            {/* Play/pause circle */}
                            <span style={{
                                width: 30, height: 30, borderRadius: "50%",
                                background: playing ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.12)",
                                border: playing ? "1px solid rgba(236,72,153,0.5)" : "1px solid rgba(255,255,255,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.25s ease",
                                flexShrink: 0,
                            }}>
                                {playing
                                    ? <span style={{ width: 9, height: 9, background: "#ec4899", borderRadius: 2 }} />
                                    : <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z" /></svg>
                                }
                            </span>
                            {playing ? "Pause Demo" : "Hear a Sample"}
                        </button>
                    </div>

                    {/* ── Audio player card ── */}
                    <div style={{
                        opacity: 0,
                        animation: "fadeUp 0.8s ease 0.65s forwards",
                        width: "100%", maxWidth: 560,
                    }}>
                        <div style={{
                            background: "rgba(255,255,255,0.055)",
                            backdropFilter: "blur(24px)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            borderRadius: 20,
                            padding: "24px 28px",
                            display: "flex", flexDirection: "column", gap: 18,
                            boxShadow: playing
                                ? "0 0 60px rgba(236,72,153,0.15), 0 12px 40px rgba(0,0,0,0.2)"
                                : "0 8px 32px rgba(0,0,0,0.15)",
                            transition: "box-shadow 0.4s ease",
                        }}>
                            {/* Track info row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: "linear-gradient(135deg, #ec4899, #f97316)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 18,
                                        boxShadow: playing ? "0 4px 16px rgba(236,72,153,0.5)" : "none",
                                        transition: "box-shadow 0.3s",
                                    }}>
                                        🎙️
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "white", margin: 0 }}>Demo Voiceover</p>
                                        <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>Hindi · Motivational tone</p>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    padding: "4px 10px", borderRadius: 100,
                                    background: playing ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.06)",
                                    color: playing ? "#ec4899" : "#6b7280",
                                    border: playing ? "1px solid rgba(236,72,153,0.3)" : "1px solid transparent",
                                    transition: "all 0.3s ease",
                                }}>
                                    {playing ? "● Live" : "Preview"}
                                </span>
                            </div>

                            {/* Waveform bars */}
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>0:00</span>
                                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <LiveBars active={playing} />
                                </div>
                                <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.08em", flexShrink: 0 }}>0:08</span>
                            </div>

                            {/* Progress track */}
                            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{
                                    height: "100%", borderRadius: 2,
                                    background: "linear-gradient(90deg, #ec4899, #f97316)",
                                    width: playing ? "100%" : "0%",
                                    transition: playing ? "width 8s linear" : "width 0.3s ease",
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Trust strip */}
                    <div style={{
                        marginTop: 48,
                        display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", justifyContent: "center",
                        opacity: 0, animation: "fadeUp 0.6s ease 0.85s forwards",
                    }}>
                        {[
                            { label: "No credit card", icon: "✓" },
                            { label: "Free plan forever", icon: "✓" },
                            { label: "Ready in 10 seconds", icon: "✓" },
                        ].map((item, i) => (
                            <span key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#4b5563", fontWeight: 500 }}>
                                <span style={{ color: "#22c55e", fontWeight: 800, fontSize: 14 }}>{item.icon}</span>
                                {item.label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes floatCard {
                    from { transform: translateY(0px); }
                    to   { transform: translateY(-10px); }
                }
                @keyframes barDance {
                    from { height: 4px; }
                    to   { height: 28px; }
                }
                @keyframes shimmer {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.7; }
                }
            `}</style>
        </>
    );
}