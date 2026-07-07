"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Boxes,
  Minus,
  PackageX,
  Plus,
  Wallet,
} from "lucide-react";
import { INVENTORY_MOVEMENTS } from "@/lib/admin-data";
import { PRODUCTS } from "@/lib/data";
import { Product } from "@/lib/types";
import { cn, effectivePrice, formatDateTime, formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

function stockStatus(p: Product): { label: string; color: string; bg: string } {
  if (p.stock === 0) return { label: "Out of stock", color: "#B42318", bg: "#FBE4E2" };
  if (p.stock <= p.lowStockThreshold) return { label: "Low stock", color: "#8A6D1F", bg: "#F7EFD8" };
  return { label: "In stock", color: "#5E7B45", bg: "#E7EFDE" };
}

export default function AdminInventoryPage() {
  const push = useToast((s) => s.push);
  const [products, setProducts] = useState<Product[]>(() => PRODUCTS.map((p) => ({ ...p })));

  const lowStock = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold),
    [products]
  );
  const outOfStock = useMemo(() => products.filter((p) => p.stock === 0), [products]);
  const inventoryValue = useMemo(
    () => products.reduce((s, p) => s + p.stock * effectivePrice(p), 0),
    [products]
  );

  function adjust(id: string, delta: number) {
    setProducts((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        const stock = Math.max(0, p.stock + delta);
        return { ...p, stock };
      })
    );
    const p = products.find((x) => x.id === id);
    if (p) push(`${p.name}: stock ${delta > 0 ? "+" : ""}${delta}`);
  }

  function setStock(id: string, value: string) {
    const n = Math.max(0, Math.round(Number(value) || 0));
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, stock: n } : p)));
  }

  const cards = [
    { label: "Total SKUs", value: String(products.length), icon: Boxes },
    { label: "Low Stock", value: String(lowStock.length), icon: AlertTriangle },
    { label: "Out of Stock", value: String(outOfStock.length), icon: PackageX },
    { label: "Inventory Value", value: formatPrice(Math.round(inventoryValue)), icon: Wallet },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="eyebrow mb-2">Stock control</p>
        <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">Inventory</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-luxe p-5">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy">
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <p className="font-display text-2xl font-medium text-navy">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider2 text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Low-stock banner */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-card border border-gold/50 bg-gold/10 px-5 py-4"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-gold-600" />
          <div className="text-sm text-navy">
            <p className="font-semibold">Stock attention required</p>
            {lowStock.length > 0 && (
              <p className="mt-1">
                <span className="font-medium">Low:</span> {lowStock.map((p) => p.name).join(", ")}
              </p>
            )}
            {outOfStock.length > 0 && (
              <p className="mt-1">
                <span className="font-medium">Out of stock:</span> {outOfStock.map((p) => p.name).join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stock table (desktop) */}
      <div className="card-luxe hidden overflow-hidden lg:block">
        <h2 className="px-6 pt-6 font-display text-xl font-medium text-navy">Stock Levels</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wider2 text-muted">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Threshold</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Quick adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const st = stockStatus(p);
                return (
                  <tr key={p.id} className="transition-colors hover:bg-ivory/60">
                    <td className="px-6 py-3 font-medium text-navy">{p.name}</td>
                    <td className="px-6 py-3 text-muted">{p.sku}</td>
                    <td
                      className={cn(
                        "px-6 py-3 font-semibold",
                        p.stock === 0 ? "text-[#B42318]" : p.stock <= p.lowStockThreshold ? "text-[#8A6D1F]" : "text-navy"
                      )}
                    >
                      {p.stock}
                    </td>
                    <td className="px-6 py-3 text-muted">{p.lowStockThreshold}</td>
                    <td className="px-6 py-3">
                      <StatusBadge color={st.color} bg={st.bg} label={st.label} />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjust(p.id, -1)}
                          disabled={p.stock === 0}
                          aria-label={`Decrease stock of ${p.name}`}
                          className="rounded-button border border-line p-1.5 text-navy hover:bg-navy/5 disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>
                        <Input
                          type="number"
                          min={0}
                          value={p.stock}
                          onChange={(e) => setStock(p.id, e.target.value)}
                          aria-label={`Set stock of ${p.name}`}
                          className="h-9 w-20 px-2 py-1 text-center text-sm"
                        />
                        <button
                          onClick={() => adjust(p.id, 1)}
                          aria-label={`Increase stock of ${p.name}`}
                          className="rounded-button border border-line p-1.5 text-navy hover:bg-navy/5"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock cards (mobile) */}
      <ul className="space-y-3 lg:hidden">
        {products.map((p) => {
          const st = stockStatus(p);
          return (
            <li key={p.id} className="card-luxe p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-navy">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.sku} · threshold {p.lowStockThreshold}
                  </p>
                </div>
                <StatusBadge color={st.color} bg={st.bg} label={st.label} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => adjust(p.id, -1)}
                  disabled={p.stock === 0}
                  aria-label={`Decrease stock of ${p.name}`}
                  className="rounded-button border border-line p-2 text-navy hover:bg-navy/5 disabled:opacity-40"
                >
                  <Minus size={14} />
                </button>
                <Input
                  type="number"
                  min={0}
                  value={p.stock}
                  onChange={(e) => setStock(p.id, e.target.value)}
                  aria-label={`Set stock of ${p.name}`}
                  className="h-10 w-24 px-2 py-1 text-center text-sm"
                />
                <button
                  onClick={() => adjust(p.id, 1)}
                  aria-label={`Increase stock of ${p.name}`}
                  className="rounded-button border border-line p-2 text-navy hover:bg-navy/5"
                >
                  <Plus size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Movements */}
      <section className="card-luxe p-6" aria-label="Inventory movements">
        <h2 className="mb-6 font-display text-xl font-medium text-navy">Recent Movements</h2>
        <ol className="space-y-0">
          {INVENTORY_MOVEMENTS.map((m, i) => (
            <li key={m.id} className="relative flex gap-4 pb-6 last:pb-0">
              {i < INVENTORY_MOVEMENTS.length - 1 && (
                <span className="absolute left-[15px] top-8 h-full w-px bg-line" aria-hidden />
              )}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  m.type === "restock" ? "bg-success/10 text-success" : "bg-navy/5 text-navy"
                )}
              >
                {m.type === "restock" ? <ArrowUpCircle size={17} /> : <ArrowDownCircle size={17} />}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-navy">
                  {m.productName}{" "}
                  <span className={cn("font-semibold", m.type === "restock" ? "text-success" : "text-[#B42318]")}>
                    {m.type === "restock" ? "+" : "−"}
                    {m.quantity}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {m.reference} · {formatDateTime(m.at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
