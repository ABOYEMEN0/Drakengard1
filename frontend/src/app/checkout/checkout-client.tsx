"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Banknote, Landmark, Lock, MessageCircle } from "lucide-react";
import { useCart, useNotifications, useOrders } from "@/lib/store";
import { buildLocalOrder, computeTotals } from "@/lib/order-utils";
import { formatPrice, cn } from "@/lib/utils";
import { CustomerInfo, PaymentMethod } from "@/lib/types";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Reveal } from "@/components/ui/reveal";

const SAUDI_CITIES = [
  "Riyadh",
  "Jeddah",
  "Makkah",
  "Madinah",
  "Dammam",
  "Khobar",
  "Dhahran",
  "Taif",
  "Buraidah",
  "Tabuk",
  "Abha",
  "Hail",
  "Jubail",
  "Yanbu",
  "Najran",
  "Jazan",
];

const PHONE_RE = /^(\+?966|0)?5\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  notes: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

export function CheckoutClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, coupon, clear } = useCart();
  const placeOrder = useOrders((s) => s.place);
  const pushNotification = useNotifications((s) => s.push);

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && items.length === 0 && !submitting) {
      router.replace("/cart");
    }
  }, [mounted, items.length, submitting, router]);

  if (!mounted || items.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="skeleton h-8 w-48" />
      </div>
    );
  }

  const totals = computeTotals(items, coupon);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Please enter your full name.";
    if (!form.phone.trim()) next.phone = "Please enter your mobile number.";
    else if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, "")))
      next.phone = "Enter a valid Saudi mobile number, e.g. 05XXXXXXXX.";
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!form.city) next.city = "Please choose your city.";
    if (!form.district.trim()) next.district = "Please enter your district.";
    if (!form.address.trim()) next.address = "Please enter your street address.";
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).some((k) => next[k as keyof FormState])) {
      setErrors(next);
      return;
    }
    setSubmitting(true);
    const customer: CustomerInfo = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      city: form.city,
      district: form.district.trim(),
      address: form.address.trim(),
      notes: form.notes.trim() || undefined,
    };
    const order = buildLocalOrder({ items, customer, paymentMethod, coupon });
    placeOrder(order);
    pushNotification({
      title: "Order placed",
      body: `Order ${order.orderNumber} has been received and is pending confirmation.`,
      type: "order",
    });
    clear();
    router.push(`/order-confirmation/${order.orderNumber}`);
  };

  const errorText = (key: keyof FormState) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="mt-1.5 text-xs text-[#B42318]">
        {errors[key]}
      </p>
    ) : null;

  const invalidProps = (key: keyof FormState) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
    className: errors[key] ? "border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]" : undefined,
  });

  return (
    <div className="container-page py-12 sm:py-16">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <Reveal>
        <p className="eyebrow mb-2">Almost There</p>
        <h1 className="heading-lg mb-10">Checkout</h1>
      </Reveal>

      <form onSubmit={handleSubmit} noValidate className="grid gap-10 lg:grid-cols-5">
        {/* Form column */}
        <div className="space-y-10 lg:col-span-3">
          <section aria-labelledby="customer-info" className="card-luxe p-6 sm:p-8">
            <h2 id="customer-info" className="mb-6 font-display text-xl text-navy">
              Delivery Details
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full name" htmlFor="name" required>
                  <Input
                    id="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set("name")(e.target.value)}
                    {...invalidProps("name")}
                  />
                </Field>
                {errorText("name")}
              </div>
              <div>
                <Field label="Mobile number" htmlFor="phone" required hint="e.g. 05XXXXXXXX">
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="05XXXXXXXX"
                    value={form.phone}
                    onChange={(e) => set("phone")(e.target.value)}
                    {...invalidProps("phone")}
                  />
                </Field>
                {errorText("phone")}
              </div>
              <div>
                <Field label="Email" htmlFor="email" hint="optional">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                    {...invalidProps("email")}
                  />
                </Field>
                {errorText("email")}
              </div>
              <div>
                <Field label="City" htmlFor="city" required>
                  <Select
                    id="city"
                    value={form.city}
                    onChange={(e) => set("city")(e.target.value)}
                    {...invalidProps("city")}
                  >
                    <option value="" disabled>
                      Select a city…
                    </option>
                    {SAUDI_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
                {errorText("city")}
              </div>
              <div>
                <Field label="District" htmlFor="district" required>
                  <Input
                    id="district"
                    autoComplete="address-level3"
                    value={form.district}
                    onChange={(e) => set("district")(e.target.value)}
                    {...invalidProps("district")}
                  />
                </Field>
                {errorText("district")}
              </div>
              <div className="sm:col-span-2">
                <Field label="Street address" htmlFor="address" required>
                  <Input
                    id="address"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => set("address")(e.target.value)}
                    {...invalidProps("address")}
                  />
                </Field>
                {errorText("address")}
              </div>
              <div className="sm:col-span-2">
                <Field label="Order notes" htmlFor="notes" hint="optional">
                  <Textarea
                    id="notes"
                    placeholder="Gift message, delivery instructions…"
                    value={form.notes}
                    onChange={(e) => set("notes")(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section aria-labelledby="payment-method" className="card-luxe p-6 sm:p-8">
            <h2 id="payment-method" className="mb-6 font-display text-xl text-navy">
              Payment Method
            </h2>
            <fieldset>
              <legend className="sr-only">Choose a payment method</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    {
                      value: "COD" as const,
                      icon: Banknote,
                      title: "Cash on Delivery",
                      description: "Pay in cash when your order arrives at your door.",
                    },
                    {
                      value: "BANK_TRANSFER" as const,
                      icon: Landmark,
                      title: "Bank Transfer",
                      description: "Transfer to our account and share the receipt via WhatsApp.",
                    },
                  ]
                ).map(({ value, icon: Icon, title, description }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer gap-4 rounded-card border p-5 transition-all duration-300",
                      paymentMethod === value
                        ? "border-gold bg-gold/5 shadow-gold"
                        : "border-line bg-white hover:border-gold/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                        paymentMethod === value
                          ? "border-gold/60 bg-gold/15 text-gold-600"
                          : "border-line text-muted"
                      )}
                    >
                      <Icon size={19} strokeWidth={1.5} />
                    </span>
                    <span>
                      <span className="block font-medium text-navy">{title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                        {description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {paymentMethod === "BANK_TRANSFER" && (
              <div className="mt-5 rounded-card border border-gold/40 bg-gold/5 p-5">
                <p className="eyebrow mb-2">Transfer Details</p>
                <p className="font-display text-lg tracking-wide text-navy">
                  SA00 0000 0000 0000 0000 0000
                </p>
                <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted">
                  <MessageCircle size={14} className="mt-0.5 shrink-0 text-gold-600" />
                  After completing the transfer, please send the receipt via WhatsApp so we can
                  confirm your order promptly.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Summary column */}
        <div className="lg:col-span-2">
          <Reveal className="card-luxe sticky top-24 p-6 sm:p-8">
            <h2 className="mb-6 font-display text-xl text-navy">Your Order</h2>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4">
                  <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-button border border-line bg-cream">
                    <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-navy">
                    {item.name}
                    <span className="block text-xs text-muted">Qty {item.quantity}</span>
                  </span>
                  <span className="text-sm font-medium tabular-nums text-navy">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-navy">{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">
                    Discount{coupon ? ` (${coupon.code})` : ""}
                  </dt>
                  <dd className="tabular-nums text-success">−{formatPrice(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className={totals.shipping === 0 ? "font-medium text-success" : "tabular-nums text-navy"}>
                  {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 text-base">
                <dt className="font-medium text-navy">Total</dt>
                <dd className="font-display text-lg font-semibold tabular-nums text-navy">
                  {formatPrice(totals.total)}
                </dd>
              </div>
            </dl>
            <Button type="submit" variant="gold" size="lg" className="mt-6 w-full" disabled={submitting}>
              {submitting ? "Placing order…" : "Place Order"}
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Lock size={12} />
              Your details are used only to fulfil this order.
            </p>
            <Link
              href="/cart"
              className="mt-3 block text-center text-xs font-medium text-gold-600 hover:text-gold-700"
            >
              Back to cart
            </Link>
          </Reveal>
        </div>
      </form>
    </div>
  );
}
