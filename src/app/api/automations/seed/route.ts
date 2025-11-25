import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {

    try {
        const defs = [
            {
                type: "invoice_extraction",
                name: "Invoice Extraction",
            },
            {
                type: "spreadsheet_summary",
                name: "Spreadsheet Summary"
            },
            {
                type: "text_summarization",
                name: "Text Summarizer",
            },
            {
                type: "csv_importer",
                name: "CSV Importer",
            }
        ];

        const automations = [];

        for (const def of defs) {
            let automation = await prisma.automation.findFirst({
                where: { type: def.type },
            });

            if (!automation) {
                automation = await prisma.automation.create({
                    data: {
                        name: def.name,
                        type: def.type,
                    },
                });
            }

            automations.push(automation);
        }

        return NextResponse.json(automations);

    } catch (error: any) {
        console.error("Error in seeding automation:", error);
        return NextResponse.json(
            { error: "Internal Server Error when seeding automation." }, 
            { status: 500 }
        );
    }

}
