"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { appUrl } from "../../lib/apps";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
import NewOrderAlerts, { type OrderAlertSource } from "./NewOrderAlerts";

export type PanelNavItem = { href: string; label: string; icon: LucideIcon };

type Props = {
  nav: PanelNavItem[];
  note: string; // sidebar ke neeche, jaise "Rider panel"
  logoutTo: string; // logout ke baad kahan (is app ka login page)
  alerts?: OrderAlertSource; // naye order ki ghanti (na ho to band). load ek hi function rahe (har render naya nahi)
  children: React.ReactNode;
};

// "Fatima Khan" -> "FK"
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

// Sidebar ke neeche: kaun login hai + Logout (sirf is app ki cookie khatam, phir login page)
function AccountCard({ note, logoutTo }: { note: string; logoutTo: string }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white"
      >
        {user ? initials(user.name) : "·"}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-semibold text-white" title={user?.name}>
          {user?.name ?? "…"}
        </p>
        <p className="truncate text-xs text-white/50">{note}</p>
      </div>
      <button
        type="button"
        onClick={() => logout(logoutTo)}
        title="Logout"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Logout</span>
      </button>
    </div>
  );
}

// Website alag app hai: us ka poora address (.env.local mein NEXT_PUBLIC_SITE_URL)
const siteUrl = appUrl("customer");

// Link is page ka hai? Dashboard ("/") sirf apne aap par; baaqi apne andar ke pages par bhi (jaise /orders/123)
const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

// Admin aur Rider panel ka dhancha: gehra sidebar, upar ki patti, mobile par ☰ drawer
export default function PanelShell({ nav, note, logoutTo, alerts, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const sidebar = (mobile: boolean) => (
    <aside
      aria-label="Sidebar"
      className={`flex w-60 shrink-0 flex-col bg-forest-950 text-white ${
        mobile ? "fixed inset-y-0 left-0 z-50 max-w-[85vw] shadow-lift" : "sticky top-0 h-screen"
      }`}
    >
      {/* Logo wali patti upar ki header jaisi: dono mil kar ek patti lagti hain */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-cream-200 bg-white/95 px-4">
        <BrandLogo showWordmark={!mobile} />
        {mobile && (
          <button
            type="button"
            onClick={close}
            aria-label="Close sidebar"
            className="flex min-h-11 min-w-11 items-center justify-center text-charcoal"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Scroll sirf tab jab jagah kam ho (zoom ya chhoti screen), aur scrollbar sirf mouse upar hone par */}
      <nav className="sidebar-scrollbar flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-3 py-4">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              aria-current={active ? "page" : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              {/* Chuni hui jagah: baayein patli narangi patti */}
              {active && <span aria-hidden className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-accent-soft" />}
              <item.icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  active ? "text-accent-soft" : "text-white/50 group-hover:text-white/80"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <AccountCard note={note} logoutTo={logoutTo} />
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-cream-100">
      <div className="hidden shrink-0 lg:block">{sidebar(false)}</div>

      {/* Mobile drawer */}
      {open && (
        <>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-charcoal/40 lg:hidden"
          />
          {sidebar(true)}
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-cream-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-cream-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <NewOrderAlerts source={alerts} />
            <ThemeToggle />
            {siteUrl && (
              <a href={siteUrl} className="text-xs font-semibold text-forest-700 hover:underline">
                ← Back to site
              </a>
            )}
          </div>
        </header>

        {/* Page ka asal hissa (screen readers ke liye <main>) */}
        <main className="flex-1 overflow-x-clip p-4 sm:p-6 lg:p-8 lg:pt-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
