"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { Package, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "@/lib/data";
import { CategorySlug, Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

type StockFilter = "all" | "low" | "out";

interface ProductForm {
  name: string;
  nameAr: string;
  slug: string;
  category: CategorySlug;
  price: string;
  salePrice: string;
  weight: string;
  stock: string;
  sku: string;
  barcode: string;
  tags: string;
  shortDescription: string;
  description: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  onSale: boolean;
  metaTitle: string;
  metaDescription: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  nameAr: "",
  slug: "",
  category: "coffee",
  price: "",
  salePrice: "",
  weight: "250g",
  stock: "0",
  sku: "",
  barcode: "",
  tags: "",
  shortDescription: "",
  description: "",
  isFeatured: false,
  isBestSeller: false,
  isNew: true,
  onSale: false,
  metaTitle: "",
  metaDescription: "",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formFrom(p: Product): ProductForm {
  return {
    name: p.name,
    nameAr: p.nameAr,
    slug: p.slug,
    category: p.category,
    price: String(p.price),
    salePrice: p.salePrice != null ? String(p.salePrice) : "",
    weight: p.weight,
    stock: String(p.stock),
    sku: p.sku,
    barcode: p.barcode ?? "",
    tags: p.tags.join(", "),
    shortDescription: p.shortDescription,
    description: p.description,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNew: p.isNew,
    onSale: p.onSale,
    metaTitle: p.attributes.metaTitle ?? "",
    metaDescription: p.attributes.metaDescription ?? "",
  };
}

export default function AdminProductsPage() {
  const push = useToast((s) => s.push);
  const [products, setProducts] = useState<Product[]>(() => PRODUCTS.map((p) => ({ ...p })));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (stockFilter === "low" && !(p.stock > 0 && p.stock <= p.lowStockThreshold)) return false;
      if (stockFilter === "out" && p.stock !== 0) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [products, query, category, stockFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setPanelOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm(formFrom(p));
    setError("");
    setPanelOpen(true);
  }

  function set<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && editingId === null) next.slug = slugify(String(value));
      return next;
    });
  }

  function toggleFeatured(id: string) {
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p)));
    const p = products.find((x) => x.id === id);
    if (p) push(p.isFeatured ? `${p.name} removed from featured` : `${p.name} marked as featured`);
  }

  function remove(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setProducts((ps) => ps.filter((x) => x.id !== p.id));
    push(`${p.name} deleted`);
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim() || !form.sku.trim()) {
      setError("Name, price and SKU are required.");
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be a positive number.");
      return;
    }
    const salePrice = form.salePrice.trim() ? Number(form.salePrice) : undefined;
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const shared = {
      name: form.name.trim(),
      nameAr: form.nameAr.trim(),
      slug: form.slug.trim() || slugify(form.name),
      category: form.category,
      price,
      salePrice,
      weight: form.weight.trim() || "250g",
      stock: Math.max(0, Math.round(Number(form.stock) || 0)),
      sku: form.sku.trim(),
      barcode: form.barcode.trim() || undefined,
      tags,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      isNew: form.isNew,
      onSale: form.onSale,
    };
    const seo: Record<string, string> = {};
    if (form.metaTitle.trim()) seo.metaTitle = form.metaTitle.trim();
    if (form.metaDescription.trim()) seo.metaDescription = form.metaDescription.trim();

    if (editingId) {
      setProducts((ps) =>
        ps.map((p) =>
          p.id === editingId ? { ...p, ...shared, attributes: { ...p.attributes, ...seo } } : p
        )
      );
      push(`${shared.name} updated`);
    } else {
      const sibling = products.find((p) => p.category === form.category) ?? products[0];
      const created: Product = {
        id: `p-new-${Date.now()}`,
        currency: "SAR",
        images: sibling ? [...sibling.images] : ["/images/categories/coffee.svg"],
        origin: undefined,
        lowStockThreshold: 10,
        rating: 0,
        reviewCount: 0,
        attributes: seo,
        variants: undefined,
        createdAt: new Date().toISOString(),
        ...shared,
      };
      setProducts((ps) => [created, ...ps]);
      push(`${shared.name} created`);
    }
    setPanelOpen(false);
  }

  const inputCls = "h-11";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Catalog</p>
          <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {filtered.length} of {products.length} products
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={openCreate}>
          <Plus size={15} /> Add product
        </Button>
      </div>

      {/* Filters */}
      <div className="card-luxe flex flex-col gap-3 p-4 sm:flex-row sm:p-5">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or SKU…"
            aria-label="Search products"
            className="pl-10"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategorySlug | "all")}
          aria-label="Filter by category"
          className="sm:w-48"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          aria-label="Filter by stock"
          className="sm:w-44"
        >
          <option value="all">All stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-luxe">
          <EmptyState icon={Package} title="No products found" description="Try a different search or filter, or add a new product." />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card-luxe hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider2 text-muted">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">SKU</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Sale</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Featured</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-ivory/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-card border border-line bg-ivory">
                            <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                          </span>
                          <span className="font-medium text-navy">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted">{p.sku}</td>
                      <td className="px-5 py-3 capitalize text-muted">{p.category.replace("-", " ")}</td>
                      <td className="px-5 py-3 text-navy">{formatPrice(p.price)}</td>
                      <td className="px-5 py-3 text-muted">{p.salePrice != null ? formatPrice(p.salePrice) : "—"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "font-semibold",
                            p.stock === 0
                              ? "text-[#B42318]"
                              : p.stock <= p.lowStockThreshold
                                ? "text-[#8A6D1F]"
                                : "text-navy"
                          )}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleFeatured(p.id)}
                          aria-label={p.isFeatured ? `Unfeature ${p.name}` : `Feature ${p.name}`}
                          aria-pressed={p.isFeatured}
                          className="rounded-button p-1.5 hover:bg-navy/5"
                        >
                          <Star
                            size={17}
                            className={p.isFeatured ? "fill-gold text-gold" : "text-line"}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            aria-label={`Edit ${p.name}`}
                            className="rounded-button p-2 text-navy hover:bg-navy/5"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => remove(p)}
                            aria-label={`Delete ${p.name}`}
                            className="rounded-button p-2 text-[#B42318] hover:bg-[#FBE4E2]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map((p) => (
              <li key={p.id} className="card-luxe flex gap-4 p-4">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-card border border-line bg-ivory">
                  <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium text-navy">{p.name}</p>
                    <button
                      onClick={() => toggleFeatured(p.id)}
                      aria-label={p.isFeatured ? `Unfeature ${p.name}` : `Feature ${p.name}`}
                      aria-pressed={p.isFeatured}
                    >
                      <Star size={17} className={p.isFeatured ? "fill-gold text-gold" : "text-line"} />
                    </button>
                  </div>
                  <p className="text-xs text-muted">
                    {p.sku} · <span className="capitalize">{p.category.replace("-", " ")}</span>
                  </p>
                  <p className="mt-1 text-sm text-navy">
                    {formatPrice(p.salePrice ?? p.price)}
                    {p.salePrice != null && (
                      <span className="ml-2 text-xs text-muted line-through">{formatPrice(p.price)}</span>
                    )}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        p.stock === 0 ? "text-[#B42318]" : p.stock <= p.lowStockThreshold ? "text-[#8A6D1F]" : "text-muted"
                      )}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} className="rounded-button p-2 text-navy hover:bg-navy/5">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(p)} aria-label={`Delete ${p.name}`} className="rounded-button p-2 text-[#B42318] hover:bg-[#FBE4E2]">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Slide-over panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={editingId ? "Edit product" : "Add product"}>
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setPanelOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-xl font-medium text-navy">
                {editingId ? "Edit product" : "Add product"}
              </h2>
              <button aria-label="Close panel" onClick={() => setPanelOpen(false)} className="rounded-button p-1.5 text-muted hover:bg-navy/5 hover:text-navy">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={save} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {error && (
                <p role="alert" className="rounded-card bg-[#FBE4E2] px-4 py-3 text-sm font-medium text-[#B42318]">
                  {error}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="pf-name" required>
                  <Input id="pf-name" className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
                </Field>
                <Field label="Name (Arabic)" htmlFor="pf-nameAr">
                  <Input id="pf-nameAr" dir="rtl" className={inputCls} value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Slug" htmlFor="pf-slug" hint="auto-generated">
                  <Input id="pf-slug" className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
                </Field>
                <Field label="Category" htmlFor="pf-category">
                  <Select id="pf-category" value={form.category} onChange={(e) => set("category", e.target.value as CategorySlug)}>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Price (SAR)" htmlFor="pf-price" required>
                  <Input id="pf-price" type="number" min="0" step="0.01" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} />
                </Field>
                <Field label="Sale price" htmlFor="pf-sale">
                  <Input id="pf-sale" type="number" min="0" step="0.01" className={inputCls} value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} />
                </Field>
                <Field label="Weight" htmlFor="pf-weight">
                  <Input id="pf-weight" className={inputCls} value={form.weight} onChange={(e) => set("weight", e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Stock" htmlFor="pf-stock">
                  <Input id="pf-stock" type="number" min="0" className={inputCls} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
                </Field>
                <Field label="SKU" htmlFor="pf-sku" required>
                  <Input id="pf-sku" className={inputCls} value={form.sku} onChange={(e) => set("sku", e.target.value)} />
                </Field>
                <Field label="Barcode" htmlFor="pf-barcode">
                  <Input id="pf-barcode" className={inputCls} value={form.barcode} onChange={(e) => set("barcode", e.target.value)} />
                </Field>
              </div>
              <Field label="Tags" htmlFor="pf-tags" hint="comma separated">
                <Input id="pf-tags" className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} />
              </Field>
              <Field label="Short description" htmlFor="pf-short">
                <Input id="pf-short" className={inputCls} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
              </Field>
              <Field label="Description" htmlFor="pf-desc">
                <Textarea id="pf-desc" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <fieldset>
                <legend className="label-luxe">Flags</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      ["isFeatured", "Featured"],
                      ["isBestSeller", "Bestseller"],
                      ["isNew", "New"],
                      ["onSale", "On sale"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 rounded-button border border-line px-3 py-2 text-sm text-navy">
                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(e) => set(key, e.target.checked)}
                        className="accent-[#0F2345]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-4">
                <legend className="label-luxe">SEO</legend>
                <Field label="Meta title" htmlFor="pf-mtitle">
                  <Input id="pf-mtitle" className={inputCls} value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
                </Field>
                <Field label="Meta description" htmlFor="pf-mdesc">
                  <Input id="pf-mdesc" className={inputCls} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
                </Field>
              </fieldset>
            </form>
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <Button variant="ghost" size="sm" onClick={() => setPanelOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={save}>
                {editingId ? "Save changes" : "Create product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
