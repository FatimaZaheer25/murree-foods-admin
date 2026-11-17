"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiError } from "../../lib/api";
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  riderLogin as riderLoginRequest,
  type LoginInput,
  type RiderLoginInput,
} from "../../lib/auth";
import type { AuthUser } from "../../types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean; // /me ka jawab abhi nahi aaya
  login: (input: LoginInput) => Promise<void>;
  loginRider: (input: RiderLoginInput) => Promise<AuthUser>;
  logout: (to?: string) => Promise<void>; // to: logout ke baad kahan (panels: /login)
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    () =>
      getMe().then(
        ({ user: current }) => setUser(current),
        (e) => {
          // Sirf 401 ka matlab logged out hai. Internet ka masla ho to jo pata hai wahi rehne do
          if (e instanceof ApiError && e.status === 401) setUser(null);
        }
      ),
    []
  );

  // Page khulne par poochho: kaun login hai?
  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  async function login(input: LoginInput) {
    const { user: current } = await loginRequest(input);
    setUser(current);
  }

  async function loginRider(input: RiderLoginInput) {
    const { user: current } = await riderLoginRequest(input);
    setUser(current);
    return current;
  }

  // Poora page dobara load: Next pichle pages (checkout waghera) ko chhupa kar yaad rakhta hai,
  // logout ke baad un ka kuch bhi memory mein na bache
  async function logout(to = "/") {
    await logoutRequest();
    // Yahan poora reload hi chahiye (Next ka client navigation nahi)
    window.location.assign(to);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginRider, logout, refresh }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth ko AuthProvider ke andar istemal karein");
  return auth;
}
