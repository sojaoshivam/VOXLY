"use client";
import { useEffect, useRef, useState } from "react";
import { C, typography } from "./theme";
import { Reveal } from "./UI";

const FLOATING_WORDS = [
    "Motivational", "Faceless", "Storytelling", "Hindi", "Viral",
    "Hinglish", "Facts", "Cinematic", "Reels", "Studio",
];

export function FinalCTA() {
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const [btnHovered, setBtnHovered] = useState(false);
    const [counted, setCounted] = useState(false);
    const [count, setCount] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);
    const TARGET = 50000;

    /* Parallax mouse tracking */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
        };
        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
    }, []);

    /* Count-up on scroll into view */
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !counted) {
                    setCounted(true);
                    let start = 0;
                    const step = Math.ceil(TARGET / 60);
                    const interval = setInterval(() => {
                        start += step;
                        if (start >= TARGET) { setCount(TARGET); clearInterval(interval); }
                        else setCount(start);
                    }, 16);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [counted]);

    const px = (mousePos.x - 0.5) * 28;
    const py = (mousePos.y - 0.5) * 16;

    return (
        <section
            ref={sectionRef}
            style={{ background: "transparent", padding: "160px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}
        >
            {/* Ambient glow blobs that follow mouse */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute",
                    width: 600, height: 600, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(236,72,153,0.13) 0%, transparent 65%)",
                    left: `calc(50% - 300px + ${px * 1.8}px)`,
                    top: `calc(50% - 300px + ${py * 1.8}px)`,
                    transition: "left 0.12s ease, top 0.12s ease",
                }} />
                <div style={{
                    position: "absolute",
                    width: 400, height: 400, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 65%)",
                    left: `calc(60% - 200px + ${px * -1.2}px)`,
                    top: `calc(40% - 200px + ${py * -1.2}px)`,
                    transition: "left 0.18s ease, top 0.18s ease",
                }} />
            </div>

            {/* Floating tag words */}
            {FLOATING_WORDS.map((word, i) => {
                const angle = (i / FLOATING_WORDS.length) * Math.PI * 2;
                const rx = 420, ry = 180;
                const cx = 50 + Math.cos(angle) * rx / 10;
                const cy = 50 + Math.sin(angle) * ry / 5;
                const offsetX = px * (0.3 + (i % 3) * 0.15);
                const offsetY = py * (0.3 + (i % 4) * 0.12);
                return (
                    <div key={word} style={{
                        position: "absolute",
                        left: `calc(${cx}% + ${offsetX}px)`,
                        top: `calc(${cy}% + ${offsetY}px)`,
                        transform: "translate(-50%, -50%)",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: i % 3 === 0 ? "rgba(236,72,153,0.35)" : "rgba(255,255,255,0.1)",
                        pointerEvents: "none",
                        userSelect: "none",
                        transition: "left 0.15s ease, top 0.15s ease",
                        animation: `floatWord ${4 + (i % 3)}s ease-in-out ${i * 0.4}s infinite alternate`,
                        whiteSpace: "nowrap",
                    }}>
                        {word}
                    </div>
                );
            })}

            {/* Main content */}
            <Reveal>
                <div style={{ maxWidth: 820, margin: "0 auto", position: "relative", zIndex: 2 }}>

                    {/* Eyebrow */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
                        <div style={{ width: 32, height: 1, background: "rgba(236,72,153,0.4)" }} />
                        <span style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
                            textTransform: "uppercase", color: "#ec4899",
                        }}>
                            Start today — it's free
                        </span>
                        <div style={{ width: 32, height: 1, background: "rgba(236,72,153,0.4)" }} />
                    </div>

                    {/* Headline */}
                    <h2 style={{
                        fontFamily: typography.serif,
                        fontSize: "clamp(40px, 6vw, 68px)",
                        color: "white",
                        letterSpacing: "-0.025em",
                        fontWeight: 400,
                        lineHeight: 1.1,
                        marginBottom: 16,
                        transform: `translate(${px * 0.4}px, ${py * 0.25}px)`,
                        transition: "transform 0.12s ease",
                    }}>
                        Ready to give your words<br />
                        <em style={{
                            background: "linear-gradient(135deg, #ec4899 20%, #f97316 80%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontStyle: "italic",
                        }}>
                            the voice they deserve?
                        </em>
                    </h2>

                    {/* Social proof count */}
                    <p style={{
                        fontSize: 15,
                        color: "#6b7280",
                        marginBottom: 52,
                        fontFamily: typography.serif,
                        fontStyle: "italic",
                    }}>
                        Join{" "}
                        <span style={{
                            fontStyle: "normal",
                            fontFamily: typography.serif,
                            fontWeight: 400,
                            fontSize: 17,
                            color: "white",
                        }}>
                            {count.toLocaleString("en-IN")}+
                        </span>
                        {" "}creators already growing with VOXLY.
                    </p>

                    {/* CTA button */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                        <a
                            href="/login"
                            onMouseEnter={() => setBtnHovered(true)}
                            onMouseLeave={() => setBtnHovered(false)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "18px 44px",
                                borderRadius: 100,
                                background: "linear-gradient(135deg, #ec4899, #f97316)",
                                color: "white",
                                fontWeight: 700,
                                fontSize: 16,
                                letterSpacing: "-0.01em",
                                textDecoration: "none",
                                cursor: "pointer",
                                transform: btnHovered ? "translateY(-4px) scale(1.03)" : "translateY(0) scale(1)",
                                boxShadow: btnHovered
                                    ? "0 20px 60px rgba(236,72,153,0.5), 0 0 0 8px rgba(236,72,153,0.08)"
                                    : "0 8px 32px rgba(236,72,153,0.3)",
                                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-block",
                                    transform: btnHovered ? "rotate(-12deg) scale(1.2)" : "rotate(0deg) scale(1)",
                                    transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    fontSize: 18,
                                }}
                            >
                                🎙️
                            </span>
                            Create Your First Voiceover
                            <span style={{
                                display: "inline-block",
                                transform: btnHovered ? "translateX(4px)" : "translateX(0)",
                                transition: "transform 0.25s ease",
                            }}>
                                →
                            </span>
                        </a>

                        {/* Trust badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
                            {[
                                { icon: "✓", text: "No credit card" },
                                { icon: "✓", text: "Free forever plan" },
                                { icon: "✓", text: "Ready in 10 seconds" },
                            ].map((badge, i) => (
                                <span key={i} style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    fontSize: 13, color: "#4b5563",
                                    fontWeight: 500,
                                }}>
                                    <span style={{ color: "#22c55e", fontWeight: 700 }}>{badge.icon}</span>
                                    {badge.text}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Bottom decoration */}
                    <div style={{
                        marginTop: 80,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                        opacity: 0.25,
                    }}>
                        <div style={{ height: 1, width: 60, background: "white" }} />
                        <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "white" }}>
                            VOXLY
                        </span>
                        <div style={{ height: 1, width: 60, background: "white" }} />
                    </div>
                </div>
            </Reveal>

            <style>{`
                @keyframes floatWord {
                    from { opacity: 0.6; transform: translate(-50%, -50%) translateY(0px); }
                    to   { opacity: 1;   transform: translate(-50%, -50%) translateY(-10px); }
                }
            `}</style>
        </section>
    );
}