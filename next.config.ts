import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["leathergoodstexas.com", "www.leathergoodstexas.com"],
    },
  },
};

export default nextConfig;
