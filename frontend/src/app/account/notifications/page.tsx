import type { Metadata } from "next";
import { NotificationsClient } from "./notifications-client";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Order updates and messages from LEOR.",
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
