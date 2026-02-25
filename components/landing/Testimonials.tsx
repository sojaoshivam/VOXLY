"use client";
import { useEffect, useRef, useState } from "react";
import { C, typography } from "./theme";
import { Reveal } from "./UI";

const testimonials = [
    { quote: "Saved me 3 hours every single week. I used to dread recording but now I just paste and go.", name: "Rahul S.", handle: "@creator_life", reels: "240K+", category: "Reels Creator" },
    { quote: "My reels sound 10x more professional. People keep asking what mic I use — it's just VOXLY.", name: "Priya M.", handle: "@factsdaily", reels: "580K+", category: "Facts Page" },
    { quote: "Perfect for faceless motivation pages. I scaled from 2 reels a week to 14.", name: "Amit K.", handle: "@motivation_hub", reels: "1.2M+", category: "Motivational" },
    { quote: "The tone options are insane. I can match any vibe — calm, hype, storytelling. Total game changer.", name: "Sneha R.", handle: "@storytime.reels", reels: "390K+", category: "Storytelling" },
    { quote: "I run 4 niche pages and VOXLY handles all of them. The consistency is unreal.", name: "Vikram D.", handle: "@nichehustle", reels: "820K+", category: "Multi-niche" },
    { quote: "Tried every AI voice tool out there. Nothing sounds as natural as this. My engagement doubled.", name: "Meera J.", handle: "@glowupwithmeera", reels: "155K+", category: "Lifestyle" },
    { quote: "I generate a week's worth of content in under 20 minutes. My schedule has never been this free.", name: "Arjun P.", handle: "@techreels.in", reels: "470K+", category: "Tech Niche" },
    { quote: "The Hindi and regional language support is fire. Finally a tool built for Indian creators.", name: "Divya T.", handle: "@desi_facts", reels: "2.1M+", category: "Regional Creator" },
];

const VISIBLE = 3;
const INTERVAL = 3200;

export function Testimonials() {
    const [active, setActive] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [dir, setDir] = useState<"left" | "right">("left");
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const total = testimonials.length;

    const advance = (direction: "left" | "right") => {
        if (animating) return;
        setDir(direction);
        setAnimating(true);
        setTimeout(() => {
            setActive((prev) =>
                direction === "left"
                    ? (prev + 1) % total
                    : (prev - 1 + total) % total
            );
            setAnimating(false);
        }, 380);
    };

    const resetTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => advance("left"), INTERVAL);
    };

    useEffect(() => {
        resetTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const getVisible = () =>
        Array.from({ length: VISIBLE }, (_, i) => testimonials[(active + i) % total]);

    const visible = getVisible();

    return (
        <section id="testimonials" style={{
            background: "transparent",
            borderTop: `1px solid ${C.rule}`,
            padding: "120px 40px",
            overflow: "hidden",
        }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>

                {/* Header */}
                <Reveal>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 72, flexWrap: "wrap", gap: 32 }}>
                        <div>
                            <p style={{
                                fontSize: 11, color: "#ec4899", textTransform: "uppercase",
                                letterSpacing: "0.18em", marginBottom: 16, fontWeight: 700,
                            }}>
                                Creator voices
                            </p>
                            <h2 style={{
                                fontFamily: typography.serif,
                                fontSize: "clamp(40px, 5vw, 60px)",
                                letterSpacing: "-0.025em",
                                fontWeight: 400,
                                color: "white",
                                lineHeight: 1.1,
                                margin: 0,
                            }}>
                                What{" "}
                                <em style={{
                                    fontStyle: "italic",
                                    color: "#ec4899",
                                }}>
                                    they're saying.
                                </em>
                            </h2>
                            <p style={{ marginTop: 16, fontSize: 15, color: "#6b7280", fontFamily: typography.serif, fontStyle: "italic" }}>
                                Over 50,000 creators already switched.
                            </p>
                        </div>

                        {/* Nav controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {/* Dot track */}
                            <div style={{ display: "flex", gap: 6, marginRight: 8 }}>
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setActive(i); resetTimer(); }}
                                        style={{
                                            width: active === i ? 20 : 6,
                                            height: 6,
                                            borderRadius: 3,
                                            background: active === i
                                                ? "linear-gradient(90deg, #ec4899, #f97316)"
                                                : "rgba(255,255,255,0.15)",
                                            border: "none",
                                            cursor: "pointer",
                                            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                            padding: 0,
                                        }}
                                    />
                                ))}
                            </div>

                            {[
                                { label: "←", action: () => { advance("right"); resetTimer(); } },
                                { label: "→", action: () => { advance("left"); resetTimer(); } },
                            ].map((btn, i) => (
                                <button
                                    key={i}
                                    onClick={btn.action}
                                    style={{
                                        width: 44, height: 44,
                                        borderRadius: "50%",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        background: "rgba(255,255,255,0.06)",
                                        color: "white",
                                        fontSize: 16,
                                        cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "all 0.2s ease",
                                        backdropFilter: "blur(8px)",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(236,72,153,0.2)";
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#ec4899";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
                                    }}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Reveal>

                {/* Cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 20,
                    transition: `opacity 0.38s ease, transform 0.38s ease`,
                    opacity: animating ? 0 : 1,
                    transform: animating
                        ? `translateX(${dir === "left" ? "-24px" : "24px"})`
                        : "translateX(0)",
                }} className="grid-3">
                    {visible.map((t, i) => (
                        <TestimonialCard key={`${active}-${i}`} t={t} i={i} />
                    ))}
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 40, position: "relative", height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1, overflow: "hidden" }}>
                    <div
                        key={active}
                        style={{
                            position: "absolute",
                            left: 0, top: 0, height: "100%",
                            width: "100%",
                            borderRadius: 1,
                            background: "linear-gradient(90deg, #ec4899, #f97316)",
                            animation: `progressShrink ${INTERVAL}ms linear forwards`,
                        }}
                    />
                </div>

                <style>{`
                    @keyframes progressShrink {
                        from { transform: scaleX(1); transform-origin: left; }
                        to   { transform: scaleX(0); transform-origin: left; }
                    }
                `}</style>
            </div>
        </section>
    );
}

function TestimonialCard({ t, i }: { t: typeof testimonials[0]; i: number }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(255,255,255,0.055)",
                backdropFilter: "blur(16px)",
                border: hovered
                    ? "1px solid rgba(236,72,153,0.4)"
                    : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 20,
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
                transform: hovered ? "translateY(-6px)" : "translateY(0)",
                boxShadow: hovered
                    ? "0 32px 64px rgba(236,72,153,0.15), 0 0 0 1px rgba(236,72,153,0.1)"
                    : "0 8px 24px rgba(0,0,0,0.12)",
                transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                animation: `cardIn 0.5s ease-out ${i * 0.08}s backwards`,
            }}
        >
            {/* Top row: category tag + stars */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#ec4899",
                    background: "rgba(236,72,153,0.12)",
                    border: "1px solid rgba(236,72,153,0.2)",
                    padding: "4px 10px",
                    borderRadius: 100,
                }}>
                    {t.category}
                </span>
                <div style={{ display: "flex", gap: 2 }}>
                    {[...Array(5)].map((_, k) => (
                        <svg key={k} width="12" height="12" viewBox="0 0 24 24" fill="#f97316">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    ))}
                </div>
            </div>

            {/* Quote mark */}
            <div style={{
                fontFamily: typography.serif,
                fontSize: 72,
                lineHeight: 0.7,
                color: "rgba(236,72,153,0.25)",
                marginBottom: 12,
                fontStyle: "italic",
                userSelect: "none",
            }}>
                "
            </div>

            {/* Quote text */}
            <p style={{
                fontFamily: typography.serif,
                fontStyle: "italic",
                fontSize: 18,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.88)",
                margin: 0,
                flex: 1,
                letterSpacing: "-0.01em",
            }}>
                {t.quote}
            </p>

            {/* Divider */}
            <div style={{
                height: 1,
                background: "linear-gradient(90deg, rgba(236,72,153,0.3), transparent)",
                margin: "28px 0",
            }} />

            {/* Author row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Avatar placeholder */}
                    <div style={{
                        width: 38, height: 38,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #ec4899, #f97316)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: "white",
                        flexShrink: 0,
                    }}>
                        {t.name[0]}
                    </div>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>{t.name}</p>
                        <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>{t.handle}</p>
                    </div>
                </div>

                <div style={{ textAlign: "right" }}>
                    <p style={{
                        fontSize: 15, fontWeight: 700,
                        background: "linear-gradient(135deg, #ec4899, #f97316)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        margin: 0,
                    }}>
                        {t.reels}
                    </p>
                    <p style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", margin: "2px 0 0" }}>
                        followers
                    </p>
                </div>
            </div>
        </div>
    );
}