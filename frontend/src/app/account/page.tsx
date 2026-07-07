import type { Metadata } from "next";
import { OverviewClient } from "./overview-client";

export const metadata: Metadata = {
  title: "Account Overview",
  description: "Your LEOR account overview — orders, invoices and preferences.",
};

export default function AccountPage() {
  return <OverviewClient />;
}
