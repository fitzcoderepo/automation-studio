import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
    _request: NextRequest, 
    { params } : { params: Promise<{ automationId: string }> }

) {
    const { automationId } = await params;

    try {
        const runs = await prisma.automationRun.findMany({
            where: { automationId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(runs);
    } catch(error) {
        console.log("Error getting the automation runs.", error)
        return NextResponse.json(
            { error: "Error getting automation runs" },
            { status: 500 }
        )
    }


}