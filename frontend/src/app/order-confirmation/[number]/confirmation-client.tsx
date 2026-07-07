"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, FileText, MapPin, MessageCircle, PackageSearch, ShoppingBag } from "lucide-react";
import { useOrders } from "@/lib/store";
import { paymentLabel, whatsAppUrl } from "@/lib/order-utils";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";

export function ConfirmationClient({ orderNumber }: { orderNumber: string }) {
  const [mounted, setMounted] = useState(false);
  const orders = useOrders((s) => s.orders);
  const order = orders.find((o) => o.orderNumber === orderNumber);
  const opened = useRef(false);
  const [whatsAppOpening, setWhatsAppOpening] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !order || opened.current) return;
    opened.current = true;
    setWhatsAppOpening(true);
    const t = setTimeout(() => window.open(whatsAppUrl(order), "_blank", "noopener"), 1500);
    return () => clearTimeout(t);
  }, [mounted, order]);

  if (!mounted) {
    return (
      <div className="container-page py-16">
        <div className="skeleton mx-auto h-8 w-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={PackageSearch}
          title="Order not found"
          description={`We couldn't find an order ${orderNumber} in this browser.`}
          actionLabel="Back to the boutique"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-14 sm:py-20">
      <Reveal className="text-center">
        <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gold/50 bg-gold/10 shadow-gold">
          <Check size={34} className="text-gold-600" strokeWidth={2} />
        </span>
        <p className="eyebrow mb-3">Order Received</p>
        <h1 className="heading-lg mb-4">Thank you, {order.customer.name.split(" ")[0]}</h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
          Your order has been placed and is awaiting confirmation. We&apos;ve prepared a WhatsApp
          message so you can confirm it with us in one tap.
        </p>
        <div className="mt-6 inline-flex flex-col items-center gap-1 rounded-card border border-line bg-cream px-8 py-4">
          <span className="text-xs uppercase tracking-wider2 text-muted">Order Number</span>
          <span className="font-display text-2xl font-medium text-navy">{order.orderNumber}</span>
          <span className="text-xs text-muted">Invoice {order.invoiceNumber}</span>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 flex flex-col items-center gap-3">
        <a
          href={whatsAppUrl(order)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-13 w-full max-w-md items-center justify-center gap-2 rounded-button bg-[#25D366] px-8 py-3.5 text-base font-medium text-white shadow-soft transition-all duration-300 hover:bg-[#1EBE5B] hover:shadow-lift"
        >
          <MessageCircle size={19} />
          Confirm via WhatsApp
        </a>
        {whatsAppOpening && (
          <p className="text-xs text-muted" role="status">
            WhatsApp opening…
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href={`/invoice/${order.orderNumber}`}>
            <Button variant="outline" size="sm">
              <FileText size={14} />
              View invoice
            </Button>
          </Link>
          <Link href={`/track-order?number=${order.orderNumber}`}>
            <Button variant="outline" size="sm">
              <PackageSearch size={14} />
              Track order
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="ghost" size="sm">
              <ShoppingBag size={14} />
              Continue shopping
            </Button>
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="card-luxe mt-12 p-6 sm:p-8">
        <h2 className="mb-6 font-display text-xl text-navy">Order Summary</h2>
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="text-navy">
                {item.name}
                <span className="ml-2 text-xs text-muted">× {item.quantity}</span>
              </span>
              <span className="font-medium tabular-nums text-navy">{formatPrice(item.total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums text-navy">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
              <dd className="tabular-nums text-success">−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className={order.shipping === 0 ? "font-medium text-success" : "tabular-nums text-navy"}>
              {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-medium text-navy">Total</dt>
            <dd className="font-display text-lg font-semibold tabular-nums text-navy">
              {formatPrice(order.total)}
            </dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-2">Payment</p>
            <p className="text-navy">{paymentLabel(order.paymentMethod)}</p>
            <p className="mt-1 text-xs text-muted">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Delivery Address</p>
            <p className="flex items-start gap-2 leading-relaxed text-navy">
              <MapPin size={14} className="mt-1 shrink-0 text-gold-600" />
              <span>
                {order.customer.name}
                <br />
                {order.customer.city}, {order.customer.district}
                <br />
                {order.customer.address}
                <br />
                <span className="text-muted">{order.customer.phone}</span>
              </span>
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
