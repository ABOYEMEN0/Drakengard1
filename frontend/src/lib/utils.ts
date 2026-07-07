import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} SAR`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Discounted price if on sale, otherwise base price. */
export function effectivePrice(p: { price: number; salePrice?: number }): number {
  return p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
}

export function discountPercent(p: { price: number; salePrice?: number }): number | null {
  if (p.salePrice == null || p.salePrice >= p.price) return null;
  return Math.round(((p.price - p.salePrice) / p.price) * 100);
}
