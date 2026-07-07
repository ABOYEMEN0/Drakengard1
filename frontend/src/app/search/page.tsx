import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./search-client";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the LEOR collection — coffee, chocolate, nuts, accessories and gifts.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <div className="skeleton h-8 w-48" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
