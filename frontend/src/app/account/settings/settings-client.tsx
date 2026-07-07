"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const PREFS_KEY = "leor-notify-prefs";

interface Prefs {
  orderUpdates: boolean;
  offers: boolean;
  newsletter: boolean;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-navy">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-gold" : "bg-line"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all duration-300",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}

export function SettingsClient() {
  const { user, login } = useSession();
  const toast = useToast((s) => s.push);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>({ orderUpdates: true, offers: true, newsletter: false });

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(PREFS_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch {
      // keep defaults
    }
  }, []);

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email, phone: user.phone ?? "" });
  }, [user]);

  if (!mounted) return null;

  const savePrefs = (next: Prefs) => {
    setPrefs(next);
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-8">
      <section className="card-luxe p-6 sm:p-8" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="heading-md mb-1">Profile</h2>
        <p className="mb-6 text-sm text-muted">Your personal details, used for orders and invoices.</p>
        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!profile.name.trim() || !profile.email.includes("@")) {
              toast("Please enter a valid name and email", "info");
              return;
            }
            login({
              name: profile.name.trim(),
              email: profile.email.trim(),
              phone: profile.phone.trim() || undefined,
              role: user?.role ?? "CUSTOMER",
            });
            toast("Profile updated");
          }}
        >
          <Field label="Full name" htmlFor="set-name" required>
            <Input
              id="set-name"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              autoComplete="name"
            />
          </Field>
          <Field label="Email" htmlFor="set-email" required>
            <Input
              id="set-email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
          </Field>
          <Field label="Mobile number" htmlFor="set-phone" hint="05XXXXXXXX">
            <Input
              id="set-phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              autoComplete="tel"
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" variant="gold">Save Profile</Button>
          </div>
        </form>
      </section>

      <section className="card-luxe p-6 sm:p-8" aria-labelledby="password-heading">
        <h2 id="password-heading" className="heading-md mb-1">Password</h2>
        <p className="mb-6 text-sm text-muted">Choose a strong password of at least 8 characters.</p>
        <form
          className="grid gap-5 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (pw.next.length < 8) {
              setPwError("New password must be at least 8 characters.");
              return;
            }
            if (pw.next !== pw.confirm) {
              setPwError("Passwords do not match.");
              return;
            }
            setPwError(null);
            setPw({ current: "", next: "", confirm: "" });
            toast("Password changed");
          }}
        >
          <Field label="Current password" htmlFor="pw-current" required>
            <Input
              id="pw-current"
              type="password"
              autoComplete="current-password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
            />
          </Field>
          <Field label="New password" htmlFor="pw-next" required>
            <Input
              id="pw-next"
              type="password"
              autoComplete="new-password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
            />
          </Field>
          <Field label="Confirm new password" htmlFor="pw-confirm" required>
            <Input
              id="pw-confirm"
              type="password"
              autoComplete="new-password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
            />
          </Field>
          {pwError && (
            <p role="alert" className="text-xs text-[#B42318] sm:col-span-3">{pwError}</p>
          )}
          <div className="sm:col-span-3">
            <Button type="submit" variant="outline">Update Password</Button>
          </div>
        </form>
      </section>

      <section className="card-luxe p-6 sm:p-8" aria-labelledby="prefs-heading">
        <h2 id="prefs-heading" className="heading-md mb-1">Notifications</h2>
        <p className="mb-2 text-sm text-muted">Choose what LEOR may send you.</p>
        <div className="divide-y divide-line">
          <Toggle
            label="Order updates"
            description="Status changes for your orders — confirmed, out for delivery, delivered."
            checked={prefs.orderUpdates}
            onChange={(v) => savePrefs({ ...prefs, orderUpdates: v })}
          />
          <Toggle
            label="Private offers"
            description="Seasonal editions and members-only pricing."
            checked={prefs.offers}
            onChange={(v) => savePrefs({ ...prefs, offers: v })}
          />
          <Toggle
            label="Newsletter"
            description="Occasional letters from the roastery and atelier."
            checked={prefs.newsletter}
            onChange={(v) => savePrefs({ ...prefs, newsletter: v })}
          />
        </div>
      </section>
    </div>
  );
}
