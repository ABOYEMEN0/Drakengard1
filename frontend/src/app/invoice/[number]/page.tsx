import type { Metadata } from "next";
import { InvoiceClient } from "./invoice-client";

export const metadata: Metadata = {
  title: "Invoice — LEOR",
  description: "Printable LEOR invoice.",
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return <InvoiceClient orderNumber={decodeURIComponent(number)} />;
}
