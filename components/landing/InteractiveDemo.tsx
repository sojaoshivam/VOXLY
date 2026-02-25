"use client";
import { useEffect, useRef, useState } from "react";
import { typography } from "./theme";
import { Reveal } from "./UI";

/* ── Animated waveform bars ── */
function LiveBars({ active, color = "#ec4899", bars = 24 }: { active: boolean; color?: string; bars?: number }) {
    const [t, setT] = useState(0);
    const rafRef = useRef<number>(0);
    const lastRef = useRef<number>(0);

    useEffect(() => {
        if (!active) return;
        const tick = (ts: number) => {
            const dt = ts - (lastRef.current || ts);
            lastRef.current = ts;
            setT(prev => prev + dt * 0.004);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [active]);

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 40 }}>
            {Array.from({ length: bars }).map((_, i) => {
                const h = active
                    ? 4 + Math.abs(Math.sin(t + i * 0.42) * 28 + Math.sin(t * 1.3 + i * 0.8) * 10)
                    : 3;
                return (
                    <div key={i} style={{
                        width: 3, borderRadius: 2,
                        height: h,
                        background: `linear-gradient(180deg, ${color}, ${color}60)`,
                        transition: active ? "height 0.06s ease" : "height 0.4s ease",
                        opacity: active ? 0.6 + Math.abs(Math.sin(t + i * 0.42)) * 0.4 : 0.25,
                    }} />
                );
            })}
        </div>
    );
}

/* ── Circular progress ring ── */
function ProgressRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct / 100)}
                style={{ transition: "stroke-dashoffset 0.25s ease" }}
            />
        </svg>
    );
}

const TABS = [
    { lang: "Hindi", flag: "🇮🇳", color: "#ec4899" },
    { lang: "Hinglish", flag: "🔥", color: "#f97316" },
    { lang: "English", flag: "🌐", color: "#8b5cf6" },
];

const EXAMPLES = [
    "Ek psychology trick jo sunne waalo ko 3 seconds mein hook kar le...",
    "Bhai, ye life hack ne meri productivity 10x kar di. Try karo!",
    "The one habit nobody talks about. Backed by science. 60 seconds.",
];

const TONES = ["Storytelling", "Energetic", "Calm", "Motivational"];

const TONE_TO_VOICE: Record<string, string> = {
    "Storytelling": "ritu",
    "Energetic": "rohan",
    "Calm": "dev",
    "Motivational": "aditya"
};

const getWordCount = (str: string) => str.trim().split(/\s+/).filter(Boolean).length;

export function InteractiveDemo() {
    const [activeTab, setActiveTab] = useState(0);
    const [script, setScript] = useState(EXAMPLES[0]);
    const [tone, setTone] = useState("Storytelling");
    const [playing, setPlaying] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [progress, setProgress] = useState(0);
    const [wordCount, setWordCount] = useState(getWordCount(EXAMPLES[0]));
    const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const MAX_WORDS = 100;

    /* Generate from backend API */
    const handleGenerate = async () => {
        if (generating || generated) return;
        setGenerating(true);
        setProgress(0);

        let p = 0;
        progressRef.current = setInterval(() => {
            p += Math.random() * 8 + 4;
            if (p > 90) p = 90;
            setProgress(Math.floor(p));
        }, 400);

        try {
            const voiceId = TONE_TO_VOICE[tone] || "aditya";
            const language = TABS[activeTab].lang;

            const res = await fetch("/api/tts/demo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    script,
                    voiceId,
                    language,
                    model: "bulbul:v3"
                })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to generate demo");
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            clearInterval(progressRef.current!);
            setProgress(100);

            setTimeout(() => {
                setGenerating(false);
                setGenerated(true);
                if (audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
                }
            }, 300);
        } catch (err: any) {
            clearInterval(progressRef.current!);
            setGenerating(false);
            setProgress(0);
            alert(err.message || "Failed to generate audio.");
        }
    };

    const handleReset = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            if (audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
                URL.revokeObjectURL(audioRef.current.src);
            }
            audioRef.current.src = "/demo.mp3";
        }
        setGenerated(false);
        setPlaying(false);
        setProgress(0);
    };

    const handleTabChange = (i: number) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            if (audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
                URL.revokeObjectURL(audioRef.current.src);
            }
            audioRef.current.src = "/demo.mp3";
        }
        setActiveTab(i);
        setScript(EXAMPLES[i]);
        setWordCount(getWordCount(EXAMPLES[i]));
        setGenerated(false);
        setPlaying(false);
    };

    return (
        <section id="demo" style={{ padding: "120px 40px", position: "relative" }}>
            {/* ── Hidden Audio Element ── */}
            <audio
                ref={audioRef}
                src="/demo.mp3"
                onEnded={() => setPlaying(false)}
                controlsList="nodownload"
            />

            {/* Background glow */}
            <div style={{
                position: "absolute", top: "20%", left: "50%",
                transform: "translateX(-50%)",
                width: 700, height: 400, borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(236,72,153,0.07) 0%, transparent 65%)",
                pointerEvents: "none",
            }} />

            <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>

                {/* Header */}
                <Reveal>
                    <div style={{ marginBottom: 64 }}>
                        <p style={{
                            fontSize: 11, color: "#ec4899", textTransform: "uppercase",
                            letterSpacing: "0.18em", fontWeight: 700, marginBottom: 18,
                        }}>
                            Live demo
                        </p>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
                            <h2 style={{
                                fontFamily: typography.serif,
                                fontSize: "clamp(36px, 5vw, 56px)",
                                color: "white",
                                letterSpacing: "-0.025em",
                                fontWeight: 400,
                                margin: 0,
                                lineHeight: 1.1,
                            }}>
                                Try it right here.
                            </h2>
                            <em style={{
                                fontFamily: typography.serif,
                                fontSize: "clamp(28px, 4vw, 48px)",
                                letterSpacing: "-0.025em",
                                fontStyle: "italic",
                                background: "linear-gradient(110deg, #ec4899, #f97316)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                lineHeight: 1.2,
                            }}>
                                Right now.
                            </em>
                        </div>
                        <p style={{ marginTop: 16, fontSize: 15, color: "#6b7280", fontFamily: typography.serif, fontStyle: "italic" }}>
                            No sign-up needed for the preview. Paste your script and hear the magic.
                        </p>
                    </div>
                </Reveal>

                {/* Studio card */}
                <Reveal delay={0.1}>
                    <div style={{
                        background: "rgba(8,8,12,0.85)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 28,
                        overflow: "hidden",
                        boxShadow: "0 32px 96px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
                    }}>

                        {/* Title bar */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 24px",
                            borderBottom: "1px solid rgba(255,255,255,0.07)",
                            background: "rgba(255,255,255,0.025)",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ display: "flex", gap: 6 }}>
                                    {["#ef4444", "#f59e0b", "#22c55e"].map(c => (
                                        <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.75 }} />
                                    ))}
                                </div>
                                <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)", margin: "0 6px" }} />
                                <span style={{ fontSize: 12, color: "#4b5563", letterSpacing: "0.06em" }}>
                                    voxly.app / studio
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                    width: 7, height: 7, borderRadius: "50%",
                                    background: "#22c55e",
                                    boxShadow: "0 0 6px #22c55e",
                                    animation: "pulse 2s ease-in-out infinite",
                                }} />
                                <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    Online
                                </span>
                            </div>
                        </div>

                        {/* Main grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px" }} className="demo-grid">

                            {/* ── LEFT: Input panel ── */}
                            <div style={{ padding: "32px 36px", borderRight: "1px solid rgba(255,255,255,0.07)" }}>

                                {/* Language tabs */}
                                <div style={{ marginBottom: 24 }}>
                                    <p style={{ fontSize: 11, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 10 }}>
                                        Language
                                    </p>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {TABS.map((tab, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleTabChange(i)}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: 7,
                                                    padding: "8px 16px", borderRadius: 100,
                                                    border: `1px solid ${activeTab === i ? tab.color + "45" : "rgba(255,255,255,0.08)"}`,
                                                    background: activeTab === i ? `${tab.color}14` : "transparent",
                                                    color: activeTab === i ? "white" : "#4b5563",
                                                    fontSize: 13, fontWeight: activeTab === i ? 600 : 400,
                                                    cursor: "pointer",
                                                    transition: "all 0.25s cubic-bezier(0.34,1.2,0.64,1)",
                                                    boxShadow: activeTab === i ? `0 2px 12px ${tab.color}20` : "none",
                                                }}
                                            >
                                                <span style={{ fontSize: 14 }}>{tab.flag}</span>
                                                {tab.lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Script textarea */}
                                <div style={{ marginBottom: 24, position: "relative" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                        <p style={{ fontSize: 11, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, margin: 0 }}>
                                            Script
                                        </p>
                                        <span style={{
                                            fontSize: 11,
                                            color: wordCount > MAX_WORDS * 0.85 ? "#f97316" : "#4b5563",
                                            transition: "color 0.2s",
                                        }}>
                                            {wordCount}/{MAX_WORDS} words
                                        </span>
                                    </div>
                                    <textarea
                                        value={script}
                                        onChange={e => {
                                            const val = e.target.value;
                                            const wc = getWordCount(val);
                                            // Allow backspace even if over limit, but block forward typing
                                            if (wc <= MAX_WORDS || val.length < script.length) {
                                                setScript(val);
                                                setWordCount(wc);
                                                setGenerated(false);
                                                if (audioRef.current) {
                                                    audioRef.current.pause();
                                                    audioRef.current.currentTime = 0;
                                                    setPlaying(false);
                                                }
                                            }
                                        }}
                                        style={{
                                            width: "100%", height: 130,
                                            background: "rgba(255,255,255,0.03)",
                                            border: "1px solid rgba(255,255,255,0.09)",
                                            borderRadius: 14,
                                            padding: "16px 18px",
                                            color: "#f4f4f5",
                                            fontFamily: typography.sans,
                                            fontSize: 15, lineHeight: 1.75,
                                            resize: "none", outline: "none",
                                            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                                            boxSizing: "border-box",
                                        } as React.CSSProperties}
                                        onFocus={e => {
                                            e.target.style.borderColor = TABS[activeTab].color + "70";
                                            e.target.style.boxShadow = `0 0 0 3px ${TABS[activeTab].color}12`;
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = "rgba(255,255,255,0.09)";
                                            e.target.style.boxShadow = "none";
                                        }}
                                    />
                                    {/* Char fill bar */}
                                    <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, marginTop: 6, overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", borderRadius: 1,
                                            width: `${Math.min(100, (wordCount / MAX_WORDS) * 100)}%`,
                                            background: wordCount > MAX_WORDS * 0.85
                                                ? "linear-gradient(90deg, #f97316, #ef4444)"
                                                : `linear-gradient(90deg, ${TABS[activeTab].color}, ${TABS[activeTab].color}80)`,
                                            transition: "width 0.15s ease, background 0.3s ease",
                                        }} />
                                    </div>
                                </div>

                                {/* Tone selector */}
                                <div style={{ marginBottom: 28 }}>
                                    <p style={{ fontSize: 11, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 10 }}>
                                        Tone
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {TONES.map(o => (
                                            <button
                                                key={o}
                                                onClick={() => { setTone(o); setGenerated(false); }}
                                                style={{
                                                    padding: "7px 16px", borderRadius: 100,
                                                    border: `1px solid ${tone === o ? TABS[activeTab].color + "50" : "rgba(255,255,255,0.08)"}`,
                                                    background: tone === o ? `${TABS[activeTab].color}18` : "transparent",
                                                    color: tone === o ? "white" : "#6b7280",
                                                    fontSize: 13, fontWeight: tone === o ? 600 : 400,
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease",
                                                    whiteSpace: "nowrap",
                                                    boxShadow: tone === o ? `0 2px 10px ${TABS[activeTab].color}20` : "none",
                                                }}
                                            >
                                                {o}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating || generated || !script.trim()}
                                    style={{
                                        width: "100%", padding: "15px 24px",
                                        borderRadius: 14, border: "none",
                                        background: generated
                                            ? "rgba(34,197,94,0.15)"
                                            : generating
                                                ? "rgba(255,255,255,0.06)"
                                                : "linear-gradient(135deg, #ec4899, #f97316)",
                                        color: generated ? "#22c55e" : "white",
                                        fontWeight: 700, fontSize: 14,
                                        cursor: generating || generated ? "default" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                        boxShadow: generated ? "none" : generating ? "none" : "0 8px 28px rgba(236,72,153,0.35)",
                                        transition: "all 0.35s ease",
                                        position: "relative", overflow: "hidden",
                                    } as React.CSSProperties}
                                >
                                    {generating && (
                                        <div style={{
                                            position: "absolute", inset: 0,
                                            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) ${progress}%, transparent ${progress + 5}%)`,
                                            animation: "shimmerSweep 1.2s ease-in-out infinite",
                                        }} />
                                    )}
                                    {generated ? (
                                        <><span style={{ fontSize: 16 }}>✓</span> Voiceover Ready!</>
                                    ) : generating ? (
                                        <><Spinner /> Generating... {progress}%</>
                                    ) : (
                                        <><span style={{ fontSize: 16 }}>⚡</span> Generate Voiceover</>
                                    )}
                                </button>
                            </div>

                            {/* ── RIGHT: Output panel ── */}
                            <div style={{
                                padding: "32px 28px",
                                display: "flex", flexDirection: "column",
                                background: "rgba(0,0,0,0.2)",
                                gap: 0,
                            }}>
                                <p style={{ fontSize: 11, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 28 }}>
                                    Output
                                </p>

                                {/* Player circle */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, flex: 1 }}>
                                    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {/* Ring progress */}
                                        {generating && (
                                            <div style={{ position: "absolute" }}>
                                                <ProgressRing pct={progress} color={TABS[activeTab].color} size={96} />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (generated && audioRef.current) {
                                                    if (playing) {
                                                        audioRef.current.pause();
                                                        setPlaying(false);
                                                    } else {
                                                        if (audioRef.current.currentTime >= audioRef.current.duration) {
                                                            audioRef.current.currentTime = 0;
                                                        }
                                                        audioRef.current.play();
                                                        setPlaying(true);
                                                    }
                                                }
                                            }}
                                            style={{
                                                width: 72, height: 72, borderRadius: "50%",
                                                background: generated
                                                    ? playing
                                                        ? "linear-gradient(135deg, #ec4899, #f97316)"
                                                        : `linear-gradient(135deg, ${TABS[activeTab].color}40, ${TABS[activeTab].color}20)`
                                                    : "rgba(255,255,255,0.05)",
                                                border: `2px solid ${generated ? TABS[activeTab].color + "50" : "rgba(255,255,255,0.08)"}`,
                                                cursor: generated ? "pointer" : "default",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                                boxShadow: playing ? `0 0 40px ${TABS[activeTab].color}60` : "none",
                                            }}
                                        >
                                            {generating ? (
                                                <span style={{ fontSize: 22 }}>⚡</span>
                                            ) : generated ? (
                                                playing
                                                    ? <span style={{ width: 16, height: 16, background: "white", borderRadius: 3 }} />
                                                    : <svg width="20" height="20" viewBox="0 0 24 24" fill={TABS[activeTab].color}><path d="M5 3l14 9-14 9V3z" /></svg>
                                            ) : (
                                                <span style={{ fontSize: 22, opacity: 0.3 }}>🎙️</span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Waveform */}
                                    <div style={{
                                        width: "100%", padding: "14px 0",
                                        background: "rgba(255,255,255,0.02)",
                                        borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
                                        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                                    }}>
                                        <LiveBars active={playing} color={TABS[activeTab].color} bars={20} />
                                        <p style={{ fontSize: 11, color: "#374151", margin: 0 }}>
                                            {playing ? "▶ Playing 0:08..." : generated ? "0:08 · ready" : "waiting..."}
                                        </p>
                                    </div>

                                    {/* Meta chips */}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                                        {[
                                            TABS[activeTab].lang,
                                            tone,
                                            "MP3 · HD",
                                        ].map(chip => (
                                            <span key={chip} style={{
                                                fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                                                textTransform: "uppercase",
                                                padding: "4px 9px", borderRadius: 100,
                                                background: generated ? `${TABS[activeTab].color}12` : "rgba(255,255,255,0.04)",
                                                color: generated ? TABS[activeTab].color : "#374151",
                                                border: `1px solid ${generated ? TABS[activeTab].color + "25" : "transparent"}`,
                                                transition: "all 0.3s ease",
                                            }}>
                                                {chip}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Reset / try again */}
                                    <div style={{ width: "100%", marginTop: "auto" }}>
                                        {generated ? (
                                            <button
                                                onClick={handleReset}
                                                style={{
                                                    width: "100%",
                                                    padding: "13px", borderRadius: 12,
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    background: "rgba(255,255,255,0.05)",
                                                    color: "white", fontSize: 13, fontWeight: 600,
                                                    cursor: "pointer",
                                                    transition: "all 0.25s ease",
                                                    animation: "fadeUp 0.3s ease forwards",
                                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                                }}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
                                                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)";
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                                                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                                                }}
                                            >
                                                ↺ Try another script
                                            </button>
                                        ) : (
                                            <div style={{
                                                padding: "13px", borderRadius: 12,
                                                background: "rgba(255,255,255,0.03)",
                                                border: "1px dashed rgba(255,255,255,0.07)",
                                                textAlign: "center",
                                                fontSize: 12, color: "#374151",
                                            }}>
                                                Generate to preview
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Below card trust strip */}
                <Reveal delay={0.2}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 36, marginTop: 32, flexWrap: "wrap" }}>
                        {[
                            { icon: "🔒", text: "No sign-up for preview" },
                            { icon: "🎧", text: "Studio HD quality" },
                            { icon: "⚡", text: "Under 10 seconds" },
                        ].map((item, i) => (
                            <span key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#374151", fontWeight: 500 }}>
                                <span>{item.icon}</span>
                                {item.text}
                            </span>
                        ))}
                    </div>
                </Reveal>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.5; }
                }
                @keyframes shimmerSweep {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                @media (max-width: 720px) {
                    .demo-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}

function Spinner() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    );
}