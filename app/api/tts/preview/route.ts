import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePreview } from "@/lib/sarvam";
import { validateScript, validateVoiceId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { script, voiceId, language, model } = await req.json();

    // Map language standard to the target_language_code expected by Sarvam AI
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

    const isPro = session.user.subscriptionTier === 'pro';

    // Validate input
    const scriptValidation = validateScript(script, isPro);
    if (!scriptValidation.valid) {
      return NextResponse.json(
        { error: scriptValidation.error },
        { status: 400 }
      );
    }

    if (!validateVoiceId(voiceId)) {
      return NextResponse.json(
        { error: "Invalid voice ID" },
        { status: 400 }
      );
    }

    // Generate preview audio (5 seconds)
    const audioBuffer = await generatePreview({
      text: script,
      voiceId,
      languageCode,
      model: "bulbul:v3",
    });

    // Return audio as MP3
    return new Response(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="preview.mp3"',
      },
    });
  } catch (err) {
    console.error("Preview generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}
