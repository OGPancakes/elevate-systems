import type { NextConfig } from "next";

const elevateOrdersUrl =
  process.env.ELEVATE_ORDERS_URL ?? "http://localhost:3010/elevateorders";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/elevateorders",
        destination: elevateOrdersUrl,
        permanent: false
      }
    ];
  }
};

export default nextConfig;
