import { prisma } from "@/lib/prisma";
import type { Conversation, Message } from "@prisma/client";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ConversationDetailPage({ params }: Props) {

    const { id } = await params;

    // make sure we aren't missing the ID or using an invalid one
    if (!id || typeof id !== "string") {
        return (
            <>
                <h1 className="text-2xl font-bold mb-6">Conversation Not Found</h1>
                <p className="text-slate-400 text-sm">
                    No conversation ID was provided in the URL.
                </p>
            </>
        );
    }

    const conversation: Conversation | null = await prisma.conversation.findUnique({
        where: { id },
    });

    if (!conversation) {
        return (
            <>
                <h1 className="text-2xl font-bold mb-6">Conversation Not Found</h1>
                <p className="text-slate-400 text-sm">
                    We couldn't find a conversation with this ID.
                </p>
            </>
        );
    }

    const messages: Message[] = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: "asc" },
    });

    return (
        <>
            <h1 className="text-2xl font-bold mb-6">
                Conversation Details
            </h1>
            <p className="text-sm text-slate-400 mb-4">
                <a href={`/chatbot?conversationId=${id}`} className="underline hover:text-white">
                    Continue with this conversation in the chat interface &gt;
                </a>
            </p>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-4">
                {messages.length === 0 ? (
                    <p className="text-slate-400 text-sm">No messages in this conversation.</p>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-3 rounded-lg max-w-[75%] ${msg.role === "user"
                                ? "bg-blue-600 text-white ml-auto"
                                : "bg-slate-800 text-slate-200"
                                }`}
                        >
                            <div className="text-xs opacity-70 mb-1">
                                {msg.role.toUpperCase()} • {msg.createdAt.toLocaleString()}
                            </div>
                            {msg.content}
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
