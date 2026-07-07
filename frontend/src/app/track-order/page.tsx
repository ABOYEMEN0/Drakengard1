import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrderClient } from "./track-client";

export const metadata: Metadata = {
  title: "Track Your Order — LEOR",
  description: "Follow your LEOR order from confirmation to delivery.",
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <div className="skeleton h-8 w-48" />
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
