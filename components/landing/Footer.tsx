import React, { useEffect, useRef, useState } from "react";
import { typography } from "./theme";
import Image from "next/image";
import { Instagram, Twitter, MessageCircle, Youtube } from "lucide-react";

const LINKS = {
    Product: ["Features", "How it Works", "Pricing", "Demo"],
    Legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/privacy" }
    ],
    Follow: [
        { label: "Instagram", icon: <Instagram size={18} />, href: "#" },
        { label: "Twitter / X", icon: <Twitter size={18} />, href: "#" },
        { label: "Discord", icon: <MessageCircle size={18} />, href: "#" },
        { label: "YouTube", icon: <Youtube size={18} />, href: "#" },
    ],
};

/* ── Mini animated waveform for logo area ── */
function FooterWave() {
    const [t, setT] = useState(0);
    const rafRef = useRef<number>(0);
    const lastRef = useRef<number>(0);

    useEffect(() => {
        const tick = (ts: number) => {
            const dt = ts - (lastRef.current || ts);
            lastRef.current = ts;
            setT(p => p + dt * 0.002);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 2, height: 18 }}>
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{
                    width: 2.5, borderRadius: 2,
                    height: 3 + Math.abs(Math.sin(t + i * 0.6)) * 12,
                    background: "linear-gradient(180deg, #ec4899, #f97316)",
                    opacity: 0.5 + Math.abs(Math.sin(t + i * 0.6)) * 0.5,
                    transition: "height 0.08s ease",
                }} />
            ))}
        </div>
    );
}

/* ── Scroll-triggered reveal for the big wordmark ── */
function BigWordmark() {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.3 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} style={{
            textAlign: "center",
            padding: "80px 0 72px",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Background glow */}
            <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at 50% 100%, rgba(236,72,153,0.08) 0%, transparent 65%)",
                pointerEvents: "none",
            }} />

            {/* Horizontal rule above */}
            <div style={{
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(236,72,153,0.3), rgba(249,115,22,0.3), transparent)",
                marginBottom: 72,
            }} />

            <div style={{
                fontFamily: typography.serif,
                fontSize: "clamp(64px, 14vw, 180px)",
                fontWeight: 400,
                letterSpacing: "-0.04em",
                fontStyle: "italic",
                lineHeight: 0.9,
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                userSelect: "none",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: "opacity 1s ease, transform 1s ease",
                position: "relative",
            }}>
                VOXLY
                {/* Gradient overlay on the text */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(135deg, rgba(236,72,153,0.25) 0%, rgba(249,115,22,0.15) 50%, transparent 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    pointerEvents: "none",
                }} />
            </div>

            <p style={{
                marginTop: 24,
                fontSize: 14,
                color: "#374151",
                fontFamily: typography.serif,
                fontStyle: "italic",
                letterSpacing: "0.04em",
                opacity: visible ? 1 : 0,
                transition: "opacity 0.8s ease 0.4s",
            }}>
                Professional voiceovers for creators — 10 seconds at a time.
            </p>
        </div>
    );
}

/* ── Social icon button ── */
function SocialBtn({ item }: { item: { label: string; icon: React.ReactNode; href: string } }) {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href={item.href}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", borderRadius: 12,
                background: hovered ? "rgba(236,72,153,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.07)"}`,
                textDecoration: "none",
                transition: "all 0.25s cubic-bezier(0.34,1.2,0.64,1)",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                color: hovered ? "white" : "#9ca3af",
            }}
        >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: hovered ? "white" : "#6b7280", fontWeight: 500, transition: "color 0.2s" }}>
                {item.label}
            </span>
        </a>
    );
}

/* ── Footer link ── */
function FooterLink({ label, href }: { label: string; href: string }) {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href={href}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 14, textDecoration: "none",
                color: hovered ? "white" : "#6b7280",
                transition: "color 0.2s ease",
                marginBottom: 14,
                paddingLeft: hovered ? 6 : 0,
                transition2: "padding-left 0.25s ease",
            } as React.CSSProperties}
        >
            {hovered && (
                <span style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: "linear-gradient(135deg, #ec4899, #f97316)",
                    flexShrink: 0,
                    animation: "fadeUp 0.2s ease forwards",
                }} />
            )}
            {label}
        </a>
    );
}

/* ════════════════════════════════════════
   FOOTER
════════════════════════════════════════ */
export function Footer() {
    return (
        <footer style={{
            background: "#08080c",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Top noise texture overlay */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
                opacity: 0.4,
                pointerEvents: "none",
            }} />

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 40px 0", position: "relative" }}>

                {/* ── Top section: logo + newsletter + columns ── */}
                <div style={{
                    display: "grid",
                    gap: 80,
                    marginBottom: 64,
                    alignItems: "start",
                }} className="footer-top">

                    {/* Brand col */}
                    <div>
                        {/* Logo */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 16px rgba(236,72,153,0.4)",
                                overflow: "hidden"
                            }}>
                                <Image src="/logo.png" alt="VOXLY" width={36} height={36} className="object-cover" />
                            </div>
                            <span style={{
                                fontFamily: typography.serif,
                                fontSize: 20, fontStyle: "italic",
                                color: "white", letterSpacing: "-0.02em",
                            }}>
                                VOXLY
                            </span>
                        </div>

                        {/* Live waveform */}
                        <div style={{ marginBottom: 20 }}>
                            <FooterWave />
                        </div>

                        <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.75, marginBottom: 28, maxWidth: 240 }}>
                            The fastest way to go from script to studio-quality voiceover. Built for Indian creators.
                        </p>

                        {/* Status badge */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "8px 14px", borderRadius: 100,
                            background: "rgba(34,197,94,0.08)",
                            border: "1px solid rgba(34,197,94,0.2)",
                        }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: "#22c55e",
                                boxShadow: "0 0 6px #22c55e",
                                animation: "pulse 2s ease-in-out infinite",
                            }} />
                            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, letterSpacing: "0.04em" }}>
                                All systems operational
                            </span>
                        </div>
                    </div>

                    {/* Links + socials grid */}
                    <div style={{
                        display: "grid",
                        gap: 40,
                    }} className="footer-links-grid">

                        {/* Product */}
                        <div>
                            <p style={{
                                fontSize: 11, color: "#ec4899",
                                textTransform: "uppercase", letterSpacing: "0.16em",
                                fontWeight: 700, marginBottom: 20,
                            }}>
                                Product
                            </p>
                            {LINKS.Product.map(l => (
                                <FooterLink key={l} label={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} />
                            ))}
                        </div>

                        {/* Legal */}
                        <div>
                            <p style={{
                                fontSize: 11, color: "#ec4899",
                                textTransform: "uppercase", letterSpacing: "0.16em",
                                fontWeight: 700, marginBottom: 20,
                            }}>
                                Legal
                            </p>
                            {LINKS.Legal.map(l => (
                                <FooterLink key={l.label} label={l.label} href={l.href} />
                            ))}
                        </div>

                        {/* Socials */}
                        <div>
                            <p style={{
                                fontSize: 11, color: "#ec4899",
                                textTransform: "uppercase", letterSpacing: "0.16em",
                                fontWeight: 700, marginBottom: 20,
                            }}>
                                Follow
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {LINKS.Follow.map(item => (
                                    <SocialBtn key={item.label} item={item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats strip ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 1,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    overflow: "hidden",
                    marginBottom: 0,
                }} className="footer-stats">
                    {[
                        { value: "10K+", label: "Reels Generated" },
                        { value: "4.2K+", label: "Active Creators" },
                        { value: "12", label: "Languages" },
                        { value: "< 10s", label: "Per Voiceover" },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            padding: "24px 28px",
                            background: "#08080c",
                            textAlign: "center",
                        }}>
                            <p style={{
                                fontFamily: typography.serif,
                                fontSize: 28, fontWeight: 400,
                                letterSpacing: "-0.03em",
                                background: "linear-gradient(135deg, white 30%, rgba(236,72,153,0.7))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                margin: "0 0 4px",
                            }}>
                                {stat.value}
                            </p>
                            <p style={{ fontSize: 11, color: "#374151", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, margin: 0 }}>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Giant wordmark ── */}
                <BigWordmark />

                {/* ── Bottom bar ── */}
                <div style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    padding: "24px 0 32px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexWrap: "wrap", gap: 16,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>
                            © {new Date().getFullYear()} VOXLY. Made with 🧡 for Indian creators.
                        </p>
                        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)" }} />
                        <p style={{ fontSize: 12, color: "#1f2937", margin: 0, letterSpacing: "0.04em" }}>
                            v2.0.0
                        </p>
                    </div>

                    <a href="/login" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "10px 20px", borderRadius: 100,
                        background: "linear-gradient(135deg, #ec4899, #f97316)",
                        color: "white", fontWeight: 700, fontSize: 13,
                        textDecoration: "none", letterSpacing: "-0.01em",
                        boxShadow: "0 4px 16px rgba(236,72,153,0.3)",
                        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05) translateY(-1px)";
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(236,72,153,0.5)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1) translateY(0)";
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(236,72,153,0.3)";
                        }}
                    >
                        Start for free →
                    </a>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.4; }
                }
                .footer-top { grid-template-columns: 280px 1fr; }
                .footer-links-grid { grid-template-columns: 1fr 1fr 1fr; }
                @media (max-width: 900px) {
                    .footer-top { grid-template-columns: 1fr !important; gap: 48px !important; }
                    .footer-stats { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 600px) {
                    .footer-links-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
                    .footer-stats { grid-template-columns: 1fr 1fr !important; }
                }
            `}</style>
        </footer>
    );
}