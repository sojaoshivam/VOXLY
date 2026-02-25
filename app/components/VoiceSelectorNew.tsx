'use client';

import { VOICES_V3, VOICE_CATEGORIES, VoiceCategory } from '@/lib/sarvam';
import { useMemo, useEffect, useState, useRef } from 'react';
import { useTheme } from '@/app/components/theme';

interface VoiceSelectorProps {
  language: string;
  value: string;
  onChange: (voiceId: string) => void;
}

const sans = "'DM Sans', sans-serif";

// Localized scripts for previews
const LOCALIZED_SCRIPTS: Record<string, string> = {
  english: "I am your new solution for voice over voxly.",
  hindi: "मैं वॉयस ओवर वॉक्सली के लिए आपका नया समाधान हूं।",
  hinglish: "Main voice over Voxly ke liye aapka naya solution hoon.",
  bengali: "আমি ভয়েস ওভার ভক্সলির জন্য আপনার নতুন সমাধান।",
  tamil: "வாய்ஸ் ஓவர் வாக்ஸ்லிக்கான உங்களின் புதிய தீர்வு நான்.",
  telugu: "నేను వాయిస్ ఓవర్ వోక్స్లీ కోసం మీ కొత్త పరిష్కారాన్ని।",
  marathi: "मी व्हॉईस ओव्हर वॉक्सलీसाठी तुमचे नवीन समाधान आहे।",
  gujarati: "હું વોઈસ ઓવર વોક્સલી માટે તમારો નવો ઉકેલ છું।",
  kannada: "ನಾನು ವಾಯ್ಸ್ ಓವರ್ ವೋಕ್ಸ್ಲಿಗಾಗಿ ನಿಮ್ಮ ಹೊಸ ಪರಿಹಾರವಾಗಿದೆ।",
  malayalam: "വോയ്‌സ് ഓവർ വോക്‌സ്‌ലിക്കായുള്ള നിങ്ങളുടെ പുതിയ പരിഹാരമാണ് ഞാൻ.",
  punjabi: "ਮੈਂ ਵੌਇਸ ਓਵਰ ਵੌਕਸਲੀ ਲਈ ਤੁਹਾਡਾ ਨਵਾਂ ਹੱਲ ਹਾਂ।",
  odia: "ମୁଁ ଭଏସ୍ ଓଭର ଭକ୍ସଲି ପାଇଁ ଆପଣଙ୍ଗର ନୂତନ ସମାଧାନ |",
};

export function VoiceSelector({ language, value, onChange }: VoiceSelectorProps) {
  const { C, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<VoiceCategory | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get voices for selected category
  const voicesInCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return VOICES_V3.filter(v => v.category === selectedCategory).slice(0, 4);
  }, [selectedCategory]);

  // Auto-select first category on mount
  useEffect(() => {
    if (!selectedCategory && VOICE_CATEGORIES.length > 0) {
      setSelectedCategory(VOICE_CATEGORIES[0].id as VoiceCategory);
    }
  }, []);

  // Ensure selected voice is from chosen category
  useEffect(() => {
    if (!value && voicesInCategory.length > 0) {
      onChange(voicesInCategory[0].id);
    }
  }, [voicesInCategory, value, onChange]);

  const playPreview = async (voiceId: string) => {
    if (previewLoading) return;
    setPreviewLoading(voiceId);

    try {
      const script = LOCALIZED_SCRIPTS[language] || LOCALIZED_SCRIPTS.english;
      const response = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          voiceId,
          language,
          model: "bulbul:v3"
        }),
      });

      if (!response.ok) throw new Error('Preview failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    if (voiceId === value) {
      playPreview(voiceId);
      return;
    }
    onChange(voiceId);
    playPreview(voiceId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Category Cards */}
      {!selectedCategory ? (
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: C.textMid,
            marginBottom: 16,
          }}>
            Select a voice personality
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
          }}>
            {VOICE_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as VoiceCategory)}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  border: `2px solid ${C.border}`,
                  background: C.surface,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = category.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 16px rgba(0,0,0,0.1)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: 32 }}>{category.icon}</span>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.text,
                    marginBottom: 4,
                  }}>
                    {category.name}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: C.textMid,
                  }}>
                    {category.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Back button + Category title */}
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: C.textMid,
                fontSize: 13,
                padding: 0,
                marginBottom: 16,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textMid)}
            >
              ← Back to categories
            </button>

            <div style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: C.textMid,
            }}>
              Choose your voice
            </div>
          </div>

          {/* Voice Selection Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
          }}>
            {voicesInCategory.map((voice) => {
              const isSelected = value === voice.id;
              const isLoading = previewLoading === voice.id;

              return (
                <button
                  key={voice.id}
                  onClick={() => handleVoiceSelect(voice.id)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: isSelected ? `2px solid ${C.text}` : `1px solid ${C.border}`,
                    background: isSelected ? C.surface : 'transparent',
                    color: isSelected ? C.text : C.textMid,
                    fontFamily: sans,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    position: 'relative',
                    outline: 'none',
                    boxShadow: isSelected ? (isDark ? '0 8px 20px rgba(0,0,0,0.4)' : '0 8px 20px rgba(0,0,0,0.08)') : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = C.textMid;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* Voice Avatar Circle */}
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    fontSize: 32,
                  }}>
                    {isLoading ? (
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: `2px solid rgba(255,255,255,0.3)`,
                        borderTopColor: 'white',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    ) : (
                      voice.gender === 'female' ? '👩' : '👨'
                    )}
                  </div>

                  {/* Voice name and info */}
                  <div style={{ width: '100%' }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.text,
                      marginBottom: 2,
                    }}>
                      {voice.name}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: C.textMid,
                      textTransform: 'capitalize',
                    }}>
                      {voice.gender}
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 24,
                      height: 24,
                      background: C.accent,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Styles for animation */}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
