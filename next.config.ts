import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: "https://ai-doc-generator-chi.vercel.app/api/:path*",
    },
  ],
};

export default nextConfig;
