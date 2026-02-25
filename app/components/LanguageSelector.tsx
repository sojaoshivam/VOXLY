'use client';

interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
}

import { useTheme } from '@/app/components/theme';

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const { C } = useTheme();

  // Sarvam Supported Languages mapped to frontend display
  const languages = [
    { id: 'english', label: 'English', flag: '🇬🇧' },
    { id: 'hindi', label: 'Hindi', flag: '🇮🇳' },
    { id: 'hinglish', label: 'Hinglish', flag: '🇮🇳' },
    { id: 'bengali', label: 'Bengali', flag: '🇮🇳' },
    { id: 'gujarati', label: 'Gujarati', flag: '🇮🇳' },
    { id: 'kannada', label: 'Kannada', flag: '🇮🇳' },
    { id: 'malayalam', label: 'Malayalam', flag: '🇮🇳' },
    { id: 'marathi', label: 'Marathi', flag: '🇮🇳' },
    { id: 'odia', label: 'Odia', flag: '🇮🇳' },
    { id: 'punjabi', label: 'Punjabi', flag: '🇮🇳' },
    { id: 'tamil', label: 'Tamil', flag: '🇮🇳' },
    { id: 'telugu', label: 'Telugu', flag: '🇮🇳' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
      {languages.map((lang) => {
        const isActive = value === lang.id;
        return (
          <button
            key={lang.id}
            onClick={() => onChange(lang.id)}
            style={{
              padding: '12px 8px',
              borderRadius: '8px',
              border: isActive ? `1.5px solid ${C.text}` : `1px solid ${C.border}`,
              background: isActive ? C.surface : 'transparent',
              color: isActive ? C.text : C.textMid,
              fontFamily: "'DM Sans', sans-serif",
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              outline: 'none',
              boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',
            }}
            onMouseEnter={e => !isActive && (e.currentTarget.style.borderColor = C.textMid)}
            onMouseLeave={e => !isActive && (e.currentTarget.style.borderColor = C.border)}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{lang.flag}</div>
            <div style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500 }}>
              {lang.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}