"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { useOrders } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export function InvoicesClient() {
  const [mounted, setMounted] = useState(false);
  const orders = useOrders((s) => s.orders);
  useEffect(() => setMounted(true), []);

  const data = mounted ? orders : [];

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow mb-2">Billing</p>
        <h1 className="heading-md">Invoices</h1>
      </header>

      {mounted && data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Invoices are generated automatically for every order you place."
          actionLabel="Browse the shop"
          actionHref="/shop"
        />
      ) : (
        <div className="card-luxe overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider2 text-muted">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id} className="border-b border-line/60 last:border-0">
                  <td className="px-5 py-4 font-medium text-navy">{o.invoiceNumber}</td>
                  <td className="px-5 py-4 text-muted">{o.orderNumber}</td>
                  <td className="px-5 py-4 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-4 text-navy">{formatPrice(o.total)}</td>
                  <td className="px-5 py-4">
                    <Badge variant={o.paymentMethod === "COD" ? "gold" : "outline"}>
                      {o.paymentMethod === "COD" ? "Due on delivery" : "Awaiting transfer"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/invoice/${o.orderNumber}`}
                        className="text-sm font-medium text-gold-600 hover:text-gold-700"
                      >
                        View
                      </Link>
                      <Link
                        href={`/invoice/${o.orderNumber}`}
                        aria-label={`Download invoice ${o.invoiceNumber}`}
                        className="text-muted transition-colors hover:text-gold-600"
                      >
                        <Download size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
