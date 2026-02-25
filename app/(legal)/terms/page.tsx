'use client';

import Link from 'next/link';
import { useTheme } from '@/app/components/theme';

const sans = "'DM Sans', sans-serif";
const serif = "'Instrument Serif', serif";

export default function TermsPage() {
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
      }}>Terms of Service</h1>

      <p style={{ fontSize: 14, color: C.textMid, marginBottom: 40 }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div style={{ lineHeight: 1.8, color: C.text, fontFamily: sans }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing VOXLY and agreeing to these terms, you acknowledge that you have read,
          understood, and agree to be bound by these Terms of Service.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          2. Use License
        </h2>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software)
          on VOXLY for personal, non-commercial transitory viewing only. This is the grant of a license,
          not a transfer of title, and under this license you may not:
        </p>
        <ul style={{ paddingLeft: 24 }}>
          <li>Modifying or copying the materials</li>
          <li>Using the materials for any commercial purpose or for any public display</li>
          <li>Attempting to decompile or reverse engineer any software</li>
          <li>Removing any copyright or other proprietary notations from the materials</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          3. Disclaimer
        </h2>
        <p>
          The materials on VOXLY are provided on an 'as is' basis. VOXLY makes no warranties,
          expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
          implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
          of intellectual property or other violation of rights.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          4. Limitations
        </h2>
        <p>
          In no event shall VOXLY or its suppliers be liable for any damages (including, without limitation,
          damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          5. Accuracy of Materials
        </h2>
        <p>
          The materials appearing on VOXLY could include technical, typographical, or photographic errors.
          VOXLY does not warrant that any of the materials on its website are accurate, complete, or current.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
          6. Contact Us
        </h2>
        <p>
          If you have any questions about these Terms, please contact us at legal@voxly.ai
        </p>
      </div>

      <div style={{
        marginTop: 60, paddingTop: 32, borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 24, justifyContent: 'center'
      }}>
        <Link href="/privacy" style={{
          color: C.accent, textDecoration: 'none', fontSize: 13, fontWeight: 600
        }}>
          Privacy Policy
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
