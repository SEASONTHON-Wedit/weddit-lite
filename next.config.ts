import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16
  // Prisma Client TypeScript files will be handled automatically
  turbopack: {},
};

export default nextConfig;
