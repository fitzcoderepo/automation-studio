"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  ProductType,
  ProductCategory,
} from "@/lib/domain/inventory/Product";


type ProductDTO = {
    id: number;
    name: string;
    sku: string;
    productType: string;
    productCategory: string;
    barcode: string;
    dateCreated: string;
    dateUpdated: string;
    isManufactured: boolean;
    isPurchased: boolean;
    label: string;
    attributes: { id: number; code: string; name: string; value: string }[];
    vendors: {
        id: number;
        vendorId: number;
        vendorSku: string | null;
        vendorBarcode: string | null;
        active: boolean;
    }[];
};

export function ProductClient() {
  const [name, setName] = useState("");
  const [categoryCode, setCategoryCode] = useState("APP");
  const [productCategory, setProductCategory] = useState<ProductCategory | "">("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [productType, setProductType] = useState<ProductType | "">("");

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [error, setError] = useState<string | null>(null);


  async function loadProducts() {
    try {
      setError(null);
      const res = await fetch("/api/inventory/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = (await res.json()) as ProductDTO[];
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load products");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !categoryCode.trim() || !productType || !productCategory) {
      setError("Name, category code, product type, and product category are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const attributes: { code: string; value: string }[] = [];
    if (color.trim()) attributes.push({ code: "COLOR", value: color });
    if (size.trim()) attributes.push({ code: "SIZE", value: size });

    try {
      const res = await fetch("/api/inventory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categoryCode: categoryCode.trim(),
          productType,
          productCategory,
          attributes,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create product");
      }

      const created = (await res.json()) as ProductDTO;
      setProducts((prev) => [created, ...prev]);

      setName("");
      setProductCategory("");
      setColor("");
      setSize("");

    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to create product");

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="border border-slate-800 bg-slate-950 rounded-xl p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">New Product</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            placeholder="Name (e.g. Basic T-Shirt)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            placeholder="Category code (e.g. APP)"
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
          />

          <select
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType | "")}
          >
            <option value="" disabled>
              Select type
            </option>
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          <select
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value as ProductCategory | "")}
          >
            <option value="" disabled>
              Select category
            </option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            placeholder="Color (optional, e.g. BLACK)"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

          <input
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            placeholder="Size (optional, e.g. M)"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-sm font-medium text-white rounded-md px-3 py-2"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400">
            {error}
          </p>
        )}
      </form>

      {/* Products table */}
      <div className="border border-slate-800 bg-slate-950 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Products ({products.length})
          </h2>
          <button
            onClick={loadProducts}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">SKU</th>
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-left">Type</th>
                <th className="py-2 text-left">Category</th>
                <th className="py-2 text-left">Barcode</th>
                <th className="py-2 text-left">Attributes</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-900 last:border-none"
                >
                  <td className="py-2 pr-4 font-mono text-xs text-slate-300">
                    {p.sku}
                  </td>
                  <td className="py-2 pr-4">
                    <Link
                      href={`/inventory/products/${p.id}`}
                      className="text-slate-100 hover:text-sky-300"
                    >
                      {p.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {p.label}
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-400">
                    {p.productType}
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-400">
                    {p.productCategory}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-slate-300">
                    {p.barcode}
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-400">
                    {p.attributes.length === 0
                      ? "—"
                      : p.attributes
                          .map((a) => `${a.code}: ${a.value}`)
                          .join(", ")}
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-sm text-slate-500"
                  >
                    No products yet. Create one above to test the service + API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
