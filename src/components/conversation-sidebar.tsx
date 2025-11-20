"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type ConversationSummary = {
    id: string;
    createdAt: string;
    preview: string;
};

export default function ConversationSidebar() {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadConversations() {
            try {
                const res = await fetch("/api/conversations", { cache: "no-store" });
                if (!res.ok) {
                    if (!cancelled) setConversations([]);
                    return;
                }

                const data = (await res.json()) as ConversationSummary[];
                if (!cancelled) setConversations(data);
            } catch (e) {
                console.error("Failed to load conversations", e);
                if (!cancelled) setConversations([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadConversations();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="px-2 py-2 text-[11px] text-slate-500">
                Loading conversations...
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="px-2 py-2 text-[11px] text-slate-500">
                No conversations yet.
            </div>
        );
    }

    async function deleteConversation(id: string) {
        setLoading(true);

        try {
            const response = await fetch(`/api/conversations/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                console.error("Failed to delete conversation");
                return;
            }

            setConversations((prev) => prev.filter((c) => c.id !== id));

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    }

    return (
        <nav className="flex-1 overflow-y-auto">
            <ul>
                {conversations.map((c) => (
                    <li key={c.id}>
                        <div className="flex justify-around items-center">
                            <Link
                                href={`/chatbot?conversationId=${c.id}`}
                                className="block px-2 py-2 hover:bg-slate-800 rounded-md transition text-xs"
                            >
                                <div className="font-medium truncate w-40 text-slate-100">
                                    {c.preview || "Empty conversation"}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1">
                                    {new Date(c.createdAt).toLocaleString()}
                                </div>
                            </Link>
                            <button
                                
                                onClick={() => deleteConversation(c.id)}
                                className="text-red-500 hover:text-red-400 p-1 opacity-70 hover:opacity-100 hover:cursor-pointer"
                                aria-label="Delete conversation"
                            >
                            <Trash2 size={14} />
                            </button>
                        </div>

                    </li>
                ))}
            </ul>
        </nav >
    );
}
