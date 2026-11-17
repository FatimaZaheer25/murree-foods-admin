import type { Metadata } from "next";
import Link from "next/link";
import { AuthBackdrop } from "@murree/shared/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Page not found — MurreeFoods Admin",
};

// Ghalat URL (jaise /xyz)
export default function NotFound() {
  return (
    <AuthBackdrop className="min-h-screen">
      <div className="relative w-full max-w-md rounded-[1.75rem] border border-cream-200 bg-white p-8 text-center shadow-lift">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">404</p>
        <h1 className="mt-2 font-display text-2xl text-charcoal">Page not found</h1>
        <p className="mt-2 text-sm text-charcoal-400">This page does not exist in the admin panel.</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-forest-800 px-6 text-sm font-semibold text-white hover:bg-forest-900"
        >
          Go to Dashboard
        </Link>
      </div>
    </AuthBackdrop>
  );
}
