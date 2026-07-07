import type { Metadata } from "next";
import { ConfirmationClient } from "./confirmation-client";

export const metadata: Metadata = {
  title: "Order Confirmed — LEOR",
  description: "Thank you for your LEOR order.",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return <ConfirmationClient orderNumber={decodeURIComponent(number)} />;
}
