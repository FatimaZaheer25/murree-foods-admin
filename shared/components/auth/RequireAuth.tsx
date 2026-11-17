"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";

// Sirf login user ke liye. Pata chalne tak loader, page ka kuch nahi (flicker nahi).
// Har app ki apni cookie hai aur backend sirf usi app ka role maanta hai (admin app mein sirf admin waghera),
// is liye yahan role check ki zaroorat nahi. Login na ho to /login?next=...
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div role="status" aria-label="Loading" className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forest-700" />
      </div>
    );
  }

  return children;
}
