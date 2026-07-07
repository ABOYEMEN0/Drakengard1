"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Boxes,
  FileText,
  FolderTree,
  LayoutDashboard,
  LineChart,
  Lock,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import { ADMIN_ORDERS } from "@/lib/admin-data";
import { useSession } from "@/lib/store";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
  { label: "Reports", href: "/admin/reports", icon: LineChart },
  { label: "Settings", href: "/admin/settings", icon: Settings },
] as const;

interface AdminNotification {
  id: string;
  title: string;
  body: string;
  at: string;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const user = useSession((s) => s.user);
  const logout = useSession((s) => s.logout);

  useEffect(() => setMounted(true), []);
  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const notifications = useMemo<AdminNotification[]>(() => {
    const items: AdminNotification[] = [];
    const latest = ADMIN_ORDERS[0];
    if (latest) {
      items.push({
        id: "n-order",
        title: "New order received",
        body: `${latest.orderNumber} — ${latest.customer.name}`,
        at: latest.createdAt,
      });
    }
    for (const p of PRODUCTS.filter((x) => x.stock <= x.lowStockThreshold).slice(0, 5)) {
      items.push({
        id: `n-stock-${p.id}`,
        title: p.stock === 0 ? "Out of stock" : "Low stock alert",
        body: `${p.name} — ${p.stock} left (threshold ${p.lowStockThreshold})`,
        at: p.createdAt,
      });
    }
    return items;
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <div className="skeleton h-10 w-40" aria-hidden />
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-5">
        <div className="card-luxe w-full max-w-md p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/5">
            <Lock size={26} className="text-gold-600" strokeWidth={1.5} />
          </div>
          <h1 className="heading-md mb-3">Admin access required</h1>
          <p className="mb-8 text-sm leading-relaxed text-muted">
            This area is reserved for the LEOR team. Please sign in with an
            administrator account — hint: <span className="font-medium text-navy">admin@leor.sa</span>.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login">
              <Button variant="gold">Go to login</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to store</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sidebarNav = (
    <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-6">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-gold/15 text-gold"
                : "text-ivory/65 hover:bg-white/5 hover:text-ivory"
            )}
          >
            <Icon size={18} strokeWidth={1.75} className={cn(active && "text-gold")} />
            <span className="lg:inline md:hidden">{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const unread = notifications.length;

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Desktop / tablet sidebar */}
      <aside className="sticky top-0 hidden h-screen w-16 shrink-0 flex-col bg-navy md:flex lg:w-60">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5 lg:px-5">
          <Image src="/logo-mark.svg" alt="LEOR" width={32} height={32} className="shrink-0" />
          <span className="hidden font-display text-lg font-medium tracking-wide text-ivory lg:inline">
            LEOR <span className="text-gold">Admin</span>
          </span>
        </div>
        {sidebarNav}
        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-button px-3 py-2.5 text-sm text-ivory/65 transition-colors hover:bg-white/5 hover:text-ivory"
          >
            <LogOut size={18} strokeWidth={1.75} />
            <span className="hidden lg:inline">Back to store</span>
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-navy-900/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-navy shadow-lift">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <span className="flex items-center gap-3">
                <Image src="/logo-mark.svg" alt="LEOR" width={30} height={30} />
                <span className="font-display text-lg text-ivory">
                  LEOR <span className="text-gold">Admin</span>
                </span>
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className="text-ivory/60 hover:text-ivory"
              >
                <X size={20} />
              </button>
            </div>
            <div className="[&_span]:!inline">{sidebarNav}</div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              className="rounded-button p-2 text-navy hover:bg-navy/5 md:hidden"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden max-w-xs flex-1 sm:block">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search admin…"
                aria-label="Search admin"
                className="input-luxe h-10 py-0 pl-10"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative" ref={bellRef}>
                <button
                  aria-label={`Notifications (${unread})`}
                  aria-expanded={bellOpen}
                  onClick={() => setBellOpen((v) => !v)}
                  className="relative rounded-button p-2.5 text-navy transition-colors hover:bg-navy/5"
                >
                  <Bell size={19} strokeWidth={1.75} />
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-navy">
                      {unread}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-card border border-line bg-white shadow-lift">
                    <p className="border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wider2 text-navy">
                      Notifications
                    </p>
                    <ul className="max-h-80 overflow-auto py-1">
                      {notifications.map((n) => (
                        <li key={n.id} className="px-4 py-3 transition-colors hover:bg-ivory">
                          <p className="text-sm font-medium text-navy">{n.title}</p>
                          <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                          <p className="mt-1 text-[11px] text-muted/70">{formatDateTime(n.at)}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2.5 rounded-button border border-line bg-white px-3 py-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy font-display text-sm text-gold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-semibold text-navy">{user.name}</span>
                  <span className="block text-[11px] text-muted">Administrator</span>
                </span>
                <button
                  aria-label="Sign out"
                  onClick={() => logout()}
                  className="ml-1 hidden text-muted transition-colors hover:text-navy sm:block"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
