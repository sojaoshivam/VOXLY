/**
 * dashboard/settings/page.tsx — Account & Subscription Settings
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN CHANGES FROM ORIGINAL:
 *
 * 1. REMOVED: `grid grid-cols-2 gap-6` pricing cards with Tailwind blue/gray
 *    REPLACED WITH: Full-bleed two-column pricing panel matching the landing page
 *    pricing section exactly — left column warm bg, right column near-black with
 *    gradient CTA. Separated by a 1px rule (same as Before/After section on landing)
 *
 * 2. REMOVED: `bg-green-50 border border-green-200` Pro Active banner
 *    REPLACED WITH: Editorial "Pro Active" state with gradient accent dot + serif label
 *
 * 3. REMOVED: `text-3xl font-bold text-gray-900` plan price typography
 *    REPLACED WITH: Instrument Serif 56px italic price — matches landing page stat numbers
 *
 * 4. REMOVED: `• 5 generations/month` bulleted plain list
 *    REPLACED WITH: SVG checkmark list matching landing page pricing checklist style
 *
 * 5. REMOVED: `bg-blue-600 hover:bg-blue-700` upgrade button
 *    REPLACED WITH: Pink→orange gradient button matching landing page "Upgrade to Pro" CTA
 *
 * 6. REMOVED: `bg-white rounded-lg shadow p-6` account info card
 *    REPLACED WITH: Flat bordered panel with labeled fields (editorial key-value layout)
 *
 * 7. ADDED: "Recommended" badge on Pro plan — same as landing page
 *
 * GOOGLE ANTIGRAVITY NOTES:
 *   - Plan price: change the ₹499 text in the Pro plan section
 *   - Feature lists: update `freePlanFeatures` and `proPlanFeatures` arrays
 *   - Payment handler: `handleUpgradeToPro` is unchanged — same API call
 *   - To add more account fields: add to `accountFields` array below
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: 'var(--bg)',
  black: 'var(--text-primary)',
  mid: 'var(--text-muted)',
  rule: 'var(--border)',
  accent: 'var(--accent)',
  accentAlt: 'var(--accent-alt)',
  card: 'var(--white)',
};

const serif = "'Instrument Serif', serif";
const sans = "'DM Sans', sans-serif";

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: C.mid, fontFamily: sans,
};

const panel: React.CSSProperties = {
  background: C.card, border: `1px solid ${C.rule}`,
  borderRadius: 8, overflow: 'hidden',
};

// ─── Plan Features ─────────────────────────────────────────────────────────────
// GOOGLE ANTIGRAVITY: Add/remove/edit features here — renders as checklist rows
const freePlanFeatures = [
  '5 voiceovers per month',
  'Hindi, English & Hinglish',
  'All standard voices',
  'Watermark on export',
];

const proPlanFeatures = [
  'Unlimited voiceovers',
  'Zero watermarks',
  'HD Studio quality audio',
  'Commercial usage rights',
  'Priority processing',
];

// ─── Checkmark Row ─────────────────────────────────────────────────────────────
// Matches landing page pricing feature checklist exactly
function FeatureItem({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke={dark ? C.accent : '#22c55e'} strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span style={{ fontSize: 14, color: dark ? '#a1a1aa' : C.mid, fontFamily: sans }}>
        {text}
      </span>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UsageStats {
  subscriptionTier: string;
  subscriptionActive: boolean;
  generationsRemaining: number;
  generationsLimit: number;
}

// ─── Main Settings Page ────────────────────────────────────────────────────────
export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    async function loadUsage() {
      try {
        const res = await fetch('/api/usage');
        if (res.ok) setUsage(await res.json());
      } catch (err) {
        console.error('Failed to load usage:', err);
      }
    }
    if (session?.user) loadUsage();
  }, [session]);

  // ── Upgrade handler — supports both creator and pro plans ──
  const handleUpgrade = async (plan: 'creator' | 'pro') => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout');
      }
      const data = await response.json();

      // Before redirecting to payment, refresh usage data on return
      // This helps catch the update when user comes back
      window.addEventListener('focus', async () => {
        const res = await fetch('/api/usage');
        if (res.ok) setUsage(await res.json());
      }, { once: true });

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              width: 3, height: 20, background: C.rule, borderRadius: 9999,
              animation: `pulse 1s ease-in-out ${i * 0.1}s infinite alternate`,
            }} />
          ))}
          <style>{`@keyframes pulse { from{opacity:.3;transform:scaleY(.5)} to{opacity:1;transform:scaleY(1)} }`}</style>
        </div>
      </div>
    );
  }

  // GOOGLE ANTIGRAVITY: Add more account fields here as { label, value } objects
  const getPlanLabel = () => {
    if (usage?.subscriptionTier === 'pro') return { label: 'Pro', icon: '⭐' };
    if (usage?.subscriptionTier === 'creator') return { label: 'Creator', icon: '🎬' };
    return { label: 'Free', icon: '✨' };
  };

  const planInfo = getPlanLabel();

  const accountFields = [
    { label: 'Email', value: session?.user?.email || '—' },
    { label: 'Name', value: session?.user?.name || 'Not set' },
  ];

  return (
    <div style={{ maxWidth: 680, fontFamily: sans }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{
            fontFamily: serif, fontSize: 40, fontWeight: 400,
            letterSpacing: '-0.02em', color: C.black, lineHeight: 1.1, marginBottom: 8,
          }}>
            Account & <em>Settings</em>
          </h1>
          <p style={{ fontSize: 15, color: C.mid }}>
            Manage your subscription and account details.
          </p>
        </div>
        <button
          onClick={() => {
            const loadUsage = async () => {
              try {
                const res = await fetch('/api/usage');
                if (res.ok) setUsage(await res.json());
              } catch (err) {
                console.error('Failed to refresh usage:', err);
              }
            };
            loadUsage();
          }}
          style={{
            padding: '8px 14px',
            fontSize: 12,
            fontFamily: sans,
            fontWeight: 600,
            border: `1px solid ${C.rule}`,
            borderRadius: 4,
            background: 'transparent',
            color: C.mid,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.color = C.black;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = C.mid;
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Account Panel ── */}
      {/* CHANGED: From `bg-white rounded-lg shadow p-6 space-y-4` with divider rows
          TO: Flat bordered panel with editorial key-value field layout */}
      <div style={{ ...panel, marginBottom: 32 }}>
        <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.rule}` }}>
          <span style={sectionLabel}>Account</span>
        </div>
        <div style={{ padding: '0 32px' }}>
          {accountFields.map((field, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '120px 1fr',
              alignItems: 'center', gap: 24,
              padding: '18px 0',
              borderBottom: i < accountFields.length - 1 ? `1px solid ${C.rule}` : 'none',
            }}>
              <span style={{ ...sectionLabel, fontSize: 11 }}>{field.label}</span>
              <span style={{ fontSize: 14, color: C.black, fontFamily: sans }}>{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Current Plan Status ── */}
      {/* Shows your current subscription status */}
      {usage && (
        <div style={{ ...panel, marginBottom: 32 }}>
          <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.rule}` }}>
            <span style={sectionLabel}>Current Plan</span>
          </div>
          <div style={{ padding: '24px 32px' }}>
            {usage.subscriptionActive ? (
              /* ── Active Subscription ── */
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 0 3px #dcfce7',
                  flexShrink: 0,
                }} />
                <div>
                  <p style={{ fontFamily: serif, fontSize: 22, fontStyle: 'italic', color: C.black, marginBottom: 2 }}>
                    {planInfo.icon} {planInfo.label} — Active
                  </p>
                  <p style={{ fontSize: 13, color: C.mid }}>
                    {usage.subscriptionTier === 'pro' && 'Unlimited voiceovers. No watermarks.'}
                    {usage.subscriptionTier === 'creator' && '60 voiceovers/month. All features.'}
                    {usage.subscriptionTier === 'free' && '5 voiceovers/month. Limited features.'}
                  </p>
                </div>
              </div>
            ) : (
              /* ── Free Plan Usage ── */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontFamily: serif, fontSize: 22, fontStyle: 'italic', color: C.black, marginBottom: 2 }}>
                      Free Plan
                    </p>
                    <p style={{ fontSize: 13, color: C.mid }}>
                      {usage.generationsRemaining} of {usage.generationsLimit} generations remaining
                    </p>
                  </div>
                  <span style={{ ...sectionLabel, fontSize: 11 }}>
                    {Math.round((usage.generationsRemaining / usage.generationsLimit) * 100)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, background: C.rule, borderRadius: 9999, marginBottom: 4 }}>
                  <div style={{
                    height: '100%', borderRadius: 9999,
                    background: `linear-gradient(90deg, ${C.accent}, ${C.accentAlt})`,
                    width: `${(usage.generationsRemaining / usage.generationsLimit) * 100}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          borderLeft: `3px solid #dc2626`,
          background: '#fef2f2',
          padding: '12px 16px', borderRadius: '0 4px 4px 0',
          marginBottom: 24,
          fontSize: 14, color: '#dc2626', fontFamily: sans,
        }}>
          {error}
        </div>
      )}

      {/* ── Pricing Plans ── */}
      {/* All three plans: Free, Creator, Pro in a 3-column grid */}
      <div style={{ ...panel, overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.rule}` }}>
          <span style={sectionLabel}>Plans</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>

          {/* Free Plan */}
          <div style={{
            padding: '36px 32px',
            borderRight: `1px solid ${C.rule}`,
            background: C.bg,
          }}>
            <span style={{ ...sectionLabel, display: 'block', marginBottom: 12 }}>Free</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: serif, fontSize: 52, fontStyle: 'italic', color: C.black, letterSpacing: '-0.03em', lineHeight: 1 }}>
                ₹0
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.mid, marginBottom: 32 }}>/ forever</p>

            <div style={{ borderTop: `1px solid ${C.rule}`, paddingTop: 24, marginBottom: 32 }}>
              {freePlanFeatures.map((f, i) => <FeatureItem key={i} text={f} />)}
            </div>

            {usage?.subscriptionTier === 'free' && (
              <div style={{
                padding: '8px 16px', borderRadius: 4,
                border: `1.5px solid ${C.rule}`,
                display: 'inline-flex', alignItems: 'center',
                fontSize: 13, color: C.mid, fontFamily: sans,
              }}>
                Current plan
              </div>
            )}
          </div>

          {/* Creator Plan */}
          <div style={{
            padding: '36px 32px',
            borderRight: `1px solid ${C.rule}`,
            background: C.bg,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 20, right: 20,
              fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 4,
              background: '#f472b6',
              color: 'white',
            }}>
              Best Value
            </div>

            <span style={{ ...sectionLabel, display: 'block', marginBottom: 12, color: '#f472b6' }}>Creator</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: serif, fontSize: 52, fontStyle: 'italic', color: C.black, letterSpacing: '-0.03em', lineHeight: 1 }}>
                ₹299
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.mid, marginBottom: 32 }}>/ month</p>

            <div style={{ borderTop: `1px solid ${C.rule}`, paddingTop: 24, marginBottom: 32 }}>
              {[
                '60 voiceovers / month',
                'All 12 languages',
                'HD Studio quality',
                'No watermark',
                'Commercial rights',
                'Priority rendering',
              ].map((f, i) => <FeatureItem key={i} text={f} />)}
            </div>

            {usage?.subscriptionTier === 'creator' ? (
              <div style={{
                padding: '10px 20px', borderRadius: 4,
                border: '1.5px solid #f472b6',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: '#f472b6', fontFamily: sans,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                Active
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade('creator')}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 24px', borderRadius: 4,
                  background: loading ? '#f0f0f0' : '#f472b6',
                  color: 'white', border: 'none',
                  fontFamily: sans, fontSize: 14, fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: loading ? 'none' : '0 0 24px rgba(244,114,182,0.25)',
                }}
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    Start Creating
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Pro Plan — dark column */}
          <div style={{
            padding: '36px 32px',
            background: C.black,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 20, right: 20,
              fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 4,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
              color: 'white',
            }}>
              Most Popular
            </div>

            <span style={{ ...sectionLabel, display: 'block', marginBottom: 12, color: '#52525b' }}>Pro</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: serif, fontSize: 52, fontStyle: 'italic', color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
                ₹599
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#52525b', marginBottom: 32 }}>/ month</p>

            <div style={{ borderTop: '1px solid #27272a', paddingTop: 24, marginBottom: 32 }}>
              {proPlanFeatures.map((f, i) => <FeatureItem key={i} text={f} dark />)}
            </div>

            {usage?.subscriptionTier === 'pro' ? (
              <div style={{
                padding: '10px 20px', borderRadius: 4,
                border: '1.5px solid #27272a',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: '#71717a', fontFamily: sans,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                Active
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 24px', borderRadius: 4,
                  background: loading ? '#27272a' : `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
                  color: 'white', border: 'none',
                  fontFamily: sans, fontSize: 14, fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: loading ? 'none' : '0 0 24px rgba(236,72,153,0.25)',
                }}
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    Go Pro
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fine print */}
      <p style={{ fontSize: 12, color: C.mid, textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
        Payments processed securely via Dodo Payments. Cancel anytime.
      </p>
    </div>
  );
}