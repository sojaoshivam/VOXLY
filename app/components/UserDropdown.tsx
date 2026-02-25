'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useTheme } from '@/app/components/theme';

export function UserDropdown() {
  const { data: session } = useSession();
  const { C } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!session?.user) return null;

  const userInitial = (session.user.name || session.user.email || 'U')[0].toUpperCase();
  const subscriptionTier = (session.user as any)?.subscriptionTier || 'free';

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Avatar Button */}
      {session.user.image ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${C.border}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0,
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 4px 12px rgba(236, 72, 153, 0.2)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <img src={session.user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${C.border}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0,
            fontWeight: 600,
            color: 'white',
            fontSize: 14,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 4px 12px rgba(236, 72, 153, 0.2)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {userInitial}
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            minWidth: 200,
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* User Info Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${C.border}`,
              backgroundColor: C.bg,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {session.user.name || 'User'}
            </p>
            <p
              style={{
                fontSize: 12,
                color: C.textMid,
                margin: 0,
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {session.user.email}
            </p>
            <div
              style={{
                marginTop: 8,
                display: 'inline-block',
                padding: '2px 8px',
                backgroundColor: subscriptionTier === 'pro' ? `rgba(236, 72, 153, 0.1)` : `rgba(107, 114, 128, 0.1)`,
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                color: subscriptionTier === 'pro' ? C.accent : C.textMid,
                textTransform: 'capitalize',
              }}
            >
              {subscriptionTier === 'pro' ? '⭐ Pro' : 'Free'}
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '8px 0' }}>
            {/* Dashboard Link */}
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '10px 16px',
                  color: C.text,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  backgroundColor: 'transparent',
                  borderLeft: `3px solid transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.accentBg;
                  e.currentTarget.style.borderLeft = `3px solid ${C.accent}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderLeft = '3px solid transparent';
                }}
              >
                Dashboard
              </div>
            </Link>

            {/* Account/Settings Link */}
            <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '10px 16px',
                  color: C.text,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  backgroundColor: 'transparent',
                  borderLeft: `3px solid transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.accentBg;
                  e.currentTarget.style.borderLeft = `3px solid ${C.accent}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderLeft = '3px solid transparent';
                }}
              >
                Account
              </div>
            </Link>

            {/* Divider */}
            <div style={{ height: '1px', background: C.border, margin: '8px 0' }} />

            {/* Sign Out Button */}
            <button
              onClick={() => {
                signOut({ redirectTo: '/' });
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                color: C.error,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                borderLeft: '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgba(220, 38, 38, 0.1)`;
                e.currentTarget.style.borderLeft = `3px solid ${C.error}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderLeft = '3px solid transparent';
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
