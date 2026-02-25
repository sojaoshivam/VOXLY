import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardClient from './client';
import { getTierConfig } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // If the database was just reset, the session cookie might still exist
  // but the User row is gone. We must check before creating records for them.
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) {
    redirect('/api/auth/signin');
  }

  // ✅ Always read subscriptionTier from database, not from cached session
  // This ensures webhook updates are reflected immediately
  const subscriptionTier = (dbUser.subscriptionTier || 'free') as string;
  const tierConfig = getTierConfig(subscriptionTier);

  // 1. Fetch History (latest 50)
  const historyRaw = await prisma.voiceGeneration.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Map to the shape expected by the frontend
  const initialHistory = historyRaw.map(h => ({
    id: h.id,
    script: h.scriptText,
    // Capitalize language so it's always Title Case (e.g. "hindi" -> "Hindi")
    language: h.language
      ? h.language.charAt(0).toUpperCase() + h.language.slice(1)
      : h.language,
    voice: h.voiceName || h.voiceId,
    duration: h.durationSeconds ? `0:${h.durationSeconds.toString().padStart(2, '0')}` : '0:00',
    createdAt: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(h.createdAt),
    audioUrl: h.audioUrl || undefined,
  }));

  // 2. Get accurate total generation count (not limited by the 50-item history fetch)
  const totalGenerations = await prisma.voiceGeneration.count({ where: { userId } });

  // 3. Ensure usageStats always exists (upsert)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const usage = await prisma.usageStats.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      generationsThisMonth: 0,
      monthStartDate: monthStart,
    },
  });

  const usageUsed = usage.generationsThisMonth;
  const usageTotal = tierConfig.monthlyLimit === -1 ? 999999 : tierConfig.monthlyLimit;

  // 4. Unique languages used
  const uniqueLanguages = new Set(historyRaw.map(h => h.language?.toLowerCase())).size;

  return (
    <DashboardClient
      initialHistory={initialHistory}
      usageUsed={usageUsed}
      usageTotal={usageTotal}
      totalGenerations={totalGenerations}
      uniqueLanguages={uniqueLanguages}
      subscriptionTier={subscriptionTier}
    />
  );
}
