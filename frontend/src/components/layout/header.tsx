"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart, useSession, useWishlist } from "@/lib/store";
import { cn } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useWishlist((s) => s.ids.length);
  const user = useSession((s) => s.user);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ivory/90 backdrop-blur-md">
      <div className="bg-navy py-2 text-center text-[11px] tracking-wider2 text-ivory/90">
        Complimentary delivery on orders over {FREE_SHIPPING_THRESHOLD} SAR
      </div>

      <div className="container-page flex h-[76px] items-center justify-between gap-4">
        <button
          className="flex h-10 w-10 items-center justify-center text-navy lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" aria-label="LEOR home" className="shrink-0">
          <Image src="/logo.svg" alt="LEOR" width={132} height={56} priority className="h-12 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative text-sm tracking-wide text-ink transition-colors hover:text-gold-700",
                pathname === item.href &&
                  "text-navy after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-gold"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-navy/5"
          >
            <Search size={19} />
          </button>
          <Link
            href="/wishlist"
            aria-label={`Wishlist${mounted && wishlistCount ? `, ${wishlistCount} items` : ""}`}
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-navy/5 sm:flex"
          >
            <Heart size={19} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-navy">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            aria-label={user ? "My account" : "Sign in"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-navy/5"
          >
            <User size={19} />
          </Link>
          <Link
            href="/cart"
            aria-label={`Shopping bag${mounted && cartCount ? `, ${cartCount} items` : ""}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-navy/5"
          >
            <ShoppingBag size={19} />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-navy">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line/70 bg-cream"
          >
            <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-4">
              <Search size={18} className="text-muted" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coffee, chocolate, nuts, SKU…"
                aria-label="Search products"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/60"
              />
              <button type="submit" className="text-xs font-medium uppercase tracking-wider2 text-gold-600 hover:text-gold-700">
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line/70 bg-cream lg:hidden"
            aria-label="Mobile"
          >
            <div className="container-page flex flex-col py-4">
              {[...NAV, { href: "/wishlist", label: "Wishlist" }, { href: "/track-order", label: "Track Order" }, { href: "/faq", label: "FAQ" }].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "border-b border-line/50 py-3.5 text-sm tracking-wide text-ink last:border-0",
                    pathname === item.href && "text-gold-700"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
