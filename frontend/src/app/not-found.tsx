import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[65vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow mb-4">Lost in the Maison</p>
      <h1 className="font-display text-8xl font-medium leading-none text-navy sm:text-9xl">404</h1>
      <span className="gold-rule my-8" aria-hidden />
      <p className="mb-10 max-w-md text-sm leading-relaxed text-muted sm:text-base">
        The page you're looking for has been moved, retired, or never existed.
        The collection, however, is exactly where you left it.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button variant="primary">Return home</Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline">Browse the shop</Button>
        </Link>
      </div>
    </div>
  );
}
