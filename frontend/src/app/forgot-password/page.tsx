import type { Metadata } from "next";
import { ForgotPasswordClient } from "./forgot-client";

export const metadata: Metadata = {
  title: "Reset Password — LEOR",
  description: "Reset your LEOR account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
