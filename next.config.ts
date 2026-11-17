import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_MF_APP: "admin" },
  devIndicators: { position: "bottom-right" },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
    return backend ? [{ source: "/api/:path*", destination: `${backend}/api/:path*` }] : [];
  },
};

export default nextConfig;