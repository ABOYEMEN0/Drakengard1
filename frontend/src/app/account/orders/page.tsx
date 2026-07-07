import type { Metadata } from "next";
import { OrdersClient } from "./orders-client";

export const metadata: Metadata = {
  title: "Orders",
  description: "Your full LEOR order history.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
