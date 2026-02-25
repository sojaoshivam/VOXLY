'use client';

import Link from 'next/link';
import { useTheme } from '@/app/components/theme';

const sans = "'DM Sans', sans-serif";
const serif = "'Instrument Serif', serif";

export default function PrivacyPage() {
  const { C } = useTheme();

  return (
    <div style={{
      maxWidth: 900, margin: '0 auto', padding: '40px 24px',
      minHeight: '100vh', background: C.bg
    }}>
      <Link href="/" style={{
        color: C.accent, textDecoration: 'none', fontSize: 13,
        fontWeight: 600, display: 'inline-block', marginBottom: 32
      }}>
        ← Back to Home
      </Link>

      <h1 style={{
        fontFamily: serif, fontSize: 48, fontWeight: 400, letterSpacing: '-0.02em',
        color: C.text, marginBottom: 12
      }}>Privacy Policy</h1>

      <p style={{ fontSize: 14, color: C.textMid, marginBottom: 40 }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div style={{ lineHeight: 1.8, color: C.text, fontFamily: sans }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          1. Introduction
        </h2>
        <p>
          VOXLY ("Company", "we", "our", "us") operates the VOXLY website (the "Service").
          This page informs you of our policies regarding the collection, use, and disclosure
          of personal data when you use our Service and the choices you have associated with that data.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          2. Information Collection and Use
        </h2>
        <p>We collect several different types of information for various purposes:</p>
        <ul style={{ paddingLeft: 24 }}>
          <li>Personal Data: Email address, name, Google account information</li>
          <li>Usage Data: IP address, browser type, pages visited, time spent</li>
          <li>Generated Content: Voice scripts and audio files you create</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          3. Data Security
        </h2>
        <p>
          The security of your data is important to us, but remember that no method of transmission
          over the Internet or method of electronic storage is 100% secure. While we strive to use
          commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          4. Changes to This Privacy Policy
        </h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting
          the new Privacy Policy on this page and updating the "Last updated" date at the top of this page.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          5. Contact Us
        </h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at support@voxly.ai
        </p>
      </div>

      <div style={{
        marginTop: 60, paddingTop: 32, borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 24, justifyContent: 'center'
      }}>
        <Link href="/terms" style={{
          color: C.accent, textDecoration: 'none', fontSize: 13, fontWeight: 600
        }}>
          Terms of Service
        </Link>
        <Link href="/" style={{
          color: C.accent, textDecoration: 'none', fontSize: 13, fontWeight: 600
        }}>
          Home
        </Link>
      </div>
    </div>
  );
}
