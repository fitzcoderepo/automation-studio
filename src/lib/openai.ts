import OpenAI from "openai";

// OpenAI helper

if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable (.env)");
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});