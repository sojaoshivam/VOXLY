"use client";
import { useEffect, useRef, useState } from "react";
import { typography } from "./theme";
import Image from "next/image";

const NAV_LINKS = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const lastScrollY = useRef(0);

    /* ── Scroll direction + blur threshold ── */
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 24);
            setVisible(y < lastScrollY.current || y < 80);
            lastScrollY.current = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ── Active section tracker ── */
    useEffect(() => {
        const sections = NAV_LINKS.map(l => l.href.replace("#", ""));
        const observers: IntersectionObserver[] = [];

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
                { rootMargin: "-40% 0px -55% 0px" }
            );
            obs.observe(el);
            observers.push(obs);
        });

        return () => observers.forEach(o => o.disconnect());
    }, []);

    /* ── Close menu on resize ── */
    useEffect(() => {
        const close = () => { if (window.innerWidth > 768) setMenuOpen(false); };
        window.addEventListener("resize", close);
        return () => window.removeEventListener("resize", close);
    }, []);

    return (
        <>
            <nav style={{
                position: "fixed",
                top: scrolled ? 12 : 20,
                left: "50%",
                transform: `translateX(-50%) translateY(${visible ? "0" : "-110%"})`,
                width: scrolled ? "min(900px, calc(100vw - 48px))" : "min(1100px, calc(100vw - 48px))",
                zIndex: 1000,
                transition: "all 0.45s cubic-bezier(0.34, 1.3, 0.64, 1)",
            }}>
                {/* Pill container */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: scrolled ? "10px 16px 10px 20px" : "14px 20px 14px 24px",
                    borderRadius: 100,
                    background: scrolled
                        ? "rgba(8, 8, 12, 0.75)"
                        : "rgba(8, 8, 12, 0.45)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: scrolled
                        ? "0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(236,72,153,0.06), inset 0 1px 0 rgba(255,255,255,0.06)"
                        : "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
                    transition: "all 0.4s ease",
                    position: "relative",
                    overflow: "hidden",
                }}>

                    {/* Inner top highlight */}
                    <div style={{
                        position: "absolute", top: 0, left: "15%", right: "15%",
                        height: 1,
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                        pointerEvents: "none",
                    }} />

                    {/* ── Logo ── */}
                    <a href="/" style={{
                        display: "flex", alignItems: "center", gap: 10,
                        textDecoration: "none", flexShrink: 0,
                    }}>
                        {/* Logo mark */}
                        <div style={{
                            width: 32, height: 32, borderRadius: 9,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 2px 12px rgba(236,72,153,0.45)",
                            flexShrink: 0,
                            overflow: "hidden"
                        }}>
                            <Image src="/logo.png" alt="VOXLY" width={32} height={32} className="object-cover" />
                        </div>
                        <span style={{
                            fontFamily: typography.serif,
                            fontSize: 18,
                            fontWeight: 400,
                            color: "white",
                            letterSpacing: "-0.02em",
                            fontStyle: "italic",
                        }}>
                            VOXLY
                        </span>
                    </a>

                    {/* ── Desktop nav links ── */}
                    <div className="nav-links" style={{
                        display: "flex", alignItems: "center", gap: 4,
                    }}>
                        {NAV_LINKS.map((link) => {
                            const isActive = activeSection === link.href.replace("#", "");
                            return (
                                <NavLink key={link.href} href={link.href} isActive={isActive}>
                                    {link.label}
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* ── Right side CTAs ── */}
                    <div className="nav-ctas" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <a href="/login" style={{
                            fontSize: 13, fontWeight: 600,
                            color: "rgba(255,255,255,0.6)",
                            textDecoration: "none", padding: "8px 14px",
                            borderRadius: 100,
                            transition: "color 0.2s ease",
                        }}
                            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "white"}
                            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)"}
                        >
                            Sign in
                        </a>

                        <a href="/login" style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            fontSize: 13, fontWeight: 700,
                            color: "white",
                            textDecoration: "none",
                            padding: "9px 18px",
                            borderRadius: 100,
                            background: "linear-gradient(135deg, #ec4899, #f97316)",
                            boxShadow: "0 4px 16px rgba(236,72,153,0.35)",
                            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            letterSpacing: "-0.01em",
                            whiteSpace: "nowrap",
                        }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLAnchorElement;
                                el.style.transform = "scale(1.05) translateY(-1px)";
                                el.style.boxShadow = "0 8px 28px rgba(236,72,153,0.55)";
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLAnchorElement;
                                el.style.transform = "scale(1) translateY(0)";
                                el.style.boxShadow = "0 4px 16px rgba(236,72,153,0.35)";
                            }}
                        >
                            Start free
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>

                        {/* Mobile hamburger */}
                        <button
                            className="hamburger"
                            onClick={() => setMenuOpen(o => !o)}
                            aria-label="Toggle menu"
                            style={{
                                display: "none",
                                width: 36, height: 36,
                                background: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "50%",
                                cursor: "pointer",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 5,
                                padding: 0,
                                transition: "background 0.2s ease",
                            }}
                        >
                            {[0, 1, 2].map(i => (
                                <span key={i} style={{
                                    display: "block",
                                    width: menuOpen ? (i === 1 ? 0 : 14) : 16,
                                    height: 1.5,
                                    background: "white",
                                    borderRadius: 2,
                                    transition: "all 0.25s ease",
                                    transform: menuOpen
                                        ? i === 0 ? "rotate(45deg) translate(3.5px, 3.5px)"
                                            : i === 2 ? "rotate(-45deg) translate(3.5px, -3.5px)"
                                                : "scaleX(0)"
                                        : "none",
                                    opacity: menuOpen && i === 1 ? 0 : 1,
                                }} />
                            ))}
                        </button>
                    </div>
                </div>

                {/* ── Mobile dropdown ── */}
                <div style={{
                    marginTop: 8,
                    overflow: "hidden",
                    maxHeight: menuOpen ? 400 : 0,
                    transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}>
                    <div style={{
                        background: "rgba(8, 8, 12, 0.90)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 24,
                        padding: "12px 8px",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                    }}>
                        {NAV_LINKS.map((link, i) => {
                            const isActive = activeSection === link.href.replace("#", "");
                            return (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "14px 18px",
                                        borderRadius: 14,
                                        textDecoration: "none",
                                        fontSize: 15, fontWeight: 500,
                                        color: isActive ? "white" : "rgba(255,255,255,0.65)",
                                        background: isActive ? "rgba(236,72,153,0.1)" : "transparent",
                                        transition: "all 0.2s ease",
                                        opacity: 0,
                                        animation: menuOpen ? `fadeUp 0.3s ease ${i * 0.06}s forwards` : "none",
                                    }}
                                    onMouseEnter={e => {
                                        if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                                    }}
                                >
                                    <span>{link.label}</span>
                                    {isActive && (
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec4899" }} />
                                    )}
                                </a>
                            );
                        })}

                        {/* Mobile CTAs */}
                        <div style={{
                            display: "flex", flexDirection: "column", gap: 8,
                            padding: "12px 8px 4px",
                            borderTop: "1px solid rgba(255,255,255,0.07)",
                            marginTop: 8,
                        }}>
                            <a href="/login" style={{
                                textAlign: "center", padding: "12px",
                                borderRadius: 14, fontSize: 14, fontWeight: 600,
                                color: "rgba(255,255,255,0.6)",
                                textDecoration: "none",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}>
                                Sign in
                            </a>
                            <a href="/login" style={{
                                textAlign: "center", padding: "13px",
                                borderRadius: 14, fontSize: 14, fontWeight: 700,
                                color: "white", textDecoration: "none",
                                background: "linear-gradient(135deg, #ec4899, #f97316)",
                                boxShadow: "0 4px 20px rgba(236,72,153,0.4)",
                            }}>
                                Start free →
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* Responsive: hide links, show hamburger */
                @media (max-width: 768px) {
                    .nav-links { display: none !important; }
                    .hamburger { display: flex !important; }
                }
                @media (max-width: 520px) {
                    .nav-ctas a:first-child { display: none !important; }
                }
            `}</style>
        </>
    );
}

/* ── Individual nav link with hover underline ── */
function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) {
    const [hovered, setHovered] = useState(false);

    return (
        <a
            href={href}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative",
                display: "inline-flex", alignItems: "center",
                padding: "8px 14px",
                borderRadius: 100,
                fontSize: 13, fontWeight: 500,
                color: isActive ? "white" : hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                textDecoration: "none",
                background: isActive
                    ? "rgba(236,72,153,0.12)"
                    : hovered ? "rgba(255,255,255,0.06)" : "transparent",
                border: isActive ? "1px solid rgba(236,72,153,0.2)" : "1px solid transparent",
                transition: "all 0.22s ease",
                letterSpacing: "-0.005em",
                whiteSpace: "nowrap",
            }}
        >
            {isActive && (
                <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "linear-gradient(135deg, #ec4899, #f97316)",
                    marginRight: 7, flexShrink: 0,
                    boxShadow: "0 0 6px rgba(236,72,153,0.7)",
                }} />
            )}
            {children}
        </a>
    );
}