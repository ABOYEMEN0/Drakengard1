import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient } from "./shop-client";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full LEOR collection — single-origin coffee, bean-to-bar chocolate, premium nuts, brewing accessories and curated gift boxes.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <div className="skeleton h-8 w-48" />
        </div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
