import { ProductClient } from "@/features/inventory/product-client";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xs font-bold text-slate-100">Inventory</h1>
      </div>

      <ProductClient />
    </div>
  );
}
