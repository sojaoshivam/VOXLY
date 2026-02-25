import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ detectedLanguage: "unknown" });
        }

        // Google Translate endpoint to detect language (sl=auto, tl=en doesn't matter, we just need detected source)
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text.slice(0, 200))}`;
        const res = await fetch(url);

        if (res.ok) {
            const data = await res.json();
            const detected = data && data[2] ? data[2] : "unknown";
            return NextResponse.json({ detectedLanguage: detected }); // e.g., 'en', 'hi', 'bn'
        }

        return NextResponse.json({ detectedLanguage: "unknown" });
    } catch (err) {
        return NextResponse.json({ detectedLanguage: "unknown" }, { status: 500 });
    }
}
