import type { Metadata } from "next";
import { RegisterClient } from "./register-client";

export const metadata: Metadata = {
  title: "Create Account — LEOR",
  description: "Join LEOR and enjoy a curated gourmet experience.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
