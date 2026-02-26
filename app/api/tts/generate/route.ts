import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateFullAudio, ALL_VOICES } from "@/lib/sarvam";
import {
  validateScript,
  validateVoiceId,
  saveAudioFile,
  recordGeneration,
  checkUsageLimit,
  isLanguageAllowedForTier,
  getTierConfig,
  SubscriptionTier,
} from "@/lib/utils";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { script, voiceId, language, model } = await req.json();

    // Map language to target_language_code expected by Sarvam AI
    const languageMap: Record<string, string> = {
      english: "en-IN",
      hindi: "hi-IN",
      hinglish: "hi-IN",
      bengali: "bn-IN",
      gujarati: "gu-IN",
      kannada: "kn-IN",
      malayalam: "ml-IN",
      marathi: "mr-IN",
      odia: "od-IN",
      punjabi: "pa-IN",
      tamil: "ta-IN",
      telugu: "te-IN",
    };
    const languageCode = languageMap[language?.toLowerCase()] || "en-IN";

    // Capitalize language for consistent display
    const languageDisplay = language
      ? language.charAt(0).toUpperCase() + language.slice(1).toLowerCase()
      : language;

    // ─── Check usage limit ────────────────────────────────────────────────────
    const { allowed, remaining, tier } = await checkUsageLimit(userId);
    const tierConfig = getTierConfig(tier);

    if (!allowed) {
      const upgradeMsg = tier === "free"
        ? "You've used all 5 free voiceovers this month. Upgrade to Creator (₹299) or Pro (₹599) to continue."
        : `You've reached your ${tierConfig.monthlyLimit} voiceover limit for this month. Upgrade to Pro for unlimited.`;
      return NextResponse.json({ error: upgradeMsg, upgradeRequired: true }, { status: 403 });
    }

    // ─── Check language access per tier ──────────────────────────────────────
    if (!isLanguageAllowedForTier(language, tier)) {
      return NextResponse.json({
        error: `${languageDisplay} is not available on the ${tierConfig.name} plan. Upgrade to Creator or Pro for all 12 languages.`,
        upgradeRequired: true,
      }, { status: 403 });
    }

    // ─── Validate ─────────────────────────────────────────────────────────────
    const scriptValidation = validateScript(script, tier);
    if (!scriptValidation.valid) {
      return NextResponse.json({ error: scriptValidation.error }, { status: 400 });
    }

    if (!validateVoiceId(voiceId)) {
      return NextResponse.json({ error: "Invalid voice ID" }, { status: 400 });
    }

    // Resolve the human-readable voice display name
    const voiceInfo = ALL_VOICES.find((v: any) => v.id === voiceId);
    const voiceDisplayName = voiceInfo?.name || voiceId;

    // ─── Create DB record ─────────────────────────────────────────────────────
    const generation = await prisma.voiceGeneration.create({
      data: {
        userId,
        scriptText: script,
        language: languageDisplay,
        voiceId,
        voiceName: voiceDisplayName,
        status: "processing",
      },
    });

    try {
      // Generate full audio
      const audioBuffer = await generateFullAudio({
        text: script,
        voiceId,
        languageCode,
        model: "bulbul:v3",
      });

      // Save audio file to UploadThing
      const audioUrl = await saveAudioFile(audioBuffer);

      // Rough duration: MP3 at 128kbps ≈ 16000 bytes/sec
      const durationSeconds = Math.max(1, Math.ceil(audioBuffer.length / 16000));

      // Update database with generated audio
      const completed = await prisma.voiceGeneration.update({
        where: { id: generation.id },
        data: { audioUrl, status: "completed", durationSeconds },
      });

      // ✅ Update usage stats — count persists even if audio is later deleted
      await recordGeneration(userId);

      return NextResponse.json({
        id: completed.id,
        audioUrl: completed.audioUrl,
        status: "completed",
        script,
        language: languageDisplay,
        voiceId,
        voiceName: voiceDisplayName,
        durationSeconds,
        createdAt: completed.createdAt,
        remaining: remaining === -1 ? -1 : remaining - 1,
      });
    } catch (generationErr) {
      await prisma.voiceGeneration.update({
        where: { id: generation.id },
        data: {
          status: "failed",
          errorMessage: generationErr instanceof Error ? generationErr.message : "Unknown error",
        },
      });
      throw generationErr;
    }
  } catch (err) {
    console.error("Full generation error:", err);
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
  }
}
