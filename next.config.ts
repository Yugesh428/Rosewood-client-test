import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pg", "pg-hstore", "pg-native", "bcryptjs", "sequelize", "xlsx"],
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
