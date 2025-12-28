import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16
  // Prisma Client TypeScript files will be handled automatically
  turbopack: {},
  // Vercel Serverless에서 sqlite 파일을 읽기 위해(그리고 /tmp로 복사하기 위해) DB 파일이 빌드 산출물에 포함되도록 한다.
  outputFileTracingIncludes: {
    "/api/vendors": ["./prisma/dev.db", "./dev.db"],
    "/api/vendors/[id]": ["./prisma/dev.db", "./dev.db"],
  },
};

export default nextConfig;
