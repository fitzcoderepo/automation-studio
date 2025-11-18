import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const file = form.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const uploaded = await openai.files.create({
            file,
            purpose: "assistants",
        });

        // save file to db
        await prisma.uploadedFile.create({
            data: {
                fileId: uploaded.id,
                filename: file.name,
            },
        });

        return NextResponse.json({
            success: true,
            fileId: uploaded.id,
            filename: file.name,
        });
    } catch (err: any) {
        console.error("Upload route error:", err);
        return NextResponse.json(
            {
                error: "Failed to upload file",
                details: err?.message ?? String(err),
            },
            { status: 500 }
        );
    }
}
