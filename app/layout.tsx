import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarV2 from "@/components/NavbarV2";
import FooterV2 from "@/components/FooterV2";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wedit | 결혼업체 가격 비교",
  description: "결혼 업체(스튜디오/드레스/메이크업/웨딩홀) 가격을 비교하고 통계를 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative min-h-screen overflow-x-hidden">
          {/* v2 기본 배경 */}
          <div aria-hidden="true" className="fixed inset-0 z-0 bg-white" />
          <div
            aria-hidden="true"
            className="fixed inset-x-0 top-0 z-0 h-56 bg-gradient-to-b from-emerald-50/70 to-transparent"
          />
          <div className="relative z-10">
            <NavbarV2 />
        {children}
            <FooterV2 />
          </div>
        </div>
      </body>
    </html>
  );
}
