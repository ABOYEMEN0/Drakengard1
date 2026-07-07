"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  FileDown,
  MapPin,
  MessageCircle,
  PackageX,
  Phone,
  Printer,
  Send,
  XCircle,
} from "lucide-react";
import { ADMIN_ORDERS } from "@/lib/admin-data";
import { useOrders } from "@/lib/store";
import { Order, OrderStatus, ORDER_STATUS_META } from "@/lib/types";
import { paymentLabel, whatsAppUrl } from "@/lib/order-utils";
import { cn, formatDateTime, formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

const TIMELINE_STEPS: OrderStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const ALL_STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];

export default function OrderDetailClient({ orderNumber }: { orderNumber: string }) {
  const [mounted, setMounted] = useState(false);
  const localOrders = useOrders((s) => s.orders);
  const push = useToast((s) => s.push);

  const base = useMemo<Order | undefined>(() => {
    const local = mounted ? localOrders.find((o) => o.orderNumber === orderNumber) : undefined;
    return local ?? ADMIN_ORDERS.find((o) => o.orderNumber === orderNumber);
  }, [mounted, localOrders, orderNumber]);

  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [extraHistory, setExtraHistory] = useState<Order["statusHistory"]>([]);
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const noteKey = `leor-admin-note-${orderNumber}`;

  useEffect(() => {
    setMounted(true);
    try {
      setInternalNote(window.localStorage.getItem(`leor-admin-note-${orderNumber}`) ?? "");
    } catch {
      /* ignore */
    }
  }, [orderNumber]);

  if (!mounted) {
    return <div className="skeleton mx-auto h-40 max-w-5xl rounded-card" aria-hidden />;
  }

  if (!base) {
    return (
      <div className="card-luxe mx-auto max-w-2xl">
        <EmptyState
          icon={PackageX}
          title="Order not found"
          description={`No order matches ${orderNumber}. It may have been placed in another browser.`}
          actionLabel="Back to orders"
          actionHref="/admin/orders"
        />
      </div>
    );
  }

  const currentStatus = status ?? base.status;
  const meta = ORDER_STATUS_META[currentStatus];
  const history = [...base.statusHistory, ...extraHistory];
  const isCancelled = currentStatus === "CANCELLED";
  const currentStep = isCancelled ? -1 : ORDER_STATUS_META[currentStatus].step;

  function applyStatus() {
    if (!nextStatus || nextStatus === currentStatus) return;
    setStatus(nextStatus);
    setExtraHistory((h) => [
      ...h,
      { status: nextStatus, at: new Date().toISOString(), note: statusNote.trim() || undefined },
    ]);
    push(`Status updated to ${ORDER_STATUS_META[nextStatus].label}`);
    setStatusNote("");
    setNextStatus("");
  }

  function saveNote() {
    try {
      window.localStorage.setItem(noteKey, internalNote);
      push("Internal note saved");
    } catch {
      push("Could not save note", "info");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted hover:text-navy">
            <ArrowLeft size={14} /> Orders
          </Link>
          <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">{base.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">
            Placed {formatDateTime(base.createdAt)} · {paymentLabel(base.paymentMethod)}
          </p>
        </div>
        <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/invoice/${base.orderNumber}`}>
          <Button variant="outline" size="sm">
            <Printer size={15} /> Print invoice
          </Button>
        </Link>
        <Link href={`/invoice/${base.orderNumber}`}>
          <Button variant="outline" size="sm">
            <FileDown size={15} /> Download PDF
          </Button>
        </Link>
        <a href={whatsAppUrl(base)} target="_blank" rel="noopener noreferrer">
          <Button variant="gold" size="sm">
            <Send size={15} /> Send WhatsApp
          </Button>
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <section className="card-luxe overflow-hidden" aria-label="Order items">
            <h2 className="px-6 pt-6 font-display text-xl font-medium text-navy">Items</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider2 text-muted">
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Price</th>
                    <th className="px-6 py-3 font-medium">Qty</th>
                    <th className="px-6 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {base.items.map((it) => (
                    <tr key={it.productId}>
                      <td className="px-6 py-3.5 font-medium text-navy">{it.name}</td>
                      <td className="px-6 py-3.5 text-muted">{formatPrice(it.price)}</td>
                      <td className="px-6 py-3.5 text-muted">×{it.quantity}</td>
                      <td className="px-6 py-3.5 text-right font-medium text-navy">{formatPrice(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto max-w-xs space-y-2 px-6 py-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="text-navy">{formatPrice(base.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-navy">{base.shipping === 0 ? "Free" : formatPrice(base.shipping)}</dd>
              </div>
              {base.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount</dt>
                  <dd className="text-success">−{formatPrice(base.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2">
                <dt className="font-medium text-navy">Total</dt>
                <dd className="font-display text-lg text-gold-600">{formatPrice(base.total)}</dd>
              </div>
            </dl>
          </section>

          {/* Timeline */}
          <section className="card-luxe p-6" aria-label="Status timeline">
            <h2 className="mb-6 font-display text-xl font-medium text-navy">Status Timeline</h2>
            {isCancelled && (
              <p className="mb-5 flex items-center gap-2 rounded-card bg-[#FBE4E2] px-4 py-3 text-sm font-medium text-[#B42318]">
                <XCircle size={16} /> This order was cancelled.
              </p>
            )}
            <ol className="space-y-0">
              {TIMELINE_STEPS.map((s, i) => {
                const stepMeta = ORDER_STATUS_META[s];
                const done = !isCancelled && currentStep >= stepMeta.step;
                const isCurrent = !isCancelled && currentStep === stepMeta.step;
                const entry = history.filter((h) => h.status === s).pop();
                return (
                  <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < TIMELINE_STEPS.length - 1 && (
                      <span
                        className={cn("absolute left-[13px] top-7 h-full w-px", done ? "bg-gold" : "bg-line")}
                        aria-hidden
                      />
                    )}
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px]"
                      style={{
                        borderColor: done ? stepMeta.color : "#E5E0D5",
                        backgroundColor: done ? stepMeta.bg : "#FFFFFF",
                        color: stepMeta.color,
                      }}
                    >
                      {done ? <Check size={13} /> : i + 1}
                    </span>
                    <div className="pt-0.5">
                      <p className={cn("text-sm font-medium", done ? "text-navy" : "text-muted")}>
                        {stepMeta.label}
                        {isCurrent && <span className="ml-2 text-[11px] font-semibold text-gold-600">current</span>}
                      </p>
                      {entry && (
                        <p className="mt-0.5 text-xs text-muted">
                          {formatDateTime(entry.at)}
                          {entry.note ? ` — ${entry.note}` : ""}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          {/* Customer card */}
          <section className="card-luxe p-6" aria-label="Customer">
            <h2 className="mb-4 font-display text-xl font-medium text-navy">Customer</h2>
            <p className="font-medium text-navy">{base.customer.name}</p>
            <p className="mt-1 text-sm text-muted">{base.customer.phone}</p>
            {base.customer.email && <p className="text-sm text-muted">{base.customer.email}</p>}
            <p className="mt-3 flex items-start gap-2 text-sm text-ink">
              <MapPin size={15} className="mt-0.5 shrink-0 text-gold-600" />
              <span>
                {base.customer.city}, {base.customer.district}
                <br />
                {base.customer.address}
              </span>
            </p>
            <div className="mt-5 flex gap-2">
              <a href={`tel:${base.customer.phone}`} className="flex-1">
                <Button variant="subtle" size="sm" className="w-full">
                  <Phone size={14} /> Call
                </Button>
              </a>
              <a
                href={`https://wa.me/${base.customer.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle size={14} /> WhatsApp
                </Button>
              </a>
            </div>
          </section>

          {/* Change status */}
          <section className="card-luxe space-y-4 p-6" aria-label="Change status">
            <h2 className="font-display text-xl font-medium text-navy">Change Status</h2>
            <Field label="New status" htmlFor="order-status">
              <Select
                id="order-status"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
              >
                <option value="">Select status…</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_META[s].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Note" htmlFor="status-note" hint="optional">
              <Input
                id="status-note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Courier assigned"
              />
            </Field>
            <Button variant="primary" size="sm" className="w-full" onClick={applyStatus} disabled={!nextStatus}>
              Update status
            </Button>
          </section>

          {/* Internal notes */}
          <section className="card-luxe space-y-4 p-6" aria-label="Internal notes">
            <h2 className="font-display text-xl font-medium text-navy">Internal Notes</h2>
            <Textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              aria-label="Internal notes"
              placeholder="Notes visible to the team only…"
            />
            <Button variant="subtle" size="sm" className="w-full" onClick={saveNote}>
              Save note
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
