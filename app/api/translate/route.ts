import { NextRequest, NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
    try {
        const { text, targetLanguage } = await req.json();

        if (!text || !targetLanguage) {
            return NextResponse.json({ error: "Missing text or targetLanguage" }, { status: 400 });
        }

        if (!genAI) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are an expert, native translator and scriptwriter. 
Your task is to translate the user's script into highly natural, conversational ${targetLanguage}.
If the target language is 'hinglish', you MUST formulate the translation as spoken Hindi written entirely in the English alphabet (e.g. "kya haal hai", "aaj hum baat karenge"). DO NOT use native Hindi script (Devanagari) if 'hinglish' is requested.

CRITICAL RULES:
1. Sound like a real human. Use conversational, engaging flow suitable for an audio voiceover.
2. DO NOT change the fundamental idea, meaning, or narrative of the script.
3. Output ONLY the perfectly translated text without any quotes, conversational filler (e.g., "Here is the translation:"), markdown formatting, or explanations.`,
        });

        const result = await model.generateContent(text);
        const translatedText = result.response.text().trim();

        return NextResponse.json({
            translatedText,
            detectedSourceLang: "unknown" // We don't need detection on translation anymore
        });
    } catch (err) {
        console.error("Translation error:", err);
        return NextResponse.json({ error: "Failed to translate text" }, { status: 500 });
    }
}
