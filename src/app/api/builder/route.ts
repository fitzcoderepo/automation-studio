import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
    try {
        const builders = await prisma.builder.findMany({
            orderBy: {createdAt: "desc"},
        });

        return NextResponse.json(builders);
    } catch (error) {
        console.error("Error getting builders", error);
        return NextResponse.json(
            { error: "Failed to get builders" }, 
            { status: 500 }
        );
    }

    
}