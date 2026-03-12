import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import type { ResponseCreateParams, ResponseInputItem } from "openai/resources/responses/responses";


interface Props {
    params: Promise<{ builderId: string }>
}
type BuilderRoleInput = "user" | "system" | "developer";
type BuilderMessageInput = { role: BuilderRoleInput; content: string; };

type FieldBuilderStep = {
    done: boolean;
    nextQuestion: string | null;
    fieldDefinition: {
        entityType?: "product" | "contact" | "order";
        code?: string;
        label?: string;
        fieldType?: "text" | "number" | "boolean" | "select" | "date";
        required?: boolean;
        options?: string[];
    };
    missing: string[];
};

export async function POST(request: NextRequest, { params }: Props) {
    const { builderId } = await params;

    // parse json body before unpack
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid Json" }, { status: 400 });
    }

    const { text } = body as { text?: string };

    if (!builderId || !text) {
        return NextResponse.json({ error: "Missing id or body" }, { status: 400 });
    }

    // check for existing builder
    const builder = await prisma.builder.findUnique({ where: { id: builderId } });

    if (!builder) {
        return NextResponse.json({ error: "Builder not found" }, { status: 400 });
    }

    // start the builder run
    const run = await prisma.builderRun.create({
        data: {
            builderId,
            input: JSON.stringify({ text }),
            status: "pending"
        }
    });

    let finalRun;

    // set status=running, call openai
    try {
        await prisma.builderRun.update({
            where: { id: run.id },
            data: { status: "running" },
        });

        async function callBuilder(
            builderPrompt: string,
            messages: BuilderMessageInput[],
            prevStep?: FieldBuilderStep | null):
            Promise<FieldBuilderStep> {
            const inputItems: ResponseInputItem[] = [
                {
                    type: "message" as const,
                    role: "system",
                    content: [{ type: "input_text" as const, text: builderPrompt }],
                },
            ];

            if (prevStep) {
                inputItems.push({
                    type: "message" as const,
                    role: "system",
                    content: [
                        {
                            type: "input_text" as const,
                            text:
                                "Current builder state:\n" +
                                JSON.stringify(prevStep),
                        },
                    ],
                });
            }

            for (const m of messages) {
                inputItems.push({
                    type: "message" as const,
                    role: m.role,
                    content: [{ type: "input_text" as const, text: m.content }],
                });
            }

            const response = await openai.responses.create({
                model: "gpt-5.1",
                input: inputItems,
            });

            const textParts: string[] = [];
            for (const output of response.output ?? []) {
                if (output.type !== "message") continue;
                for (const content of output.content ?? []) {
                    if (content?.type === "output_text") {
                        textParts.push(content.text);
                    }
                }
            }

            const jsonString = textParts.length > 0 ? textParts.join("").trim() : null;

            if (!jsonString) {
                console.error("OpenAI response missing text output:", response.output);
                throw new Error("No text returned from OpenAI")
            }

            try {
                return JSON.parse(jsonString) as FieldBuilderStep;
            } catch (e) {
                console.error("OpenAI returned invalid JSON:", jsonString);
                throw new Error("AI did not return valid JSON: " + jsonString);
            }
        }

        let extracted: FieldBuilderStep;

        if (builder?.type === "field_builder") {
            const builderPrompt = `
                You are a schema builder for a low-code app.
                The user wants to create custom fields for an entity (like product, contact, order).
                Your goal is to ask just enough questions to build a FieldDefinition object.

                Always respond with pure JSON, no extra text. The JSON must match this TypeScript shape:

                type FieldBuilderStep = {
                    done: boolean;
                    nextQuestion: string | null;
                    fieldDefinition: {
                        entityType?: "product" | "contact" | "order";
                        code?: string;
                        label?: string;
                        fieldType?: "text" | "number" | "boolean" | "select" | "date";
                        required?: boolean;
                        options?: string[];
                    };
                    missing: string[];
                };

                Rules:

                - If done is false, nextQuestion must be a short, clear question to ask the user next.

                - If fieldType is "select", you must collect at least 2 string options.

                - Use missing to list keys that are still unknown.

                - Never include explanations, only the JSON.

            `.trim();

            const messages: BuilderMessageInput[] = [{ role: "user", content: text }];

            // Later: pass prevStep from the client
            extracted = await callBuilder(builderPrompt, messages)

        } else {
            throw new Error(`Unsupported builder type: ${builder?.type}`);
        }

        // store results and success
        finalRun = await prisma.builderRun.update({
            where: { id: run.id },
            data: {
                output: JSON.stringify(extracted),
                status: "success",
                finishedAt: new Date(),
            },
        });

        return NextResponse.json(finalRun);

    } catch (error: any) {
        console.error("Automation run failed: ", error);

        finalRun = await prisma.builderRun.update({
            where: { id: run.id },
            data: {
                status: "error",
                error: error?.message ?? String(error),
                finishedAt: new Date(),
            },
        });

        return NextResponse.json(finalRun, { status: 500 });

    }
}
