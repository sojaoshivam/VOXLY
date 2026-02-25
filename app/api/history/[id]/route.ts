import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteAudioFile } from "@/lib/utils";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Find the record to ensure it belongs to the user and to get the audio URL
        const generation = await prisma.voiceGeneration.findUnique({
            where: { id },
        });

        if (!generation || generation.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Generation not found or unauthorized" },
                { status: 404 }
            );
        }

        // Attempt to delete from UploadThing if URL exists
        if (generation.audioUrl) {
            try {
                await deleteAudioFile(generation.audioUrl);
                console.log("Deleted audio file from UploadThing:", generation.audioUrl);
            } catch (e) {
                console.error("Failed to delete from UploadThing (continuing):", e);
                // We still want to delete the DB record even if UploadThing fails
            }
        }

        // Delete DB record
        await prisma.voiceGeneration.delete({
            where: { id },
        });

        console.log(`Deleted voice generation record: ${id}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting voice generation:", error);
        return NextResponse.json(
            { error: "Failed to delete voice generation" },
            { status: 500 }
        );
    }
}
