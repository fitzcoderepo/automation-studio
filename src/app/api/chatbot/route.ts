import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";


export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-5.1",
            messages: [
                {
                    role: "system",
                    content: "You're a helpful support chatbot for Automation Studio, an AI + automation dashboard. Answer the user's questions about the product and its features in a concise and friendly manner."
                },
                {
                    role: "user",
                    content: message,
                },
            ],

        });

        const response = completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

        return NextResponse.json({ response });
            
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while processing your request.", details: error?.message ?? String(error), },
            { status: 500 }
        );
    }
}


