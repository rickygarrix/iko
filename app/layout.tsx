import type { Metadata } from "next";
import { Geist, Geist_Mono, Zen_Kaku_Gothic_New } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import ScrollRestoration from "@/components/ScrollRestoration"; // ✅ スクロール復元コンポーネント
import "./globals.css";

// フォント設定
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-zen-kaku",
  display: "swap",
});

export const metadata: Metadata = {
  title: "オトナビ - 夜の音楽ガイド",
  description: "音楽スポットを見つけよう",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${zenKaku.variable} antialiased flex flex-col min-h-screen bg-[#FAFAF5]`}
      >

      </body>
    </html>
  );
}