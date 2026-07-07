import OrderDetailClient from "./order-detail-client";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return <OrderDetailClient orderNumber={decodeURIComponent(number)} />;
}
