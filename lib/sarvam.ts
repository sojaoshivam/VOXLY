import axios from "axios";

export interface SarvamVoice {
  id: string;
  name: string;
  gender: "male" | "female";
  model: "bulbul:v3";
  category?: string;
  supportedLanguages?: string[];
}

export type VoiceCategory = "motivational" | "storytelling" | "serious";

export interface VoiceCategoryDefinition {
  id: VoiceCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ─── Voice Categories ───
export const VOICE_CATEGORIES: VoiceCategoryDefinition[] = [
  {
    id: "motivational",
    name: "Motivational",
    description: "Optimistic, energetic, inspiring",
    icon: "Rocket",
    color: "#ec4899"
  },
  {
    id: "storytelling",
    name: "Storytelling",
    description: "Narrative, engaging, dramatic",
    icon: "BookOpen",
    color: "#f59e0b"
  },
  {
    id: "serious",
    name: "Serious",
    description: "Professional, authoritative",
    icon: "Briefcase",
    color: "#3b82f6"
  }
];

// ─── Curated Premium Sarvam bulbul:v3 Voices (Highly Natural) ───
export const VOICES_V3: SarvamVoice[] = [
  // Motivational & Energetic
  { id: "priya", name: "Priya", gender: "female", model: "bulbul:v3", category: "motivational", supportedLanguages: ['hindi', 'hinglish', 'english'] },
  { id: "rohan", name: "Rohan", gender: "male", model: "bulbul:v3", category: "motivational", supportedLanguages: ['hindi', 'hinglish', 'english'] },
  { id: "aditya", name: "Aditya", gender: "male", model: "bulbul:v3", category: "motivational", supportedLanguages: ['hindi', 'hinglish', 'english', 'bengali', 'gujarati'] },

  // Storytelling & Engaging
  { id: "ritu", name: "Ritu", gender: "female", model: "bulbul:v3", category: "storytelling", supportedLanguages: ['hindi', 'hinglish', 'english', 'bengali'] },
  { id: "simran", name: "Simran", gender: "female", model: "bulbul:v3", category: "storytelling", supportedLanguages: ['hindi', 'hinglish', 'english', 'punjabi'] },
  { id: "kabir", name: "Kabir", gender: "male", model: "bulbul:v3", category: "storytelling", supportedLanguages: ['hindi', 'hinglish', 'english', 'odia'] },

  // Serious & Conversational
  { id: "neha", name: "Neha", gender: "female", model: "bulbul:v3", category: "serious", supportedLanguages: ['hindi', 'hinglish', 'english', 'tamil'] },
  { id: "dev", name: "Dev", gender: "male", model: "bulbul:v3", category: "serious", supportedLanguages: ['hindi', 'hinglish', 'english', 'telugu'] },
  { id: "ashutosh", name: "Ashutosh", gender: "male", model: "bulbul:v3", category: "serious", supportedLanguages: ['hindi', 'hinglish', 'english', 'malayalam'] },

  // Smooth English focus
  { id: "sophia", name: "Sophia", gender: "female", model: "bulbul:v3", category: "storytelling", supportedLanguages: ['english', 'hindi', 'hinglish'] },
  { id: "sunny", name: "Sunny", gender: "male", model: "bulbul:v3", category: "motivational", supportedLanguages: ['english', 'hindi', 'hinglish'] },
];

export const ALL_VOICES = [...VOICES_V3];

const sarvamClient = axios.create({
  baseURL: process.env.SARVAM_API_BASE || "https://api.sarvam.ai/api/v1",
  headers: {
    "api-subscription-key": process.env.SARVAM_API_KEY,
    "Content-Type": "application/json",
  },
});

export interface GenerateAudioOptions {
  text: string;
  voiceId: string;
  languageCode: string; // e.g., 'en-IN', 'hi-IN'
  model?: "bulbul:v3";
}

export async function generateAudio(options: GenerateAudioOptions): Promise<Buffer> {
  const { text, voiceId, languageCode } = options;

  // Sarvam has a 500 character limit per request
  const CHUNK_SIZE = 450;
  const chunks: string[] = [];

  // Bug-proof strict chunking logic that guarantees no chunk exceeds CHUNK_SIZE
  if (text.length <= CHUNK_SIZE) {
    chunks.push(text);
  } else {
    // Split text into tokens (words and punctuation)
    // This regex splits on spaces but keeps the spaces, so we don't lose them
    const tokens = text.match(/\S+|\s+/g) || [];
    let currentChunk = "";

    for (const token of tokens) {
      if (currentChunk.length + token.length <= CHUNK_SIZE) {
        currentChunk += token;
      } else {
        // If the current chunk is not empty, push it
        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = "";

        // If a single token (like a giant URL without spaces) is somehow larger than CHUNK_SIZE
        if (token.length > CHUNK_SIZE) {
          let remainder = token;
          while (remainder.length > 0) {
            chunks.push(remainder.slice(0, CHUNK_SIZE));
            remainder = remainder.slice(CHUNK_SIZE);
          }
        } else {
          currentChunk = token;
        }
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
  }

  console.log(`📝 Chunking text into ${chunks.length} parts (total: ${text.length} chars)`);
  chunks.forEach((chunk, i) => {
    console.log(`   Chunk ${i + 1}: ${chunk.length} chars`);
  });

  // Generate audio for each chunk
  const audioBuffers: Buffer[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`🎵 Generating audio for chunk ${i + 1}/${chunks.length}...`);

    const payload: any = {
      inputs: [chunk],
      target_language_code: languageCode,
      speaker: voiceId,
      model: "bulbul:v3",
      speech_sample_rate: 24000,
      enable_preprocessing: true,
      temperature: 0.3,
    };

    try {
      const response = await sarvamClient.post("/text-to-speech", payload);
      const base64Audio = response.data.audios[0];
      audioBuffers.push(Buffer.from(base64Audio, "base64"));
      console.log(`✅ Chunk ${i + 1} completed`);
    } catch (err: any) {
      console.error("Sarvam API error - Chunk:", i + 1);
      console.error("Sarvam API error payload:", payload);
      console.error("Sarvam API error response:", err.response?.data || err);
      throw new Error(
        `Failed to generate audio on chunk ${i + 1}: ${err.response?.data?.message || err.message || "Unknown error"}`
      );
    }
  }

  console.log(`🎬 Combining ${audioBuffers.length} audio chunks...`);

  if (audioBuffers.length === 0) return Buffer.from([]);
  if (audioBuffers.length === 1) return audioBuffers[0];

  // Sarvam returns WAV files. We must strip the header from subsequent chunks and update total size
  const firstBuffer = audioBuffers[0];
  let dataOffset = 44; // Default WAV header size

  for (let i = 12; i < firstBuffer.length - 4; i++) {
    // Look for "data" chunk (0x64 0x61 0x74 0x61 in hex)
    if (firstBuffer[i] === 0x64 && firstBuffer[i + 1] === 0x61 && firstBuffer[i + 2] === 0x74 && firstBuffer[i + 3] === 0x61) {
      dataOffset = i + 8; // 'data' string is 4 bytes, size field is 4 bytes
      break;
    }
  }

  const header = firstBuffer.subarray(0, dataOffset - 4);
  const dataParts: Buffer[] = [];
  let totalDataLength = 0;

  for (const buf of audioBuffers) {
    let offset = 44;
    for (let i = 12; i < buf.length - 4; i++) {
      if (buf[i] === 0x64 && buf[i + 1] === 0x61 && buf[i + 2] === 0x74 && buf[i + 3] === 0x61) {
        offset = i + 8;
        break;
      }
    }
    const dataPart = buf.subarray(offset);
    dataParts.push(dataPart);
    totalDataLength += dataPart.length;
  }

  // File size including header (minus RIFF size field itself which is 8 bytes into the file)
  const fileSize = totalDataLength + header.length + 4 - 8;
  const RIFFSizeField = Buffer.alloc(4);
  RIFFSizeField.writeUInt32LE(fileSize, 0);

  const dataSizeField = Buffer.alloc(4);
  dataSizeField.writeUInt32LE(totalDataLength, 0);

  return Buffer.concat([
    header.subarray(0, 4), // "RIFF"
    RIFFSizeField,
    header.subarray(8), // everything between size field and "data" chunk
    Buffer.from('data', 'ascii'),
    dataSizeField, // "data" chunk size
    ...dataParts
  ]);
}

export async function generatePreview(options: GenerateAudioOptions): Promise<Buffer> {
  // Take first 25-30 words (roughly 5 seconds at natural speech rate)
  const words = options.text.split(/\s+/).slice(0, 25);
  const previewText = words.join(" ");

  return generateAudio({
    ...options,
    text: previewText
  });
}

export async function generateFullAudio(options: GenerateAudioOptions): Promise<Buffer> {
  return generateAudio(options);
}
