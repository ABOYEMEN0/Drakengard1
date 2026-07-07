"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop?category=coffee", label: "Coffee" },
      { href: "/shop?category=chocolate", label: "Chocolate" },
      { href: "/shop?category=nuts", label: "Nuts" },
      { href: "/shop?category=accessories", label: "Accessories" },
      { href: "/shop?category=gift-boxes", label: "Gift Boxes" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { href: "/track-order", label: "Track Your Order" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact Us" },
      { href: "/account", label: "My Account" },
      { href: "/wishlist", label: "Wishlist" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About LEOR" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const toast = useToast((s) => s.push);

  function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    toast("Welcome to the LEOR circle — you're subscribed.");
    setEmail("");
  }

  return (
    <footer className="mt-24 bg-navy text-ivory">
      <div className="border-b border-ivory/10">
        <div className="container-page flex flex-col items-center gap-6 py-14 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="max-w-md">
            <p className="eyebrow mb-2 text-gold">The LEOR Circle</p>
            <h2 className="font-display text-2xl font-medium text-ivory sm:text-3xl">
              First access to rare lots &amp; seasonal editions
            </h2>
          </div>
          <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-12 flex-1 rounded-button border border-ivory/20 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="h-12 rounded-button bg-gold px-6 text-sm font-medium text-navy transition-colors hover:bg-gold-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="container-page grid grid-cols-2 gap-10 py-14 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2 md:col-span-4 lg:col-span-2">
          <Image src="/logo-light.svg" alt="LEOR" width={150} height={64} className="mb-5 h-14 w-auto" />
          <p className="mb-6 max-w-xs text-sm leading-relaxed text-ivory/60">
            A maison of premium coffee, chocolate and gourmet indulgences —
            crafted with restraint, delivered with care across the Kingdom.
          </p>
          <div className="space-y-2.5 text-sm text-ivory/70">
            <p className="flex items-center gap-2.5">
              <MapPin size={15} className="text-gold" /> Riyadh, Saudi Arabia
            </p>
            <p className="flex items-center gap-2.5">
              <Phone size={15} className="text-gold" /> +966 50 000 0000
            </p>
            <p className="flex items-center gap-2.5">
              <Mail size={15} className="text-gold" /> care@leor.sa
            </p>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-4 font-body text-xs font-semibold uppercase tracking-luxe text-gold">
              {col.title}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ivory/70 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-ivory/50">
            © {new Date().getFullYear()} LEOR. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" aria-label="Instagram" className="text-ivory/60 transition-colors hover:text-gold" rel="noopener noreferrer" target="_blank">
              <Instagram size={17} />
            </a>
            <a href="https://twitter.com" aria-label="Twitter" className="text-ivory/60 transition-colors hover:text-gold" rel="noopener noreferrer" target="_blank">
              <Twitter size={17} />
            </a>
          </div>
          <p className="text-xs text-ivory/50">Cash on Delivery · Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}
