/**
 * NavigationBar.tsx — Top Navigation Bar Component
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTE: In the new layout system (layout.tsx), the primary navigation has moved
 * to the fixed left sidebar. This NavigationBar is now a slim top bar that sits
 * above the main content area — it shows only the current page context and the
 * sign-out action. This avoids duplicating nav links with the sidebar.
 *
 * DESIGN CHANGES FROM ORIGINAL:
 *
 * 1. REMOVED: `bg-white border-b border-gray-200 sticky top-0 z-50` top nav
 *    with full link set (Editor / Recent / Settings)
 *    REPLACED WITH: Slim contextual top bar — page breadcrumb on left,
 *    user info + sign-out on right. Nav links live in the sidebar (layout.tsx).
 *
 * 2. REMOVED: `text-2xl font-bold text-blue-600` logo link
 *    REPLACED WITH: Removed — logo now lives in the sidebar. This bar shows
 *    a breadcrumb trail instead (root "VOXLY" → current page).
 *
 * 3. REMOVED: `px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700` logout button
 *    REPLACED WITH: Ghost-style "Sign out" text link with arrow icon
 *    — less alarming visually, more editorial
 *
 * 4. REMOVED: Tailwind className strings throughout
 *    REPLACED WITH: Inline styles using the shared design token object (C)
 *
 * GOOGLE ANTIGRAVITY NOTES:
 *   - This component is used in layout.tsx inside the <main> area header
 *   - If you remove the sidebar and go back to top-nav-only: restore the nav
 *     links array from the original file and add them back into this component
 *   - To change sign-out redirect: edit `redirectTo` in the signOut() call
 *   - `pageName` is derived from the pathname — add cases to the switch block
 *     if you add new routes under /dashboard
 */

'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#f8f7f4',
  black: '#0f0f0f',
  mid: '#6b7280',
  rule: '#e5e7eb',
  accent: '#ec4899',
  accentAlt: '#f97316',
};

const sans = "'DM Sans', sans-serif";
const serif = "'Instrument Serif', serif";

// ─── Route → Page Name Map ─────────────────────────────────────────────────────
// GOOGLE ANTIGRAVITY: Add new routes here as you add pages under /dashboard
function getPageName(pathname: string): string {
  switch (pathname) {
    case '/dashboard': return 'Editor';
    case '/dashboard/recent': return 'History';
    case '/dashboard/settings': return 'Settings';
    default: return 'Dashboard';
  }
}

export function NavigationBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't render if no session — same behavior as original
  if (!session?.user) return null;

  const pageName = getPageName(pathname);

  return (
    <div style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      // marginBottom: 0,
      borderBottom: `1px solid ${C.rule}`,
      paddingBottom: 24,
      marginBottom: 40,
    }}>

      {/* ── Left: Breadcrumb ── */}
      {/* "VOXLY / Editor" — gives context without cluttering the header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          href="/dashboard"
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 15,
            color: C.mid,
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.black)}
          onMouseLeave={e => (e.currentTarget.style.color = C.mid)}
        >
          VOXLY
        </Link>

        {/* Separator — forward slash, editorial style */}
        <span style={{ color: C.rule, fontSize: 18, fontWeight: 300, lineHeight: 1 }}>/</span>

        {/* Current page name — slightly darker, not linked */}
        <span style={{
          fontFamily: sans,
          fontSize: 14,
          fontWeight: 500,
          color: C.black,
          letterSpacing: '-0.01em',
        }}>
          {pageName}
        </span>
      </div>

      {/* ── Right: User Info + Sign Out ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

        {/* User identifier — name preferred, email as fallback */}
        <span style={{
          fontSize: 13,
          color: C.mid,
          fontFamily: sans,
          // Truncate long emails
          maxWidth: 180,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {session.user.name || session.user.email}
        </span>

        {/* Vertical rule separator */}
        <div style={{ width: 1, height: 16, background: C.rule }} />

        {/* Sign out — ghost text link, not a red button */}
        {/* CHANGED: From `bg-red-600 text-white rounded px-4 py-2`
            TO: Subtle text link with arrow icon — less alarming, more editorial */}
        <button
          onClick={() => signOut({ redirectTo: '/' })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: sans,
            fontSize: 13,
            color: C.mid,
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.black)}
          onMouseLeave={e => (e.currentTarget.style.color = C.mid)}
        >
          Sign out
          {/* Right-exit arrow icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}