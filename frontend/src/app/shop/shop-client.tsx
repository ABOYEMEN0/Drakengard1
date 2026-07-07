"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "@/lib/data";
import { cn, effectivePrice } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { ProductGrid } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/reveal";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "bestselling", label: "Best Selling" },
  { value: "rating", label: "Top Rated" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

const MAX_PRICE = Math.max(...PRODUCTS.map((p) => effectivePrice(p)));

export function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") as SortValue) || "newest";
  const saleOnly = searchParams.get("sale") === "true";

  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  const activeCategory = CATEGORIES.find((c) => c.slug === category);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = PRODUCTS.filter(
      (p) =>
        (!category || p.category === category) &&
        (!saleOnly || p.onSale) &&
        effectivePrice(p) <= maxPrice &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)))
    );
    items = [...items];
    switch (sort) {
      case "price-asc":
        items.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case "price-desc":
        items.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case "bestselling":
        items.sort(
          (a, b) => Number(b.isBestSeller) - Number(a.isBestSeller) || b.reviewCount - a.reviewCount
        );
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      default:
        items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return items;
  }, [category, saleOnly, maxPrice, query, sort]);

  const hasActiveFilters = Boolean(category || saleOnly || query || maxPrice < MAX_PRICE);

  const filterPanel = (
    <div className="space-y-8">
      {/* Categories */}
      <fieldset>
        <legend className="label-luxe mb-3">Category</legend>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setParam("category", null)}
            className={cn(
              "rounded-button px-3 py-2 text-left text-sm transition-colors hover:bg-navy/5",
              !category ? "bg-gold/10 font-medium text-navy" : "text-muted"
            )}
            aria-pressed={!category}
          >
            All products
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setParam("category", c.slug)}
              className={cn(
                "flex items-center justify-between rounded-button px-3 py-2 text-left text-sm transition-colors hover:bg-navy/5",
                category === c.slug ? "bg-gold/10 font-medium text-navy" : "text-muted"
              )}
              aria-pressed={category === c.slug}
            >
              {c.name}
              <span className="text-xs text-muted">{c.productCount}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Price */}
      <div>
        <label htmlFor="price-range" className="label-luxe">
          Max price
          <span className="ml-2 font-normal text-gold-600">{maxPrice} SAR</span>
        </label>
        <input
          id="price-range"
          type="range"
          min={0}
          max={MAX_PRICE}
          step={5}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-gold-600"
          aria-valuetext={`${maxPrice} SAR`}
        />
        <div className="flex justify-between text-xs text-muted">
          <span>0 SAR</span>
          <span>{MAX_PRICE} SAR</span>
        </div>
      </div>

      {/* Sale */}
      <label className="flex cursor-pointer items-center gap-3 text-sm text-navy">
        <input
          type="checkbox"
          checked={saleOnly}
          onChange={(e) => setParam("sale", e.target.checked ? "true" : null)}
          className="h-4 w-4 accent-gold-600"
        />
        On sale only
      </label>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setMaxPrice(MAX_PRICE);
            router.push("/shop", { scroll: false });
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider2 text-gold-600 hover:text-gold-700"
        >
          <X size={12} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs
        items={
          activeCategory
            ? [{ label: "Shop", href: "/shop" }, { label: activeCategory.name }]
            : [{ label: "Shop" }]
        }
      />

      <Reveal>
        <div className="mb-10">
          <p className="eyebrow mb-3">The Collection</p>
          <h1 className="heading-lg">{activeCategory ? activeCategory.name : "Shop all"}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {activeCategory
              ? activeCategory.description
              : "Every product in the maison — coffee, chocolate, nuts, accessories and gifts."}
          </p>
        </div>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block" aria-label="Filters">
          {filterPanel}
        </aside>

        <div>
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="inline-flex h-11 items-center gap-2 rounded-button border border-line bg-white px-4 text-sm text-navy transition-colors hover:border-gold lg:hidden"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <label htmlFor="shop-search" className="sr-only">
                Search within results
              </label>
              <Input
                id="shop-search"
                type="search"
                placeholder="Search within results…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="shop-sort" className="hidden text-xs uppercase tracking-wider2 text-muted sm:block">
                Sort
              </label>
              <Select
                id="shop-sort"
                value={sort}
                onChange={(e) => setParam("sort", e.target.value === "newest" ? null : e.target.value)}
                className="w-auto min-w-[170px]"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Mobile filters */}
          {filtersOpen && (
            <div className="card-luxe mb-6 p-6 lg:hidden" aria-label="Filters">
              {filterPanel}
            </div>
          )}

          <p className="mb-6 text-sm text-muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
            {saleOnly && " on sale"}
          </p>

          {filtered.length > 0 ? (
            <ProductGrid products={filtered} className="xl:grid-cols-3 2xl:grid-cols-3" />
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="Nothing matches"
              description="No products fit these filters. Try widening the price range or clearing a filter."
              actionLabel="Clear filters"
              actionHref="/shop"
            />
          )}

          {!hasActiveFilters && (
            <p className="mt-12 text-center text-xs text-muted">
              Looking for something specific?{" "}
              <Link href="/search" className="text-gold-600 hover:underline">
                Try the search
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
