import type { Metadata } from "next";
import { OrderDetailClient } from "./order-detail-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order ${decodeURIComponent(number)}` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return <OrderDetailClient orderNumber={decodeURIComponent(number)} />;
}
