"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag, Tag, X } from "lucide-react";
import { useCart } from "@/lib/store";
import { validateCoupon } from "@/lib/data";
import { computeTotals } from "@/lib/order-utils";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Reveal } from "@/components/ui/reveal";
import { useToast } from "@/components/ui/toast";

export function CartClient() {
  const [mounted, setMounted] = useState(false);
  const { items, coupon, updateQuantity, remove, applyCoupon, removeCoupon } = useCart();
  const toast = useToast((s) => s.push);
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="container-page py-16">
        <div className="skeleton h-8 w-48" />
      </div>
    );
  }

  const totals = computeTotals(items, coupon);
  const remaining = FREE_SHIPPING_THRESHOLD - (totals.subtotal - totals.discount);

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <Breadcrumbs items={[{ label: "Cart" }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Nothing here yet — discover our coffee, chocolate and curated gifts."
          actionLabel="Explore the boutique"
          actionHref="/shop"
        />
      </div>
    );
  }

  const handleApply = () => {
    const result = validateCoupon(code, totals.subtotal);
    if (result.ok) {
      applyCoupon(result.coupon);
      setCouponError(null);
      setCode("");
      toast(`Coupon ${result.coupon.code} applied`);
    } else {
      setCouponError(result.error);
    }
  };

  return (
    <div className="container-page py-12 sm:py-16">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <Reveal>
        <p className="eyebrow mb-2">Your Selection</p>
        <h1 className="heading-lg mb-10">Shopping Cart</h1>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Line items */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-5 py-6">
                <Link
                  href={`/shop/${item.slug}`}
                  className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-card border border-line bg-cream"
                >
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-display text-lg text-navy transition-colors hover:text-gold-600"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">{item.weight}</p>
                    <p className="mt-1 text-sm text-muted">{formatPrice(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <QuantitySelector
                      size="sm"
                      value={item.quantity}
                      max={item.maxStock}
                      onChange={(q) => updateQuantity(item.productId, q)}
                    />
                    <span className="min-w-20 text-right text-sm font-semibold tabular-nums text-navy">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      aria-label={`Remove ${item.name} from cart`}
                      className="text-muted transition-colors hover:text-[#B42318]"
                      onClick={() => {
                        remove(item.productId);
                        toast(`${item.name} removed`, "info");
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
          >
            <ArrowLeft size={15} />
            Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div>
          <Reveal className="card-luxe sticky top-24 p-6 sm:p-8">
            <h2 className="mb-6 font-display text-xl text-navy">Order Summary</h2>

            {/* Coupon */}
            {coupon ? (
              <div className="mb-6 flex items-center justify-between rounded-button border border-gold/40 bg-gold/10 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-gold-700">
                  <Tag size={14} />
                  {coupon.code}
                </span>
                <button
                  className="text-xs font-medium text-muted underline-offset-2 hover:text-navy hover:underline"
                  onClick={() => {
                    removeCoupon();
                    setCouponError(null);
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <label htmlFor="coupon" className="label-luxe">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    value={code}
                    placeholder="e.g. WELCOME10"
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCouponError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApply();
                    }}
                    aria-invalid={couponError ? true : undefined}
                    aria-describedby={couponError ? "coupon-error" : undefined}
                  />
                  <Button variant="subtle" onClick={handleApply} disabled={!code.trim()}>
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <p id="coupon-error" role="alert" className="mt-2 text-xs text-[#B42318]">
                    {couponError}
                  </p>
                )}
              </div>
            )}

            <dl className="space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-navy">{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount</dt>
                  <dd className="tabular-nums text-success">−{formatPrice(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className={totals.shipping === 0 ? "font-medium text-success" : "tabular-nums text-navy"}>
                  {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
                </dd>
              </div>
              {remaining > 0 && (
                <p className="rounded-button bg-gold/10 px-3 py-2 text-xs text-gold-700">
                  Add {formatPrice(remaining)} for free delivery
                </p>
              )}
              <div className="flex justify-between border-t border-line pt-4 text-base">
                <dt className="font-medium text-navy">Total</dt>
                <dd className="font-display text-lg font-semibold tabular-nums text-navy">
                  {formatPrice(totals.total)}
                </dd>
              </div>
            </dl>

            <Link href="/checkout" className="mt-6 block">
              <Button variant="gold" size="lg" className="w-full">
                Proceed to Checkout
                <ArrowRight size={16} />
              </Button>
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
