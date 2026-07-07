import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS } from "@/lib/data";

const BASE = "https://leor.sa";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/shop",
    "/categories",
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/track-order",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const products = PRODUCTS.map((p) => ({
    url: `${BASE}/product/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categories = CATEGORIES.map((c) => ({
    url: `${BASE}/shop?category=${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...products, ...categories];
}
