import { config } from 'dotenv';
config({ path: '.env.local' });
import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("Generating 8-second hero demo audio...");

    // Adjusted script to fit within roughly 8 seconds smoothly
    const text = "Ek psychology trick jo sunne waalo ko 3 seconds mein hook kar le. Sabse pehle, unse ek ajeeb sawaal pucho jiska unko jawab na pata ho.";

    // Correct URL
    const url = "https://api.sarvam.ai/text-to-speech";

    const payload = {
        inputs: [text],
        target_language_code: "hi-IN",
        speaker: "ritu",
        pace: 1.10,
        model: "bulbul:v3",
        speech_sample_rate: 24000,
        enable_preprocessing: true,
        temperature: 0.9
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                "api-subscription-key": process.env.SARVAM_API_KEY!,
                "Content-Type": "application/json",
            }
        });

        const base64Audio = response.data.audios[0];
        const buffer = Buffer.from(base64Audio, "base64");

        const outPath = path.join(process.cwd(), 'public', 'hero-demo.mp3');
        fs.writeFileSync(outPath, buffer);
        console.log("Successfully wrote public/hero-demo.mp3");
    } catch (err: any) {
        console.error("Failed to generate hero demo:", err.response?.status, err.response?.data || err.message);
    }
}

main();
