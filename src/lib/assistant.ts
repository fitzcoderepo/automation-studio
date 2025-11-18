import { openai } from "@/lib/openai";


let assistantPromise: Promise<any> | null = null;

// create the assistant lazily once
export async function getAssistant() {
    if (!assistantPromise) {
        assistantPromise = openai.beta.assistants.create({
            name: "Automation Studio Support Bot",
            instructions: "You're a helpful support assistant for Automation Studio. Use the uploaded files to answer questions accurately and concisely.",
            model: "gpt-5.1",
            tools: [{ type: "file_search"}]
        });
    }

    return assistantPromise;
}