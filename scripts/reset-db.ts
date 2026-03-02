import { prisma } from "../lib/db";
import { deleteAudioFile } from "../lib/utils";

async function main() {
    console.log("Starting database reset...");

    // 1. Fetch all voice generations to delete files from UploadThing
    console.log("Fetching voice generations...");
    const generations = await prisma.voiceGeneration.findMany({
        select: { audioUrl: true, previewUrl: true }
    });

    console.log(`Found ${generations.length} voice generations. Deleting files from UploadThing...`);

    for (const gen of generations) {
        if (gen.audioUrl) {
            console.log(`Deleting audio file: ${gen.audioUrl}`);
            await deleteAudioFile(gen.audioUrl);
        }
        if (gen.previewUrl) {
            console.log(`Deleting preview file: ${gen.previewUrl}`);
            await deleteAudioFile(gen.previewUrl);
        }
    }

    // 2. Delete all records from DB
    console.log("Deleting VoiceGeneration records from database...");
    await prisma.voiceGeneration.deleteMany();

    console.log("Deleting Payment records from database...");
    await prisma.payment.deleteMany();

    console.log("Resetting UsageStats records...");
    await prisma.usageStats.updateMany({
        data: { generationsThisMonth: 0 }
    });

    // 3. Reset all users to free plan
    console.log("Resetting all Users to free plan...");
    await prisma.user.updateMany({
        data: {
            subscriptionTier: "free",
            subscriptionEndsAt: null,
            dodoCustomerId: null,
            dodoSubscriptionId: null
        }
    });

    console.log("Database reset complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
