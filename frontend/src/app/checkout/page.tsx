import type { Metadata } from "next";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout — LEOR",
  description: "Complete your LEOR order.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
