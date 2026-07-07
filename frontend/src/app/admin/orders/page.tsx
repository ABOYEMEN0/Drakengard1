"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Download,
  Eye,
  MessageCircle,
  Phone,
  Printer,
  Search,
  ShoppingBag,
} from "lucide-react";
import { ADMIN_ORDERS, downloadCsv } from "@/lib/admin-data";
import { useOrders } from "@/lib/store";
import { Order, OrderStatus, ORDER_STATUS_META } from "@/lib/types";
import { paymentLabel } from "@/lib/order-utils";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

const STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];

function waLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("966") ? digits : `966${digits.replace(/^0+/, "")}`;
  return `https://wa.me/${full}`;
}

export default function AdminOrdersPage() {
  const [mounted, setMounted] = useState(false);
  const localOrders = useOrders((s) => s.orders);
  const push = useToast((s) => s.push);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "COD" | "BANK_TRANSFER">("ALL");
  const [newestFirst, setNewestFirst] = useState(true);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, OrderStatus>>({});

  useEffect(() => setMounted(true), []);

  const allOrders = useMemo<Order[]>(() => {
    const local = mounted ? localOrders : [];
    const seen = new Set(local.map((o) => o.orderNumber));
    return [...local, ...ADMIN_ORDERS.filter((o) => !seen.has(o.orderNumber))];
  }, [mounted, localOrders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = allOrders
      .map((o) => (statusOverrides[o.orderNumber] ? { ...o, status: statusOverrides[o.orderNumber] } : o))
      .filter((o) => {
        if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
        if (paymentFilter !== "ALL" && o.paymentMethod !== paymentFilter) return false;
        if (!q) return true;
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
        );
      });
    rows.sort((a, b) =>
      newestFirst
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt)
    );
    return rows;
  }, [allOrders, query, statusFilter, paymentFilter, newestFirst, statusOverrides]);

  function changeStatus(orderNumber: string, status: OrderStatus) {
    setStatusOverrides((s) => ({ ...s, [orderNumber]: status }));
    push(`Order ${orderNumber} marked ${ORDER_STATUS_META[status].label}`);
  }

  function exportCsv() {
    downloadCsv(
      "leor-orders.csv",
      ["Order", "Date", "Customer", "Phone", "City", "Items", "Payment", "Status", "Total (SAR)"],
      filtered.map((o) => [
        o.orderNumber,
        formatDate(o.createdAt),
        o.customer.name,
        o.customer.phone,
        o.customer.city,
        o.items.reduce((n, i) => n + i.quantity, 0),
        paymentLabel(o.paymentMethod),
        ORDER_STATUS_META[o.status].label,
        o.total,
      ])
    );
    push(`Exported ${filtered.length} orders to CSV`);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Sales</p>
          <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">Orders</h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} orders shown</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download size={15} /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="card-luxe space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order number, name or phone…"
              aria-label="Search orders"
              className="pl-10"
            />
          </div>
          <Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
            aria-label="Filter by payment method"
            className="sm:w-52"
          >
            <option value="ALL">All payments</option>
            <option value="COD">Cash on Delivery</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </Select>
          <Button variant="subtle" size="md" onClick={() => setNewestFirst((v) => !v)} aria-label="Toggle sort order">
            {newestFirst ? <ArrowDownWideNarrow size={16} /> : <ArrowUpWideNarrow size={16} />}
            {newestFirst ? "Newest first" : "Oldest first"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          <button
            onClick={() => setStatusFilter("ALL")}
            aria-pressed={statusFilter === "ALL"}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              statusFilter === "ALL"
                ? "border-navy bg-navy text-ivory"
                : "border-line text-muted hover:border-navy/40 hover:text-navy"
            )}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                statusFilter === s
                  ? "border-navy bg-navy text-ivory"
                  : "border-line text-muted hover:border-navy/40 hover:text-navy"
              )}
            >
              {ORDER_STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-luxe">
          <EmptyState
            icon={ShoppingBag}
            title="No orders match"
            description="Try clearing the search or choosing a different status filter."
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card-luxe hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider2 text-muted">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">City</th>
                    <th className="px-5 py-3 font-medium">Items</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((o) => {
                    const meta = ORDER_STATUS_META[o.status];
                    return (
                      <tr key={o.orderNumber} className="transition-colors hover:bg-ivory/60">
                        <td className="px-5 py-3.5">
                          <Link href={`/admin/orders/${o.orderNumber}`} className="font-medium text-navy hover:text-gold-600">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-muted">{formatDate(o.createdAt)}</td>
                        <td className="px-5 py-3.5 text-ink">{o.customer.name}</td>
                        <td className="px-5 py-3.5 text-muted">{o.customer.city}</td>
                        <td className="px-5 py-3.5 text-muted">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                        <td className="px-5 py-3.5 text-muted">{paymentLabel(o.paymentMethod)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col items-start gap-1.5">
                            <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
                            <Select
                              value={o.status}
                              onChange={(e) => changeStatus(o.orderNumber, e.target.value as OrderStatus)}
                              aria-label={`Change status of ${o.orderNumber}`}
                              className="h-8 w-40 px-2 py-1 text-xs"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {ORDER_STATUS_META[s].label}
                                </option>
                              ))}
                            </Select>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-navy">{formatPrice(o.total)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/orders/${o.orderNumber}`}
                              aria-label={`View ${o.orderNumber}`}
                              title="View"
                              className="rounded-button p-2 text-navy hover:bg-navy/5"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/invoice/${o.orderNumber}`}
                              aria-label={`Print invoice for ${o.orderNumber}`}
                              title="Print invoice"
                              className="rounded-button p-2 text-navy hover:bg-navy/5"
                            >
                              <Printer size={16} />
                            </Link>
                            <a
                              href={waLink(o.customer.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`WhatsApp ${o.customer.name}`}
                              title="WhatsApp"
                              className="rounded-button p-2 text-success hover:bg-success/10"
                            >
                              <MessageCircle size={16} />
                            </a>
                            <a
                              href={`tel:${o.customer.phone}`}
                              aria-label={`Call ${o.customer.name}`}
                              title="Call"
                              className="rounded-button p-2 text-navy hover:bg-navy/5"
                            >
                              <Phone size={16} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map((o) => {
              const meta = ORDER_STATUS_META[o.status];
              return (
                <li key={o.orderNumber} className="card-luxe p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/admin/orders/${o.orderNumber}`} className="font-medium text-navy hover:text-gold-600">
                        {o.orderNumber}
                      </Link>
                      <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                    </div>
                    <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
                  </div>
                  <p className="text-sm text-ink">
                    {o.customer.name} · {o.customer.city}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {o.items.reduce((n, i) => n + i.quantity, 0)} items · {paymentLabel(o.paymentMethod)}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="font-medium text-navy">{formatPrice(o.total)}</p>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/orders/${o.orderNumber}`} aria-label={`View ${o.orderNumber}`} className="rounded-button p-2 text-navy hover:bg-navy/5">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/invoice/${o.orderNumber}`} aria-label="Print invoice" className="rounded-button p-2 text-navy hover:bg-navy/5">
                        <Printer size={16} />
                      </Link>
                      <a href={waLink(o.customer.phone)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-button p-2 text-success hover:bg-success/10">
                        <MessageCircle size={16} />
                      </a>
                      <a href={`tel:${o.customer.phone}`} aria-label="Call" className="rounded-button p-2 text-navy hover:bg-navy/5">
                        <Phone size={16} />
                      </a>
                    </div>
                  </div>
                  <Select
                    value={o.status}
                    onChange={(e) => changeStatus(o.orderNumber, e.target.value as OrderStatus)}
                    aria-label={`Change status of ${o.orderNumber}`}
                    className="mt-3 h-9 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_META[s].label}
                      </option>
                    ))}
                  </Select>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
