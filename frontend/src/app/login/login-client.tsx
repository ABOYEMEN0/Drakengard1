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

export function LoginClient() {
  const router = useRouter();
  const login = useSession((s) => s.login);
  const toast = useToast((s) => s.push);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Please enter your password.";
    setErrors(next);
    if (next.email || next.password) return;

    const isAdmin = email.trim().toLowerCase().startsWith("admin");
    const name = email.trim().split("@")[0].replace(/[._-]/g, " ");
    login({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email.trim(),
      role: isAdmin ? "ADMIN" : "CUSTOMER",
    });
    toast(isAdmin ? "Welcome back, admin" : "Welcome back to LEOR");
    router.push(isAdmin ? "/admin" : "/account");
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to continue your LEOR journey.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((er) => ({ ...er, email: undefined }));
              }}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </Field>
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1.5 text-xs text-[#B42318]">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <Field label="Password" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((er) => ({ ...er, password: undefined }));
              }}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
          </Field>
          {errors.password && (
            <p id="password-error" role="alert" className="mt-1.5 text-xs text-[#B42318]">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-gold-600 hover:text-gold-700"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full">
          Sign In
        </Button>

        <p className="rounded-button bg-navy/5 px-3 py-2 text-center text-xs text-muted">
          Demo: use <span className="font-medium text-navy">admin@leor.sa</span> for the admin role.
        </p>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">
        New to LEOR?{" "}
        <Link href="/register" className="font-medium text-gold-600 hover:text-gold-700">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
