import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
    try {
        const defs = [
            {
                type: "field_builder",
                name: "Field Builder",
            },
            {
                type: "form_builder",
                name: "Form Builder",
            }
        ];

        const builders = [];

        for (const def of defs) {
            let builder = await prisma.builder.findFirst({
                where: { type: def.type },
            });

            if (!builder) {
                builder = await prisma.builder.create({
                    data: {
                        type: def.type,
                        name: def.name,
                    },
                });
            }

            builders.push(builder);
        }

        return NextResponse.json(builders);

    } catch (error: any) {
            console.error("Error in seeding builder:", error);
            return NextResponse.json(
                { error: "Internal Server Error when seeding builder." }, 
                { status: 500 }
            );
    }
}