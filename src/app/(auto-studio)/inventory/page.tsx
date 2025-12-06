import { ProductClient } from "@/features/inventory/product-client";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Products</h1>
        <p className="text-sm text-slate-400">
          Create products and verify the ProductService + API wiring.
        </p>
      </div>

      <ProductClient />
    </div>
  );
}
