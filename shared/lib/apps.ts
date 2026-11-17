import type { AppName } from "./api";

// Teeno apps ke naam aur address (har app ki .env.local mein). Address na ho to link nahi dikhta
export const APP_LINKS: Record<AppName, { label: string; url: string | undefined }> = {
  customer: { label: "MurreeFoods website", url: process.env.NEXT_PUBLIC_SITE_URL },
  admin: { label: "Admin panel", url: process.env.NEXT_PUBLIC_ADMIN_URL },
  rider: { label: "Rider app", url: process.env.NEXT_PUBLIC_RIDER_URL },
};

// Doosri app ka poora link: appUrl("rider", "/login") -> http://localhost:3002/login
export const appUrl = (app: AppName, path = "/") => {
  const base = APP_LINKS[app].url?.replace(/\/$/, "");
  return base ? `${base}${path}` : undefined;
};
