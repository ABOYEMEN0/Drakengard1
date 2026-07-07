"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { getBestSellers, searchProducts } from "@/lib/data";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ProductGrid } from "@/components/product/product-card";

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [input, setInput] = useState(q);

  const results = useMemo(() => searchProducts(q), [q]);
  const popular = useMemo(() => getBestSellers().slice(0, 8), []);

  function submit(e: FormEvent) {
    e.preventDefault();
    const query = input.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Search" }]} />

      <Reveal>
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow mb-3">Find It</p>
          <h1 className="heading-lg">{q ? `Results for “${q}”` : "Search the maison"}</h1>
          <form onSubmit={submit} className="mt-6 flex gap-3" role="search">
            <label htmlFor="search-input" className="sr-only">
              Search products
            </label>
            <Input
              id="search-input"
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search coffee, chocolate, nuts, SKU…"
              className="flex-1"
            />
            <Button type="submit" variant="gold">
              <Search size={16} /> Search
            </Button>
          </form>
        </div>
      </Reveal>

      {q ? (
        <>
          <p className="mb-6 text-sm text-muted" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          {results.length > 0 ? (
            <ProductGrid products={results} />
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nothing found"
              description={`We couldn't find anything for “${q}”. Try a different word — or browse the full collection.`}
              actionLabel="Browse the shop"
              actionHref="/shop"
            />
          )}
        </>
      ) : (
        <section aria-label="Popular right now">
          <SectionHeading
            eyebrow="While You Decide"
            title="Popular right now"
            href="/shop?sort=bestselling"
            align="left"
          />
          <ProductGrid products={popular} />
        </section>
      )}
    </div>
  );
}
