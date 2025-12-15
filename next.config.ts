/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
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
