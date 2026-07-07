import type { Metadata } from "next";
import { AddressesClient } from "./addresses-client";

export const metadata: Metadata = {
  title: "Addresses",
  description: "Manage your saved delivery addresses.",
};

export default function AddressesPage() {
  return <AddressesClient />;
}
