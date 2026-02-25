/**
 * layout.tsx — App Shell Layout
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN SYSTEM: Matches landing page aesthetic
 *   - Font: "Instrument Serif" (italic display) + "DM Sans" (body/ui)
 *   - Colors: #f8f7f4 warm off-white bg, #0f0f0f near-black text,
 *             pink→orange gradient (#ec4899 → #f97316) as accent
 *   - Layout: Left sidebar nav (64px collapsed / 220px expanded feel),
 *             right content area with warm bg
 *   - Borders: 1px solid #e5e7eb rule lines (no shadows, no glow)
 *   - Spacing: 40px page padding, generous white space
 *
 * GOOGLE ANTIGRAVITY NOTES:
 *   - To change sidebar width: edit `sidebarW` constant below
 *   - To add nav items: add to `navItems` array
 *   - To change accent color: update `C.accent` and `C.accentAlt`
 *   - The Google Font link is injected in `<head>` via a style tag approach
 *     since this is a client component. Move to globals.css or _document for SSR.
 */

'use client';

import { SessionProvider } from 'next-auth/react';

// Google Fonts injected here for the app shell
// (Dashboard page owns its own full-screen layout with sidebar)
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>
      {children}
    </SessionProvider>
  );
}