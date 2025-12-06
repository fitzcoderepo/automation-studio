"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ProductForm } from "./product-form";
import { ProductTable } from "./product-table";
import type { ProductDTO, TagOption } from "./product-types";

export function ProductClient() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  const closeForm = useCallback(() => setShowForm(false), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeForm();
    }
    if (showForm) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [showForm, closeForm]);

  const availableTags: TagOption[] = useMemo(() => {
    const tagMap = new Map<string, string>();
    products.forEach((p) =>
      p.tags.forEach((t) => {
        if (!tagMap.has(t.name)) tagMap.set(t.name, t.color);
      }),
    );
    return Array.from(tagMap.entries())
      .map(([name, color]) => ({ name, color }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-sm muted">Create and manage products. Existing items stay visible while you add new ones.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setShowForm(true);
          }}
          className="group relative inline-flex items-center gap-2 rounded-full border-subtle bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs shadow">
            +
          </span>
          <span>Add product</span>
        </button>
      </div>

      <ProductTable products={products} availableTags={availableTags} onRefresh={loadProducts} />

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-4xl px-4">
            <div className="panel rounded-xl shadow-2xl border-subtle">
              <div className="flex items-center justify-between px-4 pt-4">
                <div>
                  <h3 className="text-lg font-semibold">Create Product</h3>
                  <p className="text-sm muted">Fill out the details and save; the list will update instantly.</p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-md px-2 py-1 text-sm muted hover:accent"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <ProductForm
                  availableTags={availableTags}
                  onProductCreated={(product) => {
                    setProducts((prev) => [product, ...prev]);
                    closeForm();
                  }}
                  error={error}
                  setError={setError}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
