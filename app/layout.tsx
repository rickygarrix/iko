import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";

// 既存フォント
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ 追加フォント：Zen Kaku Gothic New
const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "700"], // 必要に応じて
  variable: "--font-zen-kaku",
  display: "swap",
});

export const metadata: Metadata = {
  title: "オトナビ - 夜の音楽ガイド",
  description: "音楽スポットを見つけよう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${zenKaku.variable} antialiased flex flex-col min-h-screen bg-[#FAFAF5]`}
      >
        <GoogleMapsProvider>
          <Header />

          <main className="flex-grow w-full">
            {children}
          </main>

          <Footer />
        </GoogleMapsProvider>
      </body>
    </html>
  );
}