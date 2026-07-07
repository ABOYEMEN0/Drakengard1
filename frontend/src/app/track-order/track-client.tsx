"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, MapPin, PackageSearch, Search, XCircle } from "lucide-react";
import { useOrders } from "@/lib/store";
import { paymentLabel } from "@/lib/order-utils";
import { formatDateTime, formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUS_META, Order, OrderStatus } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/ui/reveal";

const TIMELINE_STATUSES: OrderStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const DEMO_RE = /^LR-\d{9}$/;

function buildDemoOrder(orderNumber: string): Order {
  const now = new Date();
  const at = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600_000).toISOString();
  return {
    id: `demo-${orderNumber}`,
    orderNumber,
    invoiceNumber: orderNumber.replace("LR-", "INV-"),
    status: "CONFIRMED",
    items: [
      { productId: "p-003", name: "LEOR Signature Espresso", price: 78, quantity: 2, total: 156 },
      { productId: "p-102", name: "Pistachio Praliné Collection", price: 120, quantity: 1, total: 120 },
    ],
    customer: {
      name: "Demo Customer",
      phone: "0500000000",
      city: "Riyadh",
      district: "Al Olaya",
      address: "King Fahd Road",
    },
    paymentMethod: "COD",
    subtotal: 276,
    shipping: 25,
    discount: 0,
    tax: 0,
    total: 301,
    createdAt: at(30),
    statusHistory: [
      { status: "PENDING", at: at(30), note: "Order placed" },
      { status: "UNDER_REVIEW", at: at(26) },
      { status: "CONFIRMED", at: at(20), note: "Confirmed via WhatsApp" },
    ],
  };
}

function Timeline({ order }: { order: Order }) {
  const cancelled = order.status === "CANCELLED";
  const currentStep = cancelled ? -1 : ORDER_STATUS_META[order.status].step;

  return (
    <ol className="relative">
      {TIMELINE_STATUSES.map((status, i) => {
        const meta = ORDER_STATUS_META[status];
        const done = !cancelled && i < currentStep;
        const current = !cancelled && i === currentStep;
        const historyEntry = order.statusHistory.find((h) => h.status === status);
        const last = i === TIMELINE_STATUSES.length - 1;
        return (
          <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[13px] top-7 h-full w-px",
                  done ? "bg-gold" : "bg-line"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                done && "border-gold bg-gold text-navy",
                current && "border-gold",
                !done && !current && "border-line"
              )}
              aria-hidden
            >
              {done ? (
                <Check size={13} strokeWidth={3} />
              ) : current ? (
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-line" />
              )}
            </span>
            <div className={cn("pt-0.5", !done && !current && !cancelled && "opacity-50")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  current ? "text-gold-700" : done ? "text-navy" : "text-muted"
                )}
              >
                {meta.label}
                {current && (
                  <span className="ml-2 text-xs font-normal text-muted">Current status</span>
                )}
              </p>
              {historyEntry && (
                <p className="mt-0.5 text-xs text-muted">
                  {formatDateTime(historyEntry.at)}
                  {historyEntry.note ? ` — ${historyEntry.note}` : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="mt-2 flex items-center gap-3 rounded-card border border-[#B42318]/30 bg-[#FBE4E2] p-4">
          <XCircle size={18} className="shrink-0 text-[#B42318]" />
          <div>
            <p className="text-sm font-medium text-[#B42318]">Order cancelled</p>
            <p className="text-xs text-[#B42318]/80">
              This order was cancelled and will not be delivered.
            </p>
          </div>
        </li>
      )}
    </ol>
  );
}

export function TrackOrderClient() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("number") ?? "";
  const [mounted, setMounted] = useState(false);
  const orders = useOrders((s) => s.orders);
  const [input, setInput] = useState(prefill);
  const [query, setQuery] = useState(prefill);
  const [searched, setSearched] = useState(Boolean(prefill));

  useEffect(() => setMounted(true), []);

  const normalized = query.trim().toUpperCase();
  const local = mounted ? orders.find((o) => o.orderNumber.toUpperCase() === normalized) : undefined;
  const order = local ?? (normalized && DEMO_RE.test(normalized) ? buildDemoOrder(normalized) : undefined);
  const meta = order ? ORDER_STATUS_META[order.status] : null;

  return (
    <div className="container-page max-w-3xl py-12 sm:py-16">
      <Breadcrumbs items={[{ label: "Track Order" }]} />
      <Reveal>
        <p className="eyebrow mb-2">Order Status</p>
        <h1 className="heading-lg mb-4">Track Your Order</h1>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-muted">
          Enter your order number — you&apos;ll find it in your confirmation message, in the format
          LR-XXXXXXXXX.
        </p>
      </Reveal>

      <form
        className="mb-12 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(input);
          setSearched(true);
        }}
      >
        <label htmlFor="order-number" className="sr-only">
          Order number
        </label>
        <Input
          id="order-number"
          placeholder="LR-202600101"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" variant="gold" disabled={!input.trim()}>
          <Search size={15} />
          Track
        </Button>
      </form>

      {mounted && searched && !order && normalized && (
        <div className="card-luxe flex items-start gap-4 p-6" role="status">
          <PackageSearch size={22} className="mt-0.5 shrink-0 text-gold-600" strokeWidth={1.5} />
          <div>
            <p className="font-medium text-navy">No order found</p>
            <p className="mt-1 text-sm text-muted">
              We couldn&apos;t find an order with number &ldquo;{query.trim()}&rdquo;. Please check
              the number and try again.
            </p>
          </div>
        </div>
      )}

      {mounted && order && meta && (
        <Reveal>
          <div className="card-luxe p-6 sm:p-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
              <div>
                <p className="eyebrow mb-1">Order</p>
                <p className="font-display text-2xl font-medium text-navy">{order.orderNumber}</p>
                <p className="mt-1 text-xs text-muted">Placed {formatDateTime(order.createdAt)}</p>
              </div>
              <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
            </div>

            <Timeline order={order} />

            <div className="mt-10 border-t border-line pt-6">
              <h2 className="mb-4 font-display text-lg text-navy">Order Summary</h2>
              <ul className="divide-y divide-line text-sm">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-4 py-2.5">
                    <span className="text-navy">
                      {item.name}
                      <span className="ml-2 text-xs text-muted">× {item.quantity}</span>
                    </span>
                    <span className="font-medium tabular-nums text-navy">
                      {formatPrice(item.total)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-line pt-4 text-sm">
                <span className="font-medium text-navy">Total</span>
                <span className="font-display text-lg font-semibold tabular-nums text-navy">
                  {formatPrice(order.total)}
                </span>
              </div>
              <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="eyebrow mb-1.5">Payment</p>
                  <p className="text-navy">{paymentLabel(order.paymentMethod)}</p>
                </div>
                <div>
                  <p className="eyebrow mb-1.5">Delivery Address</p>
                  <p className="flex items-start gap-1.5 text-navy">
                    <MapPin size={13} className="mt-1 shrink-0 text-gold-600" />
                    {order.customer.city}, {order.customer.district}, {order.customer.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
