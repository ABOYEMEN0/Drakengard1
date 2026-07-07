"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, FileX, Printer } from "lucide-react";
import { useOrders } from "@/lib/store";
import { paymentLabel } from "@/lib/order-utils";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_META, STORE_NAME } from "@/lib/types";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function InvoiceClient({ orderNumber }: { orderNumber: string }) {
  const [mounted, setMounted] = useState(false);
  const orders = useOrders((s) => s.orders);
  const order = orders.find((o) => o.orderNumber === orderNumber);

  useEffect(() => setMounted(true), []);

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
          icon={FileX}
          title="Invoice not found"
          description={`We couldn't find an invoice for order ${orderNumber} in this browser.`}
          actionLabel="Back to the boutique"
          actionHref="/shop"
        />
      </div>
    );
  }

  const meta = ORDER_STATUS_META[order.status];

  return (
    <div className="container-page max-w-3xl py-12 sm:py-16 print:max-w-none print:p-0">
      <div className="no-print mb-8 flex items-center justify-between">
        <Link
          href={`/order-confirmation/${order.orderNumber}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
        >
          <ArrowLeft size={15} />
          Back to order
        </Link>
        <Button variant="gold" onClick={() => window.print()}>
          <Printer size={15} />
          Download PDF / Print
        </Button>
      </div>

      <article className="rounded-card border border-line bg-white p-8 shadow-soft sm:p-12 print:border-0 print:shadow-none">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-8">
          <div>
            <Image src="/logo.svg" alt={STORE_NAME} width={110} height={36} className="mb-3" />
            <p className="text-xs leading-relaxed text-muted">
              Premium Coffee, Chocolate &amp; Gourmet Boutique
              <br />
              Riyadh, Kingdom of Saudi Arabia
            </p>
          </div>
          <div className="text-right">
            <p className="eyebrow mb-1">Invoice</p>
            <p className="font-display text-2xl font-medium text-navy">{order.invoiceNumber}</p>
            <p className="mt-1 text-xs text-muted">Order {order.orderNumber}</p>
            <p className="text-xs text-muted">Issued {formatDate(order.createdAt)}</p>
            <div className="mt-3">
              <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
            </div>
          </div>
        </header>

        {/* Customer */}
        <section className="grid gap-6 border-b border-line py-8 text-sm sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-2">Billed To</p>
            <p className="font-medium text-navy">{order.customer.name}</p>
            <p className="mt-1 leading-relaxed text-muted">
              {order.customer.city}, {order.customer.district}
              <br />
              {order.customer.address}
              <br />
              {order.customer.phone}
              {order.customer.email ? (
                <>
                  <br />
                  {order.customer.email}
                </>
              ) : null}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="eyebrow mb-2">Payment Method</p>
            <p className="text-navy">{paymentLabel(order.paymentMethod)}</p>
          </div>
        </section>

        {/* Items */}
        <section className="py-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider2 text-muted">
                  <th scope="col" className="pb-3 font-medium">
                    Item
                  </th>
                  <th scope="col" className="pb-3 text-center font-medium">
                    Qty
                  </th>
                  <th scope="col" className="pb-3 text-right font-medium">
                    Unit
                  </th>
                  <th scope="col" className="pb-3 text-right font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((item) => (
                  <tr key={item.productId}>
                    <td className="py-3.5 text-navy">{item.name}</td>
                    <td className="py-3.5 text-center tabular-nums text-muted">{item.quantity}</td>
                    <td className="py-3.5 text-right tabular-nums text-muted">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-3.5 text-right font-medium tabular-nums text-navy">
                      {formatPrice(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="ml-auto mt-6 max-w-xs space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums text-navy">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="tabular-nums text-navy">
                {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
              </dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">
                  Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                </dt>
                <dd className="tabular-nums text-success">−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Tax</dt>
              <dd className="tabular-nums text-navy">{formatPrice(order.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-gold/50 pt-3 text-base">
              <dt className="font-medium text-navy">Total Due</dt>
              <dd className="font-display text-lg font-semibold tabular-nums text-navy">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </section>

        <footer className="border-t border-line pt-6 text-center text-xs leading-relaxed text-muted">
          Thank you for choosing {STORE_NAME}. This invoice was generated electronically and is
          valid without a signature. For any enquiries, contact us via WhatsApp quoting your order
          number.
        </footer>
      </article>
    </div>
  );
}
