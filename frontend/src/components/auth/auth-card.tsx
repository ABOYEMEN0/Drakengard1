import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";

/** Shared centered card layout for login / register / forgot-password. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-14 sm:py-20">
      <Reveal className="w-full max-w-md">
        <div className="card-luxe p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" aria-label="LEOR home">
              <Image src="/logo.svg" alt="LEOR" width={96} height={32} className="mb-5" />
            </Link>
            <h1 className="heading-md mb-2">{title}</h1>
            <span className="gold-rule mb-3" aria-hidden />
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </Reveal>
    </div>
  );
}
