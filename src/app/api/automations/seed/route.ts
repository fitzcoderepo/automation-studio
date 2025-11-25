import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
    // check if an automation of some type already exists
    // if not, create then return it
    try {

        let automationType = await prisma.automation.findFirst({
            where: { type: "invoice_extraction" },
        });

        if (!automationType) {
            automationType = await prisma.automation.create({
                data: {name: "Invoice Extraction", type: "invoice_extraction"},
            });
        }

        return NextResponse.json(automationType);

    } catch (error: any) {
        console.error("Error fetching/creating automation:", error);
        return NextResponse.json({ error: "Internal Server Error when trying to fetch automation." }, { status: 500 });
    }

}
