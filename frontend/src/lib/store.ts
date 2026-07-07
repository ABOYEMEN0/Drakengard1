"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppNotification, CartItem, Coupon, Order, Product } from "./types";
import { effectivePrice } from "./utils";

// ——— Cart ———

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  add: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0],
                price: effectivePrice(product),
                weight: product.weight,
                quantity: Math.min(quantity, product.stock),
                maxStock: product.stock,
              },
            ],
          };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                    : i
                ),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [], coupon: null }),
      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: "leor-cart" }
  )
);

// ——— Wishlist ———

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      has: (productId) => get().ids.includes(productId),
    }),
    { name: "leor-wishlist" }
  )
);

// ——— Recently viewed ———

interface RecentlyViewedState {
  ids: string[];
  push: (productId: string) => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      push: (productId) =>
        set((state) => ({
          ids: [productId, ...state.ids.filter((id) => id !== productId)].slice(0, 8),
        })),
    }),
    { name: "leor-recently-viewed" }
  )
);

// ——— Orders placed in this browser (demo persistence; backed by the API in production) ———

interface OrdersState {
  orders: Order[];
  place: (order: Order) => void;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      place: (order) => set((state) => ({ orders: [order, ...state.orders] })),
    }),
    { name: "leor-orders" }
  )
);

// ——— Lightweight demo session ———

export interface SessionUser {
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "ADMIN";
}

interface SessionState {
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "leor-session" }
  )
);

// ——— Notifications (demo) ———

interface NotificationState {
  items: AppNotification[];
  push: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markAllRead: () => void;
}

export const useNotifications = create<NotificationState>()(
  persist(
    (set) => ({
      items: [],
      push: (n) =>
        set((state) => ({
          items: [
            {
              ...n,
              id: `n-${state.items.length + 1}-${state.items.filter((x) => x.id).length}`,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.items,
          ].slice(0, 50),
        })),
      markAllRead: () =>
        set((state) => ({ items: state.items.map((i) => ({ ...i, read: true })) })),
    }),
    { name: "leor-notifications" }
  )
);
