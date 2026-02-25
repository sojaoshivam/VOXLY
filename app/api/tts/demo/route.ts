import { NextRequest, NextResponse } from "next/server";
import { generateAudio, VOICES_V3, SarvamVoice } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
    try {
        const { script, voiceId, language, model, pace, pitch, loudness } = await req.json();

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
        const languageCode = languageMap[language?.toLowerCase()] || "hi-IN";

        const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount > 100) {
            return NextResponse.json(
                { error: "Demo is limited to 100 words maximum." },
                { status: 400 }
            );
        }
        if (wordCount === 0) {
            return NextResponse.json(
                { error: "Script cannot be empty." },
                { status: 400 }
            );
        }

        const audioBuffer = await generateAudio({
            text: script,
            voiceId: voiceId || "aditya",
            languageCode,
            model: model || "bulbul:v3",
            pace: pace ? Number(pace) : 1.0,
            pitch: pitch !== undefined ? Number(pitch) : 0,
            loudness: loudness ? Number(loudness) : 1.0,
        });

        return new Response(new Uint8Array(audioBuffer), {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": 'inline; filename="demo.mp3"',
            },
        });
    } catch (err) {
        console.error("Demo API error:", err);
        return NextResponse.json(
            { error: "Failed to generate demo voiceover" },
            { status: 500 }
        );
    }
}
