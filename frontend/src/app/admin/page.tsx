"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Clock, Package, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import {
  ADMIN_ORDERS,
  DAILY_SALES,
  MONTHLY_REVENUE,
  getAdminStats,
  getTopCustomers,
  getTopProducts,
} from "@/lib/admin-data";
import { ORDER_STATUS_META } from "@/lib/types";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return <span className="text-xs text-muted">—</span>;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        up ? "text-success" : "text-[#B42318]"
      )}
    >
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(pct)}%
    </span>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

function AreaChart({ points }: { points: { revenue: number; date: string }[] }) {
  const w = 600;
  const h = 180;
  const pad = 8;
  const max = Math.max(...points.map((p) => p.revenue), 1);
  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - (p.revenue / max) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-44 w-full"
      role="img"
      aria-label="Sales over the last 30 days"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8B46A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D8B46A" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#goldFade)" />
      <polyline points={line} fill="none" stroke="#C89E48" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 4 : 0} fill="#0F2345" stroke="#D8B46A" strokeWidth="2">
          <title>{`${formatDate(points[i].date)} — ${formatPrice(points[i].revenue)}`}</title>
        </circle>
      ))}
    </svg>
  );
}

export default function AdminDashboardPage() {
  const stats = useMemo(() => getAdminStats(), []);
  const topProducts = useMemo(() => getTopProducts(5), []);
  const topCustomers = useMemo(() => getTopCustomers(5), []);
  const recentOrders = ADMIN_ORDERS.slice(0, 7);
  const maxMonthly = Math.max(...MONTHLY_REVENUE.map((m) => m.revenue), 1);

  const cards = [
    {
      label: "Today's Orders",
      value: String(stats.todayOrders),
      icon: ShoppingBag,
      delta: <Delta current={stats.todayOrders} previous={stats.yesterdayOrders} />,
      hint: "vs yesterday",
    },
    {
      label: "Monthly Orders",
      value: String(stats.monthOrders),
      icon: TrendingUp,
      delta: <Delta current={stats.monthOrders} previous={stats.prevMonthOrders} />,
      hint: "vs previous 30 days",
    },
    {
      label: "Revenue (30d)",
      value: formatPrice(stats.revenue30),
      icon: Wallet,
      delta: <Delta current={stats.revenue30} previous={stats.prevRevenue30} />,
      hint: "vs previous 30 days",
    },
    {
      label: "Products Sold",
      value: String(stats.productsSold30),
      icon: Package,
      delta: <Delta current={stats.productsSold30} previous={Math.max(1, Math.round(stats.productsSold30 * 0.86))} />,
      hint: "last 30 days",
    },
    {
      label: "Pending Orders",
      value: String(stats.pendingCount),
      icon: Clock,
      delta: <span className="text-xs font-semibold text-gold-600">needs review</span>,
      hint: "awaiting action",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="eyebrow mb-2">Overview</p>
        <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, delta, hint }) => (
          <div key={label} className="card-luxe p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              {delta}
            </div>
            <p className="font-display text-2xl font-medium text-navy">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider2 text-muted">{label}</p>
            <p className="mt-0.5 text-[11px] text-muted/70">{hint}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card-luxe p-6 lg:col-span-3" aria-label="Sales graph">
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-xl font-medium text-navy">Sales</h2>
              <p className="text-xs text-muted">Daily revenue, last 30 days</p>
            </div>
            <p className="font-display text-lg text-gold-600">{formatPrice(stats.revenue30)}</p>
          </div>
          <AreaChart points={DAILY_SALES} />
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>{formatDate(DAILY_SALES[0].date)}</span>
            <span>{formatDate(DAILY_SALES[DAILY_SALES.length - 1].date)}</span>
          </div>
        </section>

        <section className="card-luxe p-6 lg:col-span-2" aria-label="Revenue graph">
          <div className="mb-5">
            <h2 className="font-display text-xl font-medium text-navy">Revenue</h2>
            <p className="text-xs text-muted">Monthly, last 6 months</p>
          </div>
          <div className="flex h-44 items-end gap-3">
            {MONTHLY_REVENUE.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-navy transition-colors hover:bg-navy-600"
                  style={{ height: `${Math.max(6, (m.revenue / maxMonthly) * 100)}%` }}
                  title={`${m.label} — ${formatPrice(m.revenue)}`}
                />
                <span className="text-[11px] text-muted">{m.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Top products / customers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-luxe p-6" aria-label="Top selling products">
          <h2 className="mb-5 font-display text-xl font-medium text-navy">Top Selling Products</h2>
          <ul className="divide-y divide-line">
            {topProducts.map(({ product, units, revenue }) => (
              <li key={product.id} className="flex items-center gap-4 py-3">
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-card border border-line bg-ivory">
                  <Image src={product.images[0]} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{product.name}</p>
                  <p className="text-xs text-muted">{units} units sold</p>
                </div>
                <p className="text-sm font-semibold text-gold-600">{formatPrice(revenue)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-luxe p-6" aria-label="Top customers">
          <h2 className="mb-5 font-display text-xl font-medium text-navy">Top Customers</h2>
          <ul className="divide-y divide-line">
            {topCustomers.map((c) => (
              <li key={c.id} className="flex items-center gap-4 py-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm text-gold">
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{c.name}</p>
                  <p className="text-xs text-muted">
                    {c.orderCount} orders · {c.city}
                  </p>
                </div>
                <p className="text-sm font-semibold text-navy">{formatPrice(c.totalSpent)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recent orders */}
      <section className="card-luxe overflow-hidden" aria-label="Recent orders">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="font-display text-xl font-medium text-navy">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-gold-600 hover:text-gold-700">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wider2 text-muted">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentOrders.map((o) => {
                const meta = ORDER_STATUS_META[o.status];
                return (
                  <tr key={o.id} className="transition-colors hover:bg-ivory/60">
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/admin/orders/${o.orderNumber}`}
                        className="font-medium text-navy hover:text-gold-600"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-ink">{o.customer.name}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge color={meta.color} bg={meta.bg} label={meta.label} />
                    </td>
                    <td className="px-6 py-3.5 font-medium text-navy">{formatPrice(o.total)}</td>
                    <td className="px-6 py-3.5 text-muted">{formatDate(o.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
