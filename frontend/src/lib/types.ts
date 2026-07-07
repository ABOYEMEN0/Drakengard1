/** Shared domain types for the LEOR storefront. Mirrors the backend Prisma schema. */

export type CategorySlug =
  | "coffee"
  | "chocolate"
  | "nuts"
  | "accessories"
  | "gift-boxes"
  | "seasonal";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  nameAr: string;
  description: string;
  image: string;
  productCount: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  category: CategorySlug;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: "SAR";
  images: string[];
  weight: string;
  origin?: string;
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  attributes: Record<string, string>;
  variants?: ProductVariant[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  onSale: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  weight: string;
  quantity: number;
  maxStock: number;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
}

export type OrderStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "BANK_TRANSFER";

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  city: string;
  district: string;
  address: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  createdAt: string;
  statusHistory: { status: OrderStatus; at: string; note?: string }[];
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "order" | "stock" | "message" | "system";
  read: boolean;
  createdAt: string;
}

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; bg: string; step: number }
> = {
  PENDING: { label: "Pending", color: "#8A6D1F", bg: "#F7EFD8", step: 0 },
  UNDER_REVIEW: { label: "Under Review", color: "#5B5BD6", bg: "#E8E8FB", step: 1 },
  CONFIRMED: { label: "Confirmed", color: "#0F5FA8", bg: "#DFEDFA", step: 2 },
  PREPARING: { label: "Preparing", color: "#8A4B0F", bg: "#F8E9D8", step: 3 },
  READY_FOR_DELIVERY: { label: "Ready for Delivery", color: "#0F7B6C", bg: "#DBF2EF", step: 4 },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "#6941C6", bg: "#EFE9FB", step: 5 },
  DELIVERED: { label: "Delivered", color: "#5E7B45", bg: "#E7EFDE", step: 6 },
  CANCELLED: { label: "Cancelled", color: "#B42318", bg: "#FBE4E2", step: -1 },
};

export const FREE_SHIPPING_THRESHOLD = 300;
export const SHIPPING_FEE = 25;
export const STORE_WHATSAPP = "966500000000";
export const STORE_NAME = "LEOR";
