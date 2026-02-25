import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: Check for API key existence
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!apiKey || apiKey === 'your-gemini-api-key-here') {
            return NextResponse.json(
                { error: 'Gemini API key is not configured.' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { topic, tone, language } = body;

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
You are an expert Instagram Reels scriptwriter known for highly engaging, viral, short-form content. 
Write a script for an Instagram Reel about the following topic: "${topic}".

Parameters:
- Tone: ${tone || 'Engaging and conversational'}
- Language: ${language || 'English'} (If Hinglish is selected, use a natural mix of Hindi and English words written in Latin script).
- Length: Around 60-90 words (Targeting 30-45 seconds of natural speaking time).

Structure Requirements:
1. Hook: Start with an immediate, attention-grabbing hook in the first 3 seconds (e.g., "Stop doing X", "Here is the secret to Y").
2. Body: Deliver 1 to 3 clear, punchy points or steps. Do not use complex jargon. Keep sentences short.
3. Call to Action (CTA): End with a very brief call to action (e.g., "Save this video", "Follow for more").

Formatting Rules:
- Output ONLY the spoken words. 
- NO stage directions, NO hashtags, NO visual cues (like [Camera pans] or [Upbeat music]).
- Use simple punctuation (commas, periods, question marks). Do not use emojis in the script text as it will be read by a Text-to-Speech AI.
`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return NextResponse.json({ script: text.trim() });
        } catch (genErr: any) {
            console.error('Script generation error:', genErr);

            // Handle 429 Rate Limits / Quota
            if (genErr.status === 429 || genErr.message?.toLowerCase().includes('quota')) {
                return NextResponse.json(
                    { error: "AI is currently at its free-tier limit. Please wait a minute and try again." },
                    { status: 429 }
                );
            }

            throw genErr; // Re-throw for general catch block
        }
    } catch (err) {
        console.error('General generation error:', err);
        return NextResponse.json(
            { error: 'Failed to generate script. Please try manual input.' },
            { status: 500 }
        );
    }
}
