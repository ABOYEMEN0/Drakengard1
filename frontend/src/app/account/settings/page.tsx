import type { Metadata } from "next";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your LEOR profile, password and preferences.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
