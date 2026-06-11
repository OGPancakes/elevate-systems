import type { NextConfig } from "next";

const elevateOrdersUrl =
  process.env.ELEVATE_ORDERS_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3010/elevateorders"
    : "/demos?preview=elevate-orders");

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
