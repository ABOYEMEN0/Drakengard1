"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/store";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+?966|0)?5\d{8}$/;

type Errors = Partial<Record<"name" | "email" | "phone" | "password" | "confirm", string>>;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-[#B42318]">
      {message}
    </p>
  );
}

export function RegisterClient() {
  const router = useRouter();
  const login = useSession((s) => s.login);
  const toast = useToast((s) => s.push);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!PHONE_RE.test(form.phone.replace(/\s/g, ""))) next.phone = "Enter a valid Saudi mobile (05XXXXXXXX).";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    login({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: "CUSTOMER" });
    toast("Welcome to LEOR — your account is ready.");
    router.push("/account");
  };

  return (
    <AuthCard title="Create Account" subtitle="Join the maison for a curated gourmet experience.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <Field label="Full name" htmlFor="reg-name" required>
            <Input
              id="reg-name"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "reg-name-error" : undefined}
            />
          </Field>
          <FieldError id="reg-name-error" message={errors.name} />
        </div>
        <div>
          <Field label="Email" htmlFor="reg-email" required>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "reg-email-error" : undefined}
            />
          </Field>
          <FieldError id="reg-email-error" message={errors.email} />
        </div>
        <div>
          <Field label="Mobile number" htmlFor="reg-phone" required hint="05XXXXXXXX">
            <Input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={set("phone")}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "reg-phone-error" : undefined}
            />
          </Field>
          <FieldError id="reg-phone-error" message={errors.phone} />
        </div>
        <div>
          <Field label="Password" htmlFor="reg-password" required hint="min. 8 characters">
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? "reg-password-error" : undefined}
            />
          </Field>
          <FieldError id="reg-password-error" message={errors.password} />
        </div>
        <div>
          <Field label="Confirm password" htmlFor="reg-confirm" required>
            <Input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={set("confirm")}
              aria-invalid={errors.confirm ? true : undefined}
              aria-describedby={errors.confirm ? "reg-confirm-error" : undefined}
            />
          </Field>
          <FieldError id="reg-confirm-error" message={errors.confirm} />
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full">
          Create Account
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-gold-600 hover:text-gold-700">Terms</Link> and{" "}
          <Link href="/privacy" className="text-gold-600 hover:text-gold-700">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gold-600 hover:text-gold-700">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
