import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";



export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ automationId: string }> }
) {
    // unwrap async parameters
    const { automationId } = await params;

    // parse body safely
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid Json" }, { status: 400 });
    }

    // unpack json body
    const { text } = body as { text?: string };

    // check if id or text is missing
    if (!automationId || !text) {
        return NextResponse.json({ error: "Missing id or text" }, { status: 400 })
    }

    // check if the automation exists
    const automation = await prisma.automation.findUnique({
        where: { id: automationId }
    });

    if (!automation) {
        return NextResponse.json({ error: "Automation not found" }, { status: 404 });
    }





    // create the automation run
    const run = await prisma.automationRun.create({
        data: {
            automationId,
            input: JSON.stringify({ text }),
            status: "pending"
        }
    });

    // move to status=running and call openai
    let finalRun;
    try {

        await prisma.automationRun.update({
            where: { id: run.id },
            data: { status: "running" },
        });

        async function callOpenAI(instruction: string, text: string) {
            const aiResponse: any = await openai.responses.create({
                model: "gpt-5.1",
                input: [
                    {
                        role: "system",
                        content: [
                            {
                                type: "input_text",
                                text: instruction
                            },
                        ],
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "input_text",
                                text: text
                            },
                        ],
                    },
                ],
            });

            // extraction
            const firstOutput = aiResponse.output?.[0];
            const firstContent = firstOutput?.content?.[0];
            const textPart = firstContent?.text;

            const jsonString = typeof textPart === "string" ? textPart : textPart?.value ?? null;

            if (!jsonString) {
                throw new Error("No text returned from OpenAI")
            }

            try {
                return JSON.parse(jsonString);
            } catch (e) {
                throw new Error("AI did not return valid JSON: " + jsonString);
            }
        }

        let extracted: any;

        if (automation?.type === "invoice_extraction") {
            const instruction = `
                You are an AI that extracts structured invoice data from free-form text.

                Return ONLY a JSON object with this exact shape, no extra keys, no comments, no explanations:

                {
                    "vendor": string | null,
                    "invoiceNumber": string | null,
                    "invoiceDate": string | null,
                    "currency": string | null,
                    "totalAmount": number | null
                }
                `;
            extracted = await callOpenAI(instruction, text);

        } else if (automation?.type === "spreadsheet_summary") {
            const instruction = `
                You are an AI that analyzes spreadsheet data like CSV and XLSX files.

                Return ONLY a JSON object with this exact shape:

                {
                    "columns": string[] | null,
                    "rowCount": number | null,
                    "summary": string,
                    "insights": string[]
                }
                `;
            extracted = await callOpenAI(instruction, text);
        } else if (automation?.type === "text_summarization") {
            const instruction = `
                You are an AI that summarizes arbitrary text.

                Return ONLY a JSON object with this exact shape:

                {
                    "summary": string,
                    "keyPoints": string[]
                }
                `;
            extracted = await callOpenAI(instruction, text);
        } else {
            throw new Error(`Unsupported automation type: ${automation?.type}`);
        }

        // finally styore the results
        finalRun = await prisma.automationRun.update({
            where: { id: run.id },
            data: {
                output: JSON.stringify(extracted),
                status: "success",
                finishedAt: new Date(),
            },
        });



    } catch (error: any) {
        console.error("Automation run failed: ", error);
        finalRun = await prisma.automationRun.update({
            where: { id: run.id },
            data: {
                status: "error",
                error: error?.message ?? String(error),
                finishedAt: new Date(),
            },
        });
    }

    return NextResponse.json(finalRun);

};