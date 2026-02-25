'use client';

import Link from 'next/link';
import { useTheme } from '@/app/components/theme';

const sans = "'DM Sans', sans-serif";
const serif = "'Instrument Serif', serif";

export default function NotFound() {
  const { C } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: 600,
        textAlign: 'center',
      }}>
        {/* 404 Number */}
        <div style={{
          fontFamily: serif,
          fontSize: 120,
          fontWeight: 900,
          fontStyle: 'italic',
          color: C.text,
          lineHeight: 1,
          marginBottom: 24,
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          404
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: serif,
          fontSize: 48,
          fontWeight: 400,
          color: C.text,
          marginBottom: 16,
          lineHeight: 1.2,
        }}>
          Page not found
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: sans,
          fontSize: 18,
          color: C.textMid,
          marginBottom: 40,
          lineHeight: 1.6,
        }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 60,
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
            color: 'white',
            textDecoration: 'none',
            borderRadius: 6,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(236, 72, 153, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ← Back to Home
          </Link>

          <Link href="/dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: 'transparent',
            color: C.text,
            textDecoration: 'none',
            borderRadius: 6,
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 14,
            border: `1px solid ${C.border}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.text;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Go to Dashboard →
          </Link>
        </div>

        {/* Suggestions */}
        <div style={{
          padding: '32px',
          borderRadius: 12,
          border: `1px solid ${C.border}`,
          background: C.surface,
        }}>
          <p style={{
            fontFamily: sans,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: C.textMid,
            marginBottom: 16,
          }}>
            Quick Links
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
          }}>
            {[
              { label: 'Home', href: '/' },
              { label: 'Editor', href: '/dashboard' },
              { label: 'History', href: '/dashboard/recent' },
              { label: 'Settings', href: '/dashboard/settings' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '12px',
                  color: C.accent,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontFamily: sans,
                  fontWeight: 500,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  display: 'block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.background = C.accentBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
