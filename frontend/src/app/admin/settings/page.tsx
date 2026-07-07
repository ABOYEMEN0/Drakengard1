"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import {
  Bell,
  CreditCard,
  Globe,
  MessageCircle,
  Percent,
  Share2,
  Store,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const STORAGE_KEY = "leor-admin-settings";

interface AdminSettings {
  storeName: string;
  primaryColor: string;
  secondaryColor: string;
  whatsapp: string;
  email: string;
  phone: string;
  bankName: string;
  iban: string;
  codEnabled: boolean;
  shippingFee: string;
  freeShippingThreshold: string;
  taxEnabled: boolean;
  vatPercent: string;
  seoTitle: string;
  seoDescription: string;
  instagram: string;
  twitter: string;
  notifyNewOrder: boolean;
  notifyCancelledOrder: boolean;
  notifyLowStock: boolean;
  notifyCustomerMessage: boolean;
}

const DEFAULTS: AdminSettings = {
  storeName: "LEOR",
  primaryColor: "#0F2345",
  secondaryColor: "#D8B46A",
  whatsapp: "966500000000",
  email: "hello@leor.sa",
  phone: "+966 50 000 0000",
  bankName: "Al Rajhi Bank",
  iban: "SA00 0000 0000 0000 0000 0000",
  codEnabled: true,
  shippingFee: "25",
  freeShippingThreshold: "300",
  taxEnabled: true,
  vatPercent: "15",
  seoTitle: "LEOR — Fine Coffee, Chocolate & Gifts",
  seoDescription: "Premium coffee, chocolate, nuts and curated gift boxes, delivered across Saudi Arabia.",
  instagram: "@leor.sa",
  twitter: "@leor_sa",
  notifyNewOrder: true,
  notifyCancelledOrder: true,
  notifyLowStock: true,
  notifyCustomerMessage: false,
};

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-gold" : "bg-navy/15"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  onSave,
  children,
}: {
  icon: typeof Store;
  title: string;
  description: string;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <section className="card-luxe p-6" aria-label={title}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="font-display text-xl font-medium text-navy">{title}</h2>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex justify-end border-t border-line pt-4">
        <Button variant="gold" size="sm" onClick={onSave}>
          Save {title.toLowerCase()}
        </Button>
      </div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const push = useToast((s) => s.push);
  const [mounted, setMounted] = useState(false);
  const [s, setS] = useState<AdminSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<AdminSettings>) });
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  function set<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  function save(section: string) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      push(`${section} settings saved`);
    } catch {
      push("Could not persist settings", "info");
    }
  }

  if (!mounted) {
    return <div className="skeleton mx-auto h-40 max-w-4xl rounded-card" aria-hidden />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="eyebrow mb-2">Configuration</p>
        <h1 className="font-display text-3xl font-medium text-navy sm:text-4xl">Settings</h1>
      </div>

      <Section
        icon={Store}
        title="Store Identity"
        description="Name, logo and brand colors"
        onSave={() => save("Store identity")}
      >
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-card border border-line bg-ivory p-2">
            <Image src="/logo.svg" alt="Store logo preview" width={48} height={48} />
          </span>
          <p className="text-xs text-muted">Current logo (logo.svg)</p>
        </div>
        <Field label="Store name" htmlFor="st-name" required>
          <Input id="st-name" value={s.storeName} onChange={(e) => set("storeName", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary color" htmlFor="st-primary">
            <div className="flex items-center gap-2">
              <input
                id="st-primary"
                type="color"
                value={s.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-button border border-line bg-white p-1"
              />
              <Input aria-label="Primary color hex" value={s.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} />
            </div>
          </Field>
          <Field label="Secondary color" htmlFor="st-secondary">
            <div className="flex items-center gap-2">
              <input
                id="st-secondary"
                type="color"
                value={s.secondaryColor}
                onChange={(e) => set("secondaryColor", e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-button border border-line bg-white p-1"
              />
              <Input aria-label="Secondary color hex" value={s.secondaryColor} onChange={(e) => set("secondaryColor", e.target.value)} />
            </div>
          </Field>
        </div>
      </Section>

      <Section
        icon={MessageCircle}
        title="Contact & WhatsApp"
        description="How customers reach the store"
        onSave={() => save("Contact")}
      >
        <Field label="WhatsApp number" htmlFor="ct-wa" hint="international format, no +">
          <Input id="ct-wa" value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="ct-email">
            <Input id="ct-email" type="email" value={s.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone" htmlFor="ct-phone">
            <Input id="ct-phone" value={s.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section
        icon={CreditCard}
        title="Payments"
        description="Bank transfer details and cash on delivery"
        onSave={() => save("Payment")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bank name" htmlFor="pm-bank">
            <Input id="pm-bank" value={s.bankName} onChange={(e) => set("bankName", e.target.value)} />
          </Field>
          <Field label="IBAN" htmlFor="pm-iban">
            <Input id="pm-iban" value={s.iban} onChange={(e) => set("iban", e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-card border border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium text-navy">Cash on Delivery</p>
            <p className="text-xs text-muted">Allow customers to pay when the order arrives</p>
          </div>
          <Switch checked={s.codEnabled} onChange={(v) => set("codEnabled", v)} label="Enable cash on delivery" />
        </div>
      </Section>

      <Section
        icon={Truck}
        title="Shipping"
        description="Delivery fee and free-shipping threshold"
        onSave={() => save("Shipping")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Shipping fee (SAR)" htmlFor="sh-fee">
            <Input id="sh-fee" type="number" min="0" value={s.shippingFee} onChange={(e) => set("shippingFee", e.target.value)} />
          </Field>
          <Field label="Free shipping threshold (SAR)" htmlFor="sh-free">
            <Input id="sh-free" type="number" min="0" value={s.freeShippingThreshold} onChange={(e) => set("freeShippingThreshold", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section icon={Percent} title="Tax" description="VAT applied at checkout" onSave={() => save("Tax")}>
        <div className="flex items-center justify-between rounded-card border border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium text-navy">Enable VAT</p>
            <p className="text-xs text-muted">Apply value-added tax to orders</p>
          </div>
          <Switch checked={s.taxEnabled} onChange={(v) => set("taxEnabled", v)} label="Enable VAT" />
        </div>
        <Field label="VAT (%)" htmlFor="tx-vat">
          <Input
            id="tx-vat"
            type="number"
            min="0"
            max="100"
            value={s.vatPercent}
            onChange={(e) => set("vatPercent", e.target.value)}
            disabled={!s.taxEnabled}
          />
        </Field>
      </Section>

      <Section icon={Globe} title="SEO" description="Storefront metadata" onSave={() => save("SEO")}>
        <Field label="Site title" htmlFor="seo-title">
          <Input id="seo-title" value={s.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        </Field>
        <Field label="Meta description" htmlFor="seo-desc">
          <Input id="seo-desc" value={s.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
        </Field>
      </Section>

      <Section icon={Share2} title="Social" description="Public profiles" onSave={() => save("Social")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram" htmlFor="so-ig">
            <Input id="so-ig" value={s.instagram} onChange={(e) => set("instagram", e.target.value)} />
          </Field>
          <Field label="Twitter / X" htmlFor="so-tw">
            <Input id="so-tw" value={s.twitter} onChange={(e) => set("twitter", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section
        icon={Bell}
        title="Notifications"
        description="What the team gets alerted about"
        onSave={() => save("Notification")}
      >
        {(
          [
            ["notifyNewOrder", "New order", "Alert when a customer places an order"],
            ["notifyCancelledOrder", "Cancelled order", "Alert when an order is cancelled"],
            ["notifyLowStock", "Low stock", "Alert when a product falls below its threshold"],
            ["notifyCustomerMessage", "Customer message", "Alert when a customer sends a message"],
          ] as const
        ).map(([key, label, hint]) => (
          <div key={key} className="flex items-center justify-between rounded-card border border-line px-4 py-3">
            <div>
              <p className="text-sm font-medium text-navy">{label}</p>
              <p className="text-xs text-muted">{hint}</p>
            </div>
            <Switch checked={s[key]} onChange={(v) => set(key, v)} label={`${label} notifications`} />
          </div>
        ))}
      </Section>
    </div>
  );
}
