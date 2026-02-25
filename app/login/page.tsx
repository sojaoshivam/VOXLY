"use client";

import { signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/app/components/theme";

const serif = "'Instrument Serif', serif";
const sans = "'DM Sans', sans-serif";

/* ── Animated waveform bars ── */
function WaveBars({ active = true }: { active?: boolean }) {
    const [t, setT] = useState(0);
    const rafRef = useRef<number>(0);
    const lastRef = useRef<number>(0);
    useEffect(() => {
        const tick = (ts: number) => {
            const dt = ts - (lastRef.current || ts);
            lastRef.current = ts;
            setT(p => p + dt * 0.0025);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 20 }}>
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                    width: 2.5, borderRadius: 2,
                    height: 3 + Math.abs(Math.sin(t + i * 0.55)) * 14,
                    background: "linear-gradient(180deg, #ec4899, #f97316)",
                    opacity: 0.5 + Math.abs(Math.sin(t + i * 0.55)) * 0.5,
                    transition: "height 0.08s ease",
                }} />
            ))}
        </div>
    );
}

/* ── Floating word tags for the left panel ── */
const WORDS = ["Hindi", "Viral", "Studio", "Hinglish", "Reels", "Faceless", "Tamil", "10x"];
function FloatingWords({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
    return (
        <>
            {WORDS.map((word, i) => {
                const angle = (i / WORDS.length) * Math.PI * 2;
                const cx = 50 + Math.cos(angle) * 32;
                const cy = 50 + Math.sin(angle) * 28;
                const ox = (mouseX - 0.5) * (8 + i * 2);
                const oy = (mouseY - 0.5) * (6 + i * 1.5);
                return (
                    <div key={word} style={{
                        position: "absolute",
                        left: `calc(${cx}% + ${ox}px)`,
                        top: `calc(${cy}% + ${oy}px)`,
                        transform: "translate(-50%,-50%)",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: i % 3 === 0 ? "rgba(236,72,153,0.45)" : "rgba(255,255,255,0.12)",
                        pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
                        transition: "left 0.2s ease, top 0.2s ease",
                    }}>
                        {word}
                    </div>
                );
            })}
        </>
    );
}

/* ── Social stat pill ── */
function StatPill({ icon, value, label }: { icon: string; value: string; label: string }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", borderRadius: 12,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
        }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.1 }}>{value}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
            </div>
        </div>
    );
}

/* ── Input field ── */
function InputField({
    id, label, type, value, onChange, placeholder, rightEl, accentColor
}: {
    id: string; label: string; type: string;
    value: string; onChange: (v: string) => void;
    placeholder: string; rightEl?: React.ReactNode; accentColor: string;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: focused ? "white" : "#9ca3af", transition: "color 0.2s" }}>
                    {label}
                </label>
                {rightEl}
            </div>
            <div style={{
                position: "relative",
                borderRadius: 12,
                border: `1px solid ${focused ? accentColor + "60" : "rgba(255,255,255,0.08)"}`,
                boxShadow: focused ? `0 0 0 3px ${accentColor}14` : "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                background: "rgba(255,255,255,0.04)",
            }}>
                <input
                    id={id} type={type} value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required placeholder={placeholder}
                    style={{
                        width: "100%", padding: "13px 16px",
                        background: "transparent", border: "none",
                        color: "white", fontSize: 15, outline: "none",
                        fontFamily: sans, boxSizing: "border-box",
                    } as React.CSSProperties}
                />
            </div>
        </div>
    );
}

/* ════════════════════════════════════════
   LOGIN PAGE
════════════════════════════════════════ */
export default function LoginPage() {
    const { C } = useTheme();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const mv = (e: MouseEvent) => {
            setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
        };
        window.addEventListener("mousemove", mv);
        return () => window.removeEventListener("mousemove", mv);
    }, []);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await signIn("credentials", { redirect: false, email, password });
            if (result?.error) setError("Invalid email or password. Please try again.");
            else router.push("/dashboard");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => signIn("google", { callbackUrl: "/dashboard" });

    const px = (mousePos.x - 0.5) * 20;
    const py = (mousePos.y - 0.5) * 14;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#08080c", fontFamily: sans, overflow: "hidden" }}>

            {/* ════ LEFT PANEL ════ */}
            <div style={{
                display: "none",
                flex: 1,
                position: "relative",
                overflow: "hidden",
                background: "#050508",
            }} className="login-left">
                <style>{`
                    @media (min-width: 1024px) { .login-left { display: block !important; } }
                    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
                    @keyframes shimmer {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}</style>

                {/* Background image */}
                <Image
                    src="https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=2670&auto=format&fit=crop"
                    alt="Recording Studio"
                    fill
                    style={{ objectFit: "cover", opacity: 0.18 }}
                    priority
                />

                {/* Gradient overlays */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(249,115,22,0.06) 50%, transparent 100%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #08080c 0%, transparent 50%)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 70%, #08080c 100%)" }} />

                {/* Mesh grid */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none" }}>
                    <defs>
                        <pattern id="lgrid" width="48" height="48" patternUnits="userSpaceOnUse">
                            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.7" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#lgrid)" />
                </svg>

                {/* Parallax glow blobs */}
                <div style={{
                    position: "absolute", width: 600, height: 600, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 60%)",
                    left: `calc(30% + ${px * 1.5}px)`, top: `calc(25% + ${py}px)`,
                    transition: "left 0.2s ease, top 0.2s ease",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", width: 350, height: 350, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 60%)",
                    right: `calc(10% + ${-px * 0.8}px)`, bottom: `calc(30% + ${-py * 0.8}px)`,
                    transition: "right 0.2s ease, bottom 0.2s ease",
                    pointerEvents: "none",
                }} />

                {/* Floating keyword tags */}
                <FloatingWords mouseX={mousePos.x} mouseY={mousePos.y} />

                {/* Top logo */}
                <div style={{
                    position: "absolute", top: 40, left: 48,
                    display: "flex", alignItems: "center", gap: 10,
                    animation: "fadeUp 0.6s ease 0.1s both",
                }}>
                    <Image src="/logo.png" alt="VOXLY" width={32} height={32} style={{ borderRadius: 9, objectFit: "cover" }} />
                    <span style={{ fontFamily: serif, fontSize: 20, fontStyle: "italic", color: "white", letterSpacing: "-0.02em" }}>
                        VOXLY
                    </span>
                </div>

                {/* Center headline */}
                <div style={{
                    position: "absolute",
                    top: "50%", left: 48, right: 48,
                    transform: `translate(${px * 0.3}px, calc(-50% + ${py * 0.2}px))`,
                    transition: "transform 0.15s ease",
                    animation: "fadeUp 0.8s ease 0.2s both",
                }}>
                    <p style={{ fontSize: 11, color: "#ec4899", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, marginBottom: 18 }}>
                        Welcome back
                    </p>
                    <h2 style={{
                        fontFamily: serif,
                        fontSize: "clamp(36px, 4.5vw, 56px)",
                        fontWeight: 400, fontStyle: "italic",
                        color: "white", letterSpacing: "-0.025em",
                        lineHeight: 1.1, margin: "0 0 20px",
                    }}>
                        Give your words<br />
                        <span style={{
                            background: "linear-gradient(110deg, #ec4899 10%, #f97316 55%, #fbbf24 90%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            backgroundSize: "200% 100%", animation: "shimmer 4s ease-in-out infinite",
                        }}>
                            the voice they
                        </span>{" "}
                        deserve.
                    </h2>
                    <WaveBars />
                </div>

                {/* Bottom stat pills */}
                <div style={{
                    position: "absolute", bottom: 52, left: 48, right: 48,
                    display: "flex", gap: 12, flexWrap: "wrap",
                    animation: "fadeUp 0.7s ease 0.5s both",
                }}>
                    <StatPill icon="🎬" value="10K+" label="reels generated" />
                    <StatPill icon="⚡" value="< 10s" label="per voiceover" />
                    <StatPill icon="🌐" value="12 langs" label="supported" />
                </div>
            </div>

            {/* ════ RIGHT PANEL: Form ════ */}
            <div style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "40px 24px",
                background: "#08080c",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Subtle right-side background glow */}
                <div style={{
                    position: "absolute", top: "30%", right: "-10%",
                    width: 400, height: 400, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)",
                    pointerEvents: "none",
                }} />

                <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>

                    {/* Mobile logo */}
                    <div style={{ marginBottom: 44, display: "flex", alignItems: "center", gap: 10 }} className="mobile-logo">
                        <style>{`.login-left ~ div .mobile-logo { display: flex; } @media (min-width: 1024px) { .mobile-logo { display: none !important; } }`}</style>
                        <Image src="/logo.png" alt="VOXLY" width={32} height={32} style={{ borderRadius: 9, objectFit: "cover" }} />
                        <Link href="/" style={{ textDecoration: "none" }}>
                            <span style={{ fontFamily: serif, fontSize: 20, fontStyle: "italic", color: "white", letterSpacing: "-0.02em" }}>
                                VOXLY
                            </span>
                        </Link>
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: 36, animation: "fadeUp 0.6s ease 0.1s both" }}>
                        <h1 style={{
                            fontFamily: serif, fontSize: 38, fontWeight: 400,
                            color: "white", margin: "0 0 10px", letterSpacing: "-0.025em",
                            lineHeight: 1.1,
                        }}>
                            Welcome back.<br />
                            <em style={{
                                background: "linear-gradient(135deg, #ec4899, #f97316)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>
                                Let's create.
                            </em>
                        </h1>
                        <p style={{ color: "#6b7280", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                            Sign in to your account to continue.
                        </p>
                    </div>

                    {/* Google button */}
                    <div style={{ marginBottom: 28, animation: "fadeUp 0.6s ease 0.15s both" }}>
                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                width: "100%", padding: "13px 20px", borderRadius: 12,
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                                transition: "all 0.25s ease",
                                fontFamily: sans,
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.10)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)";
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                            }}
                        >
                            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, flexShrink: 0 }}>
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 28, animation: "fadeUp 0.6s ease 0.2s both" }}>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                        <span style={{ padding: "0 16px", fontSize: 12, color: "#374151", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            or with email
                        </span>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#f87171",
                            padding: "12px 16px", borderRadius: 10,
                            fontSize: 14, marginBottom: 24,
                            display: "flex", alignItems: "center", gap: 10,
                            animation: "fadeUp 0.3s ease forwards",
                        }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleCredentialsLogin} style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.6s ease 0.25s both" }}>
                        <InputField
                            id="email" label="Email address" type="email"
                            value={email} onChange={setEmail}
                            placeholder="name@example.com"
                            accentColor="#ec4899"
                        />

                        <InputField
                            id="password" label="Password" type={showPass ? "text" : "password"}
                            value={password} onChange={setPassword}
                            placeholder="••••••••"
                            accentColor="#ec4899"
                            rightEl={
                                <button
                                    type="button"
                                    onClick={() => setShowPass(p => !p)}
                                    style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontFamily: sans, padding: 0 }}
                                >
                                    {showPass ? "Hide" : "Show"}
                                </button>
                            }
                        />

                        {/* Forgot password */}
                        <div style={{ textAlign: "right", marginTop: -10 }}>
                            <a href="#" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}
                                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#ec4899"}
                                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#6b7280"}
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "15px",
                                borderRadius: 12, border: "none",
                                background: loading
                                    ? "rgba(255,255,255,0.08)"
                                    : "linear-gradient(135deg, #ec4899, #f97316)",
                                color: "white", fontSize: 15, fontWeight: 700,
                                cursor: loading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                boxShadow: loading ? "none" : "0 8px 28px rgba(236,72,153,0.35)",
                                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                fontFamily: sans,
                                position: "relative", overflow: "hidden",
                            }}
                            onMouseEnter={e => {
                                if (!loading) {
                                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px) scale(1.01)";
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(236,72,153,0.5)";
                                }
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? "none" : "0 8px 28px rgba(236,72,153,0.35)";
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        style={{ animation: "spin 0.8s linear infinite" }}>
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign up link */}
                    <p style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "#4b5563", animation: "fadeUp 0.6s ease 0.35s both" }}>
                        Don't have an account?{" "}
                        <Link href="/register" style={{ color: "#ec4899", fontWeight: 700, textDecoration: "none" }}
                            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"}
                            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"}
                        >
                            Sign up free →
                        </Link>
                    </p>

                    {/* Trust badges */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
                        marginTop: 36, flexWrap: "wrap",
                        animation: "fadeUp 0.6s ease 0.4s both",
                    }}>
                        {["🔒 Secure login", "✓ Free plan", "⚡ Instant access"].map(t => (
                            <span key={t} style={{ fontSize: 12, color: "#374151", fontWeight: 500, whiteSpace: "nowrap" }}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
                @keyframes shimmer {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}