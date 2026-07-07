"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Check,
  FileText,
  MapPin,
  MessageCircle,
  PackageSearch,
  RotateCcw,
  Wallet,
  XCircle,
} from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import { useCart, useOrders } from "@/lib/store";
import { ORDER_STATUS_META, OrderStatus } from "@/lib/types";
import { paymentLabel, whatsAppUrl } from "@/lib/order-utils";
import { cn, formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

const TIMELINE: OrderStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function OrderDetailClient({ orderNumber }: { orderNumber: string }) {
  const [mounted, setMounted] = useState(false);
  const orders = useOrders((s) => s.orders);
  const addToCart = useCart((s) => s.add);
  const toast = useToast((s) => s.push);
  const router = useRouter();
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="skeleton h-96 w-full" aria-hidden />;
  }

  const order = orders.find((o) => o.orderNumber === orderNumber);

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Order not found"
        description={`We couldn't find order ${orderNumber} in this browser's history.`}
        actionLabel="Back to orders"
        actionHref="/account/orders"
      />
    );
  }

  const meta = ORDER_STATUS_META[order.status];
  const cancelled = order.status === "CANCELLED";
  const currentStep = cancelled ? -1 : meta.step;

  const repeatOrder = () => {
    let added = 0;
    for (const item of order.items) {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (product) {
        addToCart(product, item.quantity);
        added++;
      }
    }
    toast(added > 0 ? "Order added to bag" : "These products are no longer available", added > 0 ? "success" : "info");
    if (added > 0) router.push("/cart");
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Order detail</p>
          <h1 className="heading-md">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
      </header>

      {/* Timeline */}
      <section aria-label="Order progress" className="card-luxe p-6">
        {cancelled ? (
          <div className="flex items-center gap-3 rounded-button bg-[#FBE4E2] px-4 py-3 text-sm font-medium text-[#B42318]">
            <XCircle size={18} />
            This order was cancelled
            {order.statusHistory.find((h) => h.status === "CANCELLED") && (
              <span className="font-normal">
                on{" "}
                {formatDateTime(
                  order.statusHistory.find((h) => h.status === "CANCELLED")!.at
                )}
              </span>
            )}
          </div>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-7 sm:gap-0">
            {TIMELINE.map((status, i) => {
              const stepMeta = ORDER_STATUS_META[status];
              const done = i < currentStep;
              const current = i === currentStep;
              return (
                <li key={status} className="relative flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
                  {i < TIMELINE.length - 1 && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-[13px] top-7 hidden h-0.5 sm:left-[calc(50%+16px)] sm:top-[13px] sm:block sm:w-[calc(100%-32px)]",
                        done ? "bg-gold" : "bg-line"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                      done && "border-gold bg-gold text-navy",
                      current && "border-gold bg-navy text-gold ring-2 ring-gold/30",
                      !done && !current && "border-line bg-white text-muted"
                    )}
                  >
                    {done ? <Check size={13} /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-xs leading-tight",
                      current ? "font-semibold text-navy" : done ? "text-navy" : "text-muted"
                    )}
                  >
                    {stepMeta.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <section aria-label="Items" className="card-luxe p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-medium text-navy">Items</h2>
          <ul className="divide-y divide-line/70">
            {order.items.map((item) => {
              const product = PRODUCTS.find((p) => p.id === item.productId);
              return (
                <li key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-card bg-navy-800">
                    {product ? (
                      <Image
                        src={product.images[0]}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ivory/40">
                        <PackageSearch size={20} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {product ? (
                      <Link
                        href={`/product/${product.slug}`}
                        className="truncate font-medium text-navy hover:text-gold-700"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="truncate font-medium text-navy">{item.name}</p>
                    )}
                    <p className="text-xs text-muted">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-navy">{formatPrice(item.total)}</span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                <dd>−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <dt>Shipping</dt>
              <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 font-display text-lg font-medium text-navy">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        {/* Sidebar */}
        <div className="space-y-6">
          <section aria-label="Delivery address" className="card-luxe p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-medium text-navy">
              <MapPin size={16} className="text-gold-600" /> Delivery
            </h2>
            <address className="text-sm not-italic leading-relaxed text-muted">
              <span className="font-medium text-navy">{order.customer.name}</span>
              <br />
              {order.customer.phone}
              <br />
              {order.customer.city}, {order.customer.district}
              <br />
              {order.customer.address}
              {order.customer.notes && (
                <>
                  <br />
                  <span className="text-xs italic">“{order.customer.notes}”</span>
                </>
              )}
            </address>
          </section>

          <section aria-label="Payment" className="card-luxe p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-medium text-navy">
              <Wallet size={16} className="text-gold-600" /> Payment
            </h2>
            <p className="text-sm text-muted">{paymentLabel(order.paymentMethod)}</p>
            <p className="mt-1 text-xs text-muted">Invoice {order.invoiceNumber}</p>
          </section>

          <div className="flex flex-col gap-3">
            <Link href={`/invoice/${order.orderNumber}`} className="contents">
              <Button variant="outline" className="w-full">
                <FileText size={16} /> View invoice
              </Button>
            </Link>
            <Button variant="gold" className="w-full" onClick={repeatOrder}>
              <RotateCcw size={16} /> Repeat order
            </Button>
            <a href={whatsAppUrl(order)} target="_blank" rel="noopener noreferrer" className="contents">
              <Button variant="primary" className="w-full">
                <MessageCircle size={16} /> Confirm via WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
