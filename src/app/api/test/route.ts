import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET() {
    const user = await prisma.user.create({
        data: {
            email: `user_${Date.now()}@test.com`,
            name: "Test User",
        },
    });

    return NextResponse.json(user);

}
