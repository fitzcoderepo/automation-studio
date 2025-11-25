import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
    try {
        const automations = await prisma.automation.findMany({
            orderBy: {createdAt: "desc"},
        });

        return NextResponse.json(automations);
    } catch (error) {
        console.error("Error getting automations", error);
        return NextResponse.json(
            { error: "Failed to get automations" }, 
            { status: 500 }
        );
    }

    
}