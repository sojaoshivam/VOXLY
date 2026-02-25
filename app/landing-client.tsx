"use client";

import { SessionProvider } from "next-auth/react";
import { C, typography } from "@/components/landing/theme";
import { Navbar } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Marquee } from "@/components/landing/UI";

export function LandingPage() {
    return (
        <div style={{ background: C.bg, color: C.black, fontFamily: typography.sans, minHeight: "100vh", overflowX: "hidden" }}>
            <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

            <Navbar />
            <Hero />

            <div style={{ borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}`, padding: "16px 0", overflow: "hidden" }}>
                <Marquee items={[
                    "Hindi Voiceovers", "No Recording Gear", "10-Second Turnaround",
                    "Hinglish Native", "Instagram Reels", "Studio Quality",
                    "Commercial Rights", "Faceless Pages", "10,000+ Creators",
                ]} />
            </div>

            <Stats />
            <Features />
            <InteractiveDemo />
            <BeforeAfter />
            <Testimonials />
            <Pricing />
            <FinalCTA />
            <Footer />
        </div >
    );
}

export function LandingPageWrapper() {
    return (
        <SessionProvider>
            <LandingPage />
        </SessionProvider>
    );
}
