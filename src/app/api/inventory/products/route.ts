import { NextResponse, NextRequest } from "next/server";
import { ProductService } from "@/lib/services/inventory/ProductService"

// in ProductService.ts
// export type CreateProductInput = { ... }
// then here...
// const body = (await req.json()) as CreateProductInput;
// const product = await ProductService.createProduct(body);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // accept only what's needed
        const product = await ProductService.createProduct({
            name: body.name,
            categoryCode: body.categoryCode,
            productType: body.productType,
            attributes: body.attributes,
        });

        return NextResponse.json(product.toDTO(), { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message ?? "Failed to create product" },
            { status: 400 },
        );
    }

}

export async function GET() {
    const products = await ProductService.listProducts();
    return NextResponse.json(products.map((p) => p.toDTO()));
}
