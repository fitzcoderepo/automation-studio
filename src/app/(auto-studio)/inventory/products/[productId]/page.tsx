import Link from "next/link";
import { notFound } from "next/navigation";
import type { ProductDTO } from "@/features/inventory/product-types";
import { ProductService } from "@/lib/services/inventory/ProductService";

interface Props {
    params: Promise<{ productId: string }>;
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-900 bg-slate-950/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm text-slate-100">{value ?? "Not provided"}</p>
    </div>
  );
}

export default async function ProductDetailPage({ params }: Props) {

  const { productId: productIdParam } = await params;
  
  const productId = Number.parseInt(productIdParam, 10);
  
  if (Number.isNaN(productId)) {
    notFound();
  }

  const product = await ProductService.getProductById(productId);

  if (!product) {
    notFound();
  }

  const dto = product.toDTO() as ProductDTO;

  const productType = dto.productType.toUpperCase();

  const typeOptions = [
    { label: "Manufactured", value: "MANUFACTURED" },
    { label: "Purchased", value: "PURCHASED" },
    { label: "Both", value: "BOTH" },
  ];

  const quantity = dto.onHand;
  const description = null;

  const title = dto.name || "Product";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Link href="/inventory" className="text-xs font-medium text-sky-400 hover:text-sky-300">
            &larr; Back to inventory
          </Link>
          <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
          <p className="text-sm text-slate-400">SKU: {dto.sku}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            {dto.productType}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Category: {dto.productCategory}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-semibold text-slate-200">Overview</h2>
              <p className="text-xs font-medium text-slate-400">Last updated {dto.dateUpdated ? new Date(dto.dateUpdated).toLocaleString() : "recently"}</p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <DetailRow label="SKU" value={dto.sku} />
              <DetailRow label="Barcode" value={dto.barcode} />
              <div className="flex flex-col gap-1 rounded-lg border border-slate-900 bg-slate-950/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Type</p>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((option) => {
                    const isActive = productType === option.value;
                    return (
                      <span
                        key={option.value}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          isActive
                            ? "border-sky-400 bg-sky-400/10 text-sky-50 ring-1 ring-sky-400/40"
                            : "border-slate-800 bg-slate-900 text-slate-300"
                        }`}
                      >
                        {option.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              <DetailRow label="Created" value={new Date(dto.dateCreated).toLocaleString()} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-semibold text-slate-200">Attributes</h2>
              <p className="text-xs text-slate-400">{dto.attributes.length} defined</p>
            </div>
            {dto.attributes.length === 0 ? (
              <p className="text-sm text-slate-400">No attributes provided.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {dto.attributes.map((attr) => (
                  <DetailRow key={attr.id} label={attr.name || attr.code} value={attr.value} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-semibold text-slate-200">Inventory status</h2>
              <span className="text-xs text-slate-500">Live</span>
            </div>
            <DetailRow label="Quantity on hand" value={quantity ?? "Not tracked"} />
            <DetailRow label="Status" value={dto.productType === "PURCHASED" ? "Purchasing" : "In production"} />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-semibold text-slate-200">Vendors</h2>
              <p className="text-xs text-slate-400">{dto.vendors.length} linked</p>
            </div>
            {dto.vendors.length === 0 ? (
              <p className="text-sm text-slate-400">No vendors attached.</p>
            ) : (
              <div className="space-y-2">
                {dto.vendors.map((vendor) => (
                  <div key={vendor.id} className="flex flex-col gap-1 rounded-lg border border-slate-900 bg-slate-950/60 p-3 text-sm text-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Vendor #{vendor.vendorId}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${vendor.active ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30" : "bg-slate-900 text-slate-400 border border-slate-800"}`}>
                        {vendor.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-slate-100">SKU: {vendor.vendorSku ?? "Not provided"}</p>
                    <p className="text-xs text-slate-400">Barcode: {vendor.vendorBarcode ?? "Not provided"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 lg:col-span-2">
          <h2 className="border-b border-slate-900 pb-3 text-sm font-semibold text-slate-200">Description</h2>
          <p className="pt-3 text-sm text-slate-300">
            {description ?? "No description provided for this product."}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <h2 className="border-b border-slate-900 pb-3 text-sm font-semibold text-slate-200">Media</h2>
          <p className="pt-3 text-sm text-slate-400">No media attached yet.</p>
        </div>
      </div>
    </div>
  );
}
