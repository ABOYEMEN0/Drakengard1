/**
 * Deterministic demo dataset for the LEOR admin dashboard.
 * All values are derived from a seeded PRNG so server and client renders
 * are identical (no hydration drift). Dates are anchored to the start of
 * "today" so relative windows (last 30/60 days) stay meaningful.
 */

import { PRODUCTS } from "./data";
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
} from "./types";

// ——— Seeded PRNG (mulberry32) ———

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Midnight of today (local). Stable within a day, so SSR/CSR match. */
const ANCHOR: number = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();

const DAY = 86_400_000;

function isoAt(daysAgo: number, hour: number, minute: number): string {
  return new Date(ANCHOR - daysAgo * DAY + hour * 3_600_000 + minute * 60_000).toISOString();
}

// ——— Demo customers ———

export type LoyaltyLevel = "Bronze" | "Silver" | "Gold" | "VIP";

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  joinedAt: string;
  orderCount: number;
  totalSpent: number;
  loyaltyLevel: LoyaltyLevel;
  lastOrderAt: string;
}

const CUSTOMER_SEED: { name: string; city: string; district: string }[] = [
  { name: "Abdullah Al-Rashid", city: "Riyadh", district: "Al Olaya" },
  { name: "Sarah Al-Mutairi", city: "Jeddah", district: "Al Rawdah" },
  { name: "Khalid Al-Otaibi", city: "Riyadh", district: "Al Malqa" },
  { name: "Noura Al-Fahad", city: "Dammam", district: "Al Faisaliyah" },
  { name: "Faisal Al-Tamimi", city: "Riyadh", district: "Hittin" },
  { name: "Reema Al-Saud", city: "Jeddah", district: "Al Shati" },
  { name: "Mohammed Al-Qahtani", city: "Khobar", district: "Al Ulaya" },
  { name: "Layla Al-Harbi", city: "Mecca", district: "Al Aziziyah" },
  { name: "Turki Al-Dossari", city: "Medina", district: "Al Aqiq" },
  { name: "Hessa Al-Subaie", city: "Riyadh", district: "Al Nakheel" },
  { name: "Omar Al-Zahrani", city: "Abha", district: "Al Sadd" },
  { name: "Dana Al-Shammari", city: "Tabuk", district: "Al Muruj" },
];

// ——— Demo orders ———

const STATUS_POOL_RECENT: OrderStatus[] = [
  "PENDING",
  "PENDING",
  "UNDER_REVIEW",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];
const STATUS_POOL_OLD: OrderStatus[] = [
  "DELIVERED",
  "DELIVERED",
  "DELIVERED",
  "DELIVERED",
  "DELIVERED",
  "CANCELLED",
  "OUT_FOR_DELIVERY",
];

function buildOrders(): { orders: Order[]; customerOf: Map<string, number> } {
  const rnd = mulberry32(20260707);
  const orders: Order[] = [];
  const customerOf = new Map<string, number>();

  for (let i = 0; i < 40; i++) {
    // Spread over 60 days, denser recently.
    const daysAgo = i < 6 ? (i < 3 ? 0 : 1 + Math.floor(rnd() * 2)) : Math.floor(rnd() * 58) + 2;
    const hour = 9 + Math.floor(rnd() * 12);
    const minute = Math.floor(rnd() * 60);
    const createdAt = isoAt(daysAgo, hour, minute);

    const ci = Math.floor(rnd() * CUSTOMER_SEED.length);
    const cust = CUSTOMER_SEED[ci];

    const itemCount = 1 + Math.floor(rnd() * 3);
    const items: OrderItem[] = [];
    const used = new Set<number>();
    for (let k = 0; k < itemCount; k++) {
      let pi = Math.floor(rnd() * PRODUCTS.length);
      while (used.has(pi)) pi = (pi + 1) % PRODUCTS.length;
      used.add(pi);
      const p: Product = PRODUCTS[pi];
      const qty = 1 + Math.floor(rnd() * 3);
      const price = p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
      items.push({ productId: p.id, name: p.name, price, quantity: qty, total: price * qty });
    }
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    const pool = daysAgo <= 7 ? STATUS_POOL_RECENT : STATUS_POOL_OLD;
    const status = pool[Math.floor(rnd() * pool.length)];
    const paymentMethod: PaymentMethod = rnd() < 0.55 ? "COD" : "BANK_TRANSFER";

    const seq = 20040 - i;
    const orderNumber = `LR-2026${String(seq).padStart(5, "0")}`;
    const phone = `9665${String(10000000 + Math.floor(rnd() * 89999999))}`;

    const history: Order["statusHistory"] = [
      { status: "PENDING", at: createdAt, note: "Order placed" },
    ];
    if (status !== "PENDING") {
      history.push({
        status,
        at: isoAt(Math.max(0, daysAgo - 1), Math.min(23, hour + 2), minute),
        note: undefined,
      });
    }

    orders.push({
      id: `demo-${seq}`,
      orderNumber,
      invoiceNumber: `INV-2026${String(seq).padStart(5, "0")}`,
      status,
      items,
      customer: {
        name: cust.name,
        phone,
        email: `${cust.name.split(" ")[0].toLowerCase()}@example.com`,
        city: cust.city,
        district: cust.district,
        address: `${Math.floor(rnd() * 900) + 100} ${cust.district} St.`,
      },
      paymentMethod,
      subtotal,
      shipping,
      discount: 0,
      tax: 0,
      total,
      createdAt,
      statusHistory: history,
    });
    customerOf.set(orderNumber, ci);
  }

  orders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return { orders, customerOf };
}

const built = buildOrders();

export const ADMIN_ORDERS: Order[] = built.orders;

function loyaltyFor(spent: number): LoyaltyLevel {
  if (spent >= 2500) return "VIP";
  if (spent >= 1500) return "Gold";
  if (spent >= 700) return "Silver";
  return "Bronze";
}

export const ADMIN_CUSTOMERS: AdminCustomer[] = CUSTOMER_SEED.map((c, i) => {
  const theirOrders = ADMIN_ORDERS.filter((o) => built.customerOf.get(o.orderNumber) === i);
  const totalSpent = theirOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + o.total, 0);
  const lastOrderAt = theirOrders[0]?.createdAt ?? isoAt(45, 10, 0);
  const phone = theirOrders[0]?.customer.phone ?? `9665${String(10000000 + i * 731)}`;
  return {
    id: `cust-${i + 1}`,
    name: c.name,
    phone,
    email: `${c.name.split(" ")[0].toLowerCase()}@example.com`,
    city: c.city,
    district: c.district,
    joinedAt: isoAt(90 + i * 7, 10, 0),
    orderCount: theirOrders.length,
    totalSpent,
    loyaltyLevel: loyaltyFor(totalSpent),
    lastOrderAt,
  };
});

export function ordersForCustomer(customer: AdminCustomer): Order[] {
  return ADMIN_ORDERS.filter((o) => o.customer.name === customer.name);
}

// ——— Sales series ———

export interface DailyPoint {
  /** ISO date string at midday of the day */
  date: string;
  daysAgo: number;
  orders: number;
  revenue: number;
}

export const DAILY_SALES: DailyPoint[] = (() => {
  const rnd = mulberry32(987654321);
  const points: DailyPoint[] = [];
  for (let d = 29; d >= 0; d--) {
    const dayOrders = ADMIN_ORDERS.filter((o) => {
      const diff = Math.floor((ANCHOR + DAY - +new Date(o.createdAt)) / DAY);
      return diff - 1 === d && o.status !== "CANCELLED";
    });
    const baseline = 180 + Math.floor(rnd() * 620);
    points.push({
      date: isoAt(d, 12, 0),
      daysAgo: d,
      orders: dayOrders.length + (rnd() < 0.6 ? 1 : 0),
      revenue: Math.round(dayOrders.reduce((s, o) => s + o.total, 0) + baseline),
    });
  }
  return points;
})();

export interface MonthlyPoint {
  label: string;
  revenue: number;
  orders: number;
}

export const MONTHLY_REVENUE: MonthlyPoint[] = (() => {
  const rnd = mulberry32(424242);
  const points: MonthlyPoint[] = [];
  const now = new Date(ANCHOR);
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    points.push({
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      revenue: 9000 + Math.round(rnd() * 14000),
      orders: 60 + Math.round(rnd() * 90),
    });
  }
  // Make the current month reflect the actual demo orders roughly.
  const cur = points[points.length - 1];
  const monthRevenue = ADMIN_ORDERS.filter(
    (o) =>
      new Date(o.createdAt).getMonth() === now.getMonth() &&
      new Date(o.createdAt).getFullYear() === now.getFullYear() &&
      o.status !== "CANCELLED"
  ).reduce((s, o) => s + o.total, 0);
  cur.revenue = Math.max(cur.revenue, Math.round(monthRevenue));
  return points;
})();

// ——— Aggregations ———

function daysAgoOf(iso: string): number {
  return Math.floor((ANCHOR + DAY - 1 - +new Date(iso)) / DAY);
}

export interface AdminStats {
  todayOrders: number;
  yesterdayOrders: number;
  monthOrders: number;
  prevMonthOrders: number;
  revenue30: number;
  prevRevenue30: number;
  productsSold30: number;
  pendingCount: number;
}

export function getAdminStats(): AdminStats {
  const active = ADMIN_ORDERS.filter((o) => o.status !== "CANCELLED");
  const inWindow = (o: Order, from: number, to: number) => {
    const d = daysAgoOf(o.createdAt);
    return d >= from && d < to;
  };
  return {
    todayOrders: ADMIN_ORDERS.filter((o) => daysAgoOf(o.createdAt) === 0).length,
    yesterdayOrders: ADMIN_ORDERS.filter((o) => daysAgoOf(o.createdAt) === 1).length,
    monthOrders: ADMIN_ORDERS.filter((o) => inWindow(o, 0, 30)).length,
    prevMonthOrders: ADMIN_ORDERS.filter((o) => inWindow(o, 30, 60)).length,
    revenue30: Math.round(active.filter((o) => inWindow(o, 0, 30)).reduce((s, o) => s + o.total, 0)),
    prevRevenue30: Math.round(
      active.filter((o) => inWindow(o, 30, 60)).reduce((s, o) => s + o.total, 0)
    ),
    productsSold30: active
      .filter((o) => inWindow(o, 0, 30))
      .reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0),
    pendingCount: ADMIN_ORDERS.filter(
      (o) => o.status === "PENDING" || o.status === "UNDER_REVIEW"
    ).length,
  };
}

export interface TopProduct {
  product: Product;
  units: number;
  revenue: number;
}

export function getTopProducts(limit = 5): TopProduct[] {
  const map = new Map<string, { units: number; revenue: number }>();
  for (const o of ADMIN_ORDERS) {
    if (o.status === "CANCELLED") continue;
    for (const it of o.items) {
      const cur = map.get(it.productId) ?? { units: 0, revenue: 0 };
      cur.units += it.quantity;
      cur.revenue += it.total;
      map.set(it.productId, cur);
    }
  }
  return [...map.entries()]
    .map(([id, agg]) => ({ product: PRODUCTS.find((p) => p.id === id)!, units: agg.units, revenue: agg.revenue }))
    .filter((t) => t.product != null)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getTopCustomers(limit = 5): AdminCustomer[] {
  return [...ADMIN_CUSTOMERS].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit);
}

export interface CitySales {
  city: string;
  orders: number;
  revenue: number;
}

export function getSalesByCity(): CitySales[] {
  const map = new Map<string, { orders: number; revenue: number }>();
  for (const o of ADMIN_ORDERS) {
    if (o.status === "CANCELLED") continue;
    const cur = map.get(o.customer.city) ?? { orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += o.total;
    map.set(o.customer.city, cur);
  }
  return [...map.entries()]
    .map(([city, agg]) => ({ city, ...agg, revenue: Math.round(agg.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ——— Inventory movements (demo) ———

export interface InventoryMovement {
  id: string;
  type: "deduction" | "restock";
  productName: string;
  quantity: number;
  at: string;
  reference: string;
}

export const INVENTORY_MOVEMENTS: InventoryMovement[] = (() => {
  const rnd = mulberry32(555001);
  const moves: InventoryMovement[] = [];
  let id = 1;
  for (const o of ADMIN_ORDERS.slice(0, 8)) {
    if (o.status === "CANCELLED") continue;
    for (const it of o.items.slice(0, 2)) {
      moves.push({
        id: `mv-${id++}`,
        type: "deduction",
        productName: it.name,
        quantity: it.quantity,
        at: o.createdAt,
        reference: `Order ${o.orderNumber}`,
      });
    }
  }
  const restockable = PRODUCTS.filter((p) => p.stock <= p.lowStockThreshold * 2).slice(0, 4);
  restockable.forEach((p, i) => {
    moves.push({
      id: `mv-${id++}`,
      type: "restock",
      productName: p.name,
      quantity: 20 + Math.floor(rnd() * 40),
      at: isoAt(2 + i * 3, 8, 30),
      reference: `PO-10${40 + i}`,
    });
  });
  return moves.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 14);
})();

export function getLowStockProducts(): Product[] {
  return PRODUCTS.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
}

export function getOutOfStockProducts(): Product[] {
  return PRODUCTS.filter((p) => p.stock === 0);
}

// ——— CSV helper ———

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
