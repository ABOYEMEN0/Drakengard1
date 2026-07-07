"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/types";
import { cn, discountPercent, effectivePrice, formatPrice } from "@/lib/utils";
import { useCart, useWishlist } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const add = useCart((s) => s.add);
  const wishlist = useWishlist();
  const toast = useToast((s) => s.push);
  const inWishlist = wishlist.ids.includes(product.id);
  const discount = discountPercent(product);
  const outOfStock = product.stock === 0;

  return (
    <div
      className={cn(
        "card-luxe group relative flex flex-col overflow-hidden hover:shadow-lift",
        className
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-navy-800"
        aria-label={product.name}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount && <Badge variant="sale">−{discount}%</Badge>}
          {product.isNew && <Badge variant="navy">New</Badge>}
          {outOfStock && <Badge variant="outline" className="bg-white/90">Sold out</Badge>}
        </div>
      </Link>

      <button
        type="button"
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={inWishlist}
        onClick={() => {
          wishlist.toggle(product.id);
          toast(inWishlist ? "Removed from wishlist" : "Added to wishlist", "info");
        }}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy shadow-soft backdrop-blur transition-all duration-300 hover:scale-105 hover:text-gold-600"
      >
        <Heart size={16} className={cn(inWishlist && "fill-gold-600 text-gold-600")} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[11px] uppercase tracking-wider2 text-muted">
          {product.category.replace("-", " ")} · {product.weight}
        </p>
        <Link href={`/product/${product.slug}`} className="transition-colors hover:text-gold-700">
          <h3 className="font-display text-lg font-medium leading-snug text-navy">
            {product.name}
          </h3>
        </Link>
        <Rating value={product.rating} count={product.reviewCount} />
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold text-navy">
              {formatPrice(effectivePrice(product))}
            </span>
            {discount && (
              <span className="text-xs text-muted line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            type="button"
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
              add(product);
              toast(`${product.name} added to bag`);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/60 text-navy transition-all duration-300 hover:bg-gold hover:text-navy disabled:opacity-30"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
