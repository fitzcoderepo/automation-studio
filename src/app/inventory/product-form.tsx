import { FormEvent, useState } from "react";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  ProductCategory,
  ProductType,
} from "@/lib/domain/inventory/Product";
import type { ProductDTO, TagOption } from "./product-types";

type ProductFormProps = {
  availableTags: TagOption[];
  onProductCreated: (product: ProductDTO) => void;
  error: string | null;
  setError: (value: string | null) => void;
};

export function ProductForm({ availableTags, onProductCreated, error, setError }: ProductFormProps) {
  const [name, setName] = useState("");
  const [categoryCode, setCategoryCode] = useState("APP");
  const [productCategory, setProductCategory] = useState<ProductCategory | "">("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [productType, setProductType] = useState<ProductType | "">("");
  const [sellable, setSellable] = useState(false);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#6b7280");
  const [selectedExistingTag, setSelectedExistingTag] = useState("");
  const [uom, setUom] = useState("");
  const [onHand, setOnHand] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    const normalizedName = tagName.trim().toUpperCase();
    if (!normalizedName) return;
    const colorValue = tagColor || "#6b7280";

    setTags((prev) => {
      if (prev.some((t) => t.name === normalizedName)) return prev;
      return [...prev, { name: normalizedName, color: colorValue }];
    });

    setTagName("");
  };

  const handleRemoveTag = (name: string) => {
    setTags((prev) => prev.filter((t) => t.name !== name));
  };

  const handleSelectExistingTag = (name: string) => {
    setSelectedExistingTag(name);
    const existing = availableTags.find((t) => t.name === name);
    if (!existing) return;

    setTagName(existing.name);
    setTagColor(existing.color);
    setTags((prev) => {
      if (prev.some((t) => t.name === existing.name)) return prev;
      return [...prev, { name: existing.name, color: existing.color }];
    });
  };

  async function handleSubmit(e: FormEvent) {
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
          sellable,
          uom: uom.trim() || null,
          onHand: onHand ? Number(onHand) : 0,
          tags,
          attributes,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create product");
      }

      const created = (await res.json()) as ProductDTO;
      onProductCreated(created);

      setName("");
      setProductCategory("");
      setProductType("");
      setColor("");
      setSize("");
      setSellable(false);
      setTags([]);
      setTagName("");
      setTagColor("#6b7280");
      setUom("");
      setOnHand("");
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-slate-800 bg-slate-950 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">New Product</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 border border-slate-800 rounded-md p-4">
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

        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            className="h-4 w-4 accent-sky-500"
            checked={sellable}
            onChange={(e) => setSellable(e.target.checked)}
          />
          Sellable
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border border-slate-800 rounded-md p-4">
        <label className="flex items-center gap-2 text-sm text-slate-200">
          UOM
          <input
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            placeholder="Unit of measure (e.g. EA, KG)"
            value={uom}
            onChange={(e) => setUom(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          On hand
          <input
            type="number"
            min="0"
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100"
            placeholder="On hand"
            value={onHand}
            onChange={(e) => setOnHand(e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-1 border border-slate-800 rounded-md p-4">
        <div className="space-x-2">
          <h2 className="text-sm font-semibold text-slate-200">Attributes</h2>

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
        </div>
        <div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Tags</h2>
          </div>
          <div className="flex gap-2 md:col-span-2 mb-2">
            <select
              className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 flex-1"
              value={selectedExistingTag}
              onChange={(e) => handleSelectExistingTag(e.target.value)}
            >
              <option value="">Select existing tag</option>
              {availableTags.map((tag) => (
                <option key={tag.name} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (selectedExistingTag) handleSelectExistingTag(selectedExistingTag);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-100 rounded-md px-3 py-2"
            >
              Use Tag
            </button>
          </div>
          <div className="flex gap-2 md:col-span-2">
            <input
              className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 flex-1"
              placeholder="Tag name (e.g. SUMMER)"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
            <input
              type="color"
              className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 w-24"
              value={tagColor}
              onChange={(e) => setTagColor(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-100 rounded-md px-3 py-2"
            >
              Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            {tags.map((tag) => (
              <span
                key={tag.name}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: tag.color, color: "#0f172a" }}
              >
                {tag.name}
                <button
                  type="button"
                  className="text-slate-800 hover:text-slate-900"
                  onClick={() => handleRemoveTag(tag.name)}
                  aria-label={`Remove ${tag.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <button
          type="submit"
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-sm font-medium text-white rounded-md px-3 py-2"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
