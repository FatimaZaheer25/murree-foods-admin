"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { safeNext } from "../../lib/authLinks";

// Login ho chuka hai (abhi ya pehle se): ?next= wale page par, warna home (panels mein home hi Dashboard hai).
// Login form ka redirect bhi yahi hai, taake do jagah se page na badle
export function useRedirectIfLoggedIn(next: string | null) {
  const { user } = useAuth();
  const router = useRouter();
  const target = safeNext(next);

  useEffect(() => {
    if (user) router.replace(target);
  }, [user, router, target]);
}
