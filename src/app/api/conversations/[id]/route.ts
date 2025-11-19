import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Conversation, Message } from "@prisma/client";


export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid conversation id" },
                { status: 400 }
            );
        }

        const conversation: Conversation | null = await prisma.conversation.findUnique({ where: { id } });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const messages: Message[] = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({
            conversationId: conversation.id,
            messages: messages.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt,
            })),
        });
    } catch (error: any) {
        console.error("Error fetching conversation:", error);
        return NextResponse.json({ error: "Internal Server Error when trying to fetch conversation." }, { status: 500 });
    }
}
