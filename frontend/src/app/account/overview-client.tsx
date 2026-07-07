"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CircleDollarSign,
  FileText,
  Heart,
  MapPin,
  Package,
  PackageCheck,
  Settings,
  Truck,
} from "lucide-react";
import { useOrders, useSession } from "@/lib/store";
import { ORDER_STATUS_META } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

const QUICK_LINKS = [
  { href: "/account/orders", label: "Orders", description: "Track and review your orders", icon: Package },
  { href: "/account/invoices", label: "Invoices", description: "View and download invoices", icon: FileText },
  { href: "/account/addresses", label: "Addresses", description: "Manage delivery addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", description: "Products you have saved", icon: Heart },
  { href: "/account/notifications", label: "Notifications", description: "Updates on your orders", icon: Bell },
  { href: "/account/settings", label: "Settings", description: "Profile and preferences", icon: Settings },
] as const;

export function OverviewClient() {
  const [mounted, setMounted] = useState(false);
  const orders = useOrders((s) => s.orders);
  const user = useSession((s) => s.user);
  useEffect(() => setMounted(true), []);

  const data = mounted ? orders : [];
  const inProgress = data.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  ).length;
  const delivered = data.filter((o) => o.status === "DELIVERED").length;
  const totalSpent = data
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Total orders", value: String(data.length), icon: Package },
    { label: "In progress", value: String(inProgress), icon: Truck },
    { label: "Delivered", value: String(delivered), icon: PackageCheck },
    { label: "Total spent", value: formatPrice(totalSpent), icon: CircleDollarSign },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow mb-2">Overview</p>
        <h1 className="heading-md">
          Welcome back{mounted && user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-luxe p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
              <Icon size={17} className="text-gold-600" strokeWidth={1.75} />
            </div>
            <p className="font-display text-2xl font-medium text-navy">{value}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wider2 text-muted">{label}</p>
          </div>
        ))}
      </div>

      <section aria-label="Recent orders">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-navy">Recent orders</h2>
          <Link
            href="/account/orders"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-gold-600 hover:text-gold-700"
          >
            View all
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        {data.length === 0 ? (
          <div className="card-luxe px-6 py-10 text-center text-sm text-muted">
            No orders yet.{" "}
            <Link href="/shop" className="font-medium text-gold-600 hover:underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="card-luxe overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider2 text-muted">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((o) => {
                  const meta = ORDER_STATUS_META[o.status];
                  return (
                    <tr key={o.id} className="border-b border-line/60 last:border-0">
                      <td className="px-5 py-4 font-medium text-navy">{o.orderNumber}</td>
                      <td className="px-5 py-4 text-muted">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
                      </td>
                      <td className="px-5 py-4 text-navy">{formatPrice(o.total)}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/account/orders/${o.orderNumber}`}
                          className="text-sm font-medium text-gold-600 hover:text-gold-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-label="Quick links">
        <h2 className="mb-4 font-display text-xl font-medium text-navy">Quick links</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="card-luxe group flex items-start gap-4 p-5 hover:shadow-lift"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/5">
                <Icon size={17} className="text-gold-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-medium text-navy group-hover:text-gold-700">{label}</p>
                <p className="mt-0.5 text-xs text-muted">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
