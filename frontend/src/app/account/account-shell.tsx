"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  UserRound,
} from "lucide-react";
import { useSession } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/invoices", label: "Invoices", icon: FileText },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/settings", label: "Settings", icon: Settings },
] as const;

export function AccountShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const isActive = (href: string) =>
    href === "/account" ? pathname === "/account" : pathname.startsWith(href);

  if (!mounted) {
    return (
      <div className="container-page py-16">
        <div className="skeleton h-64 w-full" aria-hidden />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page py-20">
        <div className="card-luxe mx-auto flex max-w-md flex-col items-center px-8 py-14 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/5">
            <UserRound size={26} className="text-gold-600" strokeWidth={1.5} />
          </div>
          <h1 className="heading-md mb-2">Sign in to your account</h1>
          <p className="mb-8 text-sm text-muted">
            Access your orders, invoices, addresses and preferences.
          </p>
          <Link href="/login">
            <Button variant="gold">Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
        <aside>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy font-display text-lg text-gold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-medium text-navy">{user.name}</p>
              <Badge variant="gold" className="mt-0.5">Gold tier</Badge>
            </div>
          </div>

          <nav aria-label="Account" className="-mx-5 sm:mx-0">
            <ul className="flex gap-1 overflow-x-auto px-5 pb-2 sm:px-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <li key={href} className="shrink-0">
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 whitespace-nowrap rounded-button px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                        active
                          ? "bg-gold/10 text-navy shadow-soft ring-1 ring-gold/40"
                          : "text-muted hover:bg-navy/5 hover:text-navy"
                      )}
                    >
                      <Icon size={17} strokeWidth={1.75} className={cn(active && "text-gold-600")} />
                      {label}
                    </Link>
                  </li>
                );
              })}
              <li className="shrink-0 lg:mt-4 lg:border-t lg:border-line lg:pt-4">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="flex w-full items-center gap-3 whitespace-nowrap rounded-button px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  <LogOut size={17} strokeWidth={1.75} />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
