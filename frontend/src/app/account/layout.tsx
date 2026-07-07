import type { Metadata } from "next";
import { AccountShell } from "./account-shell";

export const metadata: Metadata = {
  title: { default: "My Account — LEOR", template: "%s — LEOR" },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
