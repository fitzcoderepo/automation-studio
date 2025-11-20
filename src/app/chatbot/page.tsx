"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import ConversationSidebar from "@/components/conversation-sidebar";
import NewChatButton from "@/components/new-chat-btn";


type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatbotPage() {
    const searchParams = useSearchParams();

    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isExistingConversation, setIsExistingConversation] = useState(false);
    const [hasStartedNewConversation, setHasStartedNewConversation] = useState(false);

    // Load existing conversation if conversationId is in URL
    useEffect(() => {
        const convoId = searchParams.get("conversationId");

        if (!convoId) {
            setInitializing(false);
            return;
        }

        // avoid refetch if convo already loaded
        if (conversationId === convoId) {
            setInitializing(false);
            return;
        }

        // function to fetch existing conversation messages
        async function loadConversation() {
            try {
                const response = await fetch(`/api/conversations/${convoId}`);
                if (!response.ok) {
                    setInitializing(false);
                    return;
                }

                const data = await response.json();

                setConversationId(data.conversationId);
                setMessages(
                    (data.messages ?? []).map((msg: any) => ({
                        role: msg.role === "user" ? "user" : "assistant",
                        content: msg.content as string,
                    }))
                );

                setIsExistingConversation(true);

            } catch (error) {
                console.error("Error loading conversation:", error);
            } finally {
                setInitializing(false);
            }
        }

        loadConversation();

    }, [searchParams, conversationId]);

    function handleStartNewChat() {
        setConversationId(null);
        setMessages([]);
        setIsExistingConversation(false);
        setHasStartedNewConversation(true);
    }
    // gate the chat UI to only show when a convo is loaded or a new one has been started
    const showChatUI = hasStartedNewConversation || !!conversationId;
    
    
    // function to send messages
    async function sendMessage() {
        if (!input.trim()) return;

        // Add user message to chat locally
        setMessages((prev) => [...prev, { role: "user", content: input }]);

        const userMessage = input;
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, conversationId }),
            });

            const data = await response.json();

            if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId);
            }

            // add assistant message to chat
            setMessages((prev) => [...prev, { role: "assistant", content: data.response ?? "No response received." }]);

        } catch (error: any) {
            setMessages((prev) => [...prev, { role: "assistant", content: "Error: something went wrong. " + (error?.message ?? String(error)) }]);
        }

        setLoading(false);
    }

    async function uploadFile(file: File) {
        setMessages((prev) => [
            ...prev,
            {
                role: "assistant",
                content: `⏳ Uploading "${file.name}"...`,
            },
        ]);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/chatbot/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Upload failed:", text);

                setMessages((prev) => [...prev, { role: "assistant", content: "❌ File upload failed on the server. Check logs.", },]);
                return;
            }

            const data = await response.json();

            setMessages((prev) => [...prev, { role: "assistant", content: `📄 File uploaded: "${file.name}". "I will now use it when responding."` }]);
        } catch (error: any) {
            console.error("Upload error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "❌ File upload failed. Try again." + (error?.message ?? String(error)) }]);
        }
    }

    return (
        <DashboardShell>
            <div className="flex gap-6">
                {/* Left: conversation list + new chat */}
                <aside className="w-64 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col h-[70vh]">
                    <h2 className="text-sm font-semibold text-slate-200 mb-3">
                        Conversations
                    </h2>

                    <div className="flex-1 overflow-y-auto">
                        <ConversationSidebar />
                    </div>

                    <div className="pt-3 border-t border-slate-800 mt-3">
                        <NewChatButton onNewChat={handleStartNewChat} />
                    </div>
                </aside>

                {/* Right: existing chat UI */}
                <div className="flex-1 flex flex-col">
                    {showChatUI ? (
                    <>
                    
                        <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>

                        {conversationId && (
                            <p className="text-xs text-slate-500 mb-3">
                                {isExistingConversation ? (
                                    <>
                                        Continuing conversation:{" "}
                                        <span className="font-mono">{conversationId}</span>
                                    </>
                                ) : (
                                    "New conversation"
                                )}

                            </p>
                        )}


                        {/* File Upload */}
                        <div className="mb-4">
                            <label
                                htmlFor="fileUpload"
                                className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-md border border-slate-700 text-slate-200 text-sm"
                            >
                                📄 Upload File
                            </label>
                            <input
                                id="fileUpload"
                                type="file"
                                accept=".txt,.pdf,.docx,.doc,.xlsx,.xls,.csv"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadFile(file);
                                    e.target.value = "";
                                }}
                            />
                        </div>

                        {/* Chat Messages */}
                        <div className="h-[60vh] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/50 p-4 mb-4">
                            {initializing && messages.length === 0 ? (
                                <p className="text-slate-500 text-sm">Loading conversation...</p>
                            ) : messages.length === 0 ? (
                                <p className="text-slate-500 text-sm">
                                    Start a new conversation by asking a question.
                                </p>
                            ) : (
                                messages.map((m, index) => (
                                    <div
                                        key={index}
                                        className={`mb-3 p-3 rounded-lg max-w-[80%] ${m.role === "user"
                                            ? "bg-blue-600 text-white ml-auto"
                                            : "bg-slate-800 text-slate-200"
                                            }`}
                                    >
                                        {m.content}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Box */}
                        <div className="flex gap-3">
                            <input
                                className="flex-1 rounded-md bg-slate-800 border border-slate-700 p-3 text-slate-100"
                                placeholder="Ask something..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            />

                            <button
                                onClick={sendMessage}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                            >
                                {loading ? "..." : "Send"}
                            </button>
                        </div>
                    </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center">
                            <h2 className="text-lg font-semibold mb-2 text-slate-200">
                                Welcome to the Automation Studio Chatbot
                            </h2>
                            <p className="text-sm text-slate-400">
                                Start a new chat or select an existing conversation to begin.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}