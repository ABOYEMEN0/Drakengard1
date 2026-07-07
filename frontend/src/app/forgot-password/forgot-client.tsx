"use client";

import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard title="Check Your Inbox" subtitle="Instructions are on their way.">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/5">
            <MailCheck size={26} className="text-gold-600" strokeWidth={1.5} />
          </div>
          <p className="mb-8 text-sm leading-relaxed text-muted">
            If an account exists for <span className="font-medium text-navy">{email}</span>, we&apos;ve
            sent a link to reset your password. It expires in 30 minutes.
          </p>
          <Link href="/login" className="w-full">
            <Button variant="outline" size="lg" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset Password" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <Field label="Email" htmlFor="fp-email" required>
            <Input
              id="fp-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "fp-email-error" : undefined}
            />
          </Field>
          {error && (
            <p id="fp-email-error" role="alert" className="mt-1.5 text-xs text-[#B42318]">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" variant="gold" size="lg" className="w-full">
          Send Reset Link
        </Button>
      </form>
      <p className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-gold-600 hover:text-gold-700">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
