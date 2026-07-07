"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Package } from "lucide-react";
import { useOrders } from "@/lib/store";
import { ORDER_STATUS_META } from "@/lib/types";
import { paymentLabel } from "@/lib/order-utils";
import { formatDate, formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export function OrdersClient() {
  const [mounted, setMounted] = useState(false);
  const orders = useOrders((s) => s.orders);
  useEffect(() => setMounted(true), []);

  const data = mounted ? orders : [];

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow mb-2">Order history</p>
        <h1 className="heading-md">Your orders</h1>
      </header>

      {mounted && data.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place an order, it will appear here so you can track it every step of the way."
          actionLabel="Browse the shop"
          actionHref="/shop"
        />
      ) : (
        <ul className="space-y-4">
          {data.map((o) => {
            const meta = ORDER_STATUS_META[o.status];
            const itemCount = o.items.reduce((n, i) => n + i.quantity, 0);
            return (
              <li key={o.id}>
                <Link
                  href={`/account/orders/${o.orderNumber}`}
                  className="card-luxe group flex flex-col gap-4 p-5 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-3">
                      <span className="font-medium text-navy">{o.orderNumber}</span>
                      <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
                    </div>
                    <p className="text-xs text-muted">
                      {formatDate(o.createdAt)} · {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                      {paymentLabel(o.paymentMethod)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-lg font-medium text-navy">
                      {formatPrice(o.total)}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600"
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
