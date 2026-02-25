import crypto from "crypto";
import { prisma } from "./db";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// ─── Tier Configuration ───────────────────────────────────────────────────────
export type SubscriptionTier = "free" | "creator" | "pro";

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  monthlyLimit: number; // -1 = unlimited
  maxScriptChars: number;
  languages: "limited" | "all";
  hd: boolean;
  watermark: boolean;
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: "free",
    name: "Starter",
    monthlyLimit: 5,
    maxScriptChars: 500,
    languages: "limited",
    hd: false,
    watermark: true,
  },
  creator: {
    id: "creator",
    name: "Creator",
    monthlyLimit: 60,
    maxScriptChars: 2000,
    languages: "all",
    hd: true,
    watermark: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyLimit: -1,
    maxScriptChars: 5000,
    languages: "all",
    hd: true,
    watermark: false,
  },
};

export function getTierConfig(tier: string): TierConfig {
  return TIER_CONFIGS[(tier as SubscriptionTier) ?? "free"] ?? TIER_CONFIGS.free;
}

// Languages allowed per tier
export const STARTER_LANGUAGES = ["english", "hindi", "hinglish"];

export function isLanguageAllowedForTier(language: string, tier: SubscriptionTier): boolean {
  const config = getTierConfig(tier);
  if (config.languages === "all") return true;
  return STARTER_LANGUAGES.includes(language.toLowerCase());
}

// ─── Usage Limits ────────────────────────────────────────────────────────────
export async function checkUsageLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; tier: SubscriptionTier }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const tier = (user?.subscriptionTier ?? "free") as SubscriptionTier;
  const config = getTierConfig(tier);

  // Pro users have no limit
  if (config.monthlyLimit === -1) {
    return { allowed: true, remaining: -1, tier };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let usage = await prisma.usageStats.findUnique({ where: { userId } });

  // Reset if new month
  if (usage && usage.monthStartDate < monthStart) {
    usage = await prisma.usageStats.update({
      where: { userId },
      data: { generationsThisMonth: 0, monthStartDate: monthStart },
    });
  }

  const used = usage?.generationsThisMonth || 0;
  const remaining = Math.max(0, config.monthlyLimit - used);

  return { allowed: remaining > 0, remaining, tier };
}

// ─── Usage Recording ─────────────────────────────────────────────────────────
// Note: This ONLY increments — deletion never reduces the count.
export async function recordGeneration(userId: string): Promise<void> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const usage = await prisma.usageStats.findUnique({ where: { userId } });

  if (!usage) {
    await prisma.usageStats.create({
      data: { userId, generationsThisMonth: 1, monthStartDate: monthStart },
    });
  } else if (usage.monthStartDate < monthStart) {
    await prisma.usageStats.update({
      where: { userId },
      data: { generationsThisMonth: 1, monthStartDate: monthStart },
    });
  } else {
    await prisma.usageStats.update({
      where: { userId },
      data: { generationsThisMonth: usage.generationsThisMonth + 1 },
    });
  }
}

// ─── Audio File Storage ───────────────────────────────────────────────────────
export async function saveAudioFile(audioBuffer: Buffer): Promise<string> {
  try {
    const filename = `audio-${crypto.randomUUID()}.mp3`;
    const file = new File([audioBuffer as unknown as BlobPart], filename, { type: "audio/mpeg" });
    const response = await utapi.uploadFiles(file);

    if (response.error || !response.data?.url) {
      throw new Error(`UploadThing returned an error: ${response.error?.message || "Unknown error"}`);
    }
    return response.data.url;
  } catch (err) {
    console.error("Failed to upload audio to UploadThing:", err);
    throw new Error("Failed to save audio file to cloud storage");
  }
}

export async function deleteAudioFile(urlPath: string): Promise<void> {
  try {
    if (!urlPath) return;
    const fileKey = urlPath.split("/").pop();
    if (fileKey) {
      await utapi.deleteFiles(fileKey);
    }
  } catch (err) {
    console.warn("Failed to delete audio file from UploadThing:", err);
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────
export function validateScript(
  script: string,
  tier: SubscriptionTier | boolean = "free"
): { valid: boolean; error?: string } {
  if (!script || script.trim().length === 0) {
    return { valid: false, error: "Script cannot be empty" };
  }
  // Support legacy boolean isPro arg
  const resolvedTier: SubscriptionTier =
    typeof tier === "boolean" ? (tier ? "pro" : "free") : tier;
  const config = getTierConfig(resolvedTier);
  const maxChars = config.maxScriptChars;
  if (script.length > maxChars) {
    return {
      valid: false,
      error: `Script too long (max ${maxChars} characters${resolvedTier === "free" ? " on Starter. Upgrade to Creator or Pro for more." : ""})`,
    };
  }
  return { valid: true };
}

export function validateLanguage(lang: string): boolean {
  const ALL_LANGUAGES = [
    "english", "hindi", "hinglish", "bengali", "gujarati",
    "kannada", "malayalam", "marathi", "odia", "punjabi", "tamil", "telugu",
  ];
  return ALL_LANGUAGES.includes(lang.toLowerCase());
}

export function validateVoiceId(voiceId: string): boolean {
  const { ALL_VOICES } = require("./sarvam");
  return ALL_VOICES.some((v: any) => v.id === voiceId);
}

// ─── Subscription Helpers ─────────────────────────────────────────────────────
export function getSubscriptionExpiry(): Date {
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1);
  return expiry;
}

/** @deprecated Use getSubscriptionExpiry() */
export const getProExpiry = getSubscriptionExpiry;

export function isSubscriptionActive(expiryDate?: Date | null): boolean {
  if (!expiryDate) return false;
  return new Date() < expiryDate;
}
