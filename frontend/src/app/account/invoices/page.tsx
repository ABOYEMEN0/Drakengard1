import type { Metadata } from "next";
import { InvoicesClient } from "./invoices-client";

export const metadata: Metadata = {
  title: "Invoices",
  description: "View and download invoices for your LEOR orders.",
};

export default function InvoicesPage() {
  return <InvoicesClient />;
}
