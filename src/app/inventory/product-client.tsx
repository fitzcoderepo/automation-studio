"use client";
import { useEffect, useMemo, useState } from "react";
import { ProductForm } from "./product-form";
import { ProductTable } from "./product-table";
import type { ProductDTO, TagOption } from "./product-types";

export function ProductClient() {
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
      <ProductForm
        availableTags={availableTags}
        onProductCreated={(product) => setProducts((prev) => [product, ...prev])}
        error={error}
        setError={setError}
      />
      <ProductTable products={products} availableTags={availableTags} onRefresh={loadProducts} />
    </div>
  );
}
