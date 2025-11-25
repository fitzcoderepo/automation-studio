import { NextRequest, NextResponse } from "next/server";
import { fileURLToPath } from "url";


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {return NextResponse.json({ error: "No file uploaded" }, { status: 400 });}

        // for now just handle csv, txt
        const isTextLike = file.type.endsWith(".csv") || file.type.endsWith(".txt") || file.type.endsWith("xls") || file.type.startsWith("text/");

        if (!isTextLike) {
            return NextResponse.json({error: "Only text/.txt/.csv/.xls supported for now" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const text = new TextDecoder("utf-8").decode(arrayBuffer);

        return NextResponse.json({
            filename: file.name,
            text,
        });
    } catch (error: any) {
        console.error("Automation upload error: ", error);
        return NextResponse.json(
            { error: "Failed to process file" },
            { status: 500 }
        );
    }

    
}