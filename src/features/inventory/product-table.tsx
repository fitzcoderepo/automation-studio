import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  ProductCategory,
  ProductType,
} from "@/lib/domain/inventory/Product";
import type { ProductDTO, TagOption } from "./product-types";

type ProductTableProps = {
  products: ProductDTO[];
  availableTags: TagOption[];
  onRefresh: () => void | Promise<void>;
};

export function ProductTable({ products, availableTags, onRefresh }: ProductTableProps) {
  const [filterType, setFilterType] = useState<ProductType | "">("");
  const [filterCategory, setFilterCategory] = useState<ProductCategory | "">("");
  const [filterTag, setFilterTag] = useState("");
  const [sellableFilter, setSellableFilter] = useState<"all" | "yes" | "no">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "dateCreated" | "name" | "sku" | "onHand" | "productType" | "productCategory"
  >("dateCreated");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (filterType && p.productType !== filterType) return false;
      if (filterCategory && p.productCategory !== filterCategory) return false;
      if (filterTag && !p.tags.some((t) => t.name === filterTag)) return false;
      if (sellableFilter !== "all") {
        const isSellable = sellableFilter === "yes";
        if (p.sellable !== isSellable) return false;
      }
      if (normalizedSearch) {
        const haystack = `${p.name} ${p.sku} ${p.label}`.toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }
      return true;
    });

    const direction = sortDir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name) * direction;
        case "sku":
          return a.sku.localeCompare(b.sku) * direction;
        case "productType":
          return a.productType.localeCompare(b.productType) * direction;
        case "productCategory":
          return a.productCategory.localeCompare(b.productCategory) * direction;
        case "onHand":
          return (a.onHand - b.onHand) * direction;
        case "dateCreated":
        default: {
          const aDate = new Date(a.dateCreated).getTime();
          const bDate = new Date(b.dateCreated).getTime();
          return (aDate - bDate) * direction;
        }
      }
    });
  }, [
    filterCategory,
    filterTag,
    filterType,
    products,
    searchTerm,
    sellableFilter,
    sortBy,
    sortDir,
  ]);

  return (
    <div className="border border-slate-800 bg-slate-950 rounded-xl p-4">
      <div className="flex flex-col gap-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-2">
          <input
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            placeholder="Search name, SKU, or label"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ProductType | "")}
          >
            <option value="">All types</option>
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <select
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ProductCategory | "")}
          >
            <option value="">All categories</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")}
              </option>
            ))}
          </select>
          <select
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">All tags</option>
            {availableTags.map((tag) => (
              <option key={tag.name} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
          <select
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            value={sellableFilter}
            onChange={(e) => setSellableFilter(e.target.value as "all" | "yes" | "no")}
          >
            <option value="all">All sellable</option>
            <option value="yes">Sellable only</option>
            <option value="no">Not sellable</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <label className="flex items-center gap-2">
              <span>Sort by</span>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "dateCreated"
                      | "name"
                      | "sku"
                      | "onHand"
                      | "productType"
                      | "productCategory",
                  )
                }
              >
                <option value="dateCreated">Created</option>
                <option value="name">Name</option>
                <option value="sku">SKU</option>
                <option value="onHand">On hand</option>
                <option value="productType">Type</option>
                <option value="productCategory">Category</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span>Direction</span>
              <select
                className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100"
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="text-xs text-slate-400 hover:text-slate-200">
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterType("");
                setFilterCategory("");
                setFilterTag("");
                setSellableFilter("all");
                setSearchTerm("");
                setSortBy("dateCreated");
                setSortDir("desc");
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-200">
          Products ({filteredProducts.length}
          {filteredProducts.length !== products.length ? ` / ${products.length}` : ""})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2 text-left">SKU</th>
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Type</th>
              <th className="py-2 text-left">Category</th>
              <th className="py-2 text-left">UOM</th>
              <th className="py-2 text-left">On Hand</th>
              <th className="py-2 text-left">Sellable</th>
              <th className="py-2 text-left">Tags</th>
              <th className="py-2 text-left">Barcode</th>
              <th className="py-2 text-left">Attributes</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-slate-900 last:border-none">
                <td className="py-2 pr-4 font-mono text-xs text-slate-300">{p.sku}</td>
                <td className="py-2 pr-4">
                  <Link href={`/inventory/products/${p.id}`} className="text-slate-100 hover:text-sky-300">
                    {p.name}
                  </Link>
                  <div className="text-xs text-slate-500">{p.label}</div>
                </td>
                <td className="py-2 pr-4 text-xs text-slate-400">{p.productType}</td>
                <td className="py-2 pr-4 text-xs text-slate-400">{p.productCategory}</td>
                <td className="py-2 pr-4 text-xs text-slate-400">{p.uom || "—"}</td>
                <td className="py-2 pr-4 text-xs text-slate-400">{p.onHand}</td>
                <td className="py-2 pr-4 text-xs text-slate-400">{p.sellable ? "Yes" : "No"}</td>
                <td className="py-2 pr-4 text-xs text-slate-400">
                  {p.tags.length === 0 ? "—" : p.tags.map((t) => t.name).join(", ")}
                </td>
                <td className="py-2 pr-4 font-mono text-xs text-slate-300">{p.barcode}</td>
                <td className="py-2 pr-4 text-xs text-slate-400">
                  {p.attributes.length === 0 ? "—" : p.attributes.map((a) => `${a.code}: ${a.value}`).join(", ")}
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={10} className="py-6 text-center text-sm text-slate-500">
                  {products.length === 0
                    ? "No products yet. Create one above to test the service + API."
                    : "No products match the current filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
