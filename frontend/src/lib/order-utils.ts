import {
  CartItem,
  Coupon,
  CustomerInfo,
  FREE_SHIPPING_THRESHOLD,
  Order,
  PaymentMethod,
  SHIPPING_FEE,
  STORE_WHATSAPP,
} from "./types";

/**
 * Order numbers follow LR-<year><5-digit sequence>, e.g. LR-202600125.
 * In production the sequence is issued atomically by the backend; the demo
 * fallback derives a locally unique sequence persisted in localStorage.
 */
export function generateOrderNumber(sequence: number, year = new Date().getFullYear()): string {
  return `LR-${year}${String(sequence).padStart(5, "0")}`;
}

export function generateInvoiceNumber(sequence: number, year = new Date().getFullYear()): string {
  return `INV-${year}${String(sequence).padStart(5, "0")}`;
}

export function nextLocalSequence(): number {
  if (typeof window === "undefined") return 1;
  const key = "leor-order-seq";
  const next = Number(window.localStorage.getItem(key) ?? "100") + 1;
  window.localStorage.setItem(key, String(next));
  return next;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export function computeTotals(items: CartItem[], coupon?: Coupon | null): CartTotals {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let discount = 0;
  if (coupon && (!coupon.minSubtotal || subtotal >= coupon.minSubtotal)) {
    discount =
      coupon.type === "percent"
        ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
        : Math.min(coupon.value, subtotal);
  }
  const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shipping);
  return { subtotal, shipping, discount, total };
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on Delivery",
  BANK_TRANSFER: "Bank Transfer",
};

export function paymentLabel(method: PaymentMethod): string {
  return PAYMENT_LABELS[method];
}

/** Builds the formatted WhatsApp confirmation message for an order. */
export function buildWhatsAppMessage(order: Order): string {
  const lines = [
    "Hello LEOR,",
    "",
    "I would like to confirm my order.",
    "",
    `Order Number: ${order.orderNumber}`,
    "",
    "Products:",
    ...order.items.map((i) => `- ${i.name} x${i.quantity}`),
    "",
    `Total: ${order.total} SAR`,
    "",
    "Customer:",
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${order.customer.city}, ${order.customer.district}, ${order.customer.address}`,
    "",
    `Payment Method: ${PAYMENT_LABELS[order.paymentMethod]}`,
  ];
  return lines.join("\n");
}

export function whatsAppUrl(order: Order, storeNumber = STORE_WHATSAPP): string {
  return `https://wa.me/${storeNumber}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
}

export function buildLocalOrder(params: {
  items: CartItem[];
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
  coupon?: Coupon | null;
}): Order {
  const seq = nextLocalSequence();
  const totals = computeTotals(params.items, params.coupon);
  const now = new Date().toISOString();
  return {
    id: `local-${seq}`,
    orderNumber: generateOrderNumber(seq),
    invoiceNumber: generateInvoiceNumber(seq),
    status: "PENDING",
    items: params.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      total: i.price * i.quantity,
    })),
    customer: params.customer,
    paymentMethod: params.paymentMethod,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    discount: totals.discount,
    tax: 0,
    total: totals.total,
    couponCode: params.coupon?.code,
    createdAt: now,
    statusHistory: [{ status: "PENDING", at: now, note: "Order placed" }],
  };
}
