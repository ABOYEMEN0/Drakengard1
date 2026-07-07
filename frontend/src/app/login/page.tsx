import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Sign In — LEOR",
  description: "Sign in to your LEOR account.",
};

export default function LoginPage() {
  return <LoginClient />;
}
