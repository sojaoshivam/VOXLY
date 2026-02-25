"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

export const useInView = (threshold = 0.15) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible] as const;
};

export function Waveform({ active, bars = 28, color = "#f472b6" }: { active: boolean; bars?: number; color?: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32 }}>
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        width: 2,
                        borderRadius: 9999,
                        background: color,
                        height: active ? undefined : 4,
                        minHeight: 4,
                        animation: active ? `wave ${0.6 + (i % 5) * 0.13}s ease-in-out infinite alternate` : "none",
                        animationDelay: `${i * 0.04}s`,
                    }}
                />
            ))}
            <style>{`
        @keyframes wave {
          from { height: 4px; }
          to   { height: ${Math.floor(Math.random() * 14 + 12)}px; }
        }
      `}</style>
        </div>
    );
}

export function Marquee({ items }: { items: string[] }) {
    const duplicated = [...items, ...items];
    return (
        <div style={{ overflow: "hidden", width: "100%", display: "flex" }}>
            <div style={{ display: "flex", gap: 48, animation: "marquee 22s linear infinite", whiteSpace: "nowrap" }}>
                {duplicated.map((item, i) => (
                    <span key={i} style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                        {item}
                    </span>
                ))}
            </div>
            <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </div>
    );
}

export function Reveal({ children, delay = 0, y = 30 }: { children: ReactNode; delay?: number; y?: number }) {
    const [ref, visible] = useInView();
    return (
        <div
            ref={ref}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : `translateY(${y}px)`,
                transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

export function StatNumber({ value, label, suffix = "" }: { value: string; label: string; suffix?: string }) {
    const [ref, visible] = useInView();
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const end = parseInt(value.replace(/[^0-9]/g, ""));
        const duration = 1400;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [visible, value]);
    return (
        <div ref={ref} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 56, color: "#0f0f0f", lineHeight: 1, fontStyle: "italic" }}>
                {count.toLocaleString()}{suffix}
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>
                {label}
            </div>
        </div>
    );
}

export function AnimatedNumber({ value, suffix = "", precision = 0 }: { value: number; suffix?: string; precision?: number }) {
    const [ref, visible] = useInView();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const duration = 1000;
        const frames = 60;
        const step = value / frames;
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            start = (frame / frames) * value;
            if (frame >= frames) { setCount(value); clearInterval(timer); }
            else setCount(parseFloat(start.toFixed(precision)));
        }, duration / frames);

        return () => clearInterval(timer);
    }, [visible, value, precision]);

    return (
        <div ref={ref} style={{ display: "inline" }}>
            {count.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}{suffix}
        </div>
    );
}

export function GlassmorphCard({ children, blur = 12, opacity = 0.08 }: { children: ReactNode; blur?: number; opacity?: number }) {
    return (
        <div style={{
            background: `rgba(255, 255, 255, ${opacity})`,
            backdropFilter: `blur(${blur}px)`,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 16,
            padding: 24,
            transition: "all 0.3s ease",
        }}>
            {children}
        </div>
    );
}

export function FloatingElement({ children, delay = 0, distance = 20 }: { children: ReactNode; delay?: number; distance?: number }) {
    const keyframes = `@keyframes float-${delay} {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-${distance}px); }
    }`;

    return (
        <div style={{
            animation: `float-${delay} 3s ease-in-out infinite`,
            animationDelay: `${delay}s`,
        }}>
            <style>{keyframes}</style>
            {children}
        </div>
    );
}

export function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}
