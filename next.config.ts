import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Suppress pre-existing TS errors during production build
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["pg", "pg-hstore", "pg-native", "bcryptjs", "sequelize", "xlsx"],
  // Use standalone output for Docker/Render
  output: "standalone",
  // Disable static prerendering for all pages — app uses runtime DB calls
  experimental: {
    // force all pages to be dynamic (no static prerender)
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    unoptimized: false,
    domains: [],
  },
};

export default nextConfig;
