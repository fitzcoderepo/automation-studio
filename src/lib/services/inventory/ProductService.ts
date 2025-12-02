import { prisma } from "@/lib/prisma";
import { Product, type RawProduct } from "@/lib/domain/inventory/Product";
import { createDecipheriv } from "crypto";
import { Prisma } from "@prisma/client";

// type checking
type AttributeInput = { code: string; value: string };

type CreateProductInput = {
    name: string;
    categoryCode: string;
    productType?: "MANUFACTURED" | "PURCHASED" | "BOTH";
    attributes?: AttributeInput[];
};



function slugPart(value: string, maxLen: number) {
    return value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, maxLen);
}

function buildBaseSku({
    categoryCode,
    name,
    attributes,
}: {
    categoryCode: string;
    name: string;
    attributes?: AttributeInput[];
}) {
    const cat = slugPart(categoryCode, 4);
    const base = slugPart(name, 8);

    const attrBits: string[] = [];

    const colorAttr = attributes?.find(
        (a) => a.code.toUpperCase() === "COLOR"
    );
    const sizeAttr = attributes?.find(
        (a) => a.code.toUpperCase() === "SIZE"
    );

    if (colorAttr) {
        attrBits.push(slugPart(colorAttr.value, 4));
    }
    if (sizeAttr) {
        attrBits.push(slugPart(sizeAttr.value, 4));
    }

    return [cat, base, ...attrBits].filter(Boolean).join("-");
}

async function generateUniqueSku(input: CreateProductInput) {

    const base = buildBaseSku(input);

    const existing = await prisma.product.findFirst({
        where: { sku: base },
        select: { sku: true },
    });

    if (!existing) {
        return base;
    }

    let counter = 1;

    while (true) {
        const candidate = `${base}-${counter.toString().padStart(2, "0")}`;
        const exists = await prisma.product.findFirst({
            where: { sku: candidate },
            select: { sku: true },
        });

        if (!exists) {
            return candidate;
        }

        counter += 1;
    }
}

// "I" + rand 10 char token
function buildInternalBarcode() {
    return "I" + crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}


async function upsertAttributes(
    tx: Prisma.TransactionClient,
    productId: number,
    attributes: AttributeInput[]
) {

    for (const { code, value } of attributes) {
        if (!code?.trim() || !value?.trim()) {
            continue;
        }

        const attrCode = code.trim().toUpperCase();

        const def = await tx.attributeDefinition.upsert({
            where: { code: attrCode },
            update: {},
            create: {
                code: attrCode,
                name: attrCode,
            },
        });

        await tx.productAttribute.create({
            data: {
                productId,
                attributeId: def.id,
                value: value.trim(),
            },
        });
    }
}



export class ProductService {
    // Product Queries

    static async listProducts() {
        const records = await prisma.product.findMany({
            orderBy: { dateCreated: "desc" },
            include: {
                attributes: {
                    include: { attribute: true },
                },
                barcodes: true,
                vendorProducts: true,
            },
        });

        return records.map((r) => Product.fromPrisma(r as RawProduct));
    }

    static async getProductById(id: number) {
        const record = await prisma.product.findUnique({
            where: { id },
            include: {
                attributes: {
                    include: { attribute: true },
                },
                barcodes: true,
                vendorProducts: true,
            },
        });

        if (!record) return null;
        return Product.fromPrisma(record as RawProduct);
    }

    // Commands

    static async createProduct(input: CreateProductInput) {
        const { name, categoryCode } = input;

        if (!name?.trim()) {
            throw new Error("Name is required.");
        }

        if (!categoryCode?.trim()) {
            throw new Error("Category code is required.");
        }

        
        return prisma.$transaction(async (tx) => {
            // sku
            const sku = await generateUniqueSku(input);
            const barcode = buildInternalBarcode();

            // create product with barcode and include relations
            const created = await tx.product.create({
                data: {
                    name: name.trim(),
                    sku,
                    barcode,
                    productType: input.productType ?? "MANUFACTURED",
                },
                include: {
                    attributes: { include: { attribute: true } },
                    barcodes: true,
                    vendorProducts: true,
                }
            });

            // attributes 
            if (input.attributes && input.attributes.length > 0) {
                await upsertAttributes(tx, created.id, input.attributes);

                // re-fetch with attributes loaded
                const final = await tx.product.findUnique({
                    where: { id: created.id },
                    include: {
                        attributes: { include: { attribute: true } },
                        barcodes: true,
                        vendorProducts: true,
                    },
                });

                if (!final) {
                    throw new Error("Failed to load newly created product.");
                }

                return Product.fromPrisma(final as RawProduct);
            }

            return Product.fromPrisma(created as RawProduct);
        });
    }
}



