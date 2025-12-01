import type {
    ProductType,
    Product as ProductRecord,
    ProductAttribute as ProductAttributeRecord,
    AttributeDefinition as AttributeDefinitionRecord,
    Barcode as BarcodeRecord,
    VendorProduct as VendorProductRecord,
} from "@prisma/client";

export type RawProduct = ProductRecord & {
    attributes?: (ProductAttributeRecord & {
        attribute: AttributeDefinitionRecord;
    })[];
    barcodes?: BarcodeRecord[];
    vendorProducts?: VendorProductRecord[];
};




export class Product {
    private constructor(private readonly raw: RawProduct) { }

    // enforce shape
    static fromPrisma(record: RawProduct) {
        return new Product(record);
    }

    // --- basic getters ----
    get id() {
        return this.raw.id;
    }

    get name() {
        return this.raw.name;
    }

    get sku() {
        return this.raw.sku;
    }

    get productType(): ProductType {
        return this.raw.productType;
    }

    get barcode() {
        return this.raw.barcode;
    }

    get dateCreated() {
        return this.raw.dateCreated;
    }

    get dateUpdated() {
        return this.raw.dateUpdated;
    }
    
    // give explicit return types for attributes and vendor products
    get attributes(): (ProductAttributeRecord & { attribute: AttributeDefinitionRecord })[] {
        return this.raw.attributes ?? [];
    }

    get vendorProducts(): VendorProductRecord[] {
        return this.raw.vendorProducts ?? [];
    }

    // ---- domain logic ----
    isManufactured() {
        return this.productType === "MANUFACTURED" || this.productType === "BOTH";
    }

    isPurchased() {
        return this.productType === "PURCHASED" || this.productType === "BOTH";
    }

    label() {
        return `${this.sku} - ${this.name}`;
    }

    hasAttribute(code: string, value?: string) {
        const upper = code.toUpperCase();
        return this.attributes.some((attr) => {
            if (attr.attribute.code.toUpperCase() !== upper) return false;
            if (value == null) return true;
            return attr.value.toUpperCase() === value.toUpperCase();
        });
    }

    getAttributeValue(code: string): string | null {
        const upper = code.toUpperCase();
        const found = this.attributes.find(
            (attr) => attr.attribute.code.toUpperCase() === upper
        );
        return found?.value ?? null;
    }

    // validate stock move before writing
    validateNewStockAdjustment(quantityDiff: number) {
        if (!Number.isFinite(quantityDiff)) {
            throw new Error("Quantity diff must be a finite number.");
        }
        if (quantityDiff === 0) {
            throw new Error("Quantity diff cannot be zero.");
        }
    }

    // safely serialize data transfer object
    toDTO() {
        return {
            id: this.id,
            name: this.name,
            sku: this.sku,
            productType: this.productType,
            barcode: this.barcode,
            dateCreated: this.dateCreated.toISOString(),
            dateUpdated: this.dateUpdated.toISOString(),
            isManufactured: this.isManufactured(),
            isPurchased: this.isPurchased(),
            label: this.label(),
            attributes: this.attributes.map((attr) => ({
                id: attr.id,
                code: attr.attribute.code,
                name: attr.attribute.name,
                value: attr.value,
            })),
            vendors: this.vendorProducts.map((vp) => ({
                id: vp.id,
                vendorId: vp.vendorId,
                vendorSku: vp.vendorSku,
                vendorBarcode: vp.vendorBarcode,
                active: vp.active,
            })),
        };
    }
}
