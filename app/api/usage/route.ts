import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkUsageLimit } from "@/lib/utils";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user subscription info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionEndsAt: true,
      },
    });

    // Get usage stats
    const usage = await checkUsageLimit(userId);

    // Determine if subscription is active (for both pro and creator)
    const isSubscriptionActive =
      (user?.subscriptionTier === "pro" || user?.subscriptionTier === "creator") &&
      (!user?.subscriptionEndsAt || new Date() < user.subscriptionEndsAt);

    // Determine generation limits based on tier
    let generationsLimit = 5; // free tier
    if (user?.subscriptionTier === "creator") {
      generationsLimit = 60;
    } else if (user?.subscriptionTier === "pro") {
      generationsLimit = -1; // unlimited
    }

    return NextResponse.json({
      subscriptionTier: user?.subscriptionTier || "free",
      subscriptionActive: isSubscriptionActive,
      generationsRemaining: usage.remaining,
      generationsLimit: generationsLimit,
    });
  } catch (err) {
    console.error("Usage check error:", err);
    return NextResponse.json(
      { error: "Failed to check usage" },
      { status: 500 }
    );
  }
}
