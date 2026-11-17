import path from "node:path";
import type { NextConfig } from "next";
// Relative raasta: next.config khud shared package ko transpile nahi karta
import { IMAGE_HOSTS } from "../shared/lib/imageHosts";

// MureeFoods folder (npm workspaces ki jarh): shared/ isi ke andar hai
const workspaceRoot = path.join(__dirname, "..");

// Admin panel (port 3001). Website aur Rider app alag apps hain, backend teeno ka ek hi
const nextConfig: NextConfig = {
  // Ye app kaun si hai: shared api har request ke saath "X-App: admin" bhejta hai (backend isi se admin ki cookie parhta hai)
  env: { NEXT_PUBLIC_MF_APP: "admin" },
  transpilePackages: ["@murree/shared"],
  outputFileTracingRoot: workspaceRoot,
  experimental: {
    agentFeedback: false, // next dev AGENTS.md mein feedback wala hissa na likhe
  },
  // next dev ka "N" button sidebar ke Logout par na aaye (sirf development mein dikhta hai)
  devIndicators: { position: "bottom-right" },
  // Dish ki photo in websites ke link se ho sakti hai (https hi)
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: "https", hostname, pathname: "/**" })),
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: workspaceRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Vercel par browser sirf apne domain se baat kare (/api/*), aur Next aage backend ko bheje (cookie first-party)
  async rewrites() {
    const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
    return backend ? [{ source: "/api/:path*", destination: `${backend}/api/:path*` }] : [];
  },
};

export default nextConfig;
