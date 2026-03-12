import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
    _request: NextRequest, 
    { params } : { params: Promise<{ builderId: string }> }

) {
    const { builderId } = await params;

    try {
        const runs = await prisma.builderRun.findMany({
            where: { builderId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(runs);
    } catch(error) {
        console.log("Error getting the builder runs.", error)
        return NextResponse.json(
            { error: "Error getting builder runs" },
            { status: 500 }
        )
    }


}