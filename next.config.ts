/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ✅ enables static HTML export (replaces next export)
  images: {
    unoptimized: true, // ✅ required for static hosting like cPanel
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
