/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Strip console.* from production builds (keep warn/error)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

module.exports = nextConfig;

// next.config.ts;
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   output: "export",
//   basePath: "/hrm",
//   assetPrefix: "/hrm",
//   images: { unoptimized: true },
//   // trailingSlash: true, // optional on some hosts
// };

// export default nextConfig;
