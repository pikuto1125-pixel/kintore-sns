import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // webpack required: native SWC bindings blocked by Application Control policy
  },
  webpack: (config) => config,
};

export default nextConfig;
