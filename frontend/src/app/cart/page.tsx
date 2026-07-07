import type { Metadata } from "next";
import { CartClient } from "./cart-client";

export const metadata: Metadata = {
  title: "Shopping Cart — LEOR",
  description: "Review your LEOR selections before checkout.",
};

export default function CartPage() {
  return <CartClient />;
}
