"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import { Product } from "@/lib/types";
import { useCart, useWishlist } from "@/lib/store";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Reveal } from "@/components/ui/reveal";
import { ProductGrid } from "@/components/product/product-card";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.push);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const products = useMemo(
    () =>
      ids
        .map((id) => PRODUCTS.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [ids]
  );

  function moveAllToBag() {
    const inStock = products.filter((p) => p.stock > 0);
    inStock.forEach((p) => add(p));
    toast(
      inStock.length > 0
        ? `${inStock.length} ${inStock.length === 1 ? "item" : "items"} moved to your bag`
        : "Nothing in stock to move",
      inStock.length > 0 ? "success" : "info"
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />

      <Reveal>
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">Saved For Later</p>
            <h1 className="heading-lg">Your wishlist</h1>
            {mounted && products.length > 0 && (
              <p className="mt-3 text-sm text-muted">
                {products.length} {products.length === 1 ? "item" : "items"} saved
              </p>
            )}
          </div>
          {mounted && products.length > 0 && (
            <Button variant="gold" onClick={moveAllToBag}>
              <ShoppingBag size={16} /> Move all to bag
            </Button>
          )}
        </div>
      </Reveal>

      {mounted &&
        (products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart on any product to keep it here — a quiet shortlist of things you love."
            actionLabel="Discover the collection"
            actionHref="/shop"
          />
        ))}
    </div>
  );
}
