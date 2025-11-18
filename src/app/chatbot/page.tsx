"use client";

import { useState } from "react";
import DashboardShell from "@/components/dashboard-shell";


export default function ChatbotPage() {
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    async function sendMessage() {
        if (!input.trim()) return;

        // Add user message to chat
        setMessages((prev) => [...prev, { role: "user", content: input }]);
        const userMessage = input;
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

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

                setMessages((prev) => [...prev,{role: "assistant", content: "❌ File upload failed on the server. Check logs." ,},]);
                return;
            }

            const data = await response.json();

            setMessages((prev) => [...prev, { role: "assistant", content:  `📄 File uploaded: "${file.name}". "I will now use it when responding."` }]);
        } catch (error: any) {
            console.error("Upload error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "❌ File upload failed. Try again." + (error?.message ?? String(error)) }]);
        }
    }

    return (
        <DashboardShell>
            <h1 className="text-2xl font-bold mb-6">AI Chatbot</h1>

            {/* File Upload */}
            <div className="mb-6">
                <label htmlFor="fileUpload" className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-md border border-slate-700 text-slate-200 text-sm">
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
                {messages.map((m, index) => (
                    <div
                        key={index}
                        className={`mb-3 p-3 rounded-lg max-w-[80%] ${m.role === "user"
                            ? "bg-blue-600 text-white ml-auto"
                            : "bg-slate-800 text-slate-200"
                            }`}
                    >
                        {m.content}
                    </div>
                ))}
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
        </DashboardShell>
    );
}