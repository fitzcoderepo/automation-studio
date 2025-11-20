"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type NewChatButtonProps = {
    onNewChat?: () => void;
};


export default function NewChatButton({ onNewChat }: NewChatButtonProps) {

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleNewChat() {

        if (loading) return;
        setLoading(true);

        try {
            
            if (onNewChat) {
                onNewChat();

            } else {
                router.push("/chatbot");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleNewChat}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-medium border border-gray-300 hover:bg-gray-50 hover:text-slate-900 disabled:opacity-50">

            {loading ? "Creating..." : "New Chat"}

        </button>
    );
}