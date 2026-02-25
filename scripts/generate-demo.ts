import { config } from 'dotenv';
config({ path: '.env.local' });
import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("Generating demo audio with API KEY: " + (process.env.SARVAM_API_KEY ? "Loaded" : "Missing"));

    const text = "Ek psychology trick jo sunne waalo ko 3 seconds mein hook kar le. Sabse pehle, unse ek ajeeb sawaal pucho jiska unko jawab na pata ho. Fir, dheere se silence ka use karo. Ye trick itni powerful hai ki log automatically aapki poori reel dekhne lag jayenge. Try karke dekho aur followers badhate jao!";

    // Test base URLs
    const urls = [
        "https://api.sarvam.ai/api/v1/text-to-speech",
        "https://api.sarvam.ai/text-to-speech"
    ];

    const payload = {
        inputs: [text],
        target_language_code: "hi-IN",
        speaker: "aditya",
        pace: 1.1,
        model: "bulbul:v3",
        speech_sample_rate: 24000,
        enable_preprocessing: true,
        temperature: 0.3
    };

    for (const url of urls) {
        console.log("Testing:", url);
        try {
            const response = await axios.post(url, payload, {
                headers: {
                    "api-subscription-key": process.env.SARVAM_API_KEY!,
                    "Content-Type": "application/json",
                }
            });
            console.log("Success with", url);
            const base64Audio = response.data.audios[0];
            const buffer = Buffer.from(base64Audio, "base64");

            const outPath = path.join(process.cwd(), 'public', 'demo.mp3');
            fs.writeFileSync(outPath, buffer);
            console.log("Successfully wrote public/demo.mp3");
            return;
        } catch (err: any) {
            console.error(url, "=>", err.response?.status, err.response?.data || err.message);
        }
    }
}

main();
