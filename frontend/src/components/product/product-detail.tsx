"use client";

import Image from "next/image";
import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { Copy, Heart, Share2, ShoppingBag, Truck } from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import { FREE_SHIPPING_THRESHOLD, Product, Review } from "@/lib/types";
import { cn, discountPercent, effectivePrice, formatDate, formatPrice } from "@/lib/utils";
import { useCart, useRecentlyViewed, useWishlist } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { useToast } from "@/components/ui/toast";
import { ProductCard, ProductGrid } from "./product-card";

function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  const discount = discountPercent(product);

  return (
    <div>
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-card bg-navy-800 shadow-soft"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <Image
          key={active}
          src={product.images[active]}
          alt={`${product.name} — image ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 ease-out"
          style={{ transformOrigin: origin, transform: zoom ? "scale(1.8)" : "scale(1)" }}
        />
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1.5">
          {discount && <Badge variant="sale">−{discount}%</Badge>}
          {product.isNew && <Badge variant="navy">New</Badge>}
          {product.stock === 0 && (
            <Badge variant="outline" className="bg-white/90">
              Sold out
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3" role="tablist" aria-label="Product images">
        {product.images.map((src, i) => (
          <button
            key={src}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={`View image ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-button border transition-all duration-300",
              active === i ? "border-gold shadow-gold" : "border-line opacity-70 hover:opacity-100"
            )}
          >
            <Image src={src} alt="" fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Availability({ product }: { product: Product }) {
  if (product.stock === 0)
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-[#B42318]">
        <span className="h-2 w-2 rounded-full bg-[#B42318]" aria-hidden /> Out of stock
      </p>
    );
  if (product.stock <= product.lowStockThreshold)
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-[#8A6D1F]">
        <span className="h-2 w-2 rounded-full bg-[#D8B46A]" aria-hidden /> Low stock — only{" "}
        {product.stock} left
      </p>
    );
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-success">
      <span className="h-2 w-2 rounded-full bg-success" aria-hidden /> In stock
    </p>
  );
}

function ReviewsSection({ product, reviews }: { product: Product; reviews: Review[] }) {
  const toast = useToast((s) => s.push);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    toast("Thank you — your review has been submitted for approval");
    setName("");
    setTitle("");
    setBody("");
    setRating("5");
  }

  return (
    <section className="border-t border-line py-16 sm:py-20" aria-label="Customer reviews">
      <div className="container-page">
        <SectionHeading eyebrow="Word of Mouth" title="Customer reviews" align="left" />
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <div>
            <p className="font-display text-6xl font-medium text-navy">{product.rating}</p>
            <Rating value={product.rating} count={product.reviewCount} className="mt-2" />
            <p className="mt-2 text-xs text-muted">
              Based on {product.reviewCount} verified purchases
            </p>
          </div>
          <div className="space-y-6">
            {reviews.length === 0 && (
              <p className="text-sm text-muted">
                No written reviews yet — be the first to share your thoughts.
              </p>
            )}
            {reviews.map((r) => (
              <article key={r.id} className="card-luxe p-6">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Rating value={r.rating} />
                  <span className="text-xs text-muted">{formatDate(r.date)}</span>
                </div>
                <h3 className="mb-1 font-display text-lg font-medium text-navy">{r.title}</h3>
                <p className="mb-3 text-sm leading-relaxed text-ink">{r.body}</p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="font-medium text-navy">{r.author}</span>
                  {r.verified && <Badge variant="success">Verified</Badge>}
                </div>
              </article>
            ))}

            <form onSubmit={submit} className="card-luxe space-y-4 p-6">
              <h3 className="font-display text-xl font-medium text-navy">Write a review</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" htmlFor="review-name" required>
                  <Input
                    id="review-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </Field>
                <Field label="Rating" htmlFor="review-rating" required>
                  <Select
                    id="review-rating"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} star{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Title" htmlFor="review-title" required>
                <Input
                  id="review-title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sum it up in a line"
                />
              </Field>
              <Field label="Review" htmlFor="review-body" required>
                <Textarea
                  id="review-body"
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What did you think?"
                />
              </Field>
              <Button type="submit" variant="gold">
                Submit review
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecentlyViewed({ currentId }: { currentId: string }) {
  const ids = useRecentlyViewed((s) => s.ids);
  const push = useRecentlyViewed((s) => s.push);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    push(currentId);
  }, [currentId, push]);

  const products = useMemo(
    () =>
      ids
        .filter((id) => id !== currentId)
        .map((id) => PRODUCTS.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p))
        .slice(0, 4),
    [ids, currentId]
  );

  if (!mounted || products.length === 0) return null;

  return (
    <section className="container-page py-16 sm:py-20" aria-label="Recently viewed">
      <SectionHeading eyebrow="Your Trail" title="Recently viewed" align="left" />
      <ProductGrid products={products} />
    </section>
  );
}

export function ProductDetail({
  product,
  reviews,
  related,
}: {
  product: Product;
  reviews: Review[];
  related: Product[];
}) {
  const add = useCart((s) => s.add);
  const wishlist = useWishlist();
  const toast = useToast((s) => s.push);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const inWishlist = mounted && wishlist.ids.includes(product.id);
  const outOfStock = product.stock === 0;
  const discount = discountPercent(product);
  const shareUrl = `https://leor.sa/product/${product.slug}`;
  const shareText = `${product.name} — ${product.shortDescription}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("Link copied to clipboard", "info");
    } catch {
      toast("Couldn't copy the link", "info");
    }
  }

  const specs: [string, string][] = [
    ...Object.entries(product.attributes),
    ["Weight", product.weight],
    ...(product.origin ? ([["Origin", product.origin]] as [string, string][]) : []),
    ["SKU", product.sku],
  ];

  return (
    <>
      <div className="container-page pt-10">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            {
              label: product.category.replace("-", " "),
              href: `/shop?category=${product.category}`,
            },
            { label: product.name },
          ]}
        />
      </div>

      <div className="container-page grid gap-10 pb-16 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Gallery product={product} />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-col gap-5">
            <div>
              <p className="eyebrow mb-2">{product.category.replace("-", " ")}</p>
              <h1 className="font-display text-3xl font-medium leading-tight text-navy sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-1 font-arabic text-lg text-muted" lang="ar" dir="rtl">
                {product.nameAr}
              </p>
            </div>

            <Rating value={product.rating} count={product.reviewCount} />

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold text-navy">
                {formatPrice(effectivePrice(product))}
              </span>
              {discount && (
                <>
                  <span className="text-lg text-muted line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="sale">−{discount}%</Badge>
                </>
              )}
            </div>

            <p className="text-sm leading-relaxed text-ink sm:text-base">
              {product.shortDescription}
            </p>

            <Availability product={product} />

            <div className="flex flex-wrap items-center gap-3">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={Math.max(1, product.stock)}
              />
              <Button
                variant="gold"
                size="lg"
                disabled={outOfStock}
                onClick={() => {
                  add(product, quantity);
                  toast(`${product.name} added to bag`);
                }}
                className="flex-1 sm:flex-none"
              >
                <ShoppingBag size={17} />
                {outOfStock ? "Out of stock" : "Add to bag"}
              </Button>
              <button
                type="button"
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={inWishlist}
                onClick={() => {
                  wishlist.toggle(product.id);
                  toast(inWishlist ? "Removed from wishlist" : "Added to wishlist", "info");
                }}
                className="flex h-13 w-13 items-center justify-center rounded-button border border-line bg-white text-navy transition-all duration-300 hover:border-gold hover:text-gold-600"
              >
                <Heart size={19} className={cn(inWishlist && "fill-gold-600 text-gold-600")} />
              </button>
            </div>

            <p className="flex items-center gap-2 rounded-button bg-gold/10 px-4 py-3 text-xs text-navy sm:text-sm">
              <Truck size={16} className="shrink-0 text-gold-600" aria-hidden />
              Complimentary delivery on orders over {FREE_SHIPPING_THRESHOLD} SAR
            </p>

            {/* Share */}
            <div className="flex items-center gap-3 border-t border-line pt-5">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider2 text-muted">
                <Share2 size={13} aria-hidden /> Share
              </span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-navy transition-colors hover:text-gold-600"
              >
                WhatsApp
              </a>
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-navy transition-colors hover:text-gold-600"
              >
                X
              </a>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1 text-sm text-navy transition-colors hover:text-gold-600"
              >
                <Copy size={13} aria-hidden /> Copy link
              </button>
            </div>

            {/* Description */}
            <div className="border-t border-line pt-5">
              <h2 className="mb-2 font-display text-xl font-medium text-navy">The story</h2>
              <p className="text-sm leading-relaxed text-ink">{product.description}</p>
            </div>

            {/* Specifications */}
            <div className="border-t border-line pt-5">
              <h2 className="mb-3 font-display text-xl font-medium text-navy">Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  {specs.map(([key, value]) => (
                    <tr key={key} className="border-b border-line/60 last:border-0">
                      <th
                        scope="row"
                        className="w-1/3 py-2.5 pr-4 text-left font-medium text-muted"
                      >
                        {key}
                      </th>
                      <td className="py-2.5 text-navy">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>

      <ReviewsSection product={product} reviews={reviews} />

      {related.length > 0 && (
        <section className="bg-cream py-16 sm:py-20" aria-label="Related products">
          <div className="container-page">
            <SectionHeading eyebrow="Pairs Well With" title="You may also like" align="left" />
            <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} className="h-full" />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <RecentlyViewed currentId={product.id} />
    </>
  );
}
