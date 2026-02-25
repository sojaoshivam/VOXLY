'use client';

import { useSession } from 'next-auth/react';
import { useTheme } from '@/app/components/theme';
import { useState } from 'react';

const sans = "'DM Sans', sans-serif";
const serif = "'Instrument Serif', serif";

export default function AccountPage() {
  const { data: session } = useSession();
  const { C } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!session?.user) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{
          fontFamily: serif, fontSize: 44, fontWeight: 400, letterSpacing: '-0.02em',
          color: C.text, marginBottom: 8
        }}>Account Settings</h1>
        <p style={{ fontSize: 16, color: C.textMid }}>Manage your profile and account</p>
      </div>

      {/* Profile Section */}
      <div style={{
        padding: 24, borderRadius: 12, border: `1px solid ${C.border}`,
        background: C.surface, marginBottom: 32
      }}>
        <h2 style={{
          fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: C.textMid, marginBottom: 24
        }}>Profile Information</h2>

        <div style={{
          display: 'grid', gap: 24,
          gridTemplateColumns: 'auto 1fr'
        }}>
          {/* Avatar */}
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 24, fontWeight: 600
            }}>
              {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>
                {session.user.name || 'User'}
              </p>
              <p style={{ fontSize: 12, color: C.textMid, margin: '4px 0 0' }}>
                Member since {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: 'block', marginBottom: 8 }}>
              EMAIL ADDRESS
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px', border: `1px solid ${C.border}`, borderRadius: 6,
              background: C.bg, fontFamily: sans, fontSize: 14, color: C.text
            }}>
              {session.user.email}
              <button onClick={() => copyToClipboard(session.user.email || '')} style={{
                marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: C.accent
              }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: 'block', marginBottom: 8 }}>
              DISPLAY NAME
            </label>
            <div style={{
              padding: '12px', border: `1px solid ${C.border}`, borderRadius: 6,
              background: C.bg, fontFamily: sans, fontSize: 14, color: C.text
            }}>
              {session.user.name || 'Not set'}
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div style={{
        padding: 24, borderRadius: 12, border: `1px solid ${C.border}`,
        background: C.surface, marginBottom: 32
      }}>
        <h2 style={{
          fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: C.textMid, marginBottom: 24
        }}>Security</h2>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{
            padding: 16, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              Password
            </h3>
            <p style={{ fontSize: 13, color: C.textMid, marginBottom: 12 }}>
              {session.user.email?.includes('@') ? 'Password protected account' : 'No password set'}
            </p>
            <button style={{
              padding: '8px 16px', background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: C.accent, transition: 'all 0.2s'
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
              Change Password
            </button>
          </div>

          <div style={{
            padding: 16, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>
              Two-Factor Authentication
            </h3>
            <p style={{ fontSize: 13, color: C.textMid, marginBottom: 12 }}>
              Add an extra layer of security to your account
            </p>
            <button style={{
              padding: '8px 16px', background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: C.accent, transition: 'all 0.2s'
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
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        padding: 24, borderRadius: 12, border: `2px solid ${C.error}`,
        background: C.surface
      }}>
        <h2 style={{
          fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: C.error, marginBottom: 24
        }}>Danger Zone</h2>

        <div style={{
          padding: 16, borderRadius: 8, background: `${C.error}08`, border: `1px solid ${C.error}`
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.error, marginBottom: 8 }}>
            Delete Account
          </h3>
          <p style={{ fontSize: 13, color: C.textMid, marginBottom: 12 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button style={{
            padding: '8px 16px', background: C.error, color: 'white',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13,
            fontWeight: 600, transition: 'all 0.2s'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
