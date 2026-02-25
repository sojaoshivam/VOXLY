'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LanguageSelector } from '@/app/components/LanguageSelector';
import { VOICE_CATEGORIES, VOICES_V3, type VoiceCategory } from '@/lib/sarvam';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'generate' | 'history' | 'settings';

export interface HistoryItem {
  id: string;
  script: string;
  language: string;
  voice: string;
  createdAt: string;
  duration: string;
  audioUrl?: string;
}

export interface DashboardClientProps {
  initialHistory: HistoryItem[];
  usageUsed: number;
  usageTotal: number;
  totalGenerations: number;
  uniqueLanguages: number;
  subscriptionTier?: string;
}

// ─── Animated waveform ────────────────────────────────────────────────────────
function MiniWave({ active, color = '#f472b6' }: { active: boolean; color?: string }) {
  const [t, setT] = useState(0);
  const raf = useRef<number>(0);
  const last = useRef<number>(0);
  useEffect(() => {
    if (!active) return;
    const tick = (ts: number) => {
      last.current = last.current || ts;
      setT(p => p + (ts - last.current) * 0.004);
      last.current = ts;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);
  return (
    <div className="flex items-center gap-[2px] h-5">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="rounded-sm w-[3px] transition-all duration-75" style={{
          height: active ? `${3 + Math.abs(Math.sin(t + i * 0.5)) * 16}px` : '3px',
          background: color,
          opacity: active ? 0.5 + Math.abs(Math.sin(t + i * 0.5)) * 0.5 : 0.2,
        }} />
      ))}
    </div>
  );
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick, badge }: {
  icon: React.ReactNode; label: string; active: boolean;
  onClick: () => void; badge?: number;
}) {
  return (
    <button onClick={onClick} className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium
      transition-all duration-200 group relative
      ${active
        ? 'bg-white/10 text-white'
        : 'text-[#8b8680] hover:text-white hover:bg-white/5'
      }
    `}>
      <span className={`flex-shrink-0 transition-colors duration-200 ${active ? 'text-[#f472b6]' : 'text-[#5a5652] group-hover:text-[#8b8680]'}`}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-[10px] font-bold bg-[#f472b6]/20 text-[#f472b6] px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-[#f472b6] to-[#fb923c] rounded-full" />}
    </button>
  );
}

// ─── Usage bar ────────────────────────────────────────────────────────────────
function UsageBar({ used, total, label, unlimited = false }: { used: number; total: number; label: string; unlimited?: boolean }) {
  const pct = unlimited ? (Math.min(used, 60) / 60) * 60 : Math.min((used / total) * 100, 100);
  const isHigh = !unlimited && pct > 80;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#5a5652]">{label}</span>
        <span className={`text-xs font-semibold ${isHigh ? 'text-[#fb923c]' : 'text-[#8b8680]'}`}>
          {unlimited ? `${used} / ∞` : `${used}/${total}`}
        </span>
      </div>
      <div className="h-1.5 bg-[#2e2e2e] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: unlimited ? '100%' : `${pct}%`,
            background: isHigh
              ? 'linear-gradient(90deg, #fb923c, #ef4444)'
              : unlimited
                ? 'linear-gradient(90deg, #a855f7, #6366f1)'
                : 'linear-gradient(90deg, #f472b6, #fb923c)',
            opacity: unlimited ? 0.4 : 1,
          }}
        />
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <div>
        <p className="text-base font-bold text-[#f0eeea] leading-none mb-1">{value}</p>
        <p className="text-xs text-[#5a5652]">{label}</p>
      </div>
    </div>
  );
}

// ─── History row ─────────────────────────────────────────────────────────────
function HistoryRow({ item, onPlay, onDelete }: { item: HistoryItem; onPlay: (id: string) => void; onDelete: (id: string) => void }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const LANG_COLORS: Record<string, string> = {
    Hindi: '#f472b6', Hinglish: '#fb923c', English: '#8b5cf6',
    Tamil: '#22c55e', Telugu: '#06b6d4', Bengali: '#f59e0b',
  };
  const color = LANG_COLORS[item.language] || '#8b8680';

  const togglePlay = () => {
    if (!item.audioUrl) return; // Prevent play if no URL

    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset
      } else {
        audioRef.current.play();
        onPlay(item.id);
      }
      setPlaying(!playing);
    } else {
      // First time play
      const audio = new Audio(item.audioUrl);
      audio.onended = () => setPlaying(false);
      audioRef.current = audio;
      audio.play();
      setPlaying(true);
      onPlay(item.id);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition-all duration-200 border border-transparent hover:border-[#2e2e2e]">
      {/* Play button */}
      <button
        onClick={togglePlay}
        disabled={!item.audioUrl}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: playing ? `linear-gradient(135deg, #f472b6, #fb923c)` : 'rgba(255,255,255,0.06)',
          border: `1px solid ${playing ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: playing ? '0 0 16px rgba(244,114,182,0.4)' : 'none',
        }}
        title={!item.audioUrl ? "Audio not available" : playing ? "Pause" : "Play"}
      >
        {playing
          ? <div className="w-2.5 h-2.5 bg-white rounded-sm" />
          : <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>
        }
      </button>

      {/* Waveform */}
      <div className="flex-shrink-0 w-16 hidden sm:block">
        <MiniWave active={playing} color={color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-sm text-[#f0eeea] font-medium truncate leading-tight w-full" title={item.script}>
          {item.script}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: `${color}18`, color }}>
            {item.language}
          </span>
          <span className="text-xs text-[#5a5652] whitespace-nowrap">{item.voice}</span>
          <span className="text-xs text-[#5a5652] hidden sm:inline">·</span>
          <span className="text-xs text-[#5a5652] whitespace-nowrap hidden sm:inline">{item.duration}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <span className="text-xs text-[#5a5652] hidden md:inline mr-2">{item.createdAt}</span>

        {item.audioUrl && (
          <div className="flex items-center gap-1.5 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={async () => {
                try {
                  const res = await fetch(item.audioUrl!);
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `voiceover-${item.id}.mp3`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch (e) {
                  console.error('Download failed', e);
                }
              }}
              className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center hover:bg-[#2e2e2e] transition-colors"
              title="Download Audio"
            >
              <svg className="w-4 h-4 text-[#8b8680]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button onClick={() => onDelete(item.id)} className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center hover:bg-[#ef4444]/20 hover:text-[#ef4444] text-[#8b8680] transition-colors" title="Delete Audio">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generator Panel ──────────────────────────────────────────────────────────
function GeneratorPanel({ onGenerationComplete, subscriptionTier = 'free' }: { onGenerationComplete?: (item: HistoryItem) => void; subscriptionTier?: string }) {
  const { data: session } = useSession();
  const isPro = subscriptionTier === 'pro';
  const isCreator = subscriptionTier === 'creator';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [language, setLanguage] = useState('hindi');
  const [category, setCategory] = useState<VoiceCategory | null>(null);
  const [voice, setVoice] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [script, setScript] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Voice Preview State
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const [previewCache, setPreviewCache] = useState<Record<string, string>>({});
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const MAX = isPro ? 5000 : isCreator ? 2000 : 500;
  const router = useRouter();

  // Language mapping for detection comparison
  const languageMap: Record<string, string> = {
    english: "en", hindi: "hi", hinglish: "hi", bengali: "bn",
    gujarati: "gu", kannada: "kn", malayalam: "ml", marathi: "mr",
    odia: "or", punjabi: "pa", tamil: "ta", telugu: "te",
  };

  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const currentLangCode = languageMap[language.toLowerCase()] || "en";

  // Hinglish is typed in English (en) but spoken as Hindi (hi)
  const showTranslateWarning = (() => {
    if (!detectedLang || detectedLang === "unknown") return false;

    // If they picked Hinglish, and we detect Hindi (which is how Google classifies Romanized Hindi), it's valid!
    // But if we detect English (en), we WANT to show the warning so they can translate their English to Hinglish.
    if (language.toLowerCase() === 'hinglish' && detectedLang === 'hi') {
      return false;
    }

    // Romanized Punjabi is often misclassified by Google as Hindi or Urdu
    // We want to allow these to pass so Romanized Punjabi isn't incorrectly blocked.
    // However, we DO NOT bypass 'en', because if they paste pure English, we WANT the warning to appear
    // so they can use the "Translate to Punjabi" button.
    if (language.toLowerCase() === 'punjabi' && (detectedLang === 'hi' || detectedLang === 'ur' || detectedLang === 'pa')) {
      return false;
    }

    // Otherwise, check strict match
    return detectedLang !== currentLangCode;
  })();

  // Debounced auto-detect
  useEffect(() => {
    if (!script.trim() || script.length < 5) {
      setDetectedLang(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/detect-language', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: script })
        });
        const data = await res.json();
        setDetectedLang(data.detectedLanguage);
      } catch (e) {
        setDetectedLang(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [script, language]);

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script, targetLanguage: language })
      });
      const data = await res.json();
      if (res.ok && data.translatedText) {
        setScript(data.translatedText);
        setDetectedLang(currentLangCode); // Hide warning
      } else {
        setErrorMsg(data.error || 'Translation failed');
      }
    } catch (e) {
      setErrorMsg('Failed to reach translation service');
    }
    setIsTranslating(false);
  };

  // Calculate voices to show (matching language or fallbacks)
  let finalVoices: typeof VOICES_V3 = [];
  let isFallback = false;

  if (category) {
    const baseCategoryVoices = VOICES_V3.filter(v => v.category === category);
    const recommendedVoices = baseCategoryVoices.filter(v => !v.supportedLanguages || v.supportedLanguages.includes(language.toLowerCase()));

    if (recommendedVoices.length > 0) {
      finalVoices = recommendedVoices;
    } else {
      // Fallback: Find 1 male and 1 female from ANY category that support this language
      isFallback = true;
      const fallbackFemale = VOICES_V3.find(v => v.gender === 'female' && v.supportedLanguages?.includes(language.toLowerCase()));
      const fallbackMale = VOICES_V3.find(v => v.gender === 'male' && v.supportedLanguages?.includes(language.toLowerCase()));

      finalVoices = [fallbackFemale, fallbackMale].filter(Boolean) as typeof VOICES_V3;

      if (finalVoices.length === 0) {
        // Absolute fallback if no voice supports this language
        finalVoices = VOICES_V3.filter(v => v.id === 'priya' || v.id === 'rohan');
      }
    }
  }

  // Selected category metadata
  const categoryMeta = VOICE_CATEGORIES.find(c => c.id === category);

  const handleGenerate = async () => {
    if (!script.trim() || generating || !voice) return;
    setGenerating(true);
    setProgress(0);
    setErrorMsg('');
    let p = 0;

    // Fake progress animation up to 90% while waiting for API
    progressRef.current = setInterval(() => {
      p += Math.random() * 5 + 2;
      if (p >= 90) p = 90;
      setProgress(Math.floor(p));
    }, 200);

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          language,
          voiceId: voice,
          model: 'bulbul:v3'
        }),
      });

      const data = await res.json();

      clearInterval(progressRef.current!);
      setProgress(100);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate voiceover');
      }

      setTimeout(() => {
        setGenerating(false);
        setGenerated(true);
        setGeneratedAudioUrl(data.audioUrl);
        // Notify parent about the new generation so Recent/History updates in real-time
        if (onGenerationComplete) {
          const durSec = data.durationSeconds || 0;
          onGenerationComplete({
            id: data.id || crypto.randomUUID(),
            script: script.trim(),
            language: data.language || (language.charAt(0).toUpperCase() + language.slice(1)),
            voice: data.voiceName || voiceName || voice,
            createdAt: 'just now',
            duration: durSec > 0 ? `0:${durSec.toString().padStart(2, '0')}` : '--:--',
            audioUrl: data.audioUrl,
          });
        }
      }, 400);

    } catch (err: any) {
      clearInterval(progressRef.current!);
      setProgress(0);
      setGenerating(false);
      setErrorMsg(err.message);
    }
  };

  const handleReset = () => {
    setGenerated(false); setPlaying(false); setProgress(0); setGeneratedAudioUrl(null); setErrorMsg('');
    setAudioProgress(0); setAudioDuration(0); setPreviewVoiceId(null);
    if (previewAudioRef.current) previewAudioRef.current.pause();
    setScript(''); setCategory(null); setVoice(''); setVoiceName(''); setStep(1);
  };

  // Wire audio element to generatedAudioUrl
  useEffect(() => {
    if (!generatedAudioUrl) return;

    // Cleanup previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio(generatedAudioUrl);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setAudioProgress(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });
    audio.addEventListener('ended', () => {
      setPlaying(false);
      setAudioProgress(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [generatedAudioUrl]);

  const togglePlayer = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!generatedAudioUrl) return;
    try {
      const response = await fetch(generatedAudioUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voiceover-${voice || 'audio'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const playPreview = async (v: typeof VOICES_V3[0], e: React.MouseEvent) => {
    e.stopPropagation();

    // Stop currently playing preview
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    // Toggle off if clicking the same one that's loading/playing
    if (previewVoiceId === v.id) {
      setPreviewVoiceId(null);
      return;
    }

    setPreviewVoiceId(v.id);

    // If we already generated a preview for this guy, just play it!
    if (previewCache[v.id]) {
      const audio = new Audio(previewCache[v.id]);
      previewAudioRef.current = audio;
      audio.onended = () => setPreviewVoiceId(null);
      audio.play();
      return;
    }

    try {
      const funScripts = [
        `Hey there! I'm ${v.name}. Let's make an awesome reel together!`,
        `Hi! I'm ${v.name}, and I'm ready to bring your words to life.`,
        `Greetings! ${v.name} here. Trust me, your script is in good hands.`
      ];
      const randomScript = funScripts[Math.floor(Math.random() * funScripts.length)];

      const res = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: randomScript,
          language: 'english', // Use English for the preview snippet to ensure accuracy across names
          voiceId: v.id,
          model: 'bulbul:v3'
        }),
      });

      if (!res.ok) {
        let errorData = { error: "Failed to load preview" };
        try { errorData = await res.json(); } catch (e) { }
        throw new Error(errorData.error);
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Cache it
      setPreviewCache(prev => ({ ...prev, [v.id]: audioUrl }));

      // Double check if user hasn't clicked another play button while loading
      setPreviewVoiceId(currentId => {
        if (currentId === v.id) {
          const audio = new Audio(audioUrl);
          previewAudioRef.current = audio;
          audio.onended = () => setPreviewVoiceId(null);
          audio.play();
          return currentId;
        }
        return currentId;
      });

    } catch (err) {
      console.error("Preview failed:", err);
      setPreviewVoiceId(null);
    }
  };


  const STEPS = [
    { n: 1, label: 'Language' },
    { n: 2, label: 'Category' },
    { n: 3, label: 'Voice' },
    { n: 4, label: 'Script' },
  ];

  return (
    <div className="flex flex-col h-full">

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 flex-wrap gap-y-2">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <button
              onClick={() => !generating && step > s.n && setStep(s.n as 1 | 2 | 3 | 4)}
              className="flex items-center gap-1.5 group"
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                transition-all duration-300
                ${step === s.n
                  ? 'bg-gradient-to-br from-[#f472b6] to-[#fb923c] text-white shadow-lg shadow-pink-500/30'
                  : step > s.n
                    ? 'bg-[#f472b6]/20 text-[#f472b6] border border-[#f472b6]/40'
                    : 'bg-[#242424] text-[#5a5652] border border-[#2e2e2e]'
                }
              `}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-xs font-medium transition-colors duration-200 ${step === s.n ? 'text-[#f0eeea]' : 'text-[#5a5652]'}`}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px mx-1.5 transition-all duration-500 ${step > s.n ? 'bg-[#f472b6]/40' : 'bg-[#2e2e2e]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Language ── */}
      {step === 1 && (
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold text-[#f0eeea] mb-1">Choose Language</h3>
            <p className="text-xs text-[#5a5652]">Select the language for your voiceover</p>
          </div>
          <LanguageSelector value={language} onChange={setLanguage} />
          <div className="mt-auto">
            <button onClick={() => setStep(2)} className="
              w-full py-3.5 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-[#f472b6] to-[#fb923c]
              hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5
              transition-all duration-200
            ">
              Continue → Choose Category
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Category ── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#f0eeea] mb-1">Choose Category</h3>
              <p className="text-xs text-[#5a5652]">Pick a voice personality for your reel</p>
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-[#5a5652] hover:text-[#f0eeea] transition-colors">← Back</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
            {VOICE_CATEGORIES.map(cat => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); setVoice(''); setVoiceName(''); }}
                  className="relative flex flex-col items-center gap-3 p-4 rounded-2xl border text-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: isSelected ? `${cat.color}12` : 'rgba(255,255,255,0.02)',
                    borderColor: isSelected ? cat.color : 'rgba(255,255,255,0.07)',
                    boxShadow: isSelected ? `0 0 20px ${cat.color}20` : 'none',
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: cat.color }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-[#f0eeea] mb-0.5">{cat.name}</p>
                    <p className="text-[10px] text-[#5a5652] leading-tight">{cat.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={!category}
            className="
              w-full py-3.5 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-[#f472b6] to-[#fb923c]
              hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
              transition-all duration-200
            "
          >
            Continue → Choose Voice
          </button>
        </div>
      )}

      {/* ── Step 3: Voice ── */}
      {step === 3 && (
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#f0eeea] mb-1">Choose Voice</h3>
              <p className="text-xs text-[#5a5652]">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1"
                  style={{ background: `${categoryMeta?.color}18`, color: categoryMeta?.color }}>
                  {categoryMeta?.icon} {categoryMeta?.name}
                </span>
                — pick your speaker
              </p>
            </div>
            <button onClick={() => setStep(2)} className="text-xs text-[#5a5652] hover:text-[#f0eeea] transition-colors">← Back</button>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {finalVoices.map(v => {
              const isSel = voice === v.id;
              const isPreviewing = previewVoiceId === v.id;
              const isRecommended = !isFallback && (!v.supportedLanguages || v.supportedLanguages.includes(language.toLowerCase()));
              return (
                <div
                  key={v.id}
                  className="relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-200"
                  style={{
                    background: isSel ? 'rgba(244,114,182,0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: isSel ? '#f472b6' : 'rgba(255,255,255,0.07)',
                    boxShadow: isSel ? '0 0 20px rgba(244,114,182,0.15)' : 'none',
                  }}
                >
                  <button
                    className="absolute inset-0 w-full h-full cursor-pointer z-10 block"
                    onClick={() => { setVoice(v.id); setVoiceName(v.name); }}
                  />

                  {isSel && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#f472b6] flex items-center justify-center z-20">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}

                  {/* Play Preview Button */}
                  <button
                    onClick={(e) => playPreview(v, e)}
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-[#f0eeea] hover:bg-[#2a2a2a] hover:scale-105 z-20 transition-all cursor-pointer shadow-md"
                    title={`Hear ${v.name}'s voice`}
                  >
                    {isPreviewing ? (
                      <svg className="w-3.5 h-3.5 animate-spin text-[#f472b6]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>
                    )}
                  </button>

                  <div className={`w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0 relative overflow-hidden transition-all rounded-full ${isPreviewing ? 'ring-2 ring-[#f472b6] shadow-[0_0_15px_rgba(244,114,182,0.4)] scale-110' : ''}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(251,146,60,0.2))'
                    }}>
                    {v.gender === 'female' ? '👩' : '👨'}
                  </div>
                  <div className="text-center relative z-20 pointer-events-none mt-1">
                    <div className="flex items-center justify-center flex-wrap gap-1 mb-0.5">
                      <p className="text-xs font-bold text-[#f0eeea]">{v.name}</p>
                      {isRecommended && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#f472b6]/20 text-[#f472b6] font-bold border border-[#f472b6]/30 whitespace-nowrap">✨ Recommended</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#5a5652] capitalize">{v.gender}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setStep(4)}
            disabled={!voice}
            className="
              w-full py-3.5 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-[#f472b6] to-[#fb923c]
              hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
              transition-all duration-200
            "
          >
            Continue → Write Script
          </button>
        </div>
      )}

      {/* ── Step 4: Script + Generate ── */}
      {step === 4 && !generated && (
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#f0eeea] mb-1">Write Your Script</h3>
              <p className="text-xs text-[#5a5652]">Paste or type the text for your voiceover</p>
            </div>
            <button onClick={() => setStep(3)} className="text-xs text-[#5a5652] hover:text-[#f0eeea] transition-colors">← Back</button>
          </div>

          {/* Config summary chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { icon: '🌐', label: language },
              { icon: categoryMeta?.icon || '🎭', label: categoryMeta?.name || '' },
              { icon: '🎙️', label: voiceName },
            ].filter(c => c.label).map(chip => (
              <span key={chip.label} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#1a1a1a] border border-[#2e2e2e] text-[#8b8680]">
                <span>{chip.icon}</span> {chip.label}
              </span>
            ))}
          </div>

          {/* Translate Warning */}
          {showTranslateWarning && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center gap-2">
                <span className="text-orange-400">⚠️</span>
                <div>
                  <p className="text-xs font-semibold text-orange-400">Language mismatch</p>
                  <p className="text-[10px] text-orange-400/80">Looks like this isn't {language}. Voiceover might sound weird!</p>
                </div>
              </div>
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="px-3 py-1.5 rounded-md bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 min-w-max ml-2"
              >
                {isTranslating ? 'Translating...' : `Translate to ${language}`}
              </button>
            </div>
          )}

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              value={script}
              onChange={e => setScript(e.target.value.slice(0, MAX))}
              placeholder={`Paste your ${language} script here...`}
              className="
                w-full h-full min-h-[180px] resize-none rounded-xl p-4
                bg-[#141414] border border-[#2e2e2e] text-[#f0eeea]
                placeholder-[#3a3a3a] text-sm leading-relaxed
                focus:outline-none focus:border-[#f472b6]/50 focus:ring-1 focus:ring-[#f472b6]/20
                transition-all duration-200
              "
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#3a3a3a]">{script.length}/{MAX}</div>
          </div>

          {/* Char fill bar */}
          <div className="h-0.5 bg-[#2e2e2e] rounded-full overflow-hidden -mt-3">
            <div className="h-full rounded-full transition-all duration-150" style={{
              width: `${(script.length / MAX) * 100}%`,
              background: script.length > MAX * 0.85
                ? 'linear-gradient(90deg, #fb923c, #ef4444)'
                : 'linear-gradient(90deg, #f472b6, #fb923c)',
            }} />
          </div>
          {!isPro && (
            <div className="mt-1 text-right">
              <Link href="/pricing" className="text-[10px] text-[#f472b6] hover:text-[#fb923c] transition-colors">
                Upgrade to Pro to unlock 2500 chars
              </Link>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!script.trim() || generating || showTranslateWarning}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
            style={{
              background: generating ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #f472b6, #fb923c)',
              boxShadow: generating ? 'none' : '0 8px 24px rgba(244,114,182,0.3)',
            }}
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generating... {progress}%
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2"><span>⚡</span> Generate Voiceover</span>
            )}
            {generating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                style={{ animation: 'shimmer 1.2s ease-in-out infinite' }} />
            )}
          </button>
        </div>
      )
      }

      {/* ── Generated result ── */}
      {
        generated && (
          <div className="flex-1 flex flex-col gap-5 animate-[fadeUp_0.4s_ease_forwards]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center text-sm">✓</div>
              <div>
                <p className="text-sm font-semibold text-[#f0eeea]">Voiceover Ready!</p>
                <p className="text-xs text-[#5a5652]">Your audio is ready to play and download</p>
              </div>
            </div>



            {/* Player card */}
            <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayer}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    background: playing ? 'linear-gradient(135deg, #f472b6, #fb923c)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${playing ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: playing ? '0 0 24px rgba(244,114,182,0.4)' : 'none',
                  }}
                >
                  {playing
                    ? <div className="w-3 h-3 bg-white rounded-sm" />
                    : <svg className="w-4 h-4 text-[#f472b6] ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>
                  }
                </button>
                <div className="flex-1 max-w-[120px]">
                  <MiniWave active={playing} color="#f472b6" />
                </div>
                <span className="text-xs text-[#5a5652] ml-auto font-mono tracking-tighter">
                  {formatTime(audioProgress)} / {formatTime(audioDuration)}
                </span>
              </div>
              <div
                className="h-1.5 bg-[#2e2e2e] rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if (!audioRef.current || !audioDuration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  audioRef.current.currentTime = pos * audioDuration;
                }}
              >
                <div className="h-full rounded-full transition-all duration-100 ease-linear" style={{
                  width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : '0%',
                  background: 'linear-gradient(90deg, #f472b6, #fb923c)',
                }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {[language, categoryMeta?.name || '', voiceName, 'MP3 · HD'].filter(Boolean).map(chip => (
                  <span key={chip} className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#f472b6]/10 text-[#f472b6] border border-[#f472b6]/20">
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="
                flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                bg-gradient-to-r from-[#f472b6] to-[#fb923c]
                hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5 transition-all duration-200
              "
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
              <button onClick={handleReset} className="
              px-4 py-3 rounded-xl text-sm font-medium text-[#8b8680]
              bg-[#1a1a1a] border border-[#2e2e2e] hover:text-[#f0eeea] hover:border-[#3a3a3a]
              transition-all duration-200
            ">↺ New</button>
            </div>
          </div>
        )
      }
    </div >
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({ session, props }: { session: any, props: DashboardClientProps }) {
  const subscriptionTier = (session?.user as any)?.subscriptionTier || 'free';
  const isPro = subscriptionTier === 'pro';

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile Card */}
        <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-6 flex flex-col justify-between hover:border-[#3a3a3a] transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#e8e4e0]">Profile Settings</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPro ? 'bg-[#f472b6]/15 text-[#f472b6] border border-[#f472b6]/30' : 'bg-[#242424] text-[#5a5652] border border-[#2e2e2e]'}`}>
                {isPro ? '⭐ Pro Plan' : 'Free Plan'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-14 h-14 rounded-full flex-shrink-0 border border-[#2e2e2e]" />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f472b6, #fb923c)' }}>
                  {(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-[#f0eeea] truncate">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-[#5a5652] truncate">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription / Plan Card */}
        <div className="bg-gradient-to-br from-[#1a1418] to-[#141414] border border-[#f472b6]/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-[0_0_30px_rgba(244,114,182,0.03)] hover:shadow-[0_0_30px_rgba(244,114,182,0.08)] transition-all">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f472b6]/10 blur-[60px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-[#e8e4e0] mb-1">Subscription Overview</h3>
            <p className="text-xs text-[#8b8680] mb-4">Current usage for this billing cycle.</p>

            <div className="mb-6">
              <UsageBar used={props.usageUsed} total={props.usageTotal} label="Generation Limit" unlimited={isPro} />
            </div>
          </div>

          {!isPro ? (
            <Link href="/pricing" className="
              relative group flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-base font-black tracking-wide text-white
              bg-gradient-to-r from-[#f472b6] to-[#fb923c]
              hover:shadow-[0_0_20px_rgba(244,114,182,0.6)] hover:-translate-y-0.5
              transition-all duration-300 no-underline overflow-hidden z-10
            ">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-xl"></div>
              <span className="relative z-10 flex items-center gap-2 drop-shadow-md text-white mix-blend-normal">
                🚀 UPGRADE TO PRO <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </span>
            </Link>
          ) : (
            <button className="relative z-10 w-full py-2.5 rounded-xl text-sm font-semibold text-[#f0eeea] bg-[#242424] border border-[#3a3a3a] hover:bg-[#2a2a2a] transition-all">
              Manage Billing
            </button>
          )}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2e2e2e] bg-[#161616] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#e8e4e0]">App Preferences</h3>
            <p className="text-[11px] text-[#5a5652]">Customize your generation workspace</p>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#38bdf8]/10 px-1.5 py-0.5 rounded border border-[#38bdf8]/20">BETA</span>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#d4d4d4]">Default Engine</p>
              <p className="text-xs text-[#5a5652]">Set the default TTS engine for new generations.</p>
            </div>
            <select className="bg-[#1a1a1a] border border-[#3a3a3a] text-xs text-[#f0eeea] rounded-lg px-3 py-1.5 outline-none focus:border-[#f472b6]">
              <option>Sarvam AI V3 (Recommended)</option>
              <option>ElevenLabs (Pro)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#d4d4d4]">Email Notifications</p>
              <p className="text-xs text-[#5a5652]">Receive monthly usage reports and updates.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-9 h-5 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f472b6]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#1a1414] border border-[#ef4444]/20 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-[#ef4444] mb-2">Danger Zone</h3>
        <p className="text-xs text-[#ef4444]/70 mb-4">Irreversible actions regarding your account data.</p>
        <div className="flex gap-3">
          <button
            onClick={() => signOut({ redirectTo: '/' })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#ef4444] bg-[#ef4444]/10 hover:bg-[#ef4444]/20 transition-all duration-200 border border-[#ef4444]/20"
          >
            Sign out securely
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ef4444] hover:bg-[#dc2626] transition-all duration-200">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardClient(props: DashboardClientProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(props.initialHistory);

  // Local copies of stats so they update instantly without page refresh
  const [totalGenerations, setTotalGenerations] = useState(props.totalGenerations);
  const [usageUsed, setUsageUsed] = useState(props.usageUsed);
  const [uniqueLanguages, setUniqueLanguages] = useState(props.uniqueLanguages);

  // ✅ Use subscription tier from props (comes from server component reading database)
  const subscriptionTier = props.subscriptionTier || 'free';
  const isPro = subscriptionTier === 'pro';
  const isCreator = subscriptionTier === 'creator';

  if (!session?.user) return null;

  const handleDelete = async (id: string) => {
    // Optimistic UI update
    setHistory(prev => prev.filter(item => item.id !== id));
    setTotalGenerations(g => Math.max(0, g - 1));
    setUsageUsed(u => Math.max(0, u - 1));
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error("Delete request returned non-OK status:", await res.text());
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleGenerationComplete = (item: HistoryItem) => {
    // Add the new item to the top of the history list
    setHistory(prev => [item, ...prev]);
    setTotalGenerations(g => g + 1);
    setUsageUsed(u => u + 1);
    // Recalculate unique languages reactively
    setUniqueLanguages(prev => {
      const all = [item, ...history].map(h => h.language.toLowerCase());
      return new Set(all).size;
    });
  };

  const userInitial = (session.user.name || session.user.email || 'U')[0].toUpperCase();

  return (
    <div className="flex h-screen bg-[#0e0e0e] overflow-hidden font-[DM_Sans,sans-serif]">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 flex flex-col
        bg-[#141414] border-r border-[#2e2e2e]
        transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#2e2e2e] flex-shrink-0">
          <Image src="/logo.png" alt="VOXLY Icon" width={28} height={28} className="object-cover rounded-lg shadow-[0_2px_12px_rgba(244,114,182,0.4)]" />
          <span className="text-base font-[Instrument_Serif,serif] italic text-white tracking-tight">VOXLY</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <NavItem
            active={activeTab === 'generate'}
            onClick={() => { setActiveTab('generate'); setSidebarOpen(false); }}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>}
            label="Generate"
          />
          <NavItem
            active={activeTab === 'history'}
            onClick={() => { setActiveTab('history'); setSidebarOpen(false); }}
            badge={history.length}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
            label="History"
          />
          <NavItem
            active={activeTab === 'settings'}
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93A10 10 0 0 1 21 12a10 10 0 0 1-1.93 7.07M4.93 19.07A10 10 0 0 1 3 12a10 10 0 0 1 1.93-7.07" /></svg>}
            label="Settings"
          />
        </nav>

        {/* Usage + plan */}
        <div className="px-4 py-4 border-t border-[#2e2e2e] space-y-4 flex-shrink-0">
          <UsageBar
            used={usageUsed}
            total={props.usageTotal}
            label="Voiceovers used"
            unlimited={subscriptionTier === 'pro'}
          />
          {subscriptionTier === 'free' && (
            <Link href="/pricing" className="
              relative group block w-full py-2.5 rounded-xl text-xs font-bold text-center text-white no-underline overflow-hidden
              bg-gradient-to-r from-[#f472b6] to-[#fb923c] shadow-md shadow-pink-500/20
              hover:shadow-[0_0_15px_rgba(244,114,182,0.5)] hover:-translate-y-0.5 transition-all duration-300
            ">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
              <span className="relative z-10 flex items-center justify-center gap-1.5 drop-shadow-md text-white mix-blend-normal">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                UPGRADE TO PRO
              </span>
            </Link>
          )}
          {subscriptionTier === 'creator' && (
            <Link href="/pricing" className="
              relative group block w-full py-2.5 rounded-xl text-xs font-bold text-center text-white no-underline overflow-hidden
              bg-gradient-to-r from-[#a855f7] to-[#6366f1] shadow-md shadow-purple-500/20
              hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 transition-all duration-300
            ">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Go Pro — Unlimited
              </span>
            </Link>
          )}
        </div>

        {/* User row */}
        <div className="px-4 py-4 border-t border-[#2e2e2e] flex items-center gap-3 flex-shrink-0">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" className="w-8 h-8 rounded-full flex-shrink-0 border border-[#2e2e2e]" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f472b6, #fb923c)' }}>
              {userInitial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#f0eeea] truncate leading-tight">{session.user.name || 'User'}</p>
            <p className="text-[10px] text-[#5a5652] truncate">
              {isPro ? '⭐ Pro' : isCreator ? '🎬 Creator' : 'Free plan'}
            </p>
          </div>
          <button
            onClick={() => signOut({ redirectTo: '/' })}
            className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-[#5a5652] hover:text-[#f0eeea] hover:bg-[#242424] transition-all duration-200"
            title="Sign out"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#2e2e2e] flex-shrink-0 bg-[#0e0e0e]/90 backdrop-blur-sm">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#8b8680] hover:text-white hover:bg-[#1a1a1a] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Breadcrumb / Mobile Logo */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="font-[Instrument_Serif,serif] italic text-[#5a5652]">VOXLY</span>

            <span className="text-[#2e2e2e] text-base">/</span>
            <span className="text-[#f0eeea] font-medium capitalize">{activeTab}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Quick stats */}
            <div className="hidden md:flex items-center gap-1 text-xs text-[#5a5652] bg-[#1a1a1a] border border-[#2e2e2e] rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mr-1" style={{ boxShadow: '0 0 4px #22c55e' }} />
              {subscriptionTier === 'pro' ? `${usageUsed}/∞ used` : subscriptionTier === 'creator' ? `${usageUsed}/60 used` : `${usageUsed}/${props.usageTotal} used`}
            </div>
            {/* Avatar */}
            {session?.user?.image ? (
              <button
                onClick={() => setActiveTab('settings')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-105 overflow-hidden border border-[#2e2e2e]"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
              >
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('settings')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #f472b6, #fb923c)', boxShadow: '0 2px 10px rgba(244,114,182,0.3)' }}
              >
                {userInitial}
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">

            {/* ── Generate tab ── */}
            {activeTab === 'generate' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

                {/* Generator */}
                <div>
                  <div className="mb-6">
                    <h1 className="text-xl font-bold text-[#f0eeea] mb-1 font-[Instrument_Serif,serif] italic">
                      New Voiceover
                    </h1>
                    <p className="text-sm text-[#5a5652]">Choose language, pick a voice, write your script.</p>
                  </div>
                  <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-6 min-h-[520px] flex flex-col">
                    <GeneratorPanel onGenerationComplete={handleGenerationComplete} subscriptionTier={subscriptionTier} />
                  </div>
                </div>

                {/* Right column: stats + recent */}
                <div className="space-y-6">
                  {/* Stats */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#5a5652] mb-3">Your stats</p>
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard icon="🎬" value={totalGenerations.toString()} label="Generated" color="#f472b6" />
                      <StatCard icon="⚡" value="< 10s" label="Avg time" color="#fb923c" />
                      <StatCard icon="🌐" value={uniqueLanguages.toString()} label="Languages" color="#8b5cf6" />
                      <StatCard icon="⭐" value={isPro ? 'Pro' : isCreator ? 'Creator' : 'Free'} label="Plan" color="#22c55e" />
                    </div>
                  </div>

                  {/* Recent */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#5a5652]">Recent</p>
                        {history.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 rounded-full">
                            <span className="w-1 h-1 rounded-full bg-[#22c55e] animate-pulse inline-block" />
                            Live
                          </span>
                        )}
                      </div>
                      <button onClick={() => setActiveTab('history')} className="text-xs text-[#5a5652] hover:text-[#f472b6] transition-colors font-medium">
                        View all →
                      </button>
                    </div>

                    <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl overflow-hidden">
                      {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-lg mb-1">🎙️</div>
                          <p className="text-sm font-medium text-[#5a5652]">No voiceovers yet</p>
                          <p className="text-xs text-[#3a3a3a]">Generate your first one on the left!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-[#1e1e1e]">
                          {history.slice(0, 5).map((item, i) => {
                            const LANG_COLORS: Record<string, string> = {
                              Hindi: '#f472b6', Hinglish: '#fb923c', English: '#8b5cf6',
                              Tamil: '#22c55e', Telugu: '#06b6d4', Bengali: '#f59e0b',
                              Punjabi: '#f97316', Gujarati: '#a855f7', Marathi: '#ec4899',
                            };
                            const dotColor = LANG_COLORS[item.language] || '#8b8680';
                            return (
                              <div key={item.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors group ${i === 0 ? 'bg-[#161616]' : ''}`}>
                                {/* Play dot */}
                                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${dotColor}18`, border: `1px solid ${dotColor}30` }}>
                                  <svg className="w-2.5 h-2.5" fill={dotColor} viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-medium text-[#e8e4e0] truncate leading-tight" title={item.script}>{item.script}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${dotColor}18`, color: dotColor }}>{item.language}</span>
                                    <span className="text-[10px] text-[#4a4642]">·</span>
                                    <span className="text-[10px] text-[#5a5652] truncate">{item.voice}</span>
                                    {i === 0 && <span className="text-[9px] font-bold uppercase tracking-wide text-[#22c55e] bg-[#22c55e]/10 px-1 py-0.5 rounded ml-1">New</span>}
                                  </div>
                                </div>

                                {/* Time + action */}
                                <div className="flex-shrink-0 flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[10px] text-[#5a5652] hidden sm:block">{item.createdAt}</span>
                                  {item.audioUrl && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(item.audioUrl!);
                                          const blob = await res.blob();
                                          const url = URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = url; a.download = `voiceover-${item.id}.mp3`;
                                          document.body.appendChild(a); a.click();
                                          document.body.removeChild(a); URL.revokeObjectURL(url);
                                        } catch (e) { console.error('Download failed', e); }
                                      }}
                                      className="w-7 h-7 rounded-lg bg-[#242424] flex items-center justify-center hover:bg-[#2e2e2e] transition-colors"
                                      title="Download"
                                    >
                                      <svg className="w-3.5 h-3.5 text-[#8b8680]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                      </svg>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="w-7 h-7 rounded-lg bg-[#242424] flex items-center justify-center hover:bg-[#ef4444]/15 hover:text-[#ef4444] text-[#8b8680] transition-colors"
                                    title="Delete"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ── History tab ── */}
            {activeTab === 'history' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-xl font-bold text-[#f0eeea] font-[Instrument_Serif,serif] italic mb-1">History</h1>
                    <p className="text-sm text-[#5a5652]">{history.length} voiceovers generated</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#f472b6] to-[#fb923c] hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    + New
                  </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['All', 'Hindi', 'English', 'Hinglish', 'Tamil'].map(f => (
                    <button key={f} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#1a1a1a] border border-[#2e2e2e] text-[#8b8680] hover:border-[#f472b6]/40 hover:text-[#f0eeea] transition-all duration-200">
                      {f}
                    </button>
                  ))}
                </div>

                <div className="bg-[#141414] border border-[#2e2e2e] rounded-2xl p-2 space-y-1">
                  {history.length === 0 ? (
                    <div className="text-center py-6 text-sm text-[#5a5652]">No generations yet. Create your first one above!</div>
                  ) : (
                    history.map(item => (
                      <HistoryRow key={item.id} item={item} onPlay={setPlayingId} onDelete={handleDelete} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Settings tab ── */}
            {(activeTab === 'settings') && (
              <div className="animate-[fadeUp_0.3s_ease-out_forwards]">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-[#f0eeea] font-[Instrument_Serif,serif] italic mb-1">
                    Settings & Account
                  </h1>
                  <p className="text-sm text-[#5a5652]">Manage your subscription, workspace preferences, and profile.</p>
                </div>
                <SettingsPanel session={session} props={props} />
              </div>
            )}

          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(200%); } }
      `}</style>
    </div>
  );
}