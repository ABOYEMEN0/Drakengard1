"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileDown, FileText, Search, Send } from "lucide-react";
import { ADMIN_ORDERS, downloadCsv } from "@/lib/admin-data";
import { useOrders } from "@/lib/store";
import { Order } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

type PayStatus = "Paid" | "Cancelled" | "Awaiting transfer" | "Due on delivery";

const PAY_META: Record<PayStatus, { color: string; bg: string }> = {
  Paid: { color: "#5E7B45", bg: "#E7EFDE" },
  Cancelled: { color: "#B42318", bg: "#FBE4E2" },
  "Awaiting transfer": { color: "#0F5FA8", bg: "#DFEDFA" },
  "Due on delivery": { color: "#8A6D1F", bg: "#F7EFD8" },
};

function payStatus(o: Order): PayStatus {
  if (o.status === "DELIVERED") return "Paid";
  if (o.status === "CANCELLED") return "Cancelled";
  if (o.paymentMethod === "BANK_TRANSFER") return "Awaiting transfer";
  return "Due on delivery";
}

export default function AdminInvoicesPage() {
  const [mounted, setMounted] = useState(false);
  const localOrders = useOrders((s) => s.orders);
  const push = useToast((s) => s.push);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PayStatus | "ALL">("ALL");

  useEffect(() => setMounted(true), []);

  const invoices = useMemo(() => {
    const local = mounted ? localOrders : [];
    const seen = new Set(local.map((o) => o.orderNumber));
    const all = [...local, ...ADMIN_ORDERS.filter((o) => !seen.has(o.orderNumber))];
    return all
      .map((o) => ({ order: o, status: payStatus(o) }))
      .sort((a, b) => +new Date(b.order.createdAt) - +new Date(a.order.createdAt));
  }, [mounted, localOrders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter(({ order, status }) => {
      if (statusFilter !== "ALL" && status !== statusFilter) return false;
      if (!q) return true;
      return (
        order.invoiceNumber.toLowerCase().includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customer.name.toLowerCase().includes(q)
      );
    });
  }, [invoices, query, statusFilter]);

  function exportCsv() {
    downloadCsv(
      "leor-invoices.csv",
      ["Invoice", "Order", "Date", "Customer", "Total (SAR)", "Payment status"],
      filtered.map(({ order, status }) => [
        order.invoiceNumber,
        order.orderNumber,
        formatDate(order.createdAt),
        order.customer.name,
        order.total,
        status,
      ])
    );
    push(`Exported ${filtered.length} invoices to CSV`);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Billing</p>
          <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">Invoices</h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} invoices shown</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download size={15} /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="card-luxe flex flex-col gap-3 p-4 sm:flex-row sm:p-5">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by invoice, order or customer…"
            aria-label="Search invoices"
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PayStatus | "ALL")}
          aria-label="Filter by payment status"
          className="sm:w-56"
        >
          <option value="ALL">All payment statuses</option>
          {(Object.keys(PAY_META) as PayStatus[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-luxe">
          <EmptyState icon={FileText} title="No invoices found" description="Try a different search or payment status filter." />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card-luxe hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider2 text-muted">
                    <th className="px-6 py-3 font-medium">Invoice</th>
                    <th className="px-6 py-3 font-medium">Order</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Total</th>
                    <th className="px-6 py-3 font-medium">Payment</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map(({ order, status }) => (
                    <tr key={order.invoiceNumber} className="transition-colors hover:bg-ivory/60">
                      <td className="px-6 py-3.5 font-medium text-navy">{order.invoiceNumber}</td>
                      <td className="px-6 py-3.5">
                        <Link href={`/admin/orders/${order.orderNumber}`} className="text-navy hover:text-gold-600">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-muted">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-3.5 text-ink">{order.customer.name}</td>
                      <td className="px-6 py-3.5 font-medium text-navy">{formatPrice(order.total)}</td>
                      <td className="px-6 py-3.5">
                        <StatusBadge color={PAY_META[status].color} bg={PAY_META[status].bg} label={status} />
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/invoice/${order.orderNumber}`}
                            aria-label={`View invoice ${order.invoiceNumber}`}
                            title="View / Print"
                            className="rounded-button p-2 text-navy hover:bg-navy/5"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/invoice/${order.orderNumber}`}
                            aria-label={`Download PDF of ${order.invoiceNumber}`}
                            title="Download PDF"
                            className="rounded-button p-2 text-navy hover:bg-navy/5"
                          >
                            <FileDown size={16} />
                          </Link>
                          <button
                            onClick={() => push(`Invoice ${order.invoiceNumber} re-sent to ${order.customer.name}`)}
                            aria-label={`Re-send ${order.invoiceNumber}`}
                            title="Re-send"
                            className="rounded-button p-2 text-gold-600 hover:bg-gold/10"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map(({ order, status }) => (
              <li key={order.invoiceNumber} className="card-luxe p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy">{order.invoiceNumber}</p>
                    <Link href={`/admin/orders/${order.orderNumber}`} className="text-xs text-muted hover:text-gold-600">
                      {order.orderNumber} · {formatDate(order.createdAt)}
                    </Link>
                  </div>
                  <StatusBadge color={PAY_META[status].color} bg={PAY_META[status].bg} label={status} />
                </div>
                <p className="text-sm text-ink">{order.customer.name}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-medium text-navy">{formatPrice(order.total)}</p>
                  <div className="flex items-center gap-1">
                    <Link href={`/invoice/${order.orderNumber}`} aria-label="View invoice" className="rounded-button p-2 text-navy hover:bg-navy/5">
                      <Eye size={16} />
                    </Link>
                    <Link href={`/invoice/${order.orderNumber}`} aria-label="Download PDF" className="rounded-button p-2 text-navy hover:bg-navy/5">
                      <FileDown size={16} />
                    </Link>
                    <button
                      onClick={() => push(`Invoice ${order.invoiceNumber} re-sent to ${order.customer.name}`)}
                      aria-label="Re-send invoice"
                      className="rounded-button p-2 text-gold-600 hover:bg-gold/10"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
