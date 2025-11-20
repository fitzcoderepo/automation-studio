import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
    try {
        const conversations = await prisma.conversation.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                messages: {
                    orderBy: { createdAt: "asc"},
                    take: 1, // use first msg as preview
                },
            },
        });

        return NextResponse.json(
            conversations.map((convo) => ({
                id: convo.id,
                createdAt: convo.createdAt,
                preview: convo.messages[0]?.content?.slice(0, 80) ?? "Empty conversation",
            }))
        );

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to load conversations" }, 
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {

    try {
        const body = await request.json().catch(() => ({}));
        const { title } = body ?? {};

        const newConversation = await prisma.conversation.create({
            data: {
                // Implement title generation later
            }
        });

        return NextResponse.json(newConversation, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create conversation" }, 
            { status: 500 }
        );
    }
}