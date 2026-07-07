"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin, MessageCircle, Phone, Search, Users, X } from "lucide-react";
import { ADMIN_CUSTOMERS, AdminCustomer, LoyaltyLevel, ordersForCustomer } from "@/lib/admin-data";
import { ORDER_STATUS_META } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

const LOYALTY_LEVELS: LoyaltyLevel[] = ["Bronze", "Silver", "Gold", "VIP"];

const LOYALTY_VARIANT: Record<LoyaltyLevel, "outline" | "navy" | "gold" | "success"> = {
  Bronze: "outline",
  Silver: "navy",
  Gold: "gold",
  VIP: "success",
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

export default function AdminCustomersPage() {
  const push = useToast((s) => s.push);
  const [query, setQuery] = useState("");
  const [loyaltyFilter, setLoyaltyFilter] = useState<LoyaltyLevel | "ALL">("ALL");
  const [loyaltyOverrides, setLoyaltyOverrides] = useState<Record<string, LoyaltyLevel>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const customers = useMemo(
    () =>
      ADMIN_CUSTOMERS.map((c) =>
        loyaltyOverrides[c.id] ? { ...c, loyaltyLevel: loyaltyOverrides[c.id] } : c
      ),
    [loyaltyOverrides]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (loyaltyFilter !== "ALL" && c.loyaltyLevel !== loyaltyFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [customers, query, loyaltyFilter]);

  const selected: AdminCustomer | null = useMemo(
    () => customers.find((c) => c.id === selectedId) ?? null,
    [customers, selectedId]
  );

  useEffect(() => {
    if (!selectedId) return;
    try {
      setNote(window.localStorage.getItem(`leor-admin-customer-note-${selectedId}`) ?? "");
    } catch {
      setNote("");
    }
  }, [selectedId]);

  function saveNote() {
    if (!selectedId) return;
    try {
      window.localStorage.setItem(`leor-admin-customer-note-${selectedId}`, note);
      push("Customer note saved");
    } catch {
      push("Could not save note", "info");
    }
  }

  function changeLoyalty(id: string, level: LoyaltyLevel) {
    setLoyaltyOverrides((s) => ({ ...s, [id]: level }));
    push(`Loyalty level set to ${level}`);
  }

  const history = selected ? ordersForCustomer(selected) : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="eyebrow mb-2">People</p>
        <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">Customers</h1>
        <p className="mt-1 text-sm text-muted">{filtered.length} customers shown</p>
      </div>

      {/* Filters */}
      <div className="card-luxe flex flex-col gap-3 p-4 sm:flex-row sm:p-5">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, email or city…"
            aria-label="Search customers"
            className="pl-10"
          />
        </div>
        <Select
          value={loyaltyFilter}
          onChange={(e) => setLoyaltyFilter(e.target.value as LoyaltyLevel | "ALL")}
          aria-label="Filter by loyalty level"
          className="sm:w-48"
        >
          <option value="ALL">All loyalty levels</option>
          {LOYALTY_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-luxe">
          <EmptyState icon={Users} title="No customers found" description="Try a different search or loyalty filter." />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card-luxe hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider2 text-muted">
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Phone</th>
                    <th className="px-6 py-3 font-medium">City</th>
                    <th className="px-6 py-3 font-medium">Orders</th>
                    <th className="px-6 py-3 font-medium">Total Spent</th>
                    <th className="px-6 py-3 font-medium">Loyalty</th>
                    <th className="px-6 py-3 font-medium">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className="cursor-pointer transition-colors hover:bg-ivory/60"
                    >
                      <td className="px-6 py-3">
                        <button className="flex items-center gap-3 text-left" onClick={() => setSelectedId(c.id)}>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-display text-xs text-gold">
                            {initials(c.name)}
                          </span>
                          <span className="font-medium text-navy">{c.name}</span>
                        </button>
                      </td>
                      <td className="px-6 py-3 text-muted">{c.phone}</td>
                      <td className="px-6 py-3 text-muted">{c.city}</td>
                      <td className="px-6 py-3 text-navy">{c.orderCount}</td>
                      <td className="px-6 py-3 font-medium text-navy">{formatPrice(c.totalSpent)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={LOYALTY_VARIANT[c.loyaltyLevel]}>{c.loyaltyLevel}</Badge>
                      </td>
                      <td className="px-6 py-3 text-muted">{formatDate(c.lastOrderAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map((c) => (
              <li key={c.id}>
                <button onClick={() => setSelectedId(c.id)} className="card-luxe w-full p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm text-gold">
                      {initials(c.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-navy">{c.name}</p>
                      <p className="text-xs text-muted">
                        {c.phone} · {c.city}
                      </p>
                    </div>
                    <Badge variant={LOYALTY_VARIANT[c.loyaltyLevel]}>{c.loyaltyLevel}</Badge>
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-muted">
                    <span>{c.orderCount} orders</span>
                    <span className="font-medium text-navy">{formatPrice(c.totalSpent)}</span>
                    <span>Last: {formatDate(c.lastOrderAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Customer ${selected.name}`}>
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setSelectedId(null)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col overflow-y-auto bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-xl font-medium text-navy">Customer Profile</h2>
              <button aria-label="Close panel" onClick={() => setSelectedId(null)} className="rounded-button p-1.5 text-muted hover:bg-navy/5 hover:text-navy">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-6 px-6 py-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy font-display text-lg text-gold">
                  {initials(selected.name)}
                </span>
                <div>
                  <p className="font-display text-lg font-medium text-navy">{selected.name}</p>
                  <p className="text-sm text-muted">{selected.email}</p>
                  <p className="text-sm text-muted">Joined {formatDate(selected.joinedAt)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${selected.phone}`} className="flex-1">
                  <Button variant="subtle" size="sm" className="w-full">
                    <Phone size={14} /> Call
                  </Button>
                </a>
                <a
                  href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageCircle size={14} /> WhatsApp
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-card border border-line p-4">
                  <p className="font-display text-xl text-navy">{selected.orderCount}</p>
                  <p className="text-xs uppercase tracking-wider2 text-muted">Orders</p>
                </div>
                <div className="rounded-card border border-line p-4">
                  <p className="font-display text-xl text-navy">{formatPrice(selected.totalSpent)}</p>
                  <p className="text-xs uppercase tracking-wider2 text-muted">Total spent</p>
                </div>
              </div>

              {/* Loyalty */}
              <Field label="Loyalty level" htmlFor="loyalty">
                <Select
                  id="loyalty"
                  value={selected.loyaltyLevel}
                  onChange={(e) => changeLoyalty(selected.id, e.target.value as LoyaltyLevel)}
                >
                  {LOYALTY_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Addresses */}
              <section aria-label="Addresses">
                <h3 className="label-luxe">Address</h3>
                <p className="flex items-start gap-2 rounded-card border border-line p-4 text-sm text-ink">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-gold-600" />
                  <span>
                    {selected.city}, {selected.district}
                  </span>
                </p>
              </section>

              {/* Purchase history */}
              <section aria-label="Purchase history">
                <h3 className="label-luxe">Purchase History</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-muted">No orders on record.</p>
                ) : (
                  <ul className="divide-y divide-line rounded-card border border-line">
                    {history.map((o) => {
                      const meta = ORDER_STATUS_META[o.status];
                      return (
                        <li key={o.orderNumber} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div>
                            <Link href={`/admin/orders/${o.orderNumber}`} className="text-sm font-medium text-navy hover:text-gold-600">
                              {o.orderNumber}
                            </Link>
                            <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                          </div>
                          <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
                          <p className="text-sm font-medium text-navy">{formatPrice(o.total)}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Notes */}
              <section aria-label="Notes" className="space-y-3">
                <h3 className="label-luxe">Notes</h3>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  aria-label="Customer notes"
                  placeholder="Preferences, delivery instructions…"
                />
                <Button variant="gold" size="sm" onClick={saveNote}>
                  Save note
                </Button>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
