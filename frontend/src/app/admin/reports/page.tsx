"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Download, Timer, Truck } from "lucide-react";
import {
  DAILY_SALES,
  MONTHLY_REVENUE,
  downloadCsv,
  getLowStockProducts,
  getOutOfStockProducts,
  getSalesByCity,
  getTopCustomers,
  getTopProducts,
} from "@/lib/admin-data";
import { PRODUCTS } from "@/lib/data";
import { cn, effectivePrice, formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Tab = "Daily" | "Weekly" | "Monthly" | "Yearly";
const TABS: Tab[] = ["Daily", "Weekly", "Monthly", "Yearly"];

interface ReportRow {
  label: string;
  orders: number;
  revenue: number;
}

function AreaChart({ points, label }: { points: { revenue: number; date: string }[]; label: string }) {
  const w = 600;
  const h = 180;
  const pad = 8;
  const max = Math.max(...points.map((p) => p.revenue), 1);
  const coords = points.map((p, i) => {
    const x = pad + (i / Math.max(1, points.length - 1)) * (w - pad * 2);
    const y = h - pad - (p.revenue / max) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" role="img" aria-label={label} preserveAspectRatio="none">
      <defs>
        <linearGradient id="reportGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8B46A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D8B46A" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#reportGold)" />
      <polyline points={line} fill="none" stroke="#C89E48" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 4 : 0} fill="#0F2345" stroke="#D8B46A" strokeWidth="2">
          <title>{`${formatDate(points[i].date)} — ${formatPrice(points[i].revenue)}`}</title>
        </circle>
      ))}
    </svg>
  );
}

export default function AdminReportsPage() {
  const push = useToast((s) => s.push);
  const [tab, setTab] = useState<Tab>("Daily");

  const salesByCity = useMemo(() => getSalesByCity(), []);
  const topProducts = useMemo(() => getTopProducts(5), []);
  const topCustomers = useMemo(() => getTopCustomers(5), []);
  const lowStock = useMemo(() => getLowStockProducts(), []);
  const outOfStock = useMemo(() => getOutOfStockProducts(), []);
  const inventoryValue = useMemo(
    () => Math.round(PRODUCTS.reduce((s, p) => s + p.stock * effectivePrice(p), 0)),
    []
  );

  const rows = useMemo<ReportRow[]>(() => {
    if (tab === "Daily") {
      return DAILY_SALES.map((p) => ({ label: formatDate(p.date), orders: p.orders, revenue: p.revenue }));
    }
    if (tab === "Weekly") {
      const weeks: ReportRow[] = [];
      for (let i = 0; i < DAILY_SALES.length; i += 7) {
        const chunk = DAILY_SALES.slice(i, i + 7);
        weeks.push({
          label: `${formatDate(chunk[0].date)} – ${formatDate(chunk[chunk.length - 1].date)}`,
          orders: chunk.reduce((s, p) => s + p.orders, 0),
          revenue: chunk.reduce((s, p) => s + p.revenue, 0),
        });
      }
      return weeks;
    }
    if (tab === "Monthly") {
      return MONTHLY_REVENUE.map((m) => ({ label: m.label, orders: m.orders, revenue: m.revenue }));
    }
    // Yearly: roll the monthly series into a single year total.
    const year = new Date().getFullYear();
    return [
      {
        label: String(year),
        orders: MONTHLY_REVENUE.reduce((s, m) => s + m.orders, 0),
        revenue: MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0),
      },
    ];
  }, [tab]);

  const totalOrders = rows.reduce((s, r) => s + r.orders, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const maxRowRevenue = Math.max(...rows.map((r) => r.revenue), 1);
  const maxCityRevenue = Math.max(...salesByCity.map((c) => c.revenue), 1);

  function exportCsv() {
    downloadCsv(
      `leor-report-${tab.toLowerCase()}.csv`,
      ["Period", "Orders", "Revenue (SAR)"],
      rows.map((r) => [r.label, r.orders, r.revenue])
    );
    push(`${tab} report exported to CSV`);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="eyebrow mb-2">Insights</p>
        <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">Reports</h1>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Report period" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
              tab === t ? "border-navy bg-navy text-ivory" : "border-line text-muted hover:border-navy/40 hover:text-navy"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Period report */}
      <section className="card-luxe p-6" aria-label={`${tab} report`}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-medium text-navy">{tab} Sales</h2>
            <p className="text-xs text-muted">
              {totalOrders} orders · {formatPrice(totalRevenue)} revenue
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </Button>
        </div>

        {tab === "Daily" ? (
          <AreaChart points={DAILY_SALES} label="Daily revenue, last 30 days" />
        ) : (
          <div className="flex h-44 items-end gap-2">
            {rows.map((r) => (
              <div key={r.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-navy transition-colors hover:bg-navy-600"
                  style={{ height: `${Math.max(6, (r.revenue / maxRowRevenue) * 100)}%` }}
                  title={`${r.label} — ${formatPrice(r.revenue)}`}
                />
                <span className="w-full truncate text-center text-[10px] text-muted">{r.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wider2 text-muted">
                <th className="px-4 py-2.5 font-medium">Period</th>
                <th className="px-4 py-2.5 font-medium">Orders</th>
                <th className="px-4 py-2.5 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-2.5 text-ink">{r.label}</td>
                  <td className="px-4 py-2.5 text-muted">{r.orders}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-navy">{formatPrice(r.revenue)}</td>
                </tr>
              ))}
              <tr className="bg-ivory/60 font-semibold">
                <td className="px-4 py-2.5 text-navy">Total</td>
                <td className="px-4 py-2.5 text-navy">{totalOrders}</td>
                <td className="px-4 py-2.5 text-right text-gold-600">{formatPrice(totalRevenue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* City + top products */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-luxe p-6" aria-label="Sales by city">
          <h2 className="mb-5 font-display text-xl font-medium text-navy">Sales by City</h2>
          <ul className="space-y-4">
            {salesByCity.map((c) => (
              <li key={c.city}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-navy">{c.city}</span>
                  <span className="text-muted">
                    {c.orders} orders · <span className="font-medium text-navy">{formatPrice(c.revenue)}</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-navy/5">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${Math.max(4, (c.revenue / maxCityRevenue) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-luxe p-6" aria-label="Top products">
          <h2 className="mb-5 font-display text-xl font-medium text-navy">Top Products</h2>
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
      </div>

      {/* Customers + delivery + inventory */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-luxe p-6" aria-label="Top customers">
          <h2 className="mb-5 font-display text-xl font-medium text-navy">Top Customers</h2>
          <ul className="divide-y divide-line">
            {topCustomers.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
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

        <section className="card-luxe p-6" aria-label="Delivery performance">
          <h2 className="mb-5 font-display text-xl font-medium text-navy">Delivery Performance</h2>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Timer size={19} strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-display text-2xl text-navy">2.4 days</p>
                <p className="text-xs uppercase tracking-wider2 text-muted">Avg fulfilment time</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold-600">
                <Truck size={19} strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-display text-2xl text-navy">96%</p>
                <p className="text-xs uppercase tracking-wider2 text-muted">On-time delivery</p>
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>On-time rate</span>
                <span>96%</span>
              </div>
              <div className="h-2.5 rounded-full bg-navy/5">
                <div className="h-full rounded-full bg-navy" style={{ width: "96%" }} />
              </div>
            </div>
          </div>
        </section>

        <section className="card-luxe p-6" aria-label="Inventory report">
          <h2 className="mb-5 font-display text-xl font-medium text-navy">Inventory Report</h2>
          <p className="font-display text-2xl text-navy">{formatPrice(inventoryValue)}</p>
          <p className="mb-5 text-xs uppercase tracking-wider2 text-muted">Total inventory value</p>
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1 font-semibold text-[#8A6D1F]">Low stock ({lowStock.length})</p>
              {lowStock.length === 0 ? (
                <p className="text-muted">None</p>
              ) : (
                <ul className="space-y-1 text-muted">
                  {lowStock.map((p) => (
                    <li key={p.id} className="flex justify-between">
                      <span className="truncate">{p.name}</span>
                      <span className="shrink-0 font-medium text-navy">{p.stock} left</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-1 font-semibold text-[#B42318]">Out of stock ({outOfStock.length})</p>
              {outOfStock.length === 0 ? (
                <p className="text-muted">None</p>
              ) : (
                <ul className="space-y-1 text-muted">
                  {outOfStock.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
