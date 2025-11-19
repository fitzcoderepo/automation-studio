import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import type { UploadedFile } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { message, conversationId } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // get or create conversation
    let conversation = null;

    if (conversationId && typeof conversationId === "string") {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {},
      });
    }

    // save user messages to DB
    await prisma.message.create({
      data: {
        role: "user",
        content: message,
        conversationId: conversation.id,
      }
    })

    // get uploaded files from DB to ready doc-based answering
    const files: UploadedFile[] = await prisma.uploadedFile.findMany({
      orderBy: { uploadedAt: "desc" },
    });

    const fileIds = files.map((f) => f.fileId);

    // call the Responses API with file_search
    // add file_search tool 
    const response: any = await openai.responses.create({
      model: "gpt-5.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: message,
            },
          ],
        },
      ],
    });

    // 3) Extract the text answer from the response
    const firstOutput = response.output?.[0];
    const firstContent = firstOutput?.content?.[0];
    const textPart = firstContent?.text;

    const reply =
      typeof textPart === "string" ? textPart : textPart?.value ?? "I couldn't generate a response.";

    // save ai response to DB
    await prisma.message.create({
      data: {
        role: "assistant",
        content: reply,
        conversationId: conversation.id,
      }
    });

    // return the ai response and conversationId so frontend can keep using the same conversation
    return NextResponse.json({response: reply, conversationId: conversation.id});

  } catch (err: any) {
    console.error("Chatbot route error:", err);
    return NextResponse.json(
      {
        error: "Something went wrong",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
